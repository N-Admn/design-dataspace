import { Archive, FolderKanban, Pencil, Trash2, Undo2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { hasUnpublishedEdits } from '@/lib/content-status'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import type { UseCaseRecord, UseCaseStatus } from '@/types/usecase'

interface UseCaseListViewProps {
  useCases: UseCaseRecord[]
  onAddUseCase: () => void
  onViewUseCase: (id: string) => void
  onEditUseCase: (id: string) => void
  onDeleteUseCase: (id: string) => void
  onDiscardUseCase: (id: string) => void
  onUnpublishUseCase: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

function optionLabels(options: { value: string; label: string }[], values: string[]): string {
  if (values.length === 0) return '—'
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')
}

function matchesSearch(useCase: UseCaseRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = useCase.form
  const haystack = [metadata.title, metadata.subtitle, metadata.tags.join(' ')].join(' ').toLowerCase()
  return haystack.includes(q)
}

const TAB_EMPTY_MESSAGE: Record<UseCaseStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(onOpen: (useCase: UseCaseRecord) => void): ManagementColumn<UseCaseRecord>[] {
  return [
  {
    key: 'title',
    label: 'Use Case',
    sortable: true,
    compare: (a, b) => (a.form.metadata.title || '').localeCompare(b.form.metadata.title || ''),
    render: (u) => (
      <button
        type="button"
        onClick={() => onOpen(u)}
        className="flex min-w-0 w-full items-center gap-2 text-left hover:text-primary"
      >
        <FolderKanban className="size-4 shrink-0 text-muted-foreground" />
        <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{u.form.metadata.title || 'Untitled Use Case'}</TruncatedText>
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
    compare: (a, b) => optionLabels(SECTOR_OPTIONS, a.form.metadata.sectors).localeCompare(optionLabels(SECTOR_OPTIONS, b.form.metadata.sectors)),
    render: (u) => <TruncatedText>{optionLabels(SECTOR_OPTIONS, u.form.metadata.sectors)}</TruncatedText>,
  },
  {
    key: 'status',
    label: 'Status',
    widthRem: '6.875rem',
    optional: true,
    render: (u) => <StatusBadge status={u.status} hasUnpublishedEdits={hasUnpublishedEdits(u)} />,
  },
  {
    key: 'updated',
    label: 'Last Updated',
    widthRem: '8.125rem',
    responsive: 'md',
    optional: true,
    sortable: true,
    compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
    render: (u) => formatShortDate(u.updatedAt),
  },
  {
    key: 'geography',
    label: 'Geography',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (u) => <TruncatedText>{optionLabels(GEOGRAPHY_OPTIONS, u.form.metadata.geographies)}</TruncatedText>,
  },
  {
    key: 'contributor',
    label: 'Contributor',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (u) => <TruncatedText>{u.form.connections.contributors[0]?.name ?? '—'}</TruncatedText>,
  },
  ]
}

const FILTERS: ManagementFilterDef<UseCaseRecord>[] = [
  { key: 'sector', label: 'Sector', placeholder: 'Any sector', options: SECTOR_OPTIONS, matches: (u, v) => u.form.metadata.sectors.includes(v) },
  { key: 'geography', label: 'Geography', placeholder: 'Any geography', options: GEOGRAPHY_OPTIONS, matches: (u, v) => u.form.metadata.geographies.includes(v) },
]

const STATUSES: { key: UseCaseStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function UseCaseListView({
  useCases,
  onAddUseCase,
  onViewUseCase,
  onEditUseCase,
  onDeleteUseCase,
  onDiscardUseCase,
  onUnpublishUseCase,
  loading,
  loadError,
  onRetry,
}: UseCaseListViewProps) {
  const openUseCase = (useCase: UseCaseRecord) => (useCase.status === 'draft' ? onEditUseCase(useCase.id) : onViewUseCase(useCase.id))
  const columns = buildColumns(openUseCase)

  const getActions = (useCase: UseCaseRecord): ManagementRowAction<UseCaseRecord>[] => {
    const title = useCase.form.metadata.title || 'Use Case'
    if (useCase.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${title}`, onClick: () => onEditUseCase(useCase.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${title}`, onClick: () => onDeleteUseCase(useCase.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${title}`, onClick: () => onEditUseCase(useCase.id) },
      ...(hasUnpublishedEdits(useCase)
        ? [{ key: 'discard', icon: Undo2, label: () => `Discard unsaved changes to ${title}`, onClick: () => onDiscardUseCase(useCase.id), destructive: true } as ManagementRowAction<UseCaseRecord>]
        : []),
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${title}`, onClick: () => onUnpublishUseCase(useCase.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<UseCaseRecord, UseCaseStatus>
      title="Use Cases"
      subtitle={() => 'Create, manage and publish Use Cases that demonstrate how civic data is being used.'}
      addLabel="Add Use Case"
      onAdd={onAddUseCase}
      items={useCases}
      getId={(u) => u.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(u) => u.status}
      searchPlaceholder="Search use cases..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No use cases yet"
      emptyDescription="Create your first Use Case to show how civic data is being used."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { UseCaseListView }
