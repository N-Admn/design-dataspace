import { ArrowRight, FlaskConical, SearchX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  PLAYGROUND_CATEGORIES,
  PLAYGROUND_STATUSES,
  PLAYGROUNDS,
  categoryLabel,
  filterPlaygrounds,
  type PlaygroundCategory,
  type PlaygroundEntry,
} from '@/pages/playground/playground-registry'

/** The central CivicDataSpace Playground: one place to find, open and return to the independent UI/UX prototypes. It only
 *  lists and links; it contains none of the prototypes and touches no production page. The search text and category live in
 *  the URL, so coming back from a playground (or using the browser's Back) restores exactly the view that was left. */

/** A restrained accent per category: blue, amber, teal. */
const CATEGORY_TINT: Record<PlaygroundCategory, string> = {
  'data-discovery': 'bg-chart-1/10 text-chart-1',
  'contribution-flows': 'bg-chart-4/15 text-text-warning',
  collaboratives: 'bg-chart-3/10 text-chart-3',
}

type CategoryFilter = PlaygroundCategory | 'all'
const isCategory = (value: string | null): value is PlaygroundCategory =>
  PLAYGROUND_CATEGORIES.some((c) => c.key === value)

function PlaygroundCard({ entry }: { entry: PlaygroundEntry }) {
  const status = PLAYGROUND_STATUSES[entry.status]
  const Icon = entry.icon
  const titleId = `playground-${entry.id}-title`
  return (
    <li className="flex">
      <article
        aria-labelledby={titleId}
        className="flex w-full flex-col gap-4 rounded-xl border border-border-default bg-card p-5 shadow-sm transition-colors hover:border-border-strong"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', CATEGORY_TINT[entry.category])}
          >
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h2 id={titleId} className="type-heading-3 text-text-brand">
            {entry.name}
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{categoryLabel(entry.category)}</p>
          <p className="line-clamp-3 text-sm text-text-default">{entry.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-default pt-4">
          <p className="min-w-0 text-xs text-text-subdued">
            {entry.built ? entry.covers : 'Prototype not built yet'}
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to={entry.href} aria-label={`Open Playground: ${entry.name}`}>
              Open Playground
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </article>
    </li>
  )
}

function PlaygroundHubPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const categoryParam = params.get('category')
  const category: CategoryFilter = isCategory(categoryParam) ? categoryParam : 'all'

  const update = (next: { q?: string; category?: CategoryFilter }) => {
    const merged = { q: next.q ?? query, category: next.category ?? category }
    const out = new URLSearchParams()
    if (merged.q) out.set('q', merged.q)
    if (merged.category !== 'all') out.set('category', merged.category)
    setParams(out, { replace: true })
  }

  const results = filterPlaygrounds(PLAYGROUNDS, query, category)
  const countIn = (c: CategoryFilter) => filterPlaygrounds(PLAYGROUNDS, query, c).length
  const filters: { key: CategoryFilter; label: string }[] = [{ key: 'all', label: 'All' }, ...PLAYGROUND_CATEGORIES]

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-display-1 flex items-center gap-3 text-text-brand">
          <FlaskConical className="size-8 shrink-0" aria-hidden="true" />
          CivicDataSpace Playground
        </h1>
        <p className="type-body text-text-subdued">
          Explore and test interface concepts, layouts, and interaction patterns before implementation.
        </p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <Input
            type="search"
            aria-label="Search playgrounds"
            placeholder="Search playgrounds…"
            value={query}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <Button
              key={f.key}
              type="button"
              size="sm"
              variant={category === f.key ? 'default' : 'outline'}
              aria-pressed={category === f.key}
              onClick={() => update({ category: f.key })}
            >
              {f.label}
              <span className="tabular-nums opacity-70">{countIn(f.key)}</span>
            </Button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'playground' : 'playgrounds'} shown
      </p>

      {results.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => (
            <PlaygroundCard key={entry.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default px-6 py-14 text-center">
          <SearchX className="size-8 text-text-subdued" aria-hidden="true" />
          <div>
            <p className="type-heading-3 text-text-default">No playgrounds match</p>
            <p className="mt-1 text-sm text-text-subdued">
              {query
                ? `Nothing found for “${query}”${category !== 'all' ? ` in ${categoryLabel(category)}` : ''}.`
                : `There are no playgrounds in ${category === 'all' ? 'the hub' : categoryLabel(category)} yet.`}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Clear search and filters
          </Button>
        </div>
      )}
    </div>
  )
}

export { PlaygroundHubPage }
