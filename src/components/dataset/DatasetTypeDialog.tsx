import * as React from 'react'
import { Check, Database, MessageSquareText } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DATASET_TYPE_OPTIONS, type DatasetType } from '@/types/dataset'

const TYPE_ICONS: Record<DatasetType, typeof Database> = {
  dataset: Database,
  prompt_dataset: MessageSquareText,
}

interface DatasetTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (type: DatasetType) => void
}

/** "Add New Dataset" entry point — the user must choose a type before a dataset
 * draft is created. The choice is fixed once the draft exists (Section 2). */
function DatasetTypeDialog({ open, onOpenChange, onContinue }: DatasetTypeDialogProps) {
  const [selected, setSelected] = React.useState<DatasetType | null>(null)

  React.useEffect(() => {
    if (open) setSelected(null)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="center" className="flex max-w-lg flex-col gap-0 p-0">
        <DialogHeader>
          <DialogTitle>Add New Dataset</DialogTitle>
          <DialogDescription>Choose what kind of dataset you want to create.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 py-5" role="radiogroup" aria-label="Dataset type">
          {DATASET_TYPE_OPTIONS.map((option) => {
            const Icon = TYPE_ICONS[option.value]
            const isSelected = selected === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(option.value)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-border-brand bg-action-primary-default/5'
                    : 'border-border-input hover:border-border-brand/40',
                )}
              >
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    isSelected ? 'bg-action-primary-default text-action-primary-text' : 'bg-surface-subdued text-text-subdued',
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-default">{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0 text-text-brand" />}
                  </div>
                  <p className="mt-1 text-sm text-text-subdued">{option.description}</p>
                </div>
              </button>
            )
          })}
          <p className="mt-1 text-xs text-text-subdued">
            You can't change this after the draft is created.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selected} onClick={() => selected && onContinue(selected)}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DatasetTypeDialog }
