/** Organisation Workspace — a shared workspace multiple members contribute to,
 * distinct from the lightweight `Organisation` reference type in `types/event.ts`
 * (used only to *tag* a dataset/use case/event with an affiliated org name). That
 * lighter type has no membership or roles; this one is the full workspace entity.
 * The two are intentionally not merged — reconciling them is a product decision
 * this implementation doesn't make (see the audit report's Known limitations). */

import type { UploadedAsset } from '@/lib/generic-upload'
import { ACTIVE_MEMBER_IDS } from '@/lib/notification-personas'

export type OrganisationRole = 'admin' | 'editor' | 'evaluator'

export const ORGANISATION_ROLE_OPTIONS: { value: OrganisationRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'evaluator', label: 'Evaluator' },
]

export function organisationRoleLabel(role: OrganisationRole): string {
  return ORGANISATION_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
}

/** Organisation type — kept isolated from the standard Dataset `SECTOR_OPTIONS`
 * and the tagging `Organisation.sectorType` values (event.ts): none of the
 * existing lists match the categories a workspace organisation needs, and
 * reconciling them is a product decision, not one this implementation makes. */
export const ORGANISATION_TYPE_OPTIONS = [
  { value: 'non-profit', label: 'Non-profit organisation' },
  { value: 'government', label: 'Government organisation' },
  { value: 'state-government', label: 'State government' },
  { value: 'academic', label: 'Academic institution' },
  { value: 'research', label: 'Research organisation' },
  { value: 'private', label: 'Private organisation' },
  { value: 'community', label: 'Community organisation' },
  { value: 'other', label: 'Other' },
]

export const ORGANISATION_NAME_MAX_LENGTH = 200

export interface OrganisationMember {
  id: string
  /** Links to `MockPerson.id` (mock-people.ts) — the existing stand-in contributor
   *  directory, reused here instead of inventing a new user list. The special id
   *  `'me'` denotes the current signed-in user (there is no real auth/session in
   *  this prototype — see Known limitations). */
  personId: string
  name: string
  email?: string
  /** Fictional persona — a stock headshot stands in for a real profile photo,
   *  same convention as `ContributorProfile.avatarDataUrl` (types/profile.ts). */
  avatarUrl?: string
  role: OrganisationRole
  joinedAt: string
  updatedAt: string
}

export interface OrganisationMetadata {
  name: string
  description: string
  type: string
  /** Labeled "Homepage" in the Create Organisation form — the field name is kept
   *  as-is (pre-existing, also read/written by Organisation Profile) rather than
   *  renamed to match the newer UI label. */
  website: string
  contactEmail: string
  logo: UploadedAsset | null
  /** Social profile fields use the same naming convention as `ProfileSocialLinks`
   *  (types/profile.ts) — including `x` for Twitter/X — for consistency across
   *  the app's two profile-editing surfaces. */
  linkedin: string
  github: string
  x: string
  location: string
}

export const emptyOrganisationMetadata: OrganisationMetadata = {
  name: '',
  description: '',
  type: '',
  website: '',
  contactEmail: '',
  logo: null,
  linkedin: '',
  github: '',
  x: '',
  location: '',
}

export type OrganisationInvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked'

export interface OrganisationInvitation {
  id: string
  /** Links to `MockPerson.id` — the same directory `OrganisationMember.personId` uses.
   *  Omitted for an invitation sent to a plain email address that has no existing
   *  CivicDataSpace account/person record. */
  personId?: string
  name: string
  email?: string
  role: OrganisationRole
  status: OrganisationInvitationStatus
  invitedAt: string
  /** Set for a shareable link: nobody is named until someone accepts it. */
  via?: 'link'
  /** Evaluator invitations only: the records the Evaluator will be assigned. They become active assignments when the invitation is
   *  accepted, not before, and only for records that are still published then. */
  evaluationScope?: EvaluationScopeItem[]
  invitedByPersonId?: string
  acceptedAt?: string
  /** When the invitee answered (accepted or declined). */
  respondedAt?: string
  /** Set when the invitation came from a shareable link (see `OrganisationInviteLink`): the link it was claimed through. */
  linkToken?: string
  /** When an Admin last sent a direct invitation again. `invitedAt` stays the date it was first sent. */
  resentAt?: string
  /** Optional deadline: a pending invitation past it reads as Expired and can no longer be accepted. Nothing sets it by default. */
  expiresAt?: string
}

/** A shareable invitation link. It exists from the moment an Admin generates it, but it is not an invitation yet: it appears in the
 *  Invitations tab (as a pending invitation) only when someone first opens it and claims it. A claimed link is consumed for good:
 *  nobody else can claim it, and it is never reset. It is kept by the organisation, with the role and (for an Evaluator) the records
 *  it was made for. */
export type OrganisationInviteLinkStatus = 'unclaimed' | 'claimed' | 'revoked'

export interface OrganisationInviteLink {
  token: string
  role: OrganisationRole
  evaluationScope?: EvaluationScopeItem[]
  createdByPersonId: string
  createdAt: string
  status: OrganisationInviteLinkStatus
  /** Who claimed it. `claimantKey` is the browser that opened it first, always present once claimed. `claimedByKey` is the account it has
   *  been bound to (an email, or `me` for the prototype's default signed-in person), present once the claimant is signed in. */
  claimantKey?: string
  claimedByKey?: string
  claimedAt?: string
  /** The pending invitation created at the first claim. */
  invitationId?: string
  /** Optional deadline for claiming: an unclaimed link past it reads as Expired and can no longer be claimed. Nothing sets it by default. */
  expiresAt?: string
}

/** The content modules an Evaluator can be assigned records from. Charts and Collaboratives are not assignable for now. */
export type EvaluationModule = 'dataset' | 'use-case' | 'ai-model' | 'publication' | 'event'

/** `active` is the only status that grants access. `invalidated` means the record stopped being published, so the assignment ended and is
 *  kept as history; republishing never restores it, an Admin has to assign the record again. */
export type EvaluationAssignmentStatus = 'active' | 'invalidated' | 'revoked'

export interface EvaluationAssignment {
  id: string
  /** The Evaluator's `OrganisationMember.personId`. */
  evaluatorPersonId: string
  module: EvaluationModule
  recordId: string
  assignedByPersonId: string
  assignedAt: string
  status: EvaluationAssignmentStatus
  endedAt?: string
  /** `record-unpublished`: the record stopped being published. `admin-revoked`: an Admin withdrew it or revoked the Evaluator's evaluation
   *  access. `membership-ended` / `role-changed`: the person was removed, or is no longer an Evaluator. */
  endedReason?: 'record-unpublished' | 'record-deleted' | 'admin-revoked' | 'membership-ended' | 'role-changed'
}

/** One record an Evaluator is (or is to be) assigned. */
export interface EvaluationScopeItem {
  module: EvaluationModule
  recordId: string
}

export interface OrganisationRecord {
  id: string
  metadata: OrganisationMetadata
  members: OrganisationMember[]
  invitations: OrganisationInvitation[]
  /** Evaluation assignments for this organisation. Absent on records saved before they existed. */
  assignments?: EvaluationAssignment[]
  /** Shareable invitation links made by this organisation's Admins. Absent on records saved before they existed. */
  inviteLinks?: OrganisationInviteLink[]
  /** People removed from this organisation, so a later update of the bundled sample never puts them back. Absent until someone is removed. */
  removedPersonIds?: string[]
  createdAt: string
  updatedAt: string
}

/** The synthetic person id the prototype's own profile and public "me" page use — see `OrganisationMember.personId`. It is John Doe's
 *  profile. Who is acting in a workspace is John, by `ACTIVE_MEMBER_IDS`; see `currentUserMembership`. */
export const CURRENT_USER_PERSON_ID = 'me'

/** The signed-in person's membership of `org`: the member row that is John Doe (see `ACTIVE_MEMBER_IDS`). */
export function currentUserMembership(org: OrganisationRecord): OrganisationMember | null {
  return org.members.find((m) => ACTIVE_MEMBER_IDS.includes(m.personId)) ?? null
}

export function currentUserRole(org: OrganisationRecord): OrganisationRole | null {
  return currentUserMembership(org)?.role ?? null
}

export function isOrganisationMember(org: OrganisationRecord): boolean {
  return currentUserMembership(org) !== null
}
