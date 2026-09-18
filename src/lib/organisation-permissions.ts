/** Central Organisation Workspace permission model — every role check in the
 * Organisation Workspace UI should call one of these, never compare
 * `role === 'admin'` inline, so the rules stay in one place.
 *
 * PRODUCT DECISIONS ASSUMED (undocumented upstream — flagged in the audit report):
 *  - Auditor is read-only: can view everything but never create or edit content,
 *    matching the usual meaning of "auditor" and the spec's explicit Admin/Editor
 *    "Yes" vs Auditor/Member "Based on existing rules" split.
 *  - Member behaves like a baseline contributor: can create content and edit their
 *    own, but cannot manage members, roles, or organisation settings.
 *  - Editor can create/edit content (including other members' content, since
 *    "editor" implies broader content authority) but has no membership/admin
 *    capability at all.
 * These are reasonable defaults for a prototype with no existing backend
 * permission logic to defer to — a real implementation should confirm them. */

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
  return role === 'admin' || role === 'editor' || role === 'member'
}

export function canEditOrganisationContent(role: OrganisationRole | null, isOwnContent: boolean): boolean {
  if (role === 'admin' || role === 'editor') return true
  if (role === 'member') return isOwnContent
  return false
}

export function canPublishOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor' || role === 'member'
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
