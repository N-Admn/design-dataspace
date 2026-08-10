import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { EventInformationStep } from '@/components/event/EventInformationStep'
import { EventConnectionsStep } from '@/components/event/EventConnectionsStep'
import { EventPublicationsStep } from '@/components/event/EventPublicationsStep'
import { EventPublishReview } from '@/components/event/EventPublishReview'
import { validateEventInformation, isEventInformationValid } from '@/lib/event-validation'
import { useAppData } from '@/context/AppDataContext'
import { emptyEventForm, type EventFormState, type EventMetadata } from '@/types/event'

type EventStep = 1 | 2 | 3 | 4

const EVENT_STEPS = [
  { step: 1, label: 'Information' },
  { step: 2, label: 'Connections' },
  { step: 3, label: 'Publications' },
  { step: 4, label: 'Publish' },
]

interface EventNavState {
  eventId?: string
  initialStep?: EventStep
}

function EventCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { events, upsertEvent } = useAppData()

  const navState = (location.state as EventNavState | null) ?? null

  const [editingId, setEditingId] = useState<string | null>(navState?.eventId ?? null)
  const [step, setStep] = useState<EventStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<EventFormState>(() => {
    if (navState?.eventId) {
      const record = events.find((e) => e.id === navState.eventId)
      if (record) return record.form
    }
    return emptyEventForm
  })
  const [showInfoErrors, setShowInfoErrors] = useState(false)
  const [saved, setSaved] = useState(true)

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

  const handleClose = () => navigate('/dashboard/events')

  const handleContinueFromInformation = () => {
    if (!isEventInformationValid(form.metadata)) {
      setShowInfoErrors(true)
      return
    }
    setShowInfoErrors(false)
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

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertEvent(editingId, 'draft', form)
    if (!editingId) setEditingId(id)
    setTimeout(() => setSaved(true), 500)
  }

  const handlePublish = () => {
    if (!isEventInformationValid(form.metadata)) {
      setShowInfoErrors(true)
      setStep(1)
      return
    }
    upsertEvent(editingId, 'published', form)
    window.alert('Event published successfully.')
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
        />
      </div>
    </Card>
  )
}

export { EventCreationPage }
