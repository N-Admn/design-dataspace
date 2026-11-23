/** The single-use invitation link: generating it, claiming it and resolving what a person sees when they open it.
 *
 *  Rules:
 *   - A link is shareable, but only the first person to open it claims it. Claiming creates one pending invitation and consumes the link
 *     for good; nobody else can claim it, even if the claimant never finishes.
 *   - Opening a claimed link again resumes the same invitation. It never makes another invitation.
 *   - A person who is already a member does not claim (and so does not use up) a link.
 *   - A revoked invitation, or a revoked link, is closed for good. */

import type { OrganisationInvitation, OrganisationInviteLink, OrganisationRecord } from '@/types/organisation-workspace'

/** Who is opening the link. `key` identifies the account (an email, or `me` for the prototype's default signed-in person). */
interface ClaimIdentity {
  key: string
  name: string
  email?: string
  /** The `OrganisationMember.personId` this account is known by, and every id that already means this person in a member list. */
  personId: string
  memberIds: string[]
}

type ClaimOutcome =
  | { status: 'invalid' }
  | { status: 'revoked'; organisation: OrganisationRecord }
  /** Claimed by someone else: it can never be used by this person. */
  | { status: 'used'; organisation: OrganisationRecord }
  | { status: 'already-member'; organisation: OrganisationRecord }
  | {
      status: 'claimed' | 'accepted'
      organisation: OrganisationRecord
      link: OrganisationInviteLink
      invitation: OrganisationInvitation
      /** True only for the call that claimed the link: the one moment the Admin is told. */
      firstClaim: boolean
      /** True when this call attached the claimant's account to a link claimed before they were signed in. */
      boundNow: boolean
    }

function generateInviteToken(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return `inv-${Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('')}`
}

function findInviteLink(organisations: OrganisationRecord[], token: string): { organisation: OrganisationRecord; link: OrganisationInviteLink } | null {
  for (const organisation of organisations) {
    const link = organisation.inviteLinks?.find((l) => l.token === token)
    if (link) return { organisation, link }
  }
  return null
}

function isMemberIdentity(organisation: OrganisationRecord, identity: ClaimIdentity): boolean {
  return organisation.members.some(
    (m) => identity.memberIds.includes(m.personId) || (identity.email !== undefined && m.email?.toLowerCase() === identity.email.toLowerCase()),
  )
}

/** Works out what happens when `claimant` opens `token`. Pure: returns the outcome and the organisation as it should be saved (the same
 *  object when nothing changed). `claimantKey` is the browser; `identity` is the signed-in account, absent when signed out. */
function resolveClaim(
  organisations: OrganisationRecord[],
  token: string,
  claimantKey: string,
  identity: ClaimIdentity | null,
  now: string,
  newInvitationId: () => string,
): { outcome: ClaimOutcome; organisation: OrganisationRecord | null } {
  const found = findInviteLink(organisations, token)
  if (!found) return { outcome: { status: 'invalid' }, organisation: null }
  const { organisation, link } = found

  if (link.status === 'revoked') return { outcome: { status: 'revoked', organisation }, organisation }

  if (link.status === 'claimed') {
    const invitation = organisation.invitations.find((i) => i.id === link.invitationId)
    if (!invitation) return { outcome: { status: 'invalid' }, organisation }
    if (invitation.status === 'revoked') return { outcome: { status: 'revoked', organisation }, organisation }

    // Is this the person who claimed it? A link bound to an account belongs to that account; one claimed before sign-in belongs to the
    // browser that claimed it, until an account is attached.
    // Signed out, the browser that claimed it can still come back to sign in; signed in as a different account it cannot.
    const sameClaimant = link.claimedByKey && identity ? identity.key === link.claimedByKey : link.claimantKey === claimantKey
    if (!sameClaimant) return { outcome: { status: 'used', organisation }, organisation }

    if (!link.claimedByKey && identity) {
      // The claimant has signed in or registered: attach the account to the claim that already exists. Never to someone who already
      // belongs to the organisation, who is not the person it was claimed for.
      if (isMemberIdentity(organisation, identity)) return { outcome: { status: 'already-member', organisation }, organisation }
      const boundLink: OrganisationInviteLink = { ...link, claimedByKey: identity.key }
      const boundInvitation: OrganisationInvitation = { ...invitation, name: identity.name, email: identity.email, personId: identity.personId }
      const next: OrganisationRecord = {
        ...organisation,
        updatedAt: now,
        inviteLinks: (organisation.inviteLinks ?? []).map((l) => (l.token === token ? boundLink : l)),
        invitations: organisation.invitations.map((i) => (i.id === invitation.id ? boundInvitation : i)),
      }
      return { outcome: { status: 'claimed', organisation: next, link: boundLink, invitation: boundInvitation, firstClaim: false, boundNow: true }, organisation: next }
    }
    return {
      outcome: { status: invitation.status === 'accepted' ? 'accepted' : 'claimed', organisation, link, invitation, firstClaim: false, boundNow: false },
      organisation,
    }
  }

  // Unclaimed. Someone who already belongs to the organisation has nothing to join, so opening it does not use the link up.
  if (identity && isMemberIdentity(organisation, identity)) return { outcome: { status: 'already-member', organisation }, organisation }

  const invitation: OrganisationInvitation = {
    id: newInvitationId(),
    personId: identity?.personId,
    name: identity?.name ?? 'Invited person',
    email: identity?.email,
    role: link.role,
    status: 'pending',
    invitedAt: now,
    via: 'link',
    linkToken: link.token,
    evaluationScope: link.role === 'evaluator' ? link.evaluationScope : undefined,
    invitedByPersonId: link.createdByPersonId,
  }
  const claimedLink: OrganisationInviteLink = {
    ...link,
    status: 'claimed',
    claimantKey,
    claimedByKey: identity?.key,
    claimedAt: now,
    invitationId: invitation.id,
  }
  const next: OrganisationRecord = {
    ...organisation,
    updatedAt: now,
    inviteLinks: (organisation.inviteLinks ?? []).map((l) => (l.token === token ? claimedLink : l)),
    invitations: [...organisation.invitations, invitation],
  }
  return { outcome: { status: 'claimed', organisation: next, link: claimedLink, invitation, firstClaim: true, boundNow: false }, organisation: next }
}

export { generateInviteToken, findInviteLink, isMemberIdentity, resolveClaim }
export type { ClaimIdentity, ClaimOutcome }
