import { FAQAccordion } from '../components/FAQAccordion'
import { Button } from '../components/ui/Button'

const FAQ_ITEMS = [
  {
    question: 'Does Toolstoy work on platforms other than Shopify?',
    answer: 'Absolutely. Toolstoy works on any website that can run JavaScript — Wix, Squarespace, WordPress, Webflow, or a custom HTML page. Two lines of code. That\'s it.',
  },
  {
    question: 'What AI powers the characters?',
    answer: 'Amazon Bedrock — entirely within AWS infrastructure. No external AI providers. Your data never leaves AWS.',
  },
  {
    question: 'How long does it take to create a character?',
    answer: 'The Soul Engine runs automatically after you submit. Your character is usually ready before you finish your coffee. No manual work required.',
  },
  {
    question: 'Can I customize how the widget looks?',
    answer: 'Yes. You can choose from 7 different widget layouts. Colors, position, and greeting are all configurable from your dashboard.',
  },
  {
    question: 'What happens if my character doesn\'t know the answer to something?',
    answer: 'The character acknowledges it honestly and in-character — no generic "I don\'t know" responses. Toolstizer flags knowledge gaps automatically so you can fill them.',
  },
]

const CHECK = (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export function PricingPage() {
  return (
    <div className="bg-toolstoy-canvas font-inter">
      {/* Hero */}
      <section className="px-4 md:px-6 pt-[64px] md:pt-[100px] pb-8">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="text-[36px] md:text-[56px] font-bold text-toolstoy-nearblack">
            Simple Pricing. No Surprises.
          </h1>
          <p className="mt-4 text-[17px] md:text-xl text-toolstoy-muted">
            Start free. Pay when your characters start working.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 md:px-6 py-10 md:py-16 lg:py-[60px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-toolstoy-softgrey rounded-lg p-9">
              <p className="font-semibold text-sm text-toolstoy-muted uppercase tracking-widest mb-3">
                Starter
              </p>
              <p className="font-bold text-5xl text-toolstoy-nearblack">Free</p>
              <p className="mt-1 text-sm text-toolstoy-muted">Forever. No credit card.</p>
              <div className="border-t border-gray-200 my-6" />
              <div className="space-y-3.5">
                {['1 character', '100 conversations/month', 'Basic knowledge base (10 Q&A pairs)', 'Widget embed on 1 website', 'Community support'].map((f) => (
                  <div key={f} className="flex items-start gap-3.5">
                    <span className="text-toolstoy-charcoal mt-0.5">{CHECK}</span>
                    <span className="text-[15px] text-toolstoy-nearblack">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center">
                <Button to="/signup" variant="primary" size="md" className="hover:opacity-90">
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Pro - Featured */}
            <div className="bg-toolstoy-charcoal rounded-lg p-9 md:scale-[1.04] md:z-10 relative">
              <span className="inline-block bg-white text-[#282C34] font-semibold text-[14px] px-3 py-1 rounded-full mb-4">
                Most Popular
              </span>
              <p className="font-semibold text-sm text-toolstoy-muted uppercase tracking-widest mb-3">
                Pro
              </p>
              <p className="font-bold text-5xl text-white">$49</p>
              <p className="mt-1 text-sm text-toolstoy-muted">per month, billed monthly</p>
              <div className="border-t border-white/15 my-6" />
              <div className="space-y-3.5">
                {['5 characters', 'Unlimited conversations', 'Auto-generated knowledge base', 'Widget on unlimited websites', '4 animation states', 'Toolstizer analytics dashboard', 'Email support'].map((f) => (
                  <div key={f} className="flex items-start gap-3.5">
                    <span className="text-white mt-0.5">{CHECK}</span>
                    <span className="text-[15px] text-white">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center">
                <Button to="/signup" variant="light" size="md">
                  Start Pro Trial
                </Button>
              </div>
            </div>

            {/* Studio */}
            <div className="bg-toolstoy-softgrey rounded-lg p-9">
              <p className="font-semibold text-sm text-toolstoy-muted uppercase tracking-widest mb-3">
                Studio
              </p>
              <p className="font-bold text-5xl text-toolstoy-nearblack">Custom</p>
              <p className="mt-1 text-sm text-toolstoy-muted">For teams and agencies.</p>
              <div className="border-t border-gray-200 my-6" />
              <div className="space-y-3.5">
                {['Unlimited characters', 'Unlimited conversations', 'White-label widget', 'Custom animation states', 'Priority support', 'Dedicated onboarding', 'SLA guarantee'].map((f) => (
                  <div key={f} className="flex items-start gap-3.5">
                    <span className="text-toolstoy-charcoal mt-0.5">{CHECK}</span>
                    <span className="text-[15px] text-toolstoy-nearblack">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center">
                <Button href="mailto:hello@toolstoy.app" variant="primary" size="md" className="hover:opacity-90">
                  Talk to Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-6 py-12 md:py-20 lg:py-[80px] bg-toolstoy-softgrey">
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-[26px] md:text-[36px] font-bold text-toolstoy-nearblack text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 md:px-6 py-12 md:py-20 lg:py-[80px] bg-toolstoy-charcoal">
        <div className="max-w-[560px] mx-auto text-center">
          <h2 className="text-[28px] md:text-[40px] font-bold text-white">
            Your products are waiting to introduce themselves.
          </h2>
          <Button
            to="/signup"
            variant="light"
            size="lg"
            className="mt-8"
          >
            Create Your First Character Free
          </Button>
        </div>
      </section>
    </div>
  )
}
