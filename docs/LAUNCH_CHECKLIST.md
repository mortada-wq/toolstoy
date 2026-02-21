# Launch Readiness Checklist

Before going live. Every item must be confirmed.

## Technical

- [ ] Sign up end-to-end works on real device
- [ ] Email verification arrives within 2 minutes
- [ ] Character generation completes under 8 minutes
- [ ] Widget loads on a real merchant test page
- [ ] Chat responds in under 1500ms
- [ ] Widget works on Wix test site
- [ ] Widget works on WordPress test site
- [ ] Widget works on plain HTML
- [ ] All API rate limits configured (API Gateway or Lambda)
- [ ] Prompt injection blocked and logged
- [ ] Database backups automated (if using RDS)
- [ ] CloudWatch alarms for Lambda errors, latency
- [ ] Secrets in Secrets Manager (no secrets in code)
- [ ] HTTPS everywhere
- [ ] CORS: restrict to toolstoy.app for main API; widget chat allows any origin

## Product

- [ ] Free plan limits enforced (character count)
- [ ] Upgrade prompts appear at right moments
- [ ] Public character page works and shareable
- [ ] Onboarding flow tested with new account
- [ ] Account deletion works
- [ ] Billing provider configured (Stripe or AWS Marketplace)
- [ ] Set VITE_BILLING_PROVIDER, VITE_STRIPE_CHECKOUT_URL in hosting env

## Content

- [ ] No Lorem ipsum in production
- [ ] No dummy/hardcoded data
- [ ] All error messages human and helpful
- [ ] toolstoy.app domain resolves
- [ ] SSL certificate valid

## Mobile

- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 14 (390px)
- [ ] Test on Android (360px)
- [ ] Test on iPad (768px)
- [ ] Input font-size 16px (no iOS zoom)
- [ ] Touch targets min 44x44px
- [ ] Sidebar overlay closes on outside tap
- [ ] Widget full screen on phones
- [ ] Keyboard does not cover send button

## Legal

- [ ] Terms of Service linked in footer and signup
- [ ] Privacy Policy linked in footer and signup
- [ ] Cookie notice if required
