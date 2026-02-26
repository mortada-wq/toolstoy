import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Code, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Menu, 
  X, 
  Bell,
  LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Guys', path: '/dashboard/characters', icon: Users },
  { label: 'Widget Settings', path: '/dashboard/widgets', icon: Code },
  { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Billing', path: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock user data
  const user = {
    name: 'Alex Chen',
    initials: 'AC',
    plan: 'Pro',
  };

  const Sidebar = ({ isMobile = false }) => (
    <aside className={`${isMobile ? 'w-full' : 'w-60'} bg-[#2A343C] border-r flex flex-col`}
      style={{
        borderImage: 'linear-gradient(180deg, #FF8C00, #DAA520, #B8860B, #B7410E) 1',
        borderWidth: '0 1px 0 0',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#B8860B]/20">
        <Logo className="text-xl" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#1E262E] text-[#F5F5DC] shadow-lg shadow-[#FF8C00]/10' 
                  : 'text-[#FFDAB9]/70 hover:bg-[#1E262E]/50 hover:text-[#F5F5DC]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF8C00]' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#B8860B]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center">
            <span className="text-[#F5F5DC] font-bold text-sm">{user.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F5F5DC] text-sm font-medium truncate">{user.name}</p>
            <span className="inline-block px-2 py-0.5 text-xs bg-[#DAA520]/20 text-[#DAA520] rounded-full border border-[#DAA520]/30">
              {user.plan}
            </span>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-4 py-2 text-[#FFDAB9]/70 hover:text-[#CD5C5C] hover:bg-[#1E262E]/50 rounded-lg transition-all">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#36454F] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="relative bg-[#2A343C] border-b px-6 py-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#F5F5DC] hover:text-[#FF8C00] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Page Title */}
          <h1 className="text-[#F5F5DC] text-xl font-semibold hidden lg:block">
            {navItems.find(item => {
              if (item.path === '/dashboard' && location.pathname === '/dashboard') return true;
              if (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) return true;
              return false;
            })?.label || 'Dashboard'}
          </h1>

          {/* Notifications */}
          <button className="relative text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF8C00] rounded-full" />
          </button>

          {/* Animated gradient border */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, #FF8C00, #FF7F00, #D4AF37, #D2691E, #CC5500, #B7410E, #FF8C00)',
              backgroundSize: '300% 100%',
              animation: 'gradientFlow 4s ease infinite',
            }}
          />
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}