import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationChartsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { charts, deleteChart } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/charts`
  const orgCharts = charts.filter((c) => c.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgCharts.map((c) => ({
    id: c.id,
    title: c.form.name,
    status: c.status,
    updatedAt: c.updatedAt,
    createdBy: c.createdBy,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/charts/new', { state: { chartId: id ?? undefined, organisationId, returnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this chart'
    const ok = await confirm({
      title: 'Delete Chart',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Chart',
      variant: 'destructive',
    })
    if (!ok) return
    deleteChart(item.id)
    toast({ title: 'Chart deleted', variant: 'success' })
  }

  return (
    <OrganisationContentTable
      title="Organisation Charts"
      primaryColumnLabel="Chart"
      subtitle={(count) => `${count} chart${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Chart"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation charts yet"
      emptyDescription="Charts created by this organisation's members will show up here."
      searchPlaceholder="Search charts..."
    />
  )
}

export { OrganisationChartsPage }
