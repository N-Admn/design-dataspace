import * as React from 'react'
import { Link } from 'react-router-dom'
import { BellOff, History, ListChecks, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusChip } from '@/components/notifications/StatusChip'
import { NOTIFICATIONS_PATH, useRequestActions } from '@/components/notifications/RequestActions'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { useNow } from '@/hooks/use-now'
import { collaborativeRole, fullDateTime, hasAccess, isOwnerSide, isRestricted, latestRequestBy, ownerOfDataset, requestKindOf, timeAgo } from '@/lib/notification-model'
import { getPerson, orgNameOf, ownerName } from '@/lib/notification-personas'
import type { AccessRequest, CollaborativeItem, ItemKind } from '@/types/notifications'

export type FollowingAccessKey = 'following' | 'contributions' | 'managing' | 'access'

const VIA_LABEL = { owner: 'Added by the owner', partner: 'Added as a partner', approved: 'Approved by the owner' } as const

/** One thing the person has put forward, shown once: still waiting, declined, withdrawn, or in the collaborative now. */
interface Contribution {
  key: string
  itemKind: ItemKind | undefined
  itemId: string
  collaborativeId: string
  at: number
  /** `in` means it is part of the collaborative now; the rest are where a submission stands. */
  state: 'waiting' | 'declined' | 'withdrawn' | 'in' | 'approved'
  request?: AccessRequest
  via?: CollaborativeItem['via']
}
const EMPTY = 'rounded-lg border border-dashed border-border-default px-3 py-2.5 text-sm text-text-subdued'

function Outside({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-block min-h-[24px] min-w-0 break-words font-medium leading-[24px] text-text-default underline decoration-border-default underline-offset-2 hover:text-text-brand hover:decoration-current">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

const quietLink =
  'inline-flex min-h-[24px] items-center rounded-sm px-1 text-xs font-medium text-text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus'

/** A standalone card in the same layout as the Notifications & Requests feed: the title (and a line of detail) on the left and the
 *  time on the right, a divider, then context or status on the left (information only) and actions on the right (interactive only). */
function FeedCard({ title, detail, at, now, meta, actions }: { title: React.ReactNode; detail?: React.ReactNode; at?: number; now: number; meta: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <li className="rounded-lg border border-border-default bg-surface-default py-3 pl-4 pr-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="break-words text-sm leading-relaxed text-text-default">{title}</div>
          {detail && <p className="mt-1 break-words text-xs text-text-subdued">{detail}</p>}
        </div>
        {at !== undefined && (
          <time className="mt-0.5 shrink-0 text-xs text-text-subdued" dateTime={new Date(at).toISOString()} title={fullDateTime(at)}>
            {timeAgo(at, now)}
          </time>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border-default pt-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-subdued">{meta}</div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 empty:hidden">{actions}</div>
      </div>
    </li>
  )
}

const itemHref = (kind: ItemKind | undefined, id: string) => (kind === 'use-case' ? `/explore/use-cases/${id}` : `/explore/datasets/${id}`)

/** Everything the four sections (and the dashboard tiles above them) show, read from the same store as the bell and the public
 *  pages. Nothing here keeps its own copy. */
export function useFollowingAccess() {
  const { datasets, collaboratives } = useAppData()
  const { persona, state, collaborativeInfo } = useNotifications()

  // ---- Following
  const followed = collaboratives.filter((c) => (state.follows[c.id] ?? []).includes(persona.id) && c.status === 'published')
  const lastChange = (id: string) => state.changes.filter((c) => c.collaborativeId === id).sort((a, b) => b.at - a.at)[0]

  // ---- My Contributions: one card per item the person put forward. An approved submission becomes an item in the collaborative, so
  // it is shown once, as that item, with its submission kept for View history.
  const ownSubmissions = state.requests.filter((r) => requestKindOf(r) === 'submission' && r.requesterId === persona.id)
  const ownItems = state.collabItems.filter((i) => i.addedById === persona.id)
  const sameItem = (r: AccessRequest, i: CollaborativeItem) => r.collaborativeId === i.collaborativeId && r.itemId === i.itemId && (r.itemKind ?? 'dataset') === i.itemKind
  const contributions: Contribution[] = [
    ...ownItems.map((i): Contribution => ({
      key: i.id,
      itemKind: i.itemKind,
      itemId: i.itemId,
      collaborativeId: i.collaborativeId,
      at: i.at,
      state: 'in',
      via: i.via,
      request: i.via === 'approved' ? ownSubmissions.find((r) => r.status === 'approved' && sameItem(r, i)) : undefined,
    })),
    ...ownSubmissions
      .filter((r) => !(r.status === 'approved' && ownItems.some((i) => sameItem(r, i))))
      .map((r): Contribution => ({
        key: r.id,
        itemKind: r.itemKind,
        itemId: r.itemId,
        collaborativeId: r.collaborativeId ?? '',
        at: r.history[r.history.length - 1]?.at ?? r.createdAt,
        state: r.status === 'revoked' ? 'withdrawn' : r.status,
        request: r,
      })),
  ].sort((a, b) => b.at - a.at)
  const helpRun = collaboratives
    .filter((c) => c.status === 'published')
    .map((c) => {
      const { access, published } = collaborativeInfo(c.id)
      return { record: c, role: collaborativeRole(persona.id, access, published) }
    })
    .filter((x) => x.role !== 'none')

  // ---- Access: restricted datasets this person can open right now
  const accessRows = datasets
    .filter((d) => d.status === 'published' && isRestricted(d) && hasAccess(persona.id, d, state.requests))
    .map((d) => {
      const owner = ownerOfDataset(d)
      const request = latestRequestBy(state.requests, persona.id, d.id)
      const own = owner !== null && isOwnerSide(persona.id, owner)
      const last = request?.history[request.history.length - 1]
      return { dataset: d, owner, own, request, last }
    })
  const waitingAccess = state.requests.filter((r) => requestKindOf(r) === 'access' && r.requesterId === persona.id && r.status === 'waiting').length


  const counts: Record<FollowingAccessKey, number> = { following: followed.length, contributions: contributions.length, managing: helpRun.length, access: accessRows.length }
  // Small cues for the tiles: what is waiting on someone.
  const waitingSubmissions = ownSubmissions.filter((r) => r.status === 'waiting').length
  const waitingToApprove = helpRun.reduce((n, { record }) => n + state.requests.filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === record.id && r.status === 'waiting').length, 0)
  return { followed, lastChange, contributions, helpRun, accessRows, waitingAccess, counts, waitingSubmissions, waitingToApprove }
}

export type FollowingAccessData = ReturnType<typeof useFollowingAccess>

export function FollowingSection({ data }: { data: FollowingAccessData }) {
  const toast = useToast()
  const now = useNow()
  const { persona, state, unfollow, collaborativeName } = useNotifications()
  const { followed, lastChange } = data
  return (
    <>
      {followed.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You aren’t following any collaboratives"
          description="Follow a collaborative from its page to be notified when new public content is added."
          action={
            <Button asChild variant="outline">
              <Link to="/search?type=collaborative">Browse collaboratives</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Collaboratives you follow">
          {followed.map((c) => {
            const change = lastChange(c.id)
            const name = collaborativeName(c.id)
            const followers = state.follows[c.id]?.length ?? 0
            return (
              <FeedCard
                key={c.id}
                now={now}
                title={<Outside href={`/explore/collaboratives/${c.id}`}>{name}</Outside>}
                detail={`${followers} ${followers === 1 ? 'follower' : 'followers'} · ${change ? 'Last change' : 'No changes since you followed'}`}
                at={change?.at}
                meta={<span>Following</span>}
                actions={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Unfollow ${name}`}
                    onClick={() => {
                      unfollow(persona.id, c.id)
                      toast({ title: 'Unfollowed', description: `You will no longer get updates from ${name}.` })
                    }}
                  >
                    Unfollow
                  </Button>
                }
              />
            )
          })}
        </ul>
      )}
    </>
  )
}

export function ContributionsSection({ data }: { data: FollowingAccessData }) {
  const now = useNow()
  const actions = useRequestActions()
  const { collaborativeName, itemName } = useNotifications()
  const { contributions } = data
  return (
    <>
      {contributions.length === 0 ? (
        <p className={EMPTY}>You haven’t contributed anything yet. Use Submit an item on a collaborative’s page.</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Your contributions">
          {contributions.map((c) => {
            const r = c.request
            const reason = r?.history[r.history.length - 1]?.reason
            const detail =
              c.state === 'in' && c.via
                ? VIA_LABEL[c.via]
                : c.state === 'waiting'
                  ? 'Waiting for the collaborative’s owner to approve it'
                  : c.state === 'declined'
                    ? reason
                      ? <span className="italic">“{reason}”</span>
                      : 'Declined by the owner'
                    : c.state === 'withdrawn'
                      ? 'You withdrew it'
                      : undefined
            return (
              <FeedCard
                key={c.key}
                now={now}
                title={
                  <p className="flex min-w-0 flex-wrap items-center gap-x-2">
                    <Outside href={itemHref(c.itemKind, c.itemId)}>{itemName(c.itemKind, c.itemId)}</Outside>
                    <span className="text-text-subdued">{c.state === 'in' ? 'in' : 'to'}</span>
                    <Outside href={`/explore/collaboratives/${c.collaborativeId}`}>{collaborativeName(c.collaborativeId)}</Outside>
                  </p>
                }
                detail={detail}
                at={c.at}
                meta={c.state === 'in' ? <Badge variant="success">In the collaborative</Badge> : r ? <StatusChip status={r.status === 'revoked' ? 'withdrawn' : r.status} /> : null}
                actions={
                  r && (
                    <>
                      <button type="button" onClick={() => actions.openHistory(r)} className={quietLink}>
                        <History className="mr-1 size-3.5" aria-hidden="true" />
                        View history
                      </button>
                      {r.status === 'waiting' && (
                        <Button type="button" variant="outline" size="sm" onClick={() => actions.withdraw(r)}>
                          Withdraw
                        </Button>
                      )}
                      {(r.status === 'declined' || r.status === 'withdrawn') && r.collaborativeId && (
                        <Button type="button" variant="outline" size="sm" onClick={() => actions.openPicker(r.collaborativeId as string, 'submit')}>
                          Submit again
                        </Button>
                      )}
                    </>
                  )
                }
              />
            )
          })}
        </ul>
      )}
    </>
  )
}

export function ManagingSection({ data }: { data: FollowingAccessData }) {
  const now = useNow()
  const { state, collaborativeName } = useNotifications()
  const { helpRun } = data
  return (
    <>
      <ul className="flex flex-col gap-3" aria-label="Collaboratives you help run">
        {helpRun.map(({ record, role }) => {
          const waiting = state.requests.filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === record.id && r.status === 'waiting').length
          return (
            <FeedCard
              key={record.id}
              now={now}
              title={<Outside href={`/explore/collaboratives/${record.id}`}>{collaborativeName(record.id)}</Outside>}
              detail={`${waiting} waiting for approval`}
              meta={<Badge variant={role === 'owner' ? 'accent' : 'secondary'}>{role === 'owner' ? 'Owner' : 'Partner'}</Badge>}
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link to={`/dashboard/collaboratives/${record.id}/items`}>
                    <ListChecks className="size-4" aria-hidden="true" />
                    Manage items
                  </Link>
                </Button>
              }
            />
          )
        })}
      </ul>
    </>
  )
}

export function AccessSection({ data }: { data: FollowingAccessData }) {
  const now = useNow()
  const { accessRows, waitingAccess } = data
  return (
    <>
      {waitingAccess > 0 && (
        <p className="text-sm text-text-subdued">
          {waitingAccess} {waitingAccess === 1 ? 'request is' : 'requests are'} still waiting.{' '}
          <Link to={`${NOTIFICATIONS_PATH}?tab=pending`} className="font-medium text-text-brand underline-offset-2 hover:underline">
            See them in Notifications & Requests
          </Link>
        </p>
      )}
      {accessRows.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No restricted datasets yet"
          description="When an owner approves a request, or gives you access, the dataset shows up here so you can find it again."
        />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Restricted datasets you can open">
          {accessRows.map(({ dataset, owner, own, request, last }) => (
            <FeedCard
              key={dataset.id}
              now={now}
              title={<Outside href={`/explore/datasets/${dataset.id}`}>{dataset.form.metadata.name}</Outside>}
              detail={
                <>
                  {owner ? ownerName(owner) : ''} ·{' '}
                  {own ? (
                    owner?.kind === 'personal' ? 'Yours' : `Through ${owner ? orgNameOf(owner.orgId) : 'your organisation'}`
                  ) : request?.direct ? (
                    <>Given to you by {getPerson(last?.actorId ?? '').name}</>
                  ) : (
                    <>Approved by {getPerson(last?.actorId ?? '').name}</>
                  )}
                </>
              }
              at={!own && last ? last.at : undefined}
              meta={<Badge variant="success">You have access</Badge>}
              actions={
                <Button asChild variant="outline" size="sm">
                  <a href={`/explore/datasets/${dataset.id}`} target="_blank" rel="noreferrer">
                    Open dataset<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </>
  )
}
