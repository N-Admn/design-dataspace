import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationEventsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const { events, deleteEvent } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/events`
  const orgEvents = events.filter((e) => e.organisationId === organisationId)
  const items: OrganisationContentItem[] = orgEvents.map((e) => ({
    id: e.id,
    title: e.form.metadata.title,
    status: e.status,
    updatedAt: e.updatedAt,
    createdBy: e.createdBy,
  }))

  const open = (id: string | null) =>
    navigate('/dashboard/events/new', { state: { eventId: id ?? undefined, organisationId, returnTo } })

  const handleDelete = async (item: OrganisationContentItem) => {
    const name = item.title || 'this event'
    const ok = await confirm({
      title: 'Delete Event',
      description: `Deleting "${name}" will permanently remove it from ${organisation.metadata.name}'s workspace. This action cannot be undone.`,
      confirmLabel: 'Delete Event',
      variant: 'destructive',
    })
    if (!ok) return
    deleteEvent(item.id)
    toast({ title: 'Event deleted', variant: 'success' })
  }

  return (
    <OrganisationContentTable
      title="Organisation Events"
      primaryColumnLabel="Event"
      subtitle={(count) => `${count} event${count === 1 ? '' : 's'} · created by members of ${organisation.metadata.name}`}
      addLabel="Create Event"
      onAdd={permissions.canCreateContent ? () => open(null) : undefined}
      items={items}
      onOpen={(item) => open(item.id)}
      onDelete={permissions.role === 'admin' ? handleDelete : undefined}
      emptyTitle="No organisation events yet"
      emptyDescription="Events created by this organisation's members will show up here."
      searchPlaceholder="Search events..."
    />
  )
}

export { OrganisationEventsPage }
