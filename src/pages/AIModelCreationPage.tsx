import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, ListChecks, Server } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { AIModelStep1Details } from '@/components/ai-model/AIModelStep1Details'
import { AIModelVersionsStep } from '@/components/ai-model/AIModelVersionsStep'
import { AIModelStep3Review } from '@/components/ai-model/AIModelStep3Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { saveAIModelDraftSnapshot } from '@/lib/ai-model-draft-storage'
import { createEmptyAIModelForm, type AIModelFormState, type AIModelMetadata } from '@/types/ai-model'

type AIModelStep = 1 | 2 | 3

const AI_MODEL_STEPS = [
  { step: 1, label: 'Model Information', description: 'Describe the model', icon: FileText },
  { step: 2, label: 'Versions', description: 'Configure releases and access', icon: Server },
  { step: 3, label: 'Review', description: 'Check readiness', icon: ListChecks },
]

interface AIModelNavState {
  aiModelId?: string
  initialStep?: AIModelStep
}

function AIModelCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { aiModels, upsertAIModel } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()

  const navState = (location.state as AIModelNavState | null) ?? null
  const resumeRecord = navState?.aiModelId ? aiModels.find((m) => m.id === navState.aiModelId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<AIModelStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<AIModelFormState>(resumeRecord?.form ?? createEmptyAIModelForm())
  const [lastSavedForm, setLastSavedForm] = useState<AIModelFormState>(resumeRecord?.form ?? form)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [openVersionId, setOpenVersionId] = useState<string | null>(null)

  const stepLabel = AI_MODEL_STEPS.find((s) => s.step === step)?.label ?? 'Model Information'
  useEffect(() => {
    setContextLabel(`AI Models → ${stepLabel}`)
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

  const otherNames = aiModels.filter((m) => m.id !== editingId).map((m) => m.form.metadata.name)

  const updateMetadata = <K extends keyof AIModelMetadata>(field: K, value: AIModelMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate('/dashboard/ai-models')
  }

  const goToStep = (next: AIModelStep, versionId?: string) => {
    setStep(next)
    setOpenVersionId(versionId ?? null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as AIModelStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const editingRecord = editingId ? aiModels.find((m) => m.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published' || editingRecord?.status === 'pending'

  const handleSaveDraft = () => {
    setSaved(false)
    const nextStatus = hasLiveVersion ? 'pending' : 'draft'
    const id = upsertAIModel(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: nextStatus === 'pending' ? 'Changes saved' : 'Draft saved',
      description:
        nextStatus === 'pending'
          ? 'Your changes are pending and awaiting publication. The current published version remains live.'
          : 'Your AI Model has been saved as a draft.',
      variant: 'success',
    })
    return id
  }

  const handlePreview = () => {
    let id = editingId
    if (!id) {
      id = upsertAIModel(null, 'draft', form)
      setEditingId(id)
      setLastSavedForm(form)
    }
    saveAIModelDraftSnapshot({ id, status: editingRecord?.status ?? 'draft', form })
    window.open(`/dashboard/ai-models/${id}/preview`, '_blank')
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.metadata.name || 'Untitled AI Model'}
        onTitleChange={(name) => updateMetadata('name', name)}
        editablePlaceholder="Untitled AI Model"
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper steps={AI_MODEL_STEPS} currentStep={step} />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && <AIModelStep1Details form={form} otherNames={otherNames} onChange={updateMetadata} />}
        {step === 2 && (
          <AIModelVersionsStep
            versions={form.versions}
            modelType={form.metadata.modelType}
            onChange={(versions) => setForm((prev) => ({ ...prev, versions }))}
            openVersionId={openVersionId}
            onOpenVersionConsumed={() => setOpenVersionId(null)}
          />
        )}
        {step === 3 && (
          <AIModelStep3Review form={form} otherNames={otherNames} onEditStep={goToStep} onPreview={handlePreview} />
        )}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 3}
          onPrevious={handlePrevious}
          onContinue={() => goToStep((step + 1) as AIModelStep)}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="AI Model"
        onContinueEditing={() => setShowLeaveConfirm(false)}
        onSaveDraftAndExit={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate('/dashboard/ai-models')
        }}
        onDiscardAndExit={() => {
          setShowLeaveConfirm(false)
          navigate('/dashboard/ai-models')
        }}
      />
    </Card>
  )
}

export { AIModelCreationPage }
