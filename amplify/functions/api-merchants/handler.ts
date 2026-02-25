import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { query, queryOne } from '../soul-engine/database'

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
}

const DEFAULT_LIMITS = { characters: 1, conversations: 100, qa_pairs: 10 }
const RESET_AT = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()

interface MerchantRow {
  id: string
  cognito_id: string
  email: string
  name: string
  store_url: string | null
  plan: string
  plan_started_at: string | null
  plan_expires_at: string | null
  plan_limits: Record<string, number> | null
  conversations_this_month: number | null
  conversations_reset_at: string | null
  created_at: string
  updated_at: string
}

async function getOrCreateMerchant(cognitoId: string, email: string, name: string, storeUrl: string | null): Promise<MerchantRow> {
  let m = await queryOne<MerchantRow>(
    `SELECT id, cognito_id, email, name, store_url, plan, plan_started_at, plan_expires_at,
            plan_limits, conversations_this_month, conversations_reset_at, created_at, updated_at
     FROM merchants WHERE cognito_id = $1`,
    [cognitoId]
  )
  if (m) return m
  await query(
    `INSERT INTO merchants (cognito_id, email, name, store_url, plan, plan_limits)
     VALUES ($1, $2, $3, $4, 'free', $5::jsonb)
     ON CONFLICT (cognito_id) DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       store_url = COALESCE(EXCLUDED.store_url, merchants.store_url),
       updated_at = NOW()`,
    [cognitoId, email, name, storeUrl, JSON.stringify(DEFAULT_LIMITS)]
  )
  m = await queryOne<MerchantRow>(
    `SELECT id, cognito_id, email, name, store_url, plan, plan_started_at, plan_expires_at,
            plan_limits, conversations_this_month, conversations_reset_at, created_at, updated_at
     FROM merchants WHERE cognito_id = $1`,
    [cognitoId]
  )
  if (!m) throw new Error('Failed to create merchant')
  return m
}

function merchantToResponse(m: MerchantRow) {
  return {
    id: m.cognito_id,
    cognito_id: m.cognito_id,
    email: m.email,
    name: m.name,
    store_url: m.store_url,
    plan: m.plan,
    plan_started_at: m.plan_started_at,
    plan_expires_at: m.plan_expires_at,
    plan_limits: m.plan_limits ?? DEFAULT_LIMITS,
    conversations_this_month: m.conversations_this_month ?? 0,
    conversations_reset_at: m.conversations_reset_at ?? RESET_AT,
    created_at: m.created_at,
    updated_at: m.updated_at,
  }
}

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? (event as { path?: string }).path ?? ''
  const httpMethod = event.requestContext?.http?.method ?? (event as { httpMethod?: string }).httpMethod ?? 'GET'
  const headers = event.headers ?? {}
  const pathNormalized = rawPath.replace(/^\/api\/merchants\/?/, '').replace(/^\//, '')

  if (httpMethod === 'GET' && (pathNormalized === 'me' || pathNormalized === '')) {
    const authHeader = headers?.authorization ?? headers?.Authorization ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    }
    const token = authHeader.slice(7)
    try {
      const payload = decodeJwtPayload(token) as Record<string, string>
      const sub = payload.sub as string
      const email = payload.email as string
      const name = (payload.name as string) ?? email
      const storeUrl = (payload['custom:store_url'] as string) ?? null
      const merchant = await getOrCreateMerchant(sub, email, name, storeUrl)
      return {
        statusCode: 200,
        body: JSON.stringify(merchantToResponse(merchant)),
        headers: corsHeaders(),
      }
    } catch (e) {
      console.error('GET /me error:', e)
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }), headers: corsHeaders() }
    }
  }

  if (httpMethod === 'DELETE' && (pathNormalized === 'me' || pathNormalized === '')) {
    const authHeader = headers?.authorization ?? headers?.Authorization ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    }
    const token = authHeader.slice(7)
    try {
      const payload = decodeJwtPayload(token) as Record<string, string>
      const username = (payload.email ?? payload.preferred_username ?? payload.sub) as string
      const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = await import(
        '@aws-sdk/client-cognito-identity-provider'
      )
      const userPoolId = process.env.USER_POOL_ID
      if (!userPoolId) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Configuration error' }),
          headers: corsHeaders(),
        }
      }
      const client = new CognitoIdentityProviderClient({})
      await client.send(
        new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        })
      )
      return {
        statusCode: 200,
        body: JSON.stringify({ deleted: true }),
        headers: corsHeaders(),
      }
    } catch (e) {
      console.error('Delete user error:', e)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to delete account' }),
        headers: corsHeaders(),
      }
    }
  }

  if (httpMethod === 'PUT' && (pathNormalized === 'me' || pathNormalized === '')) {
    const authHeader = headers?.authorization ?? headers?.Authorization ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    }
    const token = authHeader.slice(7)
    try {
      const payload = decodeJwtPayload(token) as Record<string, string>
      const sub = payload.sub as string
      const email = payload.email as string
      const defaultName = (payload.name as string) ?? email
      const body = parseBody(event as { body?: string })
      const name = (body?.name as string) ?? defaultName
      const storeUrl = body?.store_url != null ? (body.store_url as string) : undefined
      const merchant = await getOrCreateMerchant(sub, email, defaultName, null)
      if (name !== merchant.name || storeUrl !== undefined) {
        await query(
          `UPDATE merchants SET name = $1, store_url = COALESCE($2, store_url), updated_at = NOW() WHERE cognito_id = $3`,
          [name, storeUrl ?? merchant.store_url, sub]
        )
      }
      const updated = await queryOne<MerchantRow>(
        `SELECT id, cognito_id, email, name, store_url, plan, plan_started_at, plan_expires_at,
                plan_limits, conversations_this_month, conversations_reset_at, created_at, updated_at
         FROM merchants WHERE cognito_id = $1`,
        [sub]
      )
      if (!updated) throw new Error('Merchant not found')
      return {
        statusCode: 200,
        body: JSON.stringify(merchantToResponse(updated)),
        headers: corsHeaders(),
      }
    } catch (e) {
      console.error('PUT /me error:', e)
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update' }), headers: corsHeaders() }
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

function parseBody(ev: { body?: string }): Record<string, unknown> {
  const body = ev?.body
  if (!body) return {}
  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export { handler }
