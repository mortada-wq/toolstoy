import { forwardRef, type InputHTMLAttributes } from 'react'

// design-tokens.json → components.input
// background: #1E2330 (bg-overlay)
// border: 1.5px solid rgba(143,163,181,0.25) (border/25)
// border-radius: 12px (rounded-md)
// padding: 12px 16px (py-3 px-4)
// focus-border: 1.5px solid rgba(112,230,210,0.60) (focus:border-teal/60)

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  /** Optional leading icon (Lucide, 16px) */
  leadingIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leadingIcon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-ds-sm font-medium text-cream">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-blue pointer-events-none">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full bg-bg-overlay border border-border/25 rounded-md py-3 px-4 text-ds-base text-cream',
              'placeholder:text-steel-blue',
              'focus:outline-none focus:border-teal/60 focus:ring-2 focus:ring-teal/15',
              'transition-all duration-normal ease-default',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-coral/60 focus:border-coral/80 focus:ring-coral/15' : '',
              leadingIcon ? 'pl-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p className="text-ds-sm text-coral">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
