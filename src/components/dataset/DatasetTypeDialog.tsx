import { Database, MessageSquareText } from 'lucide-react'

import { ChoiceDialog } from '@/components/shared/ChoiceDialog'
import { DATASET_TYPE_OPTIONS, type DatasetType } from '@/types/dataset'

const TYPE_ICONS: Record<DatasetType, typeof Database> = {
  dataset: Database,
  prompt_dataset: MessageSquareText,
}

const OPTIONS = DATASET_TYPE_OPTIONS.map((option) => ({ ...option, icon: TYPE_ICONS[option.value] }))

interface DatasetTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (type: DatasetType) => void
}

/** "Add New Dataset" entry point — the user must choose a type before a dataset
 * draft is created. The choice is fixed once the draft exists (Section 2). */
function DatasetTypeDialog({ open, onOpenChange, onContinue }: DatasetTypeDialogProps) {
  return (
    <ChoiceDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Dataset"
      description="Choose what kind of dataset you want to create."
      groupLabel="Dataset type"
      options={OPTIONS}
      footnote="You can't change this after the draft is created."
      onContinue={onContinue}
    />
  )
}

export { DatasetTypeDialog }
