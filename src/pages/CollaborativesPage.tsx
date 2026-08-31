import { useNavigate } from 'react-router-dom'

import { CollaborativeListView } from '@/components/collaborative/CollaborativeListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function CollaborativesPage() {
  const navigate = useNavigate()
  const { collaboratives, deleteCollaborative, upsertCollaborative, unpublishCollaborative } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openCollaborative = (id: string, initialStep: 1 | 4) => {
    navigate('/dashboard/collaboratives/new', { state: { collaborativeId: id, initialStep } })
  }

  const handleDeleteCollaborative = async (id: string) => {
    const record = collaboratives.find((c) => c.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this Collaborative'
    const ok = await confirm({
      title: 'Delete Collaborative?',
      description: `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Collaborative',
      variant: 'destructive',
    })
    if (!ok) return
    deleteCollaborative(id)
    toast({ title: 'Collaborative deleted', variant: 'success' })
  }

  const handleDiscardCollaborative = async (id: string) => {
    const record = collaboratives.find((c) => c.id === id)
    if (!record || !record.publishedForm) return
    const name = record.form.metadata.name || 'this Collaborative'
    const ok = await confirm({
      title: 'Discard unsaved changes?',
      description: `This will discard the unsaved changes to "${name}" and restore the last published version. This cannot be undone.`,
      confirmLabel: 'Discard Changes',
      variant: 'destructive',
    })
    if (!ok) return
    upsertCollaborative(id, 'published', record.publishedForm)
    toast({ title: 'Changes discarded', description: 'Restored the last published version.', variant: 'success' })
  }

  const handleUnpublishCollaborative = async (id: string) => {
    const record = collaboratives.find((c) => c.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this Collaborative'
    const ok = await confirm({
      title: 'Unpublish this Collaborative?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    unpublishCollaborative(id)
    toast({ title: 'Collaborative unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <CollaborativeListView
      collaboratives={collaboratives}
      onAddCollaborative={() => navigate('/dashboard/collaboratives/new')}
      onViewCollaborative={(id) => openCollaborative(id, 4)}
      onEditCollaborative={(id) => openCollaborative(id, 1)}
      onDeleteCollaborative={handleDeleteCollaborative}
      onDiscardCollaborative={handleDiscardCollaborative}
      onUnpublishCollaborative={handleUnpublishCollaborative}
    />
  )
}

export { CollaborativesPage }
