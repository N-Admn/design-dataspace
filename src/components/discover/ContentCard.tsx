import { Fragment, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, initialsFor } from '@/lib/utils'
import { SEARCH_TYPE_LABEL, type SearchResultType } from '@/lib/global-search'
import type { ContentCardMetadataItem } from '@/lib/content-card'

/**
 * The one shared card used for every CivicDataSpace content type on the
 * Search results page (Dataset, Use Case, Publication, Collaborative, Event,
 * AI Model) — per the Content Card documentation. Callers configure it with
 * plain data (`type`, `title`, `metadata[]`, `publishers[]`, …); nothing here
 * is type-specific beyond the footer's `SEARCH_TYPE_LABEL` lookup and the
 * grid/list spatial arrangement.
 */

export interface ContentCardPublisher {
  name: string
  avatarUrl?: string | null
}

export interface ContentCardProps {
  type: SearchResultType
  title: string
  description?: string
  /** 2–3 primary discovery attributes — see `lib/content-card.ts`. */
  metadata: ContentCardMetadataItem[]
  /** Omitted/empty when the record genuinely has no attribution to show. */
  publishers?: ContentCardPublisher[]
  /** Landscape/~16:9 cover image. `null`/`undefined` collapses the image
   *  area entirely rather than leaving empty space or a placeholder. */
  thumbnailUrl?: string | null
  href?: string
  /** Optional secondary control (e.g. an icon button) — rendered so its own
   *  clicks never also trigger the card's own navigation. */
  action?: ReactNode
  /** Number of published charts/maps for this record (currently Datasets
   *  only) — shown as an extra "Visual (N)" badge before the content-type
   *  badge when greater than 0; omitted entirely otherwise, so a dataset with
   *  no visualisations shows just the plain "Dataset" tag. */
  visualCount?: number
  variant: 'list' | 'grid'
}

/** Avatar-only — the publisher's name is never shown as text on the card
 *  itself, only on hover/focus via tooltip. `tabIndex`/`aria-label` on the
 *  trigger make the name the avatar's own accessible name (screen reader
 *  users don't depend on the tooltip actually opening) rather than leaving it
 *  purely decorative now that it's the sole visual identity marker. */
function Avatar({ publisher }: { publisher: ContentCardPublisher }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label={publisher.name}
          className="inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {publisher.avatarUrl ? (
            <img src={publisher.avatarUrl} alt="" className="size-6 rounded-full object-cover ring-2 ring-card" />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full bg-surface-accent text-[10px] font-semibold text-text-on-accent ring-2 ring-card"
            >
              {initialsFor(publisher.name)}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{publisher.name}</TooltipContent>
    </Tooltip>
  )
}

/** Single publisher → one avatar. Multiple → a limited, overlapping avatar
 *  stack plus a "+N" chip — every name (including the overflowed ones) is
 *  only ever surfaced via each element's own tooltip/accessible name, never
 *  as visible text on the card. */
function PublisherGroup({ publishers }: { publishers: ContentCardPublisher[] }) {
  if (publishers.length === 0) return null

  if (publishers.length === 1) {
    return <Avatar publisher={publishers[0]} />
  }

  const shown = publishers.slice(0, 3)
  const overflow = publishers.slice(3)
  return (
    <div className="flex shrink-0 items-center -space-x-2">
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} publisher={p} />
      ))}
      {overflow.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              aria-label={`and ${overflow.length} more: ${overflow.map((p) => p.name).join(', ')}`}
              className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              +{overflow.length}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{overflow.map((p) => p.name).join(', ')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

/** Content type tag + Publisher — the documented "classification +
 *  attribution" half of the card, always separated from the title/
 *  description/metadata above it by a divider. Content type is a labeled
 *  badge, never color alone. */
function CardFooter({
  type,
  publishers,
  visualCount,
  className,
}: {
  type: SearchResultType
  publishers: ContentCardPublisher[]
  visualCount?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 border-t border-border pt-3', className)}>
      <PublisherGroup publishers={publishers} />
      {/* `ml-auto` (not `justify-between` on the row) keeps the badge(s)
          pinned to the right even when there's no publisher to occupy the
          left — `justify-between` would otherwise snap a lone child to the
          start. */}
      <div className="ml-auto flex items-center gap-2">
        {visualCount != null && visualCount > 0 && <Badge variant="outline">Visual ({visualCount})</Badge>}
        <Badge variant="secondary">{SEARCH_TYPE_LABEL[type]}</Badge>
      </div>
    </div>
  )
}

/** Icon + label pairs — the icon is decorative (each label already says what
 *  it means, e.g. "Updated Aug 2026", "CSV", "India"), so meaning never
 *  depends on the icon alone. */
function MetadataRow({ metadata, className }: { metadata: ContentCardMetadataItem[]; className?: string }) {
  if (metadata.length === 0) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3.5 gap-y-1', className)}>
      {metadata.map((item, index) => {
        const Icon = item.icon
        const label = (
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </span>
        )
        // Only a truncated summary (e.g. "CSV +3") carries a `tooltip` — the
        // full list, shown on hover/focus rather than only being implied by
        // the "+N".
        if (!item.tooltip) return <Fragment key={index}>{label}</Fragment>
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              {/* `span`, not `button` — this can sit inside the whole-card
                  `<Link>`, where a real button would be invalid nested
                  interactive content. */}
              <span tabIndex={0} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{item.tooltip}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

/** Plain wrapper (no navigation) — used for cards with no `href`. */
function StaticShell({ className, children }: { className: string; children: ReactNode }) {
  return <div className={className}>{children}</div>
}

/** The whole-card link target for the common case (no secondary action) —
 *  an actual `<Link>`, so it behaves like any other link (open in new tab,
 *  etc). `aria-label` keeps the title as the accessible name rather than the
 *  concatenation of every line of visible text. */
function LinkShell({ href, ariaLabel, className, children }: { href: string; ariaLabel: string; className: string; children: ReactNode }) {
  return (
    <Link
      to={href}
      aria-label={ariaLabel}
      className={cn(
        // `className` (which carries the grid variant's `flex flex-col`)
        // must come last — otherwise tailwind-merge keeps this base `block`
        // over it, silently breaking the grid card's internal flex layout
        // (and with it, the "pin metadata/footer to the bottom" `mt-auto`).
        'block transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </Link>
  )
}

/** Used only when the card also has a secondary `action` — a real `<button>`
 *  (or similar) inside an `<a>` is invalid HTML, so this makes the whole card
 *  a keyboard-operable, non-anchor click target instead. The action's own
 *  wrapper stops click propagation so activating it never also navigates. */
function ClickableShell({ href, ariaLabel, className, children }: { href: string; ariaLabel: string; className: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => navigate(href)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        navigate(href)
      }}
      className={cn(
        'cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </div>
  )
}

function ContentCard({ type, title, description, metadata, publishers = [], thumbnailUrl, href, action, visualCount, variant }: ContentCardProps) {
  const hasThumbnail = Boolean(thumbnailUrl)
  const actionSlot = action && (
    <div onClick={(event) => event.stopPropagation()} className="shrink-0">
      {action}
    </div>
  )

  const body =
    variant === 'grid' ? (
      <>
        {hasThumbnail && (
          // A fixed height (not `aspect-video`, which would scale taller in a
          // wider column) so every grid thumbnail is the same height
          // regardless of the card's own width.
          <div className="h-44 w-full overflow-hidden">
            <img src={thumbnailUrl!} alt="" className="size-full object-cover" />
          </div>
        )}
        {/* Two separate wrappers — title+description, and metadata+footer —
            with a plain `gap-3` (12px) between them as the standing default.
            `mt-auto` on the second one still pins it to the card's bottom
            edge when the card is taller than its own content (e.g. a grid
            row stretched to match a taller sibling); `gap-3` is the floor
            that stays even then, never collapsing below 12px. */}
        <div className="flex flex-1 flex-col gap-3 p-[18px]">
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 line-clamp-2 text-base font-semibold text-foreground">{title}</p>
              {actionSlot}
            </div>
            {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <MetadataRow metadata={metadata} />
            <CardFooter type={type} publishers={publishers} visualCount={visualCount} />
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center gap-4 p-[18px]">
        {hasThumbnail && <img src={thumbnailUrl!} alt="" className="h-24 w-36 shrink-0 rounded-md object-cover" />}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 line-clamp-2 text-base font-semibold text-foreground">{title}</p>
              {actionSlot}
            </div>
            {description && <p className="mt-1 w-4/5 truncate text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <MetadataRow metadata={metadata} />
            <CardFooter type={type} publishers={publishers} visualCount={visualCount} />
          </div>
        </div>
      </div>
    )

  const className = cn('overflow-hidden rounded-lg border border-border bg-card', variant === 'grid' && 'flex flex-col')

  if (!href) return <StaticShell className={className}>{body}</StaticShell>
  if (!action) return (
    <LinkShell href={href} ariaLabel={title} className={className}>
      {body}
    </LinkShell>
  )
  return (
    <ClickableShell href={href} ariaLabel={title} className={className}>
      {body}
    </ClickableShell>
  )
}

export { ContentCard }
