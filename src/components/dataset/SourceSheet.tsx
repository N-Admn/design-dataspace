import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { emptySource, isSourceEmpty } from '@/lib/dataset-sources'
import { validateSourceEntry } from '@/lib/validation'
import type { DatasetSource } from '@/types/dataset'

interface SourceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The source being edited, or null to add a new one. */
  source: DatasetSource | null
  onSave: (source: DatasetSource) => void
}

/** Add / edit one source of a dataset, in the right-hand drawer used for every "add an item" action in the contributor
 *  flows. Every field is optional on its own, but an entry with nothing in it cannot be saved. */
function SourceSheet({ open, onOpenChange, source, onSave }: SourceSheetProps) {
  const confirm = useConfirm()
  const [draft, setDraft] = React.useState<DatasetSource>(() => emptySource())
  const [showErrors, setShowErrors] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setDraft(source ?? emptySource())
    setShowErrors(false)
  }, [open, source])

  const urlErrors = validateSourceEntry(draft)
  const empty = isSourceEmpty(draft)
  const dirty =
    draft.name !== (source?.name ?? '') ||
    draft.websiteUrl !== (source?.websiteUrl ?? '')

  const requestClose = async () => {
    if (dirty) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved source details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (!ok) return
    }
    onOpenChange(false)
  }

  const handleSave = () => {
    setShowErrors(true)
    if (empty || urlErrors.websiteUrl) return
    onSave({ id: draft.id, name: draft.name.trim(), websiteUrl: draft.websiteUrl.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>{source ? 'Edit Source' : 'Add Source'}</DialogTitle>
          <DialogDescription>
            Where this data was originally published, and a link to it. Every field is optional, but add at least one.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="source-name">Source name</Label>
              <Input
                id="source-name"
                className="mt-1.5"
                placeholder="e.g. Ministry of Finance"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="source-website">Source website URL</Label>
              <Input
                id="source-website"
                type="url"
                className="mt-1.5"
                placeholder="https://data.gov.in"
                value={draft.websiteUrl}
                aria-invalid={Boolean(urlErrors.websiteUrl)}
                onChange={(e) => setDraft((d) => ({ ...d, websiteUrl: e.target.value }))}
              />
              <FieldError message={urlErrors.websiteUrl} />
            </div>
            {showErrors && empty && <FieldError message="Add a name or a website link." />}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {source ? 'Save Changes' : 'Add Source'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SourceSheet }
