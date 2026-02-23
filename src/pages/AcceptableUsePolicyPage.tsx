import { Link } from 'react-router-dom'

export function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link to="/" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium mb-8 inline-block">
          Back to Toolstoy
        </Link>
        <h1 className="font-bold text-[36px] text-[#1A1A1A]">Acceptable Use Policy</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">Last updated: February 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-[#1A1A1A] leading-[1.7]">
          <section>
            <h2 className="font-semibold text-[18px] mb-2">1. Purpose</h2>
            <p>
              This Acceptable Use Policy (&quot;Policy&quot;) outlines the rules and guidelines for using Toolstoy's services. By using our service, you agree to comply with this Policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. Prohibited Activities</h2>
            <p>You may not use Toolstoy to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Create characters that promote illegal activities, hate speech, or discrimination</li>
              <li>Generate content that is defamatory, obscene, pornographic, or offensive</li>
              <li>Infringe on intellectual property rights (copyrights, trademarks, patents)</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Engage in fraudulent activities or scams</li>
              <li>Distribute malware, viruses, or other harmful code</li>
              <li>Spam or send unsolicited commercial messages</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Character Content Guidelines</h2>
            <p>Characters created on Toolstoy must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Be appropriate for general business audiences</li>
              <li>Not contain explicit or offensive language</li>
              <li>Not promote harmful or dangerous activities</li>
              <li>Respect cultural and religious sensitivities</li>
              <li>Comply with industry-specific regulations (e.g., healthcare, finance)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. Widget Usage</h2>
            <p>When embedding Toolstoy widgets on your website:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Clearly disclose that users are interacting with an AI assistant</li>
              <li>Do not misrepresent the AI as a human employee</li>
              <li>Ensure the widget doesn't interfere with website accessibility</li>
              <li>Comply with applicable disclosure requirements for AI interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. Data and Privacy</h2>
            <p>You must not:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Collect personal information through characters without proper disclosure</li>
              <li>Use characters to harvest data from website visitors</li>
              <li>Violate privacy laws or regulations in your jurisdiction</li>
              <li>Share sensitive information through AI characters without user consent</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Commercial Use</h2>
            <p>
              Toolstoy is designed for legitimate business use. You may not use the service for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Competing directly with Toolstoy's services</li>
              <li>Reselling or redistributing access to our platform</li>
              <li>Creating misleading or deceptive commercial practices</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">7. Enforcement</h2>
            <p>
              We monitor compliance with this Policy through automated systems and user reports. Violations may result in:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Warning or notice of violation</li>
              <li>Temporary suspension of service</li>
              <li>Permanent termination of account</li>
              <li>Removal of violating content</li>
              <li>Legal action if necessary</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">8. Reporting Violations</h2>
            <p>
              If you believe someone is violating this Policy, please report it to us at{' '}
              <a href="mailto:abuse@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                abuse@toolstoy.app
              </a>
              {' '}with details of the alleged violation.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">9. Policy Updates</h2>
            <p>
              We may update this Policy from time to time. Changes will be posted on our website and become effective immediately. Your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">10. Contact</h2>
            <p>
              Questions about this Policy? Contact us at{' '}
              <a href="mailto:legal@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                legal@toolstoy.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
