import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, ListChecks, Share2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { PublicVisibilityBadge } from '@/components/dataset/PublicVisibilityNotice'
import { CollaborativeStep1About } from '@/components/collaborative/CollaborativeStep1About'
import { CollaborativeStep2Connections } from '@/components/collaborative/CollaborativeStep2Connections'
import { CollaborativeStep3Review } from '@/components/collaborative/CollaborativeStep3Review'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { OrganisationContextBanner } from '@/components/organisation/OrganisationContextBanner'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { saveCollaborativeDraftSnapshot } from '@/lib/collaborative-draft-storage'
import {
  isCollaborativeReadyToPublish,
  slugify,
  takenCollaborativeSlugs,
  validateCollaborativeAbout,
} from '@/lib/collaborative-validation'
import { hasUnsavedEdits } from '@/lib/content-status'
import { emptyCollaborativeForm, type CollaborativeFormState, type CollaborativeMetadata } from '@/types/collaborative'

type CollaborativeStep = 1 | 2 | 3

const COLLABORATIVE_STEPS = [
  { step: 1, label: 'About', description: 'What is this?', icon: FileText },
  { step: 2, label: 'Connections', description: 'Who and what is connected?', icon: Share2 },
  { step: 3, label: 'Review & Publish', description: 'Check readiness', icon: ListChecks },
]

interface CollaborativeNavState {
  collaborativeId?: string
  initialStep?: CollaborativeStep
  organisationId?: string
  returnTo?: string
}

function CollaborativeCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collaboratives, upsertCollaborative, organisationWorkspaces } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()

  const navState = (location.state as CollaborativeNavState | null) ?? null
  const resumeRecord = navState?.collaborativeId ? collaboratives.find((c) => c.id === navState.collaborativeId) : undefined
  const organisationId = navState?.organisationId
  const returnTo = navState?.returnTo ?? '/dashboard/collaboratives'
  const organisation = organisationId ? organisationWorkspaces.find((o) => o.id === organisationId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<CollaborativeStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<CollaborativeFormState>(resumeRecord?.form ?? emptyCollaborativeForm)
  const [lastSavedForm, setLastSavedForm] = useState<CollaborativeFormState>(resumeRecord?.form ?? emptyCollaborativeForm)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  // Stepper is a progress indicator until Review is reached with every step valid.
  const [stepperUnlocked, setStepperUnlocked] = useState(false)
  // Like Dataset Creation, field errors stay hidden until they matter — here, from
  // the moment the user reaches Review, where readiness is checked.
  const [showAboutErrors, setShowAboutErrors] = useState(false)

  const stepLabel = COLLABORATIVE_STEPS.find((s) => s.step === step)?.label ?? 'About'
  useEffect(() => {
    setContextLabel(`Collaboratives → ${stepLabel}`)
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

  const updateMetadata = <K extends keyof CollaborativeMetadata>(field: K, value: CollaborativeMetadata[K]) => {
    setForm((prev) => {
      const metadata = { ...prev.metadata, [field]: value }
      // The URL follows the name until someone edits it by hand (i.e. while it still
      // matches what the previous name would have produced).
      if (field === 'name' && (!prev.metadata.slug || prev.metadata.slug === slugify(prev.metadata.name))) {
        metadata.slug = slugify(value as string)
      }
      return { ...prev, metadata }
    })
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate(returnTo)
  }

  const goToStep = (next: CollaborativeStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as CollaborativeStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const takenSlugs = takenCollaborativeSlugs(collaboratives, editingId)
  const aboutErrors = validateCollaborativeAbout(form, takenSlugs)
  const allStepsValid = isCollaborativeReadyToPublish(form, takenSlugs)
  useEffect(() => {
    if (step === 3) setShowAboutErrors(true)
    if (step === 3 && allStepsValid) setStepperUnlocked(true)
  }, [step, allStepsValid])

  const editingRecord = editingId ? collaboratives.find((c) => c.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published'
  const showUnsavedIndicator = hasLiveVersion && hasUnsavedChanges

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertCollaborative(editingId, 'draft', form, organisationId)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    // Same wording as Dataset Creation (datasetLifecycleMessage).
    toast({
      title: hasLiveVersion ? 'Changes saved' : 'Collaborative saved as Draft',
      description: hasLiveVersion
        ? 'Your edits aren’t published yet. The current published version stays live.'
        : 'It is not publicly available yet.',
      variant: 'success',
    })
    return id
  }


  const handlePreview = () => {
    let id = editingId
    if (!id) {
      id = upsertCollaborative(null, 'draft', form, organisationId)
      setEditingId(id)
      setLastSavedForm(form)
    }
    saveCollaborativeDraftSnapshot({ id, status: editingRecord?.status ?? 'draft', form })
    window.open(`/dashboard/collaboratives/${id}/preview`, '_blank')
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={editingId ? form.metadata.name || 'Untitled Collaborative' : 'New Collaborative'}
        unsavedChanges={showUnsavedIndicator}
      />
      {organisation && <OrganisationContextBanner organisationName={organisation.metadata.name} />}
      <div className="flex items-center border-t border-border px-6 py-2.5">
        <PublicVisibilityBadge isLive={hasLiveVersion} />
      </div>
      <div className="border-t border-border px-6 py-6">
        <Stepper
          steps={COLLABORATIVE_STEPS}
          currentStep={step}
          interactive={stepperUnlocked}
          onStepClick={(n) => goToStep(n as CollaborativeStep)}
        />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <CollaborativeStep1About
            metadata={form.metadata}
            errors={showAboutErrors ? aboutErrors : {}}
            onChange={updateMetadata}
          />
        )}
        {step === 2 && (
          <CollaborativeStep2Connections
            connections={form.connections}
            onChange={(connections) => setForm((prev) => ({ ...prev, connections }))}
          />
        )}
        {step === 3 && (
          <CollaborativeStep3Review form={form} takenSlugs={takenSlugs} onEditStep={goToStep} onPreview={handlePreview} />
        )}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 3}
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
          navigate(returnTo)
        }}
        onDiscard={() => {
          setShowLeaveConfirm(false)
          navigate(returnTo)
        }}
      />
    </Card>
  )
}

export { CollaborativeCreationPage }
