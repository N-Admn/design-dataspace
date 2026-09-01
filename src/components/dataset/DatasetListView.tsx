import { Archive, FileText, Pencil, Trash2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS, type DatasetRecord, type DatasetStatus } from '@/types/dataset'

interface DatasetListViewProps {
  datasets: DatasetRecord[]
  onAddDataset: () => void
  onViewDataset: (id: string) => void
  onEditDataset: (id: string) => void
  onDeleteDataset: (id: string) => void
  onUnpublishDataset: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function fileCount(dataset: DatasetRecord): number {
  return dataset.form.files.length + (dataset.form.resources?.length ?? 0)
}

function matchesSearch(dataset: DatasetRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = dataset.form
  const haystack = [
    metadata.name,
    metadata.tags.join(' '),
    metadata.sector ? optionLabel(SECTOR_OPTIONS, metadata.sector) : '',
    metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, metadata.geography) : '',
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

const TAB_EMPTY_MESSAGE: Record<DatasetStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(onOpen: (dataset: DatasetRecord) => void): ManagementColumn<DatasetRecord>[] {
  return [
  {
    key: 'name',
    label: 'Dataset',
    sortable: true,
    compare: (a, b) => (a.form.metadata.name || '').localeCompare(b.form.metadata.name || ''),
    render: (d) => (
      <button
        type="button"
        onClick={() => onOpen(d)}
        className="flex min-w-0 w-full items-center gap-2 text-left hover:text-primary"
      >
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{d.form.metadata.name || 'Untitled dataset'}</TruncatedText>
      </button>
    ),
  },
  {
    key: 'sector',
    label: 'Sector',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => optionLabel(SECTOR_OPTIONS, a.form.metadata.sector).localeCompare(optionLabel(SECTOR_OPTIONS, b.form.metadata.sector)),
    render: (d) => (d.form.metadata.sector ? <TruncatedText>{optionLabel(SECTOR_OPTIONS, d.form.metadata.sector)}</TruncatedText> : '—'),
  },
  {
    key: 'geography',
    label: 'Geography',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    render: (d) => (d.form.metadata.geography ? <TruncatedText>{optionLabel(GEOGRAPHY_OPTIONS, d.form.metadata.geography)}</TruncatedText> : '—'),
  },
  {
    key: 'files',
    label: 'Files',
    widthRem: '5.625rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => fileCount(a) - fileCount(b),
    render: (d) => `${fileCount(d)} file${fileCount(d) === 1 ? '' : 's'}`,
  },
  {
    key: 'status',
    label: 'Status',
    widthRem: '6.875rem',
    optional: true,
    render: (d) => <StatusBadge status={d.status} />,
  },
  {
    key: 'updated',
    label: 'Last Updated',
    widthRem: '8.125rem',
    responsive: 'md',
    optional: true,
    sortable: true,
    compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
    render: (d) => formatShortDate(d.updatedAt),
  },
  ]
}

const FILTERS: ManagementFilterDef<DatasetRecord>[] = [
  { key: 'sector', label: 'Sector', placeholder: 'Any sector', options: SECTOR_OPTIONS, matches: (d, v) => d.form.metadata.sector === v },
  { key: 'geography', label: 'Geography', placeholder: 'Any geography', options: GEOGRAPHY_OPTIONS, matches: (d, v) => d.form.metadata.geography === v },
]

const STATUSES: { key: DatasetStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function DatasetListView({
  datasets,
  onAddDataset,
  onViewDataset,
  onEditDataset,
  onDeleteDataset,
  onUnpublishDataset,
  loading,
  loadError,
  onRetry,
}: DatasetListViewProps) {
  const openDataset = (dataset: DatasetRecord) => (dataset.status === 'draft' ? onEditDataset(dataset.id) : onViewDataset(dataset.id))
  const columns = buildColumns(openDataset)

  const getActions = (dataset: DatasetRecord): ManagementRowAction<DatasetRecord>[] => {
    const name = dataset.form.metadata.name || 'dataset'
    if (dataset.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${name}`, onClick: () => onEditDataset(dataset.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${name}`, onClick: () => onDeleteDataset(dataset.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditDataset(dataset.id) },
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${name}`, onClick: () => onUnpublishDataset(dataset.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<DatasetRecord, DatasetStatus>
      title="My Datasets"
      subtitle={(count) => `${count} dataset${count === 1 ? '' : 's'} · manage published datasets and continue drafts`}
      addLabel="Add Dataset"
      onAdd={onAddDataset}
      items={datasets}
      getId={(d) => d.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(d) => d.status}
      searchPlaceholder="Search datasets..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No datasets yet"
      emptyDescription="Create your first dataset to make civic data available."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { DatasetListView }
