import * as React from 'react'
import { Check, CheckCircle2, Copy } from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface PublishSuccessModalProps {
  open: boolean
  datasetName: string
  onCreateAnother: () => void
  onViewWorkspace: () => void
}

const MOCK_DOI = '10.5072/DATASPHERE-2026-US-89421'
const MOCK_API_ENDPOINT = 'https://api.data.gov/v1/datasets/ds_89421/query'

function CopyField({ label, value }: { label: string; value: string }) {
  const [justCopied, setJustCopied] = React.useState(false)
  const toast = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setJustCopied(true)
      window.setTimeout(() => setJustCopied(false), 1500)
      toast({ title: 'Copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Unable to copy', description: 'Please try again.', variant: 'error' })
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{value}</p>
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleCopy}>
          {justCopied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          Copy
        </Button>
      </div>
    </div>
  )
}

function PublishSuccessModal({ open, datasetName, onCreateAnother, onViewWorkspace }: PublishSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onViewWorkspace()}>
      <DialogContent className="max-w-xl gap-0 p-0" showClose={false}>
        <div className="flex flex-col items-center gap-2 px-6 pb-1 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-primary">Dataset published</h2>
          <p className="text-sm text-foreground">
            <span className="font-medium">&ldquo;{datasetName || 'Untitled Dataset'}&rdquo;</span> is now indexed in
            the public repository.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <CopyField label="Digital Object Identifier (DOI)" value={MOCK_DOI} />
          <CopyField label="REST Query API Endpoint" value={MOCK_API_ENDPOINT} />
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row-reverse">
          <Button type="button" className="sm:flex-1" onClick={onViewWorkspace}>
            View in My Workspace
          </Button>
          <Button type="button" variant="outline" className="sm:flex-1" onClick={onCreateAnother}>
            Create Another Dataset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { PublishSuccessModal }
