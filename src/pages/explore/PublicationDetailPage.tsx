import { ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { PublicationPreview } from '@/components/publication/PublicationPreview'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'

/** The public Publication page (`/explore/publications/:id`). Visitors only ever see the live **published** version, the same rule
 *  as the other Explore detail pages; the contributor's preview page is for the contributor alone. */
function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { publications } = useAppData()
  const goBack = useGoBack('/search?type=publication')

  const record = id ? publications.find((p) => p.id === id) : undefined
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!record || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState title="Publication not found" description="This publication may have been unpublished or does not exist." />
        <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-2">
      <button
        type="button"
        onClick={goBack}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <PublicationPreview form={form} publishedAt={record.updatedAt} />
    </div>
  )
}

export { PublicationDetailPage }
