import { Link } from 'react-router-dom'

export function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <Link to="/" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] font-medium mb-8 inline-block">
          Back to Toolstoy
        </Link>
        <h1 className="font-bold text-[36px] text-[#1A1A1A]">Security Policy</h1>
        <p className="mt-2 text-[14px] text-[#6B7280]">Last updated: February 2026</p>

        <div className="mt-10 space-y-6 text-[15px] text-[#1A1A1A] leading-[1.7]">
          <section>
            <h2 className="font-semibold text-[18px] mb-2">1. Our Security Commitment</h2>
            <p>
              At Toolstoy, security is fundamental to our service. We implement industry-leading security measures to protect your data and ensure the reliability of our platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">2. Infrastructure Security</h2>
            <p>Our infrastructure is built on AWS with the following security measures:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Network Security:</strong> VPC isolation, security groups, and network ACLs</li>
              <li><strong>Encryption:</strong> AES-256 encryption for data at rest and TLS 1.3 for data in transit</li>
              <li><strong>Access Control:</strong> Multi-factor authentication (MFA) for all administrative access</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and threat detection</li>
              <li><strong>Compliance:</strong> SOC 2 Type II, ISO 27001, and GDPR compliant infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">3. Application Security</h2>
            <p>We implement comprehensive application security measures:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Authentication:</strong> Secure password policies and session management</li>
              <li><strong>Authorization:</strong> Role-based access control (RBAC) with principle of least privilege</li>
              <li><strong>Input Validation:</strong> Comprehensive input sanitization and validation</li>
              <li><strong>Secure Coding:</strong> OWASP Top 10 compliance and regular security code reviews</li>
              <li><strong>API Security:</strong> Rate limiting, authentication, and request validation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">4. Data Protection</h2>
            <p>Your data is protected through multiple layers of security:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Encryption:</strong> All data encrypted using industry-standard algorithms</li>
              <li><strong>Key Management:</strong> AWS KMS for secure key management and rotation</li>
              <li><strong>Backup Security:</strong> Encrypted backups with secure storage and access controls</li>
              <li><strong>Data Minimization:</strong> Only collect and store data necessary for service delivery</li>
              <li><strong>Retention Policies:</strong> Automated data deletion based on retention schedules</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">5. AI Security</h2>
            <p>Our AI systems include specific security measures:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Prompt Injection Protection:</strong> Input validation and sanitization</li>
              <li><strong>Content Filtering:</strong> Automated detection and blocking of harmful content</li>
              <li><strong>Model Security:</strong> Secure model deployment and access controls</li>
              <li><strong>Output Validation:</strong> Post-processing and validation of AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">6. Security Monitoring</h2>
            <p>We maintain comprehensive security monitoring:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Real-time Monitoring:</strong> Continuous monitoring of all systems and networks</li>
              <li><strong>Intrusion Detection:</strong> Automated threat detection and alerting</li>
              <li><strong>Log Management:</strong> Centralized logging with secure storage and retention</li>
              <li><strong>Vulnerability Scanning:</strong> Regular automated and manual security assessments</li>
              <li><strong>Penetration Testing:</strong> Quarterly third-party penetration testing</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">7. Incident Response</h2>
            <p>Our incident response program includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>24/7 Response Team:</strong> Dedicated security team available around the clock</li>
              <li><strong>Incident Classification:</strong> Structured severity assessment and prioritization</li>
              <li><strong>Communication Plan:</strong> Timely notification to affected customers</li>
              <li><strong>Post-Incident Review:</strong> Root cause analysis and improvement implementation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">8. Compliance and Certifications</h2>
            <p>We maintain compliance with major security standards:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>SOC 2 Type II:</strong> Annual audits of security controls</li>
              <li><strong>ISO 27001:</strong> Information security management system certification</li>
              <li><strong>GDPR:</strong> Full compliance with EU data protection regulations</li>
              <li><strong>CCPA:</strong> Compliance with California Consumer Privacy Act</li>
              <li><strong>HIPAA:</strong> Available for healthcare customers (Business Associate Agreement)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">9. Your Security Responsibilities</h2>
            <p>Help us keep your account secure by:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Using strong, unique passwords and enabling MFA</li>
              <li>Keeping your account credentials confidential</li>
              <li>Regularly reviewing account activity and access logs</li>
              <li>Reporting suspicious activity immediately</li>
              <li>Keeping your browser and software updated</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">10. Vulnerability Disclosure</h2>
            <p>
              If you discover a security vulnerability, please report it responsibly to{' '}
              <a href="mailto:security@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                security@toolstoy.app
              </a>
              . We commit to responding within 24 hours and providing regular updates.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">11. Security Updates</h2>
            <p>
              We continuously improve our security measures. This policy is updated as our security practices evolve. Significant changes will be communicated to customers.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[18px] mb-2">12. Contact Security Team</h2>
            <p>
              For security concerns or questions, contact our security team at{' '}
              <a href="mailto:security@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                security@toolstoy.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
