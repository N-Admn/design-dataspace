import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { AddMembersSideSheet } from '@/components/organisation/AddMembersSideSheet'
import { EditMemberRoleSideSheet } from '@/components/organisation/EditMemberRoleSideSheet'
import { InvitationDetailsSideSheet, type InvitationRow } from '@/components/organisation/InvitationDetailsSideSheet'
import { Badge } from '@/components/ui/badge'
import { ManagementTable, type ManagementColumn, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { isLastAdmin } from '@/lib/organisation-permissions'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { initialsFor } from '@/lib/utils'
import {
  MEMBER_STATUS_LABEL,
  buildMemberRows,
  inviteLinkUrl,
  rowEmail,
  rowName,
  type MemberRow,
  type MemberRowStatus,
} from '@/lib/organisation-invitations'
import { ORGANISATION_ROLE_OPTIONS, organisationRoleLabel, type OrganisationMember, type OrganisationRole } from '@/types/organisation-workspace'

/** The table's tabs: everyone, then one tab per role. */
const ROLE_TABS = ORGANISATION_ROLE_OPTIONS.map((o) => ({ key: o.value, label: o.label }))

const STATUS_ORDER: Record<MemberRowStatus, number> = { active: 0, pending: 1, declined: 2, revoked: 3, expired: 4 }

function Avatar({ row }: { row: MemberRow }) {
  if (row.kind === 'member' && row.member.avatarUrl) {
    return <img src={row.member.avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-accent text-[10px] font-semibold text-text-on-accent">
      {row.kind === 'link' ? 'IL' : initialsFor(rowName(row))}
    </span>
  )
}

function OrganisationMembersPage() {
  const { organisation, permissions } = useOrganisation()
  const { removeOrganisationMember, revokeOrganisationInvitation, revokeInviteLink, resendOrganisationInvitation } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  const [addOpen, setAddOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<OrganisationMember | null>(null)
  const [detailsRowId, setDetailsRowId] = React.useState<string | null>(null)

  const rows = React.useMemo(() => (organisation ? buildMemberRows(organisation) : []), [organisation])

  if (!organisation) return <OrganisationNotFound />

  const detailsRow = (rows.find((r) => r.id === detailsRowId && r.kind !== 'member') as InvitationRow | undefined) ?? null
  const fail = (error: unknown) => toast({ title: error instanceof Error ? error.message : 'Something went wrong. Please try again.', variant: 'error' })

  const handleRemove = async (member: OrganisationMember): Promise<boolean> => {
    const ok = await confirm({
      title: 'Remove Member',
      description: `This person will no longer have access to this organisation's workspace or contributions. Content they created stays with ${organisation.metadata.name}.`,
      confirmLabel: 'Remove Member',
      variant: 'destructive',
    })
    if (!ok) return false
    try {
      removeOrganisationMember(organisation.id, member.id)
      toast({ title: 'Member removed successfully.', variant: 'success' })
      return true
    } catch (error) {
      fail(error)
      return false
    }
  }

  const handleRevoke = async (row: InvitationRow) => {
    const isLink = row.kind === 'link'
    const ok = await confirm({
      title: isLink ? 'Revoke Link' : 'Revoke Invitation',
      description:
        row.kind === 'link'
          ? `Nobody will be able to join ${organisation.metadata.name} with this link. It cannot be opened again; generate a new link to invite someone.`
          : `${row.invitation.name} will no longer be able to join ${organisation.metadata.name} using this invitation${row.invitation.via === 'link' ? ', and its link will stop working' : ''}.`,
      confirmLabel: isLink ? 'Revoke Link' : 'Revoke Invitation',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      if (row.kind === 'link') revokeInviteLink(organisation.id, row.link.token)
      else revokeOrganisationInvitation(organisation.id, row.invitation.id)
      setDetailsRowId(null)
      toast({ title: isLink ? 'Link revoked.' : 'Invitation revoked.', variant: 'success' })
    } catch (error) {
      fail(error)
    }
  }

  const handleResend = (row: InvitationRow) => {
    if (row.kind !== 'invitation') return
    try {
      resendOrganisationInvitation(organisation.id, row.invitation.id)
      toast({ title: 'Invitation sent again.', description: row.invitation.email ?? row.invitation.name, variant: 'success' })
    } catch (error) {
      fail(error)
    }
  }

  const handleCopy = async (row: InvitationRow) => {
    if (row.kind !== 'link') return
    const url = inviteLinkUrl(row.link.token)
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Invite link copied', description: url, variant: 'success' })
    } catch {
      toast({ title: 'Invite link', description: url })
    }
  }

  const columns: ManagementColumn<MemberRow>[] = [
    {
      key: 'person',
      label: 'Person',
      sortable: true,
      compare: (a, b) => rowName(a).localeCompare(rowName(b)),
      render: (row) => {
        const email = rowEmail(row)
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar row={row} />
            <div className="min-w-0">
              <TruncatedText className="font-medium text-text-default">{rowName(row)}</TruncatedText>
              {email && <TruncatedText className="text-xs text-text-subdued">{email}</TruncatedText>}
            </div>
          </div>
        )
      },
    },
    {
      key: 'role',
      label: 'Role',
      widthRem: '8rem',
      optional: true,
      sortable: true,
      compare: (a, b) => organisationRoleLabel(a.role).localeCompare(organisationRoleLabel(b.role)),
      render: (row) => <Badge variant={row.role === 'admin' ? 'accent' : 'secondary'}>{organisationRoleLabel(row.role)}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      widthRem: '8rem',
      optional: true,
      sortable: true,
      compare: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || parseAppTimestamp(b.date).getTime() - parseAppTimestamp(a.date).getTime(),
      render: (row) => <Badge variant={row.status === 'active' || row.status === 'pending' ? 'success' : 'secondary'}>{MEMBER_STATUS_LABEL[row.status]}</Badge>,
    },
    {
      key: 'date',
      label: 'Date',
      widthRem: '9.5rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.date).getTime() - parseAppTimestamp(b.date).getTime(),
      render: (row) => (
        <div className="flex flex-col">
          <span>{formatShortDate(row.date)}</span>
          <span className="text-xs text-text-subdued">{row.kind === 'member' ? 'Joined' : row.kind === 'link' ? 'Link created' : 'Invited'}</span>
        </div>
      ),
    },
  ]

  /** One action per row: the chevron opens its drawer, where every detail and action lives. */
  const getActions = (): ManagementRowAction<MemberRow>[] =>
    permissions.canManageRoles
      ? [
          {
            key: 'open',
            icon: ChevronRight,
            label: (r: MemberRow) => `Open details for ${rowName(r)}`,
            onClick: (r: MemberRow) => (r.kind === 'member' ? setEditingMember(r.member) : setDetailsRowId(r.id)),
          },
        ]
      : []

  return (
    <div className="flex flex-col gap-6">
      <ManagementTable<MemberRow, OrganisationRole>
        title="Admin & Members"
        subtitle={() => (permissions.canAddMembers ? 'Manage organisation members and their access.' : 'View the people who are part of this organisation.')}
        addLabel={permissions.canAddMembers ? 'Add Member' : undefined}
        onAdd={permissions.canAddMembers ? () => setAddOpen(true) : undefined}
        items={rows}
        getId={(r) => r.id}
        columns={columns}
        defaultSortKey="status"
        defaultSortDirection="asc"
        statuses={ROLE_TABS}
        getStatus={(r) => r.role}
        tabEmptyMessage={(role) => `No ${organisationRoleLabel(role).toLowerCase()}s or ${organisationRoleLabel(role).toLowerCase()} invitations.`}
        searchPlaceholder="Search people and invitations..."
        searchMatch={(r, query) => {
          const q = query.trim().toLowerCase()
          const haystack = [rowName(r), rowEmail(r), organisationRoleLabel(r.role), MEMBER_STATUS_LABEL[r.status], r.kind === 'invitation' && r.invitation.via === 'link' ? 'invitation link' : '', r.kind === 'link' ? 'invitation link shareable' : '']
          return haystack.some((h) => h?.toLowerCase().includes(q))
        }}
        getActions={getActions}
        emptyTitle="No members yet"
        emptyDescription="Add members to start collaborating in this organisation."
      />

      <AddMembersSideSheet open={addOpen} onOpenChange={setAddOpen} organisation={organisation} />
      <EditMemberRoleSideSheet
        organisation={organisation}
        member={editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onRemove={
          editingMember && permissions.canRemoveMembers && !isLastAdmin(organisation, editingMember)
            ? async (member) => {
                if (await handleRemove(member)) setEditingMember(null)
              }
            : undefined
        }
      />
      <InvitationDetailsSideSheet
        organisation={organisation}
        row={detailsRow}
        onOpenChange={(open) => !open && setDetailsRowId(null)}
        onResend={handleResend}
        onCopyLink={handleCopy}
        onRevoke={handleRevoke}
      />
    </div>
  )
}

export { OrganisationMembersPage }
