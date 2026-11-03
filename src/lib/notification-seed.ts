import type { AccessRequest, EventType, HistoryAction, NotificationEvent, NotificationState, RequestStatus } from '@/types/notifications'

const HOUR = 3600 * 1000
const DAY = 24 * HOUR

const EVENT_FOR_ACTION: Record<HistoryAction, EventType> = {
  requested: 'access.requested',
  approved: 'access.approved',
  declined: 'access.declined',
  withdrawn: 'access.withdrawn',
  revoked: 'access.revoked',
  granted: 'access.granted',
}

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

  const add = (datasetId: string, requesterId: string, reason: string | undefined, steps: Step[], direct = false) => {
    n += 1
    const id = `req-seed-${n}`
    let status: RequestStatus = 'waiting'
    const history = steps.map((step, i) => {
      status = STATUS_AFTER[step.action] ?? status
      const at = now - step.ago
      events.push({ id: `evt-${id}-${i}`, type: EVENT_FOR_ACTION[step.action], actorId: step.actorId, at, requestId: id })
      return { id: `his-${id}-${i}`, action: step.action, actorId: step.actorId, at, reason: step.reason }
    })
    requests.push({ id, datasetId, requesterId, reason, status, direct, createdAt: history[0].at, history })
  }

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
    { id: 'd1', recipients: ['marcus', 'priya'], ago: 3 * HOUR, title: 'Public Health Data Collaborative', detail: '3 new items and 1 new partner' },
    { id: 'd2', recipients: ['marcus'], ago: 2 * DAY, title: 'Open Budgets Network', detail: '2 new datasets, one of them restricted' },
    { id: 'd3', recipients: ['marcus', 'rahul', 'john'], ago: 5 * DAY, title: 'Urban Mobility Collaborative', detail: 'Published and updated' },
    { id: 'd4', recipients: ['rahul', 'john', 'anil'], ago: 9 * HOUR, title: 'Public Health Data Collaborative', detail: '1 new use case added' },
    { id: 'd5', recipients: ['rahul', 'priya'], ago: 4 * DAY, title: 'Open Budgets Network', detail: '1 new partner' },
  ]
  for (const d of digests) {
    events.push({ id: `evt-${d.id}`, type: 'update.digest', actorId: 'system', at: now - d.ago, recipientIds: d.recipients, title: d.title, detail: d.detail, href: '/collaboratives' })
  }

  // Everything older than a day is read; the rest is unread for whoever it is addressed to.
  const reads: Record<string, string[]> = {}
  const everyone = ['john', 'anil', 'rahul', 'priya', 'marcus']
  for (const person of everyone) reads[person] = events.filter((e) => now - e.at > DAY).map((e) => e.id)

  return { requests, events, reads }
}
