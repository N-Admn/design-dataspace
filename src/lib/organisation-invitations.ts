/** The rows of the unified Admin & Members table: active members and every invitation record in one list, each with one status.
 *
 *  Nothing here is stored. Rows are derived from the organisation's members, invitations and shareable links, so no person or invitation is
 *  ever listed twice:
 *   - an accepted invitation is the member it created, so only the member is listed;
 *   - a claimed link is the pending invitation made when it was claimed, so only that invitation is listed;
 *   - a link nobody has claimed yet has no person to show, so it is not listed; it appears here only once someone claims it. */

import { parseAppTimestamp } from '@/lib/format'
import type { OrganisationInvitation, OrganisationInviteLink, OrganisationMember, OrganisationRecord, OrganisationRole } from '@/types/organisation-workspace'

export type MemberRowStatus = 'active' | 'pending' | 'declined' | 'revoked' | 'expired'

export const MEMBER_STATUS_OPTIONS: { key: MemberRowStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'declined', label: 'Declined' },
  { key: 'revoked', label: 'Revoked' },
  { key: 'expired', label: 'Expired' },
]

export const MEMBER_STATUS_LABEL: Record<MemberRowStatus, string> = { active: 'Active', pending: 'Pending', declined: 'Declined', revoked: 'Revoked', expired: 'Expired' }

export type MemberRow =
  | { kind: 'member'; id: string; status: 'active'; role: OrganisationRole; date: string; member: OrganisationMember }
  | { kind: 'invitation'; id: string; status: MemberRowStatus; role: OrganisationRole; date: string; invitation: OrganisationInvitation; link?: OrganisationInviteLink }
  | { kind: 'link'; id: string; status: MemberRowStatus; role: OrganisationRole; date: string; link: OrganisationInviteLink }

export function isPastDeadline(expiresAt: string | undefined, now: number = Date.now()): boolean {
  return Boolean(expiresAt) && parseAppTimestamp(expiresAt!).getTime() <= now
}

export function invitationStatus(invitation: OrganisationInvitation, now: number = Date.now()): MemberRowStatus {
  if (invitation.status === 'pending') return isPastDeadline(invitation.expiresAt, now) ? 'expired' : 'pending'
  if (invitation.status === 'accepted') return 'active'
  return invitation.status
}

export function buildMemberRows(organisation: OrganisationRecord, now: number = Date.now()): MemberRow[] {
  const links = organisation.inviteLinks ?? []
  const rows: MemberRow[] = organisation.members.map((member) => ({ kind: 'member', id: `member:${member.id}`, status: 'active', role: member.role, date: member.joinedAt, member }))
  for (const invitation of organisation.invitations) {
    if (invitation.status === 'accepted') continue
    // A link claimed by nobody we can name has no person to show, so it is not listed.
    if (invitation.via === 'link' && !invitation.email) continue
    const link = invitation.via === 'link' ? links.find((l) => l.token === invitation.linkToken || l.invitationId === invitation.id) : undefined
    rows.push({ kind: 'invitation', id: `invitation:${invitation.id}`, status: invitationStatus(invitation, now), role: invitation.role, date: invitation.invitedAt, invitation, link })
  }
  return rows
}

/** What the row's person cell and search say about it. */
export function rowName(row: MemberRow): string {
  return row.kind === 'member' ? row.member.name : row.kind === 'invitation' ? row.invitation.name : 'Invitation link'
}

export function rowEmail(row: MemberRow): string | undefined {
  return row.kind === 'member' ? row.member.email : row.kind === 'invitation' ? row.invitation.email : undefined
}

export function inviteLinkUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`
}
