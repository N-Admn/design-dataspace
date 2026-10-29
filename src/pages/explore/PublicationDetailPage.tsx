import { useNavigate, useParams } from 'react-router-dom'

import { PublicationPreview } from '@/components/publication/PublicationPreview'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'
import { resolvePublisherByOrganisation } from '@/lib/dataset-publisher'

/** Global search with the Publications tab selected — where publications are browsed. */
const PUBLICATION_SEARCH_PATH = '/search?type=publications'

function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { publications, organisationWorkspaces } = useAppData()
  // Back to wherever the reader came from (usually search, with its query and
  // filters intact); the Publications search tab when there's no history.
  const goBack = useGoBack(PUBLICATION_SEARCH_PATH)

  const record = id ? publications.find((p) => p.id === id) : undefined
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!record || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="type-heading-3 text-foreground">Publication not found</p>
        <p className="type-body text-muted-foreground">This publication may have been unpublished or does not exist.</p>
        <Button type="button" variant="outline" onClick={() => navigate(PUBLICATION_SEARCH_PATH)}>
          Back to Publications
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <PublicationPreview
        form={form}
        publisher={resolvePublisherByOrganisation(record.organisationId, record.createdBy, organisationWorkspaces)}
        publishedAt={record.updatedAt}
        onBack={goBack}
      />
    </div>
  )
}

export { PublicationDetailPage }
