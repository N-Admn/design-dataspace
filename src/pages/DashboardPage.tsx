import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, LayoutGrid } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { parseAppTimestamp } from '@/lib/format'
import { hasUnpublishedEdits, type ContentStatus } from '@/lib/content-status'
import { DASHBOARD_MIN_HEIGHT_CLASS } from '@/lib/layout'
import { NAV_GROUPS } from '@/components/layout/nav-config'

const ECOSYSTEM_ITEMS = NAV_GROUPS.find((g) => g.key === 'contribution')?.items ?? []

interface ResumeItem {
  id: string
  title: string
  moduleLabel: 'Dataset' | 'Event' | 'Use Case' | 'Collaborative'
  status: ContentStatus
  /** Published item with a saved-but-unpublished working copy. */
  unpublishedEdits: boolean
  sortKey: number
  onContinue: () => void
}

/** Surface anything the contributor still has open work on: drafts, and published
 * items carrying unpublished edits. */
function needsAttention(record: { status: ContentStatus; form: unknown; publishedForm: unknown }): boolean {
  return record.status === 'draft' || hasUnpublishedEdits(record)
}

function DashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { datasets, events, useCases, collaboratives } = useAppData()

  const comingSoon = (label: string) =>
    toast({ title: `${label} coming soon`, description: 'This area isn’t available yet.' })

  const resumeDatasets: ResumeItem[] = datasets
    .filter(needsAttention)
    .map((d) => ({
      id: `dataset-${d.id}`,
      title: d.form.metadata.name || 'Untitled dataset',
      moduleLabel: 'Dataset',
      status: d.status,
      unpublishedEdits: hasUnpublishedEdits(d),
      sortKey: parseAppTimestamp(d.updatedAt).getTime(),
      onContinue: () => navigate('/dashboard/datasets', { state: { datasetId: d.id } }),
    }))

  const resumeEvents: ResumeItem[] = events
    .filter(needsAttention)
    .map((e) => ({
      id: `event-${e.id}`,
      title: e.form.metadata.title || 'Untitled event',
      moduleLabel: 'Event',
      status: e.status,
      unpublishedEdits: hasUnpublishedEdits(e),
      sortKey: parseAppTimestamp(e.updatedAt).getTime(),
      onContinue: () => navigate('/dashboard/events/new', { state: { eventId: e.id, initialStep: 1 } }),
    }))

  const resumeUseCases: ResumeItem[] = useCases
    .filter(needsAttention)
    .map((u) => ({
      id: `usecase-${u.id}`,
      title: u.form.metadata.title || 'Untitled Use Case',
      moduleLabel: 'Use Case',
      status: u.status,
      unpublishedEdits: hasUnpublishedEdits(u),
      sortKey: parseAppTimestamp(u.updatedAt).getTime(),
      onContinue: () => navigate('/dashboard/use-cases/new', { state: { useCaseId: u.id, initialStep: 1 } }),
    }))

  const resumeCollaboratives: ResumeItem[] = collaboratives
    .filter(needsAttention)
    .map((c) => ({
      id: `collaborative-${c.id}`,
      title: c.form.metadata.name || 'Untitled Collaborative',
      moduleLabel: 'Collaborative',
      status: c.status,
      unpublishedEdits: hasUnpublishedEdits(c),
      sortKey: parseAppTimestamp(c.updatedAt).getTime(),
      onContinue: () => navigate('/dashboard/collaboratives/new', { state: { collaborativeId: c.id, initialStep: 1 } }),
    }))

  const allResumeItems = [...resumeDatasets, ...resumeEvents, ...resumeUseCases, ...resumeCollaboratives]
  // Published items with unpublished edits come first (they have a live version drifting
  // from the working copy), then plain drafts — each group newest-first.
  const editedItems = allResumeItems.filter((i) => i.unpublishedEdits).sort((a, b) => b.sortKey - a.sortKey)
  const draftItems = allResumeItems.filter((i) => !i.unpublishedEdits).sort((a, b) => b.sortKey - a.sortKey)
  const resumeItems = [...editedItems, ...draftItems].slice(0, 5)

  return (
    <div className={`flex min-h-0 flex-col gap-10 ${DASHBOARD_MIN_HEIGHT_CLASS}`}>
      {/* Hero */}
      <div className="shrink-0">
        <h1 className="whitespace-nowrap text-5xl font-semibold leading-tight text-primary">
          Welcome to CivicDataSpace
        </h1>
        <p className="mt-3 whitespace-nowrap text-sm text-muted-foreground">
          Create, manage and share data, knowledge and tools through CivicDataSpace.
        </p>
      </div>

      {/* Workspace cards — side by side */}
      <div className="grid min-h-0 flex-[0.49] grid-cols-1 gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/dashboard/datasets')}
          className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40"
        >
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LayoutGrid className="size-8" />
          </div>
          <div className="flex-1" />
          <div>
            <p className="text-lg font-semibold text-foreground">My Workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">Manage your individual contributions.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Datasets · Use Cases · AI Models · Collaboratives · Charts · Events
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
              Open My Workspace
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => comingSoon('Organization Workspace')}
          className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40"
        >
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-8" />
          </div>
          <div className="flex-1" />
          <div>
            <p className="text-lg font-semibold text-foreground">Organization Workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage contributions on behalf of an organization.
            </p>
            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
              Open Organization Workspace
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </button>
      </div>

      <div className="min-h-0 flex-[0.51]">
        {resumeItems.length > 0 && (
          <div className="flex h-full min-h-0 flex-col gap-3">
            <p className="shrink-0 text-base font-semibold text-foreground">Continue working</p>
            <div className="flex min-h-0 flex-1 gap-5 overflow-hidden">
              {resumeItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onContinue}
                  className="flex h-full flex-1 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
                >
                  <div>
                    <StatusBadge status={item.status} />
                    <p className="mt-3 line-clamp-2 text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.moduleLabel}</p>
                  </div>
                  <span className="flex items-center gap-1 self-end text-sm font-medium text-primary">
                    Continue
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer — supporting copy and ecosystem icon stack */}
      <div className="flex shrink-0 items-center gap-3">
        <p className="max-w-sm text-sm text-muted-foreground">
          Create and share data, models, knowledge and&nbsp;visualizations with the civic data community.
        </p>

        <div className="flex shrink-0 -space-x-2">
          {ECOSYSTEM_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={item.label}
                    onClick={() => (item.path ? navigate(item.path) : comingSoon(item.label))}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground ring-1 ring-border transition-colors hover:z-10 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { DashboardPage }
