import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationUseCasesPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { useCases, deleteUseCase, unpublishUseCase } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const organisationReturnTo = `/organisations/${organisationId}/use-cases`
  const orgUseCases = scope.filter('use-case', useCases.filter((u) => u.organisationId === organisationId))
  const items: OrganisationContentItem[] = orgUseCases.map((u) => ({
    id: u.id,
    title: u.form.metadata.title,
    status: u.status,
    updatedAt: u.updatedAt,
    createdBy: u.createdBy,
    liveHref: `/explore/use-cases/${u.id}`,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/use-cases/new', { state: { useCaseId: id ?? undefined, organisationId, organisationReturnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this use case'
    const ok = await confirm({
      title: 'Delete Use Case',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Use Case',
      variant: 'destructive',
    })
    if (!ok) return
    deleteUseCase(item.id)
    toast({ title: 'Use case deleted', variant: 'success' })
  }

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this use case?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishUseCase(item.id)
      toast({ title: 'Use case unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
  }

  return (
    <OrganisationContentTable
      title="Organisation Use Cases"
      primaryColumnLabel="Use Case"
      subtitle={(count) => `${count} use case${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Use Case"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
      onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
      emptyTitle="No organisation use cases yet"
      emptyDescription="Use cases created by this organisation's members will show up here."
      searchPlaceholder="Search use cases..."
    />
  )
}

export { OrganisationUseCasesPage }
