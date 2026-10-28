import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Returns to wherever the user actually came from, via browser history —
 * preserving that page's own state (filters, scroll position, etc.) instead
 * of resetting it with a fresh navigation to a fixed route. Falls back to
 * `fallbackTo` only when this page was the first one opened in the app (e.g.
 * opened directly from a shared link or in a new tab), where going back would
 * leave the app or do nothing.
 */
export function useGoBack(fallbackTo: string) {
  const navigate = useNavigate()
  // React Router gives the first entry of a session the key 'default'; every in-app navigation after it gets its own key.
  const { key } = useLocation()
  return () => {
    if (key !== 'default') navigate(-1)
    else navigate(fallbackTo)
  }
}
