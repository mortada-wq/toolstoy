import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { useMerchant } from '@/hooks/useMerchant'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

const MERCHANT_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home', comingSoon: false },
  { label: 'My guys', href: '/dashboard/characters', icon: 'myguys', comingSoon: false },
  { label: 'Widget Settings', href: '/dashboard/widget', icon: 'widget', comingSoon: false },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart', comingSoon: false },
  { label: 'Billing', href: '/dashboard/billing', icon: 'billing', comingSoon: false },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings', comingSoon: false },
]

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: 'chart', comingSoon: false },
  { label: 'Bedrock Playground', href: '/admin/playground', icon: 'sparkle', comingSoon: false },
  { label: 'Prompt Templates', href: '/admin/templates', icon: 'lab', comingSoon: false },
  { label: 'Quality Lab', href: '/admin/quality', icon: 'lab', comingSoon: false },
  { label: 'Pipeline', href: '/admin/pipeline', icon: 'pipeline', comingSoon: false },
  { label: 'Merchants', href: '/admin/merchants', icon: 'store', comingSoon: false },
  { label: 'Alerts', href: '/admin/alerts', icon: 'alert', comingSoon: false },
]

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactElement> = {
    home: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    sparkle: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    characters: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    myguys: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
        <path d="M389 40.84c18.5 0 35 18.79 35 44.03 0 25.33-16.5 44.03-35 44.03s-35-18.7-35-44.03c0-25.24 16.5-44.03 35-44.03zm-132.9 0c18.4 0 35 18.79 35 44.03 0 25.33-16.6 44.03-35 44.03-18.5 0-35.1-18.7-35.1-44.03 0-25.24 16.6-44.03 35.1-44.03zm-133 0c18.5 0 35 18.79 35 44.03 0 25.33-16.5 44.03-35 44.03s-35.09-18.7-35.09-44.03c0-25.24 16.59-44.03 35.09-44.03zm133 109.06c64 2 118 2 182.8 4.2 30.9 17.8 45.2 109 44.3 140.7l-17.6 17.7c-7.7-42.8-17.4-99.9-33.5-112.6v87.6l4.1 183.7H414l-16.7-184.7h-18l-16.7 184.7h-22.3l4.2-183.7-8-88.5h-29.3l-7.2 88.2 4.2 183.7h-22.3l-16.8-184.7h-18l-16.8 184.7h-22.2l4.2-183.7L205 199h-29.3l-8 88.5 4.2 183.7h-22.3l-16.7-184.7h-18L98.01 471.2h-22.2l4.2-183.7v-87.6c-16.2 12.7-25.9 69.8-33.6 112.6l-17.6-17.7c-.9-31.7 13.5-122.9 44.3-140.7 64.99-2.2 118.99-2.2 182.99-4.2z" />
      </svg>
    ),
    widget: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    chart: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    lab: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    pipeline: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    store: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    alert: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    billing: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  }
  return icons[name] ?? null
}

export function Sidebar({ mobileOpen, onClose, isAdmin }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, isAdmin: userIsAdmin } = useUser()
  const { merchant } = useMerchant()
  const links = isAdmin ? ADMIN_LINKS : MERCHANT_LINKS

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-toolstoy-bg-secondary border-r border-toolstoy-steelBlue/15 z-50 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo - design system */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="px-5 py-6" onClick={() => onClose()}>
          <img
            src="/logos/logo-darkmode.svg"
            alt="Toolstoy"
            className="h-8 w-auto object-contain min-w-[100px]"
          />
        </Link>
        <div className="h-px bg-toolstoy-steelBlue/15" />

        {/* Section label for admin */}
        {isAdmin && (
          <div className="px-5 pt-4 pb-1">
            <span className="font-semibold text-[11px] text-toolstoy-steelBlue uppercase tracking-wider">Toolstizer</span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {links.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => onClose()}
                className={`flex items-center h-11 px-4 gap-2.5 mx-2 rounded-toolstoy-md transition-all duration-200 ${
                  isActive
                    ? 'text-toolstoy-cream bg-toolstoy-bg-overlay'
                    : 'text-toolstoy-slateText hover:text-toolstoy-cream hover:bg-toolstoy-bg-overlay/60'
                }`}
              >
                <Icon name={link.icon} />
                <span className="font-medium text-[15px]">{link.label}</span>
                {link.comingSoon && (
                  <span className="ml-auto bg-toolstoy-bg-overlay/60 text-toolstoy-steelBlue font-medium text-[13px] px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        {user && (
          <>
            <div className="h-px bg-toolstoy-steelBlue/15" />
            <div className="p-4">
              <div className="flex flex-col items-start gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-toolstoy-orange flex items-center justify-center text-toolstoy-cream font-semibold text-xs shrink-0">
                  {(user.name ?? user.email ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-[15px] text-toolstoy-cream">{user.name ?? user.email}</p>
                  <span className="bg-toolstoy-bg-overlay/60 text-toolstoy-steelBlue font-medium text-[13px] px-2 py-0.5 rounded-full">
                    {isAdmin ? 'Toolstizer' : (merchant?.plan ? merchant.plan.charAt(0).toUpperCase() + merchant.plan.slice(1) : 'Free')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {userIsAdmin && !isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => onClose()}
                    className="text-[13px] text-toolstoy-slateText hover:text-toolstoy-cream transition-colors"
                  >
                    Admin Dashboard →
                  </Link>
                )}
                {userIsAdmin && isAdmin && (
                  <Link
                    to="/dashboard"
                    onClick={() => onClose()}
                    className="text-[13px] text-toolstoy-slateText hover:text-toolstoy-cream transition-colors"
                  >
                    ← Merchant Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  className="text-[13px] text-toolstoy-slateText hover:text-toolstoy-cream transition-colors text-left"
                  onClick={() => {
                    onClose()
                    void handleSignOut()
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
