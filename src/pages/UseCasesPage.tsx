import { useNavigate } from 'react-router-dom'

import { UseCaseListView } from '@/components/usecase/UseCaseListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function UseCasesPage() {
  const navigate = useNavigate()
  const { useCases, deleteUseCase, unpublishUseCase } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openUseCase = (id: string, initialStep: 1 | 4) => {
    navigate('/dashboard/use-cases/new', { state: { useCaseId: id, initialStep } })
  }

  const handleDeleteUseCase = async (id: string) => {
    const record = useCases.find((u) => u.id === id)
    if (!record) return
    const name = record.form.metadata.title || 'this use case'
    const ok = await confirm({
      title: 'Delete use case?',
      description: `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Use Case',
      variant: 'destructive',
    })
    if (!ok) return
    deleteUseCase(id)
    toast({ title: 'Use case deleted', variant: 'success' })
  }

  const handleUnpublishUseCase = async (id: string) => {
    const record = useCases.find((u) => u.id === id)
    if (!record) return
    const name = record.form.metadata.title || 'this use case'
    const ok = await confirm({
      title: 'Unpublish this use case?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    unpublishUseCase(id)
    toast({ title: 'Use case unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <UseCaseListView
      useCases={useCases}
      onAddUseCase={() => navigate('/dashboard/use-cases/new')}
      onViewUseCase={(id) => openUseCase(id, 4)}
      onEditUseCase={(id) => openUseCase(id, 1)}
      onDeleteUseCase={handleDeleteUseCase}
      onUnpublishUseCase={handleUnpublishUseCase}
    />
  )
}

export { UseCasesPage }
