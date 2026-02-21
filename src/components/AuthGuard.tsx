import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@/context/UserContext'

interface AuthGuardProps {
  children: ReactNode
  /** Require admin role. For now we allow any authenticated user. */
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] border-t-transparent animate-spin"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (requireAdmin) {
    // Phase 4: admin role check not implemented; allow all for now
  }

  return <>{children}</>
}
