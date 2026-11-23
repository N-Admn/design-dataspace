import { eventTypeFor } from '@/lib/notification-model'
import type {
  AccessRequest,
  CollaborativeChange,
  CollaborativeItem,
  EventType,
  HistoryAction,
  ItemKind,
  NotificationEvent,
  NotificationState,
  RequestKind,
  RequestStatus,
} from '@/types/notifications'

const HOUR = 3600 * 1000
const DAY = 24 * HOUR

const STATUS_AFTER: Partial<Record<HistoryAction, RequestStatus>> = {
  approved: 'approved',
  declined: 'declined',
  withdrawn: 'withdrawn',
  revoked: 'revoked',
  granted: 'approved',
}

interface Step {
  action: HistoryAction
  actorId: string
  /** How long before "now" it happened. */
  ago: number
  reason?: string
}

/** Seeds are authored as requests with a history; the events are generated from it, so a request reads the same way for
 *  every person who can see it. */
export function buildSeed(now: number): NotificationState {
  const requests: AccessRequest[] = []
  const events: NotificationEvent[] = []
  let n = 0

  const build = (kind: RequestKind, target: Partial<AccessRequest>, requesterId: string, reason: string | undefined, steps: Step[], direct = false) => {
    n += 1
    const id = `req-seed-${n}`
    let status: RequestStatus = 'waiting'
    const history = steps.map((step, i) => {
      status = STATUS_AFTER[step.action] ?? status
      const at = now - step.ago
      events.push({ id: `evt-${id}-${i}`, type: eventTypeFor(kind, step.action) as EventType, actorId: step.actorId, at, requestId: id })
      return { id: `his-${id}-${i}`, action: step.action, actorId: step.actorId, at, reason: step.reason }
    })
    requests.push({ id, kind, itemId: '', ...target, requesterId, reason, status, direct, createdAt: history[0].at, history })
  }
  const add = (datasetId: string, requesterId: string, reason: string | undefined, steps: Step[], direct = false) =>
    build('access', { itemId: datasetId }, requesterId, reason, steps, direct)
  const submit = (collaborativeId: string, itemKind: ItemKind, itemId: string, requesterId: string, steps: Step[]) =>
    build('submission', { collaborativeId, itemKind, itemId }, requesterId, undefined, steps)

  // Incoming for CivicDataLab (ds-1): decided by Anil or John.
  add('ds-1', 'priya', 'Need the quarterly GDP breakdown for a district-level study at IIPA.', [{ action: 'requested', actorId: 'priya', ago: 2 * HOUR }])
  add('ds-1', 'marcus', 'For an explainer article on state labour data.', [{ action: 'requested', actorId: 'marcus', ago: 5 * HOUR }])
  add('ds-1', 'sasha', 'Comparing labour-force trends across states.', [
    { action: 'requested', actorId: 'sasha', ago: 4 * DAY },
    { action: 'approved', actorId: 'anil', ago: 3 * DAY },
  ])
  add('ds-1', 'dev', 'Course material for a public-policy class.', [
    { action: 'requested', actorId: 'dev', ago: 3 * DAY },
    { action: 'withdrawn', actorId: 'dev', ago: 2 * DAY },
  ])
  add('ds-1', 'sasha', undefined, [
    { action: 'requested', actorId: 'sasha', ago: 12 * DAY },
    { action: 'declined', actorId: 'john', ago: 11 * DAY, reason: 'Please share the purpose and your affiliation.' },
  ])

  // Incoming for John's personal dataset (ds-9).
  add('ds-9', 'priya', 'We would like to benchmark our grievance assistant on this.', [{ action: 'requested', actorId: 'priya', ago: 26 * HOUR }])
  add('ds-9', 'dev', 'Fine-tuning a civic assistant for a pilot.', [{ action: 'requested', actorId: 'dev', ago: 3 * DAY + 4 * HOUR }])
  add('ds-9', 'sasha', 'Evaluation set for a research paper.', [
    { action: 'requested', actorId: 'sasha', ago: 6 * DAY },
    { action: 'declined', actorId: 'john', ago: 5 * DAY, reason: 'Please share your affiliation and intended use.' },
  ])
  add('ds-9', 'marcus', 'Testing prompts for a newsroom tool.', [
    { action: 'requested', actorId: 'marcus', ago: 8 * DAY },
    { action: 'approved', actorId: 'john', ago: 7 * DAY },
    { action: 'revoked', actorId: 'john', ago: 1 * DAY },
  ])

  // Outgoing from John, Priya and Marcus to datasets owned by other organisations.
  add('ds-2', 'john', 'Cross-checking district indicators for a CivicDataLab report.', [{ action: 'requested', actorId: 'john', ago: 8 * HOUR }])
  add('ds-3', 'john', 'Reference data for a health-sector explainer.', [
    { action: 'requested', actorId: 'john', ago: 3 * DAY },
    { action: 'approved', actorId: 'meera', ago: 2 * DAY },
  ])
  add('ds-3', 'priya', 'Background for a UN Women brief.', [
    { action: 'requested', actorId: 'priya', ago: 6 * DAY },
    { action: 'approved', actorId: 'meera', ago: 5 * DAY },
  ])
  add('ds-2', 'priya', 'Comparing indicators across states.', [
    { action: 'requested', actorId: 'priya', ago: 4 * DAY },
    { action: 'declined', actorId: 'kiran', ago: 3 * DAY, reason: 'This release is limited to partner organisations for now.' },
  ])
  add('ds-2', 'marcus', 'For a data-journalism feature.', [{ action: 'requested', actorId: 'marcus', ago: 20 * HOUR }])
  add('ds-3', 'marcus', undefined, [
    { action: 'granted', actorId: 'kiran', ago: 9 * DAY },
    { action: 'revoked', actorId: 'kiran', ago: 6 * DAY },
  ], true)

  // Updates that are not requests.
  const digests: { id: string; recipients: string[]; ago: number; title: string; detail: string }[] = [
    { id: 'd1', recipients: ['marcus', 'priya'], ago: 3 * HOUR, title: 'Climate and Health Data Collaborative', detail: '3 new items and 1 new partner' },
    { id: 'd2', recipients: ['marcus'], ago: 2 * DAY, title: 'Open Budgets Network', detail: '2 new datasets, one of them restricted' },
    { id: 'd3', recipients: ['marcus', 'rahul', 'john'], ago: 5 * DAY, title: 'Urban Mobility Collaborative', detail: 'Published and updated' },
    { id: 'd4', recipients: ['rahul', 'john', 'anil'], ago: 9 * HOUR, title: 'Climate and Health Data Collaborative', detail: '1 new use case added' },
    { id: 'd5', recipients: ['rahul', 'priya'], ago: 4 * DAY, title: 'Open Budgets Network', detail: '1 new partner' },
  ]
  for (const d of digests) {
    events.push({ id: `evt-${d.id}`, type: 'update.digest', actorId: 'system', at: now - d.ago, recipientIds: d.recipients, title: d.title, detail: d.detail, href: '/collaboratives' })
  }

  // Collaborative submissions: collaborative-1 is owned by CivicDataLab (John and Anil decide), collaborative-4 by John.
  submit('collaborative-1', 'dataset', 'ds-13', 'priya', [{ action: 'requested', actorId: 'priya', ago: 3 * HOUR }])
  submit('collaborative-1', 'dataset', 'ds-14', 'marcus', [{ action: 'requested', actorId: 'marcus', ago: 7 * HOUR }])
  submit('collaborative-1', 'dataset', 'ds-15', 'sasha', [
    { action: 'requested', actorId: 'sasha', ago: 5 * DAY },
    { action: 'approved', actorId: 'anil', ago: 4 * DAY },
  ])
  submit('collaborative-1', 'dataset', 'ds-21', 'dev', [
    { action: 'requested', actorId: 'dev', ago: 3 * DAY },
    { action: 'declined', actorId: 'john', ago: 2 * DAY, reason: 'This one is outside the collaborative’s health and climate focus.' },
  ])
  submit('collaborative-1', 'dataset', 'ds-18', 'marcus', [
    { action: 'requested', actorId: 'marcus', ago: 7 * DAY },
    { action: 'withdrawn', actorId: 'marcus', ago: 6 * DAY },
  ])
  submit('collaborative-4', 'dataset', 'ds-1', 'priya', [{ action: 'requested', actorId: 'priya', ago: 20 * HOUR }])

  const collabItems: CollaborativeItem[] = [
    { id: 'ci-1', collaborativeId: 'collaborative-1', itemKind: 'dataset', itemId: 'ds-15', addedById: 'sasha', at: now - 4 * DAY, via: 'approved' },
    { id: 'ci-2', collaborativeId: 'collaborative-1', itemKind: 'dataset', itemId: 'ds-3', addedById: 'meera', at: now - 5 * DAY, via: 'partner' },
    { id: 'ci-3', collaborativeId: 'collaborative-1', itemKind: 'dataset', itemId: 'ds-9', addedById: 'meera', at: now - 20 * HOUR, via: 'partner' },
  ]
  const changes: CollaborativeChange[] = [
    { id: 'ch-1', collaborativeId: 'collaborative-1', kind: 'partner-added', at: now - 6 * DAY },
    { id: 'ch-2', collaborativeId: 'collaborative-1', kind: 'item-added', at: now - 5 * DAY },
    { id: 'ch-3', collaborativeId: 'collaborative-1', kind: 'item-added', at: now - 4 * DAY },
    { id: 'ch-4', collaborativeId: 'collaborative-1', kind: 'item-added', at: now - 20 * HOUR, restricted: true },
  ]
  events.push(
    { id: 'evt-partner-1', type: 'update.partner-added', actorId: 'john', at: now - 6 * DAY, recipientIds: ['meera'], title: 'Climate and Health Data Collaborative', detail: 'UN Women was added as a partner. You can add items directly.', href: '/explore/collaboratives/collaborative-1' },
    { id: 'evt-item-1', type: 'update.item-added', actorId: 'meera', at: now - 20 * HOUR, recipientIds: ['john'], title: 'Climate and Health Data Collaborative', detail: 'Meera Joshi added your dataset Civic Grievance Redressal Instruction Prompts (2025)', href: '/explore/collaboratives/collaborative-1' },
  )
  // John's organisation notices, one set for each role he holds (Admin at CivicDataLab, Editor at WHO, Evaluator at UNICEF), so every
  // kind of notice and both read and unread states can be tried through his single account. Ids start `evt-role-` so a browser that
  // saved an older inbox can be given these without touching the rest.
  const CDL = 'org-workspace-1'
  const WHO = 'org-workspace-2'
  const UNICEF = 'org-workspace-5'
  const roleNotice = (id: string, type: EventType, orgId: string, ago: number, title: string, detail: string, href: string, extra: Partial<NotificationEvent> = {}): NotificationEvent => ({
    id: `evt-role-${id}`, type, actorId: 'system', at: now - ago, recipientIds: ['john'], title, detail, href, orgId, ...extra,
  })
  events.push(
    // Admin · CivicDataLab
    roleNotice('cdl-1', 'update.invitation-claimed', CDL, 5 * HOUR, 'Invitation link claimed · CivicDataLab', 'Dev Malhotra (dev.malhotra@example.org) claimed the invitation link for CivicDataLab and intends to join as Editor. The link is now used. If this is the wrong person, revoke the invitation and generate a new link.', `/organisations/${CDL}/members`, { invitationId: 'org1-invitation-4' }),
    roleNotice('cdl-2', 'update.invitation-claimed', CDL, 22 * HOUR, 'Invitation link claimed · CivicDataLab', 'Sasha Iyer (sasha.iyer@example.org) claimed the invitation link for CivicDataLab and intends to join as Evaluator. They would review 2 published records. The link is now used. If this is the wrong person, revoke the invitation and generate a new link.', `/organisations/${CDL}/members`, { invitationId: 'org1-invitation-5' }),
    roleNotice('cdl-3', 'update.invitation-accepted', CDL, 3 * DAY, 'Member joined · CivicDataLab', 'Sana Khan accepted the invitation and joined CivicDataLab as an Evaluator. An Evaluator only sees the published records you assign to them.', `/organisations/${CDL}/members`),
    roleNotice('cdl-4', 'update.evaluation-revoked', CDL, 2 * DAY, 'Evaluation access changed · CivicDataLab', 'Flood Risk Forecaster was unpublished, so its evaluation assignment ended and the Evaluator can no longer open it. Publishing it again does not restore the assignment.', `/organisations/${CDL}/members`),
    // Editor · World Health Organization
    roleNotice('who-1', 'update.content-published', WHO, 6 * HOUR, 'Urban Water Supply & Coverage Indicators (2024) · World Health Organization', 'Sasha Iyer published this dataset. It is now live on the site.', '/explore/datasets/ds-5'),
    roleNotice('who-2', 'update.content-published', WHO, 40 * HOUR, 'Ready for review · World Health Organization', 'Maternal Health Service Utilisation Indicators (2024) was saved as a draft and is ready for you to review before it is published.', `/organisations/${WHO}/datasets`),
    // Evaluator · UNICEF
    roleNotice('unicef-1', 'update.evaluation-assigned', UNICEF, 3 * HOUR, 'New evaluation assignment · UNICEF', 'An admin assigned 2 published records to you: State-wise Education Infrastructure & Enrollment Statistics (2023–24) and AI for Public Good Workshop. You can read them, and nothing else in the organisation.', `/organisations/${UNICEF}/datasets`),
    roleNotice('unicef-2', 'update.evaluation-revoked', UNICEF, 18 * HOUR, 'Evaluation access ended · UNICEF', 'An admin removed Open Data Licensing 101 from your assignments. You can no longer open it.', '/organisations'),
    roleNotice('unicef-3', 'update.evaluation-assigned', UNICEF, 3 * DAY, 'Assignment updated · UNICEF', 'Your assignments were updated: AI for Public Good Workshop was added.', `/organisations/${UNICEF}/events`),
    roleNotice('unicef-4', 'update.evaluation-revoked', UNICEF, 5 * DAY, 'Evaluation access ended · UNICEF', 'A record assigned to you was unpublished, so its assignment ended. If it is published again, an admin has to assign it to you again.', '/organisations'),
  )
  const follows: Record<string, string[]> = { 'collaborative-1': ['marcus', 'priya', 'rahul'], 'collaborative-4': ['marcus'] }

  // Everything older than a day is read; the rest is unread for whoever it is addressed to.
  const reads: Record<string, string[]> = {}
  const everyone = ['john', 'anil', 'rahul', 'priya', 'meera', 'marcus']
  for (const person of everyone) reads[person] = events.filter((e) => now - e.at > DAY).map((e) => e.id)

  return { requests, events, reads, collabItems, follows, changes, partners: {} }
}
