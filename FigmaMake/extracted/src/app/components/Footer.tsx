import React from 'react';
import { Link } from 'react-router';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="relative bg-[#2A343C] border-t border-[#B8860B]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <p className="text-[#FFDAB9]/60 text-sm max-w-md font-light leading-relaxed">
              Transform products into living, breathing characters.
              <br />
              AI-powered conversations that convert.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[#F5F5DC] font-semibold mb-6 text-sm tracking-wide">PRODUCT</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Features
                </a>
              </li>
              <li>
                <a href="#showcase" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Showcase
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[#F5F5DC] font-semibold mb-6 text-sm tracking-wide">LEGAL</h4>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Terms
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors text-sm font-light">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#B8860B]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#FFDAB9]/40 text-xs font-light">
              © 2026 Toolstoy. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#twitter" className="text-[#FFDAB9]/40 hover:text-[#FF8C00] transition-colors text-xs">
                Twitter
              </a>
              <a href="#linkedin" className="text-[#FFDAB9]/40 hover:text-[#FF8C00] transition-colors text-xs">
                LinkedIn
              </a>
              <a href="#github" className="text-[#FFDAB9]/40 hover:text-[#FF8C00] transition-colors text-xs">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}