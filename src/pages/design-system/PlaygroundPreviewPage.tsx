import { useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Isolated host for the Responsive Playground's overlay previews. Dialogs and side sheets only exist while open, so
 *  they can't be shown by pointing a frame at a normal route; this renders the real shared `Dialog` (centre and
 *  right-drawer variants) already open, with no app chrome, so the frame's own width drives its responsive rules. */
function PlaygroundPreviewPage() {
  const { component } = useParams<{ component: string }>()
  const noop = () => {}
  // Moving focus into a frame scrolls the parent page to it, so the opened overlay doesn't take focus.
  const keepParentScroll = (event: Event) => event.preventDefault()

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="type-heading-1 text-text-brand">Page content</h1>
      <p className="type-body mt-2 text-text-subdued">The overlay below sits on top of this page.</p>

      {component === 'dialog' && (
        <Dialog open onOpenChange={noop}>
          <DialogContent variant="center" showClose={false} className="gap-0 p-0" onOpenAutoFocus={keepParentScroll}>
            <DialogHeader>
              <DialogTitle>Delete this draft?</DialogTitle>
              <DialogDescription>This can’t be undone. The draft and its files will be removed.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 px-6 py-4">
              <Button variant="outline">Cancel</Button>
              <Button>Delete draft</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {component === 'side-sheet' && (
        <Dialog open onOpenChange={noop}>
          <DialogContent variant="right-drawer" className="gap-0 p-0" onOpenAutoFocus={keepParentScroll}>
            <DialogHeader>
              <DialogTitle>Resource details</DialogTitle>
              <DialogDescription>Edit the details shown with this resource.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preview-name">Name</Label>
                <Input id="preview-name" defaultValue="Rainfall by district" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preview-format">Format</Label>
                <Input id="preview-format" defaultValue="CSV" />
              </div>
              <Button className="self-end">Save changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {component !== 'dialog' && component !== 'side-sheet' && (
        <p className="type-body mt-6 text-text-subdued">Unknown preview: {component}</p>
      )}
    </div>
  )
}

export { PlaygroundPreviewPage }
