import * as React from 'react'

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const STAGES = ['init', 'center', 'rise', 'cards', 'topics', 'done'] as const
export type EntranceStage = (typeof STAGES)[number]

const FADE_MS = 400
/** How long the search rests, centred, before it moves up. */
const DELAY_MS = 1000
const RISE_MS = 800
/** The cards start entering while the search is still moving up. */
const CARDS_AFTER_RISE_MS = 500
/** Time for the cards to slide in (including their stagger) before the topic chips appear. */
export const CARDS_TOTAL_MS = 1100
/** The topic chips grow open (pushing the cards back down) while popping in. */
const TOPICS_MS = 500
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Module scope on purpose: a browser refresh resets it (the entrance plays again), but navigating back to the
// landing page within the app does not replay it.
let hasPlayed = false

/** Entrance for the landing page, in order: the search (heading, line and field) fades in vertically centred below the
 *  navbar → after a short rest it moves up into place → the cards slide in from their sides (see
 *  `useEcosystemEntrance`) → the topic chips pop in last. Until then the chips take no room, so the cards fill the space up to the search
 *  bar; opening the chips pushes the cards back down to their resting layout. Only `transform`/`opacity` animate, so the layout never
 *  changes, and no entrance styles remain once it ends. While it runs, horizontal overflow is clipped so cards sliding
 *  in from beyond the screen edge never add a scrollbar. Reduced motion (or a repeat visit) renders the final layout. */
export function useLandingEntrance() {
  const reducedMotion = usePrefersReducedMotion()
  const skip = reducedMotion || hasPlayed
  const [stage, setStage] = React.useState<EntranceStage>(skip ? 'done' : 'init')
  const [offset, setOffset] = React.useState(0)
  const rootRef = React.useRef<HTMLDivElement>(null)
  /** The heading + supporting line + search field — what gets centred (the chips below it are hidden at first). */
  const focusRef = React.useRef<HTMLDivElement>(null)
  /** The chips' own box, measured once so their wrapper can grow from 0 to exactly this height. */
  const topicsRef = React.useRef<HTMLDivElement>(null)
  const [topicsHeight, setTopicsHeight] = React.useState(0)

  const reached = (target: EntranceStage) => STAGES.indexOf(stage) >= STAGES.indexOf(target)

  // Measure before the first paint, so nothing flashes at its resting position.
  React.useLayoutEffect(() => {
    if (stage !== 'init') return
    const root = rootRef.current
    const focus = focusRef.current
    if (!root || !focus) return
    const top = root.getBoundingClientRect().top
    const rect = focus.getBoundingClientRect()
    const target = top + (window.innerHeight - top) / 2
    // Less centring on smaller screens, so the search stays comfortably in view.
    const factor = window.innerWidth >= 1024 ? 1 : window.innerWidth >= 768 ? 0.6 : 0.3
    setOffset(Math.max(0, target - (rect.top + rect.height / 2)) * factor)
    setTopicsHeight(topicsRef.current?.offsetHeight ?? 0)
  }, [stage])

  React.useEffect(() => {
    if (skip) return
    const timers: number[] = []
    const after = (ms: number, next: EntranceStage) => timers.push(window.setTimeout(() => setStage(next), ms))
    const frame = requestAnimationFrame(() => {
      setStage('center')
      after(DELAY_MS, 'rise')
      after(DELAY_MS + CARDS_AFTER_RISE_MS, 'cards')
      after(DELAY_MS + CARDS_AFTER_RISE_MS + CARDS_TOTAL_MS, 'topics')
      timers.push(
        window.setTimeout(
          () => {
            hasPlayed = true
            setStage('done')
          },
          DELAY_MS + CARDS_AFTER_RISE_MS + CARDS_TOTAL_MS + TOPICS_MS,
        ),
      )
    })
    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(window.clearTimeout)
    }
  }, [skip])

  React.useEffect(() => {
    if (stage === 'done') return
    const html = document.documentElement
    const previous = html.style.overflowX
    html.style.overflowX = 'clip'
    return () => {
      html.style.overflowX = previous
    }
  }, [stage === 'done'])

  const heroStyle: React.CSSProperties | undefined = !reached('center')
    ? { opacity: 0, transform: `translateY(${offset + 12}px)` }
    : stage === 'center'
      ? {
          opacity: 1,
          transform: `translateY(${offset}px)`,
          transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
        }
      : stage === 'done'
        ? undefined
        : { opacity: 1, transform: 'translateY(0)', transition: `transform ${RISE_MS}ms ${EASE}` }

  // Wrapper: collapsed (no room) until the topics stage, then grows to the chips' height. Inner: pops up as it opens.
  const topicsWrapStyle: React.CSSProperties | undefined =
    stage === 'done'
      ? undefined
      : reached('topics')
        ? { height: topicsHeight, overflow: 'hidden', transition: `height ${TOPICS_MS}ms ${EASE}` }
        : { height: 0, overflow: 'hidden' }
  const topicsInnerStyle: React.CSSProperties | undefined =
    stage === 'done'
      ? undefined
      : reached('topics')
        ? {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            transition: `opacity ${TOPICS_MS - 100}ms ease-out 100ms, transform ${TOPICS_MS}ms ${EASE} 100ms`,
          }
        : { opacity: 0, transform: 'translateY(14px) scale(0.96)' }

  return {
    rootRef,
    focusRef,
    topicsRef,
    heroStyle,
    topicsWrapStyle,
    topicsInnerStyle,
    stage,
    cardsStarted: reached('cards'),
    done: stage === 'done',
  }
}
