import { Link } from 'react-router-dom'

const STATS = [
  { label: 'Active Characters', value: '3', change: '↑ 1 this month', positive: true },
  { label: 'Conversations', value: '1,284', change: '↑ 23% this week', positive: true },
  { label: 'Response Quality', value: '8.4/10', change: '↑ 0.3 this week', positive: true },
  { label: 'Knowledge Gaps', value: '7', change: 'Needs attention', positive: false },
]

const CHARACTERS = [
  { name: 'Character Name', productType: 'Power Tool', status: 'live', conversations: 247, quality: '8.6/10', processing: false },
  { name: 'Character Name', productType: 'Coffee Machine', status: 'live', conversations: 189, quality: '8.2/10', processing: false },
  { name: 'Character Name', productType: 'Running Shoe', status: 'processing', processing: true },
]

const ACTIVITY = [
  { icon: 'chat', text: 'A customer asked about product durability', time: '2 minutes ago' },
  { icon: 'sparkle', text: 'Character finished generating', time: '1 hour ago' },
  { icon: 'chart', text: '7 new knowledge gap suggestions ready', time: '3 hours ago' },
  { icon: 'chat', text: '143 conversations happened today', time: 'Today at 9:00 AM' },
  { icon: 'rocket', text: 'Widget installed on yourstore.com', time: 'Yesterday' },
]

export function MerchantDashboard() {
  return (
    <div className="p-5 md:p-8">
      {/* Welcome */}
      <h2 className="font-bold text-[28px] text-[#1A1A1A]">Good morning, Leo.</h2>
      <p className="mt-1 text-[15px] text-[#6B7280] font-normal">
        Here&apos;s what your characters have been up to.
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          >
            <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
            <p
              className={`mt-2 font-bold text-[36px] ${
                stat.label === 'Knowledge Gaps' ? 'text-[#EF4444]' : 'text-[#1A1A1A]'
              }`}
            >
              {stat.value}
            </p>
            <p
              className={`mt-1.5 text-[13px] ${
                stat.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* My Characters */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">My Characters</h3>
        <Link
          to="/dashboard/characters"
          className="text-[14px] text-[#6B7280] font-normal hover:text-[#1A1A1A]"
        >
          View All →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHARACTERS.map((char) => (
          <div
            key={char.productType}
            className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] group"
          >
            <div className="relative h-40 bg-[#1A1A1A] flex items-center justify-center">
              {char.processing && (
                <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]/80" />
              )}
              <span className="text-[13px] text-[#6B7280] font-normal">[ Character ]</span>
              <span
                className={`absolute top-2.5 left-2.5 font-medium text-[11px] px-2.5 py-1 rounded-full ${
                  char.status === 'live'
                    ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                    : 'bg-[rgba(245,158,11,0.15)] text-[#D97706]'
                }`}
              >
                {char.status === 'live' ? '● Live' : '⟳ Processing'}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-[15px] text-[#1A1A1A]">{char.name}</h4>
              <p className="text-[13px] text-[#6B7280] font-normal">{char.productType}</p>
              <div className="mt-2.5 flex gap-3 text-[12px] text-[#6B7280] font-normal">
                {char.processing ? (
                  <span>Generating your character...</span>
                ) : (
                  <>
                    <span>{char.conversations} conversations</span>
                    <span>·</span>
                    <span>{char.quality} quality</span>
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to="/dashboard/studio"
                  className="border border-[#E5E7EB] rounded-lg px-3.5 py-1.5 font-medium text-[13px] text-[#1A1A1A] hover:bg-[#F5F5F5]"
                >
                  Edit
                </Link>
                <a href="#" className="text-[13px] text-[#6B7280] font-medium hover:text-[#1A1A1A]">
                  View Widget
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h3 className="mt-8 font-semibold text-[17px] text-[#1A1A1A]">Recent Activity</h3>
      <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {ACTIVITY.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-5 py-3.5 ${
              i < ACTIVITY.length - 1 ? 'border-b border-[#F5F5F5]' : ''
            }`}
          >
            <div className="w-[34px] h-[34px] rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A] shrink-0">
              {item.icon === 'chat' && (
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

      {/* Knowledge Gaps Alert */}
      <div className="mt-6 bg-white border border-[#E5E7EB] border-l-[3px] border-l-[#F59E0B] rounded-lg p-5 md:px-6">
        <h4 className="font-semibold text-[15px] text-[#1A1A1A]">7 Knowledge Gaps Detected</h4>
        <p className="mt-1.5 text-[14px] text-[#6B7280] font-normal">
          Your characters received questions they couldn&apos;t answer well. Review AI-suggested responses.
        </p>
        <button className="mt-3 border-[1.5px] border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#FAFAFA]">
          Review Suggestions
        </button>
      </div>
    </div>
  )
}
