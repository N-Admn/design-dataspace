import * as React from 'react'
import { Building2, History, Lock, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/notifications/StatusChip'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { fullDateTime, requestKindOf, timeAgo } from '@/lib/notification-model'
import { getPerson } from '@/lib/notification-personas'
import { cn } from '@/lib/utils'
import { organisationRoleLabel } from '@/types/organisation-workspace'
import type { AccessRequest, NotificationItem } from '@/types/notifications'

interface NotificationRowProps {
  item: NotificationItem
  now: number
  /** `compact` is the bell panel's minimal row (a request or an update variant); `page` is the full card. */
  density?: 'compact' | 'page'
  /** Row was just reached from a link or just arrived: flash it once. */
  highlighted?: boolean
  onOpen: (item: NotificationItem) => void
}

const strong = 'font-semibold text-text-default'

/** The title of a dataset, use case or collaborative inside a sentence: a link to its public page, in a new tab so the inbox stays
 *  where it is. Following it counts as reading the row. */
function Named({ href, onVisit, children }: { href: string; onVisit: () => void; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onVisit}
      className="rounded-sm font-medium text-text-default underline decoration-border-default underline-offset-2 outline-none hover:text-text-brand hover:decoration-current focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

const itemHref = (kind: string | undefined, id: string) => (kind === 'use-case' ? `/explore/use-cases/${id}` : `/explore/datasets/${id}`)

/** The one sentence a row reads as. It is derived from the request's current status, so every person sees the same outcome,
 *  worded from their side. */
function useSentence(item: NotificationItem, onVisit: () => void): React.ReactNode {
  const { persona } = useNotifications()
  const { datasetName, subjectName, collaborativeName } = useRequestActions()

  if (item.kind === 'update' && item.event) {
    return (
      <>
        {item.event.href ? <Named href={item.event.href} onVisit={onVisit}>{item.event.title}</Named> : <span className={strong}>{item.event.title}</span>} · {item.event.detail}
      </>
    )
  }
  const request = item.request as AccessRequest
  const dataset = <Named href={itemHref('dataset', request.itemId)} onVisit={onVisit}>{datasetName(request.itemId)}</Named>
  const last = request.history[request.history.length - 1]
  const who = (id: string) => (id === persona.id ? 'You' : getPerson(id).name)
  const requester = who(request.requesterId)

  if (requestKindOf(request) === 'submission') {
    const thing = <Named href={itemHref(request.itemKind, request.itemId)} onVisit={onVisit}>{subjectName(request)}</Named>
    const collab = <Named href={`/explore/collaboratives/${request.collaborativeId}`} onVisit={onVisit}>{collaborativeName(request.collaborativeId ?? '')}</Named>
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

const quietLink =
  'inline-flex min-h-[24px] items-center rounded-sm px-1 text-xs font-medium text-text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus'

/** The answer to a direct invitation to an organisation. While the invitation is pending the invitee can accept or decline; afterwards the
 *  notice shows how it ended. The status is read from the invitation itself, so a revoke or an answer made anywhere is shown at once. */
function InvitationActions({ item, size = 'sm' }: { item: NotificationItem; size?: 'xs' | 'sm' }) {
  const { persona } = useNotifications()
  const { organisationWorkspaces, respondToInvitation } = useAppData()
  const toast = useToast()
  const event = item.event
  if (event?.type !== 'update.invitation-received' || !event.invitationId || !event.orgId) return null
  const organisation = organisationWorkspaces.find((o) => o.id === event.orgId)
  const invitation = organisation?.invitations.find((i) => i.id === event.invitationId)
  if (!organisation || !invitation) return null

  const respond = (response: 'accepted' | 'declined') => {
    const result = respondToInvitation(organisation.id, invitation.id, response, { personId: invitation.personId ?? persona.id, name: persona.name, email: persona.email })
    if (!result.ok) {
      toast({ title: 'Could not answer this invitation', description: result.message, variant: 'error' })
      return
    }
    toast(
      response === 'accepted'
        ? { title: `You joined ${organisation.metadata.name}`, description: `You are now an ${organisationRoleLabel(invitation.role)} there.`, variant: 'success' }
        : { title: 'Invitation declined', description: `You did not join ${organisation.metadata.name}.` },
    )
  }

  if (invitation.status !== 'pending') {
    const label = { accepted: 'Accepted', declined: 'Declined', revoked: 'Withdrawn by the organisation' }[invitation.status]
    return <Badge variant="secondary">{label}</Badge>
  }
  return (
    <>
      <Button type="button" size={size} onClick={() => respond('accepted')}>
        Accept
      </Button>
      <Button type="button" size={size} variant="outline" onClick={() => respond('declined')}>
        Decline
      </Button>
    </>
  )
}

/** The full card for the Notifications & Requests page, a standalone bordered card: the sentence (and any reason) with its date on
 *  the right, then a divider, then the organisation and status on the left (information only) and the history link and
 *  lifecycle actions on the right (interactive only). */
function NotificationCard({ item, now, highlighted = false }: NotificationRowProps) {
  const actions = useRequestActions()
  const { markItemRead } = useNotifications()
  const sentence = useSentence(item, () => markItemRead(item))
  const request = item.request
  const last = request?.history[request.history.length - 1]
  const decidedBy = request && request.status !== 'waiting' && last ? last : undefined

  return (
    <li
      data-notification-id={item.id}
      className={cn(
        'relative rounded-lg border border-border-default bg-surface-default py-3 pl-6 pr-4',
        item.unread && 'bg-surface-subdued/60',
        highlighted && 'bg-surface-warning/10 motion-safe:animate-pulse',
      )}
    >
      <span
        className={cn('absolute left-2.5 top-[1.15rem] size-2 rounded-full', item.unread ? 'bg-action-primary-default' : 'bg-transparent')}
        aria-hidden="true"
      />

      {/* Top: the sentence and any reason on the left, the date on the right. */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm leading-relaxed text-text-default">
            {item.unread && <span className="sr-only">Unread: </span>}
            {sentence}
          </p>
          {request?.reason && request.history[0]?.action === 'requested' && (
            <p className="mt-1 line-clamp-2 text-xs italic text-text-subdued">“{request.reason}”</p>
          )}
          {decidedBy?.reason && request?.status !== 'withdrawn' && (
            <p className="mt-1 line-clamp-2 text-xs text-text-subdued">
              <span className="font-medium not-italic">Reason:</span> <span className="italic">“{decidedBy.reason}”</span>
            </p>
          )}
        </div>
        <time className="mt-0.5 shrink-0 text-xs text-text-subdued" dateTime={new Date(item.at).toISOString()} title={fullDateTime(item.at)}>
          {timeAgo(item.at, now)}
        </time>
      </div>

      {/* Bottom: organisation and status on the left, actions on the right. Wraps into those two groups on narrow widths. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border-default pt-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-subdued">
          <span>{item.context}</span>
          {request && <StatusChip status={request.status} />}
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {request && (
            <button type="button" onClick={() => actions.openHistory(request)} className={quietLink}>
              <History className="mr-1 size-3.5" aria-hidden="true" />
              View history
            </button>
          )}
          {request && <RequestActionButtons item={item} />}
          <InvitationActions item={item} />
        </div>
      </div>
    </li>
  )
}

/** The lifecycle buttons for a request, derived from direction, status and kind. Shared by the page card and the bell so the
 *  rules live in one place; every button goes through `RequestActionsProvider`. Renders nothing when there is nothing to do. */
function RequestActionButtons({ item, size = 'sm' }: { item: NotificationItem; size?: 'xs' | 'sm' }) {
  const actions = useRequestActions()
  const request = item.request
  if (!request) return null
  const incoming = item.direction === 'incoming'
  const outgoing = item.direction === 'outgoing'
  return (
    <>
      {incoming && request.status === 'waiting' && (
        <>
          <Button type="button" size={size} onClick={() => actions.approve(request)}>
            Approve
          </Button>
          <Button type="button" size={size} variant="outline" onClick={() => actions.decline(request)}>
            Decline
          </Button>
        </>
      )}
      {incoming && request.status === 'approved' && requestKindOf(request) === 'access' && (
        <Button type="button" size={size} variant="outline" onClick={() => actions.revoke(request)}>
          Revoke access
        </Button>
      )}
      {outgoing && request.status === 'waiting' && (
        <Button type="button" size={size} variant="outline" onClick={() => actions.withdraw(request)}>
          Withdraw
        </Button>
      )}
      {outgoing && request.status !== 'waiting' && request.status !== 'approved' && (
        <Button
          type="button"
          size={size}
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
    </>
  )
}

/** The bell's card: each notification sits in its own bordered card with the unread dot, a subdued tint when unread and the
 *  arrival flash. Request and update rows share it. */
function BellRow({ item, highlighted = false, children }: { item: NotificationItem; highlighted?: boolean; children: React.ReactNode }) {
  return (
    <li
      data-notification-id={item.id}
      className={cn(
        'relative rounded-lg border border-border-default bg-surface-default py-3 pl-6 pr-4',
        item.unread && 'bg-surface-subdued/60',
        highlighted && 'bg-surface-warning/10 motion-safe:animate-pulse',
      )}
    >
      <span
        className={cn('absolute left-2.5 top-[1.15rem] size-2 rounded-full', item.unread ? 'bg-action-primary-default' : 'bg-transparent')}
        aria-hidden="true"
      />
      {children}
    </li>
  )
}

/** Which workspace a bell notification belongs to: the organisation's name, or "Personal". The context label reads "Org · Role", and
 *  the role is left for the page. */
function ContextTag({ item }: { item: NotificationItem }) {
  const personal = item.context === 'Personal'
  const Icon = personal ? User : Building2
  return (
    <Badge variant="outline" className="max-w-full gap-1 type-caption text-text-subdued">
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span className="truncate">{personal ? 'Personal' : item.context.split(' · ')[0]}</span>
    </Badge>
  )
}

/** The card's bottom line: whatever the person can do on the left, the time on the right. */
function BellFooter({ item, now, children }: { item: NotificationItem; now: number; children?: React.ReactNode }) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {children}
      <time className="ml-auto type-caption text-text-subdued" dateTime={new Date(item.at).toISOString()} title={fullDateTime(item.at)}>
        {timeAgo(item.at, now)}
      </time>
    </div>
  )
}

/** A request in the bell: the sentence, its status, then only the actions this person can take and the time. Reasons, the
 *  context badge, the avatar and who decided stay on the Notifications & Requests page and in the history. */
function RequestNotification({ item, now, highlighted, onOpen }: Omit<NotificationRowProps, 'density'>) {
  const { markItemRead } = useNotifications()
  const sentence = useSentence(item, () => markItemRead(item))
  const request = item.request as AccessRequest
  return (
    <BellRow item={item} highlighted={highlighted}>
      <p className="type-caption break-words leading-snug text-text-default">
        {item.unread && <span className="sr-only">Unread: </span>}
        {sentence}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 type-caption">
        <ContextTag item={item} />
        <StatusChip status={request.status} quiet />
        <button type="button" onClick={() => onOpen(item)} className={cn(quietLink, 'ml-auto')}>
          View details
        </button>
      </div>
      <BellFooter item={item} now={now}>
        <RequestActionButtons item={item} size="xs" />
      </BellFooter>
    </BellRow>
  )
}

/** An update in the bell: its title (a link when it has a page), its detail and its time. No status, no actions. */
function UpdateNotification({ item, now, highlighted }: Omit<NotificationRowProps, 'density' | 'onOpen'>) {
  const { markItemRead } = useNotifications()
  const event = item.event
  if (!event) return null
  return (
    <BellRow item={item} highlighted={highlighted}>
      <p className="type-caption break-words leading-snug text-text-default">
        {item.unread && <span className="sr-only">Unread: </span>}
        {event.href ? <Named href={event.href} onVisit={() => markItemRead(item)}>{event.title}</Named> : <span className={strong}>{event.title}</span>}
      </p>
      {event.detail && <p className="mt-1 break-words type-caption text-text-subdued">{event.detail}</p>}
      <div className="mt-1.5">
        <ContextTag item={item} />
      </div>
      <BellFooter item={item} now={now}>
        <InvitationActions item={item} size="xs" />
      </BellFooter>
    </BellRow>
  )
}

/** One row in the bell (`compact`) or on the page. The bell gets the two minimal variants; the page keeps the full card. */
function NotificationRow(props: NotificationRowProps) {
  if (props.density === 'compact') {
    return props.item.kind === 'update' ? <UpdateNotification {...props} /> : <RequestNotification {...props} />
  }
  return <NotificationCard {...props} />
}

export { NotificationRow }
