/**
 * Billing provider configuration.
 * Set BILLING_PROVIDER via env: 'stripe' | 'aws_marketplace'
 * When Stripe: configure STRIPE_CHECKOUT_URL or create sessions server-side.
 * When aws_marketplace: use AWS Marketplace API.
 */
const BILLING_PROVIDER = (import.meta.env.VITE_BILLING_PROVIDER ?? 'stripe') as string
const STRIPE_CHECKOUT_URL = import.meta.env.VITE_STRIPE_CHECKOUT_URL ?? ''
const CONTACT_SALES_EMAIL = 'hello@toolstoy.app'

export function getCheckoutUrl(planId: 'pro' | 'studio'): string {
  if (planId === 'studio') {
    return `mailto:${CONTACT_SALES_EMAIL}?subject=Studio%20plan%20inquiry`
  }
  if (BILLING_PROVIDER === 'stripe' && STRIPE_CHECKOUT_URL) {
    return `${STRIPE_CHECKOUT_URL}?plan=pro`
  }
  if (BILLING_PROVIDER === 'aws_marketplace') {
    return '/dashboard/billing#plans'
  }
  return `mailto:${CONTACT_SALES_EMAIL}?subject=Pro%20plan%20upgrade`
}

export function getManageBillingUrl(): string {
  if (BILLING_PROVIDER === 'stripe') {
    return import.meta.env.VITE_STRIPE_PORTAL_URL ?? `mailto:${CONTACT_SALES_EMAIL}`
  }
  return `mailto:${CONTACT_SALES_EMAIL}`
}
