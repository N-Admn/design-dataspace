import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

import { BackLink } from '@/components/shared/BackLink'
import { EmptyState } from '@/components/shared/EmptyState'
import { useOrganisation } from '@/hooks/use-organisation'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { EVALUATION_MODULE_SEGMENT, moduleFromSegment } from '@/lib/evaluation-assignments'
import { canViewMembers } from '@/lib/organisation-permissions'
import { currentUserRole, isOrganisationMember } from '@/types/organisation-workspace'

/** Wraps every `/organisations/:organisationId/...` route. Admins and Editors pass straight through. An Evaluator gets in only through content
 *  that is assigned to them and still published:
 *   - with nothing assigned the whole workspace is blocked, so no module, table or dashboard is exposed;
 *   - otherwise only the modules that hold an assigned record open, and the organisation home sends them to the first of those.
 *  Because this reads the same scope as the sidebar and the tables, a record that is unpublished closes at once, including its module when it
 *  was the last one. */
function OrganisationAccessGuard() {
  const { organisationId, organisation } = useOrganisation()
  const scope = useEvaluatorScope(organisationId)
  const { pathname } = useLocation()

  if (!organisation) return <Outlet />

  // Access follows active membership, not who created the organisation: without a seat in it, none of its workspace opens.
  if (!isOrganisationMember(organisation)) {
    return <EmptyState icon={ClipboardList} title="You’re not a member of this organisation" description="Ask one of its Admins to invite you." action={<BackLink fallbackTo="/organisations" />} />
  }

  if (!scope.isEvaluator) {
    // The members section (list, invitations and their actions) is organisation management: Admin only.
    if (pathname.split('/').filter(Boolean)[2] === 'members' && !canViewMembers(currentUserRole(organisation))) {
      return <EmptyState icon={ClipboardList} title="This is for organisation Admins" description="Managing members and invitations is limited to the organisation’s Admins." action={<BackLink fallbackTo="/organisations" />} />
    }
    return <Outlet />
  }

  const back = <BackLink fallbackTo="/organisations" />

  if (!scope.hasAssignments) {
    return (
      <EmptyState icon={ClipboardList} title="No content has been assigned to you for evaluation yet." description="When an Admin assigns published content to you, it will appear here." action={back} />
    )
  }

  const segment = pathname.split('/').filter(Boolean)[2]
  if (!segment) return <Navigate to={`/organisations/${organisationId}/${EVALUATION_MODULE_SEGMENT[scope.modules[0]]}`} replace />

  const module = moduleFromSegment(segment)
  if (!module || !scope.modules.includes(module)) {
    return (
      <EmptyState icon={ClipboardList} title="This isn’t available to you" description="You can only open the published content that has been assigned to you." action={back} />
    )
  }

  return <Outlet />
}

export { OrganisationAccessGuard }
