import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatasetBasicDetails } from '@/components/event/DatasetBasicDetails'
import { DatasetResourceStep } from '@/components/event/DatasetResource'
import { DatasetLicenseAccess } from '@/components/event/DatasetLicenseAccess'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { getResourceTitle } from '@/lib/file-validation'
import {
  validateMiniDatasetBasics,
  isMiniDatasetBasicsValid,
  validateMiniDatasetResources,
  validateMiniDatasetLicense,
  isMiniDatasetLicenseValid,
} from '@/lib/mini-dataset-validation'
import { emptyDatasetForm, type DatasetFormState, type DatasetMetadata, type DatasetResource } from '@/types/dataset'

interface DatasetCreationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (datasetId: string, name: string) => void
}

function DatasetCreationWizard({ open, onOpenChange, onCreated }: DatasetCreationWizardProps) {
  const { upsertDataset } = useAppData()
  const confirm = useConfirm()
  const [metadata, setMetadata] = React.useState<DatasetMetadata>(emptyDatasetForm.metadata)
  const [resources, setResources] = React.useState<DatasetResource[]>([])
  const [showErrors, setShowErrors] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setMetadata(emptyDatasetForm.metadata)
      setResources([])
      setShowErrors(false)
      setIsSubmitting(false)
    }
  }, [open])

  const updateMetadata = <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddResource = (resource: DatasetResource) => {
    setResources((prev) => {
      const suggestName = prev.length === 0 && !metadata.name.trim() && resource.type === 'csv' && resource.file
      if (suggestName) setMetadata((m) => ({ ...m, name: getResourceTitle(resource.file!) }))
      return [...prev, resource]
    })
  }

  const basicErrors = validateMiniDatasetBasics(metadata)
  const resourceError = validateMiniDatasetResources(resources)
  const licenseErrors = validateMiniDatasetLicense(metadata)
  const isFormValid = isMiniDatasetBasicsValid(metadata) && !resourceError && isMiniDatasetLicenseValid(metadata)

  const hasUnsavedChanges =
    metadata.name.trim() !== '' ||
    metadata.description.trim() !== '' ||
    metadata.sector !== '' ||
    metadata.license !== '' ||
    resources.length > 0

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved dataset details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (ok) onOpenChange(false)
      return
    }
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!isFormValid) {
      setShowErrors(true)
      return
    }
    setIsSubmitting(true)
    window.setTimeout(() => {
      const form: DatasetFormState = {
        metadata: {
          ...emptyDatasetForm.metadata,
          name: metadata.name,
          description: metadata.description,
          sector: metadata.sector,
          license: metadata.license,
          accessType: metadata.accessType,
        },
        files: [],
        enablePreview: false,
        resources,
      }
      const id = upsertDataset(null, 'published', form)
      onCreated(id, metadata.name)
    }, 500)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose()
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent variant="right-drawer" className="gap-0 p-0" showClose={!isSubmitting}>
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Dataset</DialogTitle>
          <DialogDescription>Create the essential dataset information and connect it to this event.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Resource</CardTitle>
                <p className="mt-1 text-sm font-normal text-muted-foreground">
                  Add at least one resource for this dataset.
                </p>
              </CardHeader>
              <CardContent>
                <DatasetResourceStep
                  resources={resources}
                  onAddResource={handleAddResource}
                  onRemoveResource={(id) => setResources((prev) => prev.filter((r) => r.id !== id))}
                  error={showErrors ? resourceError : undefined}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dataset Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DatasetBasicDetails
                  metadata={metadata}
                  errors={showErrors ? basicErrors : {}}
                  onChange={updateMetadata}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>License &amp; Access</CardTitle>
              </CardHeader>
              <CardContent>
                <DatasetLicenseAccess
                  metadata={metadata}
                  errors={showErrors ? licenseErrors : {}}
                  onChange={updateMetadata}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create & Add Dataset'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DatasetCreationWizard }
