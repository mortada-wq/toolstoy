import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GradientStroke } from './GradientStroke'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '#' },
  ]

  return (
    <>
    <div
      className={`fixed inset-0 z-40 md:hidden bg-black/20 transition-opacity duration-300 ease-out ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setMobileOpen(false)}
      aria-hidden={!mobileOpen}
    />
    <nav className="relative sticky top-0 z-50 bg-toolstoy-bg-primary/95 backdrop-blur-xl h-14 md:h-16 flex items-center justify-between pl-6 pr-4 md:pl-10 md:pr-8">
      <GradientStroke position="bottom" size={2} />
      {/* Logo - universal Toolstoy logo (bird T + oolstoy) */}
      <Link to="/" className="flex-shrink-0 py-2">
        <img
          src="/logos/logo-toolstoy.png"
          alt="Toolstoy"
          className="h-10 sm:h-12 w-auto object-contain min-w-[120px]"
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="text-toolstoy-cream hover:text-toolstoy-slateText font-normal text-[15px] font-semibold tracking-[0.02em] transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTA - pill, orange, cream text */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/signin" className="text-toolstoy-cream font-normal text-[15px] tracking-[0.02em] hover:text-toolstoy-slateText transition-colors duration-200">
          Sign In
        </Link>
        <Link
          to="/signup"
          className="bg-toolstoy-orange text-toolstoy-cream font-semibold text-[15px] px-6 py-3 rounded-full transition-all duration-200 hover:shadow-orange-glow hover:scale-[1.02] active:scale-[0.98] min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Start Free
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-toolstoy-cream transition-transform duration-300 ease-spring active:scale-95"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="w-6 h-6 transition-transform duration-300 ease-spring" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 transition-transform duration-300 ease-spring" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </nav>

    {/* Mobile panel - GPU-friendly transform (no height animation), Notion-like contextual reveal */}
    <div
      className={`fixed top-14 left-0 right-0 z-[49] md:hidden overflow-hidden pointer-events-none ${
        mobileOpen ? 'pointer-events-auto' : ''
      }`}
      aria-hidden={!mobileOpen}
    >
      <div
        className={`bg-toolstoy-bg-secondary backdrop-blur-xl border-b border-toolstoy-steelBlue/15 shadow-toolstoy-md transition-all duration-300 ease-spring-out ${
          mobileOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2'
        }`}
        style={{ willChange: mobileOpen ? 'auto' : 'transform, opacity' }}
      >
        <div className="flex flex-col items-center py-6 px-4 gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center text-toolstoy-cream font-normal text-[15px] py-3 min-h-[48px] flex items-center justify-center transition-all duration-300 ease-spring-out opacity-0 translate-y-2 hover:bg-toolstoy-bg-overlay/50 rounded-toolstoy-lg"
              style={
                mobileOpen
                  ? {
                      transitionDelay: `${80 + i * 50}ms`,
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  : { transitionDelay: '0ms' }
              }
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/signin"
            onClick={() => setMobileOpen(false)}
            className="w-full text-center text-toolstoy-cream font-normal text-[15px] py-3 min-h-[48px] flex items-center justify-center transition-all duration-300 ease-spring-out opacity-0 translate-y-2 hover:bg-toolstoy-bg-overlay/50 rounded-toolstoy-lg"
            style={
              mobileOpen
                ? {
                    transitionDelay: `${80 + navLinks.length * 50}ms`,
                    opacity: 1,
                    transform: 'translateY(0)',
                  }
                : { transitionDelay: '0ms' }
            }
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={() => setMobileOpen(false)}
            className="w-full mt-4 bg-toolstoy-orange text-toolstoy-cream font-semibold text-[15px] py-3.5 rounded-full text-center min-h-[48px] flex items-center justify-center hover:shadow-orange-glow transition-all duration-300 ease-spring-out hover:scale-[1.02] active:scale-[0.98] opacity-0 translate-y-2"
            style={
              mobileOpen
                ? {
                    transitionDelay: `${80 + (navLinks.length + 1) * 50}ms`,
                    opacity: 1,
                    transform: 'translateY(0)',
                  }
                : { transitionDelay: '0ms' }
            }
          >
            Start Free
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
