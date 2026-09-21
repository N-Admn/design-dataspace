import { useNavigate } from 'react-router-dom'

import { PublicationListView } from '@/components/publication/PublicationListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function PublicationsPage() {
  const navigate = useNavigate()
  const { publications, deletePublication, unpublishPublication } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openPublication = (id: string, initialStep: 1 | 3) => {
    navigate('/dashboard/publications/new', { state: { publicationId: id, initialStep } })
  }

  const handleDeletePublication = async (id: string) => {
    const record = publications.find((p) => p.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this Publication'
    const ok = await confirm({
      title: 'Delete Publication',
      description: `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Publication',
      variant: 'destructive',
    })
    if (!ok) return
    deletePublication(id)
    toast({ title: 'Publication deleted', variant: 'success' })
  }

  const handleUnpublishPublication = async (id: string) => {
    const record = publications.find((p) => p.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this Publication'
    const ok = await confirm({
      title: 'Unpublish this Publication?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    unpublishPublication(id)
    toast({ title: 'Publication unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <PublicationListView
      publications={publications}
      onAddPublication={() => navigate('/dashboard/publications/new')}
      onViewPublication={(id) => openPublication(id, 3)}
      onEditPublication={(id) => openPublication(id, 1)}
      onDeletePublication={handleDeletePublication}
      onUnpublishPublication={handleUnpublishPublication}
    />
  )
}

export { PublicationsPage }
