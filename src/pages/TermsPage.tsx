import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link to="/" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium mb-8 inline-block">
          Back to Toolstoy
        </Link>
        <h1 className="font-bold text-[36px] text-[#1A1A1A]">Terms of Service</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">Last updated: February 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-[#1A1A1A] leading-[1.7]">
          <section>
            <h2 className="font-semibold text-[18px] mb-2">1. Agreement</h2>
            <p>
              By using Toolstoy (&quot;Service&quot;), you agree to these Terms of Service. If you do not agree,
              do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. Use of Service</h2>
            <p>
              You may use Toolstoy to create AI-powered product characters for your e-commerce business.
              You are responsible for the content you create and how you use the Service. You must not
              use the Service for unlawful purposes or to harm others.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Account and Billing</h2>
            <p>
              You must provide accurate account information. Paid plans are billed according to the
              pricing at the time of subscription. You may cancel at any time.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. Intellectual Property</h2>
            <p>
              You retain ownership of your content. By using the Service, you grant Toolstoy a
              limited license to process your content to provide the Service. Toolstoy and its
              branding remain our property.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is.&quot; We are not liable for indirect, incidental, or
              consequential damages. Our total liability is limited to the amount you paid in the
              past 12 months.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:hello@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                hello@toolstoy.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
