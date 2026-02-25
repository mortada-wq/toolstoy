// design-tokens.json → logo section
// All SVGs live in /public/logos/. Never recolor them.
// Minimum wordmark width: 120px. Minimum icon width: 32px.

type LogoVariant = 'dark' | 'teal' | 'light' | 'icon'

interface LogoProps {
  /**
   * dark  → logo-darkmode.svg  — use on #2E3340 backgrounds (default)
   * teal  → logo-teal.svg      — teal brand moments
   * light → logo-lightmode.svg — light / cream backgrounds
   * icon  → logov.svg          — icon only (favicon, avatars)
   */
  variant?: LogoVariant
  /** Height in pixels. Width scales automatically. */
  height?: number
  className?: string
  /** Alt text for screen readers */
  alt?: string
}

const sources: Record<LogoVariant, string> = {
  dark:  '/logos/logo-darkmode.svg',
  teal:  '/logos/logo-teal.svg',
  light: '/logos/logo-lightmode.svg',
  icon:  '/logos/logov.svg',
}

// Minimum rendered sizes from DESIGN.md
const minWidths: Record<LogoVariant, number> = {
  dark:  120,
  teal:  120,
  light: 120,
  icon:  32,
}

export function Logo({ variant = 'dark', height = 32, className = '', alt = 'Toolstoy' }: LogoProps) {
  return (
    <img
      src={sources[variant]}
      alt={alt}
      height={height}
      style={{ minWidth: minWidths[variant], height }}
      className={`w-auto object-contain ${className}`}
      draggable={false}
    />
  )
}
