import { useState } from 'react'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#docs' },
  ]

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-14 md:h-16 flex items-center justify-between pl-6 pr-4 md:pl-10 md:pr-8">
      {/* Logo - top-left with breathable padding */}
      <a href="/" className="flex-shrink-0 py-2">
        <img
          src={logoSrc}
          alt="toolstoy"
          className="h-[1.6rem] sm:h-[1.8rem] w-auto object-contain"
          style={{ color: 'rgba(105, 105, 105, 1)', opacity: 0.73 }}
        />
      </a>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-toolstoy-nearblack hover:text-toolstoy-muted font-normal text-sm tracking-[0.02em] transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-6">
        <a href="#signin" className="text-toolstoy-nearblack font-normal text-sm tracking-[0.02em] hover:text-toolstoy-muted transition-colors duration-200">
          Sign In
        </a>
        <a
          href="#start"
          className="border border-gray-300 bg-gray-50 text-toolstoy-nearblack font-normal text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Start Free
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-toolstoy-nearblack"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </nav>

    {/* Mobile panel */}
    <div
      className={`md:hidden bg-white border-b border-gray-100 overflow-hidden transition-all duration-200 ease-in-out ${
        mobileOpen ? 'max-h-[400px]' : 'max-h-0'
      }`}
    >
      <div className="flex flex-col items-center py-6 px-4 gap-1">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="w-full text-center text-toolstoy-nearblack font-normal text-sm py-3 min-h-[48px] flex items-center justify-center"
          >
            {link.label}
          </a>
        ))}
        <a href="#signin" className="w-full text-center text-toolstoy-nearblack font-normal text-sm py-3 min-h-[48px] flex items-center justify-center">
          Sign In
        </a>
        <a
          href="#start"
          onClick={() => setMobileOpen(false)}
          className="w-full mt-4 border border-gray-300 bg-gray-50 text-toolstoy-nearblack font-normal text-sm py-3.5 rounded-lg text-center min-h-[44px] flex items-center justify-center hover:bg-gray-100"
        >
          Start Free
        </a>
      </div>
    </div>
    </>
  )
}
