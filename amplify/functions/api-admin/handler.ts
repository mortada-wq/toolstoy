import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const rawPath = event.rawPath ?? ''
  const httpMethod = event.requestContext?.http?.method ?? 'GET'

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' }
  }

  if (httpMethod === 'GET' && rawPath.includes('/admin/overview')) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        merchants: 12,
        personas: 34,
        conversationsToday: 156,
        successRate: 0.92,
      }),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'GET' && rawPath.includes('/admin/merchants')) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'GET' && rawPath.includes('/admin/alerts')) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
      headers: corsHeaders(),
    }
  }

  if (httpMethod === 'GET' && rawPath.includes('/admin/jobs')) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
      headers: corsHeaders(),
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }), headers: corsHeaders() }
}

export { handler }
