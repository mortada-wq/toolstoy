import { useState } from 'react'
import { EnvironmentToggle } from '../../components/admin/EnvironmentToggle'
import { AdminMediaSidebar } from '../../components/admin/AdminMediaSidebar'
import { AssetUploadPanel } from '../../components/admin/AssetUploadPanel'
import { AssetPreviewPanel } from '../../components/admin/AssetPreviewPanel'
import { GenerationHistoryPanel } from '../../components/admin/GenerationHistoryPanel'

type GenerationType = 'image' | 'video'
type VideoModel = 'nova-canvas' | 'nova-reel' | 'stable-diffusion'
type Environment = 'test' | 'production'

interface ImageVariation {
  id: string
  url: string
  seed: number
  approved: boolean
  generatedAt: string
  variationNumber: number
}

interface GenerationJob {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  currentStep?: string
  statesGenerated?: string[]
  totalStates?: number
  errorMessage?: string
  estimatedTime?: number
}

interface ApiError {
  error: string
  message: string
  suggestedAction?: string
  retryAfter?: number
  cooldownRemaining?: number
}

const IMAGE_MODELS = [
  { id: 'titan', name: 'Amazon Titan Image Generator', cost: '$0.008' },
]

const VIDEO_MODELS = [
  { id: 'nova-canvas', name: 'Amazon Nova Canvas', cost: '$0.05', duration: '6 sec' },
]

const ANIMATION_STATES = [
  { id: 'idle', name: 'Idle' },
  { id: 'talking', name: 'Talking' },
  { id: 'thinking', name: 'Thinking' },
  { id: 'greeting', name: 'Greeting' },
]

export function BedrockPlayground() {
  const [environment, setEnvironment] = useState<Environment>('test')
  const [generationType, setGenerationType] = useState<GenerationType>('image')
  const [imageModel, setImageModel] = useState('titan')
  const [videoModel, setVideoModel] = useState<VideoModel>('nova-canvas')
  const [selectedStates, setSelectedStates] = useState<string[]>(['idle'])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageVariations, setImageVariations] = useState<ImageVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<Record<string, string>>({})
  const [error, setError] = useState<ApiError | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [characterType, setCharacterType] = useState<'mascot' | 'spokesperson' | 'sidekick' | 'expert'>('mascot')
  const [vibeTags, setVibeTags] = useState<string[]>(['friendly', 'professional'])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/bedrock${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json() as ApiError
      throw errorData
    }
    
    return response.json() as Promise<T>
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setProductImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      addLog(`✓ Product image uploaded: ${file.name}`)
    }
  }

  const handleGenerateImage = async () => {
    if (!productImage || !productName) {
      setError({ error: 'VALIDATION_ERROR', message: 'Please upload product image and enter product name' })
      return
    }

    setIsGenerating(true)
    setError(null)
    setImageVariations([])
    setSelectedVariation(null)
    addLog(`Starting character generation...`)

    try {
      const imageBase64 = await convertImageToBase64(productImage)
      
      const response = await apiCall<{ jobId: string; variations: Array<{ variationNumber: number; imageUrl: string; seed: number; timestamp: string }> }>('/generate-character', {
        method: 'POST',
        body: JSON.stringify({
          productImage: imageBase64,
          productName,
          characterType,
          vibeTags,
        }),
      })

      addLog(`✓ Job created: ${response.jobId}`)
      
      const variations: ImageVariation[] = response.variations.map(v => ({
        id: `${response.jobId}-${v.variationNumber}`,
        url: v.imageUrl,
        seed: v.seed,
        approved: false,
        generatedAt: v.timestamp,
        variationNumber: v.variationNumber,
      }))
      
      setImageVariations(variations)
      addLog(`✓ Generated ${variations.length} variations`)
      addLog(`👉 Select one to continue`)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      addLog(`✗ Error: ${apiError.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApproveVariation = async (variationId: string) => {
    setImageVariations(prev => prev.map(v => ({ ...v, approved: v.id === variationId })))
    setSelectedVariation(variationId)
    addLog(`✓ Variation approved`)
  }

  const handleMakeLive = async () => {
    const approved = imageVariations.find(v => v.approved)
    if (!approved) return

    try {
      await apiCall('/approve-variation', {
        method: 'POST',
        body: JSON.stringify({
          personaId: 'temp-persona-id',
          variationId: approved.id,
        }),
      })
      addLog(`✓ Character is now live`)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiCall<GenerationJob>(`/job-status/${jobId}`)
        setCurrentJob(status)
        
        if (status.currentStep) {
          addLog(`Progress: ${status.currentStep}`)
        }
        
        if (status.status === 'completed') {
          clearInterval(interval)
          addLog(`✓ Generation complete!`)
          setIsGenerating(false)
        } else if (status.status === 'failed') {
          clearInterval(interval)
          setError({ error: 'GENERATION_FAILED', message: status.errorMessage || 'Generation failed' })
          setIsGenerating(false)
        }
      } catch (err) {
        clearInterval(interval)
        setError(err as ApiError)
        setIsGenerating(false)
      }
    }, 3000)
  }

  const handleGenerateVideos = async () => {
    const approved = imageVariations.find(v => v.approved)
    if (!approved) return

    setIsGenerating(true)
    setError(null)
    setGeneratedVideos({})
    addLog(`Starting state video generation...`)

    try {
      const response = await apiCall<{ jobId: string; states: Array<{ id: string; name: string; videoUrl: string }>; totalCost: number; estimatedTime: number }>('/generate-states', {
        method: 'POST',
        body: JSON.stringify({
          personaId: 'temp-persona-id',
          approvedImageUrl: approved.url,
          subscriptionTier: 'free',
        }),
      })

      addLog(`✓ Job created: ${response.jobId}`)
      addLog(`Estimated time: ${response.estimatedTime}s`)
      
      setCurrentJob({
        jobId: response.jobId,
        status: 'processing',
        totalStates: selectedStates.length,
        statesGenerated: [],
      })
      
      pollJobStatus(response.jobId)
      
      const videos: Record<string, string> = {}
      response.states.forEach(state => {
        videos[state.id] = state.videoUrl
      })
      setGeneratedVideos(videos)
      
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Admin Media Sidebar */}
      <AdminMediaSidebar 
        onFolderSelect={setSelectedFolderId}
        selectedFolderId={selectedFolderId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Environment Toggle */}
        <EnvironmentToggle onEnvironmentChange={setEnvironment} />

        {/* Main Playground */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8">
            <div className="mb-6">
              <h1 className="font-semibold text-[24px] text-[#1A1A1A]">Bedrock Playground</h1>
              <p className="text-[14px] text-[#6B7280] mt-1">
                {environment === 'test' ? 'Test mode - Results not saved to production' : 'Production mode - All results saved'}
              </p>
            </div>

            {/* Product Upload Section */}
            <div className="bg-gradient-to-br from-[#5B7C99] to-[#4A6B85] rounded-lg p-8 mb-6">
              <h2 className="font-semibold text-[20px] text-white mb-4">Upload Product Image</h2>
              {!productImagePreview ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/40 rounded-lg p-12 text-center hover:border-white/60 transition-all">
                    <p className="text-white font-semibold text-[18px] mb-2">Drop image or click to upload</p>
                    <p className="text-white/70 text-[14px]">PNG, JPG up to 10MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              ) : (
                <div className="bg-white/10 rounded-lg p-6">
                  <img src={productImagePreview} alt="Product" className="w-48 h-48 object-cover rounded-lg mb-4" />
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product Name"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 mb-3"
                  />
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-[#F5F1ED] border border-[#8B7355] rounded-lg p-4 mb-4">
                <p className="text-[14px] text-[#5C4A3A] font-medium">{error.error}</p>
                <p className="text-[13px] text-[#5C4A3A] mt-1">{error.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Controls */}
              <div className="lg:col-span-2 space-y-4">
                {/* Generate Button */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !productImage || !productName}
                    className="w-full bg-[#1A1A1A] text-white py-3 rounded-md font-medium text-[14px] hover:bg-[#000000] disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? 'Generating...' : 'Generate 3 Variations'}
                  </button>
                  
                  {selectedVariation && (
                    <>
                      <button
                        onClick={handleMakeLive}
                        className="w-full bg-[#5B7C99] text-white py-3 rounded-md font-medium text-[14px] hover:bg-[#4A6B85] transition-all mt-2"
                      >
                        Make Live
                      </button>
                      <button
                        onClick={handleGenerateVideos}
                        disabled={isGenerating}
                        className="w-full bg-[#1A1A1A] text-white py-3 rounded-md font-medium text-[14px] hover:bg-[#000000] disabled:opacity-50 transition-all mt-2"
                      >
                        Generate Animation States
                      </button>
                    </>
                  )}
                </div>

                {/* Variations Display */}
                {imageVariations.length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                    <h3 className="font-medium text-[13px] text-[#1A1A1A] mb-3">Select Variation</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {imageVariations.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleApproveVariation(v.id)}
                          className={`cursor-pointer rounded-lg border-2 overflow-hidden ${
                            v.approved ? 'border-[#5B7C99] ring-2 ring-[#5B7C99]/30' : 'border-[#E5E7EB]'
                          }`}
                        >
                          <img src={v.url} alt={`Variation ${v.variationNumber}`} className="w-full aspect-square" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Display */}
                {currentJob && currentJob.status === 'processing' && (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                    <h3 className="font-medium text-[13px] text-[#1A1A1A] mb-3">Generation Progress</h3>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-2 mb-2">
                      <div
                        className="bg-[#5B7C99] h-2 rounded-full transition-all"
                        style={{ width: `${((currentJob.statesGenerated?.length || 0) / (currentJob.totalStates || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - History & Logs */}
              <div className="space-y-4">
                {/* Toggle History */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full px-3 py-2 bg-[#5B7C99] text-white rounded-md text-[12px] font-medium hover:bg-[#4A6B85]"
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>

                {/* History or Logs */}
                {showHistory ? (
                  <GenerationHistoryPanel environment={environment} />
                ) : (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                    <h3 className="font-medium text-[13px] text-[#1A1A1A] mb-3">Logs</h3>
                    <div className="bg-[#1A1A1A] rounded-md p-4 h-[300px] overflow-y-auto font-mono text-[12px] text-[#A0AEC0]">
                      {logs.length === 0 ? (
                        <p className="text-[#6B7280]">No logs yet</p>
                      ) : (
                        logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)
                      )}
                    </div>
                  </div>
                )}

                {/* Videos Display */}
                {Object.keys(generatedVideos).length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                    <h3 className="font-medium text-[13px] text-[#1A1A1A] mb-3">Generated Videos</h3>
                    <div className="space-y-3">
                      {Object.entries(generatedVideos).map(([stateId, videoUrl]) => (
                        <div key={stateId} className="border border-[#E5E7EB] rounded-md p-3">
                          <p className="text-[13px] font-medium text-[#1A1A1A] mb-2">{stateId}</p>
                          <video src={videoUrl} controls loop className="w-full rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Media Assets */}
      <div className="w-80 bg-white border-l border-[#E5E7EB] flex flex-col">
        {selectedFolderId ? (
          <>
            <AssetUploadPanel folderId={selectedFolderId} onUploadComplete={() => {}} />
            <div className="flex-1 overflow-y-auto border-t border-[#E5E7EB]">
              <AssetPreviewPanel 
                asset={selectedAsset}
                onUseInGeneration={(url) => {
                  setProductImagePreview(url)
                  addLog(`✓ Asset loaded: ${url}`)
                }}
              />
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-[13px] text-[#6B7280]">
            Select a folder from the left sidebar to manage assets
          </div>
        )}
      </div>
    </div>
  )
}
