import { Calendar, type LucideIcon } from 'lucide-react'

import { RESOURCE_KIND_ICON } from '@/components/event/ResourceSearchField'
import { ContentCard } from '@/components/discover/ContentCard'
import { buildCardMetadata } from '@/lib/content-card'
import type { SearchResultItem, SearchResultType } from '@/lib/global-search'

/** Shared with the content-type pills on the results page, so a type's icon
 *  is consistent between the filter and the cards it filters. */
export const TYPE_ICON: Record<SearchResultType, LucideIcon> = {
  dataset: RESOURCE_KIND_ICON.dataset,
  'use-case': RESOURCE_KIND_ICON['use-case'],
  publication: RESOURCE_KIND_ICON.publication,
  collaborative: RESOURCE_KIND_ICON.collaborative,
  'ai-model': RESOURCE_KIND_ICON['ai-model'],
  event: Calendar,
}

interface SearchResultCardProps {
  item: SearchResultItem
  /** "grid" (default) is the compact multi-column grid and the grouped "All"
   *  view; "list" is the results toolbar's List view (the default there). */
  layout?: 'grid' | 'list'
  /** Set only by true search/listing surfaces (the Search results page) —
   *  gives the metadata row its tinted-pill treatment. Left unset when this
   *  card is embedded in a detail page (e.g. Event Details' Related
   *  Content), which keeps its metadata plain/neutral. */
  tintedMetadata?: boolean
}

/** Adapts a search-index `SearchResultItem` into the shared `ContentCard` —
 *  every content type (Dataset, Use Case, Publication, Collaborative, Event,
 *  AI Model) renders through that one card; this is a data mapping, not a
 *  separate card implementation. */
function SearchResultCard({ item, layout = 'grid', tintedMetadata }: SearchResultCardProps) {
  return (
    <ContentCard
      type={item.type}
      title={item.title}
      description={item.description}
      metadata={buildCardMetadata(item)}
      publishers={item.publishers}
      thumbnailUrl={item.thumbnailUrl}
      href={item.href}
      variant={layout}
      tintedMetadata={tintedMetadata}
    />
  )
}

export { SearchResultCard }
