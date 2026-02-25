import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreVertical, Pencil, Copy, PauseCircle, Trash2 } from 'lucide-react'
import { usePersonas } from '@/hooks/usePersonas'
import { useMerchant } from '@/hooks/useMerchant'
import { deletePersona } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

// Status → badge variant mapping (no green/red in design system)
function statusBadge(status: string | undefined) {
  switch (status) {
    case 'live':       return <Badge variant="teal">Live</Badge>
    case 'processing': return <Badge variant="orange">Processing</Badge>
    case 'draft':      return <Badge variant="neutral">Draft</Badge>
    case 'paused':     return <Badge variant="neutral">Paused</Badge>
    default:           return <Badge variant="neutral">Draft</Badge>
  }
}

const FILTERS = ['All', 'Live', 'Processing', 'Draft', 'Paused']

export function MyCharacters() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { personas, isLoading, error } = usePersonas()
  const { merchant } = useMerchant()
  const charLimit = merchant?.plan_limits?.characters ?? 1
  const atCharLimit = charLimit > 0 && personas.length >= charLimit
  const createLink = atCharLimit ? '/dashboard/billing' : '/dashboard/studio'

  const filtered = personas.filter((p) => {
    if (activeFilter === 'All') return true
    return (p.status ?? 'draft').toLowerCase() === activeFilter.toLowerCase()
  })

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deletePersona(id)
      setConfirmDeleteId(null)
    } catch {
      // keep confirm open on error
    } finally {
      setDeletingId(null)
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (personas.length === 0 && !isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <span className="w-16 h-16 rounded-full bg-bg-overlay flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-steel-blue" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </span>
        <h3 className="font-bold text-ds-lg text-cream">No characters yet.</h3>
        <p className="mt-2 text-ds-base text-slate-text text-center max-w-sm">
          Your products are living anonymous lives. Time to give them a voice.
        </p>
        <Button to={createLink} size="lg" className="mt-8">
          {atCharLimit ? 'Upgrade to Create' : 'Create Your First Character'}
        </Button>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-ds-xl text-cream">My Characters</h2>
        <Button to={createLink} size="sm">
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          {atCharLimit ? 'Upgrade to Create' : 'Create New'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-ds-sm text-coral">Couldn&apos;t load characters. Try refreshing.</p>
      )}

      {/* Filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={[
              'px-4 py-2 rounded-full font-medium text-ds-sm transition-all duration-normal',
              activeFilter === f
                ? 'bg-teal/15 text-teal border border-teal/25'
                : 'bg-bg-overlay text-slate-text border border-border/15 hover:text-cream',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} flush className="overflow-hidden">
              <div className="h-40 bg-bg-overlay animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-3/4 bg-bg-overlay rounded-md animate-pulse" />
                <div className="h-3 w-1/2 bg-bg-overlay rounded-md animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((char) => (
            <Card key={char.id} flush className="overflow-hidden">
              {/* Card image / header */}
              <div className="relative h-40 bg-bg-overlay flex items-center justify-center">
                {char.status === 'processing' && (
                  <div className="absolute inset-0 bg-bg-primary/60 animate-pulse" />
                )}
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Avatar
                    initials={(char.name ?? 'C').slice(0, 2)}
                    size="xl"
                    ring
                  />
                )}
                {/* Status badge */}
                <span className="absolute top-3 left-3">
                  {statusBadge(char.status)}
                </span>
                {/* 3-dot menu */}
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(menuOpen === char.id ? null : char.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-secondary/80 text-slate-text hover:text-cream transition-colors"
                    aria-label="Options"
                  >
                    <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                  </button>

                  {menuOpen === char.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} aria-hidden="true" />
                      <div className="absolute right-0 top-full mt-2 w-44 bg-bg-overlay border border-border/15 rounded-lg shadow-md py-1 z-50">
                        <Link
                          to={`/dashboard/characters/${char.id}/edit`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-ds-sm text-slate-text hover:text-cream hover:bg-bg-secondary/60 transition-colors"
                          onClick={() => setMenuOpen(null)}
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-ds-sm text-slate-text hover:text-cream hover:bg-bg-secondary/60 transition-colors"
                          onClick={() => setMenuOpen(null)}
                        >
                          <Copy className="w-4 h-4" strokeWidth={1.5} />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-ds-sm text-slate-text hover:text-cream hover:bg-bg-secondary/60 transition-colors"
                          onClick={() => setMenuOpen(null)}
                        >
                          <PauseCircle className="w-4 h-4" strokeWidth={1.5} />
                          Pause
                        </button>
                        <div className="my-1 h-px bg-border/10" />
                        <button
                          type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-ds-sm text-coral hover:bg-bg-secondary/60 transition-colors"
                          onClick={() => {
                            setMenuOpen(null)
                            setConfirmDeleteId(char.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-6">
                <h4 className="font-semibold text-ds-base text-cream truncate">{char.name ?? 'Character'}</h4>
                <p className="text-ds-sm text-steel-blue truncate">{char.productName ?? '—'}</p>

                {char.status === 'processing' && (
                  <p className="mt-2 text-ds-sm text-slate-text">Generating your character...</p>
                )}
                {char.status === 'live' && (
                  <p className="mt-2 text-ds-sm text-slate-text">0 conversations</p>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    to={`/dashboard/characters/${char.id}/edit`}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Link
                    to="/dashboard/widget"
                    className="text-ds-sm text-steel-blue font-medium hover:text-cream transition-colors duration-normal"
                  >
                    Get Embed Code
                  </Link>
                </div>

                {/* Confirm delete */}
                {confirmDeleteId === char.id && (
                  <div className="mt-4 p-4 bg-coral/10 border border-coral/25 rounded-lg">
                    <p className="text-ds-sm text-cream">Delete this character? This cannot be undone.</p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-ds-sm text-slate-text font-medium hover:text-cream transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(char.id)}
                        disabled={!!deletingId}
                        className="text-ds-sm text-coral font-semibold hover:underline disabled:opacity-50 transition-colors"
                      >
                        {deletingId === char.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
