import { Link } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { usePersonas } from '@/hooks/usePersonas'

const ACTIVITY = [
  { icon: 'chat', text: 'A customer asked about product durability', time: '2 minutes ago' },
  { icon: 'sparkle', text: 'Character finished generating', time: '1 hour ago' },
  { icon: 'chart', text: '7 new knowledge gap suggestions ready', time: '3 hours ago' },
  { icon: 'chat', text: '143 conversations happened today', time: 'Today at 9:00 AM' },
  { icon: 'rocket', text: 'Widget installed on yourstore.com', time: 'Yesterday' },
]

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <div className="h-40 bg-[#F5F5F5] animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-[#F5F5F5] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[#F5F5F5] rounded animate-pulse" />
      </div>
    </div>
  )
}

export function MerchantDashboard() {
  const { user } = useUser()
  const { personas, isLoading, error } = usePersonas()
  const liveCount = personas.filter((p) => p.status === 'live').length
  const displayName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-5 md:p-8">
      <h2 className="font-bold text-[28px] text-[#1A1A1A]">
        Good morning, {displayName}.
      </h2>
      <p className="mt-1 text-[15px] text-[#6B7280] font-normal">
        Here&apos;s what your characters have been up to.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">Active Characters</p>
          <p className="mt-2 font-bold text-[36px] text-[#1A1A1A]">{isLoading ? '–' : liveCount}</p>
          <p className="mt-1.5 text-[13px] text-[#22C55E]">Live on your site</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">Conversations</p>
          <p className="mt-2 font-bold text-[36px] text-[#1A1A1A]">0</p>
          <p className="mt-1.5 text-[13px] text-[#6B7280]">Start chatting to see</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">Response Quality</p>
          <p className="mt-2 font-bold text-[36px] text-[#1A1A1A]">–</p>
          <p className="mt-1.5 text-[13px] text-[#6B7280]">Based on conversations</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">Knowledge Gaps</p>
          <p className="mt-2 font-bold text-[36px] text-[#EF4444]">0</p>
          <p className="mt-1.5 text-[13px] text-[#6B7280]">None yet</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">My Characters</h3>
        <Link to="/dashboard/characters" className="text-[14px] text-[#6B7280] font-normal hover:text-[#1A1A1A] transition-all duration-200">
          View All →
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-[#EF4444]">
          Couldn&apos;t load your data. Try refreshing.
        </p>
      )}

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.slice(0, 3).map((char) => (
            <div
              key={char.id}
              className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="relative h-40 bg-[#1A1A1A] flex items-center justify-center">
                {char.status === 'processing' && (
                  <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]/80" />
                )}
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] text-[#6B7280] font-normal">[ Character ]</span>
                )}
                <span
                  className={`absolute top-2.5 left-2.5 font-medium text-[11px] px-2.5 py-1 rounded-full ${
                    char.status === 'live'
                      ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                      : char.status === 'processing'
                      ? 'bg-[rgba(245,158,11,0.15)] text-[#D97706]'
                      : 'bg-[#F5F5F5] text-[#6B7280]'
                  }`}
                >
                  {char.status === 'live' ? 'Live' : char.status === 'processing' ? 'Processing' : 'Draft'}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-[15px] text-[#1A1A1A]">{char.name ?? 'Character'}</h4>
                <p className="text-[13px] text-[#6B7280] font-normal">{char.productName ?? '—'}</p>
                <div className="mt-2.5 flex gap-3 text-[12px] text-[#6B7280] font-normal">
                  {char.status === 'processing' ? (
                    <span>Generating your character...</span>
                  ) : char.status !== 'draft' ? (
                    <>
                      <span>0 conversations</span>
                      <span>·</span>
                      <span>— quality</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <Link
                    to={`/dashboard/characters/${char.id}/edit`}
                    className="border border-[#1A1A1A] bg-white text-[#1A1A1A] rounded-lg px-3.5 py-1.5 font-medium text-[14px] min-h-[44px] flex items-center transition-all duration-200 hover:bg-[#F5F5F5]"
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
              </div>
            </div>
          ))}
          {personas.length === 0 && !error && (
            <div className="col-span-full text-center py-12 text-[#6B7280]">
              No characters yet. <Link to="/dashboard/studio" className="text-[#1A1A1A] underline">Create your first</Link>.
            </div>
          )}
        </div>
      )}

      <h3 className="mt-8 font-semibold text-[17px] text-[#1A1A1A]">Recent Activity</h3>
      <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {ACTIVITY.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-5 py-3.5 ${i < ACTIVITY.length - 1 ? 'border-b border-[#F5F5F5]' : ''}`}
          >
            <div className="w-[34px] h-[34px] rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A] shrink-0">
              {item.icon === 'chat' && (
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {item.icon === 'sparkle' && (
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {item.icon === 'chart' && (
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {item.icon === 'rocket' && (
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-[14px] text-[#1A1A1A] font-normal">{item.text}</p>
              <p className="text-[12px] text-[#6B7280] font-normal mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-[#E5E7EB] border-l-[3px] border-l-[#F59E0B] rounded-lg p-5 md:px-6">
        <h4 className="font-semibold text-[15px] text-[#1A1A1A]">Knowledge Gaps</h4>
        <p className="mt-1.5 text-[14px] text-[#6B7280] font-normal">
          When your character gets stuck, suggested answers appear here.
        </p>
        <Link
          to="/dashboard/analytics"
          className="mt-3 inline-block border-[1.5px] border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#FAFAFA]"
        >
          Review Suggestions
        </Link>
      </div>
    </div>
  )
}
