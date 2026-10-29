import { useParams } from 'react-router-dom'

import { ProfileNotFound } from '@/components/community/ProfileParts'
import { OrganisationProfileView } from '@/components/community/ProfileViews'
import { useCommunityDirectory, useContentCardItems } from '@/hooks/use-community'

/** The public organisation profile (`/explore/organisations/:organisationId`). Needs no sign-in and shows nothing private: no contact
 *  email, roles or invitations. The page itself is `OrganisationProfileView`; this only finds the organisation. */
function PublicOrganisationProfilePage() {
  const { organisationId } = useParams<{ organisationId: string }>()
  const { organisationById } = useCommunityDirectory()
  const cards = useContentCardItems()
  const org = organisationId ? organisationById.get(organisationId) : undefined

  if (!org) {
    return (
      <ProfileNotFound
        title="Organisation not found"
        description="This organisation may no longer have a public profile, or the link may be wrong."
        backTo="/community?tab=organisations"
      />
    )
  }
  return <OrganisationProfileView org={org} cards={cards} />
}

export { PublicOrganisationProfilePage }
