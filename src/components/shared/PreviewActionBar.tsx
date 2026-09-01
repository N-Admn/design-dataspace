import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The sticky header bar at the top of every full-preview page (Events, Use Cases,
 * AI Models, Collaboratives) holding the title/subtitle on the left and the
 * primary actions on the right. Extracted verbatim so the four pages can never
 * drift apart. */
function PreviewActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { PreviewActionBar }
