import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationAIModelsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { aiModels, deleteAIModel, unpublishAIModel } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/ai-models`
  const orgAIModels = scope.filter('ai-model', aiModels.filter((m) => m.organisationId === organisationId))
  const items: OrganisationContentItem[] = orgAIModels.map((m) => ({
    id: m.id,
    title: m.form.metadata.name,
    status: m.status,
    updatedAt: m.updatedAt,
    createdBy: m.createdBy,
    liveHref: `/explore/ai-models/${m.id}`,
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

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this AI Model?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishAIModel(item.id)
      toast({ title: 'AI Model unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
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
      onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
      onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
      emptyTitle="No organisation AI Models yet"
      emptyDescription="AI Models created by this organisation's members will show up here."
      searchPlaceholder="Search AI Models..."
    />
  )
}

export { OrganisationAIModelsPage }
