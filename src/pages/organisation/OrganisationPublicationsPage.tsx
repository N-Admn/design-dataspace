import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationPublicationsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { publications, deletePublication, unpublishPublication } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/publications`
  const orgPublications = scope.filter('publication', publications.filter((p) => p.organisationId === organisationId))
  const items: OrganisationContentItem[] = orgPublications.map((p) => ({
    id: p.id,
    title: p.form.metadata.name,
    status: p.status,
    updatedAt: p.updatedAt,
    createdBy: p.createdBy,
    liveHref: `/explore/publications/${p.id}`,
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

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this Publication?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishPublication(item.id)
      toast({ title: 'Publication unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
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
      onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
      onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
      emptyTitle="No organisation publications yet"
      emptyDescription="Publications created by this organisation's members will show up here."
      searchPlaceholder="Search publications..."
    />
  )
}

export { OrganisationPublicationsPage }
