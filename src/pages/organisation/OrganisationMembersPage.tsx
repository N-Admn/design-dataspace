import * as React from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { AddMemberSideSheet } from '@/components/organisation/AddMemberSideSheet'
import { EditMemberRoleSideSheet } from '@/components/organisation/EditMemberRoleSideSheet'
import { Badge } from '@/components/ui/badge'
import { ManagementTable, type ManagementColumn, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { isLastAdmin } from '@/lib/organisation-permissions'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'
import { organisationRoleLabel, type OrganisationMember } from '@/types/organisation-workspace'

function OrganisationMembersPage() {
  const { organisation, permissions } = useOrganisation()
  const { removeOrganisationMember } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

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

  const columns: ManagementColumn<OrganisationMember>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      compare: (a, b) => a.name.localeCompare(b.name),
      render: (m) => <TruncatedText className="font-medium text-text-default">{m.name}</TruncatedText>,
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

  const getActions = (member: OrganisationMember): ManagementRowAction<OrganisationMember>[] => {
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

  return (
    <div className="flex flex-col gap-6">
      <ManagementTable<OrganisationMember, never>
        title="Admin & Members"
        subtitle={() =>
          permissions.canAddMembers
            ? 'Manage organisation members and their access.'
            : 'View the people who are part of this organisation.'
        }
        addLabel={permissions.canAddMembers ? 'Add Member' : undefined}
        onAdd={permissions.canAddMembers ? () => setAddOpen(true) : undefined}
        items={organisation.members}
        getId={(m) => m.id}
        columns={columns}
        defaultSortKey="joined"
        defaultSortDirection="asc"
        searchPlaceholder="Search members..."
        searchMatch={(m, query) => m.name.toLowerCase().includes(query.trim().toLowerCase())}
        getActions={getActions}
        emptyTitle="No members yet"
        emptyDescription="Add members to start collaborating in this organisation."
      />

      <AddMemberSideSheet open={addOpen} onOpenChange={setAddOpen} organisation={organisation} />
      <EditMemberRoleSideSheet organisation={organisation} member={editingMember} onOpenChange={(open) => !open && setEditingMember(null)} />
    </div>
  )
}

export { OrganisationMembersPage }
