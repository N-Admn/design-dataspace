import * as React from 'react'
import { Link } from 'react-router-dom'
import { SearchX, type LucideIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckboxGroup } from '@/components/discover/FilterRail'
import { cn, initialsFor } from '@/lib/utils'

/** The pieces the Community directory is built from. Its anatomy follows the Search results page: the same card structure, the same
 *  filter rail, the same results toolbar. */

export const DIRECTORY_PAGE_SIZE = 9

/* -------------------------------------------------------------------- card */

type EntityKind = 'organisation' | 'individual'

/** An organisation's logo or a person's photo, or initials when none has been set. A failed image falls back to initials. */
function EntityImage({
  kind,
  name,
  imageUrl,
  className,
  initialsClassName,
  square = false,
}: {
  kind: EntityKind
  name: string
  imageUrl: string | null
  className?: string
  initialsClassName?: string
  /** Set when the frame is a square rather than a circle: a logo then needs only a small margin, not the larger one a circle's curve calls for. */
  square?: boolean
}) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [imageUrl])
  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={kind === 'organisation' ? `${name} logo` : `Photo of ${name}`}
        onError={() => setFailed(true)}
        // A logo is shown whole inside its circle, with the margin that keeps a square logo's corners inside it; a photo fills it.
        className={cn('size-full', kind === 'organisation' ? 'bg-white object-contain p-5' : 'object-cover', className, kind === 'organisation' && (square ? 'p-1.5' : 'p-[15%]'))}
      />
    )
  }
  return (
    <span aria-hidden="true" className={cn('flex size-full items-center justify-center bg-surface-accent font-semibold text-text-on-accent', initialsClassName ?? 'text-2xl')}>
      {initialsFor(name)}
    </span>
  )
}

/** A small round or square avatar, for places a full image tile is too large. */
function EntityAvatar({ kind, name, imageUrl, className }: { kind: EntityKind; name: string; imageUrl: string | null; className?: string }) {
  return (
    <span className={cn('inline-flex size-12 shrink-0 overflow-hidden border border-border bg-card', 'rounded-full', className)}>
      <EntityImage kind={kind} name={name} imageUrl={imageUrl} className={kind === 'organisation' ? 'p-1.5' : undefined} initialsClassName="text-sm" />
    </span>
  )
}

interface DirectoryCardProps {
  href: string
  kind: EntityKind
  name: string
  imageUrl: string | null
  layout?: 'grid' | 'list'
  /** The badge at the foot of the card, like a content card's type: “Organisation” or “Individual publisher”. */
  typeLabel: string
  description?: string
  /** Icon and text rows (location, organisation type), shown in the accent colour. */
  metadata?: { icon: LucideIcon; text: string }[]
  /** The line at the left of the footer, where a content card shows its publishers. */
  summary?: string
}

/** One card for every entry in the directory: a square image (top left, above the title in grid; at the left in list), the title, a clamped description, the
 *  metadata rows, then a footer with the type badge on the right. Optional parts are left out when empty, never replaced by a
 *  placeholder or an invented value. The whole card is the link. */
function DirectoryCard({ href, kind, name, imageUrl, layout = 'grid', typeLabel, description, metadata = [], summary }: DirectoryCardProps) {
  const title = <p className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-text-brand">{name}</p>
  const meta = metadata.length > 0 && (
    <div className="flex flex-wrap items-center gap-x-[16.8px] gap-y-1">
      {metadata.map(({ icon: Icon, text }) => (
        <span key={text} className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-none text-text-accent-strong">
          <Icon className="size-[16.8px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <span className="truncate">{text}</span>
        </span>
      ))}
    </div>
  )
  const footer = (
    <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
      {summary && <p className="min-w-0 truncate text-xs text-muted-foreground">{summary}</p>}
      <Badge variant="secondary" className="ml-auto shrink-0">
        {typeLabel}
      </Badge>
    </div>
  )
  const frame = 'group block h-full overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  if (layout === 'list') {
    return (
      <Link to={href} aria-label={name} className={frame}>
        <div className="flex items-center gap-4 p-[18px]">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
            <EntityImage square kind={kind} name={name} imageUrl={imageUrl} initialsClassName="text-xl" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div>
              {title}
              {description && <p className="mt-1 w-4/5 truncate text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="mt-auto flex flex-col gap-2">
              {meta}
              {footer}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Grid: no image band. A square avatar sits at the top left, above the name, and the card reads as one block of text.
  return (
    <Link to={href} aria-label={name} className={cn(frame, 'flex flex-col')}>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
          <EntityImage square kind={kind} name={name} imageUrl={imageUrl} initialsClassName="text-xl" />
        </div>
        <div>
          {title}
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {meta}
          {footer}
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------- filter rail */

export interface RailOption {
  value: string
  label: string
  count: number
}

export interface RailGroup {
  key: string
  label: string
  /** `multi` is a set of checkboxes (any of the ticked); `single` is a radio group with an “Any” choice first. */
  kind: 'multi' | 'single'
  options: RailOption[]
  /** The wording of a single group’s first, unfiltered choice. */
  anyLabel?: string
  /** The count shown beside that first choice. */
  anyCount?: number
}

function OptionRow({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex min-w-0 items-start gap-2">{children}</span>
      <span className="shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{count}</span>
    </div>
  )
}

/** The left filter rail, drawn exactly like the Search page’s: checkbox groups (any of the ticked) and radio groups, each option
 *  with its live count. It is presentational: the page decides each group’s options and counts, and an option that matches nothing
 *  is simply not passed. On a phone it sits above the results, like Search. */
function FilterRailView({
  groups,
  active,
  onChange,
  onClearAll,
  stickyTop,
  layout = 'rail',
  idPrefix = '',
}: {
  groups: RailGroup[]
  active: Record<string, string[]>
  onChange: (key: string, values: string[]) => void
  onClearAll: () => void
  /** Pins the rail below the sticky search block (its height, in px) so only the results scroll. */
  stickyTop?: number
  /** `sheet`: the groups only, full width, for the bottom sheet on tablet and phone. */
  layout?: 'rail' | 'sheet'
  /** Prefix for the radio ids, so the rail and the sheet (both mounted) never share one. */
  idPrefix?: string
}) {
  const shown = groups.filter((g) => g.options.length > 0)
  if (shown.length === 0) return null
  const hasActive = Object.values(active).some((v) => v.length > 0)
  return (
    <div
      className={cn(
        layout === 'sheet' ? 'flex w-full flex-col gap-8' : 'flex w-full shrink-0 flex-col gap-8 sm:w-[18%]',
        layout === 'rail' && stickyTop !== undefined && 'sm:sticky sm:self-start sm:overflow-y-auto sm:pb-6 sm:pr-2',
      )}
      style={layout === 'rail' && stickyTop !== undefined ? { top: stickyTop, maxHeight: `calc(100dvh - ${stickyTop}px)` } : undefined}
    >
      <div className={cn('flex items-center justify-between gap-2', layout === 'sheet' && 'hidden')}>
        <p className="text-sm font-bold uppercase tracking-wider text-foreground">Filter by</p>
        {hasActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-sm text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear all
          </button>
        )}
      </div>

      {shown.map((group) => {
        const selected = active[group.key] ?? []
        return (
          <fieldset key={group.key} className="flex flex-col">
            <legend className="mb-3.5 text-sm font-semibold text-foreground">{group.label}</legend>
            {group.kind === 'single' ? (
              <RadioGroup value={selected[0] ?? 'any'} onValueChange={(value) => onChange(group.key, value === 'any' ? [] : [value])} className="gap-3.5">
                <OptionRow count={group.anyCount ?? 0}>
                  <RadioGroupItem value="any" id={`${idPrefix}${group.key}-any`} className="mt-0.5" />
                  <Label htmlFor={`${idPrefix}${group.key}-any`} className="text-sm font-normal text-foreground">
                    {group.anyLabel ?? 'Any'}
                  </Label>
                </OptionRow>
                {group.options.map((option) => (
                  <OptionRow key={option.value} count={option.count}>
                    <RadioGroupItem value={option.value} id={`${idPrefix}${group.key}-${option.value}`} className="mt-0.5" />
                    <Label htmlFor={`${idPrefix}${group.key}-${option.value}`} className="text-sm font-normal text-foreground">
                      {option.label}
                    </Label>
                  </OptionRow>
                ))}
              </RadioGroup>
            ) : (
              <CheckboxGroup groupKey={group.key} options={group.options} selected={selected} onChange={onChange} />
            )}
          </fieldset>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------- pagination */

/** The page numbers to show, with “…” where a run is skipped: always the first and last page, and a window around the current one
 *  (“1 … 14 15 16 … 110”). Near either end the window widens (“1 2 3 4 5 … 110”) so the row keeps a steady width as you page. */
function pageItems(page: number, pageCount: number): (number | 'gap-start' | 'gap-end')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap-end', pageCount]
  if (page >= pageCount - 3) return [1, 'gap-start', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  return [1, 'gap-start', page - 1, page, page + 1, 'gap-end', pageCount]
}

/** Results range on the left (“Results 10–18 of 73”), Previous / numbered pages / Next in the middle, and a “Go to” field on the
 *  right for long lists. Pass `total` and `pageSize` to show the range; the Go to field appears from 8 pages up. */
function DirectoryPagination({
  page,
  pageCount,
  onPage,
  total,
  pageSize,
}: {
  page: number
  pageCount: number
  onPage: (page: number) => void
  total?: number
  pageSize?: number
}) {
  const [goTo, setGoTo] = React.useState('')
  if (pageCount <= 1) return null
  const submitGoTo = () => {
    const n = Number.parseInt(goTo, 10)
    if (Number.isFinite(n)) onPage(Math.min(pageCount, Math.max(1, n)))
    setGoTo('')
  }
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      {total !== undefined && pageSize !== undefined ? (
        <p className="text-sm tabular-nums text-text-subdued">
          Results {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
      ) : (
        <span aria-hidden="true" />
      )}
      {/* The controls sit at the right: Previous, the page numbers and Next, then the Go to field when there are many pages. */}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 text-sm sm:px-5 font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Previous
          </button>
          {pageItems(page, pageCount).map((n, i) =>
            typeof n === 'string' ? (
              <span key={`${n}-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => onPage(n)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-sm tabular-nums sm:size-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  n === page ? 'bg-primary font-semibold text-primary-foreground' : 'text-foreground hover:bg-muted',
                )}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 text-sm sm:px-5 font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Next
          </button>
        </div>
        {pageCount > 7 && (
          <form
            className="flex items-center gap-2 text-sm text-text-subdued"
            onSubmit={(e) => {
              e.preventDefault()
              submitGoTo()
            }}
          >
            <label htmlFor="pagination-go-to">Go to:</label>
            <input
              id="pagination-go-to"
              type="number"
              inputMode="numeric"
              min={1}
              max={pageCount}
              value={goTo}
              onChange={(e) => setGoTo(e.target.value)}
              placeholder={`e.g. ${Math.ceil(pageCount / 2)}`}
              className="h-8 w-24 rounded-md border border-border-default bg-background px-2 text-sm text-text-default placeholder:text-text-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            />
          </form>
        )}
      </div>
    </nav>
  )
}

/** Shown when a search or filter leaves nothing: says what happened and offers the way back. */
function NoResults({ title, description, onReset }: { title: string; description: string; onReset: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title={title}
      description={description}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Clear search and filters
        </Button>
      }
      className="py-14"
    />
  )
}

export { EntityAvatar, EntityImage, DirectoryCard, FilterRailView, DirectoryPagination, NoResults }
