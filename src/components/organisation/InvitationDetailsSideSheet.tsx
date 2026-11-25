import * as React from 'react'
import { Copy, Mail, Send } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { AssignedRecordsList } from '@/components/organisation/AssignedRecordsList'
import { EvaluationScopePicker } from '@/components/organisation/EvaluationScopePicker'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/components/ui/toast'
import { formatShortDate } from '@/lib/format'
import { getPerson } from '@/lib/notification-personas'
import { MEMBER_STATUS_LABEL, isPastDeadline, type MemberRow } from '@/lib/organisation-invitations'
import { initialsFor } from '@/lib/utils'
import {
  ORGANISATION_ROLE_OPTIONS,
  organisationRoleLabel,
  type EvaluationScopeItem,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

type InvitationRow = Extract<MemberRow, { kind: 'invitation' | 'link' }>

interface InvitationDetailsSideSheetProps {
  organisation: OrganisationRecord
  row: InvitationRow | null
  onOpenChange: (open: boolean) => void
  onResend: (row: InvitationRow) => void
  onCopyLink: (row: InvitationRow) => void
  onRevoke: (row: InvitationRow) => void
}

/** Where an invitation stands. One value drives the status line and the footer, so they can never disagree. */
type Lifecycle = 'unclaimed' | 'incomplete' | 'awaiting' | 'accepted' | 'direct-pending' | 'declined' | 'revoked' | 'expired'

const LIFECYCLE: Record<Lifecycle, { label: string; variant: 'success' | 'secondary' | 'accent'; text: string }> = {
  unclaimed: { label: 'Unclaimed', variant: 'success', text: 'Nobody has claimed this link. It stays available for one person and cannot be passed on.' },
  incomplete: { label: 'Claimed · registration incomplete', variant: 'success', text: 'The claimant has not finished creating an account. The invitation stays with them, and nobody else can use this link.' },
  awaiting: { label: 'Claimed · awaiting acceptance', variant: 'success', text: 'The claimant has an account but has not accepted the invitation yet.' },
  accepted: { label: 'Accepted', variant: 'accent', text: 'Has joined the organisation. Manage their membership from the members list.' },
  'direct-pending': { label: 'Awaiting response', variant: 'success', text: 'Waiting for the invited person to accept or decline.' },
  declined: { label: 'Declined', variant: 'secondary', text: 'The invited person declined. To invite them again, use Add Member.' },
  revoked: { label: 'Revoked', variant: 'secondary', text: 'No longer usable. To invite someone, use Add Member.' },
  expired: { label: 'Expired', variant: 'secondary', text: 'No longer usable. To invite someone, use Add Member.' },
}

function lifecycleOf(row: InvitationRow, isLink: boolean, accountLinked: boolean): Lifecycle {
  const invitation = row.kind === 'invitation' ? row.invitation : null
  if (invitation?.status === 'accepted') return 'accepted'
  if (row.status === 'revoked') return 'revoked'
  if (row.status === 'expired') return 'expired'
  if (invitation?.status === 'declined') return 'declined'
  if (!invitation) return 'unclaimed'
  if (!isLink) return 'direct-pending'
  return accountLinked ? 'awaiting' : 'incomplete'
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="type-eyebrow text-text-subdued">{children}</p>
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-subdued">{label}</p>
      <p className="mt-0.5 text-sm text-text-default">{children}</p>
    </div>
  )
}

function InvitationDetailsSideSheet({ organisation, row, onOpenChange, onResend, onCopyLink, onRevoke }: InvitationDetailsSideSheetProps) {
  const { updateOrganisationInvitationRole, updateInviteLinkRole } = useAppData()
  const toast = useToast()
  const [editingRole, setEditingRole] = React.useState(false)
  const [role, setRole] = React.useState<OrganisationRole | ''>('')
  const [scope, setScope] = React.useState<EvaluationScopeItem[]>([])
  const [showErrors, setShowErrors] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  const rowId = row?.id
  React.useEffect(() => {
    if (row) {
      setEditingRole(false)
      setRole(row.role)
      setScope((row.kind === 'invitation' ? row.invitation.evaluationScope : row.link.evaluationScope) ?? [])
      setShowErrors(false)
      setSaveError(null)
    }
    // Reset only when a different row is opened, not on every change to the organisation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId])

  if (!row) return <Dialog open={false} onOpenChange={onOpenChange} />

  const invitation = row.kind === 'invitation' ? row.invitation : null
  const link = row.link
  const isLink = row.kind === 'link' || invitation?.via === 'link'
  const accountLinked = Boolean(link?.claimedByKey) || Boolean(invitation?.personId)
  const lifecycle = lifecycleOf(row, isLink, accountLinked)
  const state = LIFECYCLE[lifecycle]
  const claimed = Boolean(invitation && isLink)
  const pending = lifecycle === 'unclaimed' || lifecycle === 'incomplete' || lifecycle === 'awaiting' || lifecycle === 'direct-pending'
  const records = (invitation ?? link)?.evaluationScope ?? []
  const invitedBy = getPerson(invitation?.invitedByPersonId ?? link?.createdByPersonId ?? '').name
  const expiresAt = invitation?.expiresAt ?? link?.expiresAt
  const statusLabel = lifecycle === 'accepted' ? 'Accepted' : MEMBER_STATUS_LABEL[row.status]
  const created = isLink && link ? link.createdAt : row.date

  const needsScope = role === 'evaluator'
  const scopeMissing = needsScope && scope.length === 0

  const handleSaveRole = () => {
    if (!role) return
    if (scopeMissing) {
      setShowErrors(true)
      return
    }
    try {
      if (row.kind === 'link') updateInviteLinkRole(organisation.id, row.link.token, role, role === 'evaluator' ? scope : undefined)
      else updateOrganisationInvitationRole(organisation.id, row.invitation.id, role, role === 'evaluator' ? scope : undefined)
      toast({ title: 'Invited role updated.', variant: 'success' })
      onOpenChange(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We couldn’t save this change. Please try again.')
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>{editingRole ? 'Change Invited Role' : 'Invitation Details'}</DialogTitle>
          <DialogDescription>
            {editingRole ? `Update the role this invitation gives in ${organisation.metadata.name}.` : `Manage this invitation to ${organisation.metadata.name}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {saveError && (
              <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                <p className="text-sm font-medium text-text-critical-strong">{saveError}</p>
              </div>
            )}

            {editingRole ? (
              <>
                <div>
                  <SectionLabel>Invited person</SectionLabel>
                  <p className="mt-1 text-sm font-semibold text-text-default">{invitation ? invitation.name : 'Not claimed yet'}</p>
                  {invitation?.email && <p className="text-xs text-text-subdued">{invitation.email}</p>}
                </div>
                <div>
                  <SectionLabel>Current role</SectionLabel>
                  <p className="mt-1 text-sm text-text-default">{organisationRoleLabel(row.role)}</p>
                </div>
                <div>
                  <Label htmlFor="invitation-new-role">New role</Label>
                  <div className="mt-1.5">
                    <SearchableSelect id="invitation-new-role" options={ORGANISATION_ROLE_OPTIONS} value={role} onChange={(v) => setRole(v as OrganisationRole)} placeholder="Select a role..." />
                  </div>
                </div>
                {needsScope && (
                  <EvaluationScopePicker
                    idPrefix="invitation-role-scope"
                    organisationId={organisation.id}
                    value={scope}
                    onChange={setScope}
                    error={showErrors && scopeMissing ? 'Choose at least one published record for this Evaluator to review.' : null}
                  />
                )}
              </>
            ) : (
              <>
                <section aria-label="Invitation" className="flex flex-col gap-1.5">
                  <SectionLabel>Invitation</SectionLabel>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-default">
                      {isLink ? <Copy className="size-4 text-text-subdued" /> : <Mail className="size-4 text-text-subdued" />}
                      {isLink ? 'Shareable link' : 'Email invitation'}
                    </span>
                    <Badge variant={row.status === 'pending' || lifecycle === 'accepted' ? 'success' : 'secondary'}>{statusLabel}</Badge>
                  </div>
                </section>

                <section aria-label="Recipient" className="flex flex-col gap-1.5 border-t border-border-default pt-4">
                  <SectionLabel>Recipient</SectionLabel>
                  {invitation ? (
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-accent text-xs font-semibold text-text-on-accent">{initialsFor(invitation.name)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-default">{invitation.name}</p>
                        {invitation.email && <p className="truncate text-xs text-text-subdued">{invitation.email}</p>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-text-default">Not claimed yet</p>
                      <p className="text-xs text-text-subdued">Nobody has opened this link, so there is no recipient yet.</p>
                    </div>
                  )}
                </section>

                <section aria-label="Details" className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border-default pt-4">
                  <Meta label="Assigned role">{organisationRoleLabel(row.role)}</Meta>
                  <Meta label="Invited by">{invitedBy}</Meta>
                  <Meta label={isLink ? 'Link created' : 'Date invited'}>{formatShortDate(created)}</Meta>
                  {claimed && <Meta label="Claimed">{formatShortDate(link?.claimedAt ?? invitation!.invitedAt)}</Meta>}
                  {invitation?.resentAt && <Meta label="Sent again">{formatShortDate(invitation.resentAt)}</Meta>}
                  {invitation?.status === 'declined' && invitation.respondedAt && <Meta label="Declined">{formatShortDate(invitation.respondedAt)}</Meta>}
                  {invitation?.status === 'accepted' && invitation.acceptedAt && <Meta label="Accepted">{formatShortDate(invitation.acceptedAt)}</Meta>}
                  {expiresAt && <Meta label={isPastDeadline(expiresAt) ? 'Expired' : 'Expires'}>{formatShortDate(expiresAt)}</Meta>}
                </section>

                {row.role === 'evaluator' && records.length > 0 && (
                  <section aria-label="Evaluator assignments" className="flex flex-col gap-2 border-t border-border-default pt-4">
                    <SectionLabel>{`Evaluator assignments (${records.length})`}</SectionLabel>
                    <AssignedRecordsList organisationId={organisation.id} scope={records} />
                  </section>
                )}

                <section aria-label="Claim and acceptance status" className="flex flex-col gap-1.5 border-t border-border-default pt-4">
                  <SectionLabel>{isLink ? 'Claim and acceptance' : 'Response'}</SectionLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={state.variant}>{state.label}</Badge>
                  </div>
                  <p className="text-sm text-text-subdued">{state.text}</p>
                </section>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border-default px-6 py-4">
          {editingRole ? (
            <>
              <Button type="button" variant="ghost" onClick={() => setEditingRole(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveRole} disabled={!role}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {pending && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onRevoke(row)}>
                    {lifecycle === 'unclaimed' ? 'Revoke Link' : 'Revoke Invitation'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingRole(true)}>
                    Change Role
                  </Button>
                  {lifecycle === 'direct-pending' && (
                    <Button type="button" onClick={() => onResend(row)}>
                      <Send className="size-4" />
                      Resend Invitation
                    </Button>
                  )}
                  {lifecycle === 'unclaimed' && (
                    <Button type="button" onClick={() => onCopyLink(row)}>
                      <Copy className="size-4" />
                      Copy Link
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { InvitationDetailsSideSheet }
export type { InvitationRow }
