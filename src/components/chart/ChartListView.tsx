import { Archive, BarChart3, Gauge, ImagePlus, LineChart, MapPin, Pencil, PieChart, Trash2, Undo2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { hasUnpublishedEdits } from '@/lib/content-status'
import { useAppData } from '@/context/AppDataContext'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { CHART_TYPE_OPTIONS, type ChartRecord, type ChartStatus, type ChartType } from '@/types/chart'
import type { DatasetRecord } from '@/types/dataset'

interface ChartListViewProps {
  charts: ChartRecord[]
  onAddChart: () => void
  onViewChart: (id: string) => void
  onEditChart: (id: string) => void
  onDeleteChart: (id: string) => void
  onDiscardChart: (id: string) => void
  onUnpublishChart: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  map: MapPin,
  'big-number': Gauge,
  'upload-image': ImagePlus,
}

function typeLabel(chartType: ChartType | null): string {
  return chartType ? (CHART_TYPE_OPTIONS.find((o) => o.value === chartType)?.label ?? '—') : '—'
}

function datasetName(datasets: DatasetRecord[], datasetId: string | null): string {
  if (!datasetId) return '—'
  return datasets.find((d) => d.id === datasetId)?.form.metadata.name || '—'
}

function matchesSearch(chart: ChartRecord, query: string): boolean {
  return chart.form.name.toLowerCase().includes(query.trim().toLowerCase())
}

const TAB_EMPTY_MESSAGE: Record<ChartStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(datasets: DatasetRecord[], onOpen: (chart: ChartRecord) => void): ManagementColumn<ChartRecord>[] {
  return [
    {
      key: 'name',
      label: 'Chart',
      sortable: true,
      compare: (a, b) => (a.form.name || '').localeCompare(b.form.name || ''),
      render: (c) => {
        const Icon = c.form.chartType ? CHART_TYPE_ICONS[c.form.chartType] : BarChart3
        return (
          <button type="button" onClick={() => onOpen(c)} className="flex min-w-0 w-full items-center gap-2 text-left hover:text-primary">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{c.form.name || 'Untitled chart'}</TruncatedText>
          </button>
        )
      },
    },
    {
      key: 'dataset',
      label: 'Dataset',
      widthRem: '10rem',
      responsive: 'lg',
      optional: true,
      sortable: true,
      compare: (a, b) => datasetName(datasets, a.form.datasetId).localeCompare(datasetName(datasets, b.form.datasetId)),
      render: (c) => <TruncatedText>{datasetName(datasets, c.form.datasetId)}</TruncatedText>,
    },
    {
      key: 'type',
      label: 'Type',
      widthRem: '7.5rem',
      responsive: 'lg',
      optional: true,
      sortable: true,
      compare: (a, b) => typeLabel(a.form.chartType).localeCompare(typeLabel(b.form.chartType)),
      render: (c) => typeLabel(c.form.chartType),
    },
    {
      key: 'status',
      label: 'Status',
      widthRem: '6.875rem',
      optional: true,
      render: (c) => <StatusBadge status={c.status} hasUnpublishedEdits={hasUnpublishedEdits(c)} />,
    },
    {
      key: 'updated',
      label: 'Last Updated',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
      render: (c) => formatShortDate(c.updatedAt),
    },
  ]
}

const STATUSES: { key: ChartStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function ChartListView({
  charts,
  onAddChart,
  onViewChart,
  onEditChart,
  onDeleteChart,
  onDiscardChart,
  onUnpublishChart,
  loading,
  loadError,
  onRetry,
}: ChartListViewProps) {
  const { datasets } = useAppData()

  const openChart = (chart: ChartRecord) => (chart.status === 'draft' ? onEditChart(chart.id) : onViewChart(chart.id))
  const columns = buildColumns(datasets, openChart)
  const filters: ManagementFilterDef<ChartRecord>[] = [
    {
      key: 'dataset',
      label: 'Dataset',
      placeholder: 'Any dataset',
      options: datasets.filter((d) => d.status === 'published').map((d) => ({ value: d.id, label: d.form.metadata.name || 'Untitled dataset' })),
      matches: (c, v) => c.form.datasetId === v,
    },
    { key: 'type', label: 'Type', placeholder: 'Any type', options: CHART_TYPE_OPTIONS, matches: (c, v) => c.form.chartType === v },
  ]

  const getActions = (chart: ChartRecord): ManagementRowAction<ChartRecord>[] => {
    const name = chart.form.name || 'chart'
    if (chart.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${name}`, onClick: () => onEditChart(chart.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${name}`, onClick: () => onDeleteChart(chart.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditChart(chart.id) },
      ...(hasUnpublishedEdits(chart)
        ? [{ key: 'discard', icon: Undo2, label: () => `Discard unsaved changes to ${name}`, onClick: () => onDiscardChart(chart.id), destructive: true } as ManagementRowAction<ChartRecord>]
        : []),
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${name}`, onClick: () => onUnpublishChart(chart.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<ChartRecord, ChartStatus>
      title="Charts"
      subtitle={() => 'Create and manage visualizations for your datasets.'}
      addLabel="Add Chart"
      onAdd={onAddChart}
      items={charts}
      getId={(c) => c.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={filters}
      statuses={STATUSES}
      getStatus={(c) => c.status}
      searchPlaceholder="Search charts..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No charts yet"
      emptyDescription="Create a chart to help people understand your datasets visually."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { ChartListView }
