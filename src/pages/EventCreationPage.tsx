import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, Link2, ListChecks, Newspaper } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { EventInformationStep } from '@/components/event/EventInformationStep'
import { EventConnectionsStep } from '@/components/event/EventConnectionsStep'
import { EventPublicationsStep } from '@/components/event/EventPublicationsStep'
import { EventPublishReview } from '@/components/event/EventPublishReview'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { validateEventInformation, isEventInformationValid } from '@/lib/event-validation'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { emptyEventForm, type EventFormState, type EventMetadata } from '@/types/event'

type EventStep = 1 | 2 | 3 | 4

const EVENT_STEPS = [
  { step: 1, label: 'Information', description: 'Event details & identity', icon: FileText },
  { step: 2, label: 'Connections', description: 'Datasets & related content', icon: Link2 },
  { step: 3, label: 'Publications', description: 'Reports & supporting content', icon: Newspaper },
  { step: 4, label: 'Publish', description: 'Final review & publish', icon: ListChecks },
]

interface EventNavState {
  eventId?: string
  initialStep?: EventStep
}

function resolveInitialForm(events: ReturnType<typeof useAppData>['events'], navState: EventNavState | null) {
  if (navState?.eventId) {
    const record = events.find((e) => e.id === navState.eventId)
    if (record) return record.form
  }
  return emptyEventForm
}

function EventCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { events, upsertEvent } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()
  const confirm = useConfirm()

  const navState = (location.state as EventNavState | null) ?? null

  const [editingId, setEditingId] = useState<string | null>(navState?.eventId ?? null)
  const [step, setStep] = useState<EventStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<EventFormState>(() => resolveInitialForm(events, navState))
  const [lastSavedForm, setLastSavedForm] = useState<EventFormState>(() => resolveInitialForm(events, navState))
  const [showInfoErrors, setShowInfoErrors] = useState(false)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const stepLabel = EVENT_STEPS.find((s) => s.step === step)?.label ?? 'Information'
  useEffect(() => {
    setContextLabel(`Events → Create Event → ${stepLabel}`)
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

  const infoErrors = validateEventInformation(form.metadata)
  const visibleInfoErrors = showInfoErrors ? infoErrors : {}

  const updateMetadata = <K extends keyof EventMetadata>(field: K, value: EventMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate('/dashboard/events')
  }

  const handleContinueFromInformation = () => {
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinueFromConnections = () => {
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinueFromPublications = () => {
    setStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as EventStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const editingRecord = editingId ? events.find((e) => e.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published' || editingRecord?.status === 'pending'

  const handleSaveDraft = () => {
    setSaved(false)
    const nextStatus = hasLiveVersion ? 'pending' : 'draft'
    const id = upsertEvent(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: nextStatus === 'pending' ? 'Changes saved' : 'Draft saved',
      description:
        nextStatus === 'pending'
          ? 'Your changes are pending and awaiting publication. The current published version remains live.'
          : 'Your event has been saved as a draft.',
      variant: 'success',
    })
  }

  const handlePublish = async () => {
    if (!isEventInformationValid(form.metadata)) {
      setShowInfoErrors(true)
      setStep(1)
      return
    }
    const ok = await confirm({
      title: 'Publish event?',
      description: `You're about to publish "${form.metadata.title}". Once published, this event will be visible to the public.`,
      confirmLabel: 'Publish Event',
    })
    if (!ok) return
    upsertEvent(editingId, 'published', form)
    setLastSavedForm(form)
    toast({ title: 'Event published', description: 'Your event is now publicly available.', variant: 'success' })
    navigate('/dashboard/events')
  }

  const handleContinue =
    step === 1 ? handleContinueFromInformation : step === 2 ? handleContinueFromConnections : handleContinueFromPublications

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={editingId ? form.metadata.title || 'Untitled Event' : 'New Event'}
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper steps={EVENT_STEPS} currentStep={step} />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <EventInformationStep metadata={form.metadata} errors={visibleInfoErrors} onChange={updateMetadata} />
        )}
        {step === 2 && <EventConnectionsStep form={form} onChange={setForm} />}
        {step === 3 && <EventPublicationsStep form={form} onChange={setForm} />}
        {step === 4 && (
          <EventPublishReview
            form={form}
            canPublish={isEventInformationValid(form.metadata)}
            onEditSection={(targetStep) => setStep(targetStep)}
            onPublish={handlePublish}
          />
        )}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 4}
          onPrevious={handlePrevious}
          onContinue={handleContinue}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="event"
        onContinueEditing={() => setShowLeaveConfirm(false)}
        onSaveDraftAndExit={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate('/dashboard/events')
        }}
        onDiscardAndExit={() => {
          setShowLeaveConfirm(false)
          navigate('/dashboard/events')
        }}
      />
    </Card>
  )
}

export { EventCreationPage }
