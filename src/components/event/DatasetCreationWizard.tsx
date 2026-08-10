import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Stepper } from '@/components/ui/stepper'
import { DatasetBasicDetails } from '@/components/event/DatasetBasicDetails'
import { DatasetResourceStep } from '@/components/event/DatasetResource'
import { DatasetLicenseAccess } from '@/components/event/DatasetLicenseAccess'
import { useAppData } from '@/context/AppDataContext'
import {
  validateMiniDatasetBasics,
  isMiniDatasetBasicsValid,
  validateMiniDatasetResources,
  validateMiniDatasetLicense,
  isMiniDatasetLicenseValid,
} from '@/lib/mini-dataset-validation'
import { emptyDatasetForm, type DatasetFormState, type DatasetMetadata, type DatasetResource } from '@/types/dataset'

type MiniStep = 1 | 2 | 3

const MINI_STEPS = [
  { step: 1, label: 'Basic Details' },
  { step: 2, label: 'Resource' },
  { step: 3, label: 'License & Access' },
]

const MINI_STEP_TITLES: Record<MiniStep, string> = {
  1: 'Add Dataset',
  2: 'Resource',
  3: 'License & Access',
}

interface DatasetCreationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (datasetId: string, name: string) => void
}

function DatasetCreationWizard({ open, onOpenChange, onCreated }: DatasetCreationWizardProps) {
  const { upsertDataset } = useAppData()
  const [step, setStep] = React.useState<MiniStep>(1)
  const [metadata, setMetadata] = React.useState<DatasetMetadata>(emptyDatasetForm.metadata)
  const [resources, setResources] = React.useState<DatasetResource[]>([])
  const [showErrors, setShowErrors] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setStep(1)
      setMetadata(emptyDatasetForm.metadata)
      setResources([])
      setShowErrors(false)
    }
  }, [open])

  const updateMetadata = <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  const basicErrors = validateMiniDatasetBasics(metadata)
  const resourceError = validateMiniDatasetResources(resources)
  const licenseErrors = validateMiniDatasetLicense(metadata)

  const handleNextFromBasics = () => {
    if (!isMiniDatasetBasicsValid(metadata)) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep(2)
  }

  const handleNextFromResource = () => {
    if (validateMiniDatasetResources(resources)) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep(3)
  }

  const handleSubmit = () => {
    if (!isMiniDatasetLicenseValid(metadata)) {
      setShowErrors(true)
      return
    }
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader>
          <DialogTitle>{MINI_STEP_TITLES[step]}</DialogTitle>
          <DialogDescription>Create a lightweight dataset without leaving this event.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="mb-5">
            <Stepper compact steps={MINI_STEPS} currentStep={step} />
          </div>

          {step === 1 && (
            <DatasetBasicDetails
              metadata={metadata}
              errors={showErrors ? basicErrors : {}}
              onChange={updateMetadata}
              onCancel={() => onOpenChange(false)}
              onNext={handleNextFromBasics}
            />
          )}
          {step === 2 && (
            <DatasetResourceStep
              resources={resources}
              onAddResource={(resource) => setResources((prev) => [...prev, resource])}
              onRemoveResource={(id) => setResources((prev) => prev.filter((r) => r.id !== id))}
              error={showErrors ? resourceError : undefined}
              onBack={() => setStep(1)}
              onNext={handleNextFromResource}
            />
          )}
          {step === 3 && (
            <DatasetLicenseAccess
              metadata={metadata}
              resources={resources}
              errors={showErrors ? licenseErrors : {}}
              onChange={updateMetadata}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DatasetCreationWizard }
