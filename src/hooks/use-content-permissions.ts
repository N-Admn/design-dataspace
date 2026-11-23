import { useAppData } from '@/context/AppDataContext'
import { canDoContentAction, contentActionRefusal, type ContentAction } from '@/lib/organisation-permissions'
import { currentUserRole } from '@/types/organisation-workspace'

/** What the signed-in person may do to content of one workspace: an organisation's (by their role there) or their own (anything). The
 *  screens use this to show only what the store will allow; the store checks the same rules itself. */
function useContentPermissions(organisationId: string | undefined) {
  const { organisationWorkspaces } = useAppData()
  const organisation = organisationId ? organisationWorkspaces.find((o) => o.id === organisationId) : undefined
  const role = organisation ? currentUserRole(organisation) : null
  const can = (action: ContentAction) => !organisationId || canDoContentAction(role, action)
  return {
    can,
    canPublish: can('publish'),
    /** The message to show when `action` is refused, or null when it is allowed. */
    refusal: (action: ContentAction) => (organisationId ? contentActionRefusal(role, action) : null),
  }
}

export { useContentPermissions }
