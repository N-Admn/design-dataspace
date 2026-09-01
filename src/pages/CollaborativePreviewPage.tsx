import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { CollaborativePreview } from '@/components/collaborative/CollaborativePreview'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { isCollaborativeReadyToPublish } from '@/lib/collaborative-validation'
import { clearCollaborativeDraftSnapshot, loadCollaborativeDraftSnapshot } from '@/lib/collaborative-draft-storage'

function CollaborativePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { collaboratives, upsertCollaborative } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [justPublished, setJustPublished] = React.useState(false)
  const [publishFailed, setPublishFailed] = React.useState(false)

  const record = id ? collaboratives.find((c) => c.id === id) : undefined
  // Load once on mount and freeze — re-reading after our own publish action would
  // pick up the just-updated status and flip "Publish" into "Publish Changes" mid-flow.
  const [snapshot] = React.useState(() => (id ? loadCollaborativeDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form
  const [initialStatus] = React.useState(() => snapshot?.status ?? record?.status ?? 'draft')
  const hasLiveVersion = initialStatus === 'published'

  const handleEditInWorkspace = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/collaboratives/new', { state: { collaborativeId: id, initialStep: 1 } })
    }, 50)
  }

  const handleBackToDashboard = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/collaboratives')
    }, 50)
  }

  if (!id || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Preview unavailable</p>
        <p className="text-sm text-muted-foreground">
          This Collaborative preview could not be found. It may have been removed.
        </p>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/collaboratives')}>
          Back to Collaboratives
        </Button>
      </div>
    )
  }

  const ready = isCollaborativeReadyToPublish(form)

  const handlePublish = async () => {
    if (!ready) return
    const ok = await confirm({
      title: hasLiveVersion ? 'Publish changes?' : 'Publish Collaborative?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.name}" will replace the current published version immediately.`
        : `You're about to publish "${form.metadata.name}". Once published, this Collaborative will be visible to the public.`,
      confirmLabel: hasLiveVersion ? 'Publish Changes' : 'Publish Collaborative',
    })
    if (!ok) return
    setIsSubmitting(true)
    setPublishFailed(false)
    window.setTimeout(() => {
      try {
        upsertCollaborative(id, 'published', form)
        clearCollaborativeDraftSnapshot(id)
        setIsSubmitting(false)
        setJustPublished(true)
        toast({
          title: hasLiveVersion ? 'Changes published' : 'Collaborative published',
          description: hasLiveVersion
            ? 'Your changes are now live on CivicDataSpace.'
            : 'Your Collaborative is now publicly available on CivicDataSpace.',
          variant: 'success',
        })
      } catch {
        setIsSubmitting(false)
        setPublishFailed(true)
      }
    }, 500)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <PreviewActionBar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {justPublished ? (hasLiveVersion ? 'Changes published' : 'Collaborative published') : 'Collaborative Preview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {justPublished
              ? hasLiveVersion
                ? 'Your changes are now live on CivicDataSpace.'
                : 'Your Collaborative is now publicly available on CivicDataSpace.'
              : 'This is what your Collaborative will look like when published.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {justPublished ? (
            <>
              <Button type="button" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                View Collaborative
              </Button>
              <Button type="button" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleEditInWorkspace}>
                ← Back to Editor
              </Button>
              <Button type="button" onClick={handlePublish} disabled={!ready || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    {hasLiveVersion ? 'Publish Changes' : 'Publish Collaborative'}
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </PreviewActionBar>

      {publishFailed && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <p className="font-medium">We couldn't publish this Collaborative.</p>
          <p className="mt-0.5">Your changes have been kept. Fix the highlighted issues and try again.</p>
        </div>
      )}

      {!ready && !justPublished && (
        <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning-foreground">
          This Collaborative isn't ready to publish yet. Return to the workspace to complete the required fields.
        </p>
      )}

      <CollaborativePreview form={form} />
    </div>
  )
}

export { CollaborativePreviewPage }
