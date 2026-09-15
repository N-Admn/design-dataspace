import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { PublicationPreview } from '@/components/publication/PublicationPreview'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { isPublicationReadyToPublish } from '@/lib/publication-validation'
import { clearPublicationDraftSnapshot, loadPublicationDraftSnapshot } from '@/lib/publication-draft-storage'

function PublicationPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { publications, upsertPublication } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [justPublished, setJustPublished] = React.useState(false)

  const record = id ? publications.find((p) => p.id === id) : undefined
  // Load once on mount and freeze — re-reading after our own publish action would
  // pick up the just-updated status and flip "Publish" into "Publish Changes" mid-flow.
  const [snapshot] = React.useState(() => (id ? loadPublicationDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form
  const [initialStatus] = React.useState(() => snapshot?.status ?? record?.status ?? 'draft')
  const hasLiveVersion = initialStatus === 'published'

  const handleEditInWorkspace = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/publications/new', { state: { publicationId: id, initialStep: 1 } })
    }, 50)
  }

  const handleBackToDashboard = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/publications')
    }, 50)
  }

  if (!id || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="type-heading-3 text-foreground">Preview unavailable</p>
        <p className="text-sm text-muted-foreground">This Publication preview could not be found. It may have been removed.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/publications')}>
          Back to Publications
        </Button>
      </div>
    )
  }

  const ready = isPublicationReadyToPublish(form)

  const handlePublish = async () => {
    if (!ready) return
    const ok = await confirm({
      title: hasLiveVersion ? 'Publish changes?' : 'Publish Publication?',
      description: hasLiveVersion
        ? `Your changes to "${form.metadata.name}" will replace the current published version immediately.`
        : `You're about to publish "${form.metadata.name}". Once published, this Publication will be publicly available on CivicDataSpace.`,
      confirmLabel: hasLiveVersion ? 'Publish Changes' : 'Publish Publication',
    })
    if (!ok) return
    setIsSubmitting(true)
    window.setTimeout(() => {
      upsertPublication(id, 'published', form)
      clearPublicationDraftSnapshot(id)
      setIsSubmitting(false)
      setJustPublished(true)
      toast({
        title: hasLiveVersion ? 'Changes published' : 'Publication published',
        description: hasLiveVersion
          ? 'Your changes are now live on CivicDataSpace.'
          : 'Your Publication is now publicly available on CivicDataSpace.',
        variant: 'success',
      })
    }, 500)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <PreviewActionBar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {justPublished ? (hasLiveVersion ? 'Changes published' : 'Publication published') : 'Publication Preview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {justPublished
              ? hasLiveVersion
                ? 'Your changes are now live on CivicDataSpace.'
                : 'Your Publication is now publicly available on CivicDataSpace.'
              : 'This is what your Publication will look like when published.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {justPublished ? (
            <>
              <Button type="button" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                View Publication
              </Button>
              <Button type="button" onClick={handleBackToDashboard}>
                Back to Publications
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
                    {hasLiveVersion ? 'Publish Changes' : 'Publish Publication'}
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
          This Publication isn't ready to publish yet. Return to the workspace to complete the required fields.
        </p>
      )}

      <PublicationPreview form={form} publishedAt={record?.updatedAt} />
    </div>
  )
}

export { PublicationPreviewPage }
