import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationAIModelsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { aiModels, deleteAIModel } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/ai-models`
  const orgAIModels = aiModels.filter((m) => m.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgAIModels.map((m) => ({
    id: m.id,
    title: m.form.metadata.name,
    status: m.status,
    updatedAt: m.updatedAt,
    createdBy: m.createdBy,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/ai-models/new', { state: { aiModelId: id ?? undefined, organisationId, returnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this AI Model'
    const ok = await confirm({
      title: 'Delete AI Model',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete AI Model',
      variant: 'destructive',
    })
    if (!ok) return
    deleteAIModel(item.id)
    toast({ title: 'AI Model deleted', variant: 'success' })
  }

  return (
    <OrganisationContentTable
      title="Organisation AI Models"
      primaryColumnLabel="AI Model"
      subtitle={(count) => `${count} AI model${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create AI Model"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation AI Models yet"
      emptyDescription="AI Models created by this organisation's members will show up here."
      searchPlaceholder="Search AI Models..."
    />
  )
}

export { OrganisationAIModelsPage }
