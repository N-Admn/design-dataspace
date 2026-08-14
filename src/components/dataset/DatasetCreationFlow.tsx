import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText, ListChecks, UploadCloud } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { Step1Metadata } from '@/components/dataset/Step1Metadata'
import { Step2DataFiles } from '@/components/dataset/Step2DataFiles'
import { Step3Review } from '@/components/dataset/Step3Review'
import { PublishSuccessModal } from '@/components/dataset/PublishSuccessModal'
import { PublicVisibilityBadge } from '@/components/dataset/PublicVisibilityNotice'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { validateMetadata, isMetadataValid } from '@/lib/validation'
import { datasetLifecycleMessage } from '@/lib/dataset-lifecycle-messages'
import { emptyDatasetForm, type DatasetFormState, type DatasetMetadata, type DatasetStatus } from '@/types/dataset'

type WizardStep = 1 | 2 | 3

const DATASET_STEPS = [
  { step: 1, label: 'Metadata', description: 'Name, description & settings', icon: FileText },
  { step: 2, label: 'Data Files', description: 'Upload dataset files', icon: UploadCloud },
  { step: 3, label: 'Review & Publish', description: 'Final review & publish', icon: ListChecks },
]

interface DatasetCreatedResult {
  id: string
  status: DatasetStatus
  name: string
}

interface DatasetCreationFlowProps {
  /** "page" renders the full My Workspace creation card (Datasets module).
   * "drawer" renders as a right-side slide-over for contextual creation from another module. */
  variant: 'page' | 'drawer'
  /** Drawer visibility — ignored for the page variant, which is only ever mounted while active. */
  open?: boolean
  /** Resume editing an existing dataset. Contextual "Create New Dataset" entry points always pass null. */
  datasetId?: string | null
  initialStep?: WizardStep
  /** Shown as read-only context under the drawer title, e.g. "Use Case → Connections". */
  contextLabel?: string
  /** Label for the "return to origin" action after creation, e.g. "Return to Use Case". Drawer only. */
  returnLabel?: string
  onClose: () => void
  /** Drawer only — fired when the user chooses to return to (or view from) the origin after a successful save. */
  onCreated?: (result: DatasetCreatedResult) => void
}

function DrawerSuccessPanel({
  status,
  returnLabel,
  onContinueEditing,
  onReturn,
  onViewDataset,
}: {
  status: DatasetStatus
  returnLabel: string
  onContinueEditing: () => void
  onReturn: () => void
  onViewDataset: () => void
}) {
  const message = datasetLifecycleMessage(status)
  const isPublished = status === 'published'

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-6" />
      </div>
      <div>
        <p className="text-base font-semibold text-primary">{isPublished ? 'Dataset published' : message.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPublished ? 'Your Dataset is now publicly available on CivicDataSpace.' : message.description}
        </p>
      </div>
      <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {isPublished ? (
          <Button type="button" variant="outline" onClick={onViewDataset}>
            View Dataset
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onContinueEditing}>
            Continue editing
          </Button>
        )}
        <Button type="button" onClick={onReturn}>
          {returnLabel}
        </Button>
      </div>
    </div>
  )
}

function DatasetCreationFlow({
  variant,
  open = true,
  datasetId = null,
  initialStep = 1,
  contextLabel,
  returnLabel = 'Return',
  onClose,
  onCreated,
}: DatasetCreationFlowProps) {
  const navigate = useNavigate()
  const { datasets, upsertDataset } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()
  const confirm = useConfirm()

  const resolveInitialForm = () =>
    datasetId ? (datasets.find((d) => d.id === datasetId)?.form ?? emptyDatasetForm) : emptyDatasetForm

  const [editingId, setEditingId] = React.useState<string | null>(datasetId)
  const [step, setStep] = React.useState<WizardStep>(initialStep)
  const [form, setForm] = React.useState<DatasetFormState>(resolveInitialForm)
  const [lastSavedForm, setLastSavedForm] = React.useState<DatasetFormState>(resolveInitialForm)
  const [showMetadataErrors, setShowMetadataErrors] = React.useState(false)
  const [saved, setSaved] = React.useState(true)
  const [publishSuccess, setPublishSuccess] = React.useState<{ name: string } | null>(null)
  const [drawerSuccess, setDrawerSuccess] = React.useState<{ status: DatasetStatus; id: string } | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false)

  // The drawer variant stays mounted between opens (Radix animates in/out), so reset state each time it opens.
  React.useEffect(() => {
    if (variant !== 'drawer' || !open) return
    const record = datasetId ? datasets.find((d) => d.id === datasetId) : undefined
    setEditingId(record?.id ?? null)
    setStep(initialStep)
    setForm(record?.form ?? emptyDatasetForm)
    setLastSavedForm(record?.form ?? emptyDatasetForm)
    setShowMetadataErrors(false)
    setDrawerSuccess(null)
    setSaved(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Report the active step to Help & Support. Only the page variant owns the route's context —
  // the drawer variant is layered over another module that already sets its own label.
  const stepLabel = step === 1 ? 'Metadata' : step === 2 ? 'Resources' : 'Review'
  React.useEffect(() => {
    if (variant !== 'page') return
    setContextLabel(`Datasets → ${editingId ? 'Edit Dataset' : 'Create Dataset'} → ${stepLabel}`)
  }, [variant, stepLabel, editingId, setContextLabel])

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(lastSavedForm)

  const isFirstRender = React.useRef(true)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setSaved(false)
    const timeout = setTimeout(() => setSaved(true), 700)
    return () => clearTimeout(timeout)
  }, [form])

  const metadataErrors = validateMetadata(form.metadata)
  const visibleMetadataErrors = showMetadataErrors ? metadataErrors : {}

  const updateMetadata = <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    onClose()
  }

  const goToStep = (next: WizardStep) => {
    setStep(next)
    if (variant === 'page') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => goToStep((Math.max(1, step - 1)) as WizardStep)

  const editingRecord = editingId ? datasets.find((d) => d.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published' || editingRecord?.status === 'pending'

  const handleSaveDraft = () => {
    setSaved(false)
    const nextStatus: DatasetStatus = hasLiveVersion ? 'pending' : 'draft'
    const id = upsertDataset(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)

    if (variant === 'drawer' && step === 3) {
      setDrawerSuccess({ status: nextStatus, id })
      return
    }
    const message = datasetLifecycleMessage(nextStatus)
    toast({ title: message.title, description: message.description, variant: 'success' })
  }

  const handlePublish = async () => {
    if (!isMetadataValid(form.metadata)) {
      setShowMetadataErrors(true)
      setStep(1)
      return
    }
    const ok = await confirm({
      title: hasLiveVersion ? 'Submit changes?' : 'Publish dataset?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.name}" will be submitted for review before going live.`
        : `You're about to publish "${form.metadata.name}". Once published, this dataset will be available in the public repository.`,
      confirmLabel: hasLiveVersion ? 'Submit Changes' : 'Publish Dataset',
    })
    if (!ok) return
    const nextStatus: DatasetStatus = hasLiveVersion ? 'pending' : 'published'
    const id = upsertDataset(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)

    if (variant === 'drawer') {
      setDrawerSuccess({ status: nextStatus, id })
      return
    }
    if (nextStatus === 'published') {
      setPublishSuccess({ name: form.metadata.name })
    } else {
      const message = datasetLifecycleMessage(nextStatus)
      toast({ title: message.title, description: message.description, variant: 'success' })
    }
  }

  const handleReturnToOrigin = () => {
    if (drawerSuccess) {
      onCreated?.({ id: drawerSuccess.id, status: drawerSuccess.status, name: form.metadata.name || 'Untitled dataset' })
    }
    onClose()
  }

  const handleViewDataset = () => {
    if (drawerSuccess) {
      onCreated?.({ id: drawerSuccess.id, status: drawerSuccess.status, name: form.metadata.name || 'Untitled dataset' })
      navigate('/dashboard/datasets', { state: { datasetId: drawerSuccess.id } })
    }
    onClose()
  }

  const stepContent = (
    <>
      {step === 1 && (
        <Step1Metadata metadata={form.metadata} errors={visibleMetadataErrors} onChange={updateMetadata} />
      )}
      {step === 2 && (
        <Step2DataFiles
          files={form.files}
          onFilesAdd={(newFiles) => setForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }))}
          onFileRemove={(id) => setForm((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== id) }))}
          enablePreview={form.enablePreview}
          onTogglePreview={(value) => setForm((prev) => ({ ...prev, enablePreview: value }))}
          resources={form.resources}
          onAddResource={(resource) => setForm((prev) => ({ ...prev, resources: [...prev.resources, resource] }))}
          onUpdateResource={(resource) =>
            setForm((prev) => ({
              ...prev,
              resources: prev.resources.map((r) => (r.id === resource.id ? resource : r)),
            }))
          }
          onRemoveResource={(id) =>
            setForm((prev) => ({ ...prev, resources: prev.resources.filter((r) => r.id !== id) }))
          }
        />
      )}
      {step === 3 && (
        <Step3Review
          form={form}
          datasetId={editingId}
          canPublish={isMetadataValid(form.metadata)}
          hasLiveVersion={hasLiveVersion}
          onEditMetadata={() => setStep(1)}
          onPublish={handlePublish}
        />
      )}
    </>
  )

  const footer = (
    <WizardFooter
      showPrevious={step > 1}
      showContinue={step < 3}
      onPrevious={handlePrevious}
      onContinue={() => goToStep((step + 1) as WizardStep)}
      onSaveDraft={handleSaveDraft}
      saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
    />
  )

  const leaveDialog = (
    <LeaveCreationDialog
      open={showLeaveConfirm}
      itemLabel="dataset"
      onContinueEditing={() => setShowLeaveConfirm(false)}
      onSaveDraftAndExit={() => {
        setShowLeaveConfirm(false)
        handleSaveDraft()
        onClose()
      }}
      onDiscardAndExit={() => {
        setShowLeaveConfirm(false)
        onClose()
      }}
    />
  )

  if (variant === 'drawer') {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogContent variant="right-drawer" className="gap-0 p-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>Create Dataset</DialogTitle>
            {contextLabel && (
              <p className="text-xs font-medium text-muted-foreground">Context: {contextLabel}</p>
            )}
            <DialogDescription>Add a new dataset to CivicDataSpace.</DialogDescription>
            {!drawerSuccess && (
              <div className="pt-0.5">
                <PublicVisibilityBadge isLive={hasLiveVersion} />
              </div>
            )}
          </DialogHeader>

          {drawerSuccess ? (
            <DrawerSuccessPanel
              status={drawerSuccess.status}
              returnLabel={returnLabel}
              onContinueEditing={() => setDrawerSuccess(null)}
              onReturn={handleReturnToOrigin}
              onViewDataset={handleViewDataset}
            />
          ) : (
            <>
              <div className="shrink-0 px-6 pt-4">
                <Stepper steps={DATASET_STEPS} currentStep={step} compact />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{stepContent}</div>
              <div className="shrink-0 border-t border-border">{footer}</div>
            </>
          )}
        </DialogContent>
        {leaveDialog}
      </Dialog>
    )
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={requestClose}
        title={editingId ? form.metadata.name || 'Untitled Dataset' : 'New Dataset'}
      />
      <div className="flex items-center justify-between border-t border-border px-6 py-2.5">
        <PublicVisibilityBadge isLive={hasLiveVersion} />
      </div>
      <div className="border-t border-border px-6 py-6">
        <Stepper steps={DATASET_STEPS} currentStep={step} />
      </div>
      <div className="border-t border-border px-6 py-6">{stepContent}</div>
      <div className="border-t border-border">{footer}</div>

      <PublishSuccessModal
        open={publishSuccess !== null}
        datasetName={publishSuccess?.name ?? ''}
        onCreateAnother={() => {
          setPublishSuccess(null)
          setEditingId(null)
          setStep(1)
          setForm(emptyDatasetForm)
          setLastSavedForm(emptyDatasetForm)
          setShowMetadataErrors(false)
        }}
        onViewWorkspace={() => {
          setPublishSuccess(null)
          onClose()
        }}
      />

      {leaveDialog}
    </Card>
  )
}

export { DatasetCreationFlow }
export type { DatasetCreatedResult }