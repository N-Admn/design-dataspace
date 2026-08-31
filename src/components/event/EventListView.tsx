import { Archive, Pencil, Trash2, Undo2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { Badge } from '@/components/ui/badge'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { hasUnpublishedEdits } from '@/lib/content-status'
import { formatEventDateRange, getRegistrationStatus } from '@/lib/event-status'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { ACCESS_TYPE_LABELS, EVENT_TYPE_OPTIONS, type EventRecord, type EventStatus } from '@/types/event'

interface EventListViewProps {
  events: EventRecord[]
  onAddEvent: () => void
  onViewEvent: (id: string) => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
  onDiscardEvent: (id: string) => void
  onUnpublishEvent: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

function eventTypeLabel(value: string): string {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

function matchesSearch(event: EventRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = event.form
  return [metadata.title, metadata.subtitle, metadata.theme].join(' ').toLowerCase().includes(q)
}

const TAB_EMPTY_MESSAGE: Record<EventStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(onOpen: (event: EventRecord) => void): ManagementColumn<EventRecord>[] {
  return [
  {
    key: 'title',
    label: 'Event',
    sortable: true,
    compare: (a, b) => (a.form.metadata.title || '').localeCompare(b.form.metadata.title || ''),
    render: (e) => (
      <button type="button" onClick={() => onOpen(e)} className="block w-full text-left hover:text-primary">
        <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{e.form.metadata.title || 'Untitled event'}</TruncatedText>
      </button>
    ),
  },
  {
    key: 'type',
    label: 'Event Type',
    widthRem: '8.75rem',
    responsive: 'lg',
    optional: true,
    render: (e) => (e.form.metadata.eventType ? <TruncatedText>{eventTypeLabel(e.form.metadata.eventType)}</TruncatedText> : '—'),
  },
  {
    key: 'date',
    label: 'Date',
    widthRem: '9.5rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => (a.form.metadata.startDate || '').localeCompare(b.form.metadata.startDate || ''),
    render: (e) => formatEventDateRange(e.form.metadata),
  },
  {
    key: 'status',
    label: 'Status',
    widthRem: '6.875rem',
    optional: true,
    render: (e) => <StatusBadge status={e.status} hasUnpublishedEdits={hasUnpublishedEdits(e)} />,
  },
  {
    key: 'registration',
    label: 'Registration',
    widthRem: '7.5rem',
    responsive: 'md',
    optional: true,
    render: (e) => {
      const registration = getRegistrationStatus(e.form.metadata)
      if (registration === 'open') return <Badge variant="success">Open</Badge>
      if (registration === 'closed') return <Badge variant="muted">Closed</Badge>
      return <Badge variant="muted">Not Required</Badge>
    },
  },
  {
    key: 'updated',
    label: 'Last Updated',
    widthRem: '8.125rem',
    responsive: 'md',
    optional: true,
    sortable: true,
    compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
    render: (e) => formatShortDate(e.updatedAt),
  },
  {
    key: 'access',
    label: 'Access',
    widthRem: '7.5rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (e) => (e.form.metadata.accessType ? <Badge variant="outline">{ACCESS_TYPE_LABELS[e.form.metadata.accessType]}</Badge> : '—'),
  },
  ]
}

const FILTERS: ManagementFilterDef<EventRecord>[] = [
  { key: 'type', label: 'Event Type', placeholder: 'Any event type', options: EVENT_TYPE_OPTIONS, matches: (e, v) => e.form.metadata.eventType === v },
  {
    key: 'registration',
    label: 'Registration',
    placeholder: 'Any registration state',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'not-required', label: 'Not Required' },
    ],
    matches: (e, v) => getRegistrationStatus(e.form.metadata) === v,
  },
]

const STATUSES: { key: EventStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function EventListView({
  events,
  onAddEvent,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
  onDiscardEvent,
  onUnpublishEvent,
  loading,
  loadError,
  onRetry,
}: EventListViewProps) {
  const openEvent = (event: EventRecord) => (event.status === 'draft' ? onEditEvent(event.id) : onViewEvent(event.id))
  const columns = buildColumns(openEvent)

  const getActions = (event: EventRecord): ManagementRowAction<EventRecord>[] => {
    const title = event.form.metadata.title || 'event'
    if (event.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${title}`, onClick: () => onEditEvent(event.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${title}`, onClick: () => onDeleteEvent(event.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${title}`, onClick: () => onEditEvent(event.id) },
      ...(hasUnpublishedEdits(event)
        ? [{ key: 'discard', icon: Undo2, label: () => `Discard unsaved changes to ${title}`, onClick: () => onDiscardEvent(event.id), destructive: true } as ManagementRowAction<EventRecord>]
        : []),
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${title}`, onClick: () => onUnpublishEvent(event.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<EventRecord, EventStatus>
      title="Events"
      subtitle={() => 'Create, manage, maintain, and publish events under your stewardship.'}
      addLabel="Add Event"
      onAdd={onAddEvent}
      items={events}
      getId={(e) => e.id}
      columns={columns}
      defaultSortKey="date"
      defaultSortDirection="asc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(e) => e.status}
      searchPlaceholder="Search events..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No events yet"
      emptyDescription="Create your first event to bring it to the CivicDataSpace community."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { EventListView }
