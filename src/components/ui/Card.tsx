import type { HTMLAttributes } from 'react'

// design-tokens.json → components.card
// background: #252A36 (bg-secondary)
// border: 1.5px solid rgba(143,163,181,0.15) (border/15)
// border-radius: 16px (rounded-lg)
// padding: 24px (p-6)

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds teal glow shadow on hover */
  hoverable?: boolean
  /** Removes default 24px padding so children can fill edge-to-edge */
  flush?: boolean
}

export function Card({ hoverable = false, flush = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-bg-secondary rounded-lg border border-border/15',
        flush ? '' : 'p-6',
        hoverable ? 'transition-shadow duration-normal hover:shadow-teal-glow cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
