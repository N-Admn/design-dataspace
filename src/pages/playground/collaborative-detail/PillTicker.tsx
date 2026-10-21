import * as React from 'react'
import { logoFit } from '@/lib/org-logo'

import { cn } from '@/lib/utils'
import './pill-ticker.css'

/** A ticker of pill cards: rows of rounded grey pills, each with a round avatar, a name and a small uppercase subtitle, drifting
 *  sideways at different speeds and in alternating directions. Fully driven by `items`.
 *
 *  Motion is a convenience, never a requirement: it pauses on hover and focus and from the `paused` prop, stops completely under
 *  `prefers-reduced-motion` (the pills then wrap into a static list), and the repeated copies that make the loop seamless are
 *  hidden from assistive technology, so every item is announced exactly once. */

export interface TickerItem {
  id: string
  name: string
  /** Small line under the name. Left out of the pill when absent. */
  subtitle?: string
  imageUrl?: string
  /** Colours the initials avatar shown when there is no image. */
  tone: 'organisation' | 'person'
}

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/[\s.]+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(the|of|and|dr)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '·'

function Avatar({ item }: { item: TickerItem }) {
  const [broken, setBroken] = React.useState(false)
  if (item.imageUrl && !broken)
    return <img src={item.imageUrl} alt="" onError={() => setBroken(true)} className={`size-14 shrink-0 rounded-full ${logoFit(item.imageUrl, 'p-2')}`} />
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-14 shrink-0 items-center justify-center rounded-full text-base font-semibold',
        item.tone === 'person' ? 'bg-card text-chart-1' : 'bg-card text-text-subdued',
      )}
    >
      {initials(item.name)}
    </span>
  )
}

/** `extra`: a repeat that exists only to fill the row: hidden from assistive technology, and from view under reduced motion. */
function Pill({ item, extra = false }: { item: TickerItem; extra?: boolean }) {
  return (
    <li
      aria-hidden={extra || undefined}
      className={cn(
        'mr-4 flex max-w-[22rem] shrink-0 items-center gap-4 rounded-full bg-secondary py-3 pl-3 pr-8 text-secondary-foreground',
        extra && 'pill-ticker-loop-copy',
      )}
    >
      <Avatar item={item} />
      <span className="min-w-0">
        <span className="type-heading-3 block truncate capitalize text-black" title={item.name}>
          {item.name}
        </span>
        {item.subtitle && (
          <span className="mt-1 block truncate text-xs font-medium capitalize text-text-subdued" title={item.subtitle}>
            {item.subtitle}
          </span>
        )}
      </span>
    </li>
  )
}

/** Splits `items` into `count` consecutive rows of near-equal size. */
function toRows<T>(items: T[], count: number): T[][] {
  const rows = Math.max(1, Math.min(count, items.length))
  const size = Math.ceil(items.length / rows)
  return Array.from({ length: rows }, (_, i) => items.slice(i * size, (i + 1) * size)).filter((r) => r.length > 0)
}

const PILL_WIDTH_ESTIMATE = 320 // px, a pill plus its gap: only used to turn a speed into a duration
const SPEED = 36 // px per second

function PillTicker({
  items,
  rows = 3,
  label,
  paused = false,
}: {
  items: TickerItem[]
  rows?: number
  /** Names the list for assistive technology, e.g. "Organisations". */
  label: string
  paused?: boolean
}) {
  const chunks = toRows(items, rows)
  return (
    <div className="pill-ticker flex flex-col gap-4 overflow-hidden" data-paused={paused} role="group" aria-label={label}>
      {chunks.map((chunk, rowIndex) => {
        // Enough pills per copy to be wider than any screen, so the loop never shows a gap.
        const repeats = Math.max(1, Math.ceil(9 / chunk.length))
        const copy = Array.from({ length: repeats }, (_, r) => chunk.map((item) => ({ item, key: `${item.id}-${r}`, extra: r > 0 }))).flat()
        const duration = Math.round((copy.length * PILL_WIDTH_ESTIMATE) / (SPEED + rowIndex * 6))
        return (
          <div key={rowIndex} className="relative">
            <div
              className="pill-ticker-track"
              data-reverse={rowIndex % 2 === 1}
              style={{ '--ticker-duration': `${duration}s`, '--ticker-delay': `-${Math.round(duration * (0.18 + rowIndex * 0.31))}s` } as React.CSSProperties}
            >
              {/* The real list: each item once. */}
              <ul className="flex" aria-label={`${label}, row ${rowIndex + 1}`}>
                {copy.map(({ item, key, extra }) => (
                  <Pill key={key} item={item} extra={extra} />
                ))}
              </ul>
              {/* A second copy that only exists so the loop is seamless. Hidden from assistive technology. */}
              <ul className="pill-ticker-loop-copy flex" aria-hidden="true">
                {copy.map(({ item, key }) => (
                  <Pill key={`dup-${key}`} item={item} extra />
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { PillTicker }
