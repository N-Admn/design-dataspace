import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationCollaborativesPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { collaboratives, deleteCollaborative } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/collaboratives`
  const orgCollaboratives = collaboratives.filter((c) => c.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgCollaboratives.map((c) => ({
    id: c.id,
    title: c.form.metadata.name,
    status: c.status,
    updatedAt: c.updatedAt,
    createdBy: c.createdBy,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/collaboratives/new', { state: { collaborativeId: id ?? undefined, organisationId, returnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this Collaborative'
    const ok = await confirm({
      title: 'Delete Collaborative',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Collaborative',
      variant: 'destructive',
    })
    if (!ok) return
    deleteCollaborative(item.id)
    toast({ title: 'Collaborative deleted', variant: 'success' })
  }

  return (
    <OrganisationContentTable
      title="Organisation Collaboratives"
      primaryColumnLabel="Collaborative"
      subtitle={(count) => `${count} collaborative${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Collaborative"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation collaboratives yet"
      emptyDescription="Collaboratives created by this organisation's members will show up here."
      searchPlaceholder="Search collaboratives..."
    />
  )
}

export { OrganisationCollaborativesPage }
