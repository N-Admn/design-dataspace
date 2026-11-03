import type {
  AccessRequest,
  CollaborativeChange,
  CollaborativeItem,
  EventType,
  HistoryAction,
  ItemKind,
  RequestKind,
  NotificationEvent,
  NotificationItem,
  NotificationState,
  NotificationTab,
  OwnerContext,
  Persona,
  RequestStatus,
} from '@/types/notifications'
import type { DatasetRecord } from '@/types/dataset'
import type { UseCaseRecord } from '@/types/usecase'
import {
  DEMO_COLLABORATIVES,
  DEMO_RESTRICTED,
  PERSONAS,
  orgNameOf,
  ownerContextLabel,
  type CollaborativeAccess,
} from '@/lib/notification-personas'

/** Pure rules of the notification system: who owns and decides, who is notified, which tab a request lives in, and what a
 *  person's inbox looks like. Nothing here touches React or storage. */

// ---------------------------------------------------------------- ownership and access

export function isRestricted(dataset: DatasetRecord | undefined): boolean {
  if (!dataset) return false
  return dataset.id in DEMO_RESTRICTED || dataset.publishedForm?.metadata.accessType === 'restricted'
}

export function ownerOfDataset(dataset: DatasetRecord | undefined): OwnerContext | null {
  if (!dataset) return null
  if (DEMO_RESTRICTED[dataset.id]) return DEMO_RESTRICTED[dataset.id]
  return ownerFromWorkspace(dataset.organisationId)
}

/** Items the demo table does not name: their organisation, or the signed-in person's own workspace. */
function ownerFromWorkspace(organisationId: string | undefined): OwnerContext {
  return organisationId ? { kind: 'org', orgId: organisationId, orgName: orgNameOf(organisationId) } : { kind: 'personal', personaId: 'john' }
}

export function ownerOfUseCase(useCase: UseCaseRecord | undefined): OwnerContext | null {
  return useCase ? ownerFromWorkspace(useCase.organisationId) : null
}

export function requestKindOf(request: AccessRequest): RequestKind {
  return request.kind ?? 'access'
}

// ---------------------------------------------------------------- collaboratives

export function collaborativeAccess(collaborativeId: string, organisationId: string | undefined): CollaborativeAccess {
  return DEMO_COLLABORATIVES[collaborativeId] ?? { owner: ownerFromWorkspace(organisationId), partnerOrgIds: [], submit: 'anyone' }
}

export type CollaborativeRole = 'owner' | 'partner' | 'none'

function hasOrgRole(personaId: string, orgId: string, roles: string[]): boolean {
  const persona = PERSONAS.find((p) => p.id === personaId)
  return Boolean(persona?.memberships.some((m) => m.kind === 'org' && m.orgId === orgId && roles.includes(m.role)))
}

/** The owner side adds items directly (admins and editors of the owning organisation, or the person who owns it). Partners do too,
 *  once the collaborative is published. Everyone else submits for approval. */
export function collaborativeRole(personaId: string, access: CollaborativeAccess, published: boolean): CollaborativeRole {
  const { owner } = access
  if (owner.kind === 'personal' ? owner.personaId === personaId : hasOrgRole(personaId, owner.orgId, ['admin', 'editor'])) return 'owner'
  if (published && access.partnerOrgIds.some((orgId) => hasOrgRole(personaId, orgId, ['admin', 'editor']))) return 'partner'
  return 'none'
}

export function canSubmit(personaId: string, access: CollaborativeAccess, published: boolean): boolean {
  const role = collaborativeRole(personaId, access, published)
  return role !== 'none' || access.submit === 'anyone'
}

/** The admins of an organisation: who is told when it is made a partner. */
export function orgAdmins(orgId: string): string[] {
  return PERSONAS.filter((p) => hasOrgRole(p.id, orgId, ['admin'])).map((p) => p.id)
}

export function itemInCollaborative(items: CollaborativeItem[], collaborativeId: string, itemId: string, itemKind: ItemKind): boolean {
  return items.some((i) => i.collaborativeId === collaborativeId && i.itemId === itemId && i.itemKind === itemKind)
}

/** People who may decide access: a person's own item, or the owning organisation's admins. */
export function managersOf(owner: OwnerContext): string[] {
  if (owner.kind === 'personal') return [owner.personaId]
  return PERSONAS.filter((p) => p.memberships.some((m) => m.kind === 'org' && m.orgId === owner.orgId && m.role === 'admin')).map((p) => p.id)
}

/** The owner themselves, or anyone in the owning organisation, whatever their role: they always have access. */
export function isOwnerSide(personaId: string, owner: OwnerContext): boolean {
  if (owner.kind === 'personal') return owner.personaId === personaId
  const persona = PERSONAS.find((p) => p.id === personaId)
  return Boolean(persona?.memberships.some((m) => m.kind === 'org' && m.orgId === owner.orgId))
}

export function canDecide(personaId: string, owner: OwnerContext): boolean {
  return managersOf(owner).includes(personaId)
}

export function latestRequestBy(requests: AccessRequest[], personaId: string, datasetId: string): AccessRequest | undefined {
  return requests
    .filter((r) => requestKindOf(r) === 'access' && r.requesterId === personaId && r.itemId === datasetId)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

export function hasAccess(
  personaId: string | null,
  dataset: DatasetRecord | undefined,
  requests: AccessRequest[],
): boolean {
  if (!isRestricted(dataset)) return true
  if (!personaId || !dataset) return false
  const owner = ownerOfDataset(dataset)
  if (owner && isOwnerSide(personaId, owner)) return true
  return latestRequestBy(requests, personaId, dataset.id)?.status === 'approved'
}

// ---------------------------------------------------------------- recipients

/** Who an event is addressed to. The person who did it is never among them. */
export function resolveRecipients(
  event: NotificationEvent,
  request: AccessRequest | undefined,
  owner: OwnerContext | null,
): string[] {
  let recipients: string[] = []
  switch (event.type) {
    case 'access.requested':
    case 'access.withdrawn':
    case 'submission.requested':
    case 'submission.withdrawn':
      recipients = owner ? managersOf(owner) : []
      break
    case 'access.approved':
    case 'access.declined':
    case 'access.revoked':
    case 'access.granted':
    case 'submission.approved':
    case 'submission.declined':
      recipients = request ? [request.requesterId] : []
      break
    case 'update.digest':
    case 'update.partner-added':
    case 'update.item-added':
      recipients = event.recipientIds ?? []
      break
  }
  return recipients.filter((id) => id !== event.actorId)
}

// ---------------------------------------------------------------- tabs

const STATUS_TAB: Record<RequestStatus, NotificationTab> = {
  waiting: 'pending',
  approved: 'approved',
  declined: 'closed',
  withdrawn: 'closed',
  revoked: 'closed',
}

export function tabForStatus(status: RequestStatus): NotificationTab {
  return STATUS_TAB[status]
}

export const TAB_LABELS: Record<NotificationTab, string> = {
  pending: 'Pending',
  updates: 'Updates',
  approved: 'Approved',
  closed: 'Closed',
}

export const TAB_ORDER: NotificationTab[] = ['pending', 'updates', 'approved', 'closed']

export const STATUS_LABELS: Record<RequestStatus, string> = {
  waiting: 'Waiting',
  approved: 'Approved',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  revoked: 'Revoked',
}

const HISTORY_LABELS: Record<RequestKind, Record<HistoryAction, string>> = {
  access: {
    requested: 'requested access',
    approved: 'approved the request',
    declined: 'declined the request',
    withdrawn: 'withdrew the request',
    revoked: 'revoked access',
    granted: 'gave access directly',
  },
  submission: {
    requested: 'submitted the item',
    approved: 'approved the submission',
    declined: 'declined the submission',
    withdrawn: 'withdrew the submission',
    revoked: 'removed the item',
    granted: 'added the item',
  },
}

export function historyLabel(kind: RequestKind, action: HistoryAction): string {
  return HISTORY_LABELS[kind][action]
}

/** The event type for a step in a request's life, by kind. */
export function eventTypeFor(kind: RequestKind, action: HistoryAction): EventType {
  const prefix = kind === 'access' ? 'access' : 'submission'
  const verb = { requested: 'requested', approved: 'approved', declined: 'declined', withdrawn: 'withdrawn', revoked: 'revoked', granted: 'granted' }[action]
  return `${prefix}.${verb}` as EventType
}

// ---------------------------------------------------------------- derived inbox

type OwnerLookup = (request: AccessRequest) => OwnerContext | null

/** A person's inbox: one row per request they asked or can decide, plus the updates addressed to them. Newest first.
 *  Decisions are shared (the row reads the request's current status); read state is this person's own. */
export function deriveItems(state: NotificationState, persona: Persona, ownerOf: OwnerLookup): NotificationItem[] {
  const read = new Set(state.reads[persona.id] ?? [])
  const requestsById = new Map(state.requests.map((r) => [r.id, r]))
  const eventsByRequest = new Map<string, NotificationEvent[]>()
  for (const event of state.events) {
    if (!event.requestId) continue
    const list = eventsByRequest.get(event.requestId) ?? []
    list.push(event)
    eventsByRequest.set(event.requestId, list)
  }

  const items: NotificationItem[] = []

  for (const request of state.requests) {
    const owner = ownerOf(request)
    const incoming = owner !== null && canDecide(persona.id, owner)
    const outgoing = request.requesterId === persona.id
    if (!incoming && !outgoing) continue

    const events = eventsByRequest.get(request.id) ?? []
    // Events addressed to this person drive unread; events they authored still place the row in time.
    const addressed = events.filter((e) => resolveRecipients(e, request, owner).includes(persona.id))
    const eventIds = addressed.map((e) => e.id)
    const at = Math.max(request.createdAt, ...events.map((e) => e.at))

    items.push({
      id: `request:${request.id}`,
      kind: 'request',
      tab: tabForStatus(request.status),
      direction: incoming ? 'incoming' : 'outgoing',
      request,
      at,
      unread: eventIds.some((id) => !read.has(id)),
      eventIds,
      context: incoming && owner ? ownerContextLabel(persona, owner) : 'Personal',
      needsAction: incoming && request.status === 'waiting',
    })
  }

  for (const event of state.events) {
    if (event.requestId || !resolveRecipients(event, requestsById.get(event.requestId ?? ''), null).includes(persona.id)) continue
    items.push({
      id: `update:${event.id}`,
      kind: 'update',
      tab: 'updates',
      event,
      at: event.at,
      unread: !read.has(event.id),
      eventIds: [event.id],
      context: 'Personal',
      needsAction: false,
    })
  }

  return items.sort((a, b) => b.at - a.at)
}

export function countUnread(items: NotificationItem[]): number {
  return items.filter((i) => i.unread).length
}

// ---------------------------------------------------------------- grouping and time

export type DateGroup = 'Today' | 'This week' | 'Earlier'

export function dateGroupOf(at: number, now: number): DateGroup {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  if (at >= startOfToday.getTime()) return 'Today'
  if (now - at < 7 * 24 * 3600 * 1000) return 'This week'
  return 'Earlier'
}

export function timeAgo(at: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000))
  if (seconds < 45) return 'Just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fullDateTime(at: number): string {
  return new Date(at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ---------------------------------------------------------------- follower digests

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}

export function summariseChanges(changes: CollaborativeChange[]): string {
  const items = changes.filter((c) => c.kind === 'item-added')
  const partners = changes.filter((c) => c.kind === 'partner-added')
  const parts: string[] = []
  if (items.length > 0) {
    const restricted = items.filter((c) => c.restricted).length
    parts.push(`${plural(items.length, 'new item')}${restricted > 0 ? ` (${restricted} restricted)` : ''}`)
  }
  if (partners.length > 0) parts.push(plural(partners.length, 'new partner'))
  return parts.join(' and ')
}

export interface PendingDigest {
  collaborativeId: string
  recipientIds: string[]
  detail: string
  /** The time the digest covers up to, which becomes the collaborative's new `digestedAt`. */
  coversUntil: number
}

/** What each collaborative's followers have not yet been told: one summary per collaborative, and only when something changed since
 *  the last one. */
export function pendingDigests(state: NotificationState, now: number): PendingDigest[] {
  const result: PendingDigest[] = []
  for (const [collaborativeId, followers] of Object.entries(state.follows)) {
    if (followers.length === 0) continue
    const since = state.digestedAt[collaborativeId] ?? 0
    const fresh = state.changes.filter((c) => c.collaborativeId === collaborativeId && c.at > since)
    if (fresh.length === 0) continue
    result.push({ collaborativeId, recipientIds: followers, detail: summariseChanges(fresh), coversUntil: now })
  }
  return result
}
