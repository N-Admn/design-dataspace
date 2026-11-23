/** What happened in the platform, as facts, before anyone is told about it.
 *
 *  The organisation and content stores change in many places (store actions, the invitation answers, reconciliation, another tab). Instead
 *  of asking each of them to write notifications, the app compares the stores before and after every change and turns the differences into
 *  these events (`diffActivity`). The notification system subscribes to them and decides, by policy, who is eligible to be told
 *  (`lib/notification-policy.ts`). Every event has a stable `key`, so the same change seen twice (two tabs, a re-render) is told once. */

import { canonicalPersonId } from '@/lib/membership-source'
import type { EvaluationAssignment, EvaluationModule, OrganisationInvitation, OrganisationMember, OrganisationRecord, OrganisationRole } from '@/types/organisation-workspace'

/** The content types that notify. (Charts have no page of their own and do not notify.) */
export type ContentKind = 'dataset' | 'use-case' | 'ai-model' | 'publication' | 'event' | 'collaborative'

interface BaseActivity {
  /** Stable across tabs and re-renders: the same change always has the same key. */
  key: string
  /** Who did it. Never told about their own action. */
  actorId: string
  at: number
}

export type ActivityEvent =
  | (BaseActivity & {
      kind: 'content'
      action: 'published' | 'updated' | 'unpublished' | 'deleted'
      contentKind: ContentKind
      id: string
      title: string
      organisationId?: string
      /** A dataset with restricted access: only people who can open it may be told, and the title is never shown to anyone else. */
      restricted?: boolean
    })
  | (BaseActivity & {
      kind: 'membership'
      action: 'added' | 'removed' | 'role-changed' | 'invitation-accepted' | 'invitation-declined'
      organisationId: string
      organisationName: string
      /** The person affected (canonical id). */
      personId: string
      personName: string
      role: OrganisationRole
      previousRole?: OrganisationRole
    })
  | (BaseActivity & {
      kind: 'evaluation'
      action: 'assigned' | 'ended'
      organisationId: string
      organisationName: string
      /** The Evaluator (canonical id). */
      evaluatorId: string
      records: { module: EvaluationModule; recordId: string; title: string }[]
      reason?: NonNullable<EvaluationAssignment['endedReason']>
    })
  | (BaseActivity & { kind: 'account'; action: 'created'; email: string })

const MODULE_CONTENT: Record<EvaluationModule, ContentKind> = {
  dataset: 'dataset',
  'use-case': 'use-case',
  'ai-model': 'ai-model',
  publication: 'publication',
  event: 'event',
}

interface RecordLike {
  id: string
  status: 'draft' | 'published'
  organisationId?: string
  updatedAt: string
  form: unknown
  publishedForm?: unknown
}

export interface ActivitySnapshot {
  organisations: OrganisationRecord[]
  content: Record<ContentKind, RecordLike[]>
}

function titleOf(_kind: ContentKind, record: RecordLike): string {
  const form = (record.publishedForm ?? record.form) as { metadata?: { name?: string; title?: string } }
  return form?.metadata?.name || form?.metadata?.title || 'Untitled'
}

function restrictedOf(kind: ContentKind, record: RecordLike): boolean {
  if (kind !== 'dataset') return false
  const form = (record.publishedForm ?? record.form) as { metadata?: { accessType?: string } }
  return form?.metadata?.accessType === 'restricted'
}

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b)

function inviteeIdOf(invitation: OrganisationInvitation): string {
  return canonicalPersonId(invitation.personId ?? (invitation.email ? `account:${invitation.email}` : 'unknown'))
}

/** The events that explain how `next` differs from `prev`. `actorId` is the signed-in person; an invitee who answers an invitation is the
 *  actor of their own answer. Nothing is reported for a new organisation, nor for the first snapshot. */
export function diffActivity(prev: ActivitySnapshot, next: ActivitySnapshot, actorId: string, now: number): ActivityEvent[] {
  const out: ActivityEvent[] = []

  // ---- content: published, updated, unpublished, deleted (drafts and working-copy saves are not events)
  for (const kind of Object.keys(next.content) as ContentKind[]) {
    const before = new Map(prev.content[kind].map((r) => [r.id, r]))
    const after = new Map(next.content[kind].map((r) => [r.id, r]))
    for (const record of next.content[kind]) {
      const old = before.get(record.id)
      const base = { kind: 'content' as const, contentKind: kind, id: record.id, title: titleOf(kind, record), organisationId: record.organisationId, restricted: restrictedOf(kind, record) || undefined, actorId, at: now }
      if (record.status === 'published' && (!old || old.status !== 'published')) out.push({ ...base, action: 'published', key: `content:${kind}:${record.id}:published:${record.updatedAt}` })
      else if (record.status === 'published' && old && old.updatedAt !== record.updatedAt && !same(old.publishedForm, record.publishedForm)) out.push({ ...base, action: 'updated', key: `content:${kind}:${record.id}:updated:${record.updatedAt}` })
      else if (record.status === 'draft' && old?.status === 'published') out.push({ ...base, action: 'unpublished', key: `content:${kind}:${record.id}:unpublished:${record.updatedAt}` })
    }
    for (const old of prev.content[kind]) {
      if (after.has(old.id) || old.status !== 'published') continue
      out.push({ kind: 'content', action: 'deleted', contentKind: kind, id: old.id, title: titleOf(kind, old), organisationId: old.organisationId, restricted: restrictedOf(kind, old) || undefined, actorId, at: now, key: `content:${kind}:${old.id}:deleted:${old.updatedAt}` })
    }
  }

  // ---- organisations: membership, invitations, evaluator assignments
  const prevOrgs = new Map(prev.organisations.map((o) => [o.id, o]))
  for (const org of next.organisations) {
    const old = prevOrgs.get(org.id)
    if (!old) continue
    const name = org.metadata.name
    const members = new Map(old.members.map((m) => [m.id, m]))
    const nowMembers = new Map(org.members.map((m) => [m.id, m]))
    const invitationOld = new Map(old.invitations.map((i) => [i.id, i]))

    const answered = new Set<string>()
    for (const invitation of org.invitations) {
      const was = invitationOld.get(invitation.id)
      if (!was || was.status !== 'pending' || invitation.status === 'pending' || invitation.via === 'link') continue
      if (invitation.status !== 'accepted' && invitation.status !== 'declined') continue
      const personId = inviteeIdOf(invitation)
      answered.add(personId)
      out.push({
        kind: 'membership', action: invitation.status === 'accepted' ? 'invitation-accepted' : 'invitation-declined', organisationId: org.id, organisationName: name,
        personId, personName: invitation.name, role: invitation.role, actorId: personId, at: now, key: `invitation:${org.id}:${invitation.id}:${invitation.status}`,
      })
    }
    const person = (m: OrganisationMember) => canonicalPersonId(m.personId)
    for (const m of org.members) {
      const was = members.get(m.id)
      if (!was) {
        if (answered.has(person(m))) continue
        out.push({ kind: 'membership', action: 'added', organisationId: org.id, organisationName: name, personId: person(m), personName: m.name, role: m.role, actorId, at: now, key: `member:${org.id}:${m.id}:added` })
      } else if (was.role !== m.role) {
        out.push({ kind: 'membership', action: 'role-changed', organisationId: org.id, organisationName: name, personId: person(m), personName: m.name, role: m.role, previousRole: was.role, actorId, at: now, key: `member:${org.id}:${m.id}:role:${was.role}>${m.role}:${m.updatedAt}` })
      }
    }
    for (const was of old.members) {
      if (nowMembers.has(was.id)) continue
      out.push({ kind: 'membership', action: 'removed', organisationId: org.id, organisationName: name, personId: person(was), personName: was.name, role: was.role, actorId, at: now, key: `member:${org.id}:${was.id}:removed:${was.updatedAt}` })
    }

    // evaluator assignments: newly active, newly ended
    const assignmentsOld = new Map((old.assignments ?? []).map((a) => [a.id, a]))
    const titleFor = (a: EvaluationAssignment) => {
      const kind = MODULE_CONTENT[a.module]
      const record = (next.content[kind].find((r) => r.id === a.recordId) ?? prev.content[kind].find((r) => r.id === a.recordId))
      return record ? titleOf(kind, record) : 'Removed content'
    }
    const assigned = new Map<string, EvaluationAssignment[]>()
    const ended = new Map<string, EvaluationAssignment[]>()
    for (const a of org.assignments ?? []) {
      const was = assignmentsOld.get(a.id)
      const id = canonicalPersonId(a.evaluatorPersonId)
      if (a.status === 'active' && !was) assigned.set(id, [...(assigned.get(id) ?? []), a])
      else if (a.status !== 'active' && was?.status === 'active') {
        const groupKey = `${id}|${a.endedReason ?? 'admin-revoked'}`
        ended.set(groupKey, [...(ended.get(groupKey) ?? []), a])
      }
    }
    for (const [id, list] of assigned) {
      out.push({ kind: 'evaluation', action: 'assigned', organisationId: org.id, organisationName: name, evaluatorId: id, records: list.map((a) => ({ module: a.module, recordId: a.recordId, title: titleFor(a) })), actorId, at: now, key: `evaluation:${org.id}:assigned:${list.map((a) => a.id).join(',')}` })
    }
    for (const [groupKey, list] of ended) {
      const [id, reason] = groupKey.split('|')
      out.push({ kind: 'evaluation', action: 'ended', organisationId: org.id, organisationName: name, evaluatorId: id, reason: reason as NonNullable<EvaluationAssignment['endedReason']>, records: list.map((a) => ({ module: a.module, recordId: a.recordId, title: titleFor(a) })), actorId, at: now, key: `evaluation:${org.id}:ended:${list.map((a) => `${a.id}:${a.status}`).join(',')}` })
    }
  }
  return out
}

// ------------------------------------------------------------------ the bus

type Listener = (event: ActivityEvent) => void
const listeners = new Set<Listener>()

export function emitActivity(event: ActivityEvent) {
  for (const listener of [...listeners]) listener(event)
}

export function subscribeActivity(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
