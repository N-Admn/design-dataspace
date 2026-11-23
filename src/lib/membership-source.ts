/** The one source of organisation membership for every rule that asks "who belongs to this organisation, and as what?".
 *
 *  The organisation workspaces (`OrganisationRecord.members`, kept by `AppDataContext`) are the only place membership is stored: the
 *  Members page, invitations and the invitation-link flow all change them. The notification and collaborative rules read the same list
 *  through this module instead of keeping a second table of their own, so a role change or a removal is seen everywhere at once.
 *
 *  A member row is identified by an id that may be an old alias of the person (`me` is John, `person-2` is Rahul); `canonicalPersonId`
 *  turns it into the id the rest of the prototype uses. Organisations that exist only as owners in the demo data (UN Women, OKF) have no
 *  workspace, so their few seats are listed here. */

import type { Membership, OrgRole } from '@/types/notifications'
import type { OrganisationRecord } from '@/types/organisation-workspace'

let organisations: OrganisationRecord[] = []

/** Called by the organisation store whenever it changes. */
export function setMembershipSource(next: OrganisationRecord[]) {
  organisations = next
}

/** Old ids that mean the same person as a current one. */
const PERSON_ALIASES: Record<string, string> = { me: 'john', 'person-2': 'rahul' }

export function canonicalPersonId(id: string): string {
  return PERSON_ALIASES[id] ?? id
}

/** Organisations that are only demo owners (no workspace), with the people who belong to them. */
const EXTERNAL_ORGANISATIONS: Record<string, { name: string; seats: { personId: string; role: OrgRole }[] }> = {
  'org-external-okf': { name: 'Open Knowledge Foundation', seats: [] },
  'org-external-unwomen': { name: 'UN Women', seats: [{ personId: 'meera', role: 'admin' }] },
}

/** The organisation's name, from its workspace when it has one. */
export function organisationNameOf(orgId: string): string | null {
  return organisations.find((o) => o.id === orgId)?.metadata.name ?? EXTERNAL_ORGANISATIONS[orgId]?.name ?? null
}

/** `personId`'s role in `orgId`, or null when they do not belong to it. */
export function roleInOrganisation(personId: string, orgId: string): OrgRole | null {
  const workspace = organisations.find((o) => o.id === orgId)
  if (workspace) return workspace.members.find((m) => canonicalPersonId(m.personId) === personId)?.role ?? null
  return EXTERNAL_ORGANISATIONS[orgId]?.seats.find((s) => s.personId === personId)?.role ?? null
}

/** The people who hold `role` in `orgId`. Only people with a place in the prototype's notifications (the ones in `candidateIds`) are named. */
export function peopleWithRole(orgId: string, role: OrgRole, candidateIds: string[]): string[] {
  return candidateIds.filter((id) => roleInOrganisation(id, orgId) === role)
}

/** The Evaluators with an active assignment to one record, who are still Evaluators of the organisation. */
export function activeEvaluatorsOf(orgId: string, module: string, recordId: string): string[] {
  const org = organisations.find((o) => o.id === orgId)
  if (!org) return []
  return (org.assignments ?? [])
    .filter((a) => a.status === 'active' && a.module === module && a.recordId === recordId)
    .map((a) => canonicalPersonId(a.evaluatorPersonId))
    .filter((id) => roleInOrganisation(id, orgId) === 'evaluator')
}

/** Everything `personId` belongs to: their personal workspace, then each organisation, with the role they hold there. */
export function membershipsOf(personId: string): Membership[] {
  const seats: Membership[] = [{ kind: 'personal' }]
  for (const o of organisations) {
    const role = roleInOrganisation(personId, o.id)
    if (role) seats.push({ kind: 'org', orgId: o.id, orgName: o.metadata.name, role })
  }
  for (const [orgId, external] of Object.entries(EXTERNAL_ORGANISATIONS)) {
    const seat = external.seats.find((s) => s.personId === personId)
    if (seat && !organisations.some((o) => o.id === orgId)) seats.push({ kind: 'org', orgId, orgName: external.name, role: seat.role })
  }
  return seats
}
