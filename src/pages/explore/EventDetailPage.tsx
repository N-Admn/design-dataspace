import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { EventIdentity } from '@/components/event/consumer/EventIdentity'
import { EventThumbnail } from '@/components/event/consumer/EventThumbnail'
import { EventMetadataRail } from '@/components/event/consumer/EventMetadataRail'
import { EventAbout } from '@/components/event/consumer/EventAbout'
import { EventSpeakers } from '@/components/event/consumer/EventSpeakers'
import { EventRelatedContent } from '@/components/event/consumer/EventRelatedContent'
import { useAppData } from '@/context/AppDataContext'
import { useGoBack } from '@/hooks/use-go-back'
import { buildSearchIndex } from '@/lib/global-search'

/** Consumer-facing Event Details page — an editorial, content-first layout:
 *  Event Identity (chips/title/subtitle) → Event Information (thumbnail +
 *  sticky rail: event info, then Organiser, then Partners) → About the Event
 *  → Speakers → Related Content. Speakers stay in the main content column;
 *  Organiser/Partners live only in the rail, as compact rows, never as
 *  main-content cards. See the Event Details documentation for the spec. */
function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { events, datasets, useCases, collaboratives, aiModels, organisationWorkspaces, charts } = useAppData()
  const goBack = useGoBack('/explore/events')
  // Same index Search results builds — so a related dataset/use case/etc.
  // renders as the exact same card a visitor would see there.
  const searchIndex = React.useMemo(
    () => buildSearchIndex({ datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts }),
    [datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts],
  )

  const record = id ? events.find((e) => e.id === id) : undefined
  // Consumers only ever see the live published version — same rule as every
  // other Explore detail page (e.g. DatasetDetailPage, UseCaseDetailPage).
  const form = record?.status === 'published' ? record.publishedForm : undefined

  if (!record || !form) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState title="Event not found" description="This event may have been unpublished or does not exist." />
        <Link to="/discover" className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back to Discover
        </Link>
      </div>
    )
  }

  const { metadata, organisers, partners, speakers, publications, relatedContent } = form

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 py-2">
      <button
        type="button"
        onClick={goBack}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <EventIdentity metadata={metadata} />

      {/* Mobile: a plain stack, so DOM order alone gives the documented
          thumbnail → metadata → content sequence. Desktop: named grid areas
          put the thumbnail and metadata card side by side in row 1, while
          the metadata card's cell spans both rows so it can stay sticky
          alongside the body content in row 2. */}
      <div
        className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_320px] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8 lg:gap-y-10 lg:[grid-template-areas:'thumb_meta'_'body_meta']"
      >
        <div className="lg:[grid-area:thumb]">
          <EventThumbnail coverImage={metadata.coverImage} />
        </div>

        <div className="lg:sticky lg:top-6 lg:[grid-area:meta]">
          <EventMetadataRail metadata={metadata} organisers={organisers} partners={partners} />
        </div>

        <div className="flex min-w-0 flex-col gap-12 lg:[grid-area:body]">
          <EventAbout overview={metadata.overview} />
          <EventSpeakers speakers={speakers} />
          <EventRelatedContent
            eventId={record.id}
            relatedContent={relatedContent}
            publications={publications}
            searchIndex={searchIndex}
          />
        </div>
      </div>
    </div>
  )
}

export { EventDetailPage }
