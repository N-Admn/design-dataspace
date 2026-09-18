/** Organisation Workspace — a shared workspace multiple members contribute to,
 * distinct from the lightweight `Organisation` reference type in `types/event.ts`
 * (used only to *tag* a dataset/use case/event with an affiliated org name). That
 * lighter type has no membership or roles; this one is the full workspace entity.
 * The two are intentionally not merged — reconciling them is a product decision
 * this implementation doesn't make (see the audit report's Known limitations). */

import type { UploadedAsset } from '@/lib/generic-upload'

export type OrganisationRole = 'admin' | 'editor' | 'auditor' | 'member'

export const ORGANISATION_ROLE_OPTIONS: { value: OrganisationRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'member', label: 'Member' },
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

export interface OrganisationRecord {
  id: string
  metadata: OrganisationMetadata
  members: OrganisationMember[]
  createdAt: string
  updatedAt: string
}

/** The current signed-in user's synthetic person id — see `OrganisationMember.personId`. */
export const CURRENT_USER_PERSON_ID = 'me'

export function currentUserMembership(org: OrganisationRecord): OrganisationMember | null {
  return org.members.find((m) => m.personId === CURRENT_USER_PERSON_ID) ?? null
}

export function currentUserRole(org: OrganisationRecord): OrganisationRole | null {
  return currentUserMembership(org)?.role ?? null
}

export function isOrganisationMember(org: OrganisationRecord): boolean {
  return currentUserMembership(org) !== null
}
