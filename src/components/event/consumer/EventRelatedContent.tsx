import { CardCarousel } from '@/components/shared/CardCarousel'
import { SearchResultCard } from '@/components/discover/SearchResultCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { SearchResultItem, SearchResultType } from '@/lib/global-search'
import type { EventPublication, EventRelatedContent as EventRelatedContentData, RelatedContentItem } from '@/types/event'

/** Resolves an event's connected item against the same search index the
 *  Search results page builds, so a related dataset/use case/collaborative/
 *  AI model/publication renders as the *exact* card — same component, same
 *  data mapping — a visitor would see on Search, not a lighter, event-only
 *  approximation of it. */
function resolveItem(searchIndex: SearchResultItem[], id: string, type: SearchResultType): SearchResultItem | undefined {
  return searchIndex.find((item) => item.id === id && item.type === type)
}

function RelatedGroup({
  title,
  items,
  searchIndex,
}: {
  title: string
  items: RelatedContentItem[]
  searchIndex: SearchResultItem[]
}) {
  const resolved = items.map((item) => resolveItem(searchIndex, item.id, item.type)).filter((item): item is SearchResultItem => Boolean(item))
  if (resolved.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader as="h3" title={title} />
      <CardCarousel>
        {resolved.map((item) => (
          <SearchResultCard key={item.id} item={item} layout="grid" tintedMetadata />
        ))}
      </CardCarousel>
    </div>
  )
}

function PublicationsGroup({
  eventId,
  publications,
  searchIndex,
}: {
  eventId: string
  publications: EventPublication[]
  searchIndex: SearchResultItem[]
}) {
  const resolved = publications
    .map((pub) => resolveItem(searchIndex, `${eventId}-${pub.id}`, 'publication'))
    .filter((item): item is SearchResultItem => Boolean(item))
  if (resolved.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader as="h3" title="Publications" />
      <CardCarousel>
        {resolved.map((item) => (
          <SearchResultCard key={item.id} item={item} layout="grid" tintedMetadata />
        ))}
      </CardCarousel>
    </div>
  )
}

/** Only content types with an actual relationship are shown — an empty
 *  group renders nothing, per the documentation. Datasets, Publications, Use
 *  Cases, Collaboratives and AI Models all sit under one "Related content"
 *  heading, in that order — each group shows two cards at a time with
 *  carousel arrows once it has more than that. */
function EventRelatedContent({
  eventId,
  relatedContent,
  publications,
  searchIndex,
}: {
  eventId: string
  relatedContent: EventRelatedContentData
  publications: EventPublication[]
  searchIndex: SearchResultItem[]
}) {
  const hasAny =
    relatedContent.datasets.length > 0 ||
    publications.length > 0 ||
    relatedContent.useCases.length > 0 ||
    relatedContent.collaboratives.length > 0 ||
    relatedContent.aiModels.length > 0
  if (!hasAny) return null

  return (
    <section className="flex flex-col gap-8">
      <SectionHeader as="h2" title="Related content" />
      <RelatedGroup title="Datasets" items={relatedContent.datasets} searchIndex={searchIndex} />
      <PublicationsGroup eventId={eventId} publications={publications} searchIndex={searchIndex} />
      <RelatedGroup title="Use Cases" items={relatedContent.useCases} searchIndex={searchIndex} />
      <RelatedGroup title="Collaboratives" items={relatedContent.collaboratives} searchIndex={searchIndex} />
      <RelatedGroup title="AI Models" items={relatedContent.aiModels} searchIndex={searchIndex} />
    </section>
  )
}

export { EventRelatedContent }
