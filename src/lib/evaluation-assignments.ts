/** Evaluation assignments: which published records of an organisation an Evaluator may open.
 *
 *  Rule (published content only): a record can be assigned only while it is published. When it stops being published the assignment is
 *  invalidated and the Evaluator loses access at once; publishing it again does not bring the assignment back. Every access check reads
 *  the record's current status as well as the assignment, so a stale assignment can never open an unpublished or deleted record. */

import { canonicalPersonId } from '@/lib/membership-source'
import { ACTIVE_MEMBER_IDS } from '@/lib/notification-personas'
import {
  currentUserRole,
  type EvaluationAssignment,
  type EvaluationModule,
  type EvaluationScopeItem,
  type OrganisationRecord,
} from '@/types/organisation-workspace'

/** The modules an Evaluator can be assigned records from (initial scope). */
const EVALUATION_MODULES: EvaluationModule[] = ['dataset', 'use-case', 'ai-model', 'publication', 'event']

/** The workspace route segment of each module: `/organisations/:id/<segment>`. */
const EVALUATION_MODULE_SEGMENT: Record<EvaluationModule, string> = {
  dataset: 'datasets',
  'use-case': 'use-cases',
  'ai-model': 'ai-models',
  publication: 'publications',
  event: 'events',
}

/** The content types the invitation and member drawers offer for evaluation. Events can be assigned by the rules above, but are not offered
 *  in this release. */
const EVALUATION_PICKER_MODULES: EvaluationModule[] = ['dataset', 'use-case', 'ai-model', 'publication']

const EVALUATION_MODULE_LABEL: Record<EvaluationModule, string> = {
  dataset: 'Datasets',
  'use-case': 'Use Cases',
  'ai-model': 'AI Models',
  publication: 'Publications',
  event: 'Events',
}

function moduleFromSegment(segment: string | undefined): EvaluationModule | null {
  return EVALUATION_MODULES.find((m) => EVALUATION_MODULE_SEGMENT[m] === segment) ?? null
}

/** The minimum a record needs for these rules. Every module's record already has these. */
interface AssignableRecord {
  id: string
  status: 'draft' | 'published'
  organisationId?: string
}

/** Only published content can be assigned or reviewed. A draft, whether it was never published or was unpublished, cannot. */
function isEligibleForEvaluation(record: Pick<AssignableRecord, 'status'> | undefined): boolean {
  return record?.status === 'published'
}

type AssignmentRefusal = 'not-admin' | 'not-an-evaluator' | 'module-not-assignable' | 'record-not-found' | 'not-published' | 'already-assigned'

const REFUSAL_MESSAGE: Record<AssignmentRefusal, string> = {
  'not-admin': 'Only an organisation Admin can assign content for evaluation.',
  'not-an-evaluator': 'Content can only be assigned to a member with the Evaluator role.',
  'module-not-assignable': 'This kind of content cannot be assigned for evaluation.',
  'record-not-found': 'This content does not belong to the organisation.',
  'not-published': 'Only published content can be assigned for evaluation.',
  'already-assigned': 'This content is already assigned to this Evaluator.',
}

type AssignmentCheck = { ok: true } | { ok: false; reason: AssignmentRefusal; message: string }

function refuse(reason: AssignmentRefusal): AssignmentCheck {
  return { ok: false, reason, message: REFUSAL_MESSAGE[reason] }
}

/** Whether `evaluatorPersonId` may be assigned `record` of `module` in `org` by the signed-in user. */
function checkAssignment(
  org: OrganisationRecord,
  input: { evaluatorPersonId: string; module: EvaluationModule; recordId: string },
  record: AssignableRecord | undefined,
): AssignmentCheck {
  if (currentUserRole(org) !== 'admin') return refuse('not-admin')
  if (!org.members.some((m) => m.personId === input.evaluatorPersonId && m.role === 'evaluator')) return refuse('not-an-evaluator')
  if (!EVALUATION_MODULES.includes(input.module)) return refuse('module-not-assignable')
  if (!record || record.organisationId !== org.id) return refuse('record-not-found')
  if (!isEligibleForEvaluation(record)) return refuse('not-published')
  const duplicate = (org.assignments ?? []).some(
    (a) => a.status === 'active' && a.evaluatorPersonId === input.evaluatorPersonId && a.module === input.module && a.recordId === input.recordId,
  )
  return duplicate ? refuse('already-assigned') : { ok: true }
}

/** Ends every active assignment of a record that stopped being published. Returns the same array when nothing changed. */
function invalidateAssignmentsForRecord(
  assignments: EvaluationAssignment[] | undefined,
  module: EvaluationModule,
  recordId: string,
  endedAt: string,
  reason: 'record-unpublished' | 'record-deleted' = 'record-unpublished',
): EvaluationAssignment[] | undefined {
  if (!assignments?.some((a) => a.status === 'active' && a.module === module && a.recordId === recordId)) return assignments
  return assignments.map((a) =>
    a.status === 'active' && a.module === module && a.recordId === recordId
      ? { ...a, status: 'invalidated' as const, endedAt, endedReason: reason }
      : a,
  )
}

/** Ends an Evaluator's active assignments in an organisation (all of them, or only those in `modules`), keeping them as history. Returns the
 *  same array when there was nothing to end. */
function revokeAssignmentsOf(
  assignments: EvaluationAssignment[] | undefined,
  evaluatorPersonId: string,
  reason: NonNullable<EvaluationAssignment['endedReason']>,
  endedAt: string,
  modules?: EvaluationModule[],
  only?: (a: EvaluationAssignment) => boolean,
): EvaluationAssignment[] | undefined {
  const hit = (a: EvaluationAssignment) =>
    a.status === 'active' && a.evaluatorPersonId === evaluatorPersonId && (!modules || modules.includes(a.module)) && (!only || only(a))
  if (!assignments?.some(hit)) return assignments
  return assignments.map((a) => (hit(a) ? { ...a, status: 'revoked' as const, endedAt, endedReason: reason } : a))
}

/** Ends any active assignment that no longer holds, keeping it as history: its record is gone or no longer published, or its Evaluator is no
 *  longer an Evaluator of the organisation. Nothing is ever reactivated, so a record that is recreated, republished or given the same id again
 *  needs a new assignment. Returns the same organisation when nothing needed ending. */
function reconcileOrganisationAssignments(
  org: OrganisationRecord,
  find: (module: EvaluationModule, recordId: string) => AssignableRecord | undefined,
  endedAt: string,
): OrganisationRecord {
  let changed = false
  const assignments = (org.assignments ?? []).map((a) => {
    if (a.status !== 'active') return a
    const record = find(a.module, a.recordId)
    const stillEvaluator = org.members.some((m) => canonicalPersonId(m.personId) === canonicalPersonId(a.evaluatorPersonId) && m.role === 'evaluator')
    const reason = !record ? 'record-deleted' : !isEligibleForEvaluation(record) ? 'record-unpublished' : !stillEvaluator ? 'membership-ended' : null
    if (!reason) return a
    changed = true
    return { ...a, status: (reason === 'membership-ended' ? 'revoked' : 'invalidated') as EvaluationAssignment['status'], endedAt, endedReason: reason as NonNullable<EvaluationAssignment['endedReason']> }
  })
  return changed ? { ...org, assignments } : org
}

/** The ids of `records` the signed-in Evaluator may open in `org`: assigned, still published, and in this organisation. */
function evaluatorVisibleIds(org: OrganisationRecord, module: EvaluationModule, records: AssignableRecord[]): Set<string> {
  const assigned = new Set(
    (org.assignments ?? [])
      .filter((a) => a.status === 'active' && a.module === module && ACTIVE_MEMBER_IDS.includes(a.evaluatorPersonId))
      .map((a) => a.recordId),
  )
  return new Set(records.filter((r) => r.organisationId === org.id && isEligibleForEvaluation(r) && assigned.has(r.id)).map((r) => r.id))
}

/** Checks an Evaluator invitation's records: at least one, each an assignable kind, in this organisation, and published right now.
 *  Returns the first problem as a message, or null when the scope is valid. */
function checkEvaluationScope(
  org: OrganisationRecord,
  scope: EvaluationScopeItem[] | undefined,
  find: (module: EvaluationModule, recordId: string) => AssignableRecord | undefined,
): string | null {
  if (!scope || scope.length === 0) return 'Choose at least one published record for the Evaluator to review.'
  for (const item of scope) {
    if (!EVALUATION_MODULES.includes(item.module)) return REFUSAL_MESSAGE['module-not-assignable']
    const record = find(item.module, item.recordId)
    if (!record || record.organisationId !== org.id) return REFUSAL_MESSAGE['record-not-found']
    if (!isEligibleForEvaluation(record)) return REFUSAL_MESSAGE['not-published']
  }
  return null
}

export {
  EVALUATION_PICKER_MODULES,
  EVALUATION_MODULE_LABEL,
  checkEvaluationScope,
  EVALUATION_MODULES,
  EVALUATION_MODULE_SEGMENT,
  moduleFromSegment,
  isEligibleForEvaluation,
  checkAssignment,
  invalidateAssignmentsForRecord,
  reconcileOrganisationAssignments,
  revokeAssignmentsOf,
  evaluatorVisibleIds,
}
export type { AssignableRecord, AssignmentCheck }
