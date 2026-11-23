/** Prototype notification model. Requests and events are the source of truth; what a person sees in the bell and on the
 *  Notifications & Requests page is derived per recipient (see `lib/notification-model.ts`). */

export type RequestStatus = 'waiting' | 'approved' | 'declined' | 'withdrawn' | 'revoked'

export type HistoryAction = 'requested' | 'approved' | 'declined' | 'withdrawn' | 'revoked' | 'granted'

export interface HistoryEntry {
  id: string
  action: HistoryAction
  actorId: string
  at: number
  reason?: string
}

/** A request is either someone asking for access to a restricted dataset, or someone submitting an item to a collaborative. Both
 *  are decided by the owner side, move through the same statuses and share the same rows, history and actions. */
export type RequestKind = 'access' | 'submission'

export type ItemKind = 'dataset' | 'use-case'

export interface AccessRequest {
  id: string
  /** Absent on requests saved before collaborative submissions existed; read as `access`. */
  kind?: RequestKind
  /** The dataset asked for (access), or the item submitted (submission). */
  itemId: string
  itemKind?: ItemKind
  /** Submissions only: where the item is going. */
  collaborativeId?: string
  requesterId: string
  reason?: string
  status: RequestStatus
  /** True when an owner added the person directly instead of the person asking. */
  direct?: boolean
  createdAt: number
  history: HistoryEntry[]
}

export type EventType =
  | 'access.requested'
  | 'access.approved'
  | 'access.declined'
  | 'access.withdrawn'
  | 'access.revoked'
  | 'access.granted'
  | 'submission.requested'
  | 'submission.approved'
  | 'submission.declined'
  | 'submission.withdrawn'
  | 'update.digest'
  | 'update.partner-added'
  | 'update.item-added'
  | 'update.invitation-claimed'
  | 'update.invitation-received'
  | 'update.invitation-accepted'
  | 'update.invitation-declined'
  | 'update.member-added'
  | 'update.member-removed'
  | 'update.role-changed'
  | 'update.account-created'
  | 'update.announcement'
  | 'update.content-published'
  | 'update.content-unpublished'
  | 'update.content-deleted'
  | 'update.collaborative-content'
  | 'update.collaborative-removed'
  | 'update.collaborative-closed'
  | 'update.evaluation-assigned'
  | 'update.evaluation-revoked'

export interface NotificationEvent {
  id: string
  type: EventType
  actorId: string
  at: number
  /** Present on every access event; absent on update events. */
  requestId?: string
  /** Update events have no request to resolve recipients from, so they name them. */
  recipientIds?: string[]
  /** Update events carry their own copy. */
  title?: string
  detail?: string
  href?: string
  /** Invitation-claimed updates: the invitation they are about, so a later change to the claimant updates this notice instead of adding one. */
  invitationId?: string
  /** Invitation-claimed updates: the organisation, so the notice sits in that organisation's workspace. */
  orgId?: string
  /** Written by the policy: the same change is never told twice (two tabs, a repeated event). */
  dedupeKey?: string
  /** A notice about a restricted dataset: shown only while the reader can still open it. */
  restrictedDatasetId?: string
  collaborativeId?: string
}

/** An item that is in a collaborative, and how it got there. */
export interface CollaborativeItem {
  id: string
  collaborativeId: string
  itemKind: ItemKind
  itemId: string
  addedById: string
  at: number
  via: 'owner' | 'partner' | 'approved'
}

/** Something that happened on a collaborative, kept so the Following page can show a collaborative's last change. */
export interface CollaborativeChange {
  id: string
  collaborativeId: string
  kind: 'item-added' | 'partner-added'
  at: number
  /** Whether the item added is restricted, so the digest can show its lock. */
  restricted?: boolean
}

export interface NotificationState {
  requests: AccessRequest[]
  events: NotificationEvent[]
  /** Per person: the ids of the events they have read. */
  reads: Record<string, string[]>
  /** Items in collaboratives, added directly or through an approved submission. */
  collabItems: CollaborativeItem[]
  /** Per collaborative: who follows it. */
  follows: Record<string, string[]>
  changes: CollaborativeChange[]
  /** Per collaborative: partner organisations added since the prototype started, on top of the demo roles. */
  partners: Record<string, string[]>
}

/** Who owns a restricted item, and so who decides access to it. */
export type OwnerContext =
  | { kind: 'personal'; personaId: string }
  | { kind: 'org'; orgId: string; orgName: string }

export type OrgRole = 'admin' | 'editor' | 'evaluator' | 'viewer' | 'auditor'

export type Membership = { kind: 'personal' } | { kind: 'org'; orgId: string; orgName: string; role: OrgRole }

export interface Person {
  id: string
  name: string
  initials: string
  email: string
}

export interface Persona extends Person {
  /** One line describing the person's role in the prototype. */
  blurb: string
}

export type NotificationTab = 'pending' | 'updates' | 'approved' | 'closed'

/** One row in the bell and on the page: a request as seen by one person, or an update. */
export interface NotificationItem {
  id: string
  kind: 'request' | 'update'
  tab: NotificationTab
  /** Request items: the person decides (`incoming`) or asked (`outgoing`). */
  direction?: 'incoming' | 'outgoing'
  request?: AccessRequest
  event?: NotificationEvent
  at: number
  unread: boolean
  /** Ids of this person's events behind the row, so reading the row reads them all. */
  eventIds: string[]
  /** Context chip text, e.g. "Personal" or "CivicDataLab · Admin". */
  context: string
  /** Waiting for this person to decide. */
  needsAction: boolean
}
