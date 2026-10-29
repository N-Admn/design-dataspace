import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** The mock session. Signing in or registering sets it, signing out clears it; the provider (contributor) pages check it and send
 *  anyone who is not signed in to the sign-in page. It is saved in localStorage so a reload, or a page opened in a new tab,
 *  keeps the visitor signed in. */
const SESSION_KEY = 'civicdataspace:session'

export const SIGN_IN_PATH = '/auth/sign-in'

function readSession(): boolean {
  try {
    return window.localStorage.getItem(SESSION_KEY) === 'signed-in'
  } catch {
    return false
  }
}

interface AuthContextValue {
  isSignedIn: boolean
  /** True from the moment the visitor signs out until they sign in again, so leaving a provider page after signing out goes to
   *  the home page rather than to the sign-in page. */
  justSignedOut: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = React.useState(readSession)
  const [justSignedOut, setJustSignedOut] = React.useState(false)

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) setIsSignedIn(event.newValue === 'signed-in')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      isSignedIn,
      justSignedOut,
      signIn: () => {
        try {
          window.localStorage.setItem(SESSION_KEY, 'signed-in')
        } catch {
          /* storage unavailable: the session lasts until reload */
        }
        setIsSignedIn(true)
        setJustSignedOut(false)
      },
      signOut: () => {
        try {
          window.localStorage.removeItem(SESSION_KEY)
        } catch {
          /* storage unavailable */
        }
        setIsSignedIn(false)
        setJustSignedOut(true)
      },
    }),
    [isSignedIn, justSignedOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Pages that belong to the provider side: the workspace dashboard, every `/dashboard/*` page and the organisation workspaces. */
export function isProviderPath(pathname: string): boolean {
  return pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/organisations' || pathname.startsWith('/organisations/')
}

/** Opens a provider page from a consumer page: straight there when signed in, otherwise the sign-in page, which returns to `path`
 *  once the visitor has signed in or registered. */
export function useGoToProvider() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  return React.useCallback(
    (path: string) => {
      if (isSignedIn) navigate(path)
      else navigate(SIGN_IN_PATH, { state: { from: path } })
    },
    [isSignedIn, navigate],
  )
}

/** Opens the sign-in page from wherever the visitor is, and comes back to this page afterwards. */
export function useGoToSignIn() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  return React.useCallback(() => navigate(SIGN_IN_PATH, { state: { from: `${pathname}${search}` } }), [navigate, pathname, search])
}

/** For the auth pages: where the visitor was heading (`from`), the state to pass along when moving between auth pages, and a
 *  `complete` that signs them in and sends them there (the workspace when they came without a destination). */
export function useAuthReturn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  return {
    from,
    linkState: (extra?: Record<string, unknown>) => ({ ...extra, ...(from ? { from } : {}) }),
    complete: () => {
      signIn()
      navigate(from ?? '/', { replace: true })
    },
  }
}

export { AuthProvider, useAuth }
