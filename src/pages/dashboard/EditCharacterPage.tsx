import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  getPersona,
  updatePersona,
  listKnowledgeItems,
  createKnowledgeItem,
  deleteKnowledgeItem,
} from '@/lib/data'
import type { PersonaRecord } from '@/lib/data'
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

function buildEmbedCode(token: string, position: string, apiBase: string): string {
  const api = apiBase ? ` data-api="${apiBase}"` : ''
  return `<script
  src="https://cdn.toolstoy.app/widget.js"
  data-persona="${token}"
  data-position="${position.toLowerCase().replace(/\s/g, '-')}"${api}
></script>`
}

interface KnowledgeItemRecord {
  id: string
  personaId: string
  question: string
  answer: string
  source?: string | null
  approved?: boolean | null
}

export function EditCharacterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [persona, setPersona] = useState<PersonaRecord | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeItemRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'knowledge' | 'widget'>('details')

  const [name, setName] = useState('')
  const [catchphrase, setCatchphrase] = useState('')
  const [greeting, setGreeting] = useState('')
  const [seriousness, setSeriousness] = useState(50)
  const [formality, setFormality] = useState(50)
  const [reservedness, setReservedness] = useState(50)
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [detailsSaved, setDetailsSaved] = useState(false)

  const [qaSearch, setQaSearch] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  const [widgetLayout, setWidgetLayout] = useState('Side by Side')
  const [widgetPosition, setWidgetPosition] = useState('Bottom Right')
  const [widgetTrigger, setWidgetTrigger] = useState('delay')
  const [widgetSaving, setWidgetSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    getPersona(id)
      .then((p) => {
        if (p) {
          setPersona(p)
          setName(p.name ?? '')
          setCatchphrase(p.catchphrase ?? '')
          setGreeting(p.greeting ?? '')
          const pers = (p.personality as { seriousness?: number; formality?: number; reservedness?: number }) ?? {}
          setSeriousness(pers.seriousness ?? 50)
          setFormality(pers.formality ?? 50)
          setReservedness(pers.reservedness ?? 50)
          setWidgetLayout(p.widgetLayout ?? 'Side by Side')
          setWidgetPosition(p.widgetPosition ?? 'Bottom Right')
          setWidgetTrigger(
            p.widgetTrigger === '0-seconds' ? 'immediate' : p.widgetTrigger === 'on-click' ? 'click' : 'delay'
          )
        }
      })
      .catch(() => setPersona(null))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    listKnowledgeItems(id).then((items) => setKnowledge(items as KnowledgeItemRecord[]))
  }, [id])

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setDetailsSaving(true)
    setDetailsSaved(false)
    try {
      await updatePersona(id, {
        name: name.trim() || 'Character',
        catchphrase: catchphrase.trim(),
        greeting: greeting.trim(),
        personality: { seriousness, formality, reservedness },
      })
      setPersona((p) => (p ? { ...p, name: name.trim(), catchphrase: catchphrase.trim(), greeting: greeting.trim() } : p))
      setDetailsSaved(true)
      setTimeout(() => setDetailsSaved(false), 2000)
    } catch {
      // error
    } finally {
      setDetailsSaving(false)
    }
  }

  const handleAddQa = async () => {
    if (!id || !newQuestion.trim() || !newAnswer.trim()) return
    try {
      const item = await createKnowledgeItem(id, newQuestion.trim(), newAnswer.trim())
      setKnowledge((prev) => [...prev, item as KnowledgeItemRecord])
      setNewQuestion('')
      setNewAnswer('')
    } catch {
      // error
    }
  }

  const handleDeleteQa = async (itemId: string) => {
    try {
      await deleteKnowledgeItem(itemId)
      setKnowledge((prev) => prev.filter((k) => k.id !== itemId))
    } catch {
      // error
    }
  }

  const handleSaveWidget = async () => {
    if (!id) return
    setWidgetSaving(true)
    try {
      const triggerMap: Record<string, string> = {
        immediate: '0-seconds',
        delay: '45-seconds',
        click: 'on-click',
      }
      await updatePersona(id, {
        widgetLayout: widgetLayout,
        widgetPosition: widgetPosition,
        widgetTrigger: triggerMap[widgetTrigger] ?? widgetTrigger,
      })
      setPersona((p) =>
        p ? { ...p, widgetLayout, widgetPosition, widgetTrigger: triggerMap[widgetTrigger] ?? widgetTrigger } : p
      )
    } catch {
      // error
    } finally {
      setWidgetSaving(false)
    }
  }

  const filteredKnowledge = knowledge.filter(
    (k) =>
      !qaSearch ||
      k.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
      k.answer.toLowerCase().includes(qaSearch.toLowerCase())
  )

  const embedToken = persona?.embedToken ?? 'ts_xxxxxxxxxxxxxxxx'
  const embedCode = buildEmbedCode(embedToken, widgetPosition, API_BASE)

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!id) {
    navigate('/dashboard/characters', { replace: true })
    return null
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-[#F5F5F5] min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse w-full max-w-2xl h-96 bg-[#E5E7EB] rounded-lg" />
      </div>
    )
  }

  if (!persona) {
    return (
      <div className="p-8 bg-[#F5F5F5] min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-[15px] text-[#6B7280]">Character not found.</p>
        <Link to="/dashboard/characters" className="mt-4 text-[14px] text-[#1A1A1A] font-medium underline">
          Back to Characters
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'knowledge' as const, label: 'Knowledge Base' },
    { id: 'widget' as const, label: 'Widget' },
  ]

  return (
    <div className="p-6 md:p-8 bg-[#F5F5F5]">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/dashboard/characters"
          className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium"
        >
          Back
        </Link>
        <h2 className="font-bold text-[22px] text-[#1A1A1A]">Edit {persona.name ?? 'Character'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-8">
        {/* Left - Settings */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="flex border-b border-[#E5E7EB]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-3 font-medium text-[14px] transition-colors border-b-2 -mb-px ${
                  activeTab === t.id
                    ? 'text-[#1A1A1A] border-[#1A1A1A]'
                    : 'text-[#6B7280] border-transparent hover:text-[#1A1A1A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'details' && (
              <form onSubmit={handleSaveDetails} className="space-y-5">
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Character name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Signature Phrase</label>
                  <input
                    value={catchphrase}
                    onChange={(e) => setCatchphrase(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                    placeholder="One thing only this character would say..."
                  />
                </div>
                <div>
                  <label className="block font-medium text-[13px] text-[#1A1A1A] mb-1.5">Greeting</label>
                  <textarea
                    rows={3}
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                    placeholder="How does your character greet visitors?"
                  />
                </div>
                <div>
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
                <button
                  type="submit"
                  disabled={detailsSaving}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
                >
                  {detailsSaving ? 'Saving...' : detailsSaved ? 'Saved' : 'Save Details'}
                </button>
              </form>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={qaSearch}
                  onChange={(e) => setQaSearch(e.target.value)}
                  placeholder="Search Q&A pairs..."
                  className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                />
                <div className="space-y-2">
                  {filteredKnowledge.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-start gap-2 p-3 border border-[#E5E7EB] rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] text-[#1A1A1A]">{k.question}</p>
                        <p className="mt-0.5 text-[12px] text-[#6B7280]">{k.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQa(k.id)}
                        className="text-[#EF4444] hover:bg-[#FEF2F2] p-1.5 rounded shrink-0"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                  <p className="font-medium text-[13px] text-[#1A1A1A]">Add new Q&A pair</p>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Question"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Answer"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQa}
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    className="flex items-center gap-1.5 text-[#22C55E] font-medium text-[13px] hover:underline disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add pair
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'widget' && (
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">Widget layout</label>
                  <div className="flex flex-wrap gap-2">
                    {LAYOUTS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setWidgetLayout(l)}
                        type="button"
                        className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
                          widgetLayout === l ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">Position</label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setWidgetPosition(p)}
                        type="button"
                        className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
                          widgetPosition === p ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">Trigger</label>
                  <div className="space-y-2">
                    {TRIGGERS.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trigger"
                          checked={widgetTrigger === t.id}
                          onChange={() => setWidgetTrigger(t.id)}
                          className="w-4 h-4 text-[#1A1A1A]"
                        />
                        <span className="text-[14px] text-[#1A1A1A]">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[14px] text-[#1A1A1A] mb-2">Embed code</label>
                  <pre className="p-4 bg-[#1A1A1A] rounded-lg text-[#22C55E] text-[12px] font-mono overflow-x-auto">
                    {embedCode}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="mt-2 border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#F5F5F5]"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveWidget}
                  disabled={widgetSaving}
                  className="bg-[#1A1A1A] text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
                >
                  {widgetSaving ? 'Saving...' : 'Save Widget Settings'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right - Preview */}
        <div className="lg:order-2">
          <div className="bg-[#1A1A1A] rounded-lg p-6 min-h-[400px] flex flex-col">
            {persona.imageUrl ? (
              <img
                src={persona.imageUrl}
                alt=""
                className="w-full max-h-[240px] object-contain rounded-md"
              />
            ) : (
              <div className="w-full h-48 bg-[#2A2A2A] rounded-lg flex items-center justify-center text-[#6B7280] text-[13px]">
                [ Character image ]
              </div>
            )}
            <h3 className="mt-4 font-bold text-[18px] text-white">{persona.name ?? 'Character'}</h3>
            <p className="text-[13px] text-[#6B7280]">{persona.characterType ?? persona.productName ?? '—'}</p>
            <div className="mt-4 p-3 bg-[#2A2A2A] rounded-lg">
              <p className="text-[12px] text-[#6B7280] mb-1">Greeting</p>
              <p className="text-[14px] text-white">
                {greeting || persona.greeting || 'Hi there! Ask me anything about this product.'}
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#2A2A2A] rounded-lg">
              <p className="text-[12px] text-[#6B7280] mb-1">Sample exchange</p>
              <p className="text-[13px] text-white">Visitor: Is this waterproof?</p>
              <p className="text-[13px] text-[#22C55E] mt-1">Character: Absolutely. Rated IPX7...</p>
            </div>
            <button
              type="button"
              className="mt-6 border border-white/30 text-white font-medium text-[13px] px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Regenerate Image
            </button>
            <p className="mt-1.5 text-[12px] text-[#6B7280]">Image regeneration uses 1 credit.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
