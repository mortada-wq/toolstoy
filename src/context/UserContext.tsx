import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchUserAttributes,
  getCurrentUser,
  signOut as amplifySignOut,
  type AuthUser,
} from 'aws-amplify/auth'

export type AdminRole = 'super_admin' | 'admin' | 'assistant' | null

export interface ToolstoyUser {
  userId: string
  email: string
  name: string
  storeUrl?: string
  isAdmin: boolean
  adminRole: AdminRole
}

interface UserContextValue {
  user: ToolstoyUser | null
  cognitoUser: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  adminRole: AdminRole
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Admin roles configuration
const SUPER_ADMINS = [
  'mortadagzar@gmail.com',
  'mortada@howvie.com',
]

const ADMINS: string[] = [
  // Admins can access all admin features but cannot manage other admins
]

const ASSISTANTS: string[] = [
  // Assistants have read-only access to admin dashboard
]

function getAdminRole(email: string): AdminRole {
  const lowerEmail = email.toLowerCase()
  if (SUPER_ADMINS.includes(lowerEmail)) return 'super_admin'
  if (ADMINS.includes(lowerEmail)) return 'admin'
  if (ASSISTANTS.includes(lowerEmail)) return 'assistant'
  return null
}

function _isAdminEmail(email: string): boolean {
  return getAdminRole(email) !== null
}

const UserContext = createContext<UserContextValue | null>(null)

async function loadUser(): Promise<{ authUser: AuthUser; toolstoyUser: ToolstoyUser } | null> {
  try {
    const authUser = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    const email = attrs.email ?? authUser.username
    const displayName =
      attrs.name ?? attrs['custom:name'] ?? email ?? 'User'
    const storeUrl = attrs['custom:store_url']
    const adminRole = getAdminRole(email)
    return {
      authUser,
      toolstoyUser: {
        userId: authUser.userId,
        email,
        name: displayName,
        storeUrl: storeUrl || undefined,
        isAdmin: adminRole !== null,
        adminRole,
      },
    }
  } catch {
    return null
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ToolstoyUser | null>(null)
  const [cognitoUser, setCognitoUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    const result = await loadUser()
    if (result) {
      setUser(result.toolstoyUser)
      setCognitoUser(result.authUser)
    } else {
      setUser(null)
      setCognitoUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadUser().then((result) => {
      if (cancelled) return
      if (result) {
        setUser(result.toolstoyUser)
        setCognitoUser(result.authUser)
      } else {
        setUser(null)
        setCognitoUser(null)
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const signOut = useCallback(async () => {
    await amplifySignOut()
    setUser(null)
    setCognitoUser(null)
  }, [])

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      cognitoUser,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin ?? false,
      adminRole: user?.adminRole ?? null,
      signOut,
      refreshUser,
    }),
    [user, cognitoUser, isLoading, signOut, refreshUser]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
