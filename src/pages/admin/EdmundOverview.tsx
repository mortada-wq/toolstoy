const PLATFORM_STATS = [
  { label: 'Active Characters', value: '1,247' },
  { label: 'Conversations Today', value: '8,432' },
  { label: 'Generation Success Rate', value: '97.3%' },
  { label: 'Avg Response Quality', value: '8.1/10' },
]

const MERCHANTS = [
  { name: 'Acme Tools', characters: 2, conversations: 12, fallback: 38, health: 32, status: 'At Risk', color: 'red' },
  { name: 'StyleHouse', characters: 1, conversations: 89, fallback: 22, health: 61, status: 'Watch', color: 'amber' },
  { name: 'FitLife Store', characters: 3, conversations: 445, fallback: 8, health: 84, status: 'Healthy', color: 'green' },
  { name: 'HomeBasics', characters: 1, conversations: 234, fallback: 11, health: 88, status: 'Healthy', color: 'green' },
  { name: 'PetPals Co', characters: 2, conversations: 891, fallback: 5, health: 96, status: 'Excellent', color: 'green' },
]

const ALERTS = [
  {
    type: 'Pipeline Stalled',
    desc: 'Acme Tools — processing for 34 minutes.',
    time: 'Triggered 34 min ago',
    action: 'Investigate',
    border: '#EF4444',
  },
  {
    type: 'Silent Character',
    desc: 'StyleHouse — live 9 days, zero conversations.',
    time: 'Triggered 2 days ago',
    action: 'Review',
    border: '#F59E0B',
  },
  {
    type: 'Knowledge Vacuum',
    desc: 'Acme Tools — fallback rate 38% for 48 hours.',
    time: 'Triggered 48 hours ago',
    action: 'Review',
    border: '#F59E0B',
  },
]

export function EdmundOverview() {
  return (
    <div className="p-5 md:p-8">
      {/* Health banner */}
      <div className="bg-[#DCFCE7] border border-[#22C55E] rounded-lg px-6 py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-semibold text-[15px] text-[#166534]">🟢 All systems operational</span>
        <span className="text-[13px] text-[#166534] font-normal">Last checked 2 minutes ago</span>
      </div>

      {/* Platform stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORM_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E5E7EB] rounded-lg p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          >
            <p className="font-medium text-xs text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 font-bold text-[36px] text-[#1A1A1A]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Merchant Health Table */}
      <div className="mt-8">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">Merchant Health Scores</h3>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Sorted lowest first — who needs attention.
        </p>
        <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#E5E7EB]">
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Merchant</th>
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Characters</th>
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Conversations</th>
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Fallback Rate</th>
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Health Score</th>
                <th className="text-left py-3 px-5 font-medium text-[11px] text-[#6B7280] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {MERCHANTS.map((m) => (
                <tr key={m.name} className="border-b border-[#F5F5F5] last:border-0">
                  <td className="py-4 px-5 text-[14px] text-[#1A1A1A] font-normal">{m.name}</td>
                  <td className="py-4 px-5 text-[14px] text-[#1A1A1A] font-normal">{m.characters}</td>
                  <td className="py-4 px-5 text-[14px] text-[#1A1A1A] font-normal">{m.conversations}</td>
                  <td className="py-4 px-5 text-[14px] text-[#1A1A1A] font-normal">{m.fallback}%</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-block font-semibold text-[12px] px-[10px] py-[3px] rounded ${
                        m.health >= 80
                          ? 'bg-[#DCFCE7] text-[#22C55E]'
                          : m.health >= 50
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#FEE2E2] text-[#EF4444]'
                      }`}
                    >
                      {m.health}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[14px] text-[#1A1A1A] font-normal">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="mt-8 flex items-center gap-2">
        <h3 className="font-semibold text-[17px] text-[#1A1A1A]">Active Alerts</h3>
        <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-semibold text-[11px]">
          3
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {ALERTS.map((alert, i) => (
          <div
            key={i}
            className={`bg-white border border-[#E5E7EB] rounded-lg p-4 md:px-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-l-[3px] ${alert.border === '#EF4444' ? 'border-l-[#EF4444]' : 'border-l-[#F59E0B]'}`}
          >
            <div>
              <h4 className="font-semibold text-[14px] text-[#1A1A1A]">{alert.type}</h4>
              <p className="text-[13px] text-[#6B7280] mt-1">{alert.desc}</p>
              <p className="text-[12px] text-[#6B7280] mt-1">{alert.time}</p>
            </div>
            <button className="border border-[#E5E7EB] rounded-md px-3.5 py-1.5 font-medium text-[13px] text-[#1A1A1A] hover:bg-[#F5F5F5] shrink-0">
              {alert.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
