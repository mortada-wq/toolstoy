// design-tokens.json → components (avatar spec from DESIGN.md)
// Circle (border-radius: 9999px)
// Teal border ring
// Min size: 32px (icon), 40px (chat head)

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  /** Image URL — shows initials fallback when absent */
  src?: string | null
  alt?: string
  /** Initials shown when no image is available (max 2 chars) */
  initials?: string
  size?: AvatarSize
  /** Adds the teal ring defined by the design system */
  ring?: boolean
  className?: string
}

const sizes: Record<AvatarSize, { wrapper: string; text: string }> = {
  sm: { wrapper: 'w-8 h-8 min-w-[32px]',   text: 'text-ds-xs' },
  md: { wrapper: 'w-10 h-10 min-w-[40px]',  text: 'text-ds-sm' },
  lg: { wrapper: 'w-12 h-12 min-w-[48px]',  text: 'text-ds-base' },
  xl: { wrapper: 'w-16 h-16 min-w-[64px]',  text: 'text-ds-md' },
}

export function Avatar({ src, alt = '', initials, size = 'md', ring = false, className = '' }: AvatarProps) {
  const { wrapper, text } = sizes[size]
  const ringCls = ring ? 'ring-2 ring-teal ring-offset-2 ring-offset-bg-primary' : ''

  return (
    <span
      className={[
        'rounded-full overflow-hidden inline-flex items-center justify-center shrink-0 select-none',
        'bg-bg-overlay',
        wrapper,
        ringCls,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className={`${text} font-semibold text-teal uppercase`}>
          {(initials ?? alt).slice(0, 2) || '?'}
        </span>
      )}
    </span>
  )
}
