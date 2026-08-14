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
      <DialogContent variant="center" className="max-w-md gap-0 p-0" showClose={false}>
        <div className="px-6 pb-2 pt-6">
          <h2 className="text-base font-semibold text-primary">Leave {itemLabel} creation?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your changes have not been saved. What would you like to do?
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-border px-6 py-4">
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
