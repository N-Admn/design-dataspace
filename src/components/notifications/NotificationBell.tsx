import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { NOTIFICATIONS_PATH } from '@/components/notifications/RequestActions'
import { useNotifications } from '@/context/NotificationsContext'
import { useFocusRescue } from '@/hooks/use-focus-rescue'
import { useHeaderMenuOffset } from '@/hooks/use-header-menu-offset'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/types/notifications'

const PANEL_ROWS = 6
const ARRIVAL_FLASH_MS = 4000

type PanelTab = 'requests' | 'updates'

/** The bell in the top bar: a quick look and quick action. Same rows and data as the Notifications & Requests page, capped at
 *  six, with the unread count on the button (9+ beyond nine). */
function NotificationBell() {
  const navigate = useNavigate()
  const menuOffset = useHeaderMenuOffset()
  const { items, unreadCount, markItemRead, markAllRead } = useNotifications()
  const now = useNow()
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<PanelTab>('requests')
  const [arrived, setArrived] = React.useState<Set<string>>(new Set())
  const [announcement, setAnnouncement] = React.useState('')
  const tabRefs = React.useRef<Record<PanelTab, HTMLButtonElement | null>>({ requests: null, updates: null })

  // Rows that appear (or turn unread) while the person is here flash once, and the change is announced politely.
  const previous = React.useRef<{ ids: Set<string>; unread: Set<string> } | null>(null)
  React.useEffect(() => {
    const ids = new Set(items.map((i) => i.id))
    const unread = new Set(items.filter((i) => i.unread).map((i) => i.id))
    const before = previous.current
    previous.current = { ids, unread }
    if (!before) return
    const fresh = [...unread].filter((id) => !before.unread.has(id))
    if (fresh.length === 0) return
    setArrived(new Set(fresh))
    setAnnouncement(`${fresh.length} new notification${fresh.length === 1 ? '' : 's'}. ${unreadCount} unread.`)
    const timer = window.setTimeout(() => {
      setArrived(new Set())
      setAnnouncement('')
    }, ARRIVAL_FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [items, unreadCount])

  // Requests tell people what needs attention; updates tell them what changed. Same items, same order, split by kind.
  // Requests waiting for this person's decision come first (`needsAction` is only set for incoming, waiting requests the person is
  // allowed to decide), then everything else. `items` is already newest first and this split keeps that order inside each group,
  // so nothing a person can act on is pushed below the six-row cut by a newer, finished request.
  // An invitation to join an organisation waits for the person's answer like a request does, so it sits with the requests.
  const isInvitation = (i: NotificationItem) => i.event?.type === 'update.invitation-received'
  const requestRows = items.filter((i) => i.kind === 'request' || isInvitation(i))
  const visible = (tab === 'updates' ? items.filter((i) => i.kind === 'update' && !isInvitation(i)) : [...requestRows.filter((i) => i.needsAction), ...requestRows.filter((i) => !i.needsAction)]).slice(0, PANEL_ROWS)
  const needsActionCount = items.filter((i) => i.needsAction).length
  const unreadUpdates = items.filter((i) => i.kind === 'update' && !isInvitation(i) && i.unread).length
  // Approving or declining in the panel removes a row from a short list; focus stays in the list instead of falling to the page.
  const bodyRef = useFocusRescue(visible)
  const TAB_KEYS: PanelTab[] = ['requests', 'updates']
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const move = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const next = event.key === 'Home' ? TAB_KEYS[0] : TAB_KEYS[TAB_KEYS.length - 1]
      setTab(next)
      tabRefs.current[next]?.focus()
    } else if (move) {
      event.preventDefault()
      const next = TAB_KEYS[(TAB_KEYS.indexOf(tab) + move + TAB_KEYS.length) % TAB_KEYS.length]
      setTab(next)
      tabRefs.current[next]?.focus()
    }
  }
  const badge = unreadCount > 9 ? '9+' : String(unreadCount)

  const openItem = (item: NotificationItem) => {
    markItemRead(item)
    setOpen(false)
    if (item.kind === 'request' && item.request) navigate(`${NOTIFICATIONS_PATH}?request=${item.request.id}`)
    else navigate(`${NOTIFICATIONS_PATH}?tab=updates`)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="relative flex size-11 items-center justify-center rounded-button text-primary-foreground/60 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold leading-none text-accent-foreground"
              >
                {badge}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={menuOffset} collisionPadding={16} aria-label="Notifications" className="w-[min(26rem,calc(100vw-2rem))] rounded-xl p-0 shadow-lg">
          <div className="px-4 pb-2 pt-4">
            <h2 className="text-lg font-semibold text-text-brand">Notifications</h2>
          </div>
          <div className="border-b border-border-default px-4 pb-3">
          <div role="tablist" aria-label="Notification filter" onKeyDown={onTabKeyDown} className="flex w-full gap-1 rounded-lg bg-surface-subdued p-1">
            {(
              [
                ['requests', 'Requests', needsActionCount, `${needsActionCount} waiting for your decision`],
                ['updates', 'Updates', unreadUpdates, `${unreadUpdates} unread`],
              ] as const
            ).map(([key, label, count, hint]) => (
              <button
                key={key}
                ref={(el) => {
                  tabRefs.current[key] = el
                }}
                type="button"
                role="tab"
                id={`bell-tab-${key}`}
                aria-selected={tab === key}
                aria-controls="bell-panel-body"
                tabIndex={tab === key ? 0 : -1}
                onClick={() => setTab(key)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  tab === key ? 'bg-surface-default text-text-brand shadow-sm' : 'text-text-subdued hover:text-text-default',
                )}
              >
                {label}
                {count > 0 && (
                  <>
                    <span aria-hidden="true"> ({count})</span>
                    <span className="sr-only">, {hint}</span>
                  </>
                )}
              </button>
            ))}
          </div>
          </div>
          <div ref={bodyRef} id="bell-panel-body" role="tabpanel" aria-labelledby={`bell-tab-${tab}`} tabIndex={-1} className="outline-none">
          {visible.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-text-default">You’re all caught up</p>
              <p className="mt-1 text-xs text-text-subdued">
                {tab === 'updates' ? 'Changes to collaboratives you follow will show up here.' : 'Access requests and submissions will show up here.'}
              </p>
            </div>
          ) : (
            <ul className="flex max-h-[min(30rem,60dvh)] flex-col gap-2 overflow-y-auto p-3" aria-label={tab === 'updates' ? 'Recent updates' : 'Recent requests'}>
              {visible.map((item) => (
                <NotificationRow key={item.id} item={item} now={now} density="compact" highlighted={arrived.has(item.id)} onOpen={openItem} />
              ))}
            </ul>
          )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border-default px-4 py-2">
            <Button type="button" variant="ghost" size="xs" onClick={markAllRead} disabled={unreadCount === 0} className="-ml-2.5 text-text-brand">
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all as read
            </Button>
            <Button asChild size="xs" variant="outline" className="ml-auto">
              <Link to={NOTIFICATIONS_PATH} onClick={() => setOpen(false)} aria-label="See all notifications and requests">
                See More
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  )
}

export { NotificationBell }
