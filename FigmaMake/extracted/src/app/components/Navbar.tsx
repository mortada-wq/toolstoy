import React, { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#36454F]/80 backdrop-blur-xl">
      {/* Animated gradient border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #FF8C00, #FF7F00, #D4AF37, #D2691E, #CC5500, #B7410E, #FF8C00)',
          backgroundSize: '300% 100%',
          animation: 'gradientFlow 4s ease infinite',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo className="text-2xl" />
          </Link>

          {/* Desktop Navigation - centered */}
          <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
            <Link to="/features" className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors text-sm">
              Features
            </Link>
            <Link to="/pricing" className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors text-sm">
              Pricing
            </Link>
            <Link to="/demo" className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors text-sm">
              Demo
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/sign-in"
              className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors text-sm px-5 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-6 py-2.5 rounded-full transition-all text-sm font-medium hover:shadow-lg hover:shadow-[#FF8C00]/20"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#F5F5DC] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2A343C]/95 backdrop-blur-xl border-t border-[#B8860B]/20">
          <div className="px-6 py-6 space-y-6">
            <Link
              to="/features"
              className="block text-[#F5F5DC] hover:text-[#FF8C00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="block text-[#F5F5DC] hover:text-[#FF8C00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/demo"
              className="block text-[#F5F5DC] hover:text-[#FF8C00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </Link>
            <div className="pt-6 border-t border-[#B8860B]/20 space-y-3">
              <Link
                to="/sign-in"
                className="block text-[#F5F5DC] hover:text-[#FF8C00] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="block text-center bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-6 py-3 rounded-full transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}