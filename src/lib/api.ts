/**
 * Toolstoy REST API client.
 * Uses Amplify API config for endpoint and auth.
 */
import { fetchAuthSession } from 'aws-amplify/auth'
import outputs from '../../amplify_outputs.json'

function getBaseUrl(): string {
  const api = (outputs as { custom?: { API?: Record<string, { endpoint?: string }> } }).custom?.API?.ToolstoyApi
  const url = api?.endpoint ?? ''
  return url.replace(/\/$/, '')
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const base = getBaseUrl()
  if (!base) throw new Error('API not configured')
  const headers = await getAuthHeaders()
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export async function apiPut<T>(path: string, data: Record<string, unknown>): Promise<T> {
  return request<T>('PUT', path, data)
}

export async function apiPost<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>('POST', path, data)
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path)
}

export interface PlanLimits {
  characters: number
  conversations: number
  qa_pairs: number
}

export interface Merchant {
  id: string
  cognito_id: string
  email: string
  name: string
  store_url: string | null
  plan: string
  plan_started_at: string | null
  plan_expires_at: string | null
  plan_limits: PlanLimits
  conversations_this_month?: number
  conversations_reset_at?: string
  created_at: string
  updated_at: string
}

export async function getMe(): Promise<Merchant> {
  return apiGet<Merchant>('/api/merchants/me')
}

export async function updateMe(data: { name?: string; store_url?: string }): Promise<Merchant> {
  return apiPut<Merchant>('/api/merchants/me', data)
}

export async function deleteMe(): Promise<void> {
  await request<void>('DELETE', '/api/merchants/me')
}

export async function submitPersona(personaId: string): Promise<{ jobId: string; status: string }> {
  return apiPost<{ jobId: string; status: string }>(`/api/personas/${personaId}/submit`)
}

export async function getPersonaStatus(personaId: string): Promise<{ status: string; currentStep?: string }> {
  return apiGet<{ status: string; currentStep?: string }>(`/api/personas/${personaId}/status`)
}

export async function scrapeUrl(url: string): Promise<{
  productName: string
  description: string
  images: string[]
  specs: string[]
}> {
  return apiPost<{ productName: string; description: string; images: string[]; specs: string[] }>(
    '/api/scraper/extract',
    { url }
  )
}

export async function getAdminOverview(): Promise<{
  merchants: number
  personas: number
  conversationsToday: number
  successRate: number
}> {
  return apiGet('/api/admin/overview')
}

export async function createCheckoutSession(plan: 'pro' | 'studio'): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/billing/create-checkout-session', { plan })
}

export async function createPortalSession(): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/billing/create-portal-session')
}
