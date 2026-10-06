import { useMediaQuery } from '@/hooks/use-media-query'

/** The Tailwind v4 breakpoint foundation (see "Responsive Behaviour" in design-system.md). CSS should use the
 *  `sm:` / `md:` / `lg:` / `xl:` / `2xl:` variants; these literals exist only for the few layout decisions that
 *  must be made in JS, so the values live in exactly one place. */
export const BREAKPOINT_PX = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
export type Breakpoint = keyof typeof BREAKPOINT_PX

/** True at and above the given breakpoint — the JS twin of Tailwind's `md:` etc. */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINT_PX[breakpoint]}px)`)
}
