import { useParams } from 'react-router-dom'

import { useAppData } from '@/context/AppDataContext'
import { currentUserPermissions } from '@/lib/organisation-permissions'

/** Resolves the organisation for the current `/organisations/:organisationId/...`
 * route and the signed-in user's permissions within it — the single source every
 * Organisation Workspace page uses instead of re-deriving this from scratch. */
function useOrganisation() {
  const { organisationId } = useParams<{ organisationId: string }>()
  const { organisationWorkspaces } = useAppData()
  const organisation = organisationWorkspaces.find((o) => o.id === organisationId) ?? null
  const permissions = organisation
    ? currentUserPermissions(organisation)
    : {
        role: null,
        canViewMembers: false,
        canAddMembers: false,
        canEditMemberRole: false,
        canRemoveMembers: false,
        canManageRoles: false,
        canEditOrganisation: false,
        canCreateContent: false,
        canPublishOrganisationContent: false,
      }

  return { organisationId: organisationId ?? '', organisation, permissions }
}

export { useOrganisation }
