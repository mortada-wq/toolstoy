import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

// design-tokens.json → components.button
// All buttons are pill-shaped (border-radius: 9999px). No exceptions.
// Orange is action-only. Secondary uses teal. Ghost uses slate-text.

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: Variant
  size?: Size
  /** false = full width */
  intrinsic?: boolean
  children: React.ReactNode
  className?: string
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    to?: never
    href?: never
  }

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    to: string
    href?: never
  }

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string
    to?: never
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

// Padding uses 8px-unit scale: sm=8/16, md=12/24, lg=16/32
const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-ds-sm min-h-[36px]',
  md: 'px-6 py-3 text-ds-base min-h-[44px]',
  lg: 'px-8 py-4 text-ds-md  min-h-[52px]',
}

// primary   → orange bg + cream text  (CTA — orange is action-only)
// secondary → transparent + teal border + teal text
// ghost     → transparent, no border, slate-text (nav / low-hierarchy)
const variants: Record<Variant, string> = {
  primary:
    'bg-orange text-cream font-semibold hover:shadow-orange-glow active:scale-[0.97]',
  secondary:
    'bg-transparent border border-teal/40 text-teal font-semibold hover:border-teal/70 hover:shadow-teal-glow active:scale-[0.97]',
  ghost:
    'bg-transparent text-slate-text font-medium hover:text-cream hover:bg-bg-overlay active:scale-[0.97]',
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      intrinsic = true,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const base =
      'rounded-full inline-flex items-center justify-center transition-all duration-normal ease-default disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 select-none'
    const width = intrinsic ? 'w-fit' : 'w-full'
    const cls = `${base} ${width} ${sizes[size]} ${variants[variant]} ${className}`

    if ('to' in props && props.to) {
      const { to, ...rest } = props
      return (
        <Link to={to} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </Link>
      )
    }

    if ('href' in props && props.href) {
      const { href, ...rest } = props
      return (
        <a href={href} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      )
    }

    const { ...rest } = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        type="button"
        className={cls}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
