import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { organisationLogoUrl } from '@/lib/org-logo'
import { organisationNavGroups } from '@/components/layout/organisation-nav-config'
import { organisationRoleLabel } from '@/types/organisation-workspace'
import { useAppData } from '@/context/AppDataContext'
import { useEvaluatorScope } from '@/hooks/use-evaluator-scope'
import { EVALUATION_MODULE_SEGMENT } from '@/lib/evaluation-assignments'
import { currentUserRole } from '@/types/organisation-workspace'
import { canViewMembers } from '@/lib/organisation-permissions'
import { initialsFor } from '@/lib/utils'

/** Same visual shell as `ContributorSidebar` (Section 11: reuse, don't duplicate),
 * configured for the selected organisation's nav groups and identity block. */
function OrganisationSidebar({ organisationId, className }: { organisationId: string; className?: string }) {
  const { organisationWorkspaces } = useAppData()
  const org = organisationWorkspaces.find((o) => o.id === organisationId)
  const scope = useEvaluatorScope(organisationId)
  const role = org ? currentUserRole(org) : null
  // Someone who is not a member of the organisation has no workspace sidebar for it.
  if (!org || !role) return null
  // An Evaluator's sidebar lists only the modules that hold content assigned to them: no dashboard, members, profile or other modules.
  const assignedSegments = new Set(scope.modules.map((m) => EVALUATION_MODULE_SEGMENT[m]))
  const groups = scope.isEvaluator
    ? organisationNavGroups(organisationId)
        .map((g) => ({ ...g, items: g.items.filter((i) => assignedSegments.has(i.key)) }))
        .filter((g) => g.items.length > 0)
    : organisationNavGroups(organisationId)
        // The members section is organisation management: only Admins are offered it.
        .map((g) => ({ ...g, items: g.items.filter((i) => i.key !== 'members' || canViewMembers(role)) }))

  return (
    <ContributorSidebar
      className={className}
      groups={groups}
      identity={{
        avatarLabel: initialsFor(org.metadata.name),
        avatarUrl: organisationLogoUrl(org.metadata) ?? undefined,
        name: org.metadata.name,
        subtitle: role ? organisationRoleLabel(role) : undefined,
      }}
      backLabel="Switch organisation"
      backTo="/organisations"
    />
  )
}

export { OrganisationSidebar }
