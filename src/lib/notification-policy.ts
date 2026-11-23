/** Who is told about what: the notification policy as code.
 *
 *  `noticesFor` turns one platform event (`lib/activity-events.ts`) into the notices to write, each with exactly the people eligible for it:
 *   - System events (membership, invitations, roles, evaluator access, account) go only to the person affected and the organisation's Admins.
 *   - Content events go to the owner side (an organisation's Admins and Editors, or the individual owner) and, for content an Evaluator
 *     is assigned, to that Evaluator and only for what affects the assignment. Organisation membership alone notifies nobody.
 *   - Collaborative events are split by relationship: managers, contributors, followers and partners each get only what concerns them.
 *   - Restricted content is only ever mentioned to people who can open it, and the check is repeated whenever a notice is shown.
 *  A person with several relationships to the same event is named once, in the first notice that applies to them. The person who did
 *  something is never told about it. Nothing here sends email: see `lib/notification-emails.ts`. */

import { isRestricted, hasAccess, managersOf, orgAdmins, collaborativeAccess } from '@/lib/notification-model'
import { activeEvaluatorsOf } from '@/lib/membership-source'
import { DEMO_RESTRICTED, getPerson, orgNameOf } from '@/lib/notification-personas'
import { organisationRoleLabel, type EvaluationModule } from '@/types/organisation-workspace'
import type { ActivityEvent, ContentKind } from '@/lib/activity-events'
import type { DatasetRecord } from '@/types/dataset'
import type { AccessRequest, CollaborativeItem, EventType, ItemKind, OwnerContext } from '@/types/notifications'

export interface Notice {
  type: EventType
  recipientIds: string[]
  title: string
  detail: string
  href?: string
  orgId?: string
  /** Set when the notice is about a restricted dataset: it is shown only while the reader can still open it. */
  restrictedDatasetId?: string
  collaborativeId?: string
  /** Unique per notice, built from the event's key. */
  key: string
}

export interface PolicyContext {
  /** The signed-in person, who is told about their own account. */
  activePersonId: string
  datasets: DatasetRecord[]
  collaboratives: { id: string; organisationId?: string; name: string }[]
  follows: Record<string, string[]>
  collabItems: CollaborativeItem[]
  partners: Record<string, string[]>
  requests: AccessRequest[]
}

const LABEL: Record<ContentKind, string> = {
  dataset: 'dataset',
  'use-case': 'use case',
  'ai-model': 'AI model',
  publication: 'publication',
  event: 'event',
  collaborative: 'collaborative',
}
const PUBLIC_PATH: Record<ContentKind, string> = {
  dataset: 'datasets',
  'use-case': 'use-cases',
  'ai-model': 'ai-models',
  publication: 'publications',
  event: 'events',
  collaborative: 'collaboratives',
}
export const MODULE_OF_CONTENT: Partial<Record<ContentKind, EvaluationModule>> = { dataset: 'dataset', 'use-case': 'use-case', 'ai-model': 'ai-model', publication: 'publication', event: 'event' }

const unique = (ids: string[], exclude: string[] = []) => [...new Set(ids)].filter((id) => id && !exclude.includes(id))

/** Whether `personId` may be told about this dataset: anything public, or restricted only for people who can open it. */
export function mayKnowAbout(personId: string, dataset: DatasetRecord | undefined, ctx: Pick<PolicyContext, 'requests'>): boolean {
  if (!dataset) return false
  return !isRestricted(dataset) || hasAccess(personId, dataset, ctx.requests)
}

/** The people who stand in each relationship to one collaborative. */
export function collaborativeAudience(collaborativeId: string, ctx: PolicyContext, organisationId?: string) {
  const record = ctx.collaboratives.find((c) => c.id === collaborativeId)
  const base = collaborativeAccess(collaborativeId, record?.organisationId ?? organisationId)
  const partnerOrgIds = [...base.partnerOrgIds, ...(ctx.partners[collaborativeId] ?? [])]
  return {
    owner: base.owner as OwnerContext,
    managers: managersOf(base.owner),
    partners: partnerOrgIds.flatMap((orgId) => managersOf({ kind: 'org', orgId, orgName: orgNameOf(orgId) })),
    followers: ctx.follows[collaborativeId] ?? [],
    contributors: ctx.collabItems.filter((i) => i.collaborativeId === collaborativeId).map((i) => i.addedById),
    name: record?.name ?? 'this collaborative',
  }
}

/** An item that is in a collaborative, going or coming: tells that collaborative's people who are eligible. */
export function collaborativeItemNotice(
  kind: 'added' | 'removed',
  collaborativeId: string,
  itemKind: ItemKind,
  itemId: string,
  itemTitle: string,
  actorId: string,
  contributorId: string | null,
  ctx: PolicyContext,
  alreadyTold: string[],
  key: string,
): Notice | null {
  const audience = collaborativeAudience(collaborativeId, ctx)
  const dataset = itemKind === 'dataset' ? ctx.datasets.find((d) => d.id === itemId) : undefined
  const restricted = Boolean(dataset && isRestricted(dataset))
  const wanted =
    kind === 'added'
      ? // New public content: the managers, followers and partners. The contributor already hears through their submission.
        [...audience.managers, ...audience.followers, ...audience.partners]
      : [...audience.managers, ...(contributorId ? [contributorId] : []), ...audience.followers, ...audience.partners]
  const recipients = unique(wanted, [actorId, ...alreadyTold]).filter((id) => !restricted || mayKnowAbout(id, dataset, ctx))
  if (recipients.length === 0) return null
  const who = getPerson(contributorId ?? actorId).name
  return {
    type: kind === 'added' ? 'update.collaborative-content' : 'update.collaborative-removed',
    recipientIds: recipients,
    title: audience.name,
    detail: kind === 'added' ? `${who} added ${itemTitle}` : `${itemTitle} was taken out of this collaborative`,
    href: `/explore/collaboratives/${collaborativeId}`,
    restrictedDatasetId: restricted ? itemId : undefined,
    collaborativeId,
    key,
  }
}

function contentNotices(event: Extract<ActivityEvent, { kind: 'content' }>, ctx: PolicyContext): Notice[] {
  const out: Notice[] = []
  const org = event.organisationId
  const orgName = org ? orgNameOf(org) : undefined
  const owner: OwnerContext = org ? { kind: 'org', orgId: org, orgName: orgName ?? '' } : { kind: 'personal', personaId: ctx.activePersonId }
  const label = LABEL[event.contentKind]
  const who = getPerson(event.actorId).name
  const dataset = event.contentKind === 'dataset' ? ctx.datasets.find((d) => d.id === event.id) : undefined
  const gone = event.action === 'unpublished' || event.action === 'deleted'
  // Restricted by its own access type or by the demo table (a deleted dataset can no longer be looked up to find out).
  const restrictedItem = Boolean(event.restricted || (event.contentKind === 'dataset' && event.id in DEMO_RESTRICTED))
  const told: string[] = [event.actorId]
  const withOrg = (text: string) => (orgName ? `${text} · ${orgName}` : text)
  const manage = org ? `/organisations/${org}/${PUBLIC_PATH[event.contentKind]}` : undefined
  const visible = (id: string) => !restrictedItem || (event.contentKind === 'dataset' && (dataset ? mayKnowAbout(id, dataset, ctx) : false)) || managersOf(owner).includes(id)

  if (event.contentKind === 'collaborative') {
    // A collaborative's people: managers see everything; followers and partners only what is public and meaningful.
    const audience = collaborativeAudience(event.id, ctx, org)
    if (gone) {
      // Closure: managers, contributors, followers and partners are told once.
      const recipients = unique([...audience.managers, ...audience.contributors, ...audience.followers, ...audience.partners], told)
      if (recipients.length) out.push({ type: 'update.collaborative-closed', recipientIds: recipients, title: withOrg(event.title), detail: `${who} ${event.action === 'deleted' ? 'deleted' : 'unpublished'} this collaborative. It is no longer available.`, href: event.action === 'unpublished' ? manage : undefined, orgId: org, collaborativeId: event.id, key: `${event.key}:closed` })
      return out
    }
    const managers = unique(audience.managers, told)
    if (managers.length) out.push({ type: 'update.content-published', recipientIds: managers, title: withOrg(event.title), detail: `${who} ${event.action === 'published' ? 'published' : 'updated'} this collaborative.`, href: `/explore/collaboratives/${event.id}`, orgId: org, collaborativeId: event.id, key: `${event.key}:managers` })
    if (event.action === 'updated') {
      const others = unique([...audience.followers, ...audience.partners], [...told, ...managers])
      if (others.length) out.push({ type: 'update.collaborative-content', recipientIds: others, title: event.title, detail: 'This collaborative was updated.', href: `/explore/collaboratives/${event.id}`, collaborativeId: event.id, key: `${event.key}:others` })
    }
    return out
  }

  // Owner side: the organisation's Admins and Editors, or the individual owner.
  const managers = unique(managersOf(owner), told).filter(visible)
  // An Evaluator hears about content assigned to them only: updates here; unpublishing and deletion reach them as the end of the assignment.
  const module = MODULE_OF_CONTENT[event.contentKind]
  // An assigned Evaluator may read the record they were assigned (that is the assignment), so restricted access does not exclude them.
  const evaluators = org && module && event.action === 'updated' ? unique(activeEvaluatorsOf(org, module, event.id), [...told, ...managers]) : []
  const text = {
    published: `${who} published this ${label}. It is now live.`,
    updated: `${who} updated the published ${label}.`,
    unpublished: `${who} unpublished this ${label}. It is back to draft and no longer public.`,
    deleted: `${who} deleted this ${label}.`,
  }[event.action]
  const type: EventType = event.action === 'unpublished' ? 'update.content-unpublished' : event.action === 'deleted' ? 'update.content-deleted' : 'update.content-published'
  const href = event.action === 'published' || event.action === 'updated' ? `/explore/${PUBLIC_PATH[event.contentKind]}/${event.id}` : manage
  if (managers.length) out.push({ type, recipientIds: managers, title: withOrg(event.title), detail: text, href, orgId: org, restrictedDatasetId: restrictedItem && event.action !== 'deleted' && event.contentKind === 'dataset' ? event.id : undefined, key: `${event.key}:owners` })
  // The assigned Evaluator gets their own notice, about the record they review only; it points at the workspace, which enforces the assignment.
  if (evaluators.length) out.push({ type, recipientIds: evaluators, title: withOrg(event.title), detail: `${who} updated content assigned to you.`, href: org ? `/organisations/${org}/${PUBLIC_PATH[event.contentKind]}` : undefined, orgId: org, key: `${event.key}:evaluators` })
  told.push(...managers, ...evaluators)

  // A dataset or use case that was in collaboratives leaves them: their managers, the contributor, followers and partners are told.
  if (gone && (event.contentKind === 'dataset' || event.contentKind === 'use-case')) {
    for (const item of ctx.collabItems.filter((i) => i.itemId === event.id && i.itemKind === event.contentKind)) {
      const notice = collaborativeItemNotice('removed', item.collaborativeId, event.contentKind, event.id, event.title, event.actorId, item.addedById, { ...ctx, datasets: dataset ? ctx.datasets : [] }, told, `${event.key}:removed:${item.collaborativeId}`)
      if (notice) {
        // The title of restricted content is only for people who may open it; a deleted dataset can no longer be checked, so only owners above were told.
        if (restrictedItem && !dataset) continue
        out.push(notice)
        told.push(...notice.recipientIds)
      }
    }
  }
  return out
}

function membershipNotices(event: Extract<ActivityEvent, { kind: 'membership' }>): Notice[] {
  const out: Notice[] = []
  const org = event.organisationName
  const role = organisationRoleLabel(event.role)
  const admins = unique(orgAdmins(event.organisationId), [event.actorId, event.personId])
  const adminsNotice = (type: EventType, title: string, detail: string, suffix: string): Notice | null =>
    admins.length ? { type, recipientIds: admins, title, detail, href: `/organisations/${event.organisationId}/members`, orgId: event.organisationId, key: `${event.key}:${suffix}` } : null
  const affected = (type: EventType, title: string, detail: string, href: string | undefined): Notice | null =>
    event.personId !== event.actorId ? { type, recipientIds: [event.personId], title, detail, href, orgId: event.organisationId, key: `${event.key}:you` } : null
  const push = (n: Notice | null) => n && out.push(n)

  switch (event.action) {
    case 'added':
      push(affected('update.member-added', `You joined ${org}`, `You are now an ${role} of ${org}.`, '/organisations'))
      push(adminsNotice('update.member-added', `Member added · ${org}`, `${event.personName} was added as ${role}.`, 'admins'))
      break
    case 'removed':
      // Not a link into the organisation: the person no longer has access to it.
      push(affected('update.member-removed', `Removed from ${org}`, `You are no longer a member of ${org}, and no longer have access to its workspace.`, undefined))
      push(adminsNotice('update.member-removed', `Member removed · ${org}`, `${event.personName} was removed from the organisation.`, 'admins'))
      break
    case 'role-changed':
      push(affected('update.role-changed', `Your role changed · ${org}`, `Your role at ${org} changed from ${organisationRoleLabel(event.previousRole ?? event.role)} to ${role}.`, '/organisations'))
      push(adminsNotice('update.role-changed', `Role changed · ${org}`, `${event.personName} is now ${role} (was ${organisationRoleLabel(event.previousRole ?? event.role)}).`, 'admins'))
      break
    case 'invitation-accepted':
      push(adminsNotice('update.invitation-accepted', `Member joined · ${org}`, `${event.personName} accepted the invitation and joined as ${role}.`, 'admins'))
      break
    case 'invitation-declined':
      push(adminsNotice('update.invitation-declined', `Invitation declined · ${org}`, `${event.personName} declined the invitation to join as ${role}.`, 'admins'))
      break
  }
  return out
}

const ENDED_TEXT = {
  'admin-revoked': (titles: string) => `An admin removed ${titles} from your assignments. You can no longer open it.`,
  'record-unpublished': (titles: string) => `${titles} was unpublished, so its assignment ended and you can no longer open it. If it is published again, an admin has to assign it to you again.`,
  'record-deleted': (titles: string) => `${titles} was deleted, so its assignment ended.`,
  'membership-ended': () => 'Your evaluation access ended because you are no longer a member of this organisation.',
  'role-changed': () => 'Your evaluation access ended because your role changed. You no longer have assigned content.',
} as const

function evaluationNotices(event: Extract<ActivityEvent, { kind: 'evaluation' }>): Notice[] {
  const out: Notice[] = []
  const names = event.records.map((r) => r.title)
  const list = names.length === 1 ? `“${names[0]}”` : `${names.length} records (${names.slice(0, 2).map((n) => `“${n}”`).join(', ')}${names.length > 2 ? ', …' : ''})`
  const admins = unique(orgAdmins(event.organisationId), [event.actorId, event.evaluatorId])
  const who = getPerson(event.evaluatorId).name
  if (event.action === 'assigned') {
    if (event.evaluatorId !== event.actorId) out.push({ type: 'update.evaluation-assigned', recipientIds: [event.evaluatorId], title: `New evaluation assignment · ${event.organisationName}`, detail: `You can now read ${list}. You can read it, and nothing else in the organisation.`, href: `/organisations/${event.organisationId}`, orgId: event.organisationId, key: `${event.key}:you` })
    // Admins hear about assignments made by someone else only.
    if (admins.length) out.push({ type: 'update.evaluation-assigned', recipientIds: admins, title: `Evaluator assigned · ${event.organisationName}`, detail: `${list} assigned to ${who}.`, href: `/organisations/${event.organisationId}/members`, orgId: event.organisationId, key: `${event.key}:admins` })
    return out
  }
  const reason = event.reason ?? 'admin-revoked'
  const text = ENDED_TEXT[reason](list)
  if (event.evaluatorId !== event.actorId) out.push({ type: 'update.evaluation-revoked', recipientIds: [event.evaluatorId], title: `Evaluation access ended · ${event.organisationName}`, detail: text, href: undefined, orgId: event.organisationId, key: `${event.key}:you` })
  // Only a withdrawal by an admin is an access decision for the other admins; the other reasons reach them as the content or member change.
  if (reason === 'admin-revoked' && admins.length) out.push({ type: 'update.evaluation-revoked', recipientIds: admins, title: `Evaluation access changed · ${event.organisationName}`, detail: `${who}'s access to ${list} was withdrawn.`, href: `/organisations/${event.organisationId}/members`, orgId: event.organisationId, key: `${event.key}:admins` })
  return out
}

export function noticesFor(event: ActivityEvent, ctx: PolicyContext): Notice[] {
  switch (event.kind) {
    case 'content':
      return contentNotices(event, ctx)
    case 'membership':
      return membershipNotices(event)
    case 'evaluation':
      return evaluationNotices(event)
    case 'account':
      return [{ type: 'update.account-created', recipientIds: [ctx.activePersonId], title: 'Welcome to CivicDataSpace', detail: `Your account for ${event.email} is ready. You can create content, follow collaboratives and join organisations.`, href: '/dashboard', key: `${event.key}:welcome` }]
  }
}
