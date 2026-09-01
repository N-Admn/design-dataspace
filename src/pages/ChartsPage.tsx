import { useNavigate } from 'react-router-dom'

import { ChartListView } from '@/components/chart/ChartListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function ChartsPage() {
  const navigate = useNavigate()
  const { charts, deleteChart, unpublishChart } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openChart = (id: string, initialStep: 1 | 3) => {
    navigate('/dashboard/charts/new', { state: { chartId: id, initialStep } })
  }

  const handleDeleteChart = async (id: string) => {
    const record = charts.find((c) => c.id === id)
    if (!record) return
    const name = record.form.name || 'this chart'
    const ok = await confirm({
      title: 'Delete chart?',
      description: `Deleting "${name}" will permanently remove it. This action cannot be undone.`,
      confirmLabel: 'Delete Chart',
      variant: 'destructive',
    })
    if (!ok) return
    deleteChart(id)
    toast({ title: 'Chart deleted', variant: 'success' })
  }

  const handleUnpublishChart = async (id: string) => {
    const record = charts.find((c) => c.id === id)
    if (!record) return
    const name = record.form.name || 'this chart'
    const ok = await confirm({
      title: 'Unpublish this chart?',
      description: `"${name}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    unpublishChart(id)
    toast({ title: 'Chart unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <ChartListView
      charts={charts}
      onAddChart={() => navigate('/dashboard/charts/new')}
      onViewChart={(id) => openChart(id, 3)}
      onEditChart={(id) => openChart(id, 1)}
      onDeleteChart={handleDeleteChart}
      onUnpublishChart={handleUnpublishChart}
    />
  )
}

export { ChartsPage }
