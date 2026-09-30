import * as React from 'react'
import { Ban, Pencil, Trash2 } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { AddMembersSideSheet } from '@/components/organisation/AddMembersSideSheet'
import { EditMemberRoleSideSheet } from '@/components/organisation/EditMemberRoleSideSheet'
import { Badge } from '@/components/ui/badge'
import { ManagementTable, type ManagementColumn, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { isLastAdmin } from '@/lib/organisation-permissions'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { initialsFor } from '@/lib/utils'
import { organisationRoleLabel, type OrganisationInvitation, type OrganisationMember } from '@/types/organisation-workspace'

function MemberAvatar({ member }: { member: OrganisationMember }) {
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-accent text-[10px] font-semibold text-text-on-accent">
      {initialsFor(member.name)}
    </span>
  )
}

const TABS = [
  { key: 'members', label: 'Members' },
  { key: 'invitations', label: 'Invitations' },
]

const INVITATION_STATUS_LABEL: Record<OrganisationInvitation['status'], string> = {
  pending: 'Pending',
  revoked: 'Revoked',
}

function OrganisationMembersPage() {
  const { organisation, permissions } = useOrganisation()
  const { removeOrganisationMember, revokeOrganisationInvitation } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  const [tab, setTab] = React.useState<'members' | 'invitations'>('members')
  const [addOpen, setAddOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<OrganisationMember | null>(null)

  if (!organisation) return <OrganisationNotFound />

  const handleRemove = async (member: OrganisationMember) => {
    const ok = await confirm({
      title: 'Remove Member',
      description: `This person will no longer have access to this organisation's workspace or contributions. Content they created stays with ${organisation.metadata.name}.`,
      confirmLabel: 'Remove Member',
      variant: 'destructive',
    })
    if (!ok) return
    removeOrganisationMember(organisation.id, member.id)
    toast({ title: 'Member removed successfully.', variant: 'success' })
  }

  const handleRevokeInvitation = async (invitation: OrganisationInvitation) => {
    const ok = await confirm({
      title: 'Revoke Invitation',
      description: `${invitation.name} will no longer be able to join ${organisation.metadata.name} using this invitation.`,
      confirmLabel: 'Revoke Invitation',
      variant: 'destructive',
    })
    if (!ok) return
    revokeOrganisationInvitation(organisation.id, invitation.id)
    toast({ title: 'Invitation revoked.', variant: 'success' })
  }

  const memberColumns: ManagementColumn<OrganisationMember>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      compare: (a, b) => a.name.localeCompare(b.name),
      render: (m) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <MemberAvatar member={m} />
          <TruncatedText className="font-medium text-text-default">{m.name}</TruncatedText>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      widthRem: '14rem',
      responsive: 'md',
      optional: true,
      render: (m) => m.email ?? '—',
    },
    {
      key: 'role',
      label: 'Role',
      widthRem: '8rem',
      optional: true,
      render: (m) => <Badge variant={m.role === 'admin' ? 'accent' : 'secondary'}>{organisationRoleLabel(m.role)}</Badge>,
    },
    {
      key: 'joined',
      label: 'Date joined',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.joinedAt).getTime() - parseAppTimestamp(b.joinedAt).getTime(),
      render: (m) => formatShortDate(m.joinedAt),
    },
  ]

  const getMemberActions = (member: OrganisationMember): ManagementRowAction<OrganisationMember>[] => {
    if (!permissions.canManageRoles) return []
    const actions: ManagementRowAction<OrganisationMember>[] = [
      { key: 'edit-role', icon: Pencil, label: () => `Edit role for ${member.name}`, onClick: () => setEditingMember(member) },
    ]
    if (permissions.canRemoveMembers && !isLastAdmin(organisation, member)) {
      actions.push({
        key: 'remove',
        icon: Trash2,
        label: () => `Remove ${member.name}`,
        onClick: () => handleRemove(member),
        destructive: true,
      })
    }
    return actions
  }

  const invitationColumns: ManagementColumn<OrganisationInvitation>[] = [
    {
      key: 'name',
      label: 'Person',
      sortable: true,
      compare: (a, b) => a.name.localeCompare(b.name),
      render: (i) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-accent text-[10px] font-semibold text-text-on-accent">
            {initialsFor(i.name)}
          </span>
          <div className="min-w-0">
            <TruncatedText className="font-medium text-text-default">{i.name}</TruncatedText>
            {i.email && <TruncatedText className="text-xs text-text-subdued">{i.email}</TruncatedText>}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      widthRem: '8rem',
      optional: true,
      render: (i) => <Badge variant={i.role === 'admin' ? 'accent' : 'secondary'}>{organisationRoleLabel(i.role)}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      widthRem: '8rem',
      optional: true,
      render: (i) => <Badge variant={i.status === 'pending' ? 'success' : 'secondary'}>{INVITATION_STATUS_LABEL[i.status]}</Badge>,
    },
    {
      key: 'invited',
      label: 'Date invited',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.invitedAt).getTime() - parseAppTimestamp(b.invitedAt).getTime(),
      render: (i) => formatShortDate(i.invitedAt),
    },
  ]

  const getInvitationActions = (invitation: OrganisationInvitation): ManagementRowAction<OrganisationInvitation>[] => {
    if (!permissions.canManageRoles || invitation.status !== 'pending') return []
    return [
      {
        key: 'revoke',
        icon: Ban,
        label: () => `Revoke invitation for ${invitation.name}`,
        onClick: () => handleRevokeInvitation(invitation),
        destructive: true,
      },
    ]
  }

  // Shared across both tabs so the header/actions never visibly change when
  // switching Members ↔ Invitations — only the tab row + table content below it does.
  const sharedTableProps = {
    title: 'Admin & Members',
    subtitle: () =>
      permissions.canAddMembers
        ? 'Manage organisation members and their access.'
        : 'View the people who are part of this organisation.',
    addLabel: permissions.canAddMembers ? 'Add Member' : undefined,
    onAdd: permissions.canAddMembers ? () => setAddOpen(true) : undefined,
    viewTabs: { items: TABS, value: tab, onChange: (key: string) => setTab(key as 'members' | 'invitations'), label: 'Admin & Members views' },
  } as const

  return (
    <div className="flex flex-col gap-6">
      {tab === 'members' ? (
        <ManagementTable<OrganisationMember, never>
          key="members"
          {...sharedTableProps}
          items={organisation.members}
          getId={(m) => m.id}
          columns={memberColumns}
          defaultSortKey="joined"
          defaultSortDirection="asc"
          searchPlaceholder="Search members..."
          searchMatch={(m, query) => m.name.toLowerCase().includes(query.trim().toLowerCase())}
          getActions={getMemberActions}
          emptyTitle="No members yet"
          emptyDescription="Add members to start collaborating in this organisation."
        />
      ) : (
        <ManagementTable<OrganisationInvitation, never>
          key="invitations"
          {...sharedTableProps}
          items={organisation.invitations}
          getId={(i) => i.id}
          columns={invitationColumns}
          defaultSortKey="invited"
          defaultSortDirection="desc"
          searchPlaceholder="Search invitations..."
          searchMatch={(i, query) => i.name.toLowerCase().includes(query.trim().toLowerCase())}
          getActions={getInvitationActions}
          emptyTitle="No invitations yet"
          emptyDescription="Invite people to join this organisation."
        />
      )}

      <AddMembersSideSheet open={addOpen} onOpenChange={setAddOpen} organisation={organisation} />
      <EditMemberRoleSideSheet organisation={organisation} member={editingMember} onOpenChange={(open) => !open && setEditingMember(null)} />
    </div>
  )
}

export { OrganisationMembersPage }
