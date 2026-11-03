import * as React from 'react'
import { History, Lock, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/notifications/StatusChip'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { useNotifications } from '@/context/NotificationsContext'
import { fullDateTime, requestKindOf, timeAgo } from '@/lib/notification-model'
import { getPerson } from '@/lib/notification-personas'
import { cn } from '@/lib/utils'
import type { AccessRequest, NotificationItem } from '@/types/notifications'

interface NotificationRowProps {
  item: NotificationItem
  now: number
  /** `compact` is the bell panel's row: no history link, tighter spacing. */
  density?: 'compact' | 'page'
  /** Row was just reached from a link or just arrived: flash it once. */
  highlighted?: boolean
  onOpen: (item: NotificationItem) => void
}

const strong = 'font-medium text-text-default'

/** The one sentence a row reads as. It is derived from the request's current status, so every person sees the same outcome,
 *  worded from their side. */
function useSentence(item: NotificationItem): React.ReactNode {
  const { persona } = useNotifications()
  const { datasetName, subjectName, collaborativeName } = useRequestActions()

  if (item.kind === 'update' && item.event) {
    return (
      <>
        <span className={strong}>{item.event.title}</span> · {item.event.detail}
      </>
    )
  }
  const request = item.request as AccessRequest
  const dataset = <span className={strong}>{datasetName(request.itemId)}</span>
  const last = request.history[request.history.length - 1]
  const who = (id: string) => (id === persona.id ? 'You' : getPerson(id).name)
  const requester = who(request.requesterId)

  if (requestKindOf(request) === 'submission') {
    const thing = <span className={strong}>{subjectName(request)}</span>
    const collab = <span className={strong}>{collaborativeName(request.collaborativeId ?? '')}</span>
    if (item.direction === 'incoming') {
      switch (request.status) {
        case 'waiting':
          return <><span className={strong}>{requester}</span> submitted {thing} to {collab}</>
        case 'approved':
          return <><span className={strong}>{who(last.actorId)}</span> approved <span className={strong}>{requester}</span>’s submission of {thing} to {collab}</>
        case 'declined':
          return <><span className={strong}>{who(last.actorId)}</span> declined <span className={strong}>{requester}</span>’s submission of {thing} to {collab}</>
        default:
          return <><span className={strong}>{requester}</span> withdrew {thing} from {collab}</>
      }
    }
    switch (request.status) {
      case 'waiting':
        return <>You submitted {thing} to {collab}</>
      case 'approved':
        return <>Your submission of {thing} to {collab} was approved</>
      case 'declined':
        return <>Your submission of {thing} to {collab} was declined</>
      default:
        return <>You withdrew {thing} from {collab}</>
    }
  }

  if (item.direction === 'incoming') {
    switch (request.status) {
      case 'waiting':
        return <><span className={strong}>{requester}</span> requested access to {dataset}</>
      case 'approved':
        return <><span className={strong}>{who(last.actorId)}</span> {request.direct ? <>gave <span className={strong}>{requester}</span> access to</> : <>approved <span className={strong}>{requester}</span>’s access to</>} {dataset}</>
      case 'declined':
        return <><span className={strong}>{who(last.actorId)}</span> declined <span className={strong}>{requester}</span>’s request for {dataset}</>
      case 'withdrawn':
        return <><span className={strong}>{requester}</span> withdrew the request for {dataset}</>
      case 'revoked':
        return <><span className={strong}>{who(last.actorId)}</span> revoked <span className={strong}>{requester}</span>’s access to {dataset}</>
    }
  }
  switch (request.status) {
    case 'waiting':
      return <>You requested access to {dataset}</>
    case 'approved':
      return request.direct ? <><span className={strong}>{who(last.actorId)}</span> gave you access to {dataset}</> : <>Your access to {dataset} was approved</>
    case 'declined':
      return <>Your request for {dataset} was declined</>
    case 'withdrawn':
      return <>You withdrew your request for {dataset}</>
    case 'revoked':
      return <>Your access to {dataset} was revoked</>
  }
}

function Avatar({ item }: { item: NotificationItem }) {
  const { persona } = useNotifications()
  if (item.kind === 'update' || !item.request) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-subdued text-text-subdued" aria-hidden="true">
        <Users className="size-4" />
      </span>
    )
  }
  const last = item.request.history[item.request.history.length - 1]
  const personId = item.direction === 'incoming' ? item.request.requesterId : item.request.history.length > 1 || item.request.direct ? last.actorId : persona.id
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground" aria-hidden="true">
      {getPerson(personId).initials}
    </span>
  )
}

function NotificationRow({ item, now, density = 'page', highlighted = false, onOpen }: NotificationRowProps) {
  const actions = useRequestActions()
  const sentence = useSentence(item)
  const request = item.request
  const incoming = item.direction === 'incoming'
  const outgoing = item.direction === 'outgoing'
  const compact = density === 'compact'
  const last = request?.history[request.history.length - 1]
  const decidedBy = request && request.status !== 'waiting' && last ? last : undefined

  return (
    <li
      data-notification-id={item.id}
      className={cn(
        'relative flex gap-3 border-b border-border-default px-4 py-3 last:border-b-0',
        item.unread && 'bg-surface-subdued/60',
        highlighted && 'animate-pulse bg-surface-warning/10',
      )}
    >
      <span
        className={cn('absolute left-1.5 top-[1.4rem] size-2 rounded-full', item.unread ? 'bg-action-primary-default' : 'bg-transparent')}
        aria-hidden="true"
      />
      <Avatar item={item} />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="block w-full rounded-sm text-left text-sm text-text-subdued outline-none hover:text-text-default focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          {item.unread && <span className="sr-only">Unread: </span>}
          {sentence}
        </button>

        {request?.reason && request.history[0]?.action === 'requested' && (
          <p className="mt-1 line-clamp-2 text-xs italic text-text-subdued">“{request.reason}”</p>
        )}
        {decidedBy?.reason && request?.status !== 'withdrawn' && (
          <p className="mt-1 line-clamp-2 text-xs italic text-text-subdued">Reason: “{decidedBy.reason}”</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-subdued">
          <Badge variant="outline" className="gap-1">
            {item.context}
          </Badge>
          {request && <StatusChip status={request.status} />}
          <time dateTime={new Date(item.at).toISOString()} title={fullDateTime(item.at)}>
            {timeAgo(item.at, now)}
          </time>
          {request && !compact && (
            <button
              type="button"
              onClick={() => actions.openHistory(request)}
              className="inline-flex items-center gap-1 rounded-sm font-medium text-text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <History className="size-3.5" aria-hidden="true" />
              View history
            </button>
          )}
        </div>

        {request && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {incoming && request.status === 'waiting' && (
              <>
                <Button type="button" size="sm" onClick={() => actions.approve(request)}>
                  Approve
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => actions.decline(request)}>
                  Decline
                </Button>
              </>
            )}
            {incoming && request.status === 'approved' && requestKindOf(request) === 'access' && (
              <Button type="button" size="sm" variant="outline" onClick={() => actions.revoke(request)}>
                Revoke access
              </Button>
            )}
            {incoming && decidedBy && request.status !== 'withdrawn' && request.status !== 'waiting' && (
              <ResultLine request={request} />
            )}
            {outgoing && request.status === 'waiting' && (
              <Button type="button" size="sm" variant="outline" onClick={() => actions.withdraw(request)}>
                Withdraw
              </Button>
            )}
            {outgoing && request.status !== 'waiting' && request.status !== 'approved' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => (requestKindOf(request) === 'submission' && request.collaborativeId ? actions.openPicker(request.collaborativeId, 'submit') : actions.openRequestAccess(request.itemId))}
              >
                {requestKindOf(request) === 'submission' ? (
                  'Submit again'
                ) : (
                  <>
                    <Lock className="size-3.5" aria-hidden="true" />
                    Request access again
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

/** Once someone has decided, the buttons give way to who did, so a second admin sees it is already handled. */
function ResultLine({ request }: { request: AccessRequest }) {
  const { persona } = useNotifications()
  const last = request.history[request.history.length - 1]
  const by = last.actorId === persona.id ? 'you' : getPerson(last.actorId).name
  const outcome = request.status.charAt(0).toUpperCase() + request.status.slice(1)
  return <span className="text-xs text-text-subdued">{outcome} by {by}</span>
}

export { NotificationRow }
