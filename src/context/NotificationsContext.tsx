import * as React from 'react'

import type { AccessRequest, EventType, HistoryAction, NotificationEvent, NotificationItem, NotificationState, Persona } from '@/types/notifications'
import { useAppData } from '@/context/AppDataContext'
import { canDecide, countUnread, deriveItems, ownerOfDataset } from '@/lib/notification-model'
import { DEFAULT_PERSONA_ID, getPersona } from '@/lib/notification-personas'
import { buildSeed } from '@/lib/notification-seed'

/** The prototype's notification store. Requests and events are the source of truth; each person's inbox is derived from them,
 *  and read state is kept per person. State lives in localStorage and follows other open tabs through the `storage` event.
 *  The active persona lives in sessionStorage, so two tabs can be two people. */

const STATE_KEY = 'civicdataspace:notifications:v1'
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
  addDigest: (recipientIds: string[], title: string, detail: string) => void
  markItemRead: (item: NotificationItem) => void
  markAllRead: () => void
  reset: () => void
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { datasets } = useAppData()
  const [state, setState] = React.useState<NotificationState>(loadState)
  const [personaId, setPersonaIdState] = React.useState(loadPersonaId)
  // Actions read the latest state synchronously so two quick actions never see a stale request.
  const stateRef = React.useRef(state)
  stateRef.current = state
  const datasetsRef = React.useRef(datasets)
  datasetsRef.current = datasets

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

  const ownerOf = React.useCallback(
    (datasetId: string) => ownerOfDataset(datasetsRef.current.find((d) => d.id === datasetId)),
    [],
  )

  const persona = getPersona(personaId)
  const items = React.useMemo(() => deriveItems(state, persona, ownerOf), [state, persona, ownerOf])
  const unreadCount = React.useMemo(() => countUnread(items), [items])

  const record = React.useCallback(
    (
      request: AccessRequest,
      action: HistoryAction,
      type: EventType,
      actorId: string,
      reason?: string,
      status = request.status,
    ): AccessRequest => {
      const at = Date.now()
      const updated: AccessRequest = {
        ...request,
        status,
        history: [...request.history, { id: nextId('his'), action, actorId, at, reason }],
      }
      const event: NotificationEvent = { id: nextId('evt'), type, actorId, at, requestId: request.id }
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

  const findRequest = (id: string) => stateRef.current.requests.find((r) => r.id === id)

  const requestAccess = React.useCallback<NotificationsContextValue['requestAccess']>(
    (actorId, datasetId, reason) => {
      const existing = stateRef.current.requests
        .filter((r) => r.requesterId === actorId && r.datasetId === datasetId)
        .sort((a, b) => b.createdAt - a.createdAt)[0]
      if (existing && (existing.status === 'waiting' || existing.status === 'approved')) return { ok: false, reason: 'exists', request: existing }
      const request: AccessRequest = {
        id: nextId('req'),
        datasetId,
        requesterId: actorId,
        reason: reason?.trim() || undefined,
        status: 'waiting',
        createdAt: Date.now(),
        history: [],
      }
      const created = record(request, 'requested', 'access.requested', actorId, reason?.trim() || undefined, 'waiting')
      return { ok: true, request: created }
    },
    [record],
  )

  const withdraw = React.useCallback<NotificationsContextValue['withdraw']>(
    (actorId, requestId) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      if (request.requesterId !== actorId) return { ok: false, reason: 'not-allowed', request }
      if (request.status !== 'waiting') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      return { ok: true, request: record(request, 'withdrawn', 'access.withdrawn', actorId, undefined, 'withdrawn') }
    },
    [record],
  )

  const decide = React.useCallback<NotificationsContextValue['decide']>(
    (actorId, requestId, decision, reason) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      const owner = ownerOf(request.datasetId)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed', request }
      // First decision wins: anyone arriving later sees who decided.
      if (request.status !== 'waiting') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      const type: EventType = decision === 'approved' ? 'access.approved' : 'access.declined'
      return { ok: true, request: record(request, decision, type, actorId, reason?.trim() || undefined, decision) }
    },
    [ownerOf, record],
  )

  const revoke = React.useCallback<NotificationsContextValue['revoke']>(
    (actorId, requestId, reason) => {
      const request = findRequest(requestId)
      if (!request) return { ok: false, reason: 'missing' }
      const owner = ownerOf(request.datasetId)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed', request }
      if (request.status !== 'approved') return { ok: false, reason: 'already-decided', request, byId: request.history[request.history.length - 1]?.actorId }
      return { ok: true, request: record(request, 'revoked', 'access.revoked', actorId, reason?.trim() || undefined, 'revoked') }
    },
    [ownerOf, record],
  )

  const grant = React.useCallback<NotificationsContextValue['grant']>(
    (actorId, datasetId, targetId) => {
      const owner = ownerOf(datasetId)
      if (!owner || !canDecide(actorId, owner)) return { ok: false, reason: 'not-allowed' }
      const request: AccessRequest = {
        id: nextId('req'),
        datasetId,
        requesterId: targetId,
        status: 'approved',
        direct: true,
        createdAt: Date.now(),
        history: [],
      }
      return { ok: true, request: record(request, 'granted', 'access.granted', actorId, undefined, 'approved') }
    },
    [ownerOf, record],
  )

  const addDigest = React.useCallback(
    (recipientIds: string[], title: string, detail: string) => {
      const current = stateRef.current
      commit({
        ...current,
        events: [
          ...current.events,
          { id: nextId('evt'), type: 'update.digest', actorId: 'system', at: Date.now(), recipientIds, title, detail, href: '/collaboratives' },
        ],
      })
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
    () => ({ persona, setPersonaId, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, addDigest, markItemRead, markAllRead, reset }),
    [persona, setPersonaId, items, unreadCount, state, requestAccess, withdraw, decide, revoke, grant, addDigest, markItemRead, markAllRead, reset],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

function useNotifications(): NotificationsContextValue {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}

export { NotificationsProvider, useNotifications }
