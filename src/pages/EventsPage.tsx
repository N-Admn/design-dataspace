import { useNavigate } from 'react-router-dom'

import { EventListView } from '@/components/event/EventListView'
import { useAppData } from '@/context/AppDataContext'

function EventsPage() {
  const navigate = useNavigate()
  const { events, deleteEvent } = useAppData()

  const openEvent = (id: string, initialStep: 1 | 4) => {
    navigate('/dashboard/events/new', { state: { eventId: id, initialStep } })
  }

  const handleDeleteEvent = (id: string) => {
    const record = events.find((e) => e.id === id)
    if (!record) return
    const name = record.form.metadata.title || 'this event'
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    deleteEvent(id)
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
