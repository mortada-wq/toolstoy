/**
 * Billing API helpers.
 * Uses server-side Stripe sessions (create-checkout-session, create-portal-session).
 */
import { createCheckoutSession, createPortalSession } from '@/lib/api'

const CONTACT_SALES_EMAIL = 'hello@toolstoy.app'

/** Returns Stripe checkout URL for Pro, or mailto for Studio. */
export async function getCheckoutUrl(planId: 'pro' | 'studio'): Promise<string> {
  if (planId === 'studio') {
    return `mailto:${CONTACT_SALES_EMAIL}?subject=Studio%20plan%20inquiry`
  }
  const { url } = await createCheckoutSession('pro')
  return url
}

/** Returns Stripe customer portal URL. */
export async function getManageBillingUrl(): Promise<string> {
  const { url } = await createPortalSession()
  return url
}
