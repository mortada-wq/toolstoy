import { useState } from 'react'

type GenerationType = 'image' | 'video'
type VideoModel = 'nova-canvas' | 'nova-reel' | 'stable-diffusion'

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

const IMAGE_MODELS = [
  { id: 'titan', name: 'Amazon Titan Image Generator', cost: '$0.008' },
  { id: 'stable-diffusion', name: 'Stable Diffusion XL', cost: '$0.04' },
]

const VIDEO_MODELS = [
  { id: 'nova-canvas', name: 'Amazon Nova Canvas', cost: '$0.05', duration: '4-6 sec' },
  { id: 'nova-reel', name: 'Amazon Nova Reel', cost: '$0.08', duration: '6 sec' },
  { id: 'stable-diffusion', name: 'Stable Video Diffusion', cost: '$0.10', duration: '4 sec' },
]

const ANIMATION_STATES = [
  { id: 'idle', name: 'Idle', prompt: 'Gentle breathing, minimal movement, calm and peaceful' },
  { id: 'talking', name: 'Talking', prompt: 'Animated speaking, mouth moving, expressive gestures' },
  { id: 'thinking', name: 'Thinking', prompt: 'Pondering, looking up thoughtfully, hand on chin' },
  { id: 'greeting', name: 'Greeting', prompt: 'Waving hand, friendly smile, welcoming gesture' },
  { id: 'happy', name: 'Happy', prompt: 'Jumping with joy, big smile, enthusiastic' },
  { id: 'confused', name: 'Confused', prompt: 'Head tilt, scratching head, puzzled expression' },
  { id: 'excited', name: 'Excited', prompt: 'Energetic movement, arms raised, celebration' },
  { id: 'listening', name: 'Listening', prompt: 'Nodding, attentive, focused gaze' },
]

export function BedrockPlayground() {
  // State management
  const [generationType, setGenerationType] = useState<GenerationType>('image')
  const [imageModel, setImageModel] = useState('titan')
  const [videoModel, setVideoModel] = useState<VideoModel>('nova-canvas')
  const [selectedStates, setSelectedStates] = useState<string[]>(['idle'])
  const [prompt, setPrompt] = useState('Friendly robot mascot character with blue metallic body, standing on white background, professional 3D illustration style')
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageVariations, setImageVariations] = useState<ImageVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isGeneratingStates, setIsGeneratingStates] = useState(false)
  
  // Product Image Upload
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [brandName, setBrandName] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      addLog(`✓ Product image uploaded: ${file.name}`)
    }
  }

  const handleRemoveImage = () => {
    setProductImagePreview(null)
    addLog(`Product image removed`)
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const toggleState = (stateId: string) => {
    setSelectedStates((prev) =>
      prev.includes(stateId) ? prev.filter((s) => s !== stateId) : [...prev, stateId]
    )
  }

  // Task 5.1: Generate character variations with real API
  const handleGenerateImage = async () => {
    setIsGenerating(true)
    setError(null)
    setImageVariations([])
    setSelectedVariation(null)
    addLog(`Starting image generation with ${imageModel}...`)
    addLog(`Generating 3 variations for approval...`)

    try {
      const response = await fetch('/api/bedrock/generate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          productImage: productImagePreview || '',
          productName: productName || 'Product',
          characterType: 'mascot',
          vibeTags: ['friendly', 'professional'],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generation failed')
      }

      const data = await response.json()
      
      const variations: ImageVariation[] = data.variations?.map((v: any, i: number) => ({
        id: v.id || `var-${Date.now()}-${i}`,
        url: v.url || v.imageUrl,
        seed: v.seed || Math.floor(Math.random() * 1000000),
        approved: false,
        generatedAt: new Date().toISOString(),
        variationNumber: i + 1,
      })) || []
      
      setImageVariations(variations)
      addLog(`✓ All 3 variations generated successfully`)
      addLog(`👉 Review and approve one to continue`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      addLog(`✗ Error: ${message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApproveVariation = (variationId: string) => {
    setImageVariations(prev => 
      prev.map(v => ({ ...v, approved: v.id === variationId }))
    )
    setSelectedVariation(variationId)
    addLog(`✓ Variation approved and set as primary`)
  }

  const handleRegenerateWithEdits = () => {
    addLog(`Regenerating with prompt edits...`)
    setImageVariations([])
    setSelectedVariation(null)
    handleGenerateImage()
  }

  const handleMakeLive = async () => {
    const approved = imageVariations.find(v => v.approved)
    if (!approved) {
      setError('Please approve a variation first')
      return
    }
    
    addLog(`✓ Making variation live...`)
    
    try {
      const response = await fetch('/api/bedrock/approve-variation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          personaId: 'temp-persona-id',
          variationId: approved.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Approval failed')
      }

      const data = await response.json()
      addLog(`✓ Image uploaded to S3: ${data.imageUrl}`)
      addLog(`✓ Character updated in database`)
      alert('Character image is now live!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      addLog(`✗ Error: ${message}`)
    }
  }
