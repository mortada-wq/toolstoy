import { useEffect, useState } from 'react'
import { getAdminOverview } from '@/lib/api'

export function AnalyticsPage() {
  const [overview, setOverview] = useState<{
    merchants: number
    personas: number
    conversationsToday: number
    successRate: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAdminOverview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setIsLoading(false))
  }, [])

  const stats = overview ?? {
    merchants: 0,
    personas: 0,
    conversationsToday: 0,
    successRate: 0,
  }

  return (
    <div className="p-5 md:p-8">
      <h2 className="font-bold text-2xl text-[#1A1A1A]">Analytics</h2>
      <p className="mt-1 text-[15px] text-[#6B7280]">
        Conversations, top questions, and knowledge gaps.
      </p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#F5F5F5] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280]">Conversations (7d)</p>
            <p className="mt-2 font-bold text-xl text-[#1A1A1A]">{stats.conversationsToday}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280]">Characters</p>
            <p className="mt-2 font-bold text-xl text-[#1A1A1A]">{stats.personas}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280]">Success Rate</p>
            <p className="mt-2 font-bold text-xl text-[#1A1A1A]">{Math.round(stats.successRate * 100)}%</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280]">Platform merchants</p>
            <p className="mt-2 font-bold text-xl text-[#1A1A1A]">{stats.merchants}</p>
          </div>
        </div>
      )}
      {!overview && !isLoading && (
        <p className="mt-6 text-[14px] text-[#6B7280]">
          Couldn&apos;t load analytics. Try refreshing.
        </p>
      )}

      <div className="mt-8 bg-white border border-[#E5E7EB] rounded-lg p-6">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">Top Questions</h3>
        <p className="mt-2 text-[14px] text-[#6B7280]">Questions customers ask most. Data appears as conversations grow.</p>
      </div>

      <div className="mt-6 bg-white border border-[#E5E7EB] rounded-lg p-6">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">Knowledge Gap Report</h3>
        <p className="mt-2 text-[14px] text-[#6B7280]">Questions your character answered poorly. Approve suggested answers to improve.</p>
      </div>
    </div>
  )
}
