import { EVENT_MOCK_COVER_IMAGE } from '@/lib/event-thumbnail'
import type { EventMetadata } from '@/types/event'

/** Pure visual — no identity or operational text is overlaid on it. */
function EventThumbnail({ coverImage }: { coverImage: EventMetadata['coverImage'] }) {
  return (
    <img
      src={coverImage?.dataUrl || EVENT_MOCK_COVER_IMAGE}
      alt=""
      className="h-80 w-full rounded-xl object-cover sm:h-96"
    />
  )
}

export { EventThumbnail }
