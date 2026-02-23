import { Link } from 'react-router-dom'

export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link to="/" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium mb-8 inline-block">
          Back to Toolstoy
        </Link>
        <h1 className="font-bold text-[36px] text-[#1A1A1A]">Refund Policy</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">Last updated: February 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-[#1A1A1A] leading-[1.7]">
          <section>
            <h2 className="font-semibold text-[18px] mb-2">1. General Policy</h2>
            <p>
              Toolstoy offers a 30-day money-back guarantee for new customers. If you're not satisfied with our service within the first 30 days of your initial subscription, we'll provide a full refund.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. Eligibility for Refunds</h2>
            <p>Refunds are available under the following conditions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>First-time customers within 30 days of initial subscription</li>
              <li>Service downtime exceeding 24 hours in a billing cycle</li>
              <li>Billing errors or unauthorized charges</li>
              <li>Service discontinuation for features you paid for</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Non-Refundable Items</h2>
            <p>The following are not eligible for refunds:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Subscriptions older than 30 days (except for service downtime)</li>
              <li>Overage charges for usage beyond plan limits</li>
              <li>Custom development or professional services</li>
              <li>Third-party integrations or add-ons</li>
              <li>Unused portions of your subscription period</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Contact our support team at <a href="mailto:support@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">support@toolstoy.app</a></li>
              <li>Include your account email and reason for refund request</li>
              <li>Provide any relevant details about your experience</li>
              <li>We'll process your request within 5 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. Refund Process</h2>
            <p>Once your refund is approved:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Refunds are processed to your original payment method</li>
              <li>Processing time varies by payment provider (typically 5-10 business days)</li>
              <li>Your account will be downgraded to the free tier</li>
              <li>You'll retain access to your data for 30 days after refund</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Service Credits</h2>
            <p>
              In some cases, we may offer service credits instead of refunds for partial month service issues. Credits will be applied to your next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">7. Subscription Cancellations</h2>
            <p>
              You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period, and you'll continue to have access until then. No refunds are provided for partial months unless covered by this policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">8. Free Trials</h2>
            <p>
              Free trials require payment method authorization but no charges occur during the trial period. If you don't cancel before the trial ends, you'll be charged for the first billing period and the standard refund policy applies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this refund policy from time to time. Changes will be posted on our website and become effective immediately. Your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">10. Contact Information</h2>
            <p>
              For refund requests or questions about this policy, please contact us at{' '}
              <a href="mailto:billing@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                billing@toolstoy.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">11. Legal Disclaimer</h2>
            <p>
              This refund policy is governed by the laws of the jurisdiction where Toolstoy operates. In the event of a dispute, we first attempt to resolve it through good faith negotiation.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
