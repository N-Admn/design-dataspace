import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LeaveCreationDialogProps {
  open: boolean
  itemLabel: string
  /** Persist the working copy, keeping its current lifecycle status, then leave. */
  onSave: () => void
  /** Drop the unsaved changes (restoring the last saved state) and leave. */
  onDiscard: () => void
  /** Stay on the page. */
  onCancel: () => void
}

/** The single unsaved-changes gate for every creation/edit flow. Edit state only —
 * it never publishes and never changes lifecycle status. */
function LeaveCreationDialog({ open, itemLabel, onSave, onDiscard, onCancel }: LeaveCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent variant="center" className="flex max-w-md flex-col gap-0 p-0" showClose={false}>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-6">
          <h2 className="text-base font-semibold text-primary">You have unsaved changes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your changes to this {itemLabel} before leaving, or discard them to return to the last saved
            state.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border px-6 py-4">
          <Button type="button" onClick={onSave}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Discard changes
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LeaveCreationDialog }
