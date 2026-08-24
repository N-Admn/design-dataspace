import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, LayoutTemplate, ListChecks, Share2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { UseCaseStep1Metadata } from '@/components/usecase/UseCaseStep1Metadata'
import { UseCaseStep2Builder } from '@/components/usecase/UseCaseStep2Builder'
import { UseCaseStep3Connections } from '@/components/usecase/UseCaseStep3Connections'
import { UseCaseStep4Review } from '@/components/usecase/UseCaseStep4Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { saveUseCaseDraftSnapshot } from '@/lib/usecase-draft-storage'
import { emptyUseCaseForm, type UseCaseFormState, type UseCaseMetadata } from '@/types/usecase'

type UseCaseStep = 1 | 2 | 3 | 4

const USE_CASE_STEPS = [
  { step: 1, label: 'Start', description: 'Name & classify', icon: FileText },
  { step: 2, label: 'Builder', description: 'Tell the story', icon: LayoutTemplate },
  { step: 3, label: 'Connect', description: 'Datasets & people', icon: Share2 },
  { step: 4, label: 'Review', description: 'Check readiness', icon: ListChecks },
]

interface UseCaseNavState {
  useCaseId?: string
  initialStep?: UseCaseStep
  /** Set when this flow was launched from another module (e.g. Collaborative → Content →
   * Create New Use Case) so completion can hand the user back to that originating context. */
  returnTo?: string
  returnState?: Record<string, unknown>
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
  const [step, setStep] = useState<UseCaseStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<UseCaseFormState>(resumeRecord?.form ?? emptyUseCaseForm)
  const [lastSavedForm, setLastSavedForm] = useState<UseCaseFormState>(resumeRecord?.form ?? emptyUseCaseForm)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const stepLabel = USE_CASE_STEPS.find((s) => s.step === step)?.label ?? 'Start'
  useEffect(() => {
    setContextLabel(`Use Cases → ${stepLabel}`)
  }, [stepLabel, setContextLabel])

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(lastSavedForm)

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

  const editingRecord = editingId ? useCases.find((u) => u.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published' || editingRecord?.status === 'pending'

  const handleSaveDraft = () => {
    setSaved(false)
    const nextStatus = hasLiveVersion ? 'pending' : 'draft'
    const id = upsertUseCase(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: nextStatus === 'pending' ? 'Changes saved' : 'Draft saved',
      description:
        nextStatus === 'pending'
          ? 'Your changes are pending and awaiting publication. The current published version remains live.'
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
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper steps={USE_CASE_STEPS} currentStep={step} />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <UseCaseStep1Metadata metadata={form.metadata} errors={{}} onChange={updateMetadata} />
        )}
        {step === 2 && (
          <UseCaseStep2Builder
            metadata={form.metadata}
            blocks={form.blocks}
            onBlocksChange={(blocks) => setForm((prev) => ({ ...prev, blocks }))}
          />
        )}
        {step === 3 && (
          <UseCaseStep3Connections
            connections={form.connections}
            onChange={(connections) => setForm((prev) => ({ ...prev, connections }))}
          />
        )}
        {step === 4 && <UseCaseStep4Review form={form} onEditStep={goToStep} onPreview={handlePreview} />}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 4}
          onPrevious={handlePrevious}
          onContinue={() => goToStep((step + 1) as UseCaseStep)}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="use case"
        onContinueEditing={() => setShowLeaveConfirm(false)}
        onSaveDraftAndExit={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
        }}
        onDiscardAndExit={() => {
          setShowLeaveConfirm(false)
          returnToOrigin()
        }}
      />
    </Card>
  )
}

export { UseCaseCreationPage }
