/**
 * Digital Alchemy — "The Building Phase"
 * When a user provides a URL and Toolstoy is building the character,
 * make it a spectacle. Fluid orb + data threads suggest the character
 * is being woven together in real-time.
 */

import { SoulEnginePulse } from './SoulEnginePulse'

interface DigitalAlchemyProps {
  progressStep: number
  steps: { label: string }[]
}

export function DigitalAlchemy({ progressStep, steps }: DigitalAlchemyProps) {
  const threadCount = 12
  const threads = Array.from({ length: threadCount }, (_, i) => {
    const angle = (i / threadCount) * 360
    const rad = (angle * Math.PI) / 180
    const x1 = 50 + 35 * Math.cos(rad)
    const y1 = 50 + 35 * Math.sin(rad)
    return { x1, y1, i }
  })

  return (
    <div className="flex flex-col items-center">
      {/* Central fluid orb + weaving threads */}
      <div className="relative w-40 h-40 mx-auto mb-8">
        {/* SVG data threads — converge toward center (weaving effect) */}
        <svg
          className="absolute inset-0 w-full h-full text-[#6366F1]"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {threads.map((t) => (
            <line
              key={t.i}
              x1={t.x1}
              y1={t.y1}
              x2={50}
              y2={50}
              stroke="url(#threadGrad)"
              strokeWidth="0.6"
              strokeLinecap="round"
              className="soul-thread"
              style={{ animationDelay: `${t.i * 0.12}s` }}
            />
          ))}
        </svg>

        {/* Fluid gradient orb — Soul Engine core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SoulEnginePulse className="w-24 h-24 rounded-full bg-[#F5F5F5]" variant="orb" />
        </div>
      </div>

      {/* Progress steps — intent-based reveal */}
      <div className="space-y-3 w-full max-w-[280px]">
        {steps.map((item, idx) => {
          const done = progressStep > idx
          const active = idx === progressStep && progressStep < steps.length
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3 transition-all duration-[400ms] ${
                done ? 'opacity-100' : active ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              {done ? (
                <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : active ? (
                <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-[#E5E7EB] flex-shrink-0" />
              )}
              <span className="text-[14px] text-[#1A1A1A] font-medium">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
