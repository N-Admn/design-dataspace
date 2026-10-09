import { useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataDNA } from '@/pages/playground/data-dna/DataDNA'
import { DataDNAV2 } from '@/pages/playground/data-dna/DataDNAV2'
import { DataDNAV3 } from '@/pages/playground/data-dna/DataDNAV3'
import { DataDNAV4 } from '@/pages/playground/data-dna/DataDNAV4'
import { DataDNAV5 } from '@/pages/playground/data-dna/DataDNAV5'
import { DataDNAV6 } from '@/pages/playground/data-dna/DataDNAV6'
import { DataDNAV7 } from '@/pages/playground/data-dna/DataDNAV7'
import { DataDNAV61 } from '@/pages/playground/data-dna/DataDNAV61'
import type { Density } from '@/pages/playground/data-dna/data-dna-constants'

/** Isolated host for the Responsive Playground's overlay previews. Dialogs and side sheets only exist while open, so
 *  they can't be shown by pointing a frame at a normal route; this renders the real shared `Dialog` (centre and
 *  right-drawer variants) already open, with no app chrome, so the frame's own width drives its responsive rules. */
function PlaygroundPreviewPage() {
  const { component } = useParams<{ component: string }>()
  const [params] = useSearchParams()
  const noop = () => {}
  // Moving focus into a frame scrolls the parent page to it, so the opened overlay doesn't take focus.
  const keepParentScroll = (event: Event) => event.preventDefault()

  // The Data DNA playground frames: the profile alone, at the frame's own width (same gutters as a page).
  if (component === 'data-dna') {
    const density = (['rich', 'moderate', 'sparse'] as const).find((d) => d === params.get('density')) ?? 'rich'
    const datasetId = params.get('dataset') ?? 'ds-1'
    const minHeight = 'md:min-h-[calc(100dvh-3rem)]'
    return (
      <div className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
        {/* No chrome here, so the hero group is one screen minus this wrapper's own vertical padding (py-6 = 3rem). */}
        {params.get('version') === 'v1' ? (
          <DataDNA datasetId={datasetId} density={density as Density} minHeightClass={minHeight} />
        ) : params.get('version') === 'v2' ? (
          <DataDNAV2 datasetId={datasetId} density={density as Density} minHeightClass={minHeight} />
        ) : params.get('version') === 'v3' ? (
          <DataDNAV3 datasetId={datasetId} density={density as Density} minHeightClass={minHeight} />
        ) : params.get('version') === 'v4' ? (
          <DataDNAV4 datasetId={datasetId} density={density as Density} minHeightClass={minHeight} />
        ) : params.get('version') === 'v5' ? (
          <DataDNAV5 datasetId={datasetId} minHeightClass={minHeight} />
        ) : params.get('version') === 'v6' ? (
          <DataDNAV6 datasetId={datasetId} minHeightClass={minHeight} />
        ) : params.get('version') === 'v7' ? (
          <DataDNAV7 datasetId={datasetId} minHeightClass={minHeight} />
        ) : (
          <DataDNAV61 datasetId={datasetId} minHeightClass={minHeight} />
        )}
      </div>
    )
  }

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
