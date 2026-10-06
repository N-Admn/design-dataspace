import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Where the user was just before they entered Search, as a position in the browser history. */
const ORIGIN_KEY = 'cds.searchOrigin'

/** react-router keeps each entry's position in `history.state.idx` (0 for the first entry of the session). */
function historyIndex(): number {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' ? idx : 0
}

/** Mount once in the global chrome: remembers the history position of the last non-Search location, so
 *  "Close search" can return to it exactly — even after the user refined the search (each refinement
 *  adds history entries). */
export function useTrackSearchOrigin() {
  const { pathname, key } = useLocation()
  useEffect(() => {
    if (pathname === '/search') return
    try {
      sessionStorage.setItem(ORIGIN_KEY, String(historyIndex()))
    } catch {
      // Storage unavailable: closing falls back to a single step back.
    }
  }, [pathname, key])
}

/** Returns a "Close search" handler. It pops history back to the page Search was opened from (a pop, never a
 *  push, so no Search → page → Search loop). With no earlier entry in this session (Search opened directly),
 *  it falls back to the Discover landing page. */
export function useCloseSearch() {
  const navigate = useNavigate()
  return () => {
    const current = historyIndex()
    if (current <= 0) {
      navigate('/discover', { replace: true })
      return
    }
    let origin: number | null = null
    try {
      const stored = sessionStorage.getItem(ORIGIN_KEY)
      origin = stored === null ? null : Number(stored)
    } catch {
      origin = null
    }
    const delta =
      origin !== null && Number.isFinite(origin) && origin < current
        ? origin - current
        : -1
    navigate(delta)
  }
}
