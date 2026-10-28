import * as React from 'react'

import { Tag } from '@/components/ui/tag'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const GAP_PX = 8

/** A row of tags that always stays on one line. The tags that fit are shown; the rest collapse into a "+N" pill, and hovering (or
 *  focusing) it lists the hidden ones in a tooltip. Each tag links to a search for its text. */
export function OneLineTags({ tags, label, className }: { tags: string[]; label: string; className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const measureRef = React.useRef<HTMLUListElement>(null)
  const [visible, setVisible] = React.useState(tags.length)

  // Measures every tag (and the widest "+N" pill) in an invisible copy of the row, then keeps as many tags as fit the width.
  React.useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return
    const compute = () => {
      const available = container.clientWidth
      const items = Array.from(measure.children) as HTMLElement[]
      const widths = items.slice(0, tags.length).map((el) => el.offsetWidth)
      const moreWidth = items[tags.length]?.offsetWidth ?? 0
      const total = widths.reduce((sum, w) => sum + w, 0) + GAP_PX * Math.max(0, widths.length - 1)
      if (total <= available) return setVisible(tags.length)
      let used = 0
      let count = 0
      for (const w of widths) {
        const next = used + (count > 0 ? GAP_PX : 0) + w
        if (next + GAP_PX + moreWidth > available) break
        used = next
        count += 1
      }
      setVisible(count)
    }
    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(container)
    return () => observer.disconnect()
  }, [tags])

  const hidden = tags.slice(visible)
  const pill = 'inline-flex shrink-0 items-center rounded-full border border-border-default bg-background px-[10px] py-[2px] text-[12px] font-medium leading-4 text-text-subdued'

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <ul aria-label={label} className="flex flex-nowrap items-center gap-2">
        {tags.slice(0, visible).map((tag) => (
          <li key={tag} className="shrink-0">
            <Tag size="sm" to={`/search?q=${encodeURIComponent(tag)}`} className="bg-background">
              {tag}
            </Tag>
          </li>
        ))}
        {hidden.length > 0 && (
          <li className="shrink-0">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className={cn(pill, 'cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus')} aria-label={`${hidden.length} more: ${hidden.join(', ')}`}>
                    +{hidden.length}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <ul className="flex flex-col gap-0.5">
                    {hidden.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        )}
      </ul>
      {/* The invisible copy used for measuring. */}
      <ul ref={measureRef} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 flex h-0 flex-nowrap items-center gap-2 overflow-hidden">
        {tags.map((tag) => (
          <li key={tag} className="shrink-0">
            <span className={pill}>{tag}</span>
          </li>
        ))}
        <li className="shrink-0">
          <span className={pill}>+{tags.length}</span>
        </li>
      </ul>
    </div>
  )
}
