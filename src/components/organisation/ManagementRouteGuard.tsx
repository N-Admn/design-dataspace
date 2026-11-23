import { Outlet, useLocation, useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

import { BackLink } from '@/components/shared/BackLink'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { collaborativeRole } from '@/lib/notification-model'
import { canEditOrganisationContent } from '@/lib/organisation-permissions'
import { currentUserRole } from '@/types/organisation-workspace'

/** The state key each editor route reads its record from when it is opened from a list or another page. */
const STATE_KEY: Record<string, string> = {
  datasets: 'datasetId',
  events: 'eventId',
  'use-cases': 'useCaseId',
  collaboratives: 'collaborativeId',
  'ai-models': 'aiModelId',
  charts: 'chartId',
  publications: 'publicationId',
}

/** Wraps the content editor, preview and Items routes under `/dashboard/...`. Those are management screens, so for content of an
 *  organisation they are open only to someone who can edit that organisation's content (an Admin or Editor of it). An Evaluator, who only
 *  reads, and a non-member are turned away, whichever way they arrive: by the record in the URL, by the record carried in navigation
 *  state, or by the organisation the editor was opened for. If those name different organisations the route is refused, so a caller cannot
 *  pair a record with a workspace that is not its own. */
function ManagementRouteGuard() {
  const { id } = useParams<{ id: string }>()
  const { pathname, state } = useLocation()
  const { organisationWorkspaces, datasets, events, useCases, collaboratives, aiModels, charts, publications } = useAppData()
  const { persona, collaborativeInfo } = useNotifications()

  const pools: Record<string, { id: string; organisationId?: string }[]> = {
    datasets,
    events,
    'use-cases': useCases,
    collaboratives,
    'ai-models': aiModels,
    charts,
    publications,
  }
  const segment = pathname.split('/').filter(Boolean)[1]

  // A collaborative's Items page is for the people who work on its items: its owner (an Admin or Editor of the owning organisation) and its partners. A partner belongs
  // to another organisation, so this is decided by the collaborative's own relationships, not by membership of the organisation.
  if (segment === 'collaboratives' && pathname.endsWith('/items') && id) {
    const { access, published } = collaborativeInfo(id)
    if (collaborativeRole(persona.id, access, published) !== 'none') return <Outlet />
    return (
      <EmptyState icon={ClipboardList} title="This isn’t available to you" description="Only a collaborative’s owner and its partners work on its items." action={<BackLink fallbackTo="/organisations" />} />
    )
  }
  const navState = (state ?? {}) as Record<string, unknown>
  const stateRecordId = typeof navState[STATE_KEY[segment]] === 'string' ? (navState[STATE_KEY[segment]] as string) : undefined
  const stateOrganisationId = typeof navState.organisationId === 'string' ? navState.organisationId : undefined

  const pool = pools[segment] ?? []
  const named = [id, stateRecordId].filter((x): x is string => Boolean(x)).map((rid) => pool.find((r) => r.id === rid))
  const recordOrganisations = named.filter((r) => r?.organisationId).map((r) => r!.organisationId as string)
  const organisationIds = [...new Set([...recordOrganisations, ...(stateOrganisationId ? [stateOrganisationId] : [])])]

  // Content of one organisation, reached through that organisation. More than one organisation named is a mismatch.
  const mismatch = organisationIds.length > 1
  const organisation = organisationWorkspaces.find((o) => o.id === organisationIds[0])
  const role = organisation ? currentUserRole(organisation) : null
  const blocked = mismatch || (organisationIds.length === 1 && (!organisation || !canEditOrganisationContent(role)))

  if (blocked) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="This isn’t available to you"
        description={
          role === 'evaluator'
            ? 'As an Evaluator you can read the content assigned to you, but not edit or manage it.'
            : 'You need to be an Admin or Editor of this organisation to edit or manage its content.'
        }
        action={<BackLink fallbackTo="/organisations" />}
      />
    )
  }
  return <Outlet />
}

export { ManagementRouteGuard }
