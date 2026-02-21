import { useState } from 'react'
import { Link } from 'react-router-dom'

const FILTERS = ['All', 'Live', 'Processing', 'Draft', 'Paused']

const CHARACTERS = [
  { name: 'Character Name', productType: 'Power Tool', status: 'live', conversations: 247, quality: '8.6/10' },
  { name: 'Character Name', productType: 'Coffee Machine', status: 'live', conversations: 189, quality: '8.2/10' },
  { name: 'Character Name', productType: 'Running Shoe', status: 'live', conversations: 312, quality: '8.9/10' },
  { name: 'Character Name', productType: 'Bluetooth Speaker', status: 'processing', processing: true },
  { name: 'Character Name', productType: 'Desk Lamp', status: 'draft' },
  { name: 'Character Name', productType: 'Yoga Mat', status: 'paused', conversations: 45, quality: '7.8/10' },
]

export function MyCharacters() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [isEmpty] = useState(false)

  if (isEmpty) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-full bg-[#E5E7EB] flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="font-semibold text-xl text-[#1A1A1A]">No characters yet.</h3>
        <p className="mt-2 text-[15px] text-[#6B7280] text-center">
          Your products are living anonymous lives.
        </p>
        <Link
          to="/dashboard/studio"
          className="mt-5 bg-[#1A1A1A] text-white font-semibold text-[15px] px-6 py-3 rounded-lg hover:opacity-90"
        >
          Create Your First Character
        </Link>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-bold text-2xl text-[#1A1A1A]">My Characters</h2>
        <Link
          to="/dashboard/studio"
          className="border-[1.5px] border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-[#FAFAFA] w-fit"
        >
          Create New
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-2 rounded-full font-medium text-[13px] transition-all ${
              activeFilter === f
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHARACTERS.map((char, i) => (
          <div
            key={i}
            className="relative bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          >
            {/* 3-dot menu */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setMenuOpen(menuOpen === i ? null : i)}
                className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#1A1A1A] rounded"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="6" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="18" r="1.5" />
                </svg>
              </button>
              {menuOpen === i && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(null)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50">
                    <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg">
                      Edit
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg">
                      Duplicate
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg">
                      Pause
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-[14px] text-[#EF4444] hover:bg-[#F5F5F5] rounded-lg">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative h-40 bg-[#1A1A1A] flex items-center justify-center">
              {'processing' in char && char.processing ? (
                <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]/80" />
              ) : null}
              <span className="text-[13px] text-[#6B7280]">[ Character ]</span>
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
                {char.status === 'live' && '● Live'}
                {char.status === 'processing' && '⟳ Processing'}
                {char.status === 'draft' && '○ Draft'}
                {char.status === 'paused' && '⏸ Paused'}
              </span>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-[15px] text-[#1A1A1A]">{char.name}</h4>
              <p className="text-[13px] text-[#6B7280]">{char.productType}</p>
              {'processing' in char && char.processing ? (
                <p className="mt-2.5 text-[13px] text-[#6B7280]">Generating your character...</p>
              ) : char.status !== 'draft' ? (
                <p className="mt-2.5 text-[12px] text-[#6B7280]">
                  {'conversations' in char && char.conversations} conversations
                  {'quality' in char && char.quality && ` · ${char.quality} quality`}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <Link
                  to="/dashboard/studio"
                  className="border border-[#E5E7EB] rounded-lg px-3.5 py-1.5 font-medium text-[13px] text-[#1A1A1A] hover:bg-[#F5F5F5]"
                >
                  Edit
                </Link>
                <a href="#" className="text-[13px] text-[#6B7280] font-medium hover:text-[#1A1A1A]">
                  View Widget
                </a>
                <a href="#" className="text-[13px] text-[#6B7280] font-medium hover:text-[#1A1A1A]">
                  Get Embed Code
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
