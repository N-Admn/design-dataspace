import { useNavigate } from 'react-router-dom'
import { CalendarDays, Database, FolderKanban, LineChart, Sparkles, Users } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { PageHeader } from '@/components/shared/PageHeader'
import { parseAppTimestamp } from '@/lib/format'
import { hasUnpublishedEdits, type ContentStatus } from '@/lib/content-status'

interface SummaryCard {
  key: string
  label: string
  count: number
  icon: typeof Database
  path: string
}

function orgScoped<T extends { organisationId?: string }>(records: T[], organisationId: string): T[] {
  return records.filter((r) => r.organisationId === organisationId)
}

function OrganisationDashboardPage() {
  const navigate = useNavigate()
  const { organisationId, organisation } = useOrganisation()
  const { datasets, useCases, aiModels, collaboratives, charts, events } = useAppData()

  if (!organisation) return <OrganisationNotFound />

  const orgDatasets = orgScoped(datasets, organisationId)
  const orgUseCases = orgScoped(useCases, organisationId)
  const orgAIModels = orgScoped(aiModels, organisationId)
  const orgCollaboratives = orgScoped(collaboratives, organisationId)
  const orgCharts = orgScoped(charts, organisationId)
  const orgEvents = orgScoped(events, organisationId)

  const summary: SummaryCard[] = [
    { key: 'datasets', label: 'Datasets', count: orgDatasets.length, icon: Database, path: `/organisations/${organisationId}/datasets` },
    { key: 'use-cases', label: 'Use Cases', count: orgUseCases.length, icon: FolderKanban, path: `/organisations/${organisationId}/use-cases` },
    { key: 'ai-models', label: 'AI Models', count: orgAIModels.length, icon: Sparkles, path: `/organisations/${organisationId}/ai-models` },
    { key: 'collaboratives', label: 'Collaboratives', count: orgCollaboratives.length, icon: Users, path: `/organisations/${organisationId}/collaboratives` },
    { key: 'charts', label: 'Charts', count: orgCharts.length, icon: LineChart, path: `/organisations/${organisationId}/charts` },
    { key: 'events', label: 'Events', count: orgEvents.length, icon: CalendarDays, path: `/organisations/${organisationId}/events` },
  ]

  type ActivityItem = {
    id: string
    description: string
    contributor?: string
    module: string
    updatedAt: string
    onOpen: () => void
  }

  const activity: ActivityItem[] = [
    ...orgDatasets.map((d) => ({
      id: `dataset-${d.id}`,
      description: `Dataset "${d.form.metadata.name || 'Untitled dataset'}" ${d.status === 'published' ? 'published' : 'updated'}`,
      contributor: d.createdBy,
      module: 'Dataset',
      updatedAt: d.updatedAt,
      onOpen: () => navigate(`/organisations/${organisationId}/datasets`),
    })),
    ...orgUseCases.map((u) => ({
      id: `usecase-${u.id}`,
      description: `Use case "${u.form.metadata.title || 'Untitled use case'}" ${u.status === 'published' ? 'published' : 'updated'}`,
      contributor: u.createdBy,
      module: 'Use Case',
      updatedAt: u.updatedAt,
      onOpen: () => navigate(`/organisations/${organisationId}/use-cases`),
    })),
    ...orgEvents.map((e) => ({
      id: `event-${e.id}`,
      description: `Event "${e.form.metadata.title || 'Untitled event'}" ${e.status === 'published' ? 'published' : 'updated'}`,
      contributor: e.createdBy,
      module: 'Event',
      updatedAt: e.updatedAt,
      onOpen: () => navigate(`/organisations/${organisationId}/events`),
    })),
    ...orgAIModels.map((m) => ({
      id: `ai-model-${m.id}`,
      description: `AI Model "${m.form.metadata.name || 'Untitled model'}" ${m.status === 'published' ? 'published' : 'updated'}`,
      contributor: m.createdBy,
      module: 'AI Model',
      updatedAt: m.updatedAt,
      onOpen: () => navigate(`/organisations/${organisationId}/ai-models`),
    })),
  ]
    .sort((a, b) => parseAppTimestamp(b.updatedAt).getTime() - parseAppTimestamp(a.updatedAt).getTime())
    .slice(0, 6)

  function needsAttention(record: { status: ContentStatus; form: unknown; publishedForm: unknown }): boolean {
    return record.status === 'draft' || hasUnpublishedEdits(record)
  }

  const continueWorking = [
    ...orgDatasets.filter(needsAttention).map((d) => ({
      id: `dataset-${d.id}`,
      title: d.form.metadata.name || 'Untitled dataset',
      module: 'Dataset',
      updatedAt: d.updatedAt,
      onContinue: () => navigate('/dashboard/datasets', { state: { datasetId: d.id } }),
    })),
    ...orgEvents.filter(needsAttention).map((e) => ({
      id: `event-${e.id}`,
      title: e.form.metadata.title || 'Untitled event',
      module: 'Event',
      updatedAt: e.updatedAt,
      onContinue: () => navigate('/dashboard/events/new', { state: { eventId: e.id, initialStep: 1 } }),
    })),
  ]
    .sort((a, b) => parseAppTimestamp(b.updatedAt).getTime() - parseAppTimestamp(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={organisation.metadata.name}
        description="Manage datasets, events, use cases and other contributions on behalf of this organisation."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {summary.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => navigate(card.path)}
              className="flex flex-col items-start gap-2 rounded-xl border border-border-default bg-surface-default p-4 text-left transition-shadow hover:shadow-md"
            >
              <Icon className="size-5 text-text-brand" />
              <p className="type-heading-2 text-text-brand">{card.count}</p>
              <p className="text-xs text-text-subdued">{card.label}</p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface-default p-6">
          <p className="type-heading-3 text-text-brand">Recent Organisation Activity</p>
          {activity.length === 0 ? (
            <p className="text-sm text-text-subdued">No organisation activity yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {activity.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onOpen}
                  className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hovered"
                >
                  <p className="text-sm font-medium text-text-default">{item.description}</p>
                  <p className="text-xs text-text-subdued">
                    {item.contributor ?? 'Unknown member'} · {item.module} · {item.updatedAt}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface-default p-6">
          <p className="type-heading-3 text-text-brand">Continue Working</p>
          {continueWorking.length === 0 ? (
            <p className="text-sm text-text-subdued">Nothing to work on today.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {continueWorking.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onContinue}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-subdued px-4 py-3 text-left transition-colors hover:bg-surface-hovered"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-default">{item.title}</p>
                    <p className="text-xs text-text-subdued">{item.module}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-text-brand">Continue →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { OrganisationDashboardPage }
