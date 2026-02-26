import React from 'react';
import { motion } from 'motion/react';
import { Check, CreditCard, ExternalLink } from 'lucide-react';

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
    cta: 'Current Plan',
    isCurrent: true,
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
    ],
    cta: 'Upgrade to Pro',
    isCurrent: false,
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
      'API access',
    ],
    cta: 'Contact Sales',
    isCurrent: false,
  },
];

const usageMetrics = [
  { label: 'Characters', used: 1, total: 1, color: '#FF8C00' },
  { label: 'Conversations', used: 342, total: 100, color: '#DAA520', overLimit: true },
  { label: 'Q&A Pairs', used: 45, total: 10, color: '#B8860B', overLimit: true },
];

export function Billing() {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#F5F5DC] mb-2">Billing & Plans</h1>
        <p className="text-[#FFDAB9]/70 text-lg">Manage your subscription and usage</p>
      </div>

      {/* Current Usage */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#F5F5DC] mb-6">Current Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {usageMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#FFDAB9]/70 text-sm">{metric.label}</p>
                <p className="text-[#F5F5DC] font-bold">
                  {metric.used} <span className="text-[#6A6A6A]">/ {metric.total}</span>
                </p>
              </div>
              
              {/* Usage Bar */}
              <div className="h-2 bg-[#1E262E] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.used / metric.total) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: metric.overLimit ? '#CD5C5C' : metric.color,
                  }}
                />
              </div>
              
              {metric.overLimit && (
                <p className="text-[#CD5C5C] text-xs mt-2">Over limit - upgrade to continue</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Renewal Info */}
        <div className="mt-6 bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[#F5F5DC] font-semibold mb-1">Free Plan</p>
            <p className="text-[#FFDAB9]/60 text-sm">Usage resets monthly • Next reset: March 1, 2026</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all">
            Upgrade Now
          </button>
        </div>
      </section>

      {/* Gradient Divider */}
      <div 
        className="h-[1px] my-12"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
          opacity: 0.3,
        }}
      />

      {/* Plans */}
      <section>
        <h2 className="text-2xl font-bold text-[#F5F5DC] mb-6 text-center">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </section>

      {/* Gradient Divider */}
      <div 
        className="h-[1px] my-12"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
          opacity: 0.3,
        }}
      />

      {/* Payment Method */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#F5F5DC] mb-6">Payment Method</h2>
        <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#1E262E] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#DAA520]" />
            </div>
            <div className="flex-1">
              <p className="text-[#F5F5DC] font-medium">No payment method on file</p>
              <p className="text-[#FFDAB9]/60 text-sm">Add a card to upgrade your plan</p>
            </div>
          </div>
          <button className="w-full py-3 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all">
            Add Payment Method
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="#" className="inline-flex items-center gap-2 text-[#DAA520] hover:text-[#B8860B] transition-colors text-sm">
            <ExternalLink className="w-4 h-4" />
            Manage billing in Stripe
          </a>
        </div>
      </section>
    </div>
  );
}

function PlanCard({ plan, index }: { plan: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-[#2A343C] border-2 rounded-2xl p-8 ${
        plan.isCurrent 
          ? 'border-[#DAA520]' 
          : plan.featured
          ? 'border-[#FF8C00]'
          : 'border-[#B8860B]/30'
      } ${plan.featured ? 'transform lg:scale-105' : ''}`}
    >
      {/* Gradient stroke accent for current/featured */}
      {(plan.isCurrent || plan.featured) && (
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{
            background: plan.isCurrent 
              ? 'linear-gradient(90deg, #DAA520, #B8860B)'
              : 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
          }}
        />
      )}

      {/* Featured Badge */}
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC] text-xs font-bold rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Current Badge */}
      {plan.isCurrent && (
        <div className="absolute top-6 right-6">
          <span className="px-3 py-1 bg-[#DAA520]/20 text-[#DAA520] text-xs font-semibold rounded-full border border-[#DAA520]/30">
            Current
          </span>
        </div>
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
      <button
        disabled={plan.isCurrent}
        className={`w-full py-3 px-6 font-semibold rounded-full transition-all ${
          plan.isCurrent
            ? 'bg-[#1E262E] text-[#6A6A6A] cursor-not-allowed'
            : plan.featured
            ? 'bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC]'
            : 'bg-[#2A343C] border-2 border-[#B8860B]/50 text-[#F5F5DC] hover:border-[#DAA520]'
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}
