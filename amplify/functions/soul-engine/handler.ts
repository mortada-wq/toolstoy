import type { SQSEvent, SQSHandler } from 'aws-lambda'

const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body) as { personaId?: string; merchantId?: string }
      const personaId = body?.personaId ?? 'unknown'
      console.log(`Soul Engine processing persona: ${personaId}`)
    } catch (err) {
      console.error('Soul Engine error:', err)
    }
  }
}

export { handler }
