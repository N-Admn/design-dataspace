import { Archive, Pencil, Trash2, Undo2, Users2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import type { CollaborativeRecord, CollaborativeStatus } from '@/types/collaborative'

interface CollaborativeListViewProps {
  collaboratives: CollaborativeRecord[]
  onAddCollaborative: () => void
  onViewCollaborative: (id: string) => void
  onEditCollaborative: (id: string) => void
  onDeleteCollaborative: (id: string) => void
  onDiscardCollaborative: (id: string) => void
  onUnpublishCollaborative: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

function optionLabels(options: { value: string; label: string }[], values: string[]): string {
  if (values.length === 0) return '—'
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')
}

function matchesSearch(collaborative: CollaborativeRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = collaborative.form
  const haystack = [metadata.name, metadata.tags.join(' ')].join(' ').toLowerCase()
  return haystack.includes(q)
}

const TAB_EMPTY_MESSAGE: Record<CollaborativeStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
  pending: 'No pending content.',
}

function buildColumns(onOpen: (collaborative: CollaborativeRecord) => void): ManagementColumn<CollaborativeRecord>[] {
  return [
  {
    key: 'name',
    label: 'Collaborative',
    sortable: true,
    compare: (a, b) => (a.form.metadata.name || '').localeCompare(b.form.metadata.name || ''),
    render: (c) => (
      <button
        type="button"
        onClick={() => onOpen(c)}
        className="flex min-w-0 w-full items-center gap-2 text-left hover:text-primary"
      >
        <Users2 className="size-4 shrink-0 text-muted-foreground" />
        <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{c.form.metadata.name || 'Untitled Collaborative'}</TruncatedText>
      </button>
    ),
  },
  {
    key: 'participants',
    label: 'Participants',
    widthRem: '7.5rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => a.form.connections.people.length - b.form.connections.people.length,
    render: (c) => (c.form.connections.people.length > 0 ? `${c.form.connections.people.length} added` : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    widthRem: '6.875rem',
    optional: true,
    render: (c) => <StatusBadge status={c.status} />,
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
  {
    key: 'sector',
    label: 'Sector',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (c) => <TruncatedText>{optionLabels(SECTOR_OPTIONS, c.form.metadata.sectors)}</TruncatedText>,
  },
  {
    key: 'geography',
    label: 'Geography',
    widthRem: '8.125rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (c) => <TruncatedText>{optionLabels(GEOGRAPHY_OPTIONS, c.form.metadata.geographies)}</TruncatedText>,
  },
  ]
}

const FILTERS: ManagementFilterDef<CollaborativeRecord>[] = [
  { key: 'sector', label: 'Sector', placeholder: 'Any sector', options: SECTOR_OPTIONS, matches: (c, v) => c.form.metadata.sectors.includes(v) },
  { key: 'geography', label: 'Geography', placeholder: 'Any geography', options: GEOGRAPHY_OPTIONS, matches: (c, v) => c.form.metadata.geographies.includes(v) },
]

const STATUSES: { key: CollaborativeStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'pending', label: 'Pending' },
  { key: 'published', label: 'Published' },
]

function CollaborativeListView({
  collaboratives,
  onAddCollaborative,
  onViewCollaborative,
  onEditCollaborative,
  onDeleteCollaborative,
  onDiscardCollaborative,
  onUnpublishCollaborative,
  loading,
  loadError,
  onRetry,
}: CollaborativeListViewProps) {
  const openCollaborative = (collaborative: CollaborativeRecord) =>
    collaborative.status === 'draft' ? onEditCollaborative(collaborative.id) : onViewCollaborative(collaborative.id)
  const columns = buildColumns(openCollaborative)

  const getActions = (collaborative: CollaborativeRecord): ManagementRowAction<CollaborativeRecord>[] => {
    const name = collaborative.form.metadata.name || 'Collaborative'
    if (collaborative.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${name}`, onClick: () => onEditCollaborative(collaborative.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${name}`, onClick: () => onDeleteCollaborative(collaborative.id), destructive: true },
      ]
    }
    if (collaborative.status === 'pending') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditCollaborative(collaborative.id) },
        { key: 'discard', icon: Undo2, label: () => `Discard changes to ${name}`, onClick: () => onDiscardCollaborative(collaborative.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditCollaborative(collaborative.id) },
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${name}`, onClick: () => onUnpublishCollaborative(collaborative.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<CollaborativeRecord, CollaborativeStatus>
      title="Collaboratives"
      subtitle={() => 'Create, manage and publish Collaboratives that bring people, data and Use Cases together.'}
      addLabel="Add Collaborative"
      onAdd={onAddCollaborative}
      items={collaboratives}
      getId={(c) => c.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(c) => c.status}
      searchPlaceholder="Search collaboratives..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No collaboratives yet"
      emptyDescription="Create your first Collaborative to bring people, data and Use Cases together."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { CollaborativeListView }
