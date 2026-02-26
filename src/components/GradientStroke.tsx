/**
 * Gradient animated stroke — fancy modern minimalist divider.
 * Uses spiral palette: orange → goldenrod → bronze → rust.
 */
interface GradientStrokeProps {
  /** Placement: 'bottom' | 'top' | 'left' | 'right' */
  position?: 'bottom' | 'top' | 'left' | 'right'
  /** Height (for horizontal) or width (for vertical) in px */
  size?: number
  /** Optional className for the wrapper */
  className?: string
}

const GRADIENT =
  'linear-gradient(90deg, #FF8C00, #FF7F00, #DAA520, #D2691E, #CC5500, #B7410E, #FF8C00)'

export function GradientStroke({
  position = 'bottom',
  size = 2,
  className = '',
}: GradientStrokeProps) {
  const isHorizontal = position === 'bottom' || position === 'top'
  const style: React.CSSProperties = {
    background: GRADIENT,
    backgroundSize: '300% 100%',
    animation: 'gradientFlow 4s ease infinite',
    ...(isHorizontal
      ? { height: `${size}px`, width: '100%' }
      : { width: `${size}px`, height: '100%' }),
  }

  const positionClasses = {
    bottom: 'absolute bottom-0 left-0 right-0',
    top: 'absolute top-0 left-0 right-0',
    left: 'absolute left-0 top-0 bottom-0',
    right: 'absolute right-0 top-0 bottom-0',
  }

  return (
    <div
      className={`${positionClasses[position]} ${className}`}
      aria-hidden
    >
      <div style={style} className="w-full h-full" />
    </div>
  )
}
