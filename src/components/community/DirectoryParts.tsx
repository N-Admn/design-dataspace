import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SearchX, type LucideIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn, initialsFor } from '@/lib/utils'

/** The pieces the Community directory is built from. Its anatomy follows the Search results page: the same card structure, the same
 *  filter rail, the same results toolbar. */

export const DIRECTORY_PAGE_SIZE = 9

/* -------------------------------------------------------------------- card */

type EntityKind = 'organisation' | 'individual'

/** An organisation's logo or a person's photo, or initials when none has been set. A failed image falls back to initials. */
function EntityImage({ kind, name, imageUrl, className, initialsClassName }: { kind: EntityKind; name: string; imageUrl: string | null; className?: string; initialsClassName?: string }) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [imageUrl])
  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={kind === 'organisation' ? `${name} logo` : `Photo of ${name}`}
        onError={() => setFailed(true)}
        // A logo is shown whole inside its circle; a photo fills it.
        className={cn('size-full', kind === 'organisation' ? 'object-contain p-5' : 'object-cover', className)}
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

/** One card for every entry in the directory, laid out like a Search result: a round image (a band behind it in grid), the title, a clamped description, the
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
          <div className="size-[67px] shrink-0 overflow-hidden rounded-full border border-border bg-card">
            <EntityImage kind={kind} name={name} imageUrl={imageUrl} className={kind === 'organisation' ? 'p-2' : undefined} initialsClassName="text-xl" />
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

  return (
    <Link to={href} aria-label={name} className={cn(frame, 'flex flex-col')}>
      <div className="flex h-44 w-full shrink-0 items-center justify-center bg-muted">
        <div className="size-[123px] overflow-hidden rounded-full border border-border bg-card">
          <EntityImage kind={kind} name={name} imageUrl={imageUrl} className={kind === 'organisation' ? 'p-3' : undefined} initialsClassName="text-3xl" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-[18px]">
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
}: {
  groups: RailGroup[]
  active: Record<string, string[]>
  onChange: (key: string, values: string[]) => void
  onClearAll: () => void
}) {
  const shown = groups.filter((g) => g.options.length > 0)
  if (shown.length === 0) return null
  const hasActive = Object.values(active).some((v) => v.length > 0)
  return (
    <div className="flex w-full shrink-0 flex-col gap-8 sm:w-[18%]">
      <div className="flex items-center justify-between gap-2">
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
                  <RadioGroupItem value="any" id={`${group.key}-any`} className="mt-0.5" />
                  <Label htmlFor={`${group.key}-any`} className="text-sm font-normal text-foreground">
                    {group.anyLabel ?? 'Any'}
                  </Label>
                </OptionRow>
                {group.options.map((option) => (
                  <OptionRow key={option.value} count={option.count}>
                    <RadioGroupItem value={option.value} id={`${group.key}-${option.value}`} className="mt-0.5" />
                    <Label htmlFor={`${group.key}-${option.value}`} className="text-sm font-normal text-foreground">
                      {option.label}
                    </Label>
                  </OptionRow>
                ))}
              </RadioGroup>
            ) : (
              <div className="flex flex-col gap-3.5">
                {group.options.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <OptionRow count={option.count}>
                      <Checkbox
                        className="mt-0.5"
                        checked={selected.includes(option.value)}
                        onCheckedChange={(next) => onChange(group.key, next ? [...selected, option.value] : selected.filter((v) => v !== option.value))}
                      />
                      <span className="text-sm font-normal text-foreground">{option.label}</span>
                    </OptionRow>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------- pagination */

/** Previous / numbered pages / next. Long ranges collapse to “1 … 4 5 6 … 12”. */
function DirectoryPagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  if (pageCount <= 1) return null
  const numbers: (number | 'gap-start' | 'gap-end')[] = []
  for (let n = 1; n <= pageCount; n += 1) {
    if (n === 1 || n === pageCount || Math.abs(n - page) <= 1) numbers.push(n)
    else if (n < page && numbers[numbers.length - 1] !== 'gap-start') numbers.push('gap-start')
    else if (n > page && numbers[numbers.length - 1] !== 'gap-end') numbers.push('gap-end')
  }
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft aria-hidden="true" />
        Previous
      </Button>
      {numbers.map((n, i) =>
        typeof n === 'string' ? (
          <span key={`${n}-${i}`} aria-hidden="true" className="px-1 text-text-subdued">
            …
          </span>
        ) : (
          <Button
            key={n}
            type="button"
            variant={n === page ? 'default' : 'outline'}
            size="sm"
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPage(n)}
            className="min-w-9 tabular-nums"
          >
            {n}
          </Button>
        ),
      )}
      <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
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
