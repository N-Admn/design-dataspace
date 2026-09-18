import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationUseCasesPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { useCases, deleteUseCase } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const organisationReturnTo = `/organisations/${organisationId}/use-cases`
  const orgUseCases = useCases.filter((u) => u.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgUseCases.map((u) => ({
    id: u.id,
    title: u.form.metadata.title,
    status: u.status,
    updatedAt: u.updatedAt,
    createdBy: u.createdBy,
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

  return (
    <OrganisationContentTable
      title="Organisation Use Cases"
      primaryColumnLabel="Use Case"
      subtitle={(count) => `${count} use case${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Use Case"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation use cases yet"
      emptyDescription="Use cases created by this organisation's members will show up here."
      searchPlaceholder="Search use cases..."
    />
  )
}

export { OrganisationUseCasesPage }
