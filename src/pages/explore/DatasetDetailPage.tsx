import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { DatasetDetailHeader } from '@/components/dataset/consumer/DatasetDetailHeader'
import { DatasetOverview } from '@/components/dataset/consumer/DatasetOverview'
import { DatasetDataExplorer } from '@/components/dataset/consumer/DatasetDataExplorer'
import { DatasetVisualisations } from '@/components/dataset/consumer/DatasetVisualisations'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'
import { resolveDatasetPublisher } from '@/lib/dataset-publisher'

const VIEWS = [
  { key: 'overview', label: 'Overview' },
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
]

/** Consumer-facing Dataset Details page — Dataset Header, then the three primary
 *  views (Overview / Data / Visualisations). See the Dataset Module PRD for the
 *  full specification this implements. */
function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { datasets, organisationWorkspaces } = useAppData()
  const [view, setView] = React.useState('overview')
  // Goes back to whatever page actually linked here (Search results,
  // Discover, a tag filter, …) instead of always the Datasets list —
  // "/explore/datasets" is only the fallback when there's no history at all.
  const goBack = useGoBack('/explore/datasets')

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
        <Link
          to="/discover"
          className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Discover
        </Link>
      </div>
    )
  }

  const publisher = resolveDatasetPublisher(record, organisationWorkspaces)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 py-2">
      <button
        type="button"
        onClick={goBack}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <DatasetDetailHeader metadata={form.metadata} publisher={publisher} updatedAt={record.updatedAt} />

      <ViewTabs items={VIEWS} value={view} onChange={setView} idPrefix="dataset-detail" label="Dataset views" />

      <ViewTabPanel id="overview" idPrefix="dataset-detail" active={view === 'overview'}>
        <DatasetOverview form={form} publisher={publisher} updatedAt={record.updatedAt} />
      </ViewTabPanel>

      <ViewTabPanel id="data" idPrefix="dataset-detail" active={view === 'data'}>
        <DatasetDataExplorer datasetId={record.id} files={form.files} />
      </ViewTabPanel>

      <ViewTabPanel id="visualisations" idPrefix="dataset-detail" active={view === 'visualisations'}>
        <DatasetVisualisations datasetId={record.id} files={form.files} />
      </ViewTabPanel>
    </div>
  )
}

export { DatasetDetailPage }
