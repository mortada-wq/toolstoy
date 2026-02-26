import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

export function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    console.log('Sign up:', { name, email, password });
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
          <h1 className="text-[#F5F5DC] text-4xl font-bold mb-3">Get Started Free</h1>
          <p className="text-[#FFDAB9]/60 font-light">Start creating living characters today</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-[#2A343C]/60 backdrop-blur-xl border border-[#B8860B]/20 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-[#F5F5DC] mb-3 text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1E262E] text-[#F5F5DC] px-6 py-4 rounded-2xl border border-[#B8860B]/20 focus:outline-none focus:border-[#FF8C00]/40 transition-all placeholder:text-[#6A6A6A]"
                placeholder="Alex Johnson"
                required
              />
            </div>

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

            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded bg-[#1E262E] border-[#B8860B]/20 accent-[#FF8C00] cursor-pointer"
              />
              <label htmlFor="terms" className="text-[#FFDAB9]/70 text-sm font-light leading-relaxed">
                I agree to the{' '}
                <a href="#terms" className="text-[#FF8C00] hover:text-[#DAA520] transition-colors font-medium">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-[#FF8C00] hover:text-[#DAA520] transition-colors font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-6 py-4 rounded-full transition-all font-semibold shadow-lg shadow-[#FF8C00]/20 hover:shadow-xl hover:shadow-[#FF8C00]/30 mt-6"
            >
              Create Account
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#FFDAB9]/60 text-sm font-light">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-[#FF8C00] hover:text-[#DAA520] transition-colors font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#FFDAB9]/40 text-xs mt-8 font-light">
          No credit card required · Free forever plan
        </p>
      </motion.div>
    </div>
  );
}