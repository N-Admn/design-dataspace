import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LeaveCreationDialogProps {
  open: boolean
  itemLabel: string
  /** 'draft' — new/unpublished content: Save as draft & exit / Discard & exit.
   * 'published' — editing already-live content: Save & Publish / Discard changes. */
  mode?: 'draft' | 'published'
  onContinueEditing: () => void
  /** draft mode */
  onSaveDraftAndExit?: () => void
  onDiscardAndExit?: () => void
  /** published mode */
  onSaveAndPublish?: () => void
  onDiscardChanges?: () => void
}

function LeaveCreationDialog({
  open,
  itemLabel,
  mode = 'draft',
  onContinueEditing,
  onSaveDraftAndExit,
  onDiscardAndExit,
  onSaveAndPublish,
  onDiscardChanges,
}: LeaveCreationDialogProps) {
  const isPublished = mode === 'published'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onContinueEditing()}>
      <DialogContent variant="center" className="flex max-w-md flex-col gap-0 p-0" showClose={false}>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-6">
          <h2 className="text-base font-semibold text-primary">
            {isPublished ? `Leave with unsaved changes?` : `Leave ${itemLabel} creation?`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isPublished
              ? `This published ${itemLabel} has unsaved changes. The current published version stays live until you publish. What would you like to do?`
              : 'Your changes have not been saved. What would you like to do?'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border px-6 py-4">
          {isPublished ? (
            <>
              <Button type="button" onClick={onSaveAndPublish}>
                Save &amp; Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDiscardChanges}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Discard changes
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
          <Button type="button" variant="ghost" onClick={onContinueEditing}>
            Continue editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LeaveCreationDialog }
