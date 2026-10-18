import * as React from 'react'
import { ArrowDown, ArrowRight, BarChart3, BookOpen, Calendar, Database, FileText, MapPin } from 'lucide-react'

import { ContentCard } from '@/components/discover/ContentCard'
import { Button } from '@/components/ui/button'
import type { ContentCardMetadataItem } from '@/lib/content-card'
import { cn } from '@/lib/utils'
import type { Resource } from '@/pages/playground/collaborative-detail/collaborative-sample-data'

/** The kinds of connected content that render as Search content cards. */
export type ResourceKind = 'dataset' | 'use-case' | 'publication' | 'event'

/** A sortable list of the resources connected to the collaborative, shown as the same content cards the Search results page
 *  uses (a grid for datasets, full-width list cards for use cases). The count always reflects what is listed, optional fields
 *  (date, year, description, tags, format) are simply left out when a record doesn't have them, and an empty collection gets
 *  a plain empty state. There is no search or filtering here: the list is the collaborative's own, in a chosen order. */

type Reveal =
  | { mode: 'more'; initial: number; step: number; label: string }
  | { mode: 'all'; initial: number; label: string }

const recencyKey = (r: Resource) => r.updated ?? (r.year ? `${r.year}-06-30` : '')

/** The Search card's "most useful discovery attributes" for a dataset, built only from what the record has. */
function datasetCardMetadata(r: Resource): ContentCardMetadataItem[] {
  const rows: ContentCardMetadataItem[] = []
  if (r.updated) {
    rows.push({
      icon: Calendar,
      label: `Updated ${new Date(r.updated).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`,
    })
  }
  if (r.format) rows.push({ icon: FileText, label: r.format })
  if (r.geography) rows.push({ icon: MapPin, label: r.geography })
  return rows
}

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`

/** The Search card's attributes for a use case: datasets and charts it draws on, and where it applies. */
function useCaseCardMetadata(r: Resource): ContentCardMetadataItem[] {
  const rows: ContentCardMetadataItem[] = []
  if (r.datasetCount != null) rows.push({ icon: Database, label: plural(r.datasetCount, 'dataset') })
  if (r.chartCount != null) rows.push({ icon: BarChart3, label: plural(r.chartCount, 'chart') })
  if (r.geography) rows.push({ icon: MapPin, label: r.geography })
  return rows
}

/** A publication: the year and the type, as on the Search card. */
function publicationCardMetadata(r: Resource): ContentCardMetadataItem[] {
  const rows: ContentCardMetadataItem[] = []
  if (r.year) rows.push({ icon: Calendar, label: String(r.year) })
  if (r.publicationType) rows.push({ icon: BookOpen, label: r.publicationType })
  return rows
}

/** An event: its date range and venue, as on the Search card. */
function eventCardMetadata(r: Resource): ContentCardMetadataItem[] {
  const rows: ContentCardMetadataItem[] = []
  if (r.dateRange) rows.push({ icon: Calendar, label: r.dateRange })
  if (r.location) rows.push({ icon: MapPin, label: r.location })
  return rows
}

const CARD_METADATA: Record<ResourceKind, (r: Resource) => ContentCardMetadataItem[]> = {
  dataset: datasetCardMetadata,
  'use-case': useCaseCardMetadata,
  publication: publicationCardMetadata,
  event: eventCardMetadata,
}

interface ResourceExplorerProps {
  idPrefix: string
  noun: { singular: string; plural: string }
  items: Resource[]
  /** Both kinds use the Search results content card, as a grid of cards: use cases with their cover image and publisher avatars
   *  when they have them, and a grey placeholder when they don't. */
  kind: ResourceKind
  recentLabel: string
  reveal: Reveal
  emptyCollection: string
  onOpen: (resource: Resource) => void
}

/** A Search content card made openable: the card itself has no click handler (it is built for navigation), so a button sits
 *  behind it, filling the same box, and the card lets clicks fall through to it. The card's own tooltips (the "CSV +3"
 *  summary, the publisher avatars) stay hoverable and focusable. */
function OpenableCard({ title, onOpen, children }: { title: string; onOpen: () => void; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative h-full rounded-lg',
        'has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring',
        'hover:[&>div]:border-primary/40 hover:[&>div]:bg-muted/30',
        '[&>div]:pointer-events-none [&_[tabindex="0"]]:pointer-events-auto',
      )}
    >
      <button type="button" onClick={onOpen} aria-label={`Open preview: ${title}`} className="absolute inset-0 rounded-lg focus-visible:outline-none" />
      <div className="relative h-full transition-colors">{children}</div>
    </div>
  )
}

function ResourceExplorer({
  idPrefix,
  noun,
  items,
  kind,
  recentLabel,
  reveal,
  emptyCollection,
  onOpen,
}: ResourceExplorerProps) {
  const [sort, setSort] = React.useState<'relevance' | 'recent'>('relevance')
  const [shown, setShown] = React.useState(reveal.initial)
  const [expanded, setExpanded] = React.useState(false)

  const ordered = React.useMemo(() => {
    if (sort === 'relevance') return items
    return items
      .map((r, i) => ({ r, i }))
      .sort((a, b) => recencyKey(b.r).localeCompare(recencyKey(a.r)) || a.i - b.i)
      .map((x) => x.r)
  }, [items, sort])

  // A different order starts again from the first screenful.
  React.useEffect(() => {
    setShown(reveal.initial)
    setExpanded(false)
  }, [sort, items, reveal.initial])

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-default px-6 py-10 text-center text-sm text-text-subdued">
        {emptyCollection}
      </p>
    )
  }

  const visible = reveal.mode === 'more' ? ordered.slice(0, shown) : expanded ? ordered : ordered.slice(0, reveal.initial)
  const hidden = ordered.length - visible.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p role="status" aria-live="polite" className="text-text-subdued">
          {items.length} {items.length === 1 ? noun.singular : noun.plural}
        </p>
        <label className="flex items-center gap-2 text-text-subdued">
          Sort by:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'relevance' | 'recent')}
            className="rounded-sm bg-transparent py-1 pr-1 font-medium text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <option value="relevance">Most relevant</option>
            <option value="recent">{recentLabel}</option>
          </select>
        </label>
      </div>

      <ul id={`${idPrefix}-list`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <li key={r.id} className="min-w-0">
            <OpenableCard title={r.title} onOpen={() => onOpen(r)}>
              <ContentCard
                variant="grid"
                type={kind}
                title={r.title}
                description={r.description}
                metadata={r.cardMetadata ?? CARD_METADATA[kind](r)}
                thumbnailUrl={r.thumbnailUrl ?? null}
                publishers={r.publishers}
                tintedMetadata
              />
            </OpenableCard>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <div>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-text-brand"
            aria-controls={`${idPrefix}-list`}
            onClick={() => (reveal.mode === 'more' ? setShown((n) => n + reveal.step) : setExpanded(true))}
          >
            {reveal.label}
            {reveal.mode === 'more' ? <ArrowDown className="size-4" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
            <span className="text-text-subdued">({hidden} more)</span>
          </Button>
        </div>
      )}
      {reveal.mode === 'all' && expanded && ordered.length > reveal.initial && (
        <div>
          <Button type="button" variant="link" className="h-auto px-0 text-text-brand" onClick={() => setExpanded(false)}>
            Show fewer
          </Button>
        </div>
      )}
    </div>
  )
}

export { ResourceExplorer }
