import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

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

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? ''
  const httpMethod = event.requestContext?.http?.method ?? 'GET'

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' }
  }

  if (httpMethod === 'GET' && rawPath.includes('/widget/load')) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: 'Character',
        imageUrl: null,
        layout: 'side-by-side',
        position: 'bottom-right',
        trigger: '45-seconds',
        greeting: 'Hi there. I can help answer questions about our products.',
        messages: [],
      }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'POST' && rawPath.includes('/widget/chat')) {
    const body = parseBody(event as { body?: string })
    const message = (body?.message as string) ?? ''
    const token = (body?.token as string) ?? (event.queryStringParameters ?? {})['token'] ?? ''

    const conversationLimitExceeded = false
    if (conversationLimitExceeded) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "This character has reached its monthly limit. Come back next month or ask the store owner to upgrade.",
          limit_reached: true,
        }),
        headers: corsHeaders(),
      }
    }

    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions/i,
      /you\s+are\s+now\s+(a\s+)?(different|new)\s+ai/i,
      /disregard\s+(your\s+)?(instructions|prompt)/i,
      /forget\s+(everything|your)\s+(you|instructions)/i,
      /pretend\s+you\s+are/i,
      /act\s+as\s+if\s+you\s+are/i,
      /new\s+instructions?\s*:/i,
      /system\s*:\s*you\s+are/i,
    ]
    const isInjection = injectionPatterns.some((p) => p.test(message))
    if (isInjection) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "That's a bit of an unusual question, but let me stick to what I know best. How can I help you with this product?",
          animation_state: 'talking',
          confidence: 0.5,
        }),
        headers: corsHeaders(),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: message ? `I understand you're interested in ${message.slice(0, 50)}... How can I help?` : 'How can I help you today?',
        animation_state: 'talking',
        confidence: 0.85,
      }),
      headers: corsHeaders(),
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

export { handler }
