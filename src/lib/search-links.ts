import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { MODEL_TYPE_OPTIONS } from '@/types/ai-model'

/** Links into the Search page from a badge or tag anywhere in the app. Every such link opens the Search page on the tab of the content
 *  the badge belongs to, with that one value applied: a facet filter (`sector=gender`) or a tag (`tag=heat`). The Search page shows it as a
 *  removable chip, and removing it leaves the plain tab. The filter lives in the URL, so the link can be shared and reloaded. */

/** The content types a Search link can open (Search's own `type` values). */
export type SearchLinkType = 'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event' | 'ai-model'

/** The facets a badge can filter by. The first four are groups in the filter rail; the last two apply without a rail group (they show only
 *  as a chip), because their lists are too long or too narrow to list. */
export type SearchLinkFacet = 'sector' | 'sdgGoal' | 'eventType' | 'resourceType' | 'geography' | 'modelType'

export const searchFacetHref = (type: SearchLinkType, facet: SearchLinkFacet, value: string) =>
  `/search?type=${type}&${facet}=${encodeURIComponent(value)}`

export const searchTagHref = (type: SearchLinkType, tag: string) => `/search?type=${type}&tag=${encodeURIComponent(tag)}`

/** Group titles and value labels for the facets that have no filter-rail group, so their chip reads like the others. */
export const EXTRA_FACETS: Record<string, { label: string; options: { value: string; label: string }[] }> = {
  // Sector is a rail group only on AI Models; everywhere else a sector badge still filters, shown as this chip.
  sector: { label: 'Sector', options: SECTOR_OPTIONS },
  geography: { label: 'Geography', options: GEOGRAPHY_OPTIONS },
  modelType: { label: 'Model type', options: MODEL_TYPE_OPTIONS },
}
