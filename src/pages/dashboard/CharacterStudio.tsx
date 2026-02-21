import { useState } from 'react'
import { Link } from 'react-router-dom'

const STEPS = [
  { num: 1, label: 'Product' },
  { num: 2, label: 'Character' },
  { num: 3, label: 'Personality' },
  { num: 4, label: 'Knowledge' },
  { num: 5, label: 'Launch' },
]

const CHARACTER_TYPES = [
  {
    icon: '🔧',
    title: 'The Expert',
    description: 'Deep product knowledge. Confident. Answers every question with authority.',
  },
  {
    icon: '😄',
    title: 'The Entertainer',
    description: 'Personality-first. Makes shopping fun. Customers remember the chat.',
  },
  {
    icon: '🤝',
    title: 'The Advisor',
    description: 'Consultative. Asks questions back. Helps customers find the right choice.',
  },
  {
    icon: '⚡',
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
  const [step, setStep] = useState(1)
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

  const toggleVibe = (v: string) => {
    setSelectedVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  const handleGenerate = () => {
    setGenerating(true)
    setProgressStep(0)
    const interval = setInterval(() => {
      setProgressStep((p) => {
        if (p >= 3) {
          clearInterval(interval)
          return 4
        }
        return p + 1
      })
    }, 1500)
  }

  return (
    <div className="bg-[#F5F5F5] min-h-full">
      {/* Step indicator */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 md:px-8 py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {STEPS.map((s, i) => (
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
              {i < STEPS.length - 1 && (
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
        {/* Step 1 — Product */}
        {step === 1 && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A] leading-tight">
                What product are we building a character for?
              </h2>
              <p className="mt-2 text-[15px] text-[#6B7280] font-normal">
                Paste your product URL — we extract everything automatically. Or upload manually.
              </p>

              <div className="mt-8">
                <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">
                  Product URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://yourstore.com/products/your-product"
                    className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <button className="border border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[14px] px-[18px] py-3 rounded-lg hover:bg-[#FAFAFA] shrink-0">
                    Extract
                  </button>
                </div>
              </div>

              <div className="my-5 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[13px] text-[#6B7280]">or</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 bg-[#FAFAFA] text-center">
                <svg className="w-7 h-7 mx-auto text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="mt-2.5 font-medium text-[14px] text-[#1A1A1A]">Drop your product image here</p>
                <p className="text-[13px] text-[#6B7280] font-normal">or click to browse — JPG, PNG up to 10MB</p>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Product name</label>
                  <input
                    type="text"
                    value="Your Product Name"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="Extracted product description appears here automatically. Edit anything before continuing."
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg hover:opacity-90"
                >
                  Next: Build the Character →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Character */}
        {step === 2 && (
          <div className="max-w-[640px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 md:p-10">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">What kind of character feels right?</h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                Soul Engine handles the full personality. You just pick the direction.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    <span className="text-2xl">{t.icon}</span>
                    <h3 className="mt-2.5 font-semibold text-[15px] text-[#1A1A1A]">{t.title}</h3>
                    <p className="mt-1.5 text-[13px] text-[#6B7280]">{t.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block font-semibold text-[13px] text-[#1A1A1A] mb-2">Adjust the vibe</label>
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

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg"
                >
                  Next: Personality →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Personality */}
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
                <button onClick={() => setStep(2)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg"
                >
                  Next: Knowledge Base →
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
                <button onClick={() => setStep(3)} className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-6 py-3.5 rounded-lg"
                >
                  Next: Launch →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Launch */}
        {step === 5 && (
          <div className="max-w-[560px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
              <h2 className="font-bold text-2xl text-[#1A1A1A]">Your character is ready to generate.</h2>
              <p className="mt-2 text-[15px] text-[#6B7280]">
                Soul Engine will take it from here. Amazon Bedrock handles everything automatically.
              </p>

              {!generating ? (
                <>
                  <div className="mt-8 space-y-0">
                    {[
                      ['Product', 'Your Product Name'],
                      ['Character Type', characterType || 'The Expert'],
                      ['Character Name', charName],
                      ['Knowledge Base', '30 Q&A pairs ready'],
                      ['Widget Layout', 'Side by Side'],
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

                  <div className="mt-5 p-5 bg-[#F5F5F5] rounded-lg border-l-[3px] border-l-[#1A1A1A]">
                    <p className="font-semibold text-[14px] text-[#1A1A1A]">Amazon Bedrock will generate:</p>
                    <ul className="mt-2.5 text-[14px] text-[#6B7280] leading-relaxed space-y-1">
                      <li>· Full Character Bible (personality, quirks, voice)</li>
                      <li>· Character image</li>
                      <li>· 4 animation states</li>
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
              ) : (
                <>
                  <button
                    disabled
                    className="mt-6 w-full bg-[#1A1A1A]/80 text-white font-bold text-base py-4 rounded-lg animate-pulse"
                  >
                    Generating...
                  </button>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: 'Extracting character soul...', done: progressStep >= 1, active: progressStep === 0 },
                      { label: 'Building knowledge base...', done: progressStep >= 2, active: progressStep === 1 },
                      { label: 'Generating character image...', done: progressStep >= 3, active: progressStep === 2 },
                      { label: 'Creating animations...', done: progressStep >= 4, active: progressStep === 3 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        {item.done ? (
                          <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : item.active ? (
                          <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-[#E5E7EB]" />
                        )}
                        <span className="text-[14px] text-[#1A1A1A]">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-center text-[13px] text-[#6B7280]">
                    Usually ready in a few minutes. We&apos;ll notify you when it&apos;s done.
                  </p>

                  <div className="mt-6 flex justify-start">
                    <Link
                      to="/dashboard"
                      className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A]"
                    >
                      ← Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
