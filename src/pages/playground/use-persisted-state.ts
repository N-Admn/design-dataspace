import * as React from 'react'

/** `useState` that survives leaving the page and coming back within the same browser tab (sessionStorage), so a playground
 *  keeps its selections while someone visits the Playground Hub or another playground. Storage can be unavailable (private
 *  windows, blocked site data): every access is guarded and the state simply behaves like plain `useState`. A stored value
 *  that no longer passes `isValid` is ignored, so renamed options never leave a playground stuck. */
export function usePersistedState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T = (value): value is T => value !== undefined,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `cds-playground:${key}`
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey)
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw)
        if (isValid(parsed)) return parsed
      }
    } catch {
      /* fall through to the default */
    }
    return initial
  })
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      /* not persisted */
    }
  }, [storageKey, value])
  return [value, setValue]
}
