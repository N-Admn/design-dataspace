import { ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { AIModelDetail } from '@/components/ai-model/consumer/AIModelDetail'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'
import { publisherProfileHref, resolveDatasetPublisher } from '@/lib/dataset-publisher'

/** The public AI Model page (`/explore/ai-models/:id`). Visitors only ever see the live **published** version, the same rule as
 *  the other Explore detail pages; the contributor's preview page is for the contributor alone. */
function AIModelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { aiModels, organisationWorkspaces } = useAppData()
  const goBack = useGoBack('/search?type=ai-model')

  const record = id ? aiModels.find((m) => m.id === id) : undefined
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!record || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState title="AI model not found" description="This AI model may have been unpublished or does not exist." />
        <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2">
      <AIModelDetail
        form={form}
        publisher={resolveDatasetPublisher(record, organisationWorkspaces)}
        publisherHref={publisherProfileHref(record.organisationId)}
        updatedAt={record.updatedAt}
        onBack={goBack}
      />
    </div>
  )
}

export { AIModelDetailPage }
