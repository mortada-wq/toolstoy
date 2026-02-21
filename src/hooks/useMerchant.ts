import { useEffect, useState } from 'react'
import { getMe, type Merchant } from '@/lib/api'

export function useMerchant() {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    getMe()
      .then((data) => {
        if (!cancelled) setMerchant(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load account')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { merchant, isLoading, error }
}
