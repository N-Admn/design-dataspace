import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LeaveCreationDialogProps {
  open: boolean
  itemLabel: string
  onContinueEditing: () => void
  onSaveDraftAndExit: () => void
  onDiscardAndExit: () => void
}

function LeaveCreationDialog({
  open,
  itemLabel,
  onContinueEditing,
  onSaveDraftAndExit,
  onDiscardAndExit,
}: LeaveCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onContinueEditing()}>
      <DialogContent variant="center" className="flex max-w-md flex-col gap-0 p-0" showClose={false}>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-6">
          <h2 className="text-base font-semibold text-primary">Leave {itemLabel} creation?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your changes have not been saved. What would you like to do?
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border px-6 py-4">
          <Button type="button" onClick={onSaveDraftAndExit}>
            Save as draft &amp; exit
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDiscardAndExit}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Discard &amp; exit
          </Button>
          <Button type="button" variant="ghost" onClick={onContinueEditing}>
            Continue editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LeaveCreationDialog }
