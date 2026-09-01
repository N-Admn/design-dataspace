import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { AIModelPreview } from '@/components/ai-model/AIModelPreview'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { isAIModelReadyToPublish } from '@/lib/ai-model-validation'
import { clearAIModelDraftSnapshot, loadAIModelDraftSnapshot } from '@/lib/ai-model-draft-storage'

function AIModelPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { aiModels, upsertAIModel } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [checking, setChecking] = React.useState(false)
  const [justPublished, setJustPublished] = React.useState(false)
  const [publishFailed, setPublishFailed] = React.useState(false)

  const record = id ? aiModels.find((m) => m.id === id) : undefined
  // Load once on mount and freeze — re-reading after our own publish action would
  // pick up the just-updated status and flip "Publish" into "Publish Changes" mid-flow.
  const [snapshot] = React.useState(() => (id ? loadAIModelDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form
  const [initialStatus] = React.useState(() => snapshot?.status ?? record?.status ?? 'draft')
  const hasLiveVersion = initialStatus === 'published'

  const otherNames = id ? aiModels.filter((m) => m.id !== id).map((m) => m.form.metadata.name) : []

  const handleEditInWorkspace = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/ai-models/new', { state: { aiModelId: id, initialStep: 1 } })
    }, 50)
  }

  const handleBackToDashboard = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/ai-models')
    }, 50)
  }

  if (!id || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Preview unavailable</p>
        <p className="text-sm text-muted-foreground">This AI Model preview could not be found. It may have been removed.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/ai-models')}>
          Back to AI Models
        </Button>
      </div>
    )
  }

  const ready = isAIModelReadyToPublish(form, otherNames)

  const handlePublish = async () => {
    if (!ready) return
    const ok = await confirm({
      title: hasLiveVersion ? 'Publish changes?' : 'Publish AI Model?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.name}" will replace the current published version immediately.`
        : `You're about to publish "${form.metadata.name}". Once published, this AI Model will be publicly available on CivicDataSpace.`,
      confirmLabel: hasLiveVersion ? 'Publish Changes' : 'Publish AI Model',
    })
    if (!ok) return

    setChecking(true)
    setPublishFailed(false)
    window.setTimeout(() => {
      setChecking(false)
      setIsSubmitting(true)
      window.setTimeout(() => {
        try {
          upsertAIModel(id, 'published', form)
          clearAIModelDraftSnapshot(id)
          setIsSubmitting(false)
          setJustPublished(true)
          toast({
            title: hasLiveVersion ? 'Changes published' : 'AI model published',
            description: hasLiveVersion
              ? 'Your changes are now live on CivicDataSpace.'
              : 'Your AI model is now publicly available on CivicDataSpace.',
            variant: 'success',
          })
        } catch {
          setIsSubmitting(false)
          setPublishFailed(true)
        }
      }, 600)
    }, 400)
  }

  const busy = checking || isSubmitting

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <PreviewActionBar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {justPublished ? (hasLiveVersion ? 'Changes published' : 'AI model published') : 'AI Model Preview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {justPublished
              ? hasLiveVersion
                ? 'Your changes are now live on CivicDataSpace.'
                : 'Your AI model is now publicly available on CivicDataSpace.'
              : 'This is what your AI Model will look like when published.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {justPublished ? (
            <>
              <Button type="button" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                View AI Model
              </Button>
              <Button type="button" onClick={handleBackToDashboard}>
                Back to AI Models
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleEditInWorkspace} disabled={busy}>
                ← Back to Editor
              </Button>
              <Button type="button" onClick={handlePublish} disabled={!ready || busy}>
                {checking ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking model details…
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Publishing model…
                  </>
                ) : (
                  <>
                    {hasLiveVersion ? 'Publish Changes' : 'Publish AI Model'}
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
          <p className="font-medium">We couldn't publish your AI model.</p>
          <p className="mt-0.5">Your changes have been kept. Fix the highlighted issues and try again.</p>
        </div>
      )}

      {!ready && !justPublished && (
        <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm text-warning-foreground">
          This AI Model isn't ready to publish yet. Return to the workspace to complete the required fields.
        </p>
      )}

      <AIModelPreview form={form} />
    </div>
  )
}

export { AIModelPreviewPage }
