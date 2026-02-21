import { Link } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function Footer() {
  const links = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '#' },
    { label: 'Privacy', href: '/privacy' },
  ]

  return (
    <footer className="bg-[#1A1A1A] px-4 md:px-6 py-14">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={logoSrc}
            alt="toolstoy"
            className="h-7 w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* Links */}
        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-[#6B7280] text-sm font-normal hover:text-white transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[#6B7280] text-sm font-normal">© 2026 toolstoy.app</p>
      </div>
    </footer>
  )
}
