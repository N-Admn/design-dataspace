import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, ListChecks, Share2, Users } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { CollaborativeStep1About } from '@/components/collaborative/CollaborativeStep1About'
import { CollaborativeStep2People } from '@/components/collaborative/CollaborativeStep2People'
import { CollaborativeStep3Content } from '@/components/collaborative/CollaborativeStep3Content'
import { CollaborativeStep4Review } from '@/components/collaborative/CollaborativeStep4Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { saveCollaborativeDraftSnapshot } from '@/lib/collaborative-draft-storage'
import { isCollaborativeReadyToPublish } from '@/lib/collaborative-validation'
import { hasUnsavedEdits } from '@/lib/content-status'
import { emptyCollaborativeForm, type CollaborativeFormState, type CollaborativeMetadata } from '@/types/collaborative'

type CollaborativeStep = 1 | 2 | 3 | 4

const COLLABORATIVE_STEPS = [
  { step: 1, label: 'About', description: 'What is this?', icon: FileText },
  { step: 2, label: 'People', description: 'Who is involved?', icon: Users },
  { step: 3, label: 'Content', description: 'What is connected?', icon: Share2 },
  { step: 4, label: 'Review', description: 'Check readiness', icon: ListChecks },
]

interface CollaborativeNavState {
  collaborativeId?: string
  initialStep?: CollaborativeStep
  /** Set by the Use Case creation flow when it returns here after "Create New Use Case". */
  createdUseCaseId?: string
}

function CollaborativeCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collaboratives, useCases, upsertCollaborative } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()

  const navState = (location.state as CollaborativeNavState | null) ?? null
  const resumeRecord = navState?.collaborativeId ? collaboratives.find((c) => c.id === navState.collaborativeId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<CollaborativeStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<CollaborativeFormState>(resumeRecord?.form ?? emptyCollaborativeForm)
  const [lastSavedForm, setLastSavedForm] = useState<CollaborativeFormState>(resumeRecord?.form ?? emptyCollaborativeForm)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  // Stepper is a progress indicator until Review is reached with every step valid.
  const [stepperUnlocked, setStepperUnlocked] = useState(false)

  const stepLabel = COLLABORATIVE_STEPS.find((s) => s.step === step)?.label ?? 'About'
  useEffect(() => {
    setContextLabel(`Collaboratives → ${stepLabel}`)
  }, [stepLabel, setContextLabel])

  // Returning from "Create New Use Case" with a newly created id — connect it once and
  // drop the marker from history state so a back-navigation doesn't re-trigger it.
  const handledCreatedUseCaseId = useRef<string | null>(null)
  useEffect(() => {
    const createdId = navState?.createdUseCaseId
    if (!createdId || handledCreatedUseCaseId.current === createdId) return
    handledCreatedUseCaseId.current = createdId
    const record = useCases.find((u) => u.id === createdId)
    const title = record?.form.metadata.title || 'Untitled Use Case'
    setForm((prev) => {
      if (prev.connections.useCases.some((u) => u.id === createdId)) return prev
      return { ...prev, connections: { ...prev.connections, useCases: [...prev.connections.useCases, { id: createdId, title }] } }
    })
    toast({ title: 'Use case connected', description: `"${title}" was created and connected to this Collaborative.`, variant: 'success' })
    navigate(location.pathname, { replace: true, state: { collaborativeId: navState?.collaborativeId ?? editingId, initialStep: 3 } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.createdUseCaseId])

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

  const updateMetadata = <K extends keyof CollaborativeMetadata>(field: K, value: CollaborativeMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate('/dashboard/collaboratives')
  }

  const goToStep = (next: CollaborativeStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as CollaborativeStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allStepsValid = isCollaborativeReadyToPublish(form)
  useEffect(() => {
    if (step === 4 && allStepsValid) setStepperUnlocked(true)
  }, [step, allStepsValid])

  const editingRecord = editingId ? collaboratives.find((c) => c.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published'
  const showUnsavedIndicator = hasLiveVersion && hasUnsavedChanges

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertCollaborative(editingId, 'draft', form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: hasLiveVersion ? 'Changes saved' : 'Draft saved',
      description: hasLiveVersion
        ? 'Your edits aren’t published yet. The current published version stays live.'
        : 'Your Collaborative has been saved as a draft.',
      variant: 'success',
    })
    return id
  }


  const handlePreview = () => {
    let id = editingId
    if (!id) {
      id = upsertCollaborative(null, 'draft', form)
      setEditingId(id)
      setLastSavedForm(form)
    }
    saveCollaborativeDraftSnapshot({ id, status: editingRecord?.status ?? 'draft', form })
    window.open(`/dashboard/collaboratives/${id}/preview`, '_blank')
  }

  const handleCreateUseCase = () => {
    let id = editingId
    if (!id) {
      id = upsertCollaborative(null, 'draft', form)
      setEditingId(id)
      setLastSavedForm(form)
    }
    navigate('/dashboard/use-cases/new', {
      state: { returnTo: '/dashboard/collaboratives/new', returnState: { collaborativeId: id, initialStep: 3 } },
    })
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.metadata.name || 'Untitled Collaborative'}
        onTitleChange={(name) => updateMetadata('name', name)}
        editablePlaceholder="Untitled Collaborative"
        unsavedChanges={showUnsavedIndicator}
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper
          steps={COLLABORATIVE_STEPS}
          currentStep={step}
          interactive={stepperUnlocked}
          onStepClick={(n) => goToStep(n as CollaborativeStep)}
        />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && <CollaborativeStep1About metadata={form.metadata} errors={{}} onChange={updateMetadata} />}
        {step === 2 && (
          <CollaborativeStep2People
            connections={form.connections}
            onChange={(connections) => setForm((prev) => ({ ...prev, connections }))}
          />
        )}
        {step === 3 && (
          <CollaborativeStep3Content
            connections={form.connections}
            onChange={(connections) => setForm((prev) => ({ ...prev, connections }))}
            onCreateUseCase={handleCreateUseCase}
          />
        )}
        {step === 4 && <CollaborativeStep4Review form={form} onEditStep={goToStep} onPreview={handlePreview} />}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 4}
          onPrevious={handlePrevious}
          onContinue={() => goToStep((step + 1) as CollaborativeStep)}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="Collaborative"
        onCancel={() => setShowLeaveConfirm(false)}
        onSave={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate('/dashboard/collaboratives')
        }}
        onDiscard={() => {
          setShowLeaveConfirm(false)
          navigate('/dashboard/collaboratives')
        }}
      />
    </Card>
  )
}

export { CollaborativeCreationPage }
