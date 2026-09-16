import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutTemplate, ListChecks, Share2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { UseCaseStep1Builder } from '@/components/usecase/UseCaseStep1Builder'
import { UseCaseStep2Connect } from '@/components/usecase/UseCaseStep2Connect'
import { UseCaseStep3Review } from '@/components/usecase/UseCaseStep3Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { saveUseCaseDraftSnapshot } from '@/lib/usecase-draft-storage'
import { isUseCaseReadyToPublish } from '@/lib/usecase-validation'
import { hasUnsavedEdits } from '@/lib/content-status'
import { emptyUseCaseForm, type UseCaseFormState, type UseCaseMetadata } from '@/types/usecase'

// Three steps: Builder (basic info + content), Connect (classification, datasets,
// contributors, organisations), Review (readiness + publish). The former
// standalone "Start" step no longer exists — its fields now open the Builder
// step (title/thumbnail) and the Connect step (classification).
type UseCaseStep = 1 | 2 | 3

const USE_CASE_STEPS = [
  { step: 1, label: 'Builder', description: 'Create and structure your Use Case', icon: LayoutTemplate },
  { step: 2, label: 'Connect', description: 'Add context, datasets, and contributors', icon: Share2 },
  { step: 3, label: 'Review', description: 'Check readiness and publish', icon: ListChecks },
]

interface UseCaseNavState {
  useCaseId?: string
  /** Any 1|4-style value from a caller that predates the 3-step flow is clamped
   * safely below — see `resolveInitialStep`. */
  initialStep?: number
  /** Set when this flow was launched from another module (e.g. Collaborative → Content →
   * Create New Use Case) so completion can hand the user back to that originating context. */
  returnTo?: string
  returnState?: Record<string, unknown>
}

/** Existing saved Use Cases never persisted a step number (the wizard's step is
 * page-local UI state, not part of the record), so there's no stored step data
 * to migrate. This only has to make sense of *nav-state* values passed in by a
 * caller — clamping anything outside 1–3 (e.g. a stale "4" for the old Review
 * step) into the new range rather than crashing or defaulting confusingly. */
function resolveInitialStep(value: number | undefined): UseCaseStep {
  if (value === 2 || value === 3) return value
  if (value && value > 3) return 3
  return 1
}

function UseCaseCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { useCases, upsertUseCase } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()

  const navState = (location.state as UseCaseNavState | null) ?? null
  const resumeRecord = navState?.useCaseId ? useCases.find((u) => u.id === navState.useCaseId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<UseCaseStep>(resolveInitialStep(navState?.initialStep))
  const [form, setForm] = useState<UseCaseFormState>(resumeRecord?.form ?? emptyUseCaseForm)
  const [lastSavedForm, setLastSavedForm] = useState<UseCaseFormState>(resumeRecord?.form ?? emptyUseCaseForm)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  // Stepper is a progress indicator until Review is reached with every step valid.
  const [stepperUnlocked, setStepperUnlocked] = useState(false)

  const stepLabel = USE_CASE_STEPS.find((s) => s.step === step)?.label ?? 'Builder'
  useEffect(() => {
    setContextLabel(`Use Cases → ${stepLabel}`)
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

  const updateMetadata = <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const returnToOrigin = () => {
    if (navState?.returnTo) {
      navigate(navState.returnTo, { state: { ...navState.returnState, createdUseCaseId: editingId ?? undefined } })
      return
    }
    navigate('/dashboard/use-cases')
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    returnToOrigin()
  }

  const goToStep = (next: UseCaseStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as UseCaseStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allStepsValid = isUseCaseReadyToPublish(form)
  useEffect(() => {
    if (step === 3 && allStepsValid) setStepperUnlocked(true)
  }, [step, allStepsValid])

  const editingRecord = editingId ? useCases.find((u) => u.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published'
  const showUnsavedIndicator = hasLiveVersion && hasUnsavedChanges

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertUseCase(editingId, 'draft', form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: hasLiveVersion ? 'Changes saved' : 'Draft saved',
      description: hasLiveVersion
        ? 'Your edits aren’t published yet. The current published version stays live.'
        : 'Your use case has been saved as a draft.',
      variant: 'success',
    })
    if (navState?.returnTo) {
      navigate(navState.returnTo, { state: { ...navState.returnState, createdUseCaseId: id } })
    }
  }

  const handlePreview = () => {
    let id = editingId
    if (!id) {
      id = upsertUseCase(null, 'draft', form)
      setEditingId(id)
      setLastSavedForm(form)
    }
    saveUseCaseDraftSnapshot({ id, status: editingRecord?.status ?? 'draft', form })
    window.open(`/dashboard/use-cases/${id}/preview`, '_blank')
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.metadata.title || 'Untitled Use Case'}
        onTitleChange={(title) => updateMetadata('title', title)}
        editablePlaceholder="Untitled Use Case"
        unsavedChanges={showUnsavedIndicator}
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper
          steps={USE_CASE_STEPS}
          currentStep={step}
          interactive={stepperUnlocked}
          onStepClick={(n) => goToStep(n as UseCaseStep)}
        />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <UseCaseStep1Builder
            metadata={form.metadata}
            basicInfoErrors={{}}
            onMetadataChange={updateMetadata}
            blocks={form.blocks}
            onBlocksChange={(blocks) => setForm((prev) => ({ ...prev, blocks }))}
            dashboardEmbedCode={form.dashboardEmbedCode}
            onDashboardEmbedCodeChange={(dashboardEmbedCode) => setForm((prev) => ({ ...prev, dashboardEmbedCode }))}
          />
        )}
        {step === 2 && (
          <UseCaseStep2Connect
            metadata={form.metadata}
            onMetadataChange={updateMetadata}
            connections={form.connections}
            onChange={(connections) => setForm((prev) => ({ ...prev, connections }))}
          />
        )}
        {step === 3 && <UseCaseStep3Review form={form} onEditStep={goToStep} onPreview={handlePreview} />}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 3}
          onPrevious={handlePrevious}
          onContinue={() => goToStep((step + 1) as UseCaseStep)}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="use case"
        onCancel={() => setShowLeaveConfirm(false)}
        onSave={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
        }}
        onDiscard={() => {
          setShowLeaveConfirm(false)
          returnToOrigin()
        }}
      />
    </Card>
  )
}

export { UseCaseCreationPage }
