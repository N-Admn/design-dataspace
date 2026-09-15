import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { Step2DataFiles } from '@/components/dataset/Step2DataFiles'
import { DatasetBasicDetails } from '@/components/event/DatasetBasicDetails'
import { DatasetLicenseAccess } from '@/components/event/DatasetLicenseAccess'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { getResourceTitle } from '@/lib/file-validation'
import {
  validateMiniDatasetBasics,
  isMiniDatasetBasicsValid,
  validateMiniDatasetFiles,
  validateMiniDatasetLicense,
  isMiniDatasetLicenseValid,
} from '@/lib/mini-dataset-validation'
import {
  emptyDatasetForm,
  type DatasetFile,
  type DatasetFormState,
  type DatasetMetadata,
  type DatasetRecord,
} from '@/types/dataset'

interface DatasetCreationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (datasetId: string, name: string) => void
  /** When set, the wizard edits this existing dataset instead of creating one.
   * Only datasets created through "+ Add Resource" (never search references)
   * are passed here. */
  initial?: DatasetRecord
}

const seedMetadata = (initial?: DatasetRecord): DatasetMetadata =>
  initial
    ? {
        ...emptyDatasetForm.metadata,
        name: initial.form.metadata.name,
        description: initial.form.metadata.description,
        sector: initial.form.metadata.sector,
        license: initial.form.metadata.license,
        accessType: initial.form.metadata.accessType,
      }
    : emptyDatasetForm.metadata

function DatasetCreationWizard({ open, onOpenChange, onCreated, initial }: DatasetCreationWizardProps) {
  const { upsertDataset } = useAppData()
  const confirm = useConfirm()
  const [metadata, setMetadata] = React.useState<DatasetMetadata>(() => seedMetadata(initial))
  const [files, setFiles] = React.useState<DatasetFile[]>(() => initial?.form.files ?? emptyDatasetForm.files)
  const [showErrors, setShowErrors] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setMetadata(seedMetadata(initial))
      setFiles(initial?.form.files ?? emptyDatasetForm.files)
      setShowErrors(false)
      setIsSubmitting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const updateMetadata = <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  const handleFilesAdd = (newFiles: DatasetFile[]) => {
    setFiles((prev) => {
      // Prefill the dataset name from the first file the way the full flow does.
      const suggestName = prev.length === 0 && !metadata.name.trim() && newFiles[0]
      if (suggestName) setMetadata((m) => ({ ...m, name: getResourceTitle(newFiles[0]) }))
      return [...prev, ...newFiles]
    })
  }

  const basicErrors = validateMiniDatasetBasics(metadata)
  const filesError = validateMiniDatasetFiles(files)
  const licenseErrors = validateMiniDatasetLicense(metadata)
  const isFormValid = isMiniDatasetBasicsValid(metadata) && !filesError && isMiniDatasetLicenseValid(metadata)

  const base = seedMetadata(initial)
  const hasUnsavedChanges =
    metadata.name.trim() !== base.name.trim() ||
    metadata.description.trim() !== base.description.trim() ||
    metadata.sector !== base.sector ||
    metadata.license !== base.license ||
    metadata.accessType !== base.accessType ||
    files !== (initial?.form.files ?? emptyDatasetForm.files)

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
        files,
        resources: [],
      }
      const id = upsertDataset(initial?.id ?? null, 'published', form)
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
          <DialogTitle>{initial ? 'Edit Dataset' : 'Add Dataset'}</DialogTitle>
          <DialogDescription>Create the essential dataset information and connect it to this event.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Step2DataFiles
                files={files}
                onFilesAdd={handleFilesAdd}
                onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                onFileTitleChange={(id, title) =>
                  setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)))
                }
                onFileDescriptionChange={(id, description) =>
                  setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, description } : f)))
                }
              />
              {showErrors && <FieldError message={filesError} />}
            </div>

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
                {initial ? 'Saving...' : 'Creating...'}
              </>
            ) : initial ? (
              'Save Changes'
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
