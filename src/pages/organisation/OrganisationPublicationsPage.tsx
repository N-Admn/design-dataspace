import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationPublicationsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { publications, deletePublication } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/publications`
  const orgPublications = publications.filter((p) => p.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgPublications.map((p) => ({
    id: p.id,
    title: p.form.metadata.name,
    status: p.status,
    updatedAt: p.updatedAt,
    createdBy: p.createdBy,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/publications/new', { state: { publicationId: id ?? undefined, organisationId, returnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this Publication'
    const ok = await confirm({
      title: 'Delete Publication',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Publication',
      variant: 'destructive',
    })
    if (!ok) return
    deletePublication(item.id)
    toast({ title: 'Publication deleted', variant: 'success' })
  }

  return (
    <OrganisationContentTable
      title="Organisation Publications"
      primaryColumnLabel="Publication"
      subtitle={(count) => `${count} publication${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Publication"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation publications yet"
      emptyDescription="Publications created by this organisation's members will show up here."
      searchPlaceholder="Search publications..."
    />
  )
}

export { OrganisationPublicationsPage }
