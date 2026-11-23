import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bookmark, CalendarDays, Clock, Database, FileStack, FolderKanban, LineChart, Lock, Send, Settings2, Sparkles, Users, X, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { AccessSection, ContributionsSection, FollowingSection, ManagingSection, useFollowingAccess, type FollowingAccessKey } from '@/components/workspace/FollowingAccessSections'
import { useAppData } from '@/context/AppDataContext'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { cn } from '@/lib/utils'

interface Tile {
  key: string
  label: string
  count: number
  icon: LucideIcon
}

const SECTIONS: Record<FollowingAccessKey, { label: string; description: string; icon: LucideIcon }> = {
  following: { label: 'Following', description: 'Collaboratives you follow. You are notified when new public content is added.', icon: Bookmark },
  contributions: { label: 'My Contributions', description: 'Items you submitted or added to collaboratives, and where each one stands.', icon: Send },
  managing: { label: 'Managing', description: 'Collaboratives you own or are a partner on. You can add items directly and manage what is in them.', icon: Settings2 },
  access: { label: 'Access', description: 'Restricted datasets you can open right now.', icon: Lock },
}

/** A sub-card on the white main card: a light blue (the brand colour at low opacity), no border of its own, and its icon in a white
 *  chip. */
const tileClass = 'flex flex-col items-start gap-2 rounded-lg bg-action-primary-default/5 p-4 text-left outline-none transition-colors hover:bg-action-primary-default/10 focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2'
const chipClass = 'flex size-9 items-center justify-center rounded-lg bg-surface-default text-text-brand'

function isPanelKey(value: string | null): value is FollowingAccessKey {
  return value === 'following' || value === 'contributions' || value === 'managing' || value === 'access'
}

/** My Workspace home: the counts of what the person has made (each goes to its list) and, below, the four ways they relate to
 *  collaboratives and restricted data: Following, My Contributions, Managing and Access. Choosing one opens its card here, under
 *  the tiles; closing it goes back to the dashboard. The open card lives in the URL (`?panel=`) so Back, refresh and links from
 *  the bell and toasts all work. */
function PersonalDashboardPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { datasets, useCases, collaboratives, aiModels, publications, charts, events } = useAppData()
  const data = useFollowingAccess()

  // The counts match the lists they open: My Workspace holds only the person's own records, not an organisation's.
  const own = (records: { organisationId?: string }[]) => records.filter((r) => !r.organisationId).length
  const summary: (Tile & { path: string })[] = [
    { key: 'datasets', label: 'Datasets', count: own(datasets), icon: Database, path: '/dashboard/datasets' },
    { key: 'use-cases', label: 'Use Cases', count: own(useCases), icon: FolderKanban, path: '/dashboard/use-cases' },
    { key: 'collaboratives', label: 'Collaboratives', count: own(collaboratives), icon: Users, path: '/dashboard/collaboratives' },
    { key: 'ai-models', label: 'AI Models', count: own(aiModels), icon: Sparkles, path: '/dashboard/ai-models' },
    { key: 'publications', label: 'Publications', count: own(publications), icon: FileStack, path: '/dashboard/publications' },
    { key: 'charts', label: 'Charts', count: own(charts), icon: LineChart, path: '/dashboard/charts' },
    { key: 'events', label: 'Events', count: own(events), icon: CalendarDays, path: '/dashboard/events' },
  ]

  // Running a collaborative is only offered to owners and partners; a link to a panel that is not theirs opens nothing.
  const requested = params.get('panel')
  const panel: FollowingAccessKey | null = isPanelKey(requested) && (requested !== 'managing' || data.helpRun.length > 0) ? requested : null

  const cues: Record<FollowingAccessKey, string | null> = {
    following: null,
    contributions: data.waitingSubmissions > 0 ? `${data.waitingSubmissions} waiting` : null,
    managing: data.waitingToApprove > 0 ? `${data.waitingToApprove} to approve` : null,
    access: data.waitingAccess > 0 ? `${data.waitingAccess} ${data.waitingAccess === 1 ? 'request' : 'requests'} waiting` : null,
  }
  const keys: FollowingAccessKey[] = ['following', 'contributions', ...(data.helpRun.length > 0 ? (['managing'] as const) : []), 'access']

  const tileRefs = React.useRef<Partial<Record<FollowingAccessKey, HTMLButtonElement | null>>>({})
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previous = React.useRef<FollowingAccessKey | null>(null)

  // Opening a card moves focus into it; closing it puts focus back on the tile that opened it.
  React.useEffect(() => {
    const before = previous.current
    previous.current = panel
    if (panel && panel !== before) {
      window.scrollTo({ top: 0 })
      panelRef.current?.focus({ preventScroll: true })
    } else if (!panel && before) tileRefs.current[before]?.focus()
  }, [panel])

  const open = (key: FollowingAccessKey) => setParams({ panel: key })
  const close = () => setParams({}, { replace: true })

  const section = panel ? SECTIONS[panel] : null

  // An opened card replaces the dashboard in place, the way the creation flows do: a close button at the top left, the section
  // below, and closing it goes back to the dashboard.
  if (panel && section) {
    return (
      <div
        ref={panelRef}
        id="workspace-panel"
        role="region"
        aria-labelledby="workspace-panel-title"
        tabIndex={-1}
        className="outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            close()
          }
        }}
      >
        <Card className={cn('flex w-full flex-col', WORKSPACE_HEIGHT_CLASS)}>
          <div className="flex items-center gap-3 border-b border-border-default px-6 py-4">
            <button
              type="button"
              aria-label={`Close ${section.label}`}
              onClick={close}
              className="flex size-8 shrink-0 items-center justify-center rounded-button text-text-subdued outline-none transition-colors hover:bg-surface-subdued hover:text-text-default focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 id="workspace-panel-title" className="type-heading-2 text-text-brand">
                {section.label}
              </h1>
              <p className="mt-0.5 text-sm text-text-subdued">{section.description}</p>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
            {panel === 'following' && <FollowingSection data={data} />}
            {panel === 'contributions' && <ContributionsSection data={data} />}
            {panel === 'managing' && <ManagingSection data={data} />}
            {panel === 'access' && <AccessSection data={data} />}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className={cn('flex w-full flex-col', WORKSPACE_HEIGHT_CLASS)}>
        <PageHeader
          className="border-b border-border-default px-6 py-5"
          title="My Workspace"
          description="Manage your individual contributions, and what you follow, contribute to and can access."
        />
        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
        <section aria-labelledby="workspace-content" className="flex flex-col gap-4">
          <h2 id="workspace-content" className="type-heading-3 text-text-brand">
            Your content
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {summary.map((card) => {
              const Icon = card.icon
              return (
                <button key={card.key} type="button" onClick={() => navigate(card.path)} className={tileClass}>
                  <span className={chipClass}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="type-heading-2 text-text-brand">{card.count}</p>
                  <p className="text-xs text-text-subdued">{card.label}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="workspace-relationships" className="flex min-h-0 flex-col gap-4 lg:flex-1">
          <div>
            <h2 id="workspace-relationships" className="type-heading-3 text-text-brand">
              Following &amp; access
            </h2>
            <p className="mt-1 text-sm text-text-subdued">What you follow, contribute to, manage and can open.</p>
          </div>
          {/* Equal, tall cards side by side that fill the rest of the card. They stack on narrow screens. */}
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-h-[18rem] lg:flex-1 lg:[grid-template-columns:repeat(var(--cards),minmax(0,1fr))]"
            style={{ '--cards': keys.length } as React.CSSProperties}
          >
            {keys.map((key) => {
              const { label, description, icon: Icon } = SECTIONS[key]
              return (
                <div
                  key={key}
                  className="flex flex-col gap-3 rounded-lg bg-action-primary-default/5 p-5 text-text-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="size-8 text-text-brand" strokeWidth={1.5} aria-hidden="true" />
                    <span className="type-heading-1 text-text-brand">{data.counts[key]}</span>
                  </div>
                  {/* The title and description sit in the middle of the card, between the icon and count above and the button below. */}
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <h3 className="type-heading-3 text-text-brand">{label}</h3>
                    {/* Fixed minimum heights keep the titles level across the row whatever each description and cue is. */}
                    <p className="min-h-20 text-sm text-text-subdued">{description}</p>
                    <p className="mt-1 inline-flex min-h-4 items-center gap-1 text-xs font-medium text-text-warning">
                      {cues[key] && (
                        <>
                          <Clock className="size-3" aria-hidden="true" />
                          {cues[key]}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    ref={(el: HTMLButtonElement | null) => {
                      tileRefs.current[key] = el
                    }}
                    type="button"
                    size="sm"
                    aria-label={`Open ${label}`}
                    onClick={() => open(key)}
                    className="mt-auto w-fit"
                  >
                    Open
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
        </div>
      </Card>

    </div>
  )
}

export { PersonalDashboardPage }
