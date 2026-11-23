import * as React from 'react'

/** When the control that has focus inside `ref` disappears (Approve moves a row out of the Pending list, a dialog's trigger row is
 *  gone), the browser drops focus to the page body and keyboard and screen-reader users lose their place. This puts focus back on the
 *  container instead, so they continue from the same list. `watch` is whatever changes when the list does. Pass the returned
 *  function as the container's `ref`; the container needs `tabIndex={-1}`. */
export function useFocusRescue(watch: unknown): (node: HTMLElement | null) => void {
  const hadFocus = React.useRef(false)
  // The container may mount later than the caller (a popover's body only exists while it is open), so it is tracked as state.
  const [el, setEl] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!el) return
    const onIn = () => {
      hadFocus.current = true
    }
    const onOut = (event: FocusEvent) => {
      const target = event.target as Node
      // Focus moving to something else outside the container is a choice; a removed element fires no useful relatedTarget.
      if (event.relatedTarget && !el.contains(event.relatedTarget as Node)) hadFocus.current = false
      else if (!event.relatedTarget) queueMicrotask(() => target.isConnected && (hadFocus.current = false))
    }
    el.addEventListener('focusin', onIn)
    el.addEventListener('focusout', onOut)
    return () => {
      el.removeEventListener('focusin', onIn)
      el.removeEventListener('focusout', onOut)
    }
  }, [el])

  React.useEffect(() => {
    if (el && hadFocus.current && (!document.activeElement || document.activeElement === document.body)) el.focus({ preventScroll: true })
  }, [el, watch])

  return setEl
}

/** Remembers what had focus when a dialog opened, and puts focus back there when it closes. Radix only restores focus to a
 *  `Trigger`, and these dialogs open from code, so without this focus falls to the page body. If the opener has gone (its row
 *  moved), focus goes to `fallback`. */
export function useRestoreFocus(fallback?: () => HTMLElement | null) {
  const opener = React.useRef<HTMLElement | null>(null)
  const remember = React.useCallback(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [])
  const onCloseAutoFocus = React.useCallback(
    (event: Event) => {
      event.preventDefault()
      const target = opener.current?.isConnected ? opener.current : fallback?.()
      target?.focus({ preventScroll: true })
    },
    [fallback],
  )
  return { remember, onCloseAutoFocus }
}
