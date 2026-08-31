import { useNavigate } from 'react-router-dom'

import { EventListView } from '@/components/event/EventListView'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'

function EventsPage() {
  const navigate = useNavigate()
  const { events, deleteEvent, upsertEvent, unpublishEvent } = useAppData()
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

  const handleDiscardEvent = async (id: string) => {
    const record = events.find((e) => e.id === id)
    if (!record || !record.publishedForm) return
    const title = record.form.metadata.title || 'this event'
    const ok = await confirm({
      title: 'Discard unsaved changes?',
      description: `This will discard the unsaved changes to "${title}" and restore the last published version. This cannot be undone.`,
      confirmLabel: 'Discard Changes',
      variant: 'destructive',
    })
    if (!ok) return
    upsertEvent(id, 'published', record.publishedForm)
    toast({ title: 'Changes discarded', description: 'Restored the last published version.', variant: 'success' })
  }

  const handleUnpublishEvent = async (id: string) => {
    const record = events.find((e) => e.id === id)
    if (!record) return
    const title = record.form.metadata.title || 'this event'
    const ok = await confirm({
      title: 'Unpublish this event?',
      description: `"${title}" will be removed from public view and moved back to Draft. You can continue editing and publish it again later.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    unpublishEvent(id)
    toast({ title: 'Event unpublished', description: 'Moved back to Draft.', variant: 'success' })
  }

  return (
    <EventListView
      events={events}
      onAddEvent={() => navigate('/dashboard/events/new')}
      onViewEvent={(id) => openEvent(id, 4)}
      onEditEvent={(id) => openEvent(id, 1)}
      onDeleteEvent={handleDeleteEvent}
      onDiscardEvent={handleDiscardEvent}
      onUnpublishEvent={handleUnpublishEvent}
    />
  )
}

export { EventsPage }
