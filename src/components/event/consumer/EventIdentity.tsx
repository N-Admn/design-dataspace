import { Badge } from '@/components/ui/badge'
import { SECTOR_OPTIONS } from '@/types/dataset'
import { EVENT_TYPE_OPTIONS, type EventMetadata } from '@/types/event'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

/** The page's opening identity block — classification chips, title and
 *  subtitle, sitting above the thumbnail/metadata row. Event Type and
 *  Theme/Sector live only here; the metadata card below never repeats them. */
function EventIdentity({ metadata }: { metadata: EventMetadata }) {
  return (
    <header className="flex flex-col gap-2">
      {(metadata.eventType || metadata.theme) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {metadata.eventType && <Badge variant="secondary">{optionLabel(EVENT_TYPE_OPTIONS, metadata.eventType)}</Badge>}
          {metadata.theme && <Badge variant="muted">{optionLabel(SECTOR_OPTIONS, metadata.theme)}</Badge>}
        </div>
      )}

      <h1 className="type-heading-1 text-text-brand">{metadata.title || 'Untitled Event'}</h1>

      {metadata.subtitle && <p className="text-base text-text-subdued">{metadata.subtitle}</p>}
    </header>
  )
}

export { EventIdentity }
