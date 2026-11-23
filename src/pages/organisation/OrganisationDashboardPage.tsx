import { useNavigate } from 'react-router-dom'
import { CalendarDays, Database, FileStack, FolderKanban, LineChart, Sparkles, Users } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { parseAppTimestamp } from '@/lib/format'
import { hasUnpublishedEdits, type ContentStatus } from '@/lib/content-status'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { cn } from '@/lib/utils'

interface SummaryCard {
  key: string
  label: string
  count: number
  icon: typeof Database
  path: string
}

/** Same icon per content type as the summary cards above, keyed by the
 *  singular module label used in "Recent Organisation Activity" and
 *  "Continue Working" rows — one lookup, no per-row duplication. */
const MODULE_ICON: Record<string, typeof Database> = {
  Dataset: Database,
  'Use Case': FolderKanban,
  Collaborative: Users,
  'AI Model': Sparkles,
  Publication: FileStack,
  Chart: LineChart,
  Event: CalendarDays,
}

function orgScoped<T extends { organisationId?: string }>(records: T[], organisationId: string): T[] {
  return records.filter((r) => r.organisationId === organisationId)
}

function OrganisationDashboardPage() {
  const navigate = useNavigate()
  const { organisationId, organisation } = useOrganisation()
  const { datasets, publications, useCases, aiModels, collaboratives, charts, events } = useAppData()

  if (!organisation) return <OrganisationNotFound />

  const orgDatasets = orgScoped(datasets, organisationId)
  const orgPublications = orgScoped(publications, organisationId)
  const orgUseCases = orgScoped(useCases, organisationId)
  const orgAIModels = orgScoped(aiModels, organisationId)
  const orgCollaboratives = orgScoped(collaboratives, organisationId)
  const orgCharts = orgScoped(charts, organisationId)
  const orgEvents = orgScoped(events, organisationId)

  const summary: SummaryCard[] = [
    { key: 'datasets', label: 'Datasets', count: orgDatasets.length, icon: Database, path: `/organisations/${organisationId}/datasets` },
    { key: 'use-cases', label: 'Use Cases', count: orgUseCases.length, icon: FolderKanban, path: `/organisations/${organisationId}/use-cases` },
    { key: 'collaboratives', label: 'Collaboratives', count: orgCollaboratives.length, icon: Users, path: `/organisations/${organisationId}/collaboratives` },
    { key: 'ai-models', label: 'AI Models', count: orgAIModels.length, icon: Sparkles, path: `/organisations/${organisationId}/ai-models` },
    { key: 'publications', label: 'Publications', count: orgPublications.length, icon: FileStack, path: `/organisations/${organisationId}/publications` },
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
    ...orgPublications.map((p) => ({
      id: `publication-${p.id}`,
      description: `Publication "${p.form.metadata.name || 'Untitled Publication'}" ${p.status === 'published' ? 'published' : 'updated'}`,
      contributor: p.createdBy,
      module: 'Publication',
      updatedAt: p.updatedAt,
      onOpen: () => navigate(`/organisations/${organisationId}/publications`),
    })),
  ]
    .sort((a, b) => parseAppTimestamp(b.updatedAt).getTime() - parseAppTimestamp(a.updatedAt).getTime())
    .slice(0, 5)

  function needsAttention(record: { status: ContentStatus; form: unknown; publishedForm: unknown }): boolean {
    return record.status === 'draft' || hasUnpublishedEdits(record)
  }

  const continueWorking = [
    ...orgDatasets.filter(needsAttention).map((d) => ({
      id: `dataset-${d.id}`,
      title: d.form.metadata.name || 'Untitled dataset',
      module: 'Dataset',
      updatedAt: d.updatedAt,
      onContinue: () => navigate(`/organisations/${organisationId}/datasets`, { state: { datasetId: d.id } }),
    })),
    ...orgUseCases.filter(needsAttention).map((u) => ({
      id: `usecase-${u.id}`,
      title: u.form.metadata.title || 'Untitled use case',
      module: 'Use Case',
      updatedAt: u.updatedAt,
      onContinue: () => navigate('/dashboard/use-cases/new', { state: { useCaseId: u.id, initialStep: 1, organisationId } }),
    })),
    ...orgEvents.filter(needsAttention).map((e) => ({
      id: `event-${e.id}`,
      title: e.form.metadata.title || 'Untitled event',
      module: 'Event',
      updatedAt: e.updatedAt,
      onContinue: () => navigate('/dashboard/events/new', { state: { eventId: e.id, initialStep: 1, organisationId } }),
    })),
    ...orgAIModels.filter(needsAttention).map((m) => ({
      id: `ai-model-${m.id}`,
      title: m.form.metadata.name || 'Untitled model',
      module: 'AI Model',
      updatedAt: m.updatedAt,
      onContinue: () => navigate('/dashboard/ai-models/new', { state: { aiModelId: m.id, initialStep: 1, organisationId } }),
    })),
    ...orgCollaboratives.filter(needsAttention).map((c) => ({
      id: `collaborative-${c.id}`,
      title: c.form.metadata.name || 'Untitled collaborative',
      module: 'Collaborative',
      updatedAt: c.updatedAt,
      onContinue: () => navigate('/dashboard/collaboratives/new', { state: { collaborativeId: c.id, initialStep: 1, organisationId } }),
    })),
    ...orgPublications.filter(needsAttention).map((p) => ({
      id: `publication-${p.id}`,
      title: p.form.metadata.name || 'Untitled Publication',
      module: 'Publication',
      updatedAt: p.updatedAt,
      onContinue: () => navigate('/dashboard/publications/new', { state: { publicationId: p.id, initialStep: 1, organisationId } }),
    })),
    ...orgCharts.filter(needsAttention).map((c) => ({
      id: `chart-${c.id}`,
      title: c.form.name || 'Untitled chart',
      module: 'Chart',
      updatedAt: c.updatedAt,
      onContinue: () => navigate('/dashboard/charts/new', { state: { chartId: c.id, initialStep: 1, organisationId } }),
    })),
  ]
    .sort((a, b) => parseAppTimestamp(b.updatedAt).getTime() - parseAppTimestamp(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <Card className={cn('flex w-full flex-col', WORKSPACE_HEIGHT_CLASS)}>
      <PageHeader
        className="border-b border-border-default px-6 py-5"
        title={organisation.metadata.name}
        description="Manage datasets, events, use cases and other contributions on behalf of this organisation."
      />

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
        <section aria-labelledby="organisation-content" className="flex flex-col gap-4">
          <div>
            <h2 id="organisation-content" className="type-heading-3 text-text-brand">
              Organisation content
            </h2>
            <p className="mt-1 text-sm text-text-subdued">Everything made on behalf of this organisation.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {summary.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => navigate(card.path)}
                  className="flex flex-col items-start gap-2 rounded-lg bg-action-primary-default/5 p-4 text-left outline-none transition-colors hover:bg-action-primary-default/10 focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-surface-default text-text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="type-heading-2 text-text-brand">{card.count}</p>
                  <p className="text-xs text-text-subdued">{card.label}</p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
          <section aria-labelledby="organisation-activity" className="flex min-h-0 flex-col gap-4">
            <h2 id="organisation-activity" className="type-heading-3 text-text-brand">
              Recent Organisation Activity
            </h2>
            {activity.length === 0 ? (
              <p className="text-sm text-text-subdued">No organisation activity yet.</p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                {activity.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onOpen}
                    className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-lg bg-action-primary-default/5 px-4 py-3 text-left outline-none transition-colors hover:bg-action-primary-default/10 focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <p className="truncate text-sm font-medium text-text-default">{item.description}</p>
                    <p className="truncate text-xs text-text-subdued">
                      {item.contributor ?? 'Unknown member'} · {item.module} · {item.updatedAt}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="organisation-continue" className="flex min-h-0 flex-col gap-4">
            <h2 id="organisation-continue" className="type-heading-3 text-text-brand">
              Continue Working
            </h2>
            {continueWorking.length === 0 ? (
              <p className="text-sm text-text-subdued">Nothing to work on today.</p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                {continueWorking.map((item) => {
                  const Icon = MODULE_ICON[item.module]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onContinue}
                      className="flex min-h-0 flex-1 items-center justify-between gap-3 rounded-lg bg-action-primary-default/5 px-4 py-3 text-left outline-none transition-colors hover:bg-action-primary-default/10 focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-default text-text-brand">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-default">{item.title}</p>
                          <p className="text-xs text-text-subdued">{item.module}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-text-brand">Continue →</span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </Card>
  )
}

export { OrganisationDashboardPage }
