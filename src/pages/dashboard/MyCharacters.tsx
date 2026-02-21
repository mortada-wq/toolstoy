import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePersonas } from '@/hooks/usePersonas'
import { useMerchant } from '@/hooks/useMerchant'
import { deletePersona } from '@/lib/data'

const FILTERS = ['All', 'Live', 'Processing', 'Draft', 'Paused']

export function MyCharacters() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
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

  if (personas.length === 0 && !isLoading && !error) {
    return (
      <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 flex items-center justify-center mb-6 text-[#E5E7EB]">
          <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="font-semibold text-[20px] text-[#1A1A1A]">No characters yet.</h3>
        <p className="mt-2 text-[15px] text-[#6B7280] text-center">
          Your products are living anonymous lives.
        </p>
        <Link
          to={createLink}
          className="mt-5 bg-[#1A1A1A] text-white font-semibold text-[15px] px-6 py-3 rounded-lg hover:opacity-90"
        >
          {atCharLimit ? 'Upgrade to Create' : 'Create Your First Character'}
        </Link>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-2xl text-[#1A1A1A]">My Characters</h2>
        <Link
          to={createLink}
          className="border-[1.5px] border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-[#FAFAFA] w-fit"
        >
          {atCharLimit ? 'Upgrade to Create' : 'Create New'}
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-[#EF4444]">Couldn&apos;t load characters. Try refreshing.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
              activeFilter === f ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <div className="h-40 bg-[#F5F5F5] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[#F5F5F5] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-[#F5F5F5] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((char, i) => (
            <div
              key={char.id}
              className="relative bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => setMenuOpen(menuOpen === i ? null : i)}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] rounded-lg transition-all duration-200"
                  aria-label="Menu"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </button>
                {menuOpen === i && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50">
                      <Link
                        to={`/dashboard/characters/${char.id}/edit`}
                        className="block px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg transition-all duration-200"
                        onClick={() => setMenuOpen(null)}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg transition-all duration-200"
                        onClick={() => setMenuOpen(null)}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg transition-all duration-200"
                        onClick={() => setMenuOpen(null)}
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-[14px] text-[#EF4444] hover:bg-[#F5F5F5] rounded-lg transition-all duration-200"
                        onClick={() => {
                          setMenuOpen(null)
                          setConfirmDeleteId(char.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="relative h-40 bg-[#1A1A1A] flex items-center justify-center">
                {char.status === 'processing' && (
                  <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]/80" />
                )}
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] text-[#6B7280]">[ Character ]</span>
                )}
                <span
                  className={`absolute top-2.5 left-2.5 font-medium text-[11px] px-2.5 py-1 rounded-full ${
                    char.status === 'live'
                      ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                      : char.status === 'processing'
                      ? 'bg-[rgba(245,158,11,0.15)] text-[#D97706]'
                      : char.status === 'draft'
                      ? 'bg-[#F5F5F5] text-[#6B7280]'
                      : 'bg-[rgba(245,158,11,0.15)] text-[#D97706]'
                  }`}
                >
                  {char.status === 'live' && 'Live'}
                  {char.status === 'processing' && 'Processing'}
                  {char.status === 'draft' && 'Draft'}
                  {(char.status === 'paused' || (!char.status && char.status !== 'draft')) && 'Paused'}
                </span>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-[15px] text-[#1A1A1A]">{char.name ?? 'Character'}</h4>
                <p className="text-[13px] text-[#6B7280]">{char.productName ?? '—'}</p>
                {char.status === 'processing' ? (
                  <p className="mt-2.5 text-[13px] text-[#6B7280]">Generating your character...</p>
                ) : char.status !== 'draft' ? (
                  <p className="mt-2.5 text-[12px] text-[#6B7280]">0 conversations</p>
                ) : null}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <Link
                    to={`/dashboard/characters/${char.id}/edit`}
                    className="border border-[#1A1A1A] bg-white text-[#1A1A1A] rounded-lg px-3.5 py-2 font-medium text-[14px] min-h-[44px] flex items-center transition-all duration-200 hover:bg-[#F5F5F5]"
                  >
                    Edit
                  </Link>
                  <Link
                    to="/dashboard/widget"
                    className="text-[14px] text-[#6B7280] font-medium hover:text-[#1A1A1A] transition-all duration-200"
                  >
                    View Widget
                  </Link>
                  <Link
                    to="/dashboard/widget"
                    className="text-[14px] text-[#6B7280] font-medium hover:text-[#1A1A1A] transition-all duration-200"
                  >
                    Get Embed Code
                  </Link>
                </div>

                {confirmDeleteId === char.id && (
                  <div className="mt-4 p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
                    <p className="text-[13px] text-[#1A1A1A]">Are you sure? This cannot be undone.</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[13px] text-[#6B7280] font-medium hover:text-[#1A1A1A]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(char.id)}
                        disabled={!!deletingId}
                        className="text-[13px] text-[#EF4444] font-medium hover:underline disabled:opacity-60"
                      >
                        {deletingId === char.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
