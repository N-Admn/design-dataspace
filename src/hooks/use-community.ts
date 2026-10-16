import * as React from 'react'

import { useAppData } from '@/context/AppDataContext'
import { buildCommunityDirectory } from '@/lib/community'
import { buildSearchIndex, type SearchResultItem } from '@/lib/global-search'

/** The Community directory and profiles' shared data, derived once per change to the app's records. */
function useCommunityDirectory() {
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, profile } = useAppData()
  return React.useMemo(
    () => buildCommunityDirectory({ datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces }, profile),
    [datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, profile],
  )
}

/** The Search index's card data for every published record, keyed `type:id`, so a profile can show the very cards the Search page
 *  shows (metadata, cover image, publishers) for the records it lists. */
function useContentCardItems() {
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts } = useAppData()
  return React.useMemo(() => {
    const index = buildSearchIndex({ datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts })
    return new Map<string, SearchResultItem>(index.map((item) => [`${item.type}:${item.id}`, item]))
  }, [datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts])
}

export { useCommunityDirectory, useContentCardItems }
