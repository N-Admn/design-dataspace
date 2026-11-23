import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { DatasetActions } from '@/components/dataset/consumer/DatasetActions'
import { DatasetApplications } from '@/components/dataset/consumer/DatasetApplications'
import { DatasetDataDNA } from '@/components/dataset/consumer/DatasetDataDNA'
import { DatasetOverview } from '@/components/dataset/consumer/DatasetOverview'
import { DatasetDataExplorer } from '@/components/dataset/consumer/DatasetDataExplorer'
import { DatasetVisualisations } from '@/components/dataset/consumer/DatasetVisualisations'
import { LockedDataPanel } from '@/components/dataset/consumer/LockedDataPanel'
import { RestrictedAccessBar } from '@/components/dataset/consumer/RestrictedAccessBar'
import { useAppData } from '@/context/AppDataContext'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationsContext'
import { useGoBack } from '@/hooks/use-go-back'
import { resolveDatasetPublisher } from '@/lib/dataset-publisher'
import { canEditAsOwner, hasAccess, ownerOfDataset } from '@/lib/notification-model'

const VIEWS = [
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
  // The key stays `overview` so existing `?view=overview` links keep working; only the label changed.
  { key: 'overview', label: 'Metadata' },
  { key: 'applications', label: 'Connected to' },
]

/** Consumer-facing Dataset Details page — Dataset Header, then the three primary
 *  views (Data / Visualisations / Metadata / Applications). See the Dataset Module PRD for the
 *  full specification this implements. */
function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { datasets, organisationWorkspaces } = useAppData()
  const { isSignedIn } = useAuth()
  const { persona, state } = useNotifications()
  const [searchParams] = useSearchParams()
  // Lets a "View live" link deep-link straight to the Visualisations tab
  // (e.g. from a freshly-published Chart, which has no page of its own —
  // it only ever appears embedded here).
  const requestedView = searchParams.get('view')
  const [view, setView] = React.useState(() => (VIEWS.some((v) => v.key === requestedView) ? requestedView! : 'data'))
  // The Data DNA card links to `?view=visualisations` on this same page, so follow the URL when it changes after mount.
  React.useEffect(() => {
    if (requestedView && VIEWS.some((v) => v.key === requestedView)) setView(requestedView)
  }, [requestedView])
  // Goes back to whatever page actually linked here (Search results,
  // Discover, a tag filter, …) instead of always the Datasets list —
  // "/explore/datasets" is only the fallback when there's no history at all.
  const goBack = useGoBack('/search?type=dataset')
  const navigate = useNavigate()

  const record = id ? datasets.find((d) => d.id === id) : undefined
  // Consumers only ever see the live published version — same rule as every
  // other Explore detail page (e.g. UseCaseDetailPage).
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!record || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState
          title="Dataset not found"
          description="This dataset may have been unpublished or does not exist."
        />
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    )
  }

  const publisher = resolveDatasetPublisher(record, organisationWorkspaces)
  // Restricted datasets keep their description and file names public; files, data and charts stay locked until access is granted.
  const locked = !hasAccess(isSignedIn ? persona.id : null, record, state.requests)
  // Edit is for the owner only, wherever the dataset is opened from (a collaborative included): it opens the dataset in the workspace that owns it.
  const owner = ownerOfDataset(record)
  const canEdit = Boolean(isSignedIn && owner && canEditAsOwner(persona.id, owner))
  const editInWorkspace = () =>
    navigate(record.organisationId ? `/organisations/${record.organisationId}/datasets` : '/dashboard/datasets', { state: { datasetId: record.id, initialStep: 1 } })

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 py-2">
      {/* Back and the dataset's own actions sit above the Data DNA card; the tabs follow it. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <DatasetActions title={form.metadata.name} locked={locked} onEdit={canEdit ? editInWorkspace : undefined} />
      </div>

      <RestrictedAccessBar datasetId={record.id} />

      <DatasetDataDNA datasetId={record.id} />

      <ViewTabs items={VIEWS} value={view} onChange={setView} idPrefix="dataset-detail" label="Dataset views" />

      <ViewTabPanel id="data" idPrefix="dataset-detail" active={view === 'data'}>
        {locked ? <LockedDataPanel files={form.files} what="data" /> : <DatasetDataExplorer datasetId={record.id} files={form.files} />}
      </ViewTabPanel>

      <ViewTabPanel id="visualisations" idPrefix="dataset-detail" active={view === 'visualisations'}>
        {locked ? <LockedDataPanel files={form.files} what="visualisations" /> : <DatasetVisualisations datasetId={record.id} files={form.files} />}
      </ViewTabPanel>

      <ViewTabPanel id="overview" idPrefix="dataset-detail" active={view === 'overview'}>
        <DatasetOverview form={form} publisher={publisher} updatedAt={record.updatedAt} />
      </ViewTabPanel>

      <ViewTabPanel id="applications" idPrefix="dataset-detail" active={view === 'applications'}>
        <DatasetApplications datasetId={record.id} />
      </ViewTabPanel>
    </div>
  )
}

export { DatasetDetailPage }
