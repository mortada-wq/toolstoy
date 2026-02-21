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

export interface ToolstoyUser {
  userId: string
  email: string
  name: string
  storeUrl?: string
}

interface UserContextValue {
  user: ToolstoyUser | null
  cognitoUser: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

async function loadUser(): Promise<{ authUser: AuthUser; toolstoyUser: ToolstoyUser } | null> {
  try {
    const authUser = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    const displayName =
      attrs.name ?? attrs['custom:name'] ?? attrs.email ?? authUser.username ?? 'User'
    const storeUrl = attrs['custom:store_url']
    return {
      authUser,
      toolstoyUser: {
        userId: authUser.userId,
        email: attrs.email ?? authUser.username,
        name: displayName,
        storeUrl: storeUrl || undefined,
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
