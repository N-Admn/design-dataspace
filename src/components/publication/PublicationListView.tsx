import { Archive, FileStack, Pencil, Trash2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationRecord, type PublicationStatus } from '@/types/publication'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'

interface PublicationListViewProps {
  publications: PublicationRecord[]
  onAddPublication: () => void
  onViewPublication: (id: string) => void
  onEditPublication: (id: string) => void
  onDeletePublication: (id: string) => void
  onUnpublishPublication: (id: string) => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function matchesSearch(record: PublicationRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = record.form
  const haystack = [metadata.name, metadata.description, metadata.contributors.map((c) => c.name).join(' ')]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

const TAB_EMPTY_MESSAGE: Record<PublicationStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(onOpen: (record: PublicationRecord) => void): ManagementColumn<PublicationRecord>[] {
  return [
    {
      key: 'name',
      label: 'Publication',
      sortable: true,
      compare: (a, b) => (a.form.metadata.name || '').localeCompare(b.form.metadata.name || ''),
      render: (r) => (
        <button
          type="button"
          onClick={() => onOpen(r)}
          className="flex w-full min-w-0 items-center gap-2 text-left hover:text-primary"
        >
          <FileStack className="size-4 shrink-0 text-muted-foreground" />
          <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">
            {r.form.metadata.name || 'Untitled Publication'}
          </TruncatedText>
        </button>
      ),
    },
    {
      key: 'type',
      label: 'Resource Type',
      widthRem: '9.5rem',
      responsive: 'lg',
      optional: true,
      sortable: true,
      compare: (a, b) => optionLabel(RESOURCE_TYPE_OPTIONS, a.form.metadata.resourceType).localeCompare(optionLabel(RESOURCE_TYPE_OPTIONS, b.form.metadata.resourceType)),
      render: (r) => (r.form.metadata.resourceType ? <TruncatedText>{optionLabel(RESOURCE_TYPE_OPTIONS, r.form.metadata.resourceType)}</TruncatedText> : '—'),
    },
    {
      key: 'content',
      label: 'Content',
      widthRem: '6.875rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => a.form.blocks.length - b.form.blocks.length,
      render: (r) => (r.form.blocks.length > 0 ? `${r.form.blocks.length} item${r.form.blocks.length > 1 ? 's' : ''}` : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      widthRem: '6.875rem',
      optional: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'updated',
      label: 'Last Updated',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
      render: (r) => formatShortDate(r.updatedAt),
    },
    {
      key: 'geography',
      label: 'Geography',
      widthRem: '8.75rem',
      responsive: 'lg',
      optional: true,
      defaultVisible: false,
      render: (r) => (r.form.metadata.geography ? <TruncatedText>{optionLabel(GEOGRAPHY_OPTIONS, r.form.metadata.geography)}</TruncatedText> : '—'),
    },
  ]
}

const FILTERS: ManagementFilterDef<PublicationRecord>[] = [
  { key: 'type', label: 'Resource Type', placeholder: 'Any type', options: RESOURCE_TYPE_OPTIONS, matches: (r, v) => r.form.metadata.resourceType === v },
  { key: 'sector', label: 'Sector', placeholder: 'Any sector', options: SECTOR_OPTIONS, matches: (r, v) => r.form.metadata.sector === v },
  { key: 'geography', label: 'Geography', placeholder: 'Any geography', options: GEOGRAPHY_OPTIONS, matches: (r, v) => r.form.metadata.geography === v },
]

const STATUSES: { key: PublicationStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function PublicationListView({
  publications,
  onAddPublication,
  onViewPublication,
  onEditPublication,
  onDeletePublication,
  onUnpublishPublication,
}: PublicationListViewProps) {
  const openRecord = (record: PublicationRecord) => (record.status === 'draft' ? onEditPublication(record.id) : onViewPublication(record.id))
  const columns = buildColumns(openRecord)

  const getActions = (record: PublicationRecord): ManagementRowAction<PublicationRecord>[] => {
    const name = record.form.metadata.name || 'Publication'
    if (record.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${name}`, onClick: () => onEditPublication(record.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${name}`, onClick: () => onDeletePublication(record.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditPublication(record.id) },
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${name}`, onClick: () => onUnpublishPublication(record.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<PublicationRecord, PublicationStatus>
      title="Publications"
      subtitle={() => 'Create, manage and publish reports, findings and other content so people can discover them.'}
      addLabel="Create Publication"
      onAdd={onAddPublication}
      items={publications}
      getId={(r) => r.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(r) => r.status}
      searchPlaceholder="Search publications..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No publications yet"
      emptyDescription="Create your first publication to make it discoverable on CivicDataSpace."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
    />
  )
}

export { PublicationListView }
