import { useMediaQuery } from '@/hooks/use-media-query'

/** The media query behind the "compact" layout: a window under 800px tall or under 1280px wide. It is what a Windows laptop at 125–150% display
 *  scaling gives the page (about 1536×730, 1280×590 or 1093×620), so the fixed chrome, the headings and the one-screen Discover page are
 *  sized down. The same query is `@custom-variant compact` in `index.css`; keep the two in step. */
export const COMPACT_LAYOUT_QUERY = '(max-height: 800px), (max-width: 1279px)'

export function useCompactLayout(): boolean {
  return useMediaQuery(COMPACT_LAYOUT_QUERY)
}
