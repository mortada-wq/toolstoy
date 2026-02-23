import { useState, useEffect } from 'react'

interface Generation {
  id: string
  timestamp: string
  mode: 'test' | 'production'
  admin: string
  promptTemplate: string
  status: 'success' | 'failed'
  cost?: number
}

interface GenerationHistoryPanelProps {
  environment?: 'test' | 'production' | 'all'
}

export function GenerationHistoryPanel({ environment = 'all' }: GenerationHistoryPanelProps) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [modeFilter, setModeFilter] = useState<'test' | 'production' | 'all'>(environment)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalTestCost, setTotalTestCost] = useState(0)
  const [totalProductionCost, setTotalProductionCost] = useState(0)

  useEffect(() => {
    loadGenerations()
  }, [modeFilter])

  const loadGenerations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const params = new URLSearchParams()
      if (modeFilter !== 'all') {
        params.append('mode', modeFilter)
      }

      const response = await fetch(`/api/admin/generation-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to load history')

      const data = await response.json()
      setGenerations(data.generations || [])
      setTotalTestCost(data.totalTestCost || 0)
      setTotalProductionCost(data.totalProductionCost || 0)
    } catch (err) {
      console.error('Failed to load generation history:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredGenerations = generations.filter((gen) =>
    gen.promptTemplate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gen.admin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Generation History</h3>

      {/* Cost Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3">
          <p className="text-[11px] text-[#6B7280] mb-1">Test Cost</p>
          <p className="text-[16px] font-semibold text-[#1A1A1A]">${totalTestCost.toFixed(2)}</p>
        </div>
        <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3">
          <p className="text-[11px] text-[#6B7280] mb-1">Production Cost</p>
          <p className="text-[16px] font-semibold text-[#DC2626]">${totalProductionCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setModeFilter('all')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              modeFilter === 'all'
                ? 'bg-[#5B7C99] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setModeFilter('test')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              modeFilter === 'test'
                ? 'bg-[#5B7C99] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            Test Only
          </button>
          <button
            onClick={() => setModeFilter('production')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              modeFilter === 'production'
                ? 'bg-[#DC2626] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            Production Only
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by template or admin..."
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-[12px]"
        />
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-[12px] text-[#6B7280] py-4">Loading...</div>
        ) : filteredGenerations.length === 0 ? (
          <div className="text-center text-[12px] text-[#6B7280] py-4">No generations yet</div>
        ) : (
          filteredGenerations.map((gen) => (
            <div
              key={gen.id}
              onClick={() => setSelectedGeneration(gen)}
              className={`p-3 rounded-md cursor-pointer transition-all border ${
                selectedGeneration?.id === gen.id
                  ? 'bg-[#EBF8FF] border-[#5B7C99]'
                  : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-[#1A1A1A]">{gen.promptTemplate}</p>
                  <p className="text-[11px] text-[#6B7280]">{formatDate(gen.timestamp)}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-medium ${
                      gen.mode === 'test'
                        ? 'bg-[#E5E7EB] text-[#6B7280]'
                        : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}
                  >
                    {gen.mode}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-medium ${
                      gen.status === 'success'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}
                  >
                    {gen.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <p className="text-[#6B7280]">by {gen.admin}</p>
                {gen.cost && <p className="text-[#1A1A1A] font-medium">${gen.cost.toFixed(4)}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Generation Details */}
      {selectedGeneration && (
        <div className="mt-4 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
          <p className="text-[12px] font-semibold text-[#1A1A1A] mb-2">Details</p>
          <div className="space-y-1 text-[11px]">
            <p><span className="text-[#6B7280]">Template:</span> {selectedGeneration.promptTemplate}</p>
            <p><span className="text-[#6B7280]">Admin:</span> {selectedGeneration.admin}</p>
            <p><span className="text-[#6B7280]">Mode:</span> {selectedGeneration.mode}</p>
            <p><span className="text-[#6B7280]">Status:</span> {selectedGeneration.status}</p>
            {selectedGeneration.cost && (
              <p><span className="text-[#6B7280]">Cost:</span> ${selectedGeneration.cost.toFixed(4)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
