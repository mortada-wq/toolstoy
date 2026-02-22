/**
 * Soul Engine Visual — "Pulse of Life"
 * Multi-colored fluid gradient that pulses and swirls to show AI activity.
 * No loading bar, no static icon — the aura suggests the character is alive and thinking.
 */

interface SoulEnginePulseProps {
  variant?: 'aura' | 'orb' | 'full'
  className?: string
  children?: React.ReactNode
}

export function SoulEnginePulse({ variant = 'aura', className = '', children }: SoulEnginePulseProps) {
  return (
    <div className={`soul-engine-pulse soul-engine-${variant} relative overflow-hidden ${className}`}>
      {/* Layer 1: Cool drift (indigo/purple) */}
      <div className="absolute inset-0 soul-gradient-1 pointer-events-none" aria-hidden />
      {/* Layer 2: Warm drift (pink/amber) */}
      <div className="absolute inset-0 soul-gradient-2 pointer-events-none" aria-hidden />
      {/* Layer 3: Accent pulse (green/blue) */}
      <div className="absolute inset-0 soul-gradient-3 pointer-events-none" aria-hidden />
      {children != null && <div className="relative z-10">{children}</div>}
    </div>
  )
}
