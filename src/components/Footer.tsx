import { Link } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function Footer() {
  const links = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '#docs' },
    { label: 'Privacy', href: '#privacy' },
  ]

  return (
    <footer className="bg-white border-t border-gray-100 px-4 md:px-6 py-14">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/">
          <img
            src={logoSrc}
            alt="toolstoy"
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* Links */}
        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {links.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-toolstoy-muted text-sm font-normal hover:text-toolstoy-nearblack transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-toolstoy-muted text-sm font-normal hover:text-toolstoy-nearblack transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-toolstoy-muted text-sm font-normal">© 2026 toolstoy.app</p>
      </div>
    </footer>
  )
}
