import { useNavigate } from 'react-router-dom'

import { UseCaseListView } from '@/components/usecase/UseCaseListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function UseCasesPage() {
  const navigate = useNavigate()
  const { useCases, deleteUseCase } = useAppData()
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

  return (
    <UseCaseListView
      useCases={useCases}
      onAddUseCase={() => navigate('/dashboard/use-cases/new')}
      onViewUseCase={(id) => openUseCase(id, 4)}
      onEditUseCase={(id) => openUseCase(id, 1)}
      onDeleteUseCase={handleDeleteUseCase}
    />
  )
}

export { UseCasesPage }
