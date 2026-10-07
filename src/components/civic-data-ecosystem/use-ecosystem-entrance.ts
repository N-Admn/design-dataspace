import * as React from 'react'

import type { EcosystemCardId } from '@/components/civic-data-ecosystem/card-content'

export type CardEntrance = 'left' | 'right' | 'bottom'

const SLIDE_MS = 800
const FADE_MS = 500
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
/** Bottom cards never travel further than this, so a tall page doesn't briefly grow much taller. */
const MAX_RISE_PX = 320
const GAP_PX = 24

/** Where each card comes from and when (ms after the cards stage starts): the two left cards first, then the two
 *  that rise from below, then the one from the right. */
export const CARD_ENTRANCE: Record<EcosystemCardId, { from: CardEntrance; delay: number }> = {
  datasets: { from: 'left', delay: 0 },
  community: { from: 'left', delay: 80 },
  collaboratives: { from: 'bottom', delay: 200 },
  'ai-models': { from: 'bottom', delay: 280 },
  'use-cases': { from: 'right', delay: 400 },
}

/** Motion for the card composition — no markup. Each card is measured at its final position (before the entrance
 *  starts), then held out of sight offset towards the edge it comes from. When `started` turns true it slides to its
 *  place while fading in. Only `transform` and `opacity` animate, so the layout never changes; once the entrance is
 *  `done` no motion styles remain. */
export function useEcosystemEntrance(started: boolean, done: boolean, ids: EcosystemCardId[]) {
  const listRef = React.useRef<HTMLUListElement>(null)
  const [offsets, setOffsets] = React.useState<{ x: number; y: number }[]>([])

  React.useLayoutEffect(() => {
    if (done || started) return
    const list = listRef.current
    if (!list) return
    setOffsets(
      Array.from(list.children).map((item, i) => {
        const rect = item.getBoundingClientRect()
        switch (CARD_ENTRANCE[ids[i]].from) {
          case 'left':
            return { x: -(rect.right + GAP_PX), y: 0 }
          case 'right':
            return { x: window.innerWidth - rect.left + GAP_PX, y: 0 }
          case 'bottom':
            return { x: 0, y: Math.min(window.innerHeight - rect.top + GAP_PX, MAX_RISE_PX) }
        }
      }),
    )
    // Measured once, at the start; the cards' final positions don't change during the entrance.
  }, [done, started, ids])

  const cardStyle = (i: number): React.CSSProperties | undefined => {
    if (done) return undefined
    const { x, y } = offsets[i] ?? { x: 0, y: 0 }
    if (!started) return { opacity: 0, transform: `translate(${x}px, ${y}px)` }
    const delay = CARD_ENTRANCE[ids[i]].delay
    return {
      opacity: 1,
      transform: 'translate(0, 0)',
      transition: `transform ${SLIDE_MS}ms ${EASE} ${delay}ms, opacity ${FADE_MS}ms ease-out ${delay}ms`,
    }
  }

  return { listRef, cardStyle }
}
