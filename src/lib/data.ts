import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

export interface PersonaRecord {
  id: string
  name?: string | null
  productName?: string | null
  productUrl?: string | null
  characterType?: string | null
  catchphrase?: string | null
  status?: string | null
  embedToken?: string | null
  imageUrl?: string | null
  widgetLayout?: string | null
  widgetPosition?: string | null
  widgetTrigger?: string | null
  greeting?: string | null
  personality?: Record<string, unknown> | null
}

export async function listPersonas(): Promise<PersonaRecord[]> {
  const { data } = await client.models.Persona.list()
  return data as PersonaRecord[]
}

export async function getPersona(id: string): Promise<PersonaRecord | null> {
  const { data } = await client.models.Persona.get({ id })
  return data as PersonaRecord | null
}

export async function createPersona(input: Record<string, unknown>): Promise<PersonaRecord> {
  const { data } = await client.models.Persona.create({
    name: (input.name as string) ?? 'Character',
    productName: (input.productName as string) ?? '',
    productUrl: (input.productUrl as string) ?? '',
    characterType: (input.characterType as string) ?? '',
    vibeTags: (input.vibeTags as string[]) ?? [],
    catchphrase: (input.catchphrase as string) ?? '',
    greeting: (input.greeting as string) ?? '',
    status: 'draft',
    widgetLayout: 'side-by-side',
    widgetPosition: 'bottom-right',
    widgetTrigger: '45-seconds',
  })
  return data as PersonaRecord
}

export async function updatePersona(id: string, input: Record<string, unknown>): Promise<PersonaRecord | null> {
  const { data } = await client.models.Persona.update({
    id,
    ...input,
  })
  return data as PersonaRecord | null
}

export async function deletePersona(id: string): Promise<void> {
  await client.models.Persona.delete({ id })
}

export async function listKnowledgeItems(personaId: string) {
  const { data } = await client.models.KnowledgeItem.list({
    filter: { personaId: { eq: personaId } },
  })
  return data
}

export async function createKnowledgeItem(personaId: string, question: string, answer: string) {
  const { data } = await client.models.KnowledgeItem.create({
    personaId,
    question,
    answer,
    source: 'manual',
    approved: true,
  })
  return data
}

export async function deleteKnowledgeItem(id: string): Promise<void> {
  await client.models.KnowledgeItem.delete({ id })
}
