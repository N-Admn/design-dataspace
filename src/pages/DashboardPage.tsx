import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Database, FolderKanban, LayoutGrid, Users } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleArrow } from '@/components/shared/CircleArrow'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { parseAppTimestamp } from '@/lib/format'
import { hasUnpublishedEdits, type ContentStatus } from '@/lib/content-status'
import { DASHBOARD_MIN_HEIGHT_CLASS } from '@/lib/layout'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from '@/components/layout/nav-config'

const ECOSYSTEM_ITEMS = NAV_GROUPS.find((g) => g.key === 'contribution')?.items ?? []

const MODULE_LIST = 'Datasets · Use Cases · AI Models · Collaboratives · Charts · Events'

/** Landing-panel radius — the top step of the shared radius scale (--radius-xl). */
const PANEL_RADIUS = 'rounded-xl'

type ModuleLabel = 'Dataset' | 'Event' | 'Use Case' | 'Collaborative'

const MODULE_ICONS: Record<ModuleLabel, typeof Database> = {
  Dataset: Database,
  Event: CalendarDays,
  'Use Case': FolderKanban,
  Collaborative: Users,
}

interface ResumeItem {
  id: string
  title: string
  moduleLabel: ModuleLabel
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
  const resumeItems = [...editedItems, ...draftItems].slice(0, 3)

  return (
    <div className={cn('flex flex-col gap-10', DASHBOARD_MIN_HEIGHT_CLASS)}>
      <div className="grid flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Left panel — hero + My Workspace */}
        <div className={cn('flex flex-col justify-between gap-10 bg-card p-8 md:p-10', PANEL_RADIUS)}>
          <div>
            <h1 className="text-5xl font-semibold leading-[1.05] text-primary md:text-6xl">
              Welcome to CivicDataSpace
            </h1>
            <p className="mt-5 text-sm text-muted-foreground">
              Create, manage and share data, knowledge and tools through CivicDataSpace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/datasets')}
            className={cn(
              'flex flex-1 flex-col justify-between gap-8 bg-[linear-gradient(252deg,#F4F5F8_0%,#D3E9FF_97.53%)] p-8 text-left transition-shadow hover:shadow-md md:min-h-[22rem]',
              PANEL_RADIUS,
            )}
          >
            {/* strokeWidth is in the 24-unit viewBox; at size-50 (200px) one unit ≈ 8.3px,
                so 1.2 ≈ a 10px stroke. */}
            <LayoutGrid strokeWidth={1.2} className="size-50 shrink-0 text-primary-foreground" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-primary">My Workspace</p>
                <p className="mt-1 text-sm text-muted-foreground">Manage your individual contributions.</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{MODULE_LIST}</p>
              </div>
              <CircleArrow />
            </div>
          </button>
        </div>

        {/* Right column — Organisation Workspace + Continue working */}
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => comingSoon('Organization Workspace')}
            className={cn('bg-card p-8 text-left transition-shadow hover:shadow-md md:p-10', PANEL_RADIUS)}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-primary">Organisation Workspace</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage contributions on behalf of an organization.
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{MODULE_LIST}</p>
              </div>
              <CircleArrow />
            </div>
          </button>

          <div className={cn('flex flex-1 flex-col gap-4 bg-card p-8 md:p-10', PANEL_RADIUS)}>
            <p className="text-2xl font-semibold text-primary">Continue Working</p>
            {resumeItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing to work on today.</p>
            ) : (
              <div className="flex flex-1 flex-col gap-3">
                {resumeItems.map((item) => {
                  const Icon = MODULE_ICONS[item.moduleLabel]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onContinue}
                      className="flex flex-1 items-center gap-4 rounded-xl bg-muted/60 p-4 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                        <Icon className="size-[34px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.moduleLabel}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                        Continue
                        <ArrowRight className="size-3.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer — supporting copy and ecosystem icon stack */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          Create and share data, models, knowledge and visualizations with the civic data community.
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
