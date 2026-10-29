import * as React from 'react'

/** How far below its trigger a header menu opens so it clears the header and sits level with the nav menus: half of what the header is
 *  taller than a 20px control. The header's height follows the fluid root size and the compact layout, so it is measured, not fixed
 *  (88px header gives the original 34px). */
export function useHeaderMenuOffset(): number {
  const [offset, setOffset] = React.useState(34)
  React.useEffect(() => {
    const header = document.querySelector('header[data-chrome="dark"]') as HTMLElement | null
    if (!header) return
    const sync = () => setOffset(Math.max(8, Math.round((header.offsetHeight - 20) / 2)))
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])
  return offset
}
