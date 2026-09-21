import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CollapsibleFormSectionProps {
  id: string
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

/** Collapsible section for the form's optional groups (Organisation Profile,
 * Social Profiles) — collapsed by default, expands without losing any values
 * already entered elsewhere in the form (the parent owns all field state, this
 * component only owns open/closed). */
function CollapsibleFormSection({ id, title, description, open, onOpenChange, children }: CollapsibleFormSectionProps) {
  const contentId = `${id}-content`
  const headingId = `${id}-heading`

  return (
    <div className="rounded-lg border border-border-default">
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
      >
        <span>
          <span className="block text-sm font-semibold text-text-brand">{title}</span>
          {description && <span className="mt-0.5 block text-xs font-normal text-text-subdued">{description}</span>}
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-text-subdued transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={contentId} role="region" aria-labelledby={headingId} className="flex flex-col gap-5 border-t border-border-default px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

export { CollapsibleFormSection }
