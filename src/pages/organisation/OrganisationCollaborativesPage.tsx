import { useNavigate } from 'react-router-dom'
import { ListChecks } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationCollaborativesPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { collaboratives, deleteCollaborative, unpublishCollaborative } = useAppData()
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
    liveHref: `/explore/collaboratives/${c.id}`,
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

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this Collaborative?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishCollaborative(item.id)
      toast({ title: 'Collaborative unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
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
      onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
      onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
      extraActions={(item) =>
        item.status === 'published'
          ? [{ key: 'items', icon: ListChecks, label: () => `Manage items: ${item.title || 'collaborative'}`, onClick: () => navigate(`/dashboard/collaboratives/${item.id}/items`) }]
          : []
      }
      emptyTitle="No organisation collaboratives yet"
      emptyDescription="Collaboratives created by this organisation's members will show up here."
      searchPlaceholder="Search collaboratives..."
    />
  )
}

export { OrganisationCollaborativesPage }
