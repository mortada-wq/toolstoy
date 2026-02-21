import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/studio': 'Character Studio',
  '/dashboard/characters': 'My Characters',
  '/dashboard/widget': 'Widget Settings',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/admin': 'Overview',
  '/admin/quality': 'Quality Lab',
  '/admin/pipeline': 'Pipeline',
  '/admin/merchants': 'Merchants',
  '/admin/alerts': 'Alerts',
}

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? (pathname.startsWith('/admin') ? 'Admin' : 'Dashboard')
}

export function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const title = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
      <div className="md:pl-[240px] min-h-screen flex flex-col">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
