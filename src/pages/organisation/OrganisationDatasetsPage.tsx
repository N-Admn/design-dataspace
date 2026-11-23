import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { DatasetCreationFlow } from '@/components/dataset/DatasetCreationFlow'
import { DatasetTypeDialog } from '@/components/dataset/DatasetTypeDialog'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { DatasetType } from '@/types/dataset'

function OrganisationDatasetsPage() {
  const { organisationId, organisation, permissions } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { datasets, deleteDataset, unpublishDataset } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  // Edit on a dataset's public page lands here with the dataset to open.
  const navState = (useLocation().state as { datasetId?: string; initialStep?: 1 | 2 | 3 } | null) ?? null
  const [view, setView] = useState<'list' | 'create'>(navState?.datasetId ? 'create' : 'list')
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(navState?.datasetId ?? null)
  const [pendingDatasetType, setPendingDatasetType] = useState<DatasetType>('dataset')
  const [showTypeDialog, setShowTypeDialog] = useState(false)

  if (!organisation) return <OrganisationNotFound />

  const orgDatasets = scope.filter('dataset', datasets.filter((d) => d.organisationId === organisationId))
  const items: OrganisationContentItem[] = orgDatasets.map((d) => ({
    id: d.id,
    title: d.form.metadata.name,
    status: d.status,
    updatedAt: d.updatedAt,
    createdBy: d.createdBy,
    liveHref: `/explore/datasets/${d.id}`,
  }))

  const openDataset = (id: string) => {
    setActiveDatasetId(id)
    setView('create')
  }

  const handleAddDataset = () => setShowTypeDialog(true)

  const handleTypeSelected = (type: DatasetType) => {
    setShowTypeDialog(false)
    setPendingDatasetType(type)
    setActiveDatasetId(null)
    setView('create')
  }

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this dataset'
    const ok = await confirm({
      title: 'Delete Dataset',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Dataset',
      variant: 'destructive',
    })
    if (!ok) return
    deleteDataset(item.id)
    toast({ title: 'Dataset deleted', variant: 'success' })
  }

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this dataset?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishDataset(item.id)
      toast({ title: 'Dataset unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
  }

  if (view === 'create') {
    return (
      <DatasetCreationFlow
        variant="page"
        datasetId={activeDatasetId}
        initialDatasetType={pendingDatasetType}
        organisationId={organisationId}
        organisationName={organisation.metadata.name}
        canCreateContent={permissions.canCreateContent}
        onClose={() => setView('list')}
      />
    )
  }

  return (
    <>
      <OrganisationContentTable
        title="Organisation Datasets"
        primaryColumnLabel="Dataset"
        subtitle={(count) => `${count} dataset${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
        addLabel="Create Dataset"
        onAdd={permissions.canCreateContent ? handleAddDataset : undefined}
        items={items}
        onOpen={(item) => openDataset(item.id)}
        onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
        onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
        emptyTitle="No organisation datasets yet"
        emptyDescription="Datasets created by this organisation's members will show up here."
        searchPlaceholder="Search datasets..."
      />
      <DatasetTypeDialog open={showTypeDialog} onOpenChange={setShowTypeDialog} onContinue={handleTypeSelected} />
    </>
  )
}

export { OrganisationDatasetsPage }
