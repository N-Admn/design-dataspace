import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ViewTabItem {
  key: string
  label: string
}

interface ViewTabsProps {
  items: ViewTabItem[]
  value: string
  onChange: (key: string) => void
  /** Distinguishes this tablist's ids from any other on the page — panels pair
   *  with `${idPrefix}-panel-${key}` (see `ViewTabPanel`). */
  idPrefix: string
  label: string
  className?: string
}

/** Top-level view switcher — same tablist visual language as ManagementTable's
 *  status tabs (border-bottom indicator), but standalone and reusable, with
 *  roving-tabindex arrow-key navigation per the WAI-ARIA tabs pattern. */
function ViewTabs({ items, value, onChange, idPrefix, label, className }: ViewTabsProps) {
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const move = (direction: 1 | -1) => {
    const index = items.findIndex((item) => item.key === value)
    const next = items[(index + direction + items.length) % items.length]
    onChange(next.key)
    buttonRefs.current[next.key]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className={cn('flex items-center gap-1 overflow-x-auto border-b border-border-default', className)}>
      {items.map((item) => {
        const isActive = item.key === value
        return (
          <button
            key={item.key}
            ref={(el) => {
              buttonRefs.current[item.key] = el
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.key}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${item.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                move(1)
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                move(-1)
              }
            }}
            className={cn(
              'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
              isActive
                ? 'border-action-primary-default text-text-brand'
                : 'border-transparent text-text-subdued hover:text-text-default',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/** Wraps a tab's content with the roles/attributes a WAI-ARIA tabpanel needs —
 *  pass the same `value`/`idPrefix` given to the paired `ViewTabs`. */
function ViewTabPanel({
  id,
  idPrefix,
  active,
  children,
}: {
  id: string
  idPrefix: string
  active: boolean
  children: React.ReactNode
}) {
  if (!active) return null
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0}>
      {children}
    </div>
  )
}

export { ViewTabs, ViewTabPanel }
