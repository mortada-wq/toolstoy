import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, X, Check, Pencil } from 'lucide-react'
import { DigitalAlchemy } from '../../components/DigitalAlchemy'
import { AvatarCustomizer } from '../../components/AvatarCustomizer'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Constants ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: 'Product' },
  { num: 2, label: 'Personality' },
  { num: 3, label: 'Voice' },
  { num: 4, label: 'Knowledge' },
  { num: 5, label: 'Launch' },
]

const CATEGORY_OPTIONS: { id: CharacterStyleType; title: string; shortDesc: string; videoSrc: string }[] = [
  { id: 'product-morphing', title: 'Living Product',  shortDesc: 'Transform your product or tool into an animated character', videoSrc: '/videos/living-product.webm' },
  { id: 'head-only',        title: 'Head Only',        shortDesc: 'Floating head character for chat widgets',                 videoSrc: '/videos/head-only.webm' },
  { id: 'avatar',           title: 'Custom Avatar',    shortDesc: 'Professional illustrated avatar for your brand',           videoSrc: '/videos/custom-avatar.webm' },
]

const CHARACTER_TYPES = [
  { title: 'The Expert',      description: 'Deep product knowledge. Confident. Answers every question with authority.' },
  { title: 'The Entertainer', description: 'Personality-first. Makes shopping fun. Customers remember the chat.' },
  { title: 'The Advisor',     description: 'Consultative. Asks questions back. Helps customers find the right choice.' },
  { title: 'The Enthusiast',  description: 'Pure energy. Obsessed with the product. Celebrates every interaction.' },
]

const VIBES = ['Trustworthy', 'Playful', 'Premium', 'No-nonsense', 'Technical', 'Warm', 'Witty', 'Straight-talking']

const QA_ITEMS = [
  { q: 'Is this product waterproof?',   a: 'Rated IPX7 — waterproof up to 1 meter for 30 minutes. Pool tested. No excuses.' },
  { q: "What's the warranty?",          a: '2-year manufacturer warranty. 30-day no-questions return policy.' },
  { q: 'Does it work internationally?', a: '150+ countries. Universal 100-240V voltage. Bring it anywhere.' },
  { q: "What's in the box?",            a: 'The product, quick-start guide, charging cable, and carrying case.' },
  { q: 'Is it suitable for beginners?', a: 'Three modes from beginner to pro. Most people are running in 10 minutes.' },
]

// ── Personality slider (reused from EditCharacterPage pattern) ─────────────
function PersonalitySlider({
  leftLabel, rightLabel, value, onChange,
}: { leftLabel: string; rightLabel: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-ds-sm text-steel-blue text-right">{leftLabel}</span>
      <div className="flex-1">
        <input
          type="range" min="0" max="100" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={[
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-secondary',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-orange',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-secondary',
          ].join(' ')}
          style={{ background: `linear-gradient(to right, #FF7A2F ${value}%, #1E2330 ${value}%)` }}
        />
      </div>
      <span className="w-24 text-ds-sm text-steel-blue">{rightLabel}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function CharacterStudio() {
  const [step, setStep] = useState(0)
  const [characterStyleType, setCharacterStyleType] = useState<CharacterStyleType>('product-morphing')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [characterType, setCharacterType] = useState<string | null>('The Expert')
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Trustworthy'])
  const [charName, setCharName] = useState('')
  const [catchphrase, setCatchphrase] = useState('')
  const [greeting, setGreeting] = useState('')
  const [seriousness, setSeriousness] = useState(50)
  const [formality, setFormality] = useState(50)
  const [reservedness, setReservedness] = useState(50)
  const [generating, setGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
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

  const toggleVibe = (v: string) =>
    setSelectedVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const convertImageToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProductImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setProductImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/bedrock${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
    })
    if (!response.ok) {
      const errorData = await response.json() as ApiError
      throw errorData
    }
    return response.json() as Promise<T>
  }

  const pollJobStatus = (jobId: string) => {
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
          setError({ error: 'GENERATION_FAILED', message: status.errorMessage || 'Character generation failed' })
        }
      } catch (err) {
        clearInterval(pollInterval)
        setGenerating(false)
        setError(err as ApiError)
      }
    }, 3000)
  }

  const handleGenerate = async () => {
    const needsProduct = characterStyleType === 'product-morphing'
    const needsProductImage = needsProduct || characterStyleType === 'head-only'
    if (needsProduct && !productImage) {
      setError({ error: 'VALIDATION_ERROR', message: 'Please upload a product image. AI will analyze it to create your Living Product character.' })
      return
    }
    if (needsProductImage && !productImage) {
      setError({ error: 'VALIDATION_ERROR', message: 'Please upload an image' })
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
        'The Expert': 'expert', 'The Entertainer': 'mascot', 'The Advisor': 'spokesperson', 'The Enthusiast': 'sidekick',
      }
      const response = await apiCall<{ jobId: string; variations: CharacterVariation[]; estimatedTime: number }>('/generate-character', {
        method: 'POST',
        body: JSON.stringify({
          productImage: imageBase64,
          productName: characterStyleType === 'product-morphing' ? 'product' : (objectType.trim() || 'product'),
          objectType: characterStyleType === 'product-morphing' ? undefined : objectType.trim(),
          generationType, characterStyleType,
          characterType: characterStyleType === 'avatar' ? 'avatar' : characterTypeMap[characterType || 'The Expert'],
          avatarConfig, vibeTags: selectedVibes,
        }),
      })
      setCurrentJob({ jobId: response.jobId, status: 'processing' })
      setVariations(response.variations)
      setEstimatedTime(response.estimatedTime || 120)
      pollJobStatus(response.jobId)
      const interval = setInterval(() => {
        setProgressStep((p) => { if (p >= 3) { clearInterval(interval); return 4 } return p + 1 })
      }, estimatedTime / 4)
    } catch (err) {
      setError(err as ApiError)
      setGenerating(false)
    }
  }

  const handleTryAgain = () => {
    setError(null)
    setGenerationComplete(false)
    setVariations([])
    setCurrentJob(null)
    setProgressStep(0)
  }

  // ── Step indicator ─────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="bg-bg-secondary border-b border-border/15 px-4 md:px-8 py-5">
      <div className="flex items-center max-w-3xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-ds-xs transition-all duration-normal',
                step > s.num  ? 'bg-teal text-bg-primary' :
                step === s.num ? 'bg-bg-overlay border-2 border-teal text-teal' :
                                 'bg-bg-overlay border border-border/25 text-steel-blue',
              ].join(' ')}>
                {step > s.num ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : s.num}
              </div>
              <span className={`mt-1 text-ds-xs uppercase tracking-wider font-medium ${step >= s.num ? 'text-cream' : 'text-steel-blue'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors duration-normal ${step > s.num ? 'bg-teal/60' : 'bg-border/15'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // ── Back button ────────────────────────────────────────────────────────
  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 text-ds-sm text-steel-blue font-medium hover:text-cream transition-colors duration-normal mb-6"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
      Back
    </button>
  )

  return (
    <div className="min-h-full">
      <StepBar />

      <div className="p-6 md:p-12">

        {/* ── Step 0: Choose category ── */}
        {step === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-bold text-ds-3xl text-cream leading-tight">
                What kind of character do you want to create?
              </h2>
              <p className="mt-3 text-ds-md text-slate-text">
                Choose one — this determines how we generate your character.
              </p>
            </div>
            <div className="flex flex-row flex-wrap justify-center gap-6">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setCharacterStyleType(opt.id); setStep(1) }}
                  className={[
                    'flex-1 min-w-[220px] max-w-[320px] p-6 md:p-8 rounded-lg border-2 transition-all duration-normal flex flex-col items-center text-left',
                    characterStyleType === opt.id
                      ? 'border-teal bg-bg-secondary shadow-teal-glow'
                      : 'border-border/15 bg-bg-secondary hover:border-teal/40 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="w-full aspect-video rounded-md overflow-hidden mb-4 bg-bg-overlay relative">
                    <video
                      src={opt.videoSrc} autoPlay loop muted playsInline
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLVideoElement).style.display = 'none'
                        const el = (e.target as HTMLVideoElement).parentElement?.querySelector('[data-fallback]') as HTMLElement
                        if (el) el.style.display = 'flex'
                      }}
                    />
                    <div data-fallback className="absolute inset-0 hidden items-center justify-center text-5xl" style={{ display: 'none' }}>
                      {opt.id === 'product-morphing' && '🛠️'}
                      {opt.id === 'head-only' && '👤'}
                      {opt.id === 'avatar' && '✨'}
                    </div>
                  </div>
                  <h3 className="font-bold text-ds-lg text-cream text-center">{opt.title}</h3>
                  <p className="mt-2 text-ds-base text-slate-text text-center">{opt.shortDesc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Product / avatar setup ── */}
        {step === 1 && characterStyleType === 'product-morphing' && (
          <div className="max-w-[640px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(0)} />
              <h2 className="font-bold text-ds-2xl text-cream">Your product or tool</h2>
              <p className="mt-2 text-ds-base text-slate-text">
                Upload an image. The AI will analyze it and create an animated version — no human faces.
              </p>

              <div className="mt-8">
                <p className="text-ds-sm font-medium text-cream mb-2">Product Image *</p>
                {!productImagePreview ? (
                  <label htmlFor="product-image-upload" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-border/25 rounded-lg p-12 bg-bg-overlay text-center hover:border-teal/40 transition-colors duration-normal">
                      <Upload className="w-10 h-10 mx-auto text-steel-blue" strokeWidth={1.5} />
                      <p className="mt-3 font-medium text-ds-md text-cream">Drop your product image here</p>
                      <p className="text-ds-sm text-steel-blue mt-1">or click to browse — JPG, PNG up to 10MB</p>
                    </div>
                    <input id="product-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="relative border-2 border-teal/40 rounded-lg p-4 bg-bg-overlay">
                    <img src={productImagePreview} alt="Product" className="w-full h-64 object-contain rounded-md" />
                    <button type="button"
                      onClick={() => { setProductImage(null); setProductImagePreview(null); setObjectType('') }}
                      className="absolute top-5 right-5 bg-bg-secondary border border-border/15 rounded-full p-2 hover:bg-bg-overlay transition-colors"
                    >
                      <X className="w-4 h-4 text-steel-blue" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-4 text-ds-sm text-steel-blue">
                AI will analyze your product image to create a Living Product character.
              </p>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!productImage}>
                  Next: Personality
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 1 && (characterStyleType === 'head-only' || characterStyleType === 'avatar') && (
          <div className="max-w-[640px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(0)} />
              <h2 className="font-bold text-ds-2xl text-cream">
                {characterStyleType === 'avatar' ? 'Design your avatar' : 'Head-only character'}
              </h2>
              <p className="mt-2 text-ds-base text-slate-text">
                {characterStyleType === 'avatar'
                  ? 'Customize your professional illustrated avatar.'
                  : 'Upload a reference image for your head-only character.'}
              </p>

              {characterStyleType === 'avatar' && (
                <div className="mt-8">
                  <AvatarCustomizer onAvatarChange={(config) => setAvatarConfig(config)} />
                </div>
              )}

              {characterStyleType === 'head-only' && (
                <div className="mt-8">
                  <p className="text-ds-sm font-medium text-cream mb-2">Reference Image</p>
                  {!productImagePreview ? (
                    <label htmlFor="head-image-upload" className="block cursor-pointer">
                      <div className="border-2 border-dashed border-border/25 rounded-lg p-12 bg-bg-overlay text-center hover:border-teal/40 transition-colors duration-normal">
                        <Upload className="w-10 h-10 mx-auto text-steel-blue" strokeWidth={1.5} />
                        <p className="mt-3 font-medium text-ds-md text-cream">Drop image here</p>
                        <input id="head-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </div>
                    </label>
                  ) : (
                    <div className="relative border-2 border-teal/40 rounded-lg p-4 bg-bg-overlay">
                      <img src={productImagePreview} alt="Reference" className="w-full h-48 object-contain rounded-md" />
                      <button type="button"
                        onClick={() => { setProductImage(null); setProductImagePreview(null) }}
                        className="absolute top-4 right-4 bg-bg-secondary border border-border/15 rounded-full p-2 hover:bg-bg-overlay transition-colors"
                      >
                        <X className="w-4 h-4 text-steel-blue" strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={characterStyleType === 'head-only' && !productImage}>
                  Next: Personality
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 2: Personality ── */}
        {step === 2 && (
          <div className="max-w-[800px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(1)} />
              <h2 className="font-bold text-ds-2xl text-cream">Character Personality</h2>
              <p className="mt-2 text-ds-base text-slate-text">Select how your character should sound and behave.</p>

              {characterStyleType !== 'avatar' && (
                <div className="mt-8">
                  <h3 className="font-semibold text-ds-lg text-cream mb-4">Personality Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CHARACTER_TYPES.map((t) => (
                      <button
                        key={t.title}
                        type="button"
                        onClick={() => setCharacterType(t.title)}
                        className={[
                          'text-left p-5 rounded-lg border-2 transition-all duration-normal',
                          characterType === t.title
                            ? 'border-teal bg-teal/5 shadow-teal-glow'
                            : 'border-border/15 bg-bg-overlay hover:border-teal/30',
                        ].join(' ')}
                      >
                        <h3 className="font-semibold text-ds-base text-cream">{t.title}</h3>
                        <p className="mt-2 text-ds-sm text-slate-text">{t.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="font-semibold text-ds-sm text-cream mb-3">Adjust vibe</p>
                    <div className="flex flex-wrap gap-2">
                      {VIBES.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleVibe(v)}
                          className={[
                            'px-4 py-2 rounded-full font-medium text-ds-sm transition-all duration-normal border',
                            selectedVibes.includes(v)
                              ? 'bg-teal/15 text-teal border-teal/25'
                              : 'bg-bg-overlay text-slate-text border-border/15 hover:text-cream',
                          ].join(' ')}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {characterStyleType === 'avatar' && (
                <div className="mt-8 p-6 bg-bg-overlay rounded-lg border border-border/15">
                  <p className="text-ds-base text-slate-text">Your avatar is configured. Continue to add name and voice.</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(3)}>Next: Voice</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 3: Voice ── */}
        {step === 3 && (
          <div className="max-w-[640px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(2)} />
              <h2 className="font-bold text-ds-2xl text-cream">Name and voice your character.</h2>
              <p className="mt-2 text-ds-base text-slate-text">
                Soul Engine handles the deep personality. You give them a name and a first impression.
              </p>

              <div className="mt-8 space-y-6">
                <Input
                  label="Character name"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="What should we call them?"
                />
                <div>
                  <Input
                    label="Signature Phrase"
                    value={catchphrase}
                    onChange={(e) => setCatchphrase(e.target.value)}
                    placeholder="One thing only this character would say…"
                  />
                  <p className="mt-2 text-ds-sm text-steel-blue">"Not 'I'm here to help!' — something real."</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-ds-sm font-medium text-cream">Opening Line</label>
                  <textarea
                    rows={3}
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    placeholder="How does your character greet someone landing on the product page?"
                    className="w-full bg-bg-overlay border border-border/25 rounded-md py-3 px-4 text-ds-base text-cream placeholder:text-steel-blue focus:outline-none focus:border-teal/60 focus:ring-2 focus:ring-teal/15 transition-all duration-normal resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <p className="font-semibold text-ds-sm text-cream mb-4">Personality Dials</p>
                <div className="space-y-5">
                  <PersonalitySlider leftLabel="Serious"  rightLabel="Playful"     value={seriousness}  onChange={setSeriousness} />
                  <PersonalitySlider leftLabel="Formal"   rightLabel="Casual"       value={formality}    onChange={setFormality} />
                  <PersonalitySlider leftLabel="Reserved" rightLabel="Enthusiastic" value={reservedness} onChange={setReservedness} />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(4)}>Next: Knowledge Base</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 4: Knowledge ── */}
        {step === 4 && (
          <div className="max-w-[640px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(3)} />
              <h2 className="font-bold text-ds-2xl text-cream">Build your character's knowledge base.</h2>
              <p className="mt-2 text-ds-base text-slate-text">
                AI generates 30 Q&amp;A pairs from your URL. You review and approve. Zero manual typing.
              </p>

              <div className="mt-8">
                <p className="text-ds-sm font-medium text-cream mb-2">Product URL</p>
                <div className="flex gap-3">
                  <input
                    type="url"
                    defaultValue="https://yourstore.com/products/your-product"
                    className="flex-1 bg-bg-overlay border border-border/25 rounded-md py-3 px-4 text-ds-base text-cream placeholder:text-steel-blue focus:outline-none focus:border-teal/60 focus:ring-2 focus:ring-teal/15 transition-all duration-normal"
                  />
                  <Button variant="secondary" size="md">Generate Q&amp;A</Button>
                </div>
                <p className="mt-2 text-ds-sm text-steel-blue">AI will generate 30 questions your customers actually ask.</p>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-ds-base text-cream">Review Generated Q&amp;A</h3>
                  <span className="text-ds-sm text-steel-blue">30 pairs generated. Edit any answer.</span>
                </div>
                <div className="space-y-2">
                  {QA_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-bg-overlay rounded-md border border-border/15">
                      <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 accent-teal" />
                      <div className="flex-1">
                        <p className="font-medium text-ds-sm text-cream">{item.q}</p>
                        <p className="text-ds-sm text-slate-text mt-1">{item.a}</p>
                      </div>
                      <button type="button" className="text-steel-blue hover:text-cream transition-colors shrink-0">
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-3 text-ds-sm text-steel-blue underline hover:text-cream transition-colors">
                  Load all 30
                </button>
                <button
                  type="button"
                  className="mt-4 w-full border-2 border-dashed border-border/25 rounded-lg p-4 text-center hover:border-teal/40 transition-colors duration-normal text-ds-sm text-steel-blue hover:text-cream"
                >
                  + Add custom Q&amp;A pair
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(5)}>Next: Launch</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 5: Launch ── */}
        {step === 5 && (
          <div className="max-w-[560px] mx-auto">
            <Card>
              <BackBtn onClick={() => setStep(4)} />

              {/* Error state */}
              {error && (
                <div className="mb-6 bg-coral/10 border border-coral/25 rounded-lg p-4">
                  <p className="text-ds-sm text-cream font-semibold">{error.error}</p>
                  <p className="text-ds-sm text-slate-text mt-1">{error.message}</p>
                  {error.suggestedAction && (
                    <p className="text-ds-sm text-steel-blue mt-2">→ {error.suggestedAction}</p>
                  )}
                  {error.retryAfter && (
                    <p className="text-ds-sm text-steel-blue mt-2">Retry after: {error.retryAfter}s</p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleTryAgain} size="sm" intrinsic={false}>Try Again</Button>
                    <Button onClick={() => setStep(1)} variant="secondary" size="sm" intrinsic={false}>Upload Custom Image</Button>
                  </div>
                </div>
              )}

              {/* Pre-generate summary */}
              {!generating && !generationComplete && !error && (
                <>
                  <h2 className="font-bold text-ds-2xl text-cream">Your character is ready to generate.</h2>
                  <p className="mt-2 text-ds-base text-slate-text">
                    Soul Engine will create your character with Amazon Bedrock.
                  </p>

                  <div className="mt-8 space-y-0">
                    {[
                      ['Category',       characterStyleType === 'avatar' ? 'Custom Avatar' : characterStyleType === 'head-only' ? 'Head Only' : 'Living Product'],
                      ['Character Type', characterStyleType === 'avatar' ? 'Avatar' : characterType || 'The Expert'],
                      ['Character Name', charName || '—'],
                      ['Vibe Tags',      selectedVibes.join(', ') || '—'],
                    ].map(([label, value], i, arr) => (
                      <div key={label} className={`flex justify-between py-3 ${i < arr.length - 1 ? 'border-b border-border/10' : ''}`}>
                        <span className="font-medium text-ds-sm text-steel-blue">{label}</span>
                        <span className="font-semibold text-ds-sm text-cream">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-5 bg-bg-overlay rounded-lg border-l-2 border-l-teal">
                    <p className="font-semibold text-ds-sm text-cream">Amazon Bedrock will generate:</p>
                    <ul className="mt-2 text-ds-sm text-slate-text leading-relaxed space-y-1">
                      <li>· 3 character variations to choose from</li>
                      <li>· Full character personality and voice</li>
                      <li>· Animation states for your subscription tier</li>
                      <li>· Widget ready to embed</li>
                    </ul>
                  </div>

                  <Button onClick={handleGenerate} intrinsic={false} size="lg" className="mt-6">
                    Generate My Character
                  </Button>
                </>
              )}

              {/* Generating state */}
              {generating && (
                <>
                  <h2 className="font-bold text-ds-2xl text-cream mb-4">
                    Soul Engine is building your character…
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
                    <div className="mt-6 p-4 bg-bg-overlay rounded-lg border border-border/15">
                      <p className="text-ds-sm text-slate-text text-center">
                        Estimated: <span className="font-semibold text-cream">{Math.ceil(estimatedTime / 60)} minutes</span>
                      </p>
                      {currentJob?.currentStep && (
                        <p className="text-ds-xs text-steel-blue text-center mt-2">{currentJob.currentStep}</p>
                      )}
                    </div>
                  )}
                  <p className="mt-6 text-center text-ds-sm text-steel-blue">
                    Usually ready in a few minutes. You can leave this page — we'll notify you when it's done.
                  </p>
                  <div className="mt-6 flex justify-start">
                    <Button to="/dashboard" variant="ghost" size="sm">Back to Dashboard</Button>
                  </div>
                </>
              )}

              {/* Generation complete */}
              {generationComplete && !error && (
                <>
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center justify-center w-16 h-16 bg-teal/15 rounded-full mb-4 border-2 border-teal/40">
                      <Check className="w-8 h-8 text-teal" strokeWidth={2} />
                    </span>
                    <h2 className="font-bold text-ds-2xl text-cream">Your character is ready!</h2>
                    <p className="mt-2 text-ds-base text-slate-text">
                      {variations.length} variations generated with {availableStates.length} animation states
                    </p>
                  </div>

                  {variations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-ds-sm text-cream mb-3">Choose a variation</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {variations.map((v) => (
                          <button
                            key={v.variationNumber}
                            type="button"
                            onClick={() => setSelectedVariation(v.variationNumber)}
                            className={[
                              'rounded-lg border-2 overflow-hidden transition-all duration-normal',
                              selectedVariation === v.variationNumber
                                ? 'border-teal shadow-teal-glow'
                                : 'border-border/15 hover:border-teal/40',
                            ].join(' ')}
                          >
                            <img src={v.imageUrl} alt={`Variation ${v.variationNumber}`} className="w-full aspect-square object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableStates.length > 0 && (
                    <div className="mb-6 p-4 bg-bg-overlay rounded-lg border border-border/15">
                      <p className="text-ds-sm font-medium text-cream mb-2">Available Animation States:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableStates.map((state) => (
                          <Badge key={state} variant="teal">{state}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      onClick={() => { window.location.href = '/dashboard/widget/demo' }}
                      intrinsic={false} size="lg"
                    >
                      View Widget Demo
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const code = `<script src="https://cdn.toolstoy.app/widget.js" data-character-id="demo" async></script>`
                          navigator.clipboard.writeText(code)
                        }}
                        className="text-ds-sm text-teal hover:text-teal/70 underline transition-colors"
                      >
                        Copy Embed Code
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button to="/dashboard" variant="ghost" size="sm">Back to Dashboard</Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
