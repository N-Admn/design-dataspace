import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { ViewTabs } from '@/components/shared/ViewTabs'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { useNotifications } from '@/context/NotificationsContext'
import { useNow } from '@/hooks/use-now'
import { TAB_LABELS, TAB_ORDER, dateGroupOf, type DateGroup } from '@/lib/notification-model'
import { cn } from '@/lib/utils'
import type { NotificationItem, NotificationTab } from '@/types/notifications'

type Direction = 'all' | 'incoming' | 'outgoing'

const DIRECTIONS: { key: Direction; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'incoming', label: 'Waiting for me' },
  { key: 'outgoing', label: 'Sent by me' },
]

const GROUP_ORDER: DateGroup[] = ['Today', 'This week', 'Earlier']

const EMPTY_COPY: Record<NotificationTab, { description: string }> = {
  pending: { description: 'Requests waiting for a decision, yours or someone else’s, show up here.' },
  updates: { description: 'Updates from collaboratives you follow show up here.' },
  approved: { description: 'Requests that were approved, and access given to you directly, show up here.' },
  closed: { description: 'Declined, withdrawn and revoked requests show up here.' },
}

function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus',
        pressed ? 'border-transparent bg-action-primary-default text-action-primary-text' : 'border-border-default bg-surface-default text-text-subdued hover:text-text-default',
      )}
    >
      {children}
    </button>
  )
}

/** Notifications & Requests: one inbox for the whole account, across the personal workspace and every organisation. */
function NotificationsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { items, unreadCount, markItemRead, markAllRead } = useNotifications()
  const now = useNow()

  const linkedRequest = params.get('request')
  const linkedItem = linkedRequest ? items.find((i) => i.id === `request:${linkedRequest}`) : undefined
  const requestedTab = params.get('tab') as NotificationTab | null

  const [tab, setTab] = React.useState<NotificationTab>(() => linkedItem?.tab ?? (TAB_ORDER.includes(requestedTab as NotificationTab) ? (requestedTab as NotificationTab) : 'pending'))
  const [direction, setDirection] = React.useState<Direction>('all')
  const [context, setContext] = React.useState<string>('all')
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [flash, setFlash] = React.useState<string | null>(null)

  // A link from the bell, a toast or an email lands on the right tab with the row in view and flashing once.
  const handledLink = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!linkedRequest || !linkedItem || handledLink.current === linkedRequest) return
    handledLink.current = linkedRequest
    setTab(linkedItem.tab)
    setDirection('all')
    setContext('all')
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
    if (requestedTab && TAB_ORDER.includes(requestedTab) && !linkedRequest) setTab(requestedTab)
  }, [requestedTab, linkedRequest])

  const contexts = React.useMemo(() => [...new Set(items.map((i) => i.context))], [items])
  // If the person switches and the chosen context no longer exists for them, fall back to all.
  React.useEffect(() => {
    if (context !== 'all' && !contexts.includes(context)) setContext('all')
  }, [contexts, context])

  const counts = React.useMemo(() => {
    const result: Record<NotificationTab, number> = { pending: 0, updates: 0, approved: 0, closed: 0 }
    for (const item of items) result[item.tab] += 1
    return result
  }, [items])

  const filtered = items.filter(
    (i) =>
      i.tab === tab &&
      (direction === 'all' || i.direction === direction) &&
      (context === 'all' || i.context === context) &&
      (!unreadOnly || i.unread),
  )

  const groups = GROUP_ORDER.map((group) => ({ group, rows: filtered.filter((i) => dateGroupOf(i.at, now) === group) })).filter((g) => g.rows.length > 0)

  const openItem = (item: NotificationItem) => {
    markItemRead(item)
    if (item.kind === 'update' && item.event?.href) navigate(item.event.href)
  }

  const changeTab = (next: string) => {
    setTab(next as NotificationTab)
    setParams({}, { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <PageHeader
        title="Notifications & Requests"
        description="Everything addressed to you across your personal workspace and your organisations."
        action={
          <Button type="button" variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all as read
          </Button>
        }
      />

      <ViewTabs
        idPrefix="notifications"
        label="Notification categories"
        value={tab}
        onChange={changeTab}
        items={TAB_ORDER.map((key) => ({ key, label: `${TAB_LABELS[key]} (${counts[key]})` }))}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3" role="group" aria-label="Filters">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Direction">
          {DIRECTIONS.map((d) => (
            <FilterChip key={d.key} pressed={direction === d.key} onClick={() => setDirection(d.key)}>
              {d.label}
            </FilterChip>
          ))}
        </div>
        {contexts.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Context">
            <FilterChip pressed={context === 'all'} onClick={() => setContext('all')}>
              All contexts
            </FilterChip>
            {contexts.map((c) => (
              <FilterChip key={c} pressed={context === c} onClick={() => setContext(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Checkbox id="notifications-unread-only" checked={unreadOnly} onCheckedChange={(v) => setUnreadOnly(v === true)} />
          <Label htmlFor="notifications-unread-only">Unread only</Label>
        </div>
      </div>

      <div role="tabpanel" id={`notifications-panel-${tab}`} aria-labelledby={`notifications-tab-${tab}`} className="flex flex-col gap-5">
        {groups.length === 0 ? (
          <EmptyState icon={Bell} title="You’re all caught up" description={EMPTY_COPY[tab].description} />
        ) : (
          groups.map(({ group, rows }) => (
            <section key={group} aria-label={group}>
              <h2 className="type-label mb-2 text-text-subdued">{group}</h2>
              <ul className="overflow-hidden rounded-xl border border-border-default bg-surface-default">
                {rows.map((item) => (
                  <NotificationRow key={item.id} item={item} now={now} highlighted={flash === item.id} onOpen={openItem} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

export { NotificationsPage }
