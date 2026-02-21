import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePersonas } from '@/hooks/usePersonas'

const ONBOARDING_KEY = 'toolstoy_onboarding_complete'

/**
 * When on dashboard index with 0 personas and onboarding not complete,
 * redirect to /welcome. Otherwise render children.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { personas, isLoading } = usePersonas()

  useEffect(() => {
    const isDashboardIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    if (!isDashboardIndex) return
    if (isLoading) return
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (personas.length === 0 && !done) {
      navigate('/welcome', { replace: true })
    }
  }, [location.pathname, personas.length, isLoading, navigate])

  return <>{children}</>
}
