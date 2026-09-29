/** Central Organisation Workspace permission model — every role check in the
 * Organisation Workspace UI should call one of these, never compare
 * `role === 'admin'` inline, so the rules stay in one place.
 *
 * Three roles:
 *  - Admin manages the organisation and its members (add/remove/change roles,
 *    org settings), plus full content authority.
 *  - Editor manages the organisation's content (datasets, use cases, etc.) but
 *    has no membership/admin capability.
 *  - Evaluator is a specialised role for AI model evaluation through Parakh —
 *    no access to manage the organisation's datasets, use cases, or other
 *    content; scoped to its own evaluator surface. */

import type { OrganisationMember, OrganisationRecord, OrganisationRole } from '@/types/organisation-workspace'
import { currentUserRole } from '@/types/organisation-workspace'

export function canViewMembers(_role: OrganisationRole | null): boolean {
  return true
}

export function canAddMembers(role: OrganisationRole | null): boolean {
  return role === 'admin'
}

export function canEditMemberRole(role: OrganisationRole | null): boolean {
  return role === 'admin'
}

export function canRemoveMembers(role: OrganisationRole | null): boolean {
  return role === 'admin'
}

export function canManageRoles(role: OrganisationRole | null): boolean {
  return role === 'admin'
}

export function canEditOrganisation(role: OrganisationRole | null): boolean {
  return role === 'admin'
}

export function canCreateContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

export function canEditOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

export function canPublishOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

/** Guards against ever leaving an organisation with zero admins. */
export function isLastAdmin(org: OrganisationRecord, member: OrganisationMember): boolean {
  if (member.role !== 'admin') return false
  return org.members.filter((m) => m.role === 'admin').length <= 1
}

export function currentUserPermissions(org: OrganisationRecord) {
  const role = currentUserRole(org)
  return {
    role,
    canViewMembers: canViewMembers(role),
    canAddMembers: canAddMembers(role),
    canEditMemberRole: canEditMemberRole(role),
    canRemoveMembers: canRemoveMembers(role),
    canManageRoles: canManageRoles(role),
    canEditOrganisation: canEditOrganisation(role),
    canCreateContent: canCreateContent(role),
    canPublishOrganisationContent: canPublishOrganisationContent(role),
  }
}
