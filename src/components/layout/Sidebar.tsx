import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

const MERCHANT_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Create Character', href: '/dashboard/studio', icon: 'sparkle' },
  { label: 'My Characters', href: '/dashboard/characters', icon: 'characters' },
  { label: 'Widget Settings', href: '/dashboard/widget', icon: 'widget' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart', comingSoon: true },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings', comingSoon: true },
]

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: 'chart' },
  { label: 'Quality Lab', href: '/admin/quality', icon: 'lab' },
  { label: 'Pipeline', href: '/admin/pipeline', icon: 'pipeline' },
  { label: 'Merchants', href: '/admin/merchants', icon: 'store' },
  { label: 'Alerts', href: '/admin/alerts', icon: 'alert' },
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
  }
  return icons[name] ?? null
}

export function Sidebar({ mobileOpen, onClose, isAdmin }: SidebarProps) {
  const location = useLocation()
  const links = isAdmin ? ADMIN_LINKS : MERCHANT_LINKS

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
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-[#E5E7EB] z-50 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="p-5" onClick={() => onClose()}>
          <img
            src={logoSrc}
            alt="toolstoy"
            className="h-6 w-auto object-contain"
            style={{ filter: 'contrast(0) brightness(0)' }}
          />
        </Link>
        <div className="h-px bg-[#E5E7EB]" />

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {links.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => onClose()}
                className={`flex items-center h-11 px-4 gap-2.5 mx-2 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'text-[#1A1A1A] bg-[#F5F5F5]'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F9F9F9]'
                }`}
              >
                <Icon name={link.icon} />
                <span className="font-medium text-sm">{link.label}</span>
                {('comingSoon' in link && link.comingSoon) ? (
                  <span className="ml-auto bg-[#F5F5F5] text-[#6B7280] font-medium text-[10px] px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* User section - merchant only */}
        {!isAdmin && (
          <>
            <div className="h-px bg-[#E5E7EB]" />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-semibold text-xs">
                  LT
                </div>
                <div>
                  <p className="font-medium text-[13px] text-[#1A1A1A]">Leo Tolstoy</p>
                  <span className="bg-[#F5F5F5] text-[#6B7280] font-medium text-[11px] px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                </div>
              </div>
              <Link
                to="/"
                className="text-[13px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                onClick={() => onClose()}
              >
                Sign Out
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
