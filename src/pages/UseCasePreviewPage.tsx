import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { UseCasePreview } from '@/components/usecase/UseCasePreview'
import { useAppData } from '@/context/AppDataContext'
import { resolveUseCaseCreator } from '@/lib/usecase-creator'
import { loadUseCaseDraftSnapshot } from '@/lib/usecase-draft-storage'

/** View-only preview of the working copy, opened in a new tab from the editor's
 * Review step. Publishing happens back in the editor, not here. */
function UseCasePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { useCases, organisationWorkspaces } = useAppData()

  const record = id ? useCases.find((u) => u.id === id) : undefined
  // Load once on mount — the snapshot carries unsaved editor state into this tab.
  const [snapshot] = React.useState(() => (id ? loadUseCaseDraftSnapshot(id) : null))
  const form = snapshot?.form ?? record?.form

  const handleEditInWorkspace = () => {
    window.close()
    window.setTimeout(() => {
      navigate('/dashboard/use-cases/new', { state: { useCaseId: id, initialStep: 1 } })
    }, 50)
  }

  if (!id || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="type-heading-3 text-foreground">Preview unavailable</p>
        <p className="text-sm text-muted-foreground">
          This Use Case preview could not be found. It may have been removed.
        </p>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/use-cases')}>
          Back to Use Cases
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-6">
      <PreviewActionBar>
        <div>
          <p className="text-sm font-semibold text-foreground">Use Case Preview</p>
          <p className="text-xs text-muted-foreground">
            This is what your Use Case will look like when published. Publish it from the Review step in the editor.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleEditInWorkspace}>
          Edit in Workspace
        </Button>
      </PreviewActionBar>

      {/* Share the eventual public URL, not this preview route; the rail sits
          below the sticky action bar. */}
      <UseCasePreview
        form={form}
        creator={resolveUseCaseCreator(record, organisationWorkspaces)}
        publishedAt={record?.updatedAt}
        shareUrl={`${window.location.origin}/explore/use-cases/${id}`}
        stickyTopClassName="lg:top-32"
      />
    </div>
  )
}

export { UseCasePreviewPage }
