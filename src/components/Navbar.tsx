import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '#' },
  ]

  return (
    <>
    {mobileOpen && (
      <div
        className="fixed inset-0 z-40 md:hidden bg-black/20"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
    )}
    <nav className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E5E7EB] h-14 md:h-16 flex items-center justify-between pl-6 pr-4 md:pl-10 md:pr-8">
      {/* Logo - top-left with breathable padding */}
      <Link to="/" className="flex-shrink-0 py-2">
        <img
          src={logoSrc}
          alt="toolstoy"
          className="h-[1.6rem] sm:h-[1.8rem] w-auto object-contain"
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="text-toolstoy-nearblack hover:text-toolstoy-muted font-normal text-sm tracking-[0.02em] transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/signin" className="text-toolstoy-nearblack font-normal text-sm tracking-[0.02em] hover:text-toolstoy-muted transition-colors duration-200">
          Sign In
        </Link>
        <Link
          to="/signup"
          className="border border-[#E5E7EB] bg-[#1A1A1A] text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#282C34] min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Start Free
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-toolstoy-nearblack transition-all duration-200"
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
      className={`relative z-50 md:hidden bg-[#FFFFFF] border-b border-[#E5E7EB] overflow-hidden transition-all duration-200 ease-in-out ${
        mobileOpen ? 'max-h-[400px]' : 'max-h-0'
      }`}
    >
      <div className="flex flex-col items-center py-6 px-4 gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            onClick={() => setMobileOpen(false)}
            className="w-full text-center text-toolstoy-nearblack font-normal text-sm py-3 min-h-[48px] flex items-center justify-center"
          >
            {link.label}
          </Link>
        ))}
        <Link to="/signin" className="w-full text-center text-toolstoy-nearblack font-normal text-sm py-3 min-h-[48px] flex items-center justify-center" onClick={() => setMobileOpen(false)}>
          Sign In
        </Link>
        <Link
          to="/signup"
          onClick={() => setMobileOpen(false)}
          className="w-full mt-4 bg-[#1A1A1A] text-white font-medium text-sm py-3.5 rounded-lg text-center min-h-[48px] flex items-center justify-center hover:bg-[#282C34] transition-all duration-200"
        >
          Start Free
        </Link>
      </div>
    </div>
    </>
  )
}
