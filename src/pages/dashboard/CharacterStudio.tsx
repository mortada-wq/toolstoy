import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DigitalAlchemy } from '../../components/DigitalAlchemy'
import { CharacterTypeSelector } from '../../components/CharacterTypeSelector'
import { AvatarCustomizer } from '../../components/AvatarCustomizer'

// Type definitions
interface GenerationJob {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  currentStep?: string
  statesGenerated?: string[]
  totalStates?: number
  errorMessage?: string
}

interface CharacterVariation {
  variationNumber: number
  imageUrl: string
  seed: number
  timestamp: string
}

interface AvatarConfig {
  faceShape: 'round' | 'oval' | 'square' | 'heart'
  skinTone: string
  eyeType: 'round' | 'almond' | 'hooded' | 'upturned'
  eyeColor: string
  eyebrowType: 'straight' | 'arched' | 'thick' | 'thin'
  noseType: 'button' | 'straight' | 'hooked' | 'rounded'
  mouthType: 'smile' | 'neutral' | 'laugh' | 'serious'
  hairStyle: 'short' | 'medium' | 'long' | 'bald' | 'buzz'
  hairColor: string
  accessory: 'none' | 'glasses' | 'sunglasses' | 'earrings'
  backgroundColor: string
}

type CharacterStyleType = 'product-morphing' | 'head-only' | 'avatar'

interface ApiError {
  error: string
  message: string
  suggestedAction?: string
  retryAfter?: number
}

function ExpertIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}
function EntertainerIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}
function AdvisorIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 11v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-6" />
      <path d="M14 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
      <path d="M22 10v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4" />
    </svg>
  )
}
function EnthusiastIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

const STEPS = [
  { num: 0, label: 'Choose' },
  { num: 1, label: 'Product' },
  { num: 2, label: 'Personality' },
  { num: 3, label: 'Voice' },
  { num: 4, label: 'Knowledge' },
  { num: 5, label: 'Launch' },
]

const CATEGORY_OPTIONS: { id: CharacterStyleType; title: string; shortDesc: string }[] = [
  { id: 'product-morphing', title: 'Living Product', shortDesc: 'Transform your product or tool into an animated character' },
  { id: 'head-only', title: 'Head Only', shortDesc: 'Floating head character for chat widgets' },
  { id: 'avatar', title: 'Custom Avatar', shortDesc: 'Professional illustrated avatar for your brand' },
]

const CHARACTER_TYPES = [
  {
    icon: <ExpertIcon />,
    title: 'The Expert',
    description: 'Deep product knowledge. Confident. Answers every question with authority.',
  },
  {
    icon: <EntertainerIcon />,
    title: 'The Entertainer',
    description: 'Personality-first. Makes shopping fun. Customers remember the chat.',
  },
  {
    icon: <AdvisorIcon />,
    title: 'The Advisor',
    description: 'Consultative. Asks questions back. Helps customers find the right choice.',
  },
  {
    icon: <EnthusiastIcon />,
    title: 'The Enthusiast',
    description: 'Pure energy. Obsessed with the product. Celebrates every interaction.',
  },
]

const VIBES = ['Trustworthy', 'Playful', 'Premium', 'No-nonsense', 'Technical', 'Warm', 'Witty', 'Straight-talking']

const QA_ITEMS = [
  { q: 'Is this product waterproof?', a: 'Rated IPX7 — waterproof up to 1 meter for 30 minutes. Pool tested. No excuses.' },
  { q: "What's the warranty?", a: '2-year manufacturer warranty. 30-day no-questions return policy.' },
  { q: 'Does it work internationally?', a: '150+ countries. Universal 100-240V voltage. Bring it anywhere.' },
  { q: "What's in the box?", a: 'The product, quick-start guide, charging cable, and carrying case.' },
  { q: 'Is it suitable for beginners?', a: 'Three modes from beginner to pro. Most people are running in 10 minutes.' },
]

export function CharacterStudio() {
  const [step, setStep] = useState(0)
  const [characterStyleType, setCharacterStyleType] = useState<CharacterStyleType>('product-morphing')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [characterType, setCharacterType] = useState<string | null>('The Expert')
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Trustworthy'])
  const [charName, setCharName] = useState('Your Character Name')
  const [catchphrase, setCatchphrase] = useState('')
  const [greeting, setGreeting] = useState('')
  const [seriousness, setSeriousness] = useState(50)
  const [formality, setFormality] = useState(50)
  const [reservedness, setReservedness] = useState(50)
  const [generating, setGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  
  // New state for Task 5.7
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [objectType, setObjectType] = useState('')
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [variations, setVariations] = useState<CharacterVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number>(0)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [availableStates, setAvailableStates] = useState<string[]>([])

  const toggleVibe = (v: string) => {
    setSelectedVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setProductImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // API call helper
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

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await apiCall<GenerationJob>(`/job-status/${jobId}`)
        setCurrentJob(status)
        
        if (status.status === 'completed') {
          clearInterval(pollInterval)
          setGenerating(false)
          setGenerationComplete(true)
          setAvailableStates(status.statesGenerated || [])
        } else if (status.status === 'failed') {
          clearInterval(pollInterval)
          setGenerating(false)
          setError({
            error: 'GENERATION_FAILED',
            message: status.errorMessage || 'Character generation failed',
          })
        }
      } catch (err) {
        clearInterval(pollInterval)
        setGenerating(false)
        setError(err as ApiError)
      }
    }, 3000)
  }

  // Handle character generation
  const handleGenerate = async () => {
    const needsProduct = characterStyleType === 'product-morphing'
    if (needsProduct && (!productImage || !objectType.trim())) {
      setError({
        error: 'VALIDATION_ERROR',
        message: 'Please upload a product image and enter the object type (e.g. blender, chair, door)',
      })
      return
    }
    if ((needsProduct || characterStyleType === 'head-only') && !productImage) {
      setError({
        error: 'VALIDATION_ERROR',
        message: 'Please upload an image',
      })
      return
    }

    setGenerating(true)
    setError(null)
    setVariations([])
    setGenerationComplete(false)
    setProgressStep(1)

    try {
      const imageBase64 = productImage ? await convertImageToBase64(productImage) : ''
      const generationType = characterStyleType === 'product-morphing' ? 'tools' : characterStyleType === 'head-only' ? 'head-only' : 'genius-avatar'

      const characterTypeMap: Record<string, 'mascot' | 'spokesperson' | 'sidekick' | 'expert'> = {
        'The Expert': 'expert',
        'The Entertainer': 'mascot',
        'The Advisor': 'spokesperson',
        'The Enthusiast': 'sidekick',
      }

      const response = await apiCall<{
        jobId: string
        variations: CharacterVariation[]
        estimatedTime: number
      }>('/generate-character', {
        method: 'POST',
        body: JSON.stringify({
          productImage: imageBase64,
          productName: objectType.trim() || 'product',
          objectType: objectType.trim(),
          generationType,
          characterStyleType,
          characterType: characterStyleType === 'avatar' ? 'avatar' : characterTypeMap[characterType || 'The Expert'],
          avatarConfig: avatarConfig,
          vibeTags: selectedVibes,
        }),
      })

      setCurrentJob({ jobId: response.jobId, status: 'processing' })
      setVariations(response.variations)
      setEstimatedTime(response.estimatedTime || 120)
      
      // Start polling for job status
      pollJobStatus(response.jobId)
      
      // Simulate progress steps
      const interval = setInterval(() => {
        setProgressStep((p) => {
          if (p >= 3) {
            clearInterval(interval)
            return 4
          }
          return p + 1
        })
      }, estimatedTime / 4)
      
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      setGenerating(false)
    }
  }

  // Handle try again
  const handleTryAgain = () => {
    setError(null)
    setGenerationComplete(false)
    setVariations([])
    setCurrentJob(null)
    setProgressStep(0)
  }

  return (
    <>
      <div className="bg-[#F5F5F5] min-h-full">
        {/* Step indicator */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 md:px-8 py-5">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
          {STEPS.filter((s) => s.num > 0).map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] transition-all ${
                    step > s.num
                      ? 'bg-[#1A1A1A] text-white'
                      : step === s.num
                      ? 'bg-white border-2 border-[#1A1A1A] text-[#1A1A1A]'
                      : 'bg-[#F5F5F5] border border-[#6B7280] text-[#6B7280]'
                  }`}
                >
                  {s.num}
                </div>
                <span
                  className={`mt-1 text-[11px] uppercase tracking-wider font-normal ${
                    step >= s.num ? 'text-[#1A1A1A]' : 'text-[#6B7280]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.filter((s) => s.num > 0).length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    step > s.num ? 'bg-[#1A1A1A]' : 'bg-[#E5E7EB]'
                  }`}
                />
              )}
            </div>
          ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 md:p-12">
        {/* Step 0 — Super Question: Choose category first */}
        {step === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-bold text-3xl md:text-4xl text-[#1A1A1A] leading-tight">
                What kind of character do you want to create?
              </h2>
              <p className="mt-3 text-[18px] text-[#6B7280]">
                Choose one — this determines how we generate your character.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setCharacterStyleType(opt.id)
                    setStep(1)
                  }}
                  className={`p-8 md:p-10 rounded-2xl border-2 transition-all text-left ${
                    characterStyleType === opt.id
                      ? 'border-[#1A1A1A] bg-[#FAFAFA] shadow-lg'
                      : 'border-[#E5E7EB] bg-white hover:border-[#6B7280] hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-4">
                    {opt.id === 'product-morphing' && '🛠️'}
                    {opt.id === 'head-only' && '👤'}
                    {opt.id === 'avatar' && '✨'}
                  </div>
                  <h3 className="font-bold text-xl text-[#1A1A1A]">{opt.title}</h3>
                  <p className="mt-2 text-[15px] text-[#6B7280]">{opt.shortDesc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Product (Living Product) or Avatar/Head setup */}
        {step === 1 && characterStyleType === 'product-morphing' && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A] leading-tight">
                Your product or tool
              </h2>
              <p className="mt-2 text-[15px] text-[#6B7280] font-normal">
                Upload an image and tell us what type of object it is. The AI will create an animated version — no human faces.
              </p>

              {/* Product Image Upload */}
              <div className="mt-8">
                <label className="block font-medium text-[13px] text-[#1A1A1A] mb-2">
                  Product Image *
                </label>
                {!productImagePreview ? (
                  <label htmlFor="product-image-upload" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 bg-[#FAFAFA] text-center hover:border-[#5B7C99] transition-all">
                      <svg className="w-10 h-10 mx-auto text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="mt-3 font-medium text-[16px] text-[#1A1A1A]">Drop your product image here</p>
                      <p className="text-[14px] text-[#6B7280] font-normal mt-1">or click to browse — JPG, PNG up to 10MB</p>
                    </div>
                    <input 
                      id="product-image-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="relative border-2 border-[#5B7C99] rounded-lg p-4 bg-white">
                    <img src={productImagePreview} alt="Product" className="w-full h-64 object-contain rounded-lg" />
                    <button
                      onClick={() => {
                        setProductImage(null)
                        setProductImagePreview(null)
                      }}
                      className="absolute top-6 right-6 bg-white border border-[#E5E7EB] rounded-full p-2 hover:bg-[#F5F5F5] transition-all"
                    >
                      <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Object Type *</label>
                <input
                  type="text"
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  placeholder="e.g. blender, chair, door, pillar, vacuum cleaner"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal focus:border-[#5B7C99] focus:outline-none"
                />
                <p className="mt-1 text-[12px] text-[#6B7280]">What is this object? The AI uses this to generate an animated version of your product.</p>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(0)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!productImage || !objectType.trim()}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Personality
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (characterStyleType === 'head-only' || characterStyleType === 'avatar') && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">
                {characterStyleType === 'avatar' ? 'Design your avatar' : 'Head-only character'}
              </h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                {characterStyleType === 'avatar'
                  ? 'Customize your professional illustrated avatar.'
                  : 'Upload a reference image for your head-only character.'}
              </p>
              {characterStyleType === 'avatar' && (
                <div className="mt-8">
                  <AvatarCustomizer
                    onAvatarChange={(config) => {
                      setAvatarConfig(config)
                    }}
                  />
                </div>
              )}
              {characterStyleType === 'head-only' && (
                <div className="mt-8">
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-2">Reference Image</label>
                  {!productImagePreview ? (
                    <label htmlFor="head-image-upload" className="block cursor-pointer">
                      <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 bg-[#FAFAFA] text-center hover:border-[#5B7C99] transition-all">
                        <svg className="w-10 h-10 mx-auto text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="mt-3 font-medium text-[16px] text-[#1A1A1A]">Drop image here</p>
                        <input id="head-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </div>
                    </label>
                  ) : (
                    <div className="relative border-2 border-[#5B7C99] rounded-lg p-4">
                      <img src={productImagePreview} alt="Reference" className="w-full h-48 object-contain rounded-lg" />
                      <button onClick={() => { setProductImage(null); setProductImagePreview(null) }} className="absolute top-4 right-4 bg-white border rounded-full p-2">✕</button>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(0)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={characterStyleType === 'head-only' && !productImage}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg disabled:opacity-50"
                >
                  Next: Personality
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Personality */}
        {step === 2 && (
          <div className="max-w-[800px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">Character Personality</h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                Select how your character should sound and behave.
              </p>

              {characterStyleType !== 'avatar' && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg text-[#1A1A1A] mb-4">Personality Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {CHARACTER_TYPES.map((t) => (
                      <button
                        key={t.title}
                        onClick={() => setCharacterType(t.title)}
                        className={`text-left p-5 rounded-lg border transition-all ${
                          characterType === t.title
                            ? 'border-[1.5px] border-[#1A1A1A] bg-[#FAFAFA]'
                            : 'border border-[#E5E7EB] bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
                        }`}
                      >
                        <span className="text-[#1A1A1A]">{t.icon}</span>
                        <h3 className="mt-2.5 font-semibold text-[15px] text-[#1A1A1A]">{t.title}</h3>
                        <p className="mt-1.5 text-[13px] text-[#6B7280]">{t.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block font-semibold text-[13px] text-[#1A1A1A] mb-2">Adjust vibe</label>
                    <div className="flex flex-wrap gap-2">
                      {VIBES.map((v) => (
                        <button
                          key={v}
                          onClick={() => toggleVibe(v)}
                          className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
                            selectedVibes.includes(v)
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {characterStyleType === 'avatar' && (
                <div className="mt-8 p-6 bg-[#F5F5F5] rounded-lg">
                  <p className="text-[15px] text-[#6B7280]">Your avatar is configured. Continue to add name and voice.</p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">Back</button>
                <button onClick={() => setStep(3)} className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg">
                  Next: Voice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Voice (was Personality name/voice) */}
        {step === 3 && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">Name and voice your character.</h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                Soul Engine handles the deep personality. You give them a name and a first impression.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Character name</label>
                  <input
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder="What should we call them?"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Signature Phrase</label>
                  <input
                    value={catchphrase}
                    onChange={(e) => setCatchphrase(e.target.value)}
                    placeholder="One thing only this character would say..."
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px]"
                  />
                  <p className="mt-1 text-[12px] text-[#6B7280]">&quot;Not &apos;I&apos;m here to help!&apos; — something real.&quot;</p>
                </div>
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Opening Line</label>
                  <textarea
                    rows={3}
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    placeholder="How does your character greet someone landing on the product page?"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px]"
                  />
                </div>
              </div>

              <div className="mt-7">
                <label className="block font-semibold text-[13px] text-[#1A1A1A] mb-3">Personality Dials</label>
                <div className="space-y-4">
                  {[
                    { l: 'Serious', r: 'Playful', v: seriousness, set: setSeriousness },
                    { l: 'Formal', r: 'Casual', v: formality, set: setFormality },
                    { l: 'Reserved', r: 'Enthusiastic', v: reservedness, set: setReservedness },
                  ].map(({ l, r, v, set }) => (
                    <div key={l} className="flex items-center gap-4">
                      <span className="w-20 text-[13px] text-[#6B7280]">{l}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={v}
                        onChange={(e) => set(Number(e.target.value))}
                        className="flex-1 h-2 bg-[#E5E7EB] rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A1A1A]"
                      />
                      <span className="w-24 text-[13px] text-[#6B7280]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">Back</button>
                <button onClick={() => setStep(4)} className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg">
                  Next: Knowledge Base
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Knowledge */}
        {step === 4 && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">Build your character&apos;s knowledge base.</h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                AI generates 30 Q&A pairs from your URL. You review and approve. Zero manual typing.
              </p>

              <div className="mt-8">
                <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Product URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    defaultValue="https://yourstore.com/products/your-product"
                    className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px]"
                  />
                  <button className="border border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[14px] px-[18px] py-3 rounded-lg">
                    Generate Q&A
                  </button>
                </div>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  AI will generate 30 questions your customers actually ask.
                </p>
              </div>

              <div className="mt-7">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-[15px] text-[#1A1A1A]">Review Generated Q&A</h3>
                  <span className="text-[13px] text-[#6B7280]">30 pairs generated. Edit any answer.</span>
                </div>
                <div className="space-y-2">
                  {QA_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-white border border-[#E5E7EB] rounded-lg"
                    >
                      <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-[14px] text-[#1A1A1A]">{item.q}</p>
                        <p className="text-[14px] text-[#6B7280] mt-1">{item.a}</p>
                      </div>
                      <button className="text-[#6B7280] hover:text-[#1A1A1A]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-[14px] text-[#6B7280] underline hover:text-[#1A1A1A]">
                  Load all 30
                </button>
                <div className="mt-4 border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center cursor-pointer hover:border-[#6B7280]">
                  <span className="text-[14px] text-[#6B7280]">+ Add custom Q&A pair</span>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(3)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">Back</button>
                <button onClick={() => setStep(5)} className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg">
                  Next: Launch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Launch */}
        {step === 5 && (
          <div className="max-w-[560px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
              {/* Error Display */}
              {error && (
                <div className="mb-6 bg-[#F5F1ED] border border-[#8B7355] rounded-lg p-4">
                  <p className="text-[14px] text-[#5C4A3A] font-medium">{error.error}</p>
                  <p className="text-[13px] text-[#5C4A3A] mt-1">{error.message}</p>
                  {error.suggestedAction && (
                    <p className="text-[12px] text-[#6B7280] mt-2">→ {error.suggestedAction}</p>
                  )}
                  {error.retryAfter && (
                    <p className="text-[12px] text-[#6B7280] mt-2">Retry after: {error.retryAfter}s</p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleTryAgain}
                      className="flex-1 bg-[#8B7355] text-white py-2 rounded-lg font-medium text-[13px] hover:bg-[#5C4A3A] transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-[#8B7355] text-[#5C4A3A] py-2 rounded-lg font-medium text-[13px] hover:bg-[#F5F1ED] transition-all"
                    >
                      Upload Custom Image
                    </button>
                  </div>
                </div>
              )}

              {!generating && !generationComplete && !error && (
                <>
                  <h2 className="font-bold text-2xl text-[#1A1A1A]">Your character is ready to generate.</h2>
                  <p className="mt-2 text-[15px] text-[#6B7280]">
                    Toolstizer will create your character with Amazon Bedrock.
                  </p>

                  <div className="mt-8 space-y-0">
                    {[
                      ['Object Type', objectType || '—'],
                      ['Category', characterStyleType === 'avatar' ? 'Custom Avatar' : characterStyleType === 'head-only' ? 'Head Only' : 'Living Product'],
                      ['Character Type', characterStyleType === 'avatar' ? 'Avatar' : characterType || 'The Expert'],
                      ['Character Name', charName],
                      ['Vibe Tags', selectedVibes.join(', ')],
                    ].map(([label, value], i) => (
                      <div
                        key={label}
                        className={`flex justify-between py-3 ${i < 4 ? 'border-b border-[#F5F5F5]' : ''}`}
                      >
                        <span className="font-medium text-[13px] text-[#6B7280]">{label}</span>
                        <span className="font-semibold text-[14px] text-[#1A1A1A]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-5 bg-[#F5F5F5] rounded-lg border-l-[3px] border-l-[#5B7C99]">
                    <p className="font-semibold text-[14px] text-[#1A1A1A]">Amazon Bedrock will generate:</p>
                    <ul className="mt-2.5 text-[14px] text-[#6B7280] leading-relaxed space-y-1">
                      <li>· 3 character variations to choose from</li>
                      <li>· Full character personality and voice</li>
                      <li>· Animation states for your subscription tier</li>
                      <li>· Widget ready to embed</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="mt-6 w-full bg-[#1A1A1A] text-white font-bold text-base py-4 rounded-lg hover:opacity-90"
                  >
                    Generate My Character
                  </button>
                </>
              )}

              {generating && (
                <>
                  <h2 className="font-bold text-2xl text-[#1A1A1A] mb-4">
                    Toolstizer is cooking your character...
                  </h2>
                  
                  <DigitalAlchemy
                    progressStep={progressStep}
                    steps={[
                      { label: 'Analyzing product image' },
                      { label: 'Building character soul' },
                      { label: 'Generating variations' },
                      { label: 'Creating animations' },
                    ]}
                  />

                  {estimatedTime > 0 && (
                    <div className="mt-6 p-4 bg-[#F5F5F5] rounded-lg">
                      <p className="text-[13px] text-[#6B7280] text-center">
                        Estimated completion time: <span className="font-semibold text-[#1A1A1A]">{Math.ceil(estimatedTime / 60)} minutes</span>
                      </p>
                      {currentJob?.currentStep && (
                        <p className="text-[12px] text-[#6B7280] text-center mt-2">
                          {currentJob.currentStep}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-6 text-center text-[13px] text-[#6B7280]">
                    Usually ready in a few minutes. You can leave this page — we'll notify you when it's done.
                  </p>

                  <div className="mt-6 flex justify-start">
                    <Link
                      to="/dashboard"
                      className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </>
              )}

              {generationComplete && !error && (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5B7C99] rounded-full mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="font-bold text-2xl text-[#1A1A1A]">Your character is ready!</h2>
                    <p className="mt-2 text-[15px] text-[#6B7280]">
                      {variations.length} variations generated with {availableStates.length} animation states
                    </p>
                  </div>

                  {/* Character Preview */}
                  {variations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-[14px] text-[#1A1A1A] mb-3">Character Variations</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {variations.map((v) => (
                          <div
                            key={v.variationNumber}
                            onClick={() => setSelectedVariation(v.variationNumber)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden ${
                              selectedVariation === v.variationNumber
                                ? 'border-[#5B7C99] ring-2 ring-[#5B7C99]/30'
                                : 'border-[#E5E7EB]'
                            }`}
                          >
                            <img src={v.imageUrl} alt={`Variation ${v.variationNumber}`} className="w-full aspect-square object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available States */}
                  {availableStates.length > 0 && (
                    <div className="mb-6 p-4 bg-[#F5F5F5] rounded-lg">
                      <p className="text-[13px] font-medium text-[#1A1A1A] mb-2">Available Animation States:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableStates.map((state) => (
                          <span
                            key={state}
                            className="px-3 py-1 bg-[#5B7C99] text-white text-[12px] rounded-full"
                          >
                            {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        // Navigate to widget demo with this character
                        window.location.href = '/dashboard/widget/demo';
                      }}
                      className="w-full bg-[#5B7C99] text-white font-bold text-base py-4 rounded-lg hover:bg-[#4A6B85] transition-all"
                    >
                      View Widget Demo
                    </button>
                    
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Show embed code
                          const embedCode = `<script src="https://cdn.toolstoy.app/widget.js" data-character-id="demo" async></script>`;
                          navigator.clipboard.writeText(embedCode);
                          alert('Embed code copied to clipboard!');
                        }}
                        className="text-[14px] text-[#5B7C99] hover:text-[#4A6B85] underline"
                      >
                        Copy Embed Code
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Link
                      to="/dashboard"
                      className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
