import * as React from 'react'

import { NotificationRow } from '@/components/notifications/NotificationRow'
import { PlaygroundHubLink } from '@/pages/playground/PlaygroundHubLink'
import type { AccessRequest, EventType, HistoryEntry, NotificationEvent, NotificationItem, RequestStatus } from '@/types/notifications'

/** Every kind of notification card, drawn by the real `NotificationRow` from sample data: the full card of the Notifications & Requests
 *  page beside the compact card of the bell. The samples are inert, so nothing here changes the inbox or any record. */

const HOUR = 3_600_000
const noop = () => {}

type Direction = 'incoming' | 'outgoing'

interface Sample {
  /** What the card is for, in a few words. */
  label: string
  /** Who receives it, from the notification policy. */
  audience: string
  item: NotificationItem
  /** The event type, or the request kind and status, shown as the card's technical name. */
  code: string
}

interface Group {
  id: string
  title: string
  description: string
  samples: Sample[]
}

function history(requesterId: string, ago: number, actions: { action: HistoryEntry['action']; actorId: string; reason?: string; ago: number }[]): HistoryEntry[] {
  return [{ id: 'h-0', action: 'requested', actorId: requesterId, at: ago, reason: undefined }, ...actions.map((a, i) => ({ id: `h-${i + 1}`, action: a.action, actorId: a.actorId, reason: a.reason, at: ago + a.ago }))]
}

function requestItem(
  now: number,
  options: {
    key: string
    kind: 'access' | 'submission'
    direction: Direction
    status: RequestStatus
    requesterId: string
    deciderId?: string
    direct?: boolean
    reason?: string
    declineReason?: string
    unread?: boolean
    context: string
  },
): NotificationItem {
  const itemId = options.kind === 'access' ? 'ds-1' : 'ds-2'
  const created = now - 5 * HOUR
  const decided = options.status !== 'waiting' && options.status !== 'withdrawn'
  const actions: Parameters<typeof history>[2] =
    options.status === 'waiting'
      ? []
      : options.status === 'withdrawn'
        ? [{ action: 'withdrawn', actorId: options.requesterId, ago: HOUR }]
        : [{ action: options.status === 'declined' ? 'declined' : options.status === 'revoked' ? 'approved' : 'approved', actorId: options.deciderId ?? 'anil', reason: options.declineReason, ago: HOUR }]
  if (options.status === 'revoked') actions.push({ action: 'revoked', actorId: options.deciderId ?? 'anil', ago: 2 * HOUR })
  const request: AccessRequest = {
    id: `sample-${options.key}`,
    kind: options.kind,
    itemId,
    itemKind: 'dataset',
    collaborativeId: options.kind === 'submission' ? 'collaborative-1' : undefined,
    requesterId: options.requesterId,
    reason: options.reason,
    status: options.status,
    direct: options.direct,
    createdAt: created,
    history: history(options.requesterId, created, actions),
  }
  return {
    id: `sample-${options.key}`,
    kind: 'request',
    tab: options.status === 'waiting' ? 'pending' : decided && options.status === 'approved' ? 'approved' : 'closed',
    direction: options.direction,
    request,
    at: now - (options.status === 'waiting' ? 2 * HOUR : HOUR),
    unread: options.unread ?? options.status === 'waiting',
    eventIds: [],
    context: options.context,
    needsAction: options.direction === 'incoming' && options.status === 'waiting',
  }
}

function updateItem(now: number, type: EventType, title: string, detail: string, options: { context: string; href?: string; unread?: boolean; ago?: number }): NotificationItem {
  const event: NotificationEvent = { id: `sample-${type}`, type, actorId: 'system', at: now - (options.ago ?? 3 * HOUR), title, detail, href: options.href }
  return { id: `sample-${type}`, kind: 'update', tab: 'updates', event, at: event.at, unread: options.unread ?? true, eventIds: [event.id], context: options.context, needsAction: false }
}

function buildGroups(now: number): Group[] {
  const access = (key: string, label: string, audience: string, o: Omit<Parameters<typeof requestItem>[1], 'key' | 'kind'>): Sample => ({
    label,
    audience,
    code: `access · ${o.direction} · ${o.status}${o.direct ? ' · direct' : ''}`,
    item: requestItem(now, { ...o, key, kind: 'access' }),
  })
  const submission = (key: string, label: string, audience: string, o: Omit<Parameters<typeof requestItem>[1], 'key' | 'kind'>): Sample => ({
    label,
    audience,
    code: `submission · ${o.direction} · ${o.status}`,
    item: requestItem(now, { ...o, key, kind: 'submission' }),
  })
  const update = (type: EventType, label: string, audience: string, title: string, detail: string, context: string, href?: string, unread = true): Sample => ({
    label,
    audience,
    code: type,
    item: updateItem(now, type, title, detail, { context, href, unread }),
  })

  const CDL = 'CivicDataLab · Admin'
  const WHO = 'World Health Organization · Editor'
  const UNICEF = 'UNICEF · Evaluator'
  const OWNERS = 'The dataset’s owner and the owning organisation’s Admins and Editors'

  return [
    {
      id: 'access',
      title: 'Access requests',
      description: 'Someone asks to open a restricted dataset. The owner side decides; the person can withdraw or ask again. Buttons depend on direction and status.',
      samples: [
        access('a1', 'Needs a decision', OWNERS, { direction: 'incoming', status: 'waiting', requesterId: 'priya', reason: 'We would like to benchmark our grievance assistant on this.', context: CDL }),
        access('a2', 'Waiting on the owner', 'The person who asked', { direction: 'outgoing', status: 'waiting', requesterId: 'john', context: 'Personal' }),
        access('a3', 'Approved (owner view)', OWNERS, { direction: 'incoming', status: 'approved', requesterId: 'priya', deciderId: 'anil', unread: false, context: CDL }),
        access('a4', 'Approved (requester view)', 'The person who asked', { direction: 'outgoing', status: 'approved', requesterId: 'john', deciderId: 'anil', context: 'Personal' }),
        access('a5', 'Access given directly', 'The person given access', { direction: 'outgoing', status: 'approved', requesterId: 'john', deciderId: 'anil', direct: true, context: 'Personal' }),
        access('a6', 'Declined with a reason', 'The person who asked', { direction: 'outgoing', status: 'declined', requesterId: 'john', deciderId: 'anil', declineReason: 'This dataset is limited to partner organisations.', context: 'Personal' }),
        access('a7', 'Withdrawn by the requester', OWNERS, { direction: 'incoming', status: 'withdrawn', requesterId: 'marcus', unread: false, context: CDL }),
        access('a8', 'Access revoked (owner view)', OWNERS, { direction: 'incoming', status: 'revoked', requesterId: 'priya', deciderId: 'anil', unread: false, context: CDL }),
        access('a9', 'Access revoked (requester view)', 'The person who lost access', { direction: 'outgoing', status: 'revoked', requesterId: 'john', deciderId: 'anil', context: 'Personal' }),
      ],
    },
    {
      id: 'submission',
      title: 'Collaborative submissions',
      description: 'Someone offers an item to a collaborative. Collaborative managers decide; the contributor can withdraw or submit again.',
      samples: [
        submission('s1', 'New submission needs a decision', 'The collaborative’s managers', { direction: 'incoming', status: 'waiting', requesterId: 'priya', context: CDL }),
        submission('s2', 'Your submission is waiting', 'The contributor (confirmation)', { direction: 'outgoing', status: 'waiting', requesterId: 'john', context: 'Personal' }),
        submission('s3', 'Approved (manager view)', 'The collaborative’s other managers', { direction: 'incoming', status: 'approved', requesterId: 'priya', deciderId: 'rahul', unread: false, context: CDL }),
        submission('s4', 'Approved (contributor view)', 'The contributor', { direction: 'outgoing', status: 'approved', requesterId: 'john', deciderId: 'anil', context: 'Personal' }),
        submission('s5', 'Declined with a reason', 'The contributor', { direction: 'outgoing', status: 'declined', requesterId: 'john', deciderId: 'anil', declineReason: 'It does not fit this collaborative’s scope yet.', context: 'Personal' }),
        submission('s6', 'Withdrawn by the contributor', 'The collaborative’s managers', { direction: 'incoming', status: 'withdrawn', requesterId: 'marcus', unread: false, context: CDL }),
      ],
    },
    {
      id: 'organisation',
      title: 'Organisation and membership',
      description: 'System notices. Only the affected person and the responsible Admins are told; never every member of the organisation.',
      samples: [
        update('update.invitation-received', 'Invitation to join an organisation', 'The invited person', 'Invitation · World Health Organization', 'Anil Rao invited you to join World Health Organization as an Editor.', 'Personal', '/organisations/org-workspace-2'),
        update('update.invitation-accepted', 'Invitation accepted', 'The organisation’s Admins', 'Member joined · CivicDataLab', 'Sana Khan accepted the invitation and joined CivicDataLab as an Evaluator.', CDL, '/organisations/org-workspace-1/members'),
        update('update.invitation-declined', 'Invitation declined', 'The organisation’s Admins', 'Invitation declined · CivicDataLab', 'Meera Das declined the invitation to join CivicDataLab.', CDL, '/organisations/org-workspace-1/members'),
        update('update.invitation-claimed', 'Invitation link claimed', 'The organisation’s Admins', 'Invitation link claimed · CivicDataLab', 'Dev Malhotra claimed the invitation link and is waiting for you to confirm the role.', CDL, '/organisations/org-workspace-1/members'),
        update('update.member-added', 'Member added', 'The new member and the other Admins', 'Added to CivicDataLab', 'Anil Rao added you to CivicDataLab as an Editor.', 'CivicDataLab · Editor', '/organisations/org-workspace-1'),
        update('update.role-changed', 'Role changed', 'The person and the other Admins', 'Your role changed · CivicDataLab', 'Anil Rao changed your role from Editor to Admin.', CDL, '/organisations/org-workspace-1'),
        update('update.member-removed', 'Member removed', 'The person and the other Admins (no link: the page is no longer open to them)', 'Removed from CivicDataLab', 'Anil Rao removed you from CivicDataLab. You no longer have access to its workspace.', 'Personal'),
      ],
    },
    {
      id: 'evaluation',
      title: 'Evaluator assignments',
      description: 'Evaluators hear about the records they were assigned, and only those. Admins hear when an assignment is made or withdrawn.',
      samples: [
        update('update.evaluation-assigned', 'New assignment', 'The Evaluator, and the other Admins', 'New evaluation assignment · UNICEF', 'An admin assigned 2 published records to you: State-wise Education Infrastructure and Open Data Licensing 101.', UNICEF, '/organisations/org-workspace-5/datasets'),
        update('update.evaluation-revoked', 'Assignment ended', 'The Evaluator (no link), and the Admins when an admin withdrew it', 'Evaluation access ended · UNICEF', 'A record assigned to you was unpublished, so its assignment ended. If it is published again, ask an Admin to assign it.', UNICEF),
      ],
    },
    {
      id: 'content',
      title: 'Content lifecycle',
      description: 'Published, updated, unpublished or deleted content in an organisation. Drafts and minor saves send nothing. Evaluators are told only about content assigned to them.',
      samples: [
        update('update.content-published', 'Published or updated', 'The owning organisation’s Admins and Editors; an assigned Evaluator for updates', 'Urban Water Supply and Coverage Indicators · World Health Organization', 'Sasha Iyer published this dataset. It is now live on CivicDataSpace.', WHO, '/explore/datasets/ds-5'),
        update('update.content-unpublished', 'Unpublished', 'The owning organisation’s Admins and Editors', 'Flood Risk Forecaster · CivicDataLab', 'Anil Rao unpublished this AI model. It is no longer visible to the public.', CDL, '/organisations/org-workspace-1/ai-models'),
        update('update.content-deleted', 'Deleted', 'The owning organisation’s Admins and Editors', 'Open Data Licensing 101 · CivicDataLab', 'Rahul Verma deleted this publication.', CDL),
      ],
    },
    {
      id: 'collaborative',
      title: 'Collaboratives',
      description: 'Followers, partners, contributors and managers. Restricted content is told only to people who can open it, and a person with several roles is told once.',
      samples: [
        update('update.item-added', 'Your item was added', 'The item’s owner side', 'Gender and Education Equity Data Collaborative', 'Priya Nair added your dataset National Economic Indicators.', 'Personal', '/explore/collaboratives/collaborative-1'),
        update('update.collaborative-content', 'New public content', 'Managers, the contributor, followers and partners', 'Gender and Education Equity Data Collaborative', 'Sasha Iyer added State-wise Education Infrastructure.', 'Personal', '/explore/collaboratives/collaborative-1'),
        update('update.collaborative-removed', 'Item removed', 'Managers, the contributor, eligible followers and partners', 'Gender and Education Equity Data Collaborative', 'Maternal Health Service Utilisation Indicators was taken out of this collaborative.', 'Personal', '/explore/collaboratives/collaborative-1'),
        update('update.partner-added', 'Partner added', 'The collaborative’s managers and the partner', 'Gender and Education Equity Data Collaborative', 'UNICEF is now a partner of this collaborative.', CDL, '/explore/collaboratives/collaborative-1'),
        update('update.collaborative-closed', 'Closed or archived', 'Managers, contributors, followers and partners', 'Gender and Education Equity Data Collaborative', 'Anil Rao unpublished this collaborative. It is no longer visible to the public.', 'Personal'),
        update('update.digest', 'Earlier follower summary (history only)', 'Kept so older notices still read; new follower notices arrive one by one', 'Gender and Education Equity Data Collaborative', '2 new items (1 restricted) and 1 new partner', 'Personal', '/explore/collaboratives/collaborative-1', false),
      ],
    },
    {
      id: 'platform',
      title: 'Account and platform',
      description: 'Notices that belong to no organisation. The welcome email is the only email the platform sends; everything else stays in the app.',
      samples: [
        update('update.account-created', 'Welcome', 'The person who just registered', 'Welcome to CivicDataSpace', 'Your account is ready. You can create content, follow collaboratives and join organisations.', 'Personal', '/'),
        update('update.announcement', 'Platform announcement or maintenance', 'Every account', 'Scheduled maintenance', 'CivicDataSpace will be read-only on Sunday from 02:00 to 03:00 IST.', 'Platform', undefined, false),
      ],
    },
  ]
}

/** The rows are samples, so they are inert: no button, link or focus does anything. */
function Inert({ children }: { children: React.ReactNode }) {
  return <div {...({ inert: true } as Record<string, unknown>)}>{children}</div>
}

function NotificationCardsPlayground() {
  const [now] = React.useState(() => Date.now())
  const groups = React.useMemo(() => buildGroups(now), [now])
  const [read, setRead] = React.useState(false)
  const total = groups.reduce((n, g) => n + g.samples.length, 0)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-12">
      <PlaygroundHubLink />
      <header className="flex flex-col gap-2">
        <h1 className="type-heading-1 text-text-brand">Notification cards</h1>
        <p className="max-w-3xl text-sm text-text-default">
          Every kind of notification the platform shows, drawn by the real card components from sample data: the full card on the Notifications &amp; Requests page on
          the left, the compact card in the bell on the right. {total} samples in {groups.length} groups. The cards are samples only, so their buttons and links do nothing.
        </p>
        <label className="mt-1 flex w-fit items-center gap-2 text-sm text-text-default">
          <input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} className="size-4" />
          Show every card as already read
        </label>
        <nav aria-label="Groups" className="mt-2 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-subdued hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
              {g.title} ({g.samples.length})
            </a>
          ))}
        </nav>
      </header>

      {groups.map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="flex scroll-mt-24 flex-col gap-4">
          <div>
            <h2 id={`${group.id}-title`} className="type-heading-2 text-text-brand">
              {group.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-text-subdued">{group.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <p className="hidden type-eyebrow text-text-subdued lg:block">Notifications page</p>
            <p className="hidden type-eyebrow text-text-subdued lg:block">Bell</p>
            {group.samples.map((sample) => {
              const item = read ? { ...sample.item, unread: false } : sample.item
              return (
                <React.Fragment key={sample.code + sample.label}>
                  <div className="col-span-full flex flex-col gap-0.5 border-t border-border-default pt-3">
                    <p className="text-sm font-semibold text-text-default">{sample.label}</p>
                    <p className="text-xs text-text-subdued">
                      <code className="rounded bg-surface-subdued px-1 py-0.5">{sample.code}</code> · Sent to: {sample.audience}
                    </p>
                  </div>
                  <Inert>
                    <ul>
                      <NotificationRow item={item} now={now} density="page" onOpen={noop} />
                    </ul>
                  </Inert>
                  <Inert>
                    <ul className="max-w-sm">
                      <NotificationRow item={item} now={now} density="compact" onOpen={noop} />
                    </ul>
                  </Inert>
                </React.Fragment>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export { NotificationCardsPlayground }
