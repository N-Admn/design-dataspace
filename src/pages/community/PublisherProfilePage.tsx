import { useParams } from 'react-router-dom'

import { ProfileNotFound } from '@/components/community/ProfileParts'
import { PublisherProfileView } from '@/components/community/ProfileViews'
import { useCommunityDirectory, useContentCardItems } from '@/hooks/use-community'

/** The public profile of an individual publisher (`/publishers/:personId`). Someone with nothing published of their own is not a
 *  publisher, so the page is the same not-found as an unknown id: nothing unpublished is ever shown as a fallback. No email or
 *  organisation role is shown. The page itself is `PublisherProfileView`; this only finds the person. */
function PublisherProfilePage() {
  const { personId } = useParams<{ personId: string }>()
  const { individualById } = useCommunityDirectory()
  const cards = useContentCardItems()
  const person = personId ? individualById.get(personId) : undefined

  if (!person || person.total === 0) {
    return (
      <ProfileNotFound
        title="Publisher not found"
        description="This person may not have published anything on CivicDataSpace, or the link may be wrong."
        backTo="/community?tab=people"
      />
    )
  }
  return <PublisherProfileView person={person} cards={cards} />
}

export { PublisherProfilePage }
