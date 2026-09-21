import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { organisationNavGroups } from '@/components/layout/organisation-nav-config'
import { organisationRoleLabel } from '@/types/organisation-workspace'
import { useAppData } from '@/context/AppDataContext'
import { currentUserRole } from '@/types/organisation-workspace'
import { initialsFor } from '@/lib/utils'

/** Same visual shell as `ContributorSidebar` (Section 11: reuse, don't duplicate),
 * configured for the selected organisation's nav groups and identity block. */
function OrganisationSidebar({ organisationId, className }: { organisationId: string; className?: string }) {
  const { organisationWorkspaces } = useAppData()
  const org = organisationWorkspaces.find((o) => o.id === organisationId)
  if (!org) return null

  const role = currentUserRole(org)

  return (
    <ContributorSidebar
      className={className}
      groups={organisationNavGroups(organisationId)}
      identity={{
        avatarLabel: initialsFor(org.metadata.name),
        name: org.metadata.name,
        subtitle: role ? organisationRoleLabel(role) : undefined,
      }}
      backLabel="Switch organisation"
      backTo="/organisations"
    />
  )
}

export { OrganisationSidebar }
