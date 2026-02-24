import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, ChevronRightIcon } from '@/components/icons'
import { usePersonas } from '@/hooks/usePersonas'
import CharacterWidget from '@/components/CharacterWidget'
import { SubscriptionTier } from '../../../amplify/functions/soul-engine/animation-states'
import outputs from '../../../amplify_outputs.json'

const API_BASE = (outputs as { custom?: { API?: Record<string, { endpoint?: string }> } }).custom?.API?.ToolstoyApi?.endpoint?.replace(/\/$/, '') ?? ''

const LAYOUTS = [
  'Side by Side',
  'Character Top',
  'Chat Focus',
  'Mirror',
  'Immersive',
  'Compact',
  'Cinematic',
]

const POSITIONS = ['Bottom Right', 'Bottom Left', 'Top Right', 'Top Left']

const TRIGGERS = [
  { id: 'immediate', label: 'Open immediately on page load' },
  { id: 'delay', label: 'Open after 45 seconds' },
  { id: 'click', label: 'Wait for customer to click' },
]

const PLATFORMS: { name: string; slug: string }[] = [
  { name: 'Wix', slug: 'wix' },
  { name: 'Squarespace', slug: 'squarespace' },
  { name: 'WordPress', slug: 'wordpress' },
  { name: 'Webflow', slug: 'webflow' },
  { name: 'Custom HTML', slug: 'custom' },
]

function buildEmbedCode(token: string, position: string, apiBase: string): string {
  const api = apiBase ? ` data-api="${apiBase}"` : ''
  return `<script
  src="https://cdn.toolstoy.app/widget.js"
  data-persona="${token}"
  data-position="${position.toLowerCase().replace(/\s/g, '-')}"${api}
></script>`
}

export function WidgetSettings() {
  const { personas, isLoading } = usePersonas()
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('')
  const [selectedLayout, setSelectedLayout] = useState('Side by Side')
  const [selectedPosition, setSelectedPosition] = useState('Bottom Right')
  const [selectedTrigger, setSelectedTrigger] = useState('delay')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (personas.length > 0 && !selectedPersonaId) setSelectedPersonaId(personas[0].id)
  }, [personas, selectedPersonaId])

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId) ?? personas[0]
  const embedToken = selectedPersona?.embedToken ?? 'ts_xxxxxxxxxxxxxxxx'
  const embedCode = buildEmbedCode(embedToken, selectedPosition, API_BASE)

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const previewConfig = selectedPersona ? {
    id: selectedPersona.id,
    name: selectedPersona.name ?? 'Character',
    imageUrl: selectedPersona.imageUrl ?? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
    videoStates: { idle: '', thinking: '', talking: '', greeting: '' },
    dominantColor: '#5B7C99',
    capabilities: { visual: { animation: true, showImage: true }, spatial: { positionControl: true, minimizeOption: true } },
    subscriptionTier: SubscriptionTier.FREE as SubscriptionTier,
  } : null

  return (
    <div className="p-5 md:p-8 space-y-8">
      {/* TOP: Chat Box Preview */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
        <h3 className="font-semibold text-base text-[#1A1A1A] mb-2">Preview</h3>
        <p className="text-[14px] text-[#6B7280] mb-6">
          See how your widget will look on your site.
        </p>
        <div className="flex justify-center items-center min-h-[400px] bg-[#F9FAFB] rounded-lg">
          {previewConfig ? (
            <CharacterWidget config={previewConfig} className="shadow-lg" />
          ) : (
            <div className="text-center text-[#6B7280]">
              <p className="font-medium">Create a character first</p>
              <p className="text-sm mt-1">Select a character above to see the preview</p>
            </div>
          )}
        </div>
      </div>

      {/* BELOW: Config + Embed Code */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-8">
        {/* Left - Configuration */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          <div>
            <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">
              Select Character
            </label>
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal focus:border-[#1A1A1A] focus:outline-none"
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : personas.length === 0 ? (
                <option>No characters yet</option>
              ) : (
                personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? 'Character'} {p.productName ? `— ${p.productName}` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mt-7">
            <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-3">
              Choose your widget layout
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout}
                  onClick={() => setSelectedLayout(layout)}
                  className={`relative w-full aspect-[100/72] max-w-[100px] bg-[#1A1A1A] rounded-md border-2 transition-all ${
                    selectedLayout === layout ? 'border-[#1A1A1A]' : 'border-transparent hover:border-[#6B7280]'
                  }`}
                >
                  <div className="absolute inset-2 flex gap-1">
                    <div className="flex-1 bg-white/20 rounded" />
                    <div className="flex-1 bg-white/10 rounded" />
                  </div>
                  <span className="absolute bottom-0 left-0 right-0 text-[11px] text-[#6B7280] text-center py-1 truncate px-1">
                    {layout}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">Position</label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
                    selectedPosition === pos
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-3">
              Trigger Behavior
            </label>
            <div className="space-y-3">
              {TRIGGERS.map((t) => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="trigger"
                    checked={selectedTrigger === t.id}
                    onChange={() => setSelectedTrigger(t.id)}
                    className="w-4 h-4 text-[#1A1A1A]"
                  />
                  <span className="text-[14px] text-[#1A1A1A]">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Embed Code */}
        <div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
            <h3 className="font-semibold text-base text-[#1A1A1A]">Your Embed Code</h3>
            <p className="mt-1.5 text-[14px] text-[#6B7280]">
              Paste this before the closing &lt;/body&gt; tag.
            </p>

            <pre className="mt-4 p-5 bg-[#1A1A1A] rounded-lg text-[#22C55E] text-[13px] font-mono leading-relaxed overflow-x-auto">
              {embedCode}
            </pre>

            <button
              onClick={handleCopy}
              className="mt-3 w-full flex items-center justify-center gap-2 border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] py-2.5 rounded-lg hover:bg-[#F5F5F5] transition-all"
            >
              {copied ? (
                <>
                  <CheckIcon />
                  Copied! ✓
                </>
              ) : (
                'Copy Code'
              )}
            </button>

            <div className="mt-6">
              <p className="font-medium text-[14px] text-[#6B7280] uppercase tracking-widest mb-3">
                INSTALLATION GUIDES
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/docs/install/${p.slug}`}
                    className="inline-flex items-center bg-[#F5F5F5] text-[#6B7280] font-medium text-[14px] px-3.5 py-1.5 rounded-[20px] hover:bg-[#E5E7EB] transition-all duration-200"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5 inline-block mr-1 align-middle" />
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
