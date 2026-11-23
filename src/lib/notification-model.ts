import type {
  AccessRequest,
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
import { canonicalPersonId, membershipsOf, roleInOrganisation } from '@/lib/membership-source'
import { parseAppTimestamp } from '@/lib/format'
import { organisationRoleLabel, type OrganisationInvitation } from '@/types/organisation-workspace'
import {
  DEMO_COLLABORATIVES,
  DEMO_RESTRICTED,
  PERSONAS,
  membershipLabel,
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

/** Who owns an item made in a workspace: its organisation, or the signed-in person's own workspace. For content types without a demo table. */
export function ownerOfWorkspaceItem(organisationId: string | undefined): OwnerContext {
  return ownerFromWorkspace(organisationId)
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

/** Who may edit an item: the person it belongs to, or the admins and editors of the organisation that owns it. Editing always happens in
 *  the owner's own workspace, whichever page the item is seen from (a collaborative, say), so contributing never changes who can edit it. */
export function canEditAsOwner(personaId: string, owner: OwnerContext): boolean {
  return owner.kind === 'personal' ? owner.personaId === personaId : hasOrgRole(personaId, owner.orgId, ['admin', 'editor'])
}

/** How a person relates to one collaborative. These are separate from organisation membership:
 *  - `owner`: governs it. The person who owns it, or an Admin or Editor of the organisation that owns it (they have the same content
 *    permissions). Approves and declines submissions, adds partners, takes any item out, and adds items directly.
 *  - `partner`: an Admin or Editor of a partner organisation, once it is published. Adds items directly and takes out their own; nothing else.
 *  - `none`: everyone else, who submits for the owner's approval. An Evaluator of the owning or a partner organisation is read-only and
 *    cannot contribute at all. */
export type CollaborativeRole = 'owner' | 'partner' | 'none'

function hasOrgRole(personaId: string, orgId: string, roles: string[]): boolean {
  const role = roleInOrganisation(personaId, orgId)
  return role !== null && roles.includes(role)
}

export function collaborativeRole(personaId: string, access: CollaborativeAccess, published: boolean): CollaborativeRole {
  const { owner } = access
  if (owner.kind === 'personal') {
    if (owner.personaId === personaId) return 'owner'
  } else {
    const seat = roleInOrganisation(personaId, owner.orgId)
    if (seat === 'admin' || seat === 'editor') return 'owner'
    if (seat === 'evaluator') return 'none'
  }
  if (published && access.partnerOrgIds.some((orgId) => hasOrgRole(personaId, orgId, ['admin', 'editor']))) return 'partner'
  return 'none'
}

/** An Evaluator of the organisation that owns the collaborative, or of one of its partners, only reads: no contributing of any kind. */
export function isReadOnlyOnCollaborative(personaId: string, access: CollaborativeAccess): boolean {
  const orgIds = [...(access.owner.kind === 'org' ? [access.owner.orgId] : []), ...access.partnerOrgIds]
  return orgIds.some((orgId) => roleInOrganisation(personaId, orgId) === 'evaluator')
}

/** Owner, editor and partner add items straight away; everyone else submits for approval, unless the owner limited it to partners. */
export function canSubmit(personaId: string, access: CollaborativeAccess, published: boolean): boolean {
  if (isReadOnlyOnCollaborative(personaId, access)) return false
  const role = collaborativeRole(personaId, access, published)
  return role !== 'none' || access.submit === 'anyone'
}

/** The only kinds of content a collaborative takes. */
export const CONTRIBUTABLE_KINDS: ItemKind[] = ['dataset', 'use-case']

/** The admins of an organisation: who is told when it is made a partner. */
export function orgAdmins(orgId: string): string[] {
  return PERSONAS.filter((p) => hasOrgRole(p.id, orgId, ['admin'])).map((p) => p.id)
}

export function itemInCollaborative(items: CollaborativeItem[], collaborativeId: string, itemId: string, itemKind: ItemKind): boolean {
  return items.some((i) => i.collaborativeId === collaborativeId && i.itemId === itemId && i.itemKind === itemKind)
}

/** People who decide on what is asked of an item (access to a dataset, a submission to a collaborative): the person who owns it, or the
 *  owning organisation's Admins and Editors, who have the same content permissions. */
export function managersOf(owner: OwnerContext): string[] {
  if (owner.kind === 'personal') return [owner.personaId]
  return PERSONAS.filter((p) => hasOrgRole(p.id, owner.orgId, ['admin', 'editor'])).map((p) => p.id)
}

/** The owner themselves, or anyone in the owning organisation who is an Admin or Editor: they always have access. An Evaluator belongs to
 *  the organisation but is a reviewer, not on the owner's side. */
export function isOwnerSide(personaId: string, owner: OwnerContext): boolean {
  if (owner.kind === 'personal') return owner.personaId === personaId
  const role = roleInOrganisation(personaId, owner.orgId)
  return role !== null && role !== 'evaluator'
}

/** Whoever manages the owner's content (Admin or Editor, or the personal owner) may decide. Read from the role itself rather than the list of
 *  people with inboxes, so a member who has no inbox here is not refused. */
export function canDecide(personaId: string, owner: OwnerContext): boolean {
  if (owner.kind === 'personal') return owner.personaId === personaId
  return hasOrgRole(personaId, owner.orgId, ['admin', 'editor'])
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
      // The contributor, and the collaborative's other managers, who learn a colleague has decided (the first decision wins).
      recipients = request ? [request.requesterId, ...(owner ? managersOf(owner) : [])] : []
      break
    case 'update.digest':
    case 'update.partner-added':
    case 'update.item-added':
    case 'update.invitation-claimed':
    case 'update.invitation-received':
    case 'update.invitation-accepted':
    case 'update.invitation-declined':
    case 'update.member-added':
    case 'update.member-removed':
    case 'update.role-changed':
    case 'update.account-created':
    case 'update.announcement':
    case 'update.content-published':
    case 'update.content-unpublished':
    case 'update.content-deleted':
    case 'update.collaborative-content':
    case 'update.collaborative-removed':
    case 'update.collaborative-closed':
    case 'update.evaluation-assigned':
    case 'update.evaluation-revoked':
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
/** A direct invitation to an organisation, as the notifications need it. Read from the organisation store, so the invitee's notice always
 *  shows the invitation's real status: it is never a second copy that can disagree after an answer, a revoke or a reload. */
export interface InvitationNoticeSource {
  invitation: OrganisationInvitation
  organisationId: string
  organisationName: string
}

export function isInvitee(invitation: OrganisationInvitation, persona: Persona): boolean {
  if (invitation.via === 'link') return false
  if (invitation.personId) return canonicalPersonId(invitation.personId) === canonicalPersonId(persona.id)
  return Boolean(invitation.email && persona.email && invitation.email.toLowerCase() === persona.email.toLowerCase())
}

export function deriveItems(
  state: NotificationState,
  persona: Persona,
  ownerOf: OwnerLookup,
  invitations: InvitationNoticeSource[] = [],
  /** Whether this person may still be shown an update (a notice about a restricted dataset is hidden once they lose access). */
  mayShow: (event: NotificationEvent) => boolean = () => true,
): NotificationItem[] {
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
    if (!mayShow(event)) continue
    items.push({
      id: `update:${event.id}`,
      kind: 'update',
      tab: 'updates',
      event,
      at: event.at,
      unread: !read.has(event.id),
      eventIds: [event.id],
      // An organisation's notice (an invitation link was claimed) is filed under that organisation, like its incoming requests.
      context: event.orgId ? ownerContextLabel(persona, { kind: 'org', orgId: event.orgId, orgName: orgNameOf(event.orgId) }) : 'Personal',
      needsAction: false,
    })
  }

  // Invitations addressed to this person: a pending one is waiting for their answer, and every one stays as history.
  for (const { invitation, organisationId, organisationName } of invitations) {
    if (!isInvitee(invitation, persona)) continue
    const id = `invitation:${organisationId}:${invitation.id}`
    const role = organisationRoleLabel(invitation.role)
    const records = invitation.evaluationScope?.length ?? 0
    const pending = invitation.status === 'pending'
    const at = parseAppTimestamp(invitation.respondedAt ?? invitation.invitedAt).getTime()
    items.push({
      id: `update:${id}`,
      kind: 'update',
      tab: pending ? 'pending' : invitation.status === 'accepted' ? 'approved' : 'closed',
      event: {
        id,
        type: 'update.invitation-received',
        actorId: 'system',
        at,
        title: `Invitation to join ${organisationName}`,
        detail: `${organisationName} invited you to join as ${role}.${invitation.role === 'evaluator' && records > 0 ? ` You would review ${records} published record${records === 1 ? '' : 's'}.` : ''}`,
        invitationId: invitation.id,
        orgId: organisationId,
      },
      at,
      unread: pending && !read.has(id),
      eventIds: [id],
      context: ownerContextLabel(persona, { kind: 'org', orgId: organisationId, orgName: organisationName }),
      needsAction: pending,
    })
  }

  return items.sort((a, b) => b.at - a.at)
}

export function countUnread(items: NotificationItem[]): number {
  return items.filter((i) => i.unread).length
}

// ---------------------------------------------------------------- workspaces

/** One workspace a person can look at on the Notifications & Requests page: their personal capacity, or an organisation they
 *  belong to. */
export interface NotificationWorkspace {
  key: string
  label: string
}

export const PERSONAL_WORKSPACE_KEY = 'personal'

/** The workspaces for a person, from their real memberships: Personal first, then each organisation by name (no role). */
export function workspacesOf(persona: Persona): NotificationWorkspace[] {
  const memberships = membershipsOf(persona.id)
  const workspaces: NotificationWorkspace[] = [{ key: PERSONAL_WORKSPACE_KEY, label: 'Personal' }]
  for (const m of memberships) {
    if (m.kind !== 'org') continue
    const key = `org:${m.orgId}`
    if (!workspaces.some((w) => w.key === key)) workspaces.push({ key, label: m.orgName })
  }
  return workspaces
}

/** Which workspace a row belongs to. A row's context chip is the label of the membership it was derived for ("CivicDataLab ·
 *  Admin"), or "Personal" for what a person asked for or was told as an individual, so matching it to the membership names the
 *  workspace without a second source of truth. */
export function workspaceKeyOf(item: NotificationItem, persona: Persona): string {
  const membership = membershipsOf(persona.id).find((m) => m.kind === 'org' && membershipLabel(m) === item.context)
  return membership && membership.kind === 'org' ? `org:${membership.orgId}` : PERSONAL_WORKSPACE_KEY
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
