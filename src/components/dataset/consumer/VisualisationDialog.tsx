import { Code2, Share2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import type { ChartRecord } from '@/types/chart'

interface VisualisationDialogProps {
  /** The chart to show expanded, and the resource name it's based on — or null
   *  when the dialog is closed. */
  chart: (ChartRecord & { resourceName: string }) | null
  onOpenChange: (open: boolean) => void
}

/** Expanded visualisation view — large chart/map, its source resource, and the
 *  Share/Embed actions from the specification. Uses the platform's center dialog,
 *  the same pattern as `ResourcePreviewDialog`. */
function VisualisationDialog({ chart, onOpenChange }: VisualisationDialogProps) {
  const toast = useToast()

  const shareUrl = chart ? `${window.location.origin}${window.location.pathname}?chart=${chart.id}` : ''
  const embedSnippet = chart
    ? `<iframe src="${shareUrl}" title="${chart.form.name || 'Visualisation'}" width="640" height="420"></iframe>`
    : ''

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: `${label} copied to clipboard`, variant: 'success' })
    } catch {
      toast({ title: `Unable to copy ${label.toLowerCase()}`, description: 'Please try again.', variant: 'error' })
    }
  }

  return (
    <Dialog open={chart !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-3xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate">{chart?.form.name || 'Untitled visualisation'}</DialogTitle>
          {chart && <p className="truncate text-xs text-text-subdued">Based on {chart.resourceName}</p>}
        </DialogHeader>

        {chart && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <ChartPreviewCanvas
                form={chart.form}
                columns={getFileColumns(chart.form.datasetId ?? '')}
                rows={getMockRows(chart.form.datasetId ?? '')}
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border-default px-6 py-4">
              <Button type="button" variant="outline" onClick={() => copy(shareUrl, 'Link')}>
                <Share2 className="size-4" />
                Share
              </Button>
              <Button type="button" variant="outline" onClick={() => copy(embedSnippet, 'Embed code')}>
                <Code2 className="size-4" />
                Embed
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { VisualisationDialog }
