import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  pressed?: boolean
  onClick: () => void
  /** Optional leading icon — omitted by callers that don't need one (e.g. an "All" chip). */
  icon?: LucideIcon
  className?: string
}

/**
 * Reuses the existing filter-chip visual language (see the type filters in
 * ResourceSearchField) for both landing-page topic tags and results-page
 * content-type filters — one chip pattern, two call sites, no new visual
 * language. `aria-pressed` communicates the selected state beyond color/border.
 */
/** Compact (text-xs, tighter padding) below `lg` so rows of chips stay tidy on tablet and phone; full size from `lg`. */
function Chip({ label, pressed = false, onClick, icon: Icon, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium lg:px-3 lg:py-2 lg:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        pressed
          ? 'border-transparent bg-control-hover font-semibold text-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 shrink-0 lg:size-4" aria-hidden="true" />}
      {label}
    </button>
  )
}

export { Chip }
