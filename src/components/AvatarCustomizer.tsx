import { useState, useEffect } from 'react'

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

const SKIN_TONES = [
  { name: 'Light', value: '#FDBCB4' },
  { name: 'Medium Light', value: '#F1C27D' },
  { name: 'Medium', value: '#E0AC69' },
  { name: 'Medium Dark', value: '#C68642' },
  { name: 'Dark', value: '#8D5524' },
]

const EYE_COLORS = [
  { name: 'Brown', value: '#8B4513' },
  { name: 'Blue', value: '#1E90FF' },
  { name: 'Green', value: '#228B22' },
  { name: 'Hazel', value: '#8B7355' },
  { name: 'Gray', value: '#808080' },
]

const HAIR_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Brown', value: '#4B3621' },
  { name: 'Blonde', value: '#F5DEB3' },
  { name: 'Red', value: '#8B4513' },
  { name: 'Gray', value: '#708090' },
  { name: 'White', value: '#F5F5F5' },
]

const BG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Teal', value: '#14B8A6' },
]

const TOTAL_STEPS = 8

function AvatarPreview({ config }: { config: AvatarConfig }) {
  return (
    <div
      className="w-32 h-32 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center relative"
          style={{
            backgroundColor: config.skinTone,
            borderRadius:
              config.faceShape === 'square'
                ? '20%'
                : config.faceShape === 'heart'
                  ? '50% 50% 45% 45%'
                  : '50%',
          }}
        >
          <div className="flex gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: config.eyeColor,
                borderRadius: config.eyeType === 'almond' ? '50% 30%' : '50%',
              }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: config.eyeColor,
                borderRadius: config.eyeType === 'almond' ? '50% 30%' : '50%',
              }}
            />
          </div>
          <div className="flex gap-3 mb-1">
            <div
              className="h-0.5"
              style={{
                backgroundColor: '#000000',
                width: config.eyebrowType === 'thick' ? '12px' : '8px',
                height: config.eyebrowType === 'thick' ? '2px' : '1px',
              }}
            />
            <div
              className="h-0.5"
              style={{
                backgroundColor: '#000000',
                width: config.eyebrowType === 'thick' ? '12px' : '8px',
                height: config.eyebrowType === 'thick' ? '2px' : '1px',
              }}
            />
          </div>
          <div
            className="mb-1"
            style={{
              width: '4px',
              height: '6px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: config.noseType === 'button' ? '50%' : '20%',
            }}
          />
          <div
            className="w-6 h-1"
            style={{
              backgroundColor: '#000000',
              borderRadius: config.mouthType === 'smile' ? '50%' : '0%',
              height: config.mouthType === 'laugh' ? '2px' : '1px',
            }}
          />
        </div>
        {config.hairStyle !== 'bald' && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width:
                config.hairStyle === 'long' ? '80px' : config.hairStyle === 'medium' ? '70px' : '60px',
              height:
                config.hairStyle === 'long' ? '40px' : config.hairStyle === 'medium' ? '30px' : '20px',
              backgroundColor: config.hairColor,
              borderRadius: '50% 50% 20% 20%',
              top:
                config.hairStyle === 'long' ? '-15px' : config.hairStyle === 'medium' ? '-10px' : '-5px',
            }}
          />
        )}
        {config.accessory === 'glasses' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="w-6 h-6 border-2 border-black rounded-full" />
            <div className="w-6 h-6 border-2 border-black rounded-full" />
          </div>
        )}
        {config.accessory === 'sunglasses' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="w-6 h-6 bg-gray-800 rounded-full" />
            <div className="w-6 h-6 bg-gray-800 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export function AvatarCustomizer({ onAvatarChange }: { onAvatarChange: (config: AvatarConfig) => void }) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    faceShape: 'round',
    skinTone: '#FDBCB4',
    eyeType: 'round',
    eyeColor: '#8B4513',
    eyebrowType: 'straight',
    noseType: 'button',
    mouthType: 'smile',
    hairStyle: 'short',
    hairColor: '#000000',
    accessory: 'none',
    backgroundColor: '#3B82F6',
  })
  const [step, setStep] = useState(1)

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    const newConfig = { ...avatarConfig, ...updates }
    setAvatarConfig(newConfig)
    onAvatarChange(newConfig)
  }

  useEffect(() => {
    onAvatarChange(avatarConfig)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const canGoBack = step > 1
  const canGoNext = step < TOTAL_STEPS

  const stepLabels: Record<number, string> = {
    1: 'Skin tone',
    2: 'Face shape',
    3: 'Hair',
    4: 'Eyes',
    5: 'Eyebrows',
    6: 'Expression',
    7: 'Accessories',
    8: 'Background',
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          Step {step} of {TOTAL_STEPS}: {stepLabels[step]}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Live preview - always visible */}
        <div className="flex justify-center w-full md:w-auto">
          <AvatarPreview config={avatarConfig} />
        </div>

        {/* Step content */}
        <div className="flex-1 w-full min-w-0">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Skin tone</label>
              <div className="flex flex-wrap gap-3">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => updateConfig({ skinTone: tone.value })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      avatarConfig.skinTone === tone.value ? 'border-slate-800 ring-2 ring-slate-800/20 scale-110' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: tone.value }}
                    title={tone.name}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{SKIN_TONES.find((t) => t.value === avatarConfig.skinTone)?.name}</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Face shape</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['round', 'oval', 'square', 'heart'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updateConfig({ faceShape: shape })}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      avatarConfig.faceShape === shape
                        ? 'border-slate-700 bg-slate-100 ring-1 ring-slate-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {shape === 'round' ? 'Round' : shape === 'oval' ? 'Oval' : shape === 'square' ? 'Square' : 'Heart'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hair style</label>
                <select
                  value={avatarConfig.hairStyle}
                  onChange={(e) => updateConfig({ hairStyle: e.target.value as AvatarConfig['hairStyle'] })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-700/20 focus:border-slate-700"
                >
                  <option value="bald">Bald</option>
                  <option value="buzz">Buzz Cut</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              {avatarConfig.hairStyle !== 'bald' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hair color</label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateConfig({ hairColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  avatarConfig.hairColor === color.value ? 'border-slate-800 ring-2 ring-slate-800/20' : 'border-slate-200 hover:border-slate-300'
                }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Eye type</label>
                <select
                  value={avatarConfig.eyeType}
                  onChange={(e) => updateConfig({ eyeType: e.target.value as AvatarConfig['eyeType'] })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-700/20 focus:border-slate-700"
                >
                  <option value="round">Round</option>
                  <option value="almond">Almond</option>
                  <option value="hooded">Hooded</option>
                  <option value="upturned">Upturned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Eye color</label>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateConfig({ eyeColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  avatarConfig.eyeColor === color.value ? 'border-slate-800 ring-2 ring-slate-800/20' : 'border-slate-200 hover:border-slate-300'
                }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Eyebrow style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['straight', 'arched', 'thick', 'thin'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateConfig({ eyebrowType: style })}
                    className={`px-4 py-3 rounded-lg border capitalize transition-all ${
                      avatarConfig.eyebrowType === style
                        ? 'border-slate-700 bg-slate-100 ring-1 ring-slate-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expression</label>
                <select
                  value={avatarConfig.noseType}
                  onChange={(e) => updateConfig({ noseType: e.target.value as AvatarConfig['noseType'] })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-700/20 focus:border-slate-700"
                >
                  <option value="button">Button</option>
                  <option value="straight">Straight</option>
                  <option value="hooked">Hooked</option>
                  <option value="rounded">Rounded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mouth</label>
                <select
                  value={avatarConfig.mouthType}
                  onChange={(e) => updateConfig({ mouthType: e.target.value as AvatarConfig['mouthType'] })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-700/20 focus:border-slate-700"
                >
                  <option value="smile">Smile</option>
                  <option value="neutral">Neutral</option>
                  <option value="laugh">Laugh</option>
                  <option value="serious">Serious</option>
                </select>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Accessories</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['none', 'glasses', 'sunglasses', 'earrings'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => updateConfig({ accessory: acc })}
                    className={`px-4 py-3 rounded-lg border capitalize transition-all ${
                      avatarConfig.accessory === acc ? 'border-slate-700 bg-slate-100 ring-1 ring-slate-700' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Background color</label>
              <div className="flex flex-wrap gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateConfig({ backgroundColor: color.value })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      avatarConfig.backgroundColor === color.value ? 'border-slate-800 ring-2 ring-slate-800/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={!canGoBack}
              className={`px-4 py-2 rounded-lg font-medium ${
                canGoBack ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              Back
            </button>
            {canGoNext && (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
