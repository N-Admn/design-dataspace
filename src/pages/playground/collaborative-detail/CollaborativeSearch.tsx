import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Resource } from '@/pages/playground/collaborative-detail/collaborative-sample-data'

/** The Collaborative-wide search: one field and filter chips that narrow the page's own sections (Use cases, Organisations, People and
 *  Datasets) to what matches, rather than listing results of their own. The state lives in the page; this renders the controls and a
 *  one-line summary of what is showing. The sections keep their own sorting and "load more" on top of whatever is matched. */

export type SearchKind = 'datasets' | 'use-cases' | 'organisations' | 'people'
export type SearchFilter = 'all' | SearchKind

export const SEARCH_FILTERS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'datasets', label: 'Datasets' },
  { value: 'use-cases', label: 'Use Cases' },
  { value: 'organisations', label: 'Organisations' },
  { value: 'people', label: 'People' },
]

const NOUN: Record<SearchKind, [string, string]> = {
  datasets: ['dataset', 'datasets'],
  'use-cases': ['use case', 'use cases'],
  organisations: ['organisation', 'organisations'],
  people: ['person', 'people'],
}

export interface SearchableParty {
  id: string
  name: string
  /** e.g. the relationship ("Partner"); searched along with the name. */
  subtitle: string
}

/** Every word typed has to appear somewhere in the item's searchable text (case-insensitive). */
export const searchTerms = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean)

const matchesAll = (terms: string[], ...parts: (string | undefined)[]) => {
  if (terms.length === 0) return true
  const haystack = parts.filter(Boolean).join(' ').toLowerCase()
  return terms.every((t) => haystack.includes(t))
}

/** Names, descriptions and the metadata a dataset or use case has. */
export const resourceMatches = (r: Resource, terms: string[]) =>
  matchesAll(terms, r.title, r.description, r.topic, r.sector, r.format, r.geography, ...r.tags)

export const partyMatches = (p: SearchableParty, terms: string[]) => matchesAll(terms, p.name, p.subtitle)

export type SearchCounts = Record<SearchKind, { matches: number; total: number }>

function CollaborativeSearch({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
}: {
  query: string
  onQueryChange: (query: string) => void
  filter: SearchFilter
  onFilterChange: (filter: SearchFilter) => void
  counts: SearchCounts
}) {
  const searching = searchTerms(query).length > 0
  const kinds = (Object.keys(counts) as SearchKind[]).filter((k) => counts[k].total > 0 && (filter === 'all' || filter === k))
  const totalMatches = kinds.reduce((n, k) => n + counts[k].matches, 0)

  const summary = !searching
    ? kinds.map((k) => `${counts[k].total} ${NOUN[k][counts[k].total === 1 ? 0 : 1]}`).join(' · ')
    : totalMatches === 0
      ? `No matches for “${query.trim()}”. Try a different word, or clear the search.`
      : `${totalMatches} ${totalMatches === 1 ? 'match' : 'matches'} for “${query.trim()}”: ` +
        kinds
          .filter((k) => counts[k].matches > 0)
          .map((k) => `${counts[k].matches} ${NOUN[k][counts[k].matches === 1 ? 0 : 1]}`)
          .join(' · ') +
        '. The sections below show only these.'

  return (
    <div>
      {/* The sections update as you type, so submitting has nothing more to do. */}
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-text-subdued" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search datasets, use cases, organisations, people…"
            aria-label="Search datasets, use cases, organisations and people in this collaborative"
            className="h-14 rounded-full pl-13 pr-13 text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-text-subdued hover:bg-surface-subdued hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      <div role="group" aria-label="Show" className="mt-4 flex flex-wrap gap-2">
        {SEARCH_FILTERS.map((f) => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-default text-text-default hover:border-primary/40 hover:text-text-brand',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-text-subdued">
        {searching ? summary : filter === 'all' ? `Connected to this collaborative: ${summary}.` : `Showing ${summary}.`}
      </p>
    </div>
  )
}

export { CollaborativeSearch }
