import { useNavigate } from 'react-router-dom'

import { EventListView } from '@/components/event/EventListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function EventsPage() {
  const navigate = useNavigate()
  const { events, deleteEvent } = useAppData()
  const toast = useToast()
  const confirm = useConfirm()

  const openEvent = (id: string, initialStep: 1 | 4) => {
    navigate('/dashboard/events/new', { state: { eventId: id, initialStep } })
  }

  const handleDeleteEvent = async (id: string) => {
    const record = events.find((e) => e.id === id)
    if (!record) return
    const name = record.form.metadata.title || 'this event'
    const ok = await confirm({
      title: 'Delete event?',
      description: `Deleting "${name}" will permanently remove it from My Workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Event',
      variant: 'destructive',
    })
    if (!ok) return
    deleteEvent(id)
    toast({ title: 'Event deleted', variant: 'success' })
  }

  return (
    <EventListView
      events={events}
      onAddEvent={() => navigate('/dashboard/events/new')}
      onViewEvent={(id) => openEvent(id, 4)}
      onEditEvent={(id) => openEvent(id, 1)}
      onDeleteEvent={handleDeleteEvent}
    />
  )
}

export { EventsPage }
