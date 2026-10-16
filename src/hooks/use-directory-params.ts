import * as React from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * A directory's state (search, filters, sort, page) kept in the URL, so refresh, share and back/forward all return to the same
 * view. Values equal to their default are left out of the URL. Changing anything but the page returns to page 1, and typing in
 * the search box replaces the history entry instead of adding one per keystroke.
 */
function useDirectoryParams<T extends Record<string, string>>(defaults: T) {
  const [params, setParams] = useSearchParams()

  const values = React.useMemo(() => {
    const out: Record<string, string> = {}
    for (const key of Object.keys(defaults)) out[key] = params.get(key) ?? defaults[key]
    return out as T
  }, [params, defaults])

  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)

  const update = React.useCallback(
    (changes: Partial<T> & { page?: string }, options?: { replace?: boolean }) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '' || value === defaults[key] || (key === 'page' && value === '1')) next.delete(key)
            else next.set(key, value)
          }
          if (!('page' in changes)) next.delete('page')
          return next
        },
        { replace: options?.replace },
      )
    },
    [setParams, defaults],
  )

  const clear = React.useCallback(() => setParams(new URLSearchParams()), [setParams])

  return { values, page, update, clear }
}

export { useDirectoryParams }
