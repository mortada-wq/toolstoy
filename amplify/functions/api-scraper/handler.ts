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

  if (httpMethod === 'POST' && rawPath.includes('/scraper/extract')) {
    const body = parseBody(event as { body?: string })
    const url = (body?.url as string) ?? ''
    return {
      statusCode: 200,
      body: JSON.stringify({
        productName: url ? `Product from ${new URL(url).hostname}` : 'Unknown Product',
        description: 'Product description extracted from page. Add product URL to extract real content.',
        images: [],
        specs: [],
      }),
      headers: corsHeaders(),
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

export { handler }
