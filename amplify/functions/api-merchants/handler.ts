import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
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
      const name = payload.name as string ?? email
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: sub,
          cognito_id: sub,
          email,
          name,
          store_url: payload['custom:store_url'] ?? null,
          plan: 'free',
          plan_started_at: null,
          plan_expires_at: null,
          plan_limits: { characters: 1, conversations: 100, qa_pairs: 10 },
          conversations_this_month: 0,
          conversations_reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        headers: corsHeaders(),
      }
    } catch {
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
    const body = parseBody(event as { body?: string })
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: 'merchant',
        name: body?.name ?? 'Merchant',
        store_url: body?.store_url ?? null,
        updated_at: new Date().toISOString(),
      }),
      headers: corsHeaders(),
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
