import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
  };

  return (
    <div className="min-h-screen bg-[#36454F] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF8C00] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#DAA520] rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[#FFDAB9]/60 hover:text-[#FF8C00] transition-colors mb-8 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex justify-center mb-8">
            <Logo />
          </Link>
          <h1 className="text-[#F5F5DC] text-4xl font-bold mb-3">Welcome Back</h1>
          <p className="text-[#FFDAB9]/60 font-light">Continue your journey with Toolstoy</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-[#2A343C]/60 backdrop-blur-xl border border-[#B8860B]/20 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[#F5F5DC] mb-3 text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1E262E] text-[#F5F5DC] px-6 py-4 rounded-2xl border border-[#B8860B]/20 focus:outline-none focus:border-[#FF8C00]/40 transition-all placeholder:text-[#6A6A6A]"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#F5F5DC] mb-3 text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1E262E] text-[#F5F5DC] px-6 py-4 rounded-2xl border border-[#B8860B]/20 focus:outline-none focus:border-[#FF8C00]/40 transition-all placeholder:text-[#6A6A6A]"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#forgot" className="text-[#DAA520] hover:text-[#FF8C00] transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-6 py-4 rounded-full transition-all font-semibold shadow-lg shadow-[#FF8C00]/20 hover:shadow-xl hover:shadow-[#FF8C00]/30"
            >
              Sign In
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#FFDAB9]/60 text-sm font-light">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-[#FF8C00] hover:text-[#DAA520] transition-colors font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}