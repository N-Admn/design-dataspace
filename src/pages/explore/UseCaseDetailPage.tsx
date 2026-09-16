import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UseCasePreview } from '@/components/usecase/UseCasePreview'
import { useAppData } from '@/context/AppDataContext'

function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { useCases } = useAppData()

  const record = id ? useCases.find((u) => u.id === id) : undefined
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <p className="type-heading-3 text-foreground">Use case not found</p>
        <p className="text-sm text-muted-foreground">
          This use case may have been unpublished or does not exist.
        </p>
        <Button type="button" variant="outline" onClick={() => navigate('/explore/use-cases')}>
          Back to Use Cases
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-2">
      <Link
        to="/explore/use-cases"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Use Cases
      </Link>

      <UseCasePreview form={form} publishedAt={record?.updatedAt} />
    </div>
  )
}

export { UseCaseDetailPage }
