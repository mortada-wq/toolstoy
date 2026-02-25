import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/studio': 'Character Studio',
  '/dashboard/characters': 'My guys',
  '/dashboard/widget': 'Widget Settings',
  '/dashboard/billing': 'Billing',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/admin': 'Toolstizer',
  '/admin/playground': 'Bedrock Playground',
  '/admin/templates': 'Prompt Templates',
  '/admin/quality': 'Quality Lab',
  '/admin/pipeline': 'Pipeline',
  '/admin/merchants': 'Merchants',
  '/admin/alerts': 'Alerts',
}

function getPageTitle(pathname: string): string {
  if (pathname.match(/\/dashboard\/characters\/[^/]+\/edit/)) return 'Edit Character'
  return PAGE_TITLES[pathname] ?? (pathname.startsWith('/admin') ? 'Toolstizer' : 'Dashboard')
}

export function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const title = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-toolstoy-bg-primary">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
      <div className="md:pl-[240px] min-h-screen flex flex-col">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} isAdmin={isAdmin} />
        <main className="flex-1 bg-toolstoy-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
