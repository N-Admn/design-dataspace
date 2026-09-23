import { useNavigate } from 'react-router-dom'

/**
 * Returns to wherever the user actually came from, via browser history —
 * preserving that page's own state (filters, scroll position, etc.) instead
 * of resetting it with a fresh navigation to a fixed route. Falls back to
 * `fallbackTo` only when there's no history to go back to at all (e.g. this
 * page was opened directly from a shared link).
 */
export function useGoBack(fallbackTo: string) {
  const navigate = useNavigate()
  return () => {
    if (window.history.length > 1) navigate(-1)
    else navigate(fallbackTo)
  }
}
