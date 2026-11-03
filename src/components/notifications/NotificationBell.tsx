import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationRow } from '@/components/notifications/NotificationRow'
import { NOTIFICATIONS_PATH } from '@/components/notifications/RequestActions'
import { useNotifications } from '@/context/NotificationsContext'
import { useHeaderMenuOffset } from '@/hooks/use-header-menu-offset'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/types/notifications'

const PANEL_ROWS = 6
const ARRIVAL_FLASH_MS = 4000

type PanelTab = 'all' | 'action'

/** The bell in the top bar: a quick look and quick action. Same rows and data as the Notifications & Requests page, capped at
 *  six, with the unread count on the button (9+ beyond nine). */
function NotificationBell() {
  const navigate = useNavigate()
  const menuOffset = useHeaderMenuOffset()
  const { items, unreadCount, markItemRead, markAllRead } = useNotifications()
  const now = useNow()
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<PanelTab>('all')
  const [arrived, setArrived] = React.useState<Set<string>>(new Set())
  const [announcement, setAnnouncement] = React.useState('')

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
    const timer = window.setTimeout(() => setArrived(new Set()), ARRIVAL_FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [items, unreadCount])

  const visible = (tab === 'action' ? items.filter((i) => i.needsAction) : items).slice(0, PANEL_ROWS)
  const needsActionCount = items.filter((i) => i.needsAction).length
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
            className="relative flex size-11 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground"
              >
                {badge}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={menuOffset} collisionPadding={16} className="w-[min(26rem,calc(100vw-2rem))] rounded-xl p-0 shadow-lg">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <h2 className="text-sm font-semibold text-text-brand">Notifications</h2>
            <Button type="button" variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="size-4" aria-hidden="true" />
              Mark all as read
            </Button>
          </div>
          <div role="tablist" aria-label="Notification filter" className="flex gap-1 border-b border-border-default px-3">
            {(
              [
                ['all', 'All'],
                ['action', `Needs action${needsActionCount > 0 ? ` (${needsActionCount})` : ''}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  '-mb-px border-b-2 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  tab === key ? 'border-accent text-text-brand' : 'border-transparent text-text-subdued hover:text-text-default',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-text-default">You’re all caught up</p>
              <p className="mt-1 text-xs text-text-subdued">
                {tab === 'action' ? 'Nothing is waiting for your decision.' : 'Access requests and updates will show up here.'}
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(30rem,60dvh)] overflow-y-auto" aria-label="Recent notifications">
              {visible.map((item) => (
                <NotificationRow key={item.id} item={item} now={now} density="compact" highlighted={arrived.has(item.id)} onOpen={openItem} />
              ))}
            </ul>
          )}
          <div className="border-t border-border-default p-2">
            <Link
              to={NOTIFICATIONS_PATH}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-center text-sm font-medium text-text-brand outline-none hover:bg-surface-subdued focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              See all notifications and requests
            </Link>
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
