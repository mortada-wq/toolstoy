import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light'
type Size = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: Variant
  size?: Size
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

const sizeClasses: Record<Size, string> = {
  sm: 'px-6 py-2.5 text-[14px]',
  md: 'px-8 py-3 text-[15px]',
  lg: 'px-10 py-3.5 text-base',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-toolstoy-charcoal text-white font-semibold hover:bg-[#282C34] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]',
  secondary:
    'bg-white text-toolstoy-nearblack font-semibold border border-toolstoy-border hover:bg-[#F5F5F5]',
  light: 'bg-white text-toolstoy-nearblack font-semibold hover:bg-[#F5F5F5]',
  ghost: 'bg-transparent text-toolstoy-nearblack font-medium hover:bg-toolstoy-softgrey',
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
    ref
  ) => {
    const baseClasses =
      'rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center min-h-[44px] hover:scale-[1.02] active:scale-[0.98]'
    const widthClass = intrinsic ? 'w-fit' : 'w-full'
    const classes = `${baseClasses} ${widthClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

    if ('to' in props && props.to) {
      const { to, ...rest } = props
      return (
        <Link to={to} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </Link>
      )
    }

    if ('href' in props && props.href) {
      const { href, ...rest } = props
      return (
        <a href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      )
    }

    const { ...rest } = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button type="button" className={classes} ref={ref as React.Ref<HTMLButtonElement>} {...rest}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
