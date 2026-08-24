import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DatasetCreationFlow } from '@/components/dataset/DatasetCreationFlow'
import { DatasetListView } from '@/components/dataset/DatasetListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

type View = 'list' | 'create'

interface DatasetNavState {
  datasetId?: string
}

function DatasetsPage() {
  const { datasets, deleteDataset, upsertDataset, events } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()
  const location = useLocation()

  const navState = (location.state as DatasetNavState | null) ?? null

  const [view, setView] = useState<View>(navState?.datasetId ? 'create' : 'list')
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(navState?.datasetId ?? null)
  const [activeInitialStep, setActiveInitialStep] = useState<1 | 2 | 3>(3)

  const openDataset = (id: string, initialStep: 1 | 2 | 3) => {
    setActiveDatasetId(id)
    setActiveInitialStep(initialStep)
    setView('create')
  }

  const handleAddDataset = () => {
    setActiveDatasetId(null)
    setActiveInitialStep(1)
    setView('create')
  }

  const handleViewDataset = (id: string) => openDataset(id, 3)
  const handleEditDataset = (id: string) => openDataset(id, 1)

  const handleDeleteDataset = async (id: string) => {
    const record = datasets.find((d) => d.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this dataset'

    const connectedEventCount = events.filter((event) =>
      event.form.relatedContent.datasets.some((d) => d.id === id),
    ).length

    const description =
      connectedEventCount > 0
        ? `"${name}" is connected to ${connectedEventCount} event${connectedEventCount === 1 ? '' : 's'}. Deleting it will remove the dataset from those connections. This action cannot be undone.`
        : `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`

    const ok = await confirm({
      title: 'Delete dataset?',
      description,
      confirmLabel: 'Delete Dataset',
      variant: 'destructive',
    })
    if (!ok) return
    deleteDataset(id)
    toast({ title: 'Dataset deleted', variant: 'success' })
  }

  const handleDiscardDataset = async (id: string) => {
    const record = datasets.find((d) => d.id === id)
    if (!record || !record.publishedForm) return
    const name = record.form.metadata.name || 'this dataset'
    const ok = await confirm({
      title: 'Discard pending changes?',
      description: `This will discard the pending changes to "${name}" and revert to the last published version. This cannot be undone.`,
      confirmLabel: 'Discard Changes',
      variant: 'destructive',
    })
    if (!ok) return
    upsertDataset(id, 'published', record.publishedForm)
    toast({ title: 'Changes discarded', description: 'Reverted to the last published version.', variant: 'success' })
  }

  const handleUnpublishDataset = async (id: string) => {
    const record = datasets.find((d) => d.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this dataset'
    const ok = await confirm({
      title: 'Unpublish this dataset?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    upsertDataset(id, 'draft', record.form)
    toast({ title: 'Dataset unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  if (view === 'list') {
    return (
      <DatasetListView
        datasets={datasets}
        onAddDataset={handleAddDataset}
        onViewDataset={handleViewDataset}
        onEditDataset={handleEditDataset}
        onDeleteDataset={handleDeleteDataset}
        onDiscardDataset={handleDiscardDataset}
        onUnpublishDataset={handleUnpublishDataset}
      />
    )
  }

  return (
    <DatasetCreationFlow
      variant="page"
      datasetId={activeDatasetId}
      initialStep={activeInitialStep}
      onClose={() => setView('list')}
    />
  )
}

export { DatasetsPage }
