import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, MailWarning } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { SIGN_IN_PATH } from '@/context/AuthContext'
import { readClaimantKey, useClaimIdentity } from '@/hooks/use-claim-identity'
import { orgAdmins } from '@/lib/notification-model'
import type { ClaimOutcome } from '@/lib/invite-links'
import { organisationRoleLabel, type OrganisationRecord } from '@/types/organisation-workspace'

const REGISTER_PATH = '/auth/register'

/** What the organisation's Admins are told when the link is claimed, and the same sentence reworded once the claimant's account is known. */
function claimNoticeDetail(organisationName: string, role: string, who: { name: string; email?: string } | null, evaluatorRecords: number): string {
  const person = who ? `${who.name}${who.email ? ` (${who.email})` : ''}` : 'Someone'
  const scope = evaluatorRecords > 0 ? ` They would review ${evaluatorRecords} published record${evaluatorRecords === 1 ? '' : 's'}.` : ''
  return `${person} claimed the invitation link for ${organisationName} and intends to join as ${role}.${scope} The link is now used. If this is the wrong person, revoke the invitation and generate a new link.`
}

/** The inboxes to tell: the organisation's Admins who have one in the prototype. */
function adminRecipients(organisation: OrganisationRecord): string[] {
  return orgAdmins(organisation.id)
}

function Panel({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-default px-6 py-12 text-center">
      {icon}
      <h1 className="type-heading-2 text-text-default">{title}</h1>
      {children}
    </div>
  )
}

/** The page an invitation link opens (`/invite/:token`). The first person to open it claims it; anyone opening it later sees where it
 *  stands. Signing in or registering returns here, so the same claimed invitation carries on. */
function InviteLinkPage() {
  const { token = '' } = useParams<{ token: string }>()
  const toast = useToast()
  const identity = useClaimIdentity()
  const { claimInviteLink, acceptInviteLink } = useAppData()
  const { notifyInvitationClaimed, updateInvitationClaimNotice } = useNotifications()
  const [outcome, setOutcome] = React.useState<ClaimOutcome | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [joining, setJoining] = React.useState(false)
  const [refresh, setRefresh] = React.useState(0)

  // Opening the link claims it (the first time) or resumes it. Claiming is safe to repeat: only the first call changes anything, so the
  // Admin is told once, however often this runs (a re-render, a reload, signing in, retrying signup).
  React.useEffect(() => {
    const result = claimInviteLink(token, readClaimantKey(), identity)
    setOutcome(result)
    if (result.status !== 'claimed' && result.status !== 'accepted') return
    const { organisation, invitation, firstClaim, boundNow } = result
    const records = invitation.evaluationScope?.length ?? 0
    const role = organisationRoleLabel(invitation.role)
    const who = invitation.email || invitation.personId ? { name: invitation.name, email: invitation.email } : null
    if (firstClaim) {
      notifyInvitationClaimed({
        invitationId: invitation.id,
        orgId: organisation.id,
        recipientIds: adminRecipients(organisation),
        title: `Invitation link claimed · ${organisation.metadata.name}`,
        detail: claimNoticeDetail(organisation.metadata.name, role, who, records),
        href: `/organisations/${organisation.id}/members`,
      })
    } else if (boundNow) {
      updateInvitationClaimNotice(invitation.id, claimNoticeDetail(organisation.metadata.name, role, who, records))
    }
  }, [token, identity, refresh, claimInviteLink, notifyInvitationClaimed, updateInvitationClaimNotice])

  if (!outcome) return null

  if (outcome.status === 'invalid') {
    return (
      <Panel icon={<MailWarning className="size-10 text-text-warning" />} title="This invitation link isn’t valid">
        <p className="text-sm text-text-subdued">Check the link, or ask an Admin of the organisation for a new one.</p>
      </Panel>
    )
  }

  const orgName = outcome.organisation.metadata.name

  if (outcome.status === 'revoked') {
    return (
      <Panel icon={<MailWarning className="size-10 text-text-warning" />} title="This invitation was revoked">
        <p className="text-sm text-text-subdued">It can no longer be used. Ask an Admin of {orgName} for a new link.</p>
      </Panel>
    )
  }

  if (outcome.status === 'used') {
    return (
      <Panel icon={<MailWarning className="size-10 text-text-warning" />} title="This invitation link has already been used">
        <p className="text-sm text-text-subdued">Each link works for one person. Ask an Admin of {orgName} for a new link.</p>
      </Panel>
    )
  }

  if (outcome.status === 'already-member') {
    return (
      <Panel icon={<CheckCircle2 className="size-10 text-text-success" />} title={`You’re already a member of ${orgName}`}>
        <p className="text-sm text-text-subdued">Opening this link did not use it up.</p>
        <Button asChild className="mt-2">
          <Link to="/organisations">Go to My Organisations</Link>
        </Button>
      </Panel>
    )
  }

  const { invitation } = outcome
  const role = organisationRoleLabel(invitation.role)
  const records = invitation.evaluationScope?.length ?? 0

  if (outcome.status === 'accepted') {
    return (
      <Panel icon={<CheckCircle2 className="size-10 text-text-success" />} title={`You joined ${orgName} as ${role}`}>
        <Button asChild className="mt-2">
          <Link to="/organisations">Go to My Organisations</Link>
        </Button>
      </Panel>
    )
  }

  const summary = (
    <p className="text-sm text-text-subdued">
      {invitation.role === 'evaluator'
        ? `You will review ${records} published record${records === 1 ? '' : 's'} assigned to you. Access starts when you join.`
        : `You will join as ${role}.`}
    </p>
  )

  if (!identity) {
    // Claimed, but no account yet: the claim is kept, and signing in or registering brings the person back here to carry on.
    const state = { from: `/invite/${token}` }
    return (
      <Panel title={`You’ve been invited to join ${orgName} as ${role}`}>
        {summary}
        <p className="text-sm text-text-subdued">This link is now reserved for you. Sign in or create an account to continue.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={SIGN_IN_PATH} state={state}>
              Sign in
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={REGISTER_PATH} state={state}>
              Create account
            </Link>
          </Button>
        </div>
      </Panel>
    )
  }

  const join = () => {
    setJoining(true)
    const result = acceptInviteLink(token, identity)
    setJoining(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    toast({ title: `You joined ${orgName}`, variant: 'success' })
    setRefresh((n) => n + 1)
  }

  return (
    <Panel title={`Join ${orgName} as ${role}`}>
      {summary}
      <p className="text-sm text-text-subdued">Signed in as {identity.name}.</p>
      {error && <p className="text-sm font-medium text-text-critical-strong">{error}</p>}
      <Button className="mt-2" onClick={join} disabled={joining}>
        Join {orgName}
      </Button>
    </Panel>
  )
}

export { InviteLinkPage }
