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
            <h2 className="font-semibold text-[18px] mb-2">1. Information We Collect</h2>
            <p>We collect several types of information to provide and improve our service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, and company details when you register</li>
              <li><strong>Product Data:</strong> Product images, descriptions, and URLs you provide for character creation</li>
              <li><strong>Character Data:</strong> AI-generated characters, personality traits, and configuration settings</li>
              <li><strong>Usage Data:</strong> Widget interactions, chat conversations, and analytics data</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and access logs</li>
              <li><strong>Payment Data:</strong> Billing information processed through secure third-party payment processors</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide, maintain, and improve the Toolstoy service</li>
              <li>Generate and customize AI characters based on your products</li>
              <li>Process and respond to widget chat interactions</li>
              <li>Send service-related communications and support</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely on Amazon Web Services (AWS) infrastructure within the region you select. We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Encryption of data at rest and in transit</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. AI and Machine Learning</h2>
            <p>
              Our AI systems process your data to generate characters and responses. We use Amazon Bedrock services within AWS, and your data is not shared with third-party AI providers. We may use anonymized, aggregated data to improve our AI models, but never your specific business data.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. Data Sharing and Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal information. We only share data in limited circumstances:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>AWS:</strong> For infrastructure and AI services (Bedrock, S3, etc.)</li>
              <li><strong>Payment Processors:</strong> To process subscription payments</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Maintain your login session</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze website usage and performance</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p className="mt-2">You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">7. Data Retention</h2>
            <p>
              We retain your data for as long as necessary to provide the service and comply with legal obligations. You can request deletion of your account and data at any time from Account Settings. Some data may be retained in anonymized form for analytics and service improvement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">8. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p className="mt-2">EEA/UK users have additional rights under GDPR. California residents have rights under CCPA.</p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including AWS's compliance with EU-US Data Privacy Framework and other international frameworks.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">10. Children's Privacy</h2>
            <p>
              Toolstoy is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information immediately.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">11. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by email or prominent notice on our website. Your continued use of the service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">12. Contact Information</h2>
            <p>
              For privacy questions, data subject requests, or concerns about our privacy practices, please contact us at{' '}
              <a href="mailto:privacy@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                privacy@toolstoy.app
              </a>
            </p>
            <p className="mt-2">
              Our data protection officer can be reached at{' '}
              <a href="mailto:dpo@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                dpo@toolstoy.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
