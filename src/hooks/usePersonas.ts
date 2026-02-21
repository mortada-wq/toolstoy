import { useEffect, useState } from 'react'
import { listPersonas, type PersonaRecord } from '@/lib/data'

export function usePersonas() {
  const [personas, setPersonas] = useState<PersonaRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    listPersonas()
      .then((data) => {
        if (!cancelled) setPersonas(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load characters')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { personas, isLoading, error }
}
