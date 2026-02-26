import { Link } from 'react-router-dom'
import { GradientStroke } from './GradientStroke'

export function Footer() {
  const links = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '#' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ]

  const legalLinks = [
    { label: 'Acceptable Use', href: '/acceptable-use' },
    { label: 'Security', href: '/security' },
    { label: 'Refunds', href: '/refunds' },
  ]

  return (
    <footer className="relative bg-toolstoy-bg-secondary px-4 md:px-6 py-14">
      <GradientStroke position="top" size={2} />
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <Link to="/" className="flex-shrink-0">
          <img
            src="/logos/logo-toolstoy.png"
            alt="Toolstoy"
            className="h-[22.4px] w-auto object-contain min-w-[100px]"
          />
        </Link>

        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-toolstoy-slateText text-[15px] font-normal hover:text-toolstoy-cream transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-toolstoy-slateText text-[15px] font-normal hover:text-toolstoy-cream transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-toolstoy-slateText text-[15px] font-normal">© 2026 toolstoy.app</p>
      </div>
    </footer>
  )
}
