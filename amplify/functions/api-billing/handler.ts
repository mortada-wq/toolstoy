import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import Stripe from 'stripe'
import { query, queryOne, transaction } from '../soul-engine/database'

const corsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
})

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
}

function getAuthCognitoId(event: Parameters<APIGatewayProxyHandlerV2>[0]): string | null {
  const headers = event.headers ?? {}
  const authHeader = headers?.authorization ?? headers?.Authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const payload = decodeJwtPayload(token) as Record<string, string>
    return payload.sub ?? null
  } catch {
    return null
  }
}

interface MerchantRow {
  id: string
  cognito_id: string
  email: string
  name: string
  stripe_customer_id: string | null
  plan: string
  plan_limits: Record<string, number> | null
}

async function getOrCreateMerchant(cognitoId: string, email: string, name: string): Promise<MerchantRow> {
  let m = await queryOne<MerchantRow>(
    'SELECT id, cognito_id, email, name, stripe_customer_id, plan, plan_limits FROM merchants WHERE cognito_id = $1',
    [cognitoId]
  )
  if (m) return m
  await query(
    `INSERT INTO merchants (cognito_id, email, name, plan, plan_limits)
     VALUES ($1, $2, $3, 'free', '{"characters":1,"conversations":100,"qa_pairs":10}'::jsonb)
     ON CONFLICT (cognito_id) DO NOTHING`
  , [cognitoId, email, name])
  m = await queryOne<MerchantRow>(
    'SELECT id, cognito_id, email, name, stripe_customer_id, plan, plan_limits FROM merchants WHERE cognito_id = $1',
    [cognitoId]
  )
  if (!m) throw new Error('Failed to create merchant')
  return m
}

const PRO_LIMITS = { characters: 5, conversations: 999999, qa_pairs: 999999 }

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? (event as { path?: string }).path ?? ''
  const httpMethod = event.requestContext?.http?.method ?? (event as { httpMethod?: string }).httpMethod ?? 'POST'
  const pathNorm = rawPath.replace(/^\/api\/billing\/?/, '').replace(/^\//, '')

  // Webhook: no auth, raw body for Stripe signature
  if (httpMethod === 'POST' && pathNorm === 'webhook') {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!stripeSecret || !webhookSecret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Billing not configured' }), headers: corsHeaders() }
    }
    const stripe = new Stripe(stripeSecret)
    const sig = (event.headers ?? {})['stripe-signature'] ?? (event.headers ?? {})['Stripe-Signature'] ?? ''
    const body = event.body ?? ''
    let ev: Stripe.Event
    try {
      ev = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }), headers: corsHeaders() }
    }
    if (ev.type === 'checkout.session.completed') {
      const session = ev.data.object as Stripe.Checkout.Session
      const cognitoId = session.client_reference_id
      const subId = session.subscription as string | null
      if (!cognitoId || !subId) {
        console.error('Missing client_reference_id or subscription in session')
        return { statusCode: 200, body: JSON.stringify({ received: true }), headers: corsHeaders() }
      }
      const sub = await stripe.subscriptions.retrieve(subId)
      const periodEnd = sub.current_period_end
      await transaction(async (client) => {
        await client.query(
          `UPDATE merchants SET
            stripe_subscription_id = $1,
            plan = 'pro',
            plan_started_at = COALESCE(plan_started_at, NOW()),
            plan_expires_at = to_timestamp($2),
            plan_limits = $3::jsonb,
            updated_at = NOW()
          WHERE cognito_id = $4`,
          [subId, periodEnd, JSON.stringify(PRO_LIMITS), cognitoId]
        )
      })
    } else if (ev.type === 'customer.subscription.deleted' || ev.type === 'customer.subscription.updated') {
      const sub = ev.data.object as Stripe.Subscription
      const subId = sub.id
      const stripeCustomerId = sub.customer as string
      const isActive = sub.status === 'active'
      if (!isActive) {
        await query(
          `UPDATE merchants SET
            stripe_subscription_id = NULL,
            plan = 'free',
            plan_limits = '{"characters":1,"conversations":100,"qa_pairs":10}'::jsonb,
            plan_expires_at = NULL,
            updated_at = NOW()
          WHERE stripe_subscription_id = $1`,
          [subId]
        )
      } else {
        const periodEnd = sub.current_period_end
        await query(
          `UPDATE merchants SET
            plan = 'pro',
            plan_expires_at = to_timestamp($1),
            plan_limits = $2::jsonb,
            updated_at = NOW()
          WHERE stripe_subscription_id = $3`,
          [periodEnd, JSON.stringify(PRO_LIMITS), subId]
        )
      }
    }
    return { statusCode: 200, body: JSON.stringify({ received: true }), headers: corsHeaders() }
  }

  const cognitoId = getAuthCognitoId(event)
  if (!cognitoId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const priceIdPro = process.env.STRIPE_PRICE_ID_PRO
  if (!stripeSecret || !priceIdPro) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Billing not configured' }), headers: corsHeaders() }
  }
  const stripe = new Stripe(stripeSecret)

  // Create checkout session
  if (httpMethod === 'POST' && pathNorm === 'create-checkout-session') {
    let body: { plan?: string } = {}
    try {
      body = event.body ? JSON.parse(event.body) : {}
    } catch {
      body = {}
    }
    const plan = (body.plan ?? 'pro') as string
    if (plan === 'studio') {
      return {
        statusCode: 200,
        body: JSON.stringify({ url: 'mailto:hello@toolstoy.app?subject=Studio%20plan%20inquiry' }),
        headers: corsHeaders(),
      }
    }
    const payload = decodeJwtPayload(
      ((event.headers ?? {}).authorization ?? (event.headers ?? {}).Authorization ?? '').slice(7)
    ) as Record<string, string>
    const email = payload.email ?? payload.preferred_username ?? ''
    const name = payload.name ?? email
    const merchant = await getOrCreateMerchant(cognitoId, email, name)
    let customerId = merchant.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email, name, metadata: { cognito_id: cognitoId } })
      customerId = customer.id
      await query(
        'UPDATE merchants SET stripe_customer_id = $1, updated_at = NOW() WHERE cognito_id = $2',
        [customerId, cognitoId]
      )
    }
    const origin = (event.headers ?? {})['origin'] ?? (event.headers ?? {})['Origin'] ?? 'https://toolstoy.app'
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: cognitoId,
      mode: 'subscription',
      line_items: [{ price: priceIdPro, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      subscription_data: { metadata: { cognito_id: cognitoId } },
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
      headers: corsHeaders(),
    }
  }

  // Create portal session
  if (httpMethod === 'POST' && pathNorm === 'create-portal-session') {
    const payload = decodeJwtPayload(
      ((event.headers ?? {}).authorization ?? (event.headers ?? {}).Authorization ?? '').slice(7)
    ) as Record<string, string>
    const email = payload.email ?? payload.preferred_username ?? ''
    const name = payload.name ?? email
    const merchant = await getOrCreateMerchant(cognitoId, email, name)
    if (!merchant.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No billing account. Upgrade first.' }),
        headers: corsHeaders(),
      }
    }
    const origin = (event.headers ?? {})['origin'] ?? (event.headers ?? {})['Origin'] ?? 'https://toolstoy.app'
    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
      headers: corsHeaders(),
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

export { handler }
