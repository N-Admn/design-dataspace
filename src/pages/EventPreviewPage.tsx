import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EventPreview } from '@/components/event/EventPreview'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { isEventInformationValid } from '@/lib/event-validation'
import { clearEventDraftSnapshot, loadEventDraftSnapshot } from '@/lib/event-draft-storage'

function EventPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, upsertEvent } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [justPublished, setJustPublished] = React.useState(false)

  const record = id ? events.find((e) => e.id === id) : undefined
  // Load once on mount and freeze — re-reading after our own publish action would
  // pick up the just-updated status and flip "Publish" into "Submit Changes" mid-flow.
  const [snapshot] = React.useState(() => (id ? loadEventDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form
  const [initialStatus] = React.useState(() => snapshot?.status ?? record?.status ?? 'draft')
  const hasLiveVersion = initialStatus === 'published' || initialStatus === 'pending'

  const handleEditInWorkspace = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/events/new', { state: { eventId: id, initialStep: 1 } })
    }, 50)
  }

  const handleContinueToManage = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/events')
    }, 50)
  }

  if (!id || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Preview unavailable</p>
        <p className="text-sm text-muted-foreground">This event preview could not be found. It may have been removed.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/events')}>
          Back to Events
        </Button>
      </div>
    )
  }

  const ready = isEventInformationValid(form.metadata)

  const handlePublish = async () => {
    if (!ready) return
    const ok = await confirm({
      title: hasLiveVersion ? 'Submit changes?' : 'Publish event?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.title}" will be submitted for review before going live.`
        : `You're about to publish "${form.metadata.title}". Once published, this event will be visible to the public.`,
      confirmLabel: hasLiveVersion ? 'Submit Changes' : 'Publish Event',
    })
    if (!ok) return
    setIsSubmitting(true)
    window.setTimeout(() => {
      const nextStatus = hasLiveVersion ? 'pending' : 'published'
      upsertEvent(id, nextStatus, form)
      clearEventDraftSnapshot(id)
      setIsSubmitting(false)
      setJustPublished(true)
      toast({
        title: hasLiveVersion ? 'Changes submitted' : 'Event published',
        description: hasLiveVersion
          ? 'Your changes are pending review. The current published version remains live.'
          : 'Your event is now publicly available.',
        variant: 'success',
      })
    }, 500)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {justPublished ? (hasLiveVersion ? 'Changes submitted' : 'Event published') : 'Event Preview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {justPublished
              ? hasLiveVersion
                ? 'Your changes are pending review. The current published version remains live.'
                : 'Your event is now publicly available.'
              : 'This is what your event will look like when published.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {justPublished ? (
            <>
              <Button type="button" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                View Event
              </Button>
              <Button type="button" onClick={handleContinueToManage}>
                Continue to Manage
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleEditInWorkspace}>
                Edit in Workspace
              </Button>
              <Button type="button" onClick={handlePublish} disabled={!ready || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {hasLiveVersion ? 'Submitting...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    {hasLiveVersion ? 'Submit Changes' : 'Publish Event'}
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {!ready && !justPublished && (
        <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning-foreground">
          This event isn't ready to publish yet. Return to the workspace to complete the required fields.
        </p>
      )}

      <EventPreview form={form} />
    </div>
  )
}

export { EventPreviewPage }
