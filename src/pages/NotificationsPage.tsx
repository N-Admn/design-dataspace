import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpDown, Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { BackLink } from '@/components/shared/BackLink'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { ViewTabs } from '@/components/shared/ViewTabs'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { useNotifications } from '@/context/NotificationsContext'
import { useFocusRescue } from '@/hooks/use-focus-rescue'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'
import { useAppData } from '@/context/AppDataContext'
import { workspaceKeyOf, workspacesOf } from '@/lib/notification-model'
import type { NotificationItem } from '@/types/notifications'

/** The status tabs. `all` is every notification, including informational updates; the other three are request statuses, which
 *  updates do not have, so updates only ever show under All. The keys are the existing tab names (`pending` is "Waiting"). */
type Category = 'all' | 'pending' | 'approved' | 'closed'

const ALL_WORKSPACES = 'all'
/** From this many workspace options the dropdown gets a search box. */
const SEARCHABLE_FROM = 6

const CATEGORY_ORDER: Category[] = ['all', 'pending', 'approved', 'closed']
const CATEGORY_LABELS: Record<Category, string> = { all: 'All', pending: 'Waiting', approved: 'Approved', closed: 'Closed' }

const EMPTY_TITLE: Record<Category, string> = {
  all: 'You’re all caught up',
  pending: 'No requests are waiting for a response',
  approved: 'No approved requests',
  closed: 'No closed requests',
}

/** A link or bookmark may still say `?tab=updates` (the old Updates tab); updates now live under All. */
function categoryFromTab(tab: string | null): Category | null {
  if (tab === 'updates') return 'all'
  return tab === 'pending' || tab === 'approved' || tab === 'closed' ? tab : null
}

/** Notifications & Requests: one chronological feed for the whole account. Three filters combine: the status tabs, the workspace
 *  dropdown and the unread toggle. Counts are the total notifications matching the workspace (not unread, not "needs action"),
 *  so the unread toggle never changes them. */
function NotificationsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { items, persona, unreadCount, markItemRead, markAllRead } = useNotifications()
  const now = useNow()

  const linkedRequest = params.get('request')
  const linkedItem = linkedRequest ? items.find((i) => i.id === `request:${linkedRequest}`) : undefined
  const requestedCategory = categoryFromTab(params.get('tab'))

  const [category, setCategory] = React.useState<Category>(() => (linkedItem ? categoryFromTab(linkedItem.tab) : null) ?? requestedCategory ?? 'all')
  const [workspace, setWorkspace] = React.useState<string>(ALL_WORKSPACES)
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [flash, setFlash] = React.useState<string | null>(null)

  // A link from the bell, a toast or an email lands on the right tab with the row in view and flashing once.
  const handledLink = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!linkedRequest || !linkedItem || handledLink.current === linkedRequest) return
    handledLink.current = linkedRequest
    setCategory(categoryFromTab(linkedItem.tab) ?? 'all')
    setWorkspace(ALL_WORKSPACES)
    setUnreadOnly(false)
    setFlash(linkedItem.id)
    markItemRead(linkedItem)
    const scroll = window.setTimeout(() => document.querySelector(`[data-notification-id="${linkedItem.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60)
    const stop = window.setTimeout(() => setFlash(null), 2500)
    return () => {
      window.clearTimeout(scroll)
      window.clearTimeout(stop)
    }
  }, [linkedRequest, linkedItem, markItemRead])

  React.useEffect(() => {
    if (requestedCategory && !linkedRequest) setCategory(requestedCategory)
  }, [requestedCategory, linkedRequest])

  const { organisationWorkspaces } = useAppData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const workspaces = React.useMemo(() => workspacesOf(persona), [persona, organisationWorkspaces])
  // If the person switches and the chosen workspace is not one of theirs, fall back to all.
  React.useEffect(() => {
    if (workspace !== ALL_WORKSPACES && !workspaces.some((w) => w.key === workspace)) setWorkspace(ALL_WORKSPACES)
  }, [workspaces, workspace])

  // The workspace narrows everything below it, including the counts; the category then narrows the rows.
  const inWorkspace = React.useMemo(
    () => (workspace === ALL_WORKSPACES ? items : items.filter((i) => workspaceKeyOf(i, persona) === workspace)),
    [items, persona, workspace],
  )
  const counts = React.useMemo(() => {
    const result: Record<Category, number> = { all: inWorkspace.length, pending: 0, approved: 0, closed: 0 }
    // Updates have no request status, so they count under All only.
    for (const item of inWorkspace) if (item.tab !== 'updates') result[item.tab] += 1
    return result
  }, [inWorkspace])

  const filtered = inWorkspace.filter((i) => (category === 'all' || i.tab === category) && (!unreadOnly || i.unread))
  const workspaceOptions = React.useMemo(() => [{ value: ALL_WORKSPACES, label: 'All workspaces' }, ...workspaces.map((w) => ({ value: w.key, label: w.label }))], [workspaces])

  // Approving or declining moves a row out of this tab; keyboard focus stays on the list instead of falling to the page.
  // `items` is already newest first (deriveItems), and filtering keeps that order, so the feed is newest first with no sort control.
  const rows = filtered
  const panelRef = useFocusRescue(rows)

  const openItem = (item: NotificationItem) => {
    markItemRead(item)
    if (item.kind === 'update' && item.event?.href) navigate(item.event.href)
  }

  const changeCategory = (next: string) => {
    setCategory(next as Category)
    setParams({}, { replace: true })
  }

  // Empty states name what is empty; when the feed is narrowed by workspace or unread they say so instead of showing an error.
  const workspaceLabel = workspaces.find((w) => w.key === workspace)?.label
  const scopeName = workspace === 'personal' ? 'your personal workspace' : workspaceLabel
  const emptyTitle = unreadOnly ? 'No unread notifications in this view' : EMPTY_TITLE[category]
  const emptyDescription = unreadOnly
    ? 'Turn off “Unread”, or pick another status or workspace, to see more.'
    : workspace !== ALL_WORKSPACES
      ? `Nothing here for ${scopeName}. Try another workspace.`
      : category === 'all'
        ? 'No notifications yet.'
        : undefined

  // Counts beside each workspace follow the status tab and the unread toggle, so a number is what picking that workspace shows.
  const workspaceCounts = React.useMemo(() => {
    const matching = items.filter((i) => (category === 'all' || i.tab === category) && (!unreadOnly || i.unread))
    const result: Record<string, number> = { [ALL_WORKSPACES]: matching.length }
    for (const item of matching) {
      const key = workspaceKeyOf(item, persona)
      result[key] = (result[key] ?? 0) + 1
    }
    return result
  }, [items, persona, category, unreadOnly])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink fallbackTo="/" />
        <PageHeader
          className="border-b border-border-default pb-6"
          title="Notifications & Requests"
          description="Everything addressed to you across your personal workspace and your organisations."
          action={
            <Button type="button" variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all as read
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-7 lg:flex-row">
        {/* Filter rail, as on the search results: the workspace is the filter. Below lg it becomes a dropdown above the feed. */}
        <aside aria-label="Filters" className="hidden w-full shrink-0 lg:block lg:w-[18%] lg:border-r lg:border-border-default lg:pr-6">
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">Filter by</p>
          <fieldset className="mt-6 flex flex-col">
            <legend className="mb-3.5 text-sm font-semibold text-foreground">Workspace</legend>
            <RadioGroup value={workspace} onValueChange={setWorkspace} aria-label="Workspace" className="gap-3.5">
              {workspaceOptions.map((option) => (
                <div key={option.value} className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2">
                    <RadioGroupItem value={option.value} id={`notifications-ws-${option.value}`} className="mt-0.5" />
                    <Label htmlFor={`notifications-ws-${option.value}`} className="text-sm font-normal text-foreground">
                      {option.label}
                    </Label>
                  </span>
                  <span className="shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{workspaceCounts[option.value] ?? 0}</span>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Status tabs on the left and the Unread toggle on the right of the same line, over one shared rule. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border-default">
            <ViewTabs
              idPrefix="notifications"
              label="Notification status"
              value={category}
              onChange={changeCategory}
              items={CATEGORY_ORDER.map((key) => ({ key, label: `${CATEGORY_LABELS[key]} (${counts[key]})` }))}
              className="-mb-px min-w-0 max-w-full border-b-0"
            />
            {/* One toggle: Unread switches the feed between everything and unread only. Plain icon and label, not a button. */}
            <button
              type="button"
              aria-pressed={unreadOnly}
              onClick={() => setUnreadOnly((v) => !v)}
              className={cn(
                'ml-auto inline-flex min-h-[24px] shrink-0 items-center gap-2 rounded-sm pb-2 text-sm sm:pb-0 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                unreadOnly ? 'text-text-brand' : 'text-text-subdued hover:text-text-default',
              )}
            >
              <ArrowUpDown className="size-4" aria-hidden="true" />
              Unread
            </button>
          </div>
          <div className="w-full lg:hidden">
            <SearchableSelect
              options={workspaceOptions}
              value={workspace}
              onChange={setWorkspace}
              placeholder="All workspaces"
              searchPlaceholder="Search workspaces"
              emptyText="No workspace matches."
              searchable={workspaceOptions.length >= SEARCHABLE_FROM}
              ariaLabel="Workspace"
            />
          </div>
          {/* Announces the result of the filters (status, workspace, unread) without moving focus. */}
          <p className="sr-only" role="status" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'notification' : 'notifications'} shown: {CATEGORY_LABELS[category]}, {workspaceOptions.find((o) => o.value === workspace)?.label}
            {unreadOnly ? ', unread only' : ''}.
          </p>
          <div
            ref={panelRef}
            role="tabpanel"
            id={`notifications-panel-${category}`}
            aria-labelledby={`notifications-tab-${category}`}
            tabIndex={-1}
            data-focus-fallback
            className="outline-none"
          >
            {rows.length === 0 ? (
              <EmptyState icon={Bell} title={emptyTitle} description={emptyDescription} />
            ) : (
              <ul className="flex flex-col gap-5" aria-label="Notifications">
                {rows.map((item) => (
                  <NotificationRow key={item.id} item={item} now={now} highlighted={flash === item.id} onOpen={openItem} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { NotificationsPage }
