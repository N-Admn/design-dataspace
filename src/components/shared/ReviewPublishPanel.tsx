import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The centered "publish / preview" call-to-action panel that ends every module's
 * Review & Publish step. Extracted so all six modules share one appearance
 * (previously Datasets used py-5 while the rest used py-8). */
function ReviewPublishPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-8 text-center',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { ReviewPublishPanel }
