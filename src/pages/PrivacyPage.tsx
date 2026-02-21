import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link to="/" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium mb-8 inline-block">
          Back to Toolstoy
        </Link>
        <h1 className="font-bold text-[36px] text-[#1A1A1A]">Privacy Policy</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">Last updated: February 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-[#1A1A1A] leading-[1.7]">
          <section>
            <h2 className="font-semibold text-[18px] mb-2">1. Data We Collect</h2>
            <p>
              We collect account information (email, name), product and character data you create,
              and conversation data from widget chats. We use this to provide and improve the Service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. How We Use Data</h2>
            <p>
              Your data powers your AI characters and is processed to deliver chat responses. We do
              not sell your data. We may use anonymized data to improve our models and service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Data Storage and Security</h2>
            <p>
              Data is stored on Amazon Web Services within the region you select. We use industry
              standard measures to protect your data. You can delete your account and data at any time
              from Account Settings.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. Third Parties</h2>
            <p>
              We use AWS for infrastructure. Our AI runs on Amazon Bedrock within AWS. No third-party
              AI providers receive your data. We do not share your data with advertisers.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. Your Rights</h2>
            <p>
              You can access, correct, or delete your data. Contact us for data portability or other
              privacy requests. If you are in the EEA/UK, you have additional rights under GDPR.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Contact</h2>
            <p>
              Privacy questions? Email{' '}
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
