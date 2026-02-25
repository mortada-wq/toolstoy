import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMerchant } from '@/hooks/useMerchant'
import { usePersonas } from '@/hooks/usePersonas'
import { getCheckoutUrl, getManageBillingUrl } from '@/lib/billing'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    subtext: 'Forever. No credit card.',
    features: [
      '1 character maximum',
      '100 conversations per month',
      'Basic knowledge base (10 Q&A pairs)',
      '1 website embed',
      'Community support only',
      'Toolstoy branding visible on widget',
    ],
    pillStyle: 'bg-[#F5F5F5] text-[#6B7280]',
    currentLabel: 'Current Plan',
    action: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    subtext: 'per month, billed monthly',
    features: [
      '5 characters',
      'Unlimited conversations',
      'Auto-generated knowledge base',
      'Unlimited website embeds',
      'All 7 widget layouts',
      'Toolstizer analytics access',
      'Email support',
      'No Toolstoy branding on widget',
    ],
    pillStyle: 'bg-[#1A1A1A] text-white',
    currentLabel: null,
    action: 'Upgrade',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 'Custom',
    subtext: 'For teams and agencies.',
    features: [
      'Unlimited characters',
      'Unlimited conversations',
      'White-label widget',
      'Custom animation states',
      'Priority support',
      'Dedicated onboarding',
      'SLA guarantee',
      'API access',
      'Multiple team members',
    ],
    pillStyle: 'bg-[#1A1A1A] text-white',
    currentLabel: null,
    action: 'Contact Sales',
  },
]

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const isUnlimited = limit >= 999999
  const showWarning = !isUnlimited && pct >= 90

  return (
    <div className="mt-6 first:mt-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-medium text-[13px] text-[#1A1A1A]">{label}</span>
        <span className="text-[13px] text-[#6B7280] font-normal">
          {isUnlimited ? `${used} used` : `${used} of ${limit} used`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${showWarning ? 'bg-[#EF4444]' : 'bg-[#1A1A1A]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function BillingPage() {
  const { merchant, isLoading: merchantLoading, error: merchantError } = useMerchant()
  const { personas, isLoading: personasLoading } = usePersonas()
  const [billingLoading, setBillingLoading] = useState<string | null>(null)

  const plan = merchant?.plan ?? 'free'
  const limits = merchant?.plan_limits ?? { characters: 1, conversations: 100, qa_pairs: 10 }
  const charactersUsed = personas.length
  const conversationsUsed = merchant?.conversations_this_month ?? 0
  const qaUsed = 0

  const planExpires = merchant?.plan_expires_at
  const renewalText = plan !== 'free' && planExpires
    ? `Renews ${new Date(planExpires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : plan === 'free'
    ? 'No renewal'
    : null

  const atCharacterLimit = plan === 'free' && charactersUsed >= limits.characters

  return (
    <div className="p-8 md:p-8 bg-[#F5F5F5] min-h-[calc(100vh-64px)]">
      <div className="max-w-[640px]">
        <h2 className="font-bold text-[22px] text-[#1A1A1A]">Billing</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Manage your subscription and usage.
        </p>

        {merchantError && (
          <p className="mt-4 text-[13px] text-[#EF4444]">Couldn&apos;t load billing. Try refreshing.</p>
        )}

        {(merchantLoading || personasLoading) ? (
          <div className="mt-6 bg-white border border-[#E5E7EB] rounded-lg p-8 animate-pulse">
            <div className="h-6 w-1/3 bg-[#F5F5F5] rounded" />
            <div className="mt-4 h-4 w-1/2 bg-[#F5F5F5] rounded" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-[#F5F5F5] rounded" />
              ))}
            </div>
          </div>
        ) : merchant ? (
          <>
            {/* Character limit upgrade prompt */}
            {atCharacterLimit && (
              <div className="mt-6 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg py-5 px-6">
                <p className="font-semibold text-[15px] text-[#1A1A1A]">
                  You&apos;ve reached your character limit.
                </p>
                <p className="mt-1 text-[14px] text-[#6B7280]">
                  Upgrade to Pro to create up to 5 characters.
                </p>
                <Link
                  to="/dashboard/billing#plans"
                  className="mt-3 inline-block text-[14px] text-[#1A1A1A] underline font-medium hover:no-underline"
                >
                  View Plans →
                </Link>
              </div>
            )}

            {/* Current plan card */}
            <div className="mt-6 bg-white border border-[#E5E7EB] rounded-lg p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block font-medium text-[12px] px-3 py-1 rounded-full ${
                    plan === 'free' ? 'bg-[#F5F5F5] text-[#6B7280]' : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Studio'}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[22px] text-[#1A1A1A]">
                {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Studio'}
              </h3>
              {renewalText && (
                <p className="mt-1 text-[14px] text-[#6B7280]">{renewalText}</p>
              )}

              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <UsageMeter label="Characters" used={charactersUsed} limit={limits.characters} />
                <UsageMeter label="Conversations" used={conversationsUsed} limit={limits.conversations} />
                <UsageMeter label="Q&A Pairs" used={qaUsed} limit={limits.qa_pairs} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {(plan === 'free' || plan === 'pro') && (
                  <Link
                    to="/dashboard/billing#plans"
                    className="inline-block bg-[#1A1A1A] text-white font-semibold text-[15px] px-5 py-3 rounded-lg hover:opacity-90"
                  >
                    Upgrade Plan
                  </Link>
                )}
                {plan !== 'free' && (
                  <button
                    type="button"
                    disabled={!!billingLoading}
                    onClick={async () => {
                      setBillingLoading('portal')
                      try {
                        const url = await getManageBillingUrl()
                        window.location.href = url
                      } catch {
                        setBillingLoading(null)
                      }
                    }}
                    className="inline-block border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-3 rounded-lg hover:bg-[#FAFAFA] disabled:opacity-60"
                  >
                    {billingLoading === 'portal' ? 'Opening…' : 'Manage Billing'}
                  </button>
                )}
              </div>
            </div>

            {/* Plan comparison */}
            <div id="plans" className="mt-8">
              <h3 className="font-semibold text-[17px] text-[#1A1A1A] mb-4">Plan Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => {
                  const isCurrent = p.id === plan
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg p-6 ${
                        p.id === 'pro'
                          ? 'bg-[#1A1A1A] md:scale-[1.02]'
                          : 'bg-white border border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`font-medium text-[12px] px-2.5 py-0.5 rounded-full ${
                            p.id === 'pro' ? 'bg-white/15 text-[#9CA3AF]' : 'bg-[#F5F5F5] text-[#6B7280]'
                          }`}
                        >
                          {p.id.toUpperCase()}
                        </span>
                        {isCurrent && (
                          <span className="font-medium text-[11px] px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <p className={`font-bold text-3xl ${p.id === 'pro' ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {p.price}
                      </p>
                      <p className={`mt-0.5 text-[13px] ${p.id === 'pro' ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                        {p.subtext}
                      </p>
                      <div className={`border-t my-5 ${p.id === 'pro' ? 'border-white/15' : 'border-[#E5E7EB]'}`} />
                      <ul className="space-y-2.5">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className={`flex items-start gap-2 text-[14px] ${
                              p.id === 'pro' ? 'text-white' : 'text-[#1A1A1A]'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {p.action && !isCurrent && (
                        <div className="mt-6">
                          {p.id === 'studio' ? (
                            <a
                              href="mailto:hello@toolstoy.app?subject=Studio%20plan%20inquiry"
                              className="block w-full bg-[#1A1A1A] text-white font-semibold text-[14px] py-3 rounded-lg text-center hover:opacity-90"
                            >
                              Talk to Us
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled={!!billingLoading}
                              onClick={async () => {
                                setBillingLoading('checkout')
                                try {
                                  const url = await getCheckoutUrl('pro')
                                  window.location.href = url
                                } catch {
                                  setBillingLoading(null)
                                }
                              }}
                              className="block w-full bg-white text-[#1A1A1A] font-semibold text-[14px] py-3 rounded-lg text-center hover:bg-[#F5F5F5] disabled:opacity-60"
                            >
                              {billingLoading === 'checkout' ? 'Opening…' : p.action}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
