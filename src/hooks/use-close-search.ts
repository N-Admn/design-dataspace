import { useNavigate } from 'react-router-dom'

/**
 * Shared "close Search" logic for both the global nav's search icon (as a
 * toggle) and the Search screen's own close button. Uses browser history
 * (`navigate(-1)`) rather than a fixed route, so the previous page — and its
 * own state (filters, scroll position, form drafts, etc.) — comes back
 * exactly as the user left it instead of being reset by a fresh navigation.
 * Falls back to Discover (the site's home) only when there's no history to
 * go back to at all, e.g. Search was the first page loaded in this tab.
 */
export function useCloseSearch() {
  const navigate = useNavigate()
  return () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/discover')
  }
}
