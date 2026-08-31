import { Archive, Pencil, Sparkles, Trash2, Undo2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementFilterDef, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { hasUnpublishedEdits } from '@/lib/content-status'
import { Badge } from '@/components/ui/badge'
import { DOMAIN_OPTIONS, MODEL_TYPE_OPTIONS, type AIModelRecord, type AIModelStatus } from '@/types/ai-model'
import { getModelAccessReadiness } from '@/lib/ai-model-validation'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'

interface AIModelListViewProps {
  aiModels: AIModelRecord[]
  onAddAIModel: () => void
  onViewAIModel: (id: string) => void
  onEditAIModel: (id: string) => void
  onDeleteAIModel: (id: string) => void
  onDiscardAIModel: (id: string) => void
  onUnpublishAIModel: (id: string) => void
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function matchesSearch(aiModel: AIModelRecord, query: string): boolean {
  const q = query.trim().toLowerCase()
  const { metadata } = aiModel.form
  const haystack = [metadata.name, metadata.description, metadata.tags.join(' ')].join(' ').toLowerCase()
  return haystack.includes(q)
}

const TAB_EMPTY_MESSAGE: Record<AIModelStatus, string> = {
  published: 'No published content yet.',
  draft: 'No drafts yet.',
}

function buildColumns(onOpen: (aiModel: AIModelRecord) => void): ManagementColumn<AIModelRecord>[] {
  return [
  {
    key: 'name',
    label: 'AI Model',
    sortable: true,
    compare: (a, b) => (a.form.metadata.name || '').localeCompare(b.form.metadata.name || ''),
    render: (m) => (
      <button
        type="button"
        onClick={() => onOpen(m)}
        className="flex min-w-0 w-full items-center gap-2 text-left hover:text-primary"
      >
        <Sparkles className="size-4 shrink-0 text-muted-foreground" />
        <TruncatedText className="min-w-0 flex-1 font-medium text-foreground">{m.form.metadata.name || 'Untitled AI Model'}</TruncatedText>
      </button>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    widthRem: '8.75rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => optionLabel(MODEL_TYPE_OPTIONS, a.form.metadata.modelType).localeCompare(optionLabel(MODEL_TYPE_OPTIONS, b.form.metadata.modelType)),
    render: (m) => (m.form.metadata.modelType ? <TruncatedText>{optionLabel(MODEL_TYPE_OPTIONS, m.form.metadata.modelType)}</TruncatedText> : '—'),
  },
  {
    key: 'versions',
    label: 'Versions',
    widthRem: '6.25rem',
    responsive: 'lg',
    optional: true,
    sortable: true,
    compare: (a, b) => a.form.versions.length - b.form.versions.length,
    render: (m) => (m.form.versions.length > 0 ? `${m.form.versions.length} version${m.form.versions.length > 1 ? 's' : ''}` : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    widthRem: '6.875rem',
    optional: true,
    render: (m) => <StatusBadge status={m.status} hasUnpublishedEdits={hasUnpublishedEdits(m)} />,
  },
  {
    key: 'access',
    label: 'Access',
    widthRem: '7.5rem',
    optional: true,
    render: (m) => {
      const readiness = getModelAccessReadiness(m.form)
      if (readiness === 'ready') return <Badge variant="success">Ready</Badge>
      if (readiness === 'incomplete') return <Badge variant="warning">Incomplete</Badge>
      return <Badge variant="muted">Not configured</Badge>
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
    render: (m) => formatShortDate(m.updatedAt),
  },
  {
    key: 'domain',
    label: 'Domain',
    widthRem: '8.75rem',
    responsive: 'lg',
    optional: true,
    defaultVisible: false,
    render: (m) => (m.form.metadata.domain ? <TruncatedText>{optionLabel(DOMAIN_OPTIONS, m.form.metadata.domain)}</TruncatedText> : '—'),
  },
  ]
}

const FILTERS: ManagementFilterDef<AIModelRecord>[] = [
  { key: 'type', label: 'Type', placeholder: 'Any type', options: MODEL_TYPE_OPTIONS, matches: (m, v) => m.form.metadata.modelType === v },
  { key: 'domain', label: 'Domain', placeholder: 'Any domain', options: DOMAIN_OPTIONS, matches: (m, v) => m.form.metadata.domain === v },
]

const STATUSES: { key: AIModelStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function AIModelListView({
  aiModels,
  onAddAIModel,
  onViewAIModel,
  onEditAIModel,
  onDeleteAIModel,
  onDiscardAIModel,
  onUnpublishAIModel,
  loading,
  loadError,
  onRetry,
}: AIModelListViewProps) {
  const openAIModel = (aiModel: AIModelRecord) => (aiModel.status === 'draft' ? onEditAIModel(aiModel.id) : onViewAIModel(aiModel.id))
  const columns = buildColumns(openAIModel)

  const getActions = (aiModel: AIModelRecord): ManagementRowAction<AIModelRecord>[] => {
    const name = aiModel.form.metadata.name || 'AI Model'
    if (aiModel.status === 'draft') {
      return [
        { key: 'edit', icon: Pencil, label: () => `Continue editing ${name}`, onClick: () => onEditAIModel(aiModel.id) },
        { key: 'delete', icon: Trash2, label: () => `Delete ${name}`, onClick: () => onDeleteAIModel(aiModel.id), destructive: true },
      ]
    }
    return [
      { key: 'edit', icon: Pencil, label: () => `Edit ${name}`, onClick: () => onEditAIModel(aiModel.id) },
      ...(hasUnpublishedEdits(aiModel)
        ? [{ key: 'discard', icon: Undo2, label: () => `Discard unsaved changes to ${name}`, onClick: () => onDiscardAIModel(aiModel.id), destructive: true } as ManagementRowAction<AIModelRecord>]
        : []),
      { key: 'unpublish', icon: Archive, label: () => `Unpublish ${name}`, onClick: () => onUnpublishAIModel(aiModel.id), destructive: true },
    ]
  }

  return (
    <ManagementTable<AIModelRecord, AIModelStatus>
      title="AI Models"
      subtitle={() => 'Create, manage and publish AI Models so people can discover and access them.'}
      addLabel="Add New AI Model"
      onAdd={onAddAIModel}
      items={aiModels}
      getId={(m) => m.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      filters={FILTERS}
      statuses={STATUSES}
      getStatus={(m) => m.status}
      searchPlaceholder="Search AI models..."
      searchMatch={matchesSearch}
      getActions={getActions}
      emptyTitle="No AI Models yet"
      emptyDescription="Create your first AI Model to make it discoverable on CivicDataSpace."
      tabEmptyMessage={(status) => TAB_EMPTY_MESSAGE[status]}
      loading={loading}
      loadError={loadError}
      onRetry={onRetry}
    />
  )
}

export { AIModelListView }
