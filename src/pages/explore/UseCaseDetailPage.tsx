import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UseCasePreview } from '@/components/usecase/UseCasePreview'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'
import { resolveUseCaseCreator } from '@/lib/usecase-creator'

/** Global search with the Use Cases tab selected — where use cases are browsed. */
const USE_CASE_SEARCH_PATH = '/search?type=use-case'

function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { useCases, organisationWorkspaces } = useAppData()
  // Back to wherever the reader came from (usually search, with its query and
  // filters intact); the Use Cases search tab when there's no history.
  const goBack = useGoBack(USE_CASE_SEARCH_PATH)

  const record = id ? useCases.find((u) => u.id === id) : undefined
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="type-heading-3 text-foreground">Use case not found</p>
        <p className="type-body text-muted-foreground">
          This use case may have been unpublished or does not exist.
        </p>
        <Button type="button" variant="outline" onClick={() => navigate(USE_CASE_SEARCH_PATH)}>
          Back to Use Cases
        </Button>
      </div>
    )
  }

  return (
    // -mt-8 cancels <main>'s top padding so the hero band sits flush under the breadcrumb.
    <div className="mx-auto -mt-8 w-full max-w-6xl pb-8">
      <UseCasePreview
        form={form}
        creator={resolveUseCaseCreator(record, organisationWorkspaces)}
        publishedAt={record?.updatedAt}
        backLink={
          <button
            type="button"
            onClick={goBack}
            className="type-label flex w-fit items-center gap-1.5 text-foreground/75 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        }
      />
    </div>
  )
}

export { UseCaseDetailPage }
