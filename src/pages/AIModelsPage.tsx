import { useNavigate } from 'react-router-dom'

import { AIModelListView } from '@/components/ai-model/AIModelListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function AIModelsPage() {
  const navigate = useNavigate()
  const { aiModels, deleteAIModel, upsertAIModel } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openAIModel = (id: string, initialStep: 1 | 3) => {
    navigate('/dashboard/ai-models/new', { state: { aiModelId: id, initialStep } })
  }

  const handleDeleteAIModel = async (id: string) => {
    const record = aiModels.find((m) => m.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this AI Model'
    const ok = await confirm({
      title: 'Delete AI Model?',
      description: `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`,
      confirmLabel: 'Delete AI Model',
      variant: 'destructive',
    })
    if (!ok) return
    deleteAIModel(id)
    toast({ title: 'AI Model deleted', variant: 'success' })
  }

  const handleDiscardAIModel = async (id: string) => {
    const record = aiModels.find((m) => m.id === id)
    if (!record || !record.publishedForm) return
    const name = record.form.metadata.name || 'this AI Model'
    const ok = await confirm({
      title: 'Discard pending changes?',
      description: `This will discard the pending changes to "${name}" and revert to the last published version. This cannot be undone.`,
      confirmLabel: 'Discard Changes',
      variant: 'destructive',
    })
    if (!ok) return
    upsertAIModel(id, 'published', record.publishedForm)
    toast({ title: 'Changes discarded', description: 'Reverted to the last published version.', variant: 'success' })
  }

  const handleUnpublishAIModel = async (id: string) => {
    const record = aiModels.find((m) => m.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this AI Model'
    const ok = await confirm({
      title: 'Unpublish this AI Model?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    upsertAIModel(id, 'draft', record.form)
    toast({ title: 'AI Model unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <AIModelListView
      aiModels={aiModels}
      onAddAIModel={() => navigate('/dashboard/ai-models/new')}
      onViewAIModel={(id) => openAIModel(id, 3)}
      onEditAIModel={(id) => openAIModel(id, 1)}
      onDeleteAIModel={handleDeleteAIModel}
      onDiscardAIModel={handleDiscardAIModel}
      onUnpublishAIModel={handleUnpublishAIModel}
    />
  )
}

export { AIModelsPage }
