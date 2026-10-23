import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

/** The filters on a tablet or phone: a “Filter” button (icon and text, with how many are applied) that opens the same filter groups in a sheet
 *  rising from the bottom. Filters apply as they are ticked; the sheet's button closes it and says how many results that leaves, and Clear all
 *  sits beside it. On a laptop or desktop the rail is shown instead, so this renders only below the `lg` breakpoint. */
function FilterSheet({
  appliedCount,
  resultsLabel,
  onClearAll,
  children,
  className,
}: {
  /** How many filters are applied, shown beside the button text. */
  appliedCount: number
  /** What the sheet's button offers, e.g. “Show 12 datasets”. */
  resultsLabel: string
  onClearAll: () => void
  /** The filter groups, laid out for the sheet. */
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={className}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog" className="lg:hidden">
        <SlidersHorizontal aria-hidden="true" />
        Filter
        {appliedCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" aria-label={`${appliedCount} applied`}>
            {appliedCount}
          </span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="bottom-sheet" showClose className="p-0 lg:hidden">
          <div className="border-b border-border-default px-5 py-4 pr-14">
            <DialogTitle className="type-heading-3 text-text-brand">Filters</DialogTitle>
            <DialogDescription className="sr-only">Choose filters to narrow the results. They apply as you choose.</DialogDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
          <div className="flex items-center gap-3 border-t border-border-default bg-surface-default px-5 py-4">
            {appliedCount > 0 && (
              <Button type="button" variant="outline" onClick={onClearAll}>
                Clear all
              </Button>
            )}
            <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
              {resultsLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { FilterSheet }
