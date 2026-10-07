import { useMediaQuery } from '@/hooks/use-media-query'

/** True when the visitor asked the OS/browser for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
