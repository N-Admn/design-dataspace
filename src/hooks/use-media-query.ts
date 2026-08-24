import * as React from 'react'

/** Tracks a CSS media query reactively via matchMedia. Used where a layout
 * decision (e.g. which table columns fit) needs to be computed in JS rather
 * than purely in CSS. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = () => setMatches(mql.matches)
    handler()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
