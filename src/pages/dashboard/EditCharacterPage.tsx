import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import {
  getPersona,
  updatePersona,
  listKnowledgeItems,
  createKnowledgeItem,
  deleteKnowledgeItem,
} from '@/lib/data'
import type { PersonaRecord } from '@/lib/data'
import outputs from '../../../amplify_outputs.json'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

const API_BASE =
  (outputs as { custom?: { API?: Record<string, { endpoint?: string }> } }).custom?.API
    ?.ToolstoyApi?.endpoint?.replace(/\/$/, '') ?? ''

const LAYOUTS = ['Side by Side', 'Character Top', 'Chat Focus', 'Mirror', 'Immersive', 'Compact', 'Cinematic']
const POSITIONS = ['Bottom Right', 'Bottom Left', 'Top Right', 'Top Left']
const TRIGGERS = [
  { id: 'immediate', label: 'Open immediately on page load' },
  { id: 'delay',     label: 'Open after 45 seconds' },
  { id: 'click',     label: 'Wait for customer to click' },
]

function buildEmbedCode(token: string, position: string, apiBase: string): string {
  const api = apiBase ? ` data-api="${apiBase}"` : ''
  return `<script\n  src="https://cdn.toolstoy.app/widget.js"\n  data-persona="${token}"\n  data-position="${position.toLowerCase().replace(/\s/g, '-')}"${api}\n></script>`
}

interface KnowledgeItemRecord {
  id: string
  personaId: string
  question: string
  answer: string
  source?: string | null
  approved?: boolean | null
}

// ── Personality slider ─────────────────────────────────────────────────────
function PersonalitySlider({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-ds-sm text-steel-blue text-right">{leftLabel}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={[
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-bg-overlay',
            // Webkit thumb — orange, circle
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-orange',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-secondary',
            '[&::-webkit-slider-thumb]:shadow-orange-glow/50',
            // Firefox thumb
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-orange',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-secondary',
          ].join(' ')}
          style={{
            background: `linear-gradient(to right, #FF7A2F ${value}%, #1E2330 ${value}%)`,
          }}
        />
      </div>
      <span className="w-24 text-ds-sm text-steel-blue">{rightLabel}</span>
    </div>
  )
}

// ── Teal toggle switch ─────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-10 h-6 rounded-full transition-colors duration-normal',
          checked ? 'bg-teal' : 'bg-bg-overlay border border-border/25',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 w-4 h-4 rounded-full bg-cream shadow-sm transition-transform duration-normal',
            checked ? 'translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
      <span className="text-ds-sm text-slate-text">{label}</span>
    </label>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
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
            p.widgetTrigger === '0-seconds' ? 'immediate' : p.widgetTrigger === 'on-click' ? 'click' : 'delay',
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
      // silent — could wire up error state
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
    } catch { /* silent */ }
  }

  const handleDeleteQa = async (itemId: string) => {
    try {
      await deleteKnowledgeItem(itemId)
      setKnowledge((prev) => prev.filter((k) => k.id !== itemId))
    } catch { /* silent */ }
  }

  const handleSaveWidget = async () => {
    if (!id) return
    setWidgetSaving(true)
    try {
      const triggerMap: Record<string, string> = { immediate: '0-seconds', delay: '45-seconds', click: 'on-click' }
      await updatePersona(id, {
        widgetLayout,
        widgetPosition,
        widgetTrigger: triggerMap[widgetTrigger] ?? widgetTrigger,
      })
      setPersona((p) => p ? { ...p, widgetLayout, widgetPosition, widgetTrigger: triggerMap[widgetTrigger] ?? widgetTrigger } : p)
    } catch { /* silent */ } finally {
      setWidgetSaving(false)
    }
  }

  const filteredKnowledge = knowledge.filter(
    (k) =>
      !qaSearch ||
      k.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
      k.answer.toLowerCase().includes(qaSearch.toLowerCase()),
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

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="p-8 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Not found ──
  if (!persona) {
    return (
      <div className="p-8 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-ds-base text-slate-text">Character not found.</p>
        <Button to="/dashboard/characters" variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Back to Characters
        </Button>
      </div>
    )
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'details',   label: 'Details' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'widget',    label: 'Widget' },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Back + title */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard/characters"
          className="flex items-center gap-1.5 text-ds-sm text-steel-blue font-medium hover:text-cream transition-colors duration-normal"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </Link>
        <span className="text-border/20">/</span>
        <h2 className="font-bold text-ds-xl text-cream">Edit {persona.name ?? 'Character'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-8">
        {/* ── Left: settings panel ── */}
        <Card flush>
          {/* Tabs */}
          <div className="flex border-b border-border/15">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={[
                  'px-6 py-4 font-medium text-ds-sm transition-all duration-normal border-b-2 -mb-px',
                  activeTab === t.id
                    ? 'text-cream border-teal'
                    : 'text-steel-blue border-transparent hover:text-slate-text',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Details tab ── */}
            {activeTab === 'details' && (
              <form onSubmit={handleSaveDetails} className="space-y-6">
                <Input
                  label="Character name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                />
                <Input
                  label="Signature Phrase"
                  value={catchphrase}
                  onChange={(e) => setCatchphrase(e.target.value)}
                  placeholder="One thing only this character would say…"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-ds-sm font-medium text-cream">Greeting</label>
                  <textarea
                    rows={3}
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    placeholder="How does your character greet visitors?"
                    className="w-full bg-bg-overlay border border-border/25 rounded-md py-3 px-4 text-ds-base text-cream placeholder:text-steel-blue focus:outline-none focus:border-teal/60 focus:ring-2 focus:ring-teal/15 transition-all duration-normal resize-none"
                  />
                </div>

                <div>
                  <p className="text-ds-sm font-semibold text-cream mb-4">Personality Dials</p>
                  <div className="space-y-5">
                    <PersonalitySlider leftLabel="Serious"   rightLabel="Playful"      value={seriousness}  onChange={setSeriousness} />
                    <PersonalitySlider leftLabel="Formal"    rightLabel="Casual"        value={formality}    onChange={setFormality} />
                    <PersonalitySlider leftLabel="Reserved"  rightLabel="Enthusiastic"  value={reservedness} onChange={setReservedness} />
                  </div>
                </div>

                <Button type="submit" disabled={detailsSaving} size="md">
                  {detailsSaving ? 'Saving…' : detailsSaved ? 'Saved ✓' : 'Save Details'}
                </Button>
              </form>
            )}

            {/* ── Knowledge tab ── */}
            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <Input
                  placeholder="Search Q&A pairs…"
                  value={qaSearch}
                  onChange={(e) => setQaSearch(e.target.value)}
                />

                <div className="space-y-2">
                  {filteredKnowledge.map((k) => (
                    <div key={k.id} className="flex items-start gap-3 p-4 bg-bg-overlay rounded-md border border-border/15">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ds-sm text-cream">{k.question}</p>
                        <p className="mt-1 text-ds-sm text-slate-text">{k.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQa(k.id)}
                        className="text-coral hover:text-coral/70 p-1.5 rounded transition-colors shrink-0"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/15 pt-6 space-y-3">
                  <p className="font-medium text-ds-sm text-cream">Add new Q&amp;A pair</p>
                  <Input
                    placeholder="Question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <Input
                    placeholder="Answer"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddQa}
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                  >
                    + Add pair
                  </Button>
                </div>
              </div>
            )}

            {/* ── Widget tab ── */}
            {activeTab === 'widget' && (
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-ds-sm text-cream mb-3">Layout</p>
                  <div className="flex flex-wrap gap-2">
                    {LAYOUTS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setWidgetLayout(l)}
                        className={[
                          'px-4 py-2 rounded-full font-medium text-ds-sm transition-all duration-normal border',
                          widgetLayout === l
                            ? 'bg-teal/15 text-teal border-teal/25'
                            : 'bg-bg-overlay text-slate-text border-border/15 hover:text-cream',
                        ].join(' ')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-ds-sm text-cream mb-3">Position</p>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setWidgetPosition(p)}
                        className={[
                          'px-4 py-2 rounded-full font-medium text-ds-sm transition-all duration-normal border',
                          widgetPosition === p
                            ? 'bg-teal/15 text-teal border-teal/25'
                            : 'bg-bg-overlay text-slate-text border-border/15 hover:text-cream',
                        ].join(' ')}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-ds-sm text-cream mb-3">Trigger</p>
                  <div className="space-y-3">
                    {TRIGGERS.map((t) => (
                      <Toggle
                        key={t.id}
                        checked={widgetTrigger === t.id}
                        onChange={() => setWidgetTrigger(t.id)}
                        label={t.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-ds-sm text-cream mb-3">Embed code</p>
                  <pre className="p-4 bg-bg-overlay rounded-md text-teal text-ds-sm font-mono overflow-x-auto border border-border/15 whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="mt-3 flex items-center gap-2 text-ds-sm text-steel-blue font-medium hover:text-cream transition-colors duration-normal"
                  >
                    {copied
                      ? <><Check className="w-4 h-4 text-teal" strokeWidth={1.5} /> Copied</>
                      : <><Copy className="w-4 h-4" strokeWidth={1.5} /> Copy code</>
                    }
                  </button>
                </div>

                <Button type="button" onClick={handleSaveWidget} disabled={widgetSaving}>
                  {widgetSaving ? 'Saving…' : 'Save Widget Settings'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* ── Right: character preview ── */}
        <div className="lg:order-2">
          <Card className="min-h-[400px] flex flex-col">
            <Avatar
              src={persona.imageUrl}
              initials={(persona.name ?? 'C').slice(0, 2)}
              size="xl"
              ring
              className="mx-auto"
            />
            {!persona.imageUrl && (
              <div className="w-full h-48 bg-bg-overlay rounded-md flex items-center justify-center text-steel-blue text-ds-sm mt-4">
                [ Character image ]
              </div>
            )}
            {persona.imageUrl && (
              <img
                src={persona.imageUrl}
                alt=""
                className="mt-4 w-full max-h-[240px] object-contain rounded-md"
              />
            )}

            <h3 className="mt-4 font-bold text-ds-md text-cream">{persona.name ?? 'Character'}</h3>
            <p className="text-ds-sm text-steel-blue">{persona.characterType ?? persona.productName ?? '—'}</p>

            {/* Greeting preview */}
            <div className="mt-4 p-4 bg-bg-overlay rounded-md">
              <p className="text-ds-xs text-steel-blue mb-1 uppercase tracking-wider">Greeting</p>
              <p className="text-ds-sm text-cream">
                {greeting || persona.greeting || 'Hi there! Ask me anything about this product.'}
              </p>
            </div>

            {/* Sample exchange */}
            <div className="mt-4 p-4 bg-bg-overlay rounded-md">
              <p className="text-ds-xs text-steel-blue mb-2 uppercase tracking-wider">Sample exchange</p>
              <p className="text-ds-sm text-slate-text">Visitor: Is this waterproof?</p>
              <p className="text-ds-sm text-teal mt-1">Character: Absolutely. Rated IPX7…</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-6 self-start"
            >
              Regenerate Image
            </Button>
            <p className="mt-2 text-ds-xs text-steel-blue">Image regeneration uses 1 credit.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
