/** Central Organisation Workspace permission model — every role check in the
 * Organisation Workspace UI should call one of these, never compare
 * `role === 'admin'` inline, so the rules stay in one place.
 *
 * Three roles:
 *  - Admin and Editor have the same content permissions: create, edit, publish,
 *    unpublish and delete the organisation's content, and decide on what is submitted
 *    to it. The one difference is organisation management, which is Admin only: seeing
 *    and managing members (invite/add, change roles, remove), invitations, evaluator
 *    assignments and the organisation's profile.
 *  - Evaluator is a specialised role for AI model evaluation through Parakh —
 *    no access to manage the organisation's datasets, use cases, or other
 *    content; scoped to its own evaluator surface. */

import type { OrganisationMember, OrganisationRecord, OrganisationRole } from '@/types/organisation-workspace'
import { currentUserRole } from '@/types/organisation-workspace'

/** The members section (the list, invitations and every action on them) belongs to Admins. */
export function canViewMembers(role: OrganisationRole | null): boolean {
  return role === 'admin'
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

/** Publishing, unpublishing and deleting organisation content: the same for an Admin and an Editor. */
export function canPublishOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

export function canUnpublishOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

export function canDeleteOrganisationContent(role: OrganisationRole | null): boolean {
  return role === 'admin' || role === 'editor'
}

export type ContentAction = 'create' | 'edit' | 'publish' | 'unpublish' | 'delete'

const CONTENT_RULES: Record<ContentAction, (role: OrganisationRole | null) => boolean> = {
  create: canCreateContent,
  edit: canEditOrganisationContent,
  publish: canPublishOrganisationContent,
  unpublish: canUnpublishOrganisationContent,
  delete: canDeleteOrganisationContent,
}

export function canDoContentAction(role: OrganisationRole | null, action: ContentAction): boolean {
  return CONTENT_RULES[action](role)
}

/** Why `role` may not do `action` to organisation content, or null when it may. The store raises this as the error, and the screens show it. */
export function contentActionRefusal(role: OrganisationRole | null, action: ContentAction): string | null {
  if (canDoContentAction(role, action)) return null
  if (role === null) return 'You are not a member of this organisation.'
  if (role === 'evaluator') return 'Evaluators have read-only access to organisation content.'
  return 'You do not have permission to do that to this organisation’s content.'
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
    canUnpublishOrganisationContent: canUnpublishOrganisationContent(role),
    canDeleteOrganisationContent: canDeleteOrganisationContent(role),
  }
}
