import { useNavigate } from 'react-router-dom'

import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { OrganisationContentTable, type OrganisationContentItem } from '@/components/organisation/OrganisationContentTable'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'

function OrganisationEventsPage() {
  const navigate = useNavigate()
  const { organisationId, organisation, permissions } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { events, deleteEvent, unpublishEvent } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  if (!organisation) return <OrganisationNotFound />

  const returnTo = `/organisations/${organisationId}/events`
  const orgEvents = scope.filter('event', events.filter((e) => e.organisationId === organisationId))
  const items: OrganisationContentItem[] = orgEvents.map((e) => ({
    id: e.id,
    title: e.form.metadata.title,
    status: e.status,
    updatedAt: e.updatedAt,
    createdBy: e.createdBy,
    liveHref: `/explore/events/${e.id}`,
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

  const handleUnpublish = async (item: OrganisationContentItem) => {
    const ok = await confirm({
      title: 'Unpublish this event?',
      description: `"${item.title || 'This item'}" will be removed from public view and moved back to Draft. Anyone assigned to evaluate it loses access, and publishing it again does not restore that.`,
      confirmLabel: 'Unpublish',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      unpublishEvent(item.id)
      toast({ title: 'Event unpublished', description: 'Moved back to Draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'You can’t unpublish this', description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
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
      onDelete={permissions.canDeleteOrganisationContent ? handleDelete : undefined}
      onUnpublish={permissions.canUnpublishOrganisationContent ? handleUnpublish : undefined}
      emptyTitle="No organisation events yet"
      emptyDescription="Events created by this organisation's members will show up here."
      searchPlaceholder="Search events..."
    />
  )
}

export { OrganisationEventsPage }
