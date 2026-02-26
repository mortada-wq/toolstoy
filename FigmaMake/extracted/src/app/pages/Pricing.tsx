import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Check, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Toolstoy',
    features: [
      '1 active character',
      '100 conversations/month',
      '10 Q&A pairs per character',
      'Basic widget customization',
      'Community support',
    ],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      '10 active characters',
      '5,000 conversations/month',
      'Unlimited Q&A pairs',
      'Advanced widget layouts',
      'Priority support',
      'Custom branding',
      'Analytics dashboard',
      'API access',
    ],
    cta: 'Start Pro Trial',
    featured: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 'Custom',
    period: 'contact us',
    description: 'For large teams and enterprises',
    features: [
      'Unlimited characters',
      'Unlimited conversations',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced analytics',
      'Multi-region deployment',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F]">
      {/* Header */}
      <header className="relative border-b border-[#B8860B]/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <Logo />
          <Link 
            to="/sign-in"
            className="text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5DC] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#FFDAB9]/70 max-w-2xl mx-auto">
            Choose the plan that's right for your business. All plans include core features.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Gradient Divider */}
          <div 
            className="h-[2px] mb-12"
            style={{
              background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
              opacity: 0.3,
            }}
          />

          <h2 className="text-3xl font-bold text-[#F5F5DC] mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                question: 'What happens if I exceed my plan limits?',
                answer: 'Your characters will continue to work, but you\'ll need to upgrade to unlock full functionality.',
              },
              {
                question: 'Is there a free trial for Pro?',
                answer: 'Yes! Get 14 days of Pro features completely free. No credit card required.',
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 30-day money-back guarantee if you\'re not satisfied with Pro or Studio.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 hover:border-[#DAA520]/50 transition-all"
              >
                <h3 className="text-[#F5F5DC] font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-[#FFDAB9]/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-[#FFDAB9]/70 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:hello@toolstoy.app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A343C] hover:bg-[#1E262E] text-[#DAA520] border border-[#B8860B]/30 hover:border-[#DAA520]/50 rounded-full transition-all"
          >
            Contact Sales
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function PlanCard({ plan, index }: { plan: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className={`relative bg-[#2A343C] border-2 rounded-2xl p-8 hover:border-[#DAA520]/50 transition-all ${
        plan.featured 
          ? 'border-[#FF8C00] transform lg:scale-105' 
          : 'border-[#B8860B]/30'
      }`}
    >
      {/* Gradient stroke accent for featured */}
      {plan.featured && (
        <>
          <div 
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{
              background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
            }}
          />
          
          {/* Featured Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC] text-xs font-bold rounded-full">
              MOST POPULAR
            </span>
          </div>
        </>
      )}

      <h3 className="text-2xl font-bold text-[#F5F5DC] mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-[#FF8C00]">{plan.price}</span>
        {plan.period && (
          <span className="text-[#FFDAB9]/60 text-sm ml-2">/ {plan.period}</span>
        )}
      </div>
      <p className="text-[#FFDAB9]/70 text-sm mb-6">{plan.description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#DAA520] flex-shrink-0 mt-0.5" />
            <span className="text-[#FFDAB9] text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to="/sign-up"
        className={`block w-full py-3 px-6 font-semibold rounded-full transition-all text-center ${
          plan.featured
            ? 'bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC]'
            : 'bg-[#2A343C] border-2 border-[#B8860B]/50 text-[#F5F5DC] hover:border-[#DAA520]'
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
}