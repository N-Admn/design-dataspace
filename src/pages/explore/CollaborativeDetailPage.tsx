import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { buildCollaborativeDetail } from '@/lib/collaborative-detail-data'
import { CollaborativeDetailView } from '@/pages/playground/collaborative-detail/CollaborativeDetailView'

/** The public Collaborative page (`/explore/collaboratives/:id`). Consumers only ever see the live **published** version, the same
 *  rule as the other Explore detail pages; content is read from the record and the published datasets and use cases it connects. */
function CollaborativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts } = useAppData()

  const record = id ? collaboratives.find((c) => c.id === id) : undefined
  const data = React.useMemo(
    () => (record ? buildCollaborativeDetail(record, { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts }) : null),
    [record, datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts],
  )

  if (!record || !data) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState title="Collaborative not found" description="This Collaborative may have been unpublished or does not exist." />
        <Link to="/search?type=collaboratives" className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back to Collaboratives
        </Link>
      </div>
    )
  }

  const externalUrl = data.externalUrl
  return (
    <div className="mx-auto w-full max-w-[1400px] py-2">
      <CollaborativeDetailView
        data={data}
        hideEmptySections
        unifiedSearch
        onBack={() => navigate(-1)}
        // Collaborate goes to the initiative's own website when it has one; without one it says so instead of doing nothing.
        cta={
          externalUrl
            ? { tagline: 'Want to be part of this collaborative?', label: 'Collaborate', href: externalUrl }
            : {
                tagline: 'Want to be part of this collaborative?',
                label: 'Collaborate',
                onClick: () => toast({ title: 'No collaboration link yet', description: 'This Collaborative has not published a website or contact for joining.' }),
              }
        }
        onOpenResource={(resource) => resource.href && navigate(resource.href)}
      />
    </div>
  )
}

export { CollaborativeDetailPage }
