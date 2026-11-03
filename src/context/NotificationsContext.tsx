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
  collaborativeAccess,
  collaborativeRole,
  countUnread,
  deriveItems,
  eventTypeFor,
  isRestricted,
  itemInCollaborative,
  managersOf,
  orgAdmins,
  ownerOfDataset,
  ownerOfUseCase,
  pendingDigests,
  requestKindOf,
} from '@/lib/notification-model'
import { DEFAULT_PERSONA_ID, getPerson, getPersona, orgNameOf, type CollaborativeAccess } from '@/lib/notification-personas'
import { buildSeed } from '@/lib/notification-seed'

/** The prototype's notification store. Requests (access requests and collaborative submissions) and events are the source of
 *  truth; each person's inbox is derived from them, and read state is kept per person. State lives in localStorage and follows other
 *  open tabs through the `storage` event. The active persona lives in sessionStorage, so two tabs can be two people. */

const STATE_KEY = 'civicdataspace:notifications:v2'
const PERSONA_KEY = 'civicdataspace:notifications:persona'

function loadState(): NotificationState {
  try {
    const raw = window.localStorage.getItem(STATE_KEY)
    if (raw) return JSON.parse(raw) as NotificationState
  } catch {
    /* unreadable or unavailable: fall back to the seed */
  }
  return buildSeed(Date.now())
}

function loadPersonaId(): string {
  try {
    return window.sessionStorage.getItem(PERSONA_KEY) ?? DEFAULT_PERSONA_ID
  } catch {
    return DEFAULT_PERSONA_ID
  }
}

export type ActionResult =
  | { ok: true; request: AccessRequest }
  | { ok: false; reason: 'already-decided' | 'not-allowed' | 'exists' | 'missing'; request?: AccessRequest; byId?: string }

export type DirectResult = { ok: true } | { ok: false; reason: 'not-allowed' | 'exists' | 'missing' }

interface NotificationsContextValue {
  persona: Persona
  setPersonaId: (id: string) => void
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
  sendDigests: () => number
  addDigest: (recipientIds: string[], title: string, detail: string) => void
  markItemRead: (item: NotificationItem) => void
  markAllRead: () => void
  reset: () => void
  /** Names for copy: the item, and the collaborative. */
  itemName: (itemKind: ItemKind | undefined, itemId: string) => string
  collaborativeName: (collaborativeId: string) => string
  /** Who owns the collaborative, its partners (including ones added in the prototype) and whether it is published. */
  collaborativeInfo: (collaborativeId: string) => { access: CollaborativeAccess; published: boolean }
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { datasets, useCases, collaboratives } = useAppData()
  const [state, setState] = React.useState<NotificationState>(loadState)
  const [personaId, setPersonaIdState] = React.useState(loadPersonaId)
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

  const persona = getPersona(personaId)
  const items = React.useMemo(() => deriveItems(state, persona, ownerOf), [state, persona, ownerOf])
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

  /** Puts an item in a collaborative, tells the item's owner (unless they did it themselves) and notes the change for followers. */
  const placeItem = (actorId: string, addedById: string, collaborativeId: string, itemKind: ItemKind, itemId: string, via: 'owner' | 'partner' | 'approved') => {
    const current = stateRef.current
    // Two people can submit the same item; once the first is approved the item is already there.
    if (itemInCollaborative(current.collabItems, collaborativeId, itemId, itemKind)) return
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
      const waiting = current.requests.find((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collaborativeId && r.itemId === itemId && r.itemKind === itemKind && r.requesterId === actorId && r.status === 'waiting')
      if (waiting || itemInCollaborative(current.collabItems, collaborativeId, itemId, itemKind)) return { ok: false, reason: 'exists', request: waiting }
      const request: AccessRequest = { id: nextId('req'), kind: 'submission', itemId, itemKind, collaborativeId, requesterId: actorId, status: 'waiting', createdAt: Date.now(), history: [] }
      return { ok: true, request: record(request, 'requested', actorId, undefined, 'waiting') }
    },
    [accessOfCollaborative, record],
  )

  const addItem = React.useCallback<NotificationsContextValue['addItem']>(
    (actorId, collaborativeId, itemKind, itemId) => {
      const { access, published } = accessOfCollaborative(collaborativeId)
      const role = collaborativeRole(actorId, access, published)
      if (role === 'none') return { ok: false, reason: 'not-allowed' }
      if (itemInCollaborative(stateRef.current.collabItems, collaborativeId, itemId, itemKind)) return { ok: false, reason: 'exists' }
      placeItem(actorId, actorId, collaborativeId, itemKind, itemId, role)
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
      // Whoever added it, the collaborative's owner, or the item's own owner can take it out.
      const allowed = target.addedById === actorId || collaborativeRole(actorId, access, published) === 'owner' || (owner !== null && canDecide(actorId, owner))
      if (!allowed) return { ok: false, reason: 'not-allowed' }
      commit({ ...current, collabItems: current.collabItems.filter((i) => i.id !== collabItemId) })
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
      pushUpdate('update.partner-added', actorId, orgAdmins(orgId), collaborativeName(collaborativeId), `${orgNameOf(orgId)} was added as a partner. You can add items directly once it is published.`, `/explore/collaboratives/${collaborativeId}`)
      return { ok: true }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessOfCollaborative, commit, collaborativeName],
  )

  const sendDigests = React.useCallback(() => {
    const now = Date.now()
    const due = pendingDigests(stateRef.current, now)
    for (const digest of due) {
      pushUpdate('update.digest', 'system', digest.recipientIds, collaborativeName(digest.collaborativeId), digest.detail, `/explore/collaboratives/${digest.collaborativeId}`)
      const current = stateRef.current
      commit({ ...current, digestedAt: { ...current.digestedAt, [digest.collaborativeId]: digest.coversUntil } })
    }
    return due.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, collaborativeName])

  const addDigest = React.useCallback(
    (recipientIds: string[], title: string, detail: string) => pushUpdate('update.digest', 'system', recipientIds, title, detail, '/collaboratives'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const setPersonaId = React.useCallback((id: string) => {
    try {
      window.sessionStorage.setItem(PERSONA_KEY, id)
    } catch {
      /* the persona then lasts until reload */
    }
    setPersonaIdState(id)
  }, [])

  const reset = React.useCallback(() => commit(buildSeed(Date.now())), [commit])

  const value = React.useMemo<NotificationsContextValue>(
    () => ({ persona, setPersonaId, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, submitItem, addItem, removeItem, follow, unfollow, addPartner, sendDigests, addDigest, markItemRead, markAllRead, reset, itemName, collaborativeName, collaborativeInfo: accessOfCollaborative }),
    [persona, setPersonaId, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, submitItem, addItem, removeItem, follow, unfollow, addPartner, sendDigests, addDigest, markItemRead, markAllRead, reset, itemName, collaborativeName, accessOfCollaborative],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

function useNotifications(): NotificationsContextValue {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}

export { NotificationsProvider, useNotifications }
