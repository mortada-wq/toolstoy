import { useState } from 'react'

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

const PLATFORMS = ['Wix', 'Squarespace', 'WordPress', 'Webflow', 'Custom HTML']

const EMBED_CODE = `<script
  src="https://cdn.toolstoy.app/widget.js"
  data-persona="ts_xxxxxxxxxxxxxxxx"
  data-position="bottom-right"
></script>`

export function WidgetSettings() {
  const [selectedLayout, setSelectedLayout] = useState('Side by Side')
  const [selectedPosition, setSelectedPosition] = useState('Bottom Right')
  const [selectedTrigger, setSelectedTrigger] = useState('delay')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(EMBED_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-8">
        {/* Left - Configuration */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 order-2 lg:order-1">
          <div>
            <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">
              Select Character
            </label>
            <select className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] font-normal focus:border-[#1A1A1A] focus:outline-none">
              <option>Character 1 — Power Tool</option>
              <option>Character 2 — Coffee Machine</option>
              <option>Character 3 — Running Shoe</option>
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
        <div className="order-1 lg:order-2">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 sticky top-24">
            <h3 className="font-semibold text-base text-[#1A1A1A]">Your Embed Code</h3>
            <p className="mt-1.5 text-[14px] text-[#6B7280]">
              Paste this before the closing &lt;/body&gt; tag.
            </p>

            <pre className="mt-4 p-5 bg-[#1A1A1A] rounded-lg text-[#22C55E] text-[13px] font-mono leading-relaxed overflow-x-auto">
              {EMBED_CODE}
            </pre>

            <button
              onClick={handleCopy}
              className="mt-3 w-full border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] py-2.5 rounded-lg hover:bg-[#F5F5F5] transition-all"
            >
              {copied ? 'Copied! ✓' : 'Copy Code'}
            </button>

            <div className="mt-6">
              <p className="font-medium text-[11px] text-[#6B7280] uppercase tracking-widest mb-3">
                Installation Guides
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    className="bg-[#F5F5F5] text-[#6B7280] font-medium text-[12px] px-3.5 py-1.5 rounded-full hover:bg-[#E5E7EB] transition-all"
                  >
                    → {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
