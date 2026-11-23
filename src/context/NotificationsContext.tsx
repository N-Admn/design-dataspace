import * as React from 'react'

import type {
  AccessRequest,
  EventType,
  HistoryAction,
  ItemKind,
  NotificationEvent,
  NotificationItem,
  NotificationState,
  OwnerContext,
  Persona,
} from '@/types/notifications'
import { useAppData } from '@/context/AppDataContext'
import {
  canDecide,
  canSubmit,
  CONTRIBUTABLE_KINDS,
  collaborativeAccess,
  collaborativeRole,
  countUnread,
  deriveItems,
  type InvitationNoticeSource,
  eventTypeFor,
  isRestricted,
  itemInCollaborative,
  managersOf,
  ownerOfDataset,
  ownerOfUseCase,
  requestKindOf,
} from '@/lib/notification-model'
import { subscribeActivity } from '@/lib/activity-events'
import { collaborativeAudience, collaborativeItemNotice, mayKnowAbout, noticesFor, type Notice, type PolicyContext } from '@/lib/notification-policy'
import { ACTIVE_PERSON_ID, ACTIVE_PERSONA, PERSONAS, getPerson, orgNameOf, type CollaborativeAccess } from '@/lib/notification-personas'
import { buildSeed } from '@/lib/notification-seed'

/** The prototype's notification store. Requests (access requests and collaborative submissions) and events are the source of
 *  truth; each person's inbox is derived from them, and read state is kept per person. State lives in localStorage and follows other
 *  open tabs through the `storage` event. The signed-in person is always John Doe. */

const STATE_KEY = 'civicdataspace:notifications:v2'

/** An inbox saved in this browser before John's organisation notices existed is given them once, with nothing else changed. */
function withRoleNotices(saved: NotificationState): NotificationState {
  const now = Date.now()
  const missing = buildSeed(now).events.filter((e) => e.id.startsWith('evt-role-') && !saved.events.some((s) => s.id === e.id))
  if (missing.length === 0) return saved
  const read = missing.filter((e) => now - e.at > 24 * 3600 * 1000).map((e) => e.id)
  return { ...saved, events: [...saved.events, ...missing], reads: { ...saved.reads, john: [...(saved.reads.john ?? []), ...read] } }
}

function loadState(): NotificationState {
  try {
    const raw = window.localStorage.getItem(STATE_KEY)
    if (raw) return withRoleNotices(JSON.parse(raw) as NotificationState)
  } catch {
    /* unreadable or unavailable: fall back to the seed */
  }
  return buildSeed(Date.now())
}


export type ActionResult =
  | { ok: true; request: AccessRequest }
  | { ok: false; reason: 'already-decided' | 'not-allowed' | 'ineligible' | 'exists' | 'under-review' | 'missing'; request?: AccessRequest; byId?: string }

export type DirectResult = { ok: true } | { ok: false; reason: 'not-allowed' | 'ineligible' | 'exists' | 'missing' }

interface NotificationsContextValue {
  persona: Persona
  items: NotificationItem[]
  unreadCount: number
  state: NotificationState
  /** Every action takes the person doing it, so the simulator can act as someone else. */
  requestAccess: (actorId: string, datasetId: string, reason?: string) => ActionResult
  withdraw: (actorId: string, requestId: string) => ActionResult
  decide: (actorId: string, requestId: string, decision: 'approved' | 'declined', reason?: string) => ActionResult
  revoke: (actorId: string, requestId: string, reason?: string) => ActionResult
  grant: (actorId: string, datasetId: string, targetId: string) => ActionResult
  /** Collaboratives: owners and partners add directly; everyone else submits and waits for the owner. */
  submitItem: (actorId: string, collaborativeId: string, itemKind: ItemKind, itemId: string) => ActionResult
  addItem: (actorId: string, collaborativeId: string, itemKind: ItemKind, itemId: string) => DirectResult
  removeItem: (actorId: string, collabItemId: string) => DirectResult
  follow: (actorId: string, collaborativeId: string) => void
  unfollow: (actorId: string, collaborativeId: string) => void
  /** Makes an organisation a partner and tells its admins. */
  addPartner: (actorId: string, collaborativeId: string, orgId: string) => DirectResult
  /** Sends each collaborative's followers one summary of what changed since the last one; returns how many went out. */
  /** An important platform announcement (maintenance, a service disruption): the one notice that goes to everyone. */
  announce: (title: string, detail: string, href?: string) => void
  /** Tells an organisation's Admins that someone claimed an invitation link. Once per invitation: asking again does nothing. */
  notifyInvitationClaimed: (notice: { invitationId: string; orgId: string; recipientIds: string[]; title: string; detail: string; href: string }) => void
  /** Rewords the notice already sent for an invitation (the claimant has since signed in). Never adds a second one. */
  updateInvitationClaimNotice: (invitationId: string, detail: string) => void
  markItemRead: (item: NotificationItem) => void
  markAllRead: () => void
  reset: () => void
  /** Names for copy: the item, and the collaborative. */
  itemName: (itemKind: ItemKind | undefined, itemId: string) => string
  collaborativeName: (collaborativeId: string) => string
  /** Who owns the collaborative, its partners (including ones added in the prototype) and whether it is published. */
  collaborativeInfo: (collaborativeId: string) => { access: CollaborativeAccess; published: boolean }
  /** Whether an item is already in a collaborative, whichever way it got there. */
  hasItem: (collaborativeId: string, itemId: string, itemKind: ItemKind) => boolean
  /** Who owns an item (a person, or an organisation), for credit on the public page. */
  itemOwner: (itemKind: ItemKind | undefined, itemId: string) => OwnerContext | null
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { datasets, useCases, collaboratives, organisationWorkspaces } = useAppData()
  const [state, setState] = React.useState<NotificationState>(loadState)
  // Actions read the latest state synchronously so two quick actions never see a stale request.
  const stateRef = React.useRef(state)
  stateRef.current = state
  const dataRef = React.useRef({ datasets, useCases, collaboratives })
  dataRef.current = { datasets, useCases, collaboratives }

  const commit = React.useCallback((next: NotificationState) => {
    stateRef.current = next
    setState(next)
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable: the prototype state lasts until reload */
    }
  }, [])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STATE_KEY && event.newValue) setState(JSON.parse(event.newValue) as NotificationState)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ------------------------------------------------------------ lookups

  const itemName = React.useCallback((itemKind: ItemKind | undefined, itemId: string) => {
    const { datasets: ds, useCases: ucs } = dataRef.current
    if (itemKind === 'use-case') return ucs.find((u) => u.id === itemId)?.form.metadata.title || 'this use case'
    return ds.find((d) => d.id === itemId)?.form.metadata.name || 'this dataset'
  }, [])

  const collaborativeName = React.useCallback(
    (collaborativeId: string) => dataRef.current.collaboratives.find((c) => c.id === collaborativeId)?.form.metadata.name || 'this collaborative',
    [],
  )

  const ownerOfItem = React.useCallback((itemKind: ItemKind | undefined, itemId: string): OwnerContext | null => {
    const { datasets: ds, useCases: ucs } = dataRef.current
    return itemKind === 'use-case' ? ownerOfUseCase(ucs.find((u) => u.id === itemId)) : ownerOfDataset(ds.find((d) => d.id === itemId))
  }, [])

  /** Whether an item is already in a collaborative: added through the flow, or connected by the owner in the editor. */
  /** Only a published dataset or use case can be put in a collaborative: the kind, that it exists, and that it is live. */
  const isContributable = (itemKind: ItemKind, itemId: string): boolean => {
    if (!CONTRIBUTABLE_KINDS.includes(itemKind)) return false
    const { datasets: ds, useCases: ucs } = dataRef.current
    const record = itemKind === 'use-case' ? ucs.find((u) => u.id === itemId) : ds.find((d) => d.id === itemId)
    return record?.status === 'published'
  }

  const hasItem = React.useCallback((collaborativeId: string, itemId: string, itemKind: ItemKind) => {
    if (itemInCollaborative(stateRef.current.collabItems, collaborativeId, itemId, itemKind)) return true
    const form = dataRef.current.collaboratives.find((c) => c.id === collaborativeId)?.publishedForm
    const connected = itemKind === 'dataset' ? form?.connections.datasets : form?.connections.useCases
    return Boolean(connected?.some((c) => c.id === itemId))
  }, [])

  const accessOfCollaborative = React.useCallback((collaborativeId: string) => {
    const record = dataRef.current.collaboratives.find((c) => c.id === collaborativeId)
    const base = collaborativeAccess(collaborativeId, record?.organisationId)
    const added = stateRef.current.partners[collaborativeId] ?? []
    return { access: { ...base, partnerOrgIds: [...base.partnerOrgIds, ...added] }, published: record?.status === 'published' }
  }, [])

  /** Who decides a request: the dataset's owner for access, the collaborative's owner for a submission. */
  const ownerOf = React.useCallback(
    (request: AccessRequest): OwnerContext | null =>
      requestKindOf(request) === 'submission' && request.collaborativeId
        ? accessOfCollaborative(request.collaborativeId).access.owner
        : ownerOfItem('dataset', request.itemId),
    [accessOfCollaborative, ownerOfItem],
  )

  const persona = ACTIVE_PERSONA
  const personaId = persona.id
  // Who belongs to which organisation, and every direct invitation, come from the organisation store, so a change there re-derives every
  // inbox row: an invitee's notice is the invitation itself, never a copy.
  const invitationSources = React.useMemo<InvitationNoticeSource[]>(
    () => organisationWorkspaces.flatMap((o) => o.invitations.map((invitation) => ({ invitation, organisationId: o.id, organisationName: o.metadata.name }))),
    [organisationWorkspaces],
  )
  // A notice about a restricted dataset is shown only while the reader can still open it: if their access ends, it disappears at once.
  const mayShow = React.useCallback(
    (event: NotificationEvent) => !event.restrictedDatasetId || mayKnowAbout(persona.id, datasets.find((d) => d.id === event.restrictedDatasetId), { requests: state.requests }),
    [persona.id, datasets, state.requests],
  )
  const items = React.useMemo(() => deriveItems(state, persona, ownerOf, invitationSources, mayShow), [state, persona, ownerOf, invitationSources, mayShow])
  const unreadCount = React.useMemo(() => countUnread(items), [items])

  // ------------------------------------------------------------ writes

  const findRequest = (id: string) => stateRef.current.requests.find((r) => r.id === id)

  /** One step in a request's life: updates the request, and writes the event that notifies the other side. */
  const record = React.useCallback(
    (request: AccessRequest, action: HistoryAction, actorId: string, reason?: string, status = request.status): AccessRequest => {
      const at = Date.now()
      const kind = requestKindOf(request)
      const updated: AccessRequest = { ...request, status, history: [...request.history, { id: nextId('his'), action, actorId, at, reason }] }
      const event: NotificationEvent = { id: nextId('evt'), type: eventTypeFor(kind, action), actorId, at, requestId: request.id }
      const current = stateRef.current
      const exists = current.requests.some((r) => r.id === request.id)
      commit({
        ...current,
        requests: exists ? current.requests.map((r) => (r.id === request.id ? updated : r)) : [...current.requests, updated],
        events: [...current.events, event],
      })
      return updated
    },
    [commit],
  )

  const pushUpdate = (type: EventType, actorId: string, recipientIds: string[], title: string, detail: string, href?: string) => {
    const recipients = [...new Set(recipientIds)].filter((id) => id !== actorId)
    if (recipients.length === 0) return
    const current = stateRef.current
    commit({
      ...current,
      events: [...current.events, { id: nextId('evt'), type, actorId, at: Date.now(), recipientIds: recipients, title, detail, href }],
    })
  }

  /** The facts the notification policy needs to decide who is eligible, read at the moment of the event. */
  const policyContext = (): PolicyContext => ({
    activePersonId: ACTIVE_PERSON_ID,
    datasets: dataRef.current.datasets,
    collaboratives: dataRef.current.collaboratives.map((c) => ({ id: c.id, organisationId: c.organisationId, name: c.form.metadata.name || 'this collaborative' })),
    follows: stateRef.current.follows,
    collabItems: stateRef.current.collabItems,
    partners: stateRef.current.partners,
    requests: stateRef.current.requests,
  })

  /** Writes a notice the policy produced. The same change is never told twice (`dedupeKey`), and nobody is named who the policy did not name. */
  const pushNotice = (notice: Notice) => {
    const current = stateRef.current
    if (current.events.some((e) => e.dedupeKey === notice.key)) return
    const recipients = [...new Set(notice.recipientIds)]
    if (recipients.length === 0) return
    commit({
      ...current,
      events: [
        ...current.events,
        { id: nextId('evt'), type: notice.type, actorId: 'system', at: Date.now(), recipientIds: recipients, title: notice.title, detail: notice.detail, href: notice.href, orgId: notice.orgId, dedupeKey: notice.key, restrictedDatasetId: notice.restrictedDatasetId, collaborativeId: notice.collaborativeId },
      ],
    })
  }

  // Platform events (content published or removed, membership, roles, evaluator access, a new account) arrive from the stores; the policy
  // decides who is eligible and each notice is written once.
  React.useEffect(
    () =>
      subscribeActivity((event) => {
        for (const notice of noticesFor(event, policyContext())) pushNotice(notice)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /** Puts an item in a collaborative, tells the item's owner (unless they did it themselves) and notes the change for followers. */
  const placeItem = (actorId: string, addedById: string, collaborativeId: string, itemKind: ItemKind, itemId: string, via: 'owner' | 'partner' | 'approved') => {
    const current = stateRef.current
    // Two people can submit the same item; once the first is approved the item is already there.
    if (hasItem(collaborativeId, itemId, itemKind)) return
    const at = Date.now()
    const dataset = itemKind === 'dataset' ? dataRef.current.datasets.find((d) => d.id === itemId) : undefined
    commit({
      ...current,
      collabItems: [...current.collabItems, { id: nextId('ci'), collaborativeId, itemKind, itemId, addedById, at, via }],
      changes: [...current.changes, { id: nextId('ch'), collaborativeId, kind: 'item-added', at, restricted: isRestricted(dataset) || undefined }],
    })
    const owner = ownerOfItem(itemKind, itemId)
    // The owner is told unless they were the one who added it, or the one who approved it.
    const recipients = owner ? managersOf(owner).filter((id) => id !== addedById) : []
    const addedBy = getPerson(addedById).name
    pushUpdate('update.item-added', actorId, recipients, collaborativeName(collaborativeId), `${addedBy} added your ${itemKind === 'use-case' ? 'use case' : 'dataset'} ${itemName(itemKind, itemId)}`, `/explore/collaboratives/${collaborativeId}`)
    // The collaborative's managers, followers and partners who are eligible hear about new content once. The item's owner was told above, and
    // when the item arrived through an approval the managers already know (they decided it, or were told of the decision).
    const ctx = policyContext()
    const audience = collaborativeAudience(collaborativeId, ctx)
    const told = [...recipients, ...(via === 'approved' ? audience.managers : [])]
    const notice = collaborativeItemNotice('added', collaborativeId, itemKind, itemId, itemName(itemKind, itemId), actorId, addedById, ctx, told, `collab-item:${collaborativeId}:${itemKind}:${itemId}:added:${at}`)
    if (notice) pushNotice(notice)
  }

  const requestAccess = React.useCallback<NotificationsContextValue['requestAccess']>(
    (actorId, datasetId, reason) => {
      const existing = stateRef.current.requests
        .filter((r) => requestKindOf(r) === 'access' && r.requesterId === actorId && r.itemId === datasetId)
        .sort((a, b) => b.createdAt - a.createdAt)[0]
      if (existing && (existing.status === 'waiting' || existing.status === 'approved')) return { ok: false, reason: 'exists', request: existing }
      const request: AccessRequest = { id: nextId('req'), kind: 'access', itemId: datasetId, itemKind: 'dataset', requesterId: actorId, reason: reason?.trim() || undefined, status: 'waiting', createdAt: Date.now(), history: [] }
      return { ok: true, request: record(request, 'requested', actorId, reason?.trim() || undefined, 'waiting') }
    },
    [record],
  )

  const withdraw = React.useCallback<NotificationsContextValue['withdraw']>(
    (actorId, requestId) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      if (request.requesterId !== actorId) return { ok: false, reason: 'not-allowed', request }
      if (request.status !== 'waiting') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      return { ok: true, request: record(request, 'withdrawn', actorId, undefined, 'withdrawn') }
    },
    [record],
  )

  const decide = React.useCallback<NotificationsContextValue['decide']>(
    (actorId, requestId, decision, reason) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      const owner = ownerOf(request)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed', request }
      // First decision wins: anyone arriving later sees who decided.
      if (request.status !== 'waiting') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      const updated = record(request, decision, actorId, reason?.trim() || undefined, decision)
      if (decision === 'approved' && requestKindOf(request) === 'submission' && request.collaborativeId && request.itemKind) {
        placeItem(actorId, request.requesterId, request.collaborativeId, request.itemKind, request.itemId, 'approved')
      }
      return { ok: true, request: updated }
    },
    [ownerOf, record],
  )

  const revoke = React.useCallback<NotificationsContextValue['revoke']>(
    (actorId, requestId, reason) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      const owner = ownerOf(request)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed', request }
      if (request.status !== 'approved') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      return { ok: true, request: record(request, 'revoked', actorId, reason?.trim() || undefined, 'revoked') }
    },
    [ownerOf, record],
  )

  const grant = React.useCallback<NotificationsContextValue['grant']>(
    (actorId, datasetId, targetId) => {
      const owner = ownerOfItem('dataset', datasetId)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed' }
      const request: AccessRequest = { id: nextId('req'), kind: 'access', itemId: datasetId, itemKind: 'dataset', requesterId: targetId, status: 'approved', direct: true, createdAt: Date.now(), history: [] }
      return { ok: true, request: record(request, 'granted', actorId, undefined, 'approved') }
    },
    [ownerOfItem, record],
  )

  const submitItem = React.useCallback<NotificationsContextValue['submitItem']>(
    (actorId, collaborativeId, itemKind, itemId) => {
      const { access, published } = accessOfCollaborative(collaborativeId)
      const current = stateRef.current
      if (!published || !canSubmit(actorId, access, published)) return { ok: false, reason: 'not-allowed' }
      if (!isContributable(itemKind, itemId)) return { ok: false, reason: 'ineligible' }
      if (hasItem(collaborativeId, itemId, itemKind)) return { ok: false, reason: 'exists' }
      // One pending submission per item, whoever sent it: a second one would only make the owner decide the same thing twice.
      const underReview = current.requests.find((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collaborativeId && r.itemId === itemId && r.itemKind === itemKind && r.status === 'waiting')
      if (underReview) return { ok: false, reason: 'under-review', request: underReview }
      const request: AccessRequest = { id: nextId('req'), kind: 'submission', itemId, itemKind, collaborativeId, requesterId: actorId, status: 'waiting', createdAt: Date.now(), history: [] }
      return { ok: true, request: record(request, 'requested', actorId, undefined, 'waiting') }
    },
    [accessOfCollaborative, record],
  )

  const addItem = React.useCallback<NotificationsContextValue['addItem']>(
    (actorId, collaborativeId, itemKind, itemId) => {
      const { access, published } = accessOfCollaborative(collaborativeId)
      const role = collaborativeRole(actorId, access, published)
      // Owner, editor and partner add directly, and only to a published collaborative (the Items page says so). Anyone else submits instead.
      if (role === 'none' || !published) return { ok: false, reason: 'not-allowed' }
      if (!isContributable(itemKind, itemId)) return { ok: false, reason: 'ineligible' }
      if (hasItem(collaborativeId, itemId, itemKind)) return { ok: false, reason: 'exists' }
      // `placeItem` records how it got there: the owner side (owner or editor) or a partner.
      placeItem(actorId, actorId, collaborativeId, itemKind, itemId, role === 'partner' ? 'partner' : 'owner')
      return { ok: true }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessOfCollaborative],
  )

  const removeItem = React.useCallback<NotificationsContextValue['removeItem']>(
    (actorId, collabItemId) => {
      const current = stateRef.current
      const target = current.collabItems.find((i) => i.id === collabItemId)
      if (!target) return { ok: false, reason: 'missing' }
      const { access, published } = accessOfCollaborative(target.collaborativeId)
      const owner = ownerOfItem(target.itemKind, target.itemId)
      // Whoever added it, the collaborative's governing owner (not an Editor or partner), or the item's own owner can take it out.
      const allowed = target.addedById === actorId || collaborativeRole(actorId, access, published) === 'owner' || (owner !== null && canDecide(actorId, owner))
      if (!allowed) return { ok: false, reason: 'not-allowed' }
      commit({ ...current, collabItems: current.collabItems.filter((i) => i.id !== collabItemId) })
      // Managers, the contributor, followers and partners who were eligible to know about the item are told it left.
      const notice = collaborativeItemNotice('removed', target.collaborativeId, target.itemKind, target.itemId, itemName(target.itemKind, target.itemId), actorId, target.addedById, policyContext(), [], `collab-item:${target.collaborativeId}:${target.itemKind}:${target.itemId}:removed:${collabItemId}`)
      if (notice) pushNotice(notice)
      return { ok: true }
    },
    [accessOfCollaborative, commit, ownerOfItem],
  )

  const follow = React.useCallback<NotificationsContextValue['follow']>(
    (actorId, collaborativeId) => {
      const current = stateRef.current
      const list = current.follows[collaborativeId] ?? []
      if (list.includes(actorId)) return
      commit({ ...current, follows: { ...current.follows, [collaborativeId]: [...list, actorId] } })
    },
    [commit],
  )

  const unfollow = React.useCallback<NotificationsContextValue['unfollow']>(
    (actorId, collaborativeId) => {
      const current = stateRef.current
      commit({ ...current, follows: { ...current.follows, [collaborativeId]: (current.follows[collaborativeId] ?? []).filter((id) => id !== actorId) } })
    },
    [commit],
  )

  const addPartner = React.useCallback<NotificationsContextValue['addPartner']>(
    (actorId, collaborativeId, orgId) => {
      const { access } = accessOfCollaborative(collaborativeId)
      if (access.owner.kind === 'personal' ? access.owner.personaId !== actorId : !canDecide(actorId, access.owner)) return { ok: false, reason: 'not-allowed' }
      if (access.partnerOrgIds.includes(orgId)) return { ok: false, reason: 'exists' }
      // The partner list lives in the collaborative's record in the real product; the prototype keeps additions in its own state.
      const current = stateRef.current
      commit({
        ...current,
        partners: { ...current.partners, [collaborativeId]: [...(current.partners[collaborativeId] ?? []), orgId] },
        changes: [...current.changes, { id: nextId('ch'), collaborativeId, kind: 'partner-added', at: Date.now() }],
      })
      // The partner organisation's managers are told what it can now do; the collaborative's own managers hear that a partner was added.
      const audience = collaborativeAudience(collaborativeId, policyContext())
      const partnerManagers = managersOf({ kind: 'org', orgId, orgName: orgNameOf(orgId) }).filter((id) => id !== actorId)
      const stamp = Date.now()
      pushNotice({ type: 'update.partner-added', recipientIds: partnerManagers, title: collaborativeName(collaborativeId), detail: `${orgNameOf(orgId)} was added as a partner. You can add items directly once it is published.`, href: `/explore/collaboratives/${collaborativeId}`, collaborativeId, key: `partner:${collaborativeId}:${orgId}:partner:${stamp}` })
      pushNotice({ type: 'update.partner-added', recipientIds: audience.managers.filter((id) => id !== actorId && !partnerManagers.includes(id)), title: collaborativeName(collaborativeId), detail: `${orgNameOf(orgId)} was added as a partner of this collaborative.`, href: `/explore/collaboratives/${collaborativeId}`, collaborativeId, key: `partner:${collaborativeId}:${orgId}:managers:${stamp}` })
      return { ok: true }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessOfCollaborative, commit, collaborativeName],
  )

  const announce = React.useCallback<NotificationsContextValue['announce']>(
    (title, detail, href) => pushNotice({ type: 'update.announcement', recipientIds: PERSONAS.map((p) => p.id), title, detail, href, key: `announcement:${Date.now()}:${title}` }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit],
  )

  const notifyInvitationClaimed = React.useCallback<NotificationsContextValue['notifyInvitationClaimed']>(
    (notice) => {
      const current = stateRef.current
      // One notice per invitation, however many times the link is opened, the page re-renders or signup is retried.
      if (current.events.some((e) => e.type === 'update.invitation-claimed' && e.invitationId === notice.invitationId)) return
      const recipients = [...new Set(notice.recipientIds)]
      if (recipients.length === 0) return
      commit({
        ...current,
        events: [
          ...current.events,
          { id: nextId('evt'), type: 'update.invitation-claimed', actorId: 'system', at: Date.now(), recipientIds: recipients, title: notice.title, detail: notice.detail, href: notice.href, invitationId: notice.invitationId, orgId: notice.orgId },
        ],
      })
    },
    [commit],
  )

  const updateInvitationClaimNotice = React.useCallback<NotificationsContextValue['updateInvitationClaimNotice']>(
    (invitationId, detail) => {
      const current = stateRef.current
      if (!current.events.some((e) => e.type === 'update.invitation-claimed' && e.invitationId === invitationId && e.detail !== detail)) return
      commit({ ...current, events: current.events.map((e) => (e.type === 'update.invitation-claimed' && e.invitationId === invitationId ? { ...e, detail } : e)) })
    },
    [commit],
  )

  const markIds = React.useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const current = stateRef.current
      const known = new Set(current.reads[personaId] ?? [])
      const fresh = ids.filter((id) => !known.has(id))
      if (fresh.length === 0) return
      commit({ ...current, reads: { ...current.reads, [personaId]: [...known, ...fresh] } })
    },
    [commit, personaId],
  )

  const markItemRead = React.useCallback((item: NotificationItem) => markIds(item.eventIds), [markIds])
  const markAllRead = React.useCallback(() => markIds(items.flatMap((i) => i.eventIds)), [items, markIds])

  const reset = React.useCallback(() => commit(buildSeed(Date.now())), [commit])

  const value = React.useMemo<NotificationsContextValue>(
    () => ({ persona, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, submitItem, addItem, removeItem, follow, unfollow, addPartner, announce, notifyInvitationClaimed, updateInvitationClaimNotice, markItemRead, markAllRead, reset, itemName, collaborativeName, collaborativeInfo: accessOfCollaborative, hasItem, itemOwner: ownerOfItem }),
    [persona, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, submitItem, addItem, removeItem, follow, unfollow, addPartner, announce, notifyInvitationClaimed, updateInvitationClaimNotice, markItemRead, markAllRead, reset, itemName, collaborativeName, accessOfCollaborative, hasItem, ownerOfItem],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

function useNotifications(): NotificationsContextValue {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}

export { NotificationsProvider, useNotifications }
