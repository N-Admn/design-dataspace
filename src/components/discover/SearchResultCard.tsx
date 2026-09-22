import type { ReactNode } from 'react'
import { Calendar, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { RESOURCE_KIND_ICON } from '@/components/event/ResourceSearchField'
import { cn } from '@/lib/utils'
import { SEARCH_TYPE_LABEL, type SearchResultItem, type SearchResultType } from '@/lib/global-search'

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

/** These three modules have a real cover-image field on their record (Use
 *  Case's `metadata.thumbnail`, Collaborative's `metadata.image`, Event's
 *  `metadata.coverImage` — see `buildSearchIndex`), so their cards show that
 *  image instead of the small type icon the other cards use. */
const THUMBNAIL_TYPES = new Set<SearchResultType>(['use-case', 'collaborative', 'event'])

/** The real uploaded cover image when there is one, otherwise a plain
 *  placeholder built from the same type icon — never an invented photo. */
function Thumbnail({ item, className }: { item: SearchResultItem; className: string }) {
  if (item.thumbnailUrl) {
    return <img src={item.thumbnailUrl} alt="" className={cn(className, 'object-cover')} />
  }
  const Icon = TYPE_ICON[item.type]
  return (
    <div className={cn(className, 'flex items-center justify-center bg-muted text-muted-foreground/60')}>
      <Icon className="size-8" aria-hidden="true" />
    </div>
  )
}

interface SearchResultCardProps {
  item: SearchResultItem
  /** "grid" (default) keeps the original icon-above-title card, used for the
   *  compact multi-column grid and the grouped "All" view. "list" is only
   *  used by the results toolbar's List view — the icon moves beside the
   *  title instead of above it, and is a little larger. */
  layout?: 'grid' | 'list'
}

function SearchResultCard({ item, layout = 'grid' }: SearchResultCardProps) {
  const Icon = TYPE_ICON[item.type]
  const hasThumbnail = THUMBNAIL_TYPES.has(item.type)
  const paddedCard = 'rounded-lg border border-border bg-card p-[18px]'

  if (layout === 'list') {
    const body = (
      // Icon/thumbnail is vertically centered against the whole row
      // (`items-center`, unlike the grid layout's `items-start`); the
      // description and meta lines always reserve the same height (2 lines /
      // 1 line) whether or not that item actually has one, so every row in
      // the list is the same height regardless of how much content it has.
      <div className="flex items-center gap-4">
        {hasThumbnail ? (
          <Thumbnail item={item} className="h-24 w-36 shrink-0 rounded-md" />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-base font-semibold text-foreground">{item.title}</p>
            <Badge variant="secondary" className="shrink-0">
              {SEARCH_TYPE_LABEL[item.type]}
            </Badge>
          </div>
          <p className="mt-1 h-10 w-4/5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          <p className="mt-2 h-4 truncate text-xs text-muted-foreground">
            {[item.organisation, item.meta].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    )
    return <CardShell item={item} className={paddedCard}>{body}</CardShell>
  }

  // Grid layout. Thumbnail types get a different card shape — the image
  // bleeds to the card's own edges (no padding on the outer card, the image
  // isn't inset like the small icon square is), with the type badge overlaid
  // on it and the rest of the content padded below.
  if (hasThumbnail) {
    const body = (
      <>
        <div className="relative">
          <Thumbnail item={item} className="h-48 w-full" />
          <Badge variant="secondary" className="absolute right-2 top-2">
            {SEARCH_TYPE_LABEL[item.type]}
          </Badge>
        </div>
        <div className="p-[18px]">
          <p className="line-clamp-2 text-base font-semibold text-foreground">{item.title}</p>
          {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
          {(item.organisation || item.meta) && (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {[item.organisation, item.meta].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </>
    )
    return (
      <CardShell item={item} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
        {body}
      </CardShell>
    )
  }

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <Badge variant="secondary">{SEARCH_TYPE_LABEL[item.type]}</Badge>
      </div>
      <div className="mt-3 min-w-0">
        <p className="line-clamp-2 text-base font-semibold text-foreground">{item.title}</p>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        {(item.organisation || item.meta) && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {[item.organisation, item.meta].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </>
  )
  return (
    <CardShell item={item} className={`flex flex-col ${paddedCard}`}>
      {body}
    </CardShell>
  )
}

/** The link-or-plain-div wrapper every layout shares. */
function CardShell({ item, className, children }: { item: SearchResultItem; className: string; children: ReactNode }) {
  if (!item.href) {
    return <div className={className}>{children}</div>
  }
  return (
    <Link
      to={item.href}
      className={`${className} block transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {children}
    </Link>
  )
}

export { SearchResultCard }
