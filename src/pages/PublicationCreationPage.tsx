import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileStack, FileText, ListChecks } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { PublicationStep1Details } from '@/components/publication/PublicationStep1Details'
import { PublicationStep2Content } from '@/components/publication/PublicationStep2Content'
import { PublicationStep3Review } from '@/components/publication/PublicationStep3Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { savePublicationDraftSnapshot } from '@/lib/publication-draft-storage'
import { isPublicationReadyToPublish, validatePublicationDetails } from '@/lib/publication-validation'
import { hasUnsavedEdits } from '@/lib/content-status'
import { getPublicationFileTitle } from '@/lib/publication-file'
import {
  emptyPublicationForm,
  type PublicationFileBlock,
  type PublicationFormState,
  type PublicationMetadata,
} from '@/types/publication'

type PublicationStep = 1 | 2 | 3

const PUBLICATION_STEPS = [
  { step: 1, label: 'Files', description: 'Upload files & videos', icon: FileStack },
  { step: 2, label: 'Details', description: 'Name, describe & classify', icon: FileText },
  { step: 3, label: 'Review & Publish', description: 'Check readiness', icon: ListChecks },
]

interface PublicationNavState {
  publicationId?: string
  initialStep?: PublicationStep
}

function PublicationCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { publications, upsertPublication } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()

  const navState = (location.state as PublicationNavState | null) ?? null
  const resumeRecord = navState?.publicationId ? publications.find((p) => p.id === navState.publicationId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<PublicationStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<PublicationFormState>(resumeRecord?.form ?? emptyPublicationForm)
  const [lastSavedForm, setLastSavedForm] = useState<PublicationFormState>(resumeRecord?.form ?? emptyPublicationForm)
  const [showDetailsErrors, setShowDetailsErrors] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  // Stepper is a progress indicator until Review is reached with every step valid.
  const [stepperUnlocked, setStepperUnlocked] = useState(false)

  const stepLabel = PUBLICATION_STEPS.find((s) => s.step === step)?.label ?? 'Details'
  useEffect(() => {
    setContextLabel(`Publications → ${stepLabel}`)
  }, [stepLabel, setContextLabel])

  const hasUnsavedChanges = hasUnsavedEdits(form, lastSavedForm)

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setSaved(false)
    const timeout = setTimeout(() => setSaved(true), 700)
    return () => clearTimeout(timeout)
  }, [form])

  const detailsErrors = validatePublicationDetails(form)
  const visibleDetailsErrors = showDetailsErrors ? detailsErrors : {}

  const updateMetadata = <K extends keyof PublicationMetadata>(field: K, value: PublicationMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate('/dashboard/publications')
  }

  const goToStep = (next: PublicationStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as PublicationStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allStepsValid = isPublicationReadyToPublish(form)
  useEffect(() => {
    if (step === 3 && allStepsValid) setStepperUnlocked(true)
  }, [step, allStepsValid])

  const editingRecord = editingId ? publications.find((p) => p.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published'
  const showUnsavedIndicator = hasLiveVersion && hasUnsavedChanges

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertPublication(editingId, 'draft', form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: hasLiveVersion ? 'Changes saved' : 'Draft saved',
      description: hasLiveVersion
        ? 'Your edits aren’t published yet. The current published version stays live.'
        : 'Your Publication has been saved as a draft.',
      variant: 'success',
    })
  }

  const handlePreview = () => {
    if (!isPublicationReadyToPublish(form)) {
      setShowDetailsErrors(true)
      setStep(2)
      return
    }
    let id = editingId
    if (!id) {
      id = upsertPublication(null, 'draft', form)
      setEditingId(id)
      setLastSavedForm(form)
    }
    savePublicationDraftSnapshot({ id, status: editingRecord?.status ?? 'draft', form })
    window.open(`/dashboard/publications/${id}/preview`, '_blank')
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.metadata.name || 'Untitled Publication'}
        onTitleChange={(name) => updateMetadata('name', name)}
        editablePlaceholder="Untitled Publication"
        unsavedChanges={showUnsavedIndicator}
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper
          steps={PUBLICATION_STEPS}
          currentStep={step}
          interactive={stepperUnlocked}
          onStepClick={(n) => goToStep(n as PublicationStep)}
        />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <PublicationStep2Content
            blocks={form.blocks}
            onBlocksChange={(blocks) =>
              setForm((prev) => {
                const suggestName =
                  prev.blocks.length === 0 && !prev.metadata.name.trim()
                    ? (blocks.find((b): b is PublicationFileBlock => b.type === 'file') ?? null)
                    : null
                return {
                  ...prev,
                  blocks,
                  metadata: suggestName
                    ? { ...prev.metadata, name: getPublicationFileTitle(suggestName) }
                    : prev.metadata,
                }
              })
            }
          />
        )}
        {step === 2 && (
          <PublicationStep1Details metadata={form.metadata} errors={visibleDetailsErrors} onChange={updateMetadata} />
        )}
        {step === 3 && <PublicationStep3Review form={form} onEditStep={goToStep} onPreview={handlePreview} />}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 3}
          onPrevious={handlePrevious}
          onContinue={() => goToStep((step + 1) as PublicationStep)}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="Publication"
        onCancel={() => setShowLeaveConfirm(false)}
        onSave={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate('/dashboard/publications')
        }}
        onDiscard={() => {
          setShowLeaveConfirm(false)
          navigate('/dashboard/publications')
        }}
      />
    </Card>
  )
}

export { PublicationCreationPage }
