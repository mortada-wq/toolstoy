// design-tokens.json → Badge spec from DESIGN.md
// border-radius: 9999px, padding: 4px 12px, font-size: 13px, font-weight: 500

type BadgeVariant = 'teal' | 'orange' | 'coral' | 'neutral' | 'success' | 'warning'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  teal:    'bg-teal/15 text-teal border border-teal/25',
  orange:  'bg-orange/15 text-orange border border-orange/25',
  coral:   'bg-coral/15 text-coral border border-coral/25',
  neutral: 'bg-bg-overlay text-steel-blue border border-border/15',
  // success / warning map to teal and coral — no green/red in design system
  success: 'bg-teal/15 text-teal border border-teal/25',
  warning: 'bg-coral/15 text-coral border border-coral/25',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'rounded-full inline-flex items-center px-3 py-1 text-ds-sm font-medium',
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
