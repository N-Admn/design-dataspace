import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { useNow } from '@/hooks/use-now'
import type { NotificationItem } from '@/types/notifications'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleArrow } from '@/components/shared/CircleArrow'
import { useToast } from '@/components/ui/toast'
import { NOTIFICATIONS_PATH } from '@/components/notifications/RequestActions'
import { useNotifications } from '@/context/NotificationsContext'
import { DASHBOARD_MIN_HEIGHT_CLASS } from '@/lib/layout'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from '@/components/layout/nav-config'

const ECOSYSTEM_ITEMS = NAV_GROUPS.find((g) => g.key === 'contribution')?.items ?? []

const MODULE_LIST = 'Datasets · Use Cases · AI Models · Collaboratives · Charts · Events'

/** Landing-panel radius — the top step of the shared radius scale (--radius-xl). */
const PANEL_RADIUS = 'rounded-xl'

/** How many notifications the dashboard card previews. */
const RECENT_COUNT = 3

function DashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { items, unreadCount, markItemRead } = useNotifications()
  const now = useNow()
  // The same order as the bell: what is waiting for this person's decision first, then the newest of the rest.
  const recent = [...items.filter((i) => i.needsAction), ...items.filter((i) => !i.needsAction)].slice(0, RECENT_COUNT)
  const openItem = (item: NotificationItem) => {
    markItemRead(item)
    navigate(item.kind === 'request' && item.request ? `${NOTIFICATIONS_PATH}?request=${item.request.id}` : `${NOTIFICATIONS_PATH}?tab=updates`)
  }

  const comingSoon = (label: string) =>
    toast({ title: `${label} coming soon`, description: 'This area isn’t available yet.' })

  return (
    <div className={cn('flex flex-col gap-10', DASHBOARD_MIN_HEIGHT_CLASS)}>
      <div className="grid flex-1 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Left panel — hero + My Workspace */}
        <div className={cn('flex flex-col justify-between gap-10 bg-card p-8 md:p-10', PANEL_RADIUS)}>
          <div>
            <h1 className="type-display text-primary">Welcome to CivicDataSpace</h1>
            <p className="mt-5 text-sm text-muted-foreground">
              Create, manage and share data, knowledge and tools through CivicDataSpace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex flex-1 flex-col justify-between gap-8 bg-[linear-gradient(252deg,var(--workspace-hero-from)_0%,var(--workspace-hero-to)_97.53%)] p-8 text-left transition-shadow hover:shadow-md md:min-h-[22rem]',
              PANEL_RADIUS,
            )}
          >
            <img
              src="/visuals/my-workspace-infographic.png"
              alt=""
              className="h-[250px] w-auto max-w-[250px] shrink-0 select-none object-contain"
            />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="type-heading-1 text-primary">My Workspace</p>
                <p className="mt-1 text-sm text-muted-foreground">Manage your individual contributions.</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{MODULE_LIST}</p>
              </div>
              <CircleArrow />
            </div>
          </button>
        </div>

        {/* Right column — Organisation Workspace + Continue working */}
        {/* On wide screens this column takes the height the left panel sets (h-0 + min-h-full), so the notification card keeps a fixed height and its three notifications share it, instead of stretching the page. */}
        <div className="flex flex-col gap-6 lg:h-0 lg:min-h-full">
          <button
            type="button"
            onClick={() => navigate('/organisations')}
            className={cn('bg-card p-8 text-left transition-shadow hover:shadow-md md:p-10', PANEL_RADIUS)}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="type-heading-1 text-primary">Organisation Workspace</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage contributions on behalf of an organization.
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{MODULE_LIST}</p>
              </div>
              <CircleArrow />
            </div>
          </button>

          <section aria-labelledby="dashboard-notifications" className={cn('flex flex-1 flex-col gap-4 bg-card p-8 lg:min-h-0 lg:px-10 lg:py-6', PANEL_RADIUS)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="dashboard-notifications" className="type-heading-1 text-primary">Notifications &amp; Requests</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {unreadCount === 0 ? 'You’re all caught up.' : `${unreadCount} unread across your workspaces.`}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link to={NOTIFICATIONS_PATH} aria-label="See all notifications and requests">
                  See all
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Access requests, submissions and updates will show up here.</p>
            ) : (
              <ul className="flex flex-1 flex-col gap-3 [&>li]:border-0 [&>li]:bg-action-primary-default/5 lg:min-h-0 lg:[&>li]:flex lg:[&>li]:min-h-0 lg:[&>li]:flex-1 lg:[&>li]:flex-col lg:[&>li]:justify-center" aria-label="Recent notifications">
                {recent.map((item) => (
                  <NotificationRow key={item.id} item={item} now={now} density="compact" onOpen={openItem} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Footer — supporting copy and ecosystem icon stack */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <p className="min-w-0 text-sm text-muted-foreground">
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
