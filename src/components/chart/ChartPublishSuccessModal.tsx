import { CheckCircle2 } from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ChartPublishSuccessModalProps {
  open: boolean
  chartName: string
  hasLiveVersion: boolean
  onViewOnDataset: () => void
  onBackToCharts: () => void
}

function ChartPublishSuccessModal({ open, chartName, hasLiveVersion, onViewOnDataset, onBackToCharts }: ChartPublishSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onBackToCharts()}>
      <DialogContent className="flex max-w-md flex-col gap-0 p-0" showClose={false}>
        <div className="min-h-0 flex-1 overflow-y-auto flex flex-col items-center gap-2 px-6 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-primary">
            {hasLiveVersion ? 'Changes published' : 'Chart published successfully.'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasLiveVersion ? (
              <>Your changes to &ldquo;{chartName || 'this chart'}&rdquo; are now live on the dataset&rsquo;s public page.</>
            ) : (
              <>
                <span className="font-medium text-foreground">&ldquo;{chartName || 'Untitled chart'}&rdquo;</span> is now available on
                the dataset's public page.
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row-reverse">
          <Button type="button" className="sm:flex-1" onClick={onViewOnDataset}>
            View on Dataset
          </Button>
          <Button type="button" variant="outline" className="sm:flex-1" onClick={onBackToCharts}>
            Back to Charts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ChartPublishSuccessModal }
