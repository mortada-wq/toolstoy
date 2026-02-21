import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  if (!part) throw new Error('Invalid token')
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function parseBody(ev: { body?: string }): Record<string, unknown> {
  if (!ev?.body) return {}
  try {
    return JSON.parse(ev.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function requireAuth(headers: Record<string, string | undefined>): string | null {
  const auth = headers?.authorization ?? headers?.Authorization ?? ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    const payload = decodeJwtPayload(auth.slice(7)) as Record<string, string>
    return payload.sub ?? null
  } catch {
    return null
  }
}

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? ''
  const httpMethod = event.requestContext?.http?.method ?? 'GET'
  const headers = event.headers ?? {}
  const pathMatch = rawPath.match(/^\/api\/personas\/?(.*)$/)
  const pathSuffix = pathMatch ? (pathMatch[1] || '').replace(/\/$/, '') : ''
  const parts = pathSuffix ? pathSuffix.split('/') : []

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' }
  }

  if (httpMethod === 'GET' && parts.length === 0) {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    return {
      statusCode: 200,
      body: JSON.stringify([]),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'GET' && parts.length === 1 && parts[0]) {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    return {
      statusCode: 200,
      body: JSON.stringify({ id: parts[0], name: 'Character', status: 'draft', embedToken: null }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'POST' && parts.length === 0) {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    const body = parseBody(event as { body?: string })
    return {
      statusCode: 201,
      body: JSON.stringify({
        id: `persona_${Date.now()}`,
        name: (body?.name as string) ?? 'Character',
        status: 'draft',
        ...body,
      }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'PUT' && parts.length === 1) {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    return {
      statusCode: 200,
      body: JSON.stringify({ id: parts[0], updated: true }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'POST' && parts.length === 2 && parts[1] === 'submit') {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    const jobId = `job_${Date.now()}`
    const queueUrl = process.env.SOUL_ENGINE_QUEUE_URL
    if (queueUrl) {
      try {
        const { SQSClient, SendMessageCommand } = await import('@aws-sdk/client-sqs')
        const client = new SQSClient({})
        await client.send(new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify({ personaId: parts[0], merchantId: sub, jobId }),
        }))
      } catch (e) {
        console.error('SQS send error:', e)
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ jobId, status: 'queued' }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'GET' && parts.length === 2 && parts[1] === 'status') {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'completed', currentStep: 'finalizing' }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'DELETE' && parts.length === 1) {
    const sub = requireAuth(headers as Record<string, string | undefined>)
    if (!sub) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: corsHeaders() }
    return {
      statusCode: 200,
      body: JSON.stringify({ deleted: true }),
      headers: corsHeaders(),
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

export { handler }
