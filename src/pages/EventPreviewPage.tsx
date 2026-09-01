import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
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
  // pick up the just-updated status and flip "Publish" into "Publish Changes" mid-flow.
  const [snapshot] = React.useState(() => (id ? loadEventDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form
  const [initialStatus] = React.useState(() => snapshot?.status ?? record?.status ?? 'draft')
  const hasLiveVersion = initialStatus === 'published'

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
      title: hasLiveVersion ? 'Publish changes?' : 'Publish event?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.title}" will replace the current published version immediately.`
        : `You're about to publish "${form.metadata.title}". Once published, this event will be visible to the public.`,
      confirmLabel: hasLiveVersion ? 'Publish Changes' : 'Publish Event',
    })
    if (!ok) return
    setIsSubmitting(true)
    window.setTimeout(() => {
      upsertEvent(id, 'published', form)
      clearEventDraftSnapshot(id)
      setIsSubmitting(false)
      setJustPublished(true)
      toast({
        title: hasLiveVersion ? 'Changes published' : 'Event published',
        description: hasLiveVersion
          ? 'Your changes are now live on CivicDataSpace.'
          : 'Your event is now publicly available.',
        variant: 'success',
      })
    }, 500)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <PreviewActionBar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {justPublished ? (hasLiveVersion ? 'Changes published' : 'Event published') : 'Event Preview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {justPublished
              ? hasLiveVersion
                ? 'Your changes are now live on CivicDataSpace.'
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
                    Publishing...
                  </>
                ) : (
                  <>
                    {hasLiveVersion ? 'Publish Changes' : 'Publish Event'}
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </PreviewActionBar>

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
