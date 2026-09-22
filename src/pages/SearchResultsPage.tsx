import * as React from 'react'
import { ChevronDown, LayoutGrid, LayoutList, SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { Chip } from '@/components/discover/Chip'
import { GlobalSearchField } from '@/components/discover/GlobalSearchField'
import { SearchResultCard, TYPE_ICON } from '@/components/discover/SearchResultCard'
import { FilterRail } from '@/components/discover/FilterRail'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'
import { parseAppTimestamp } from '@/lib/format'
import { FILTER_GROUPS_BY_TYPE, type TypeFilter } from '@/lib/search-filters'
import {
  buildSearchIndex,
  filterByTag,
  filterItems,
  searchItems,
  type ActiveFilters,
  type SearchResultItem,
} from '@/lib/global-search'

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dataset', label: 'Datasets' },
  { value: 'use-case', label: 'Use Cases' },
  { value: 'publication', label: 'Publications' },
  { value: 'collaborative', label: 'Collaboratives' },
  { value: 'event', label: 'Events' },
  { value: 'ai-model', label: 'AI Models' },
]

/** How many cards each category shows in the grouped "All" view before
 *  handing off to "View all →" (which just re-selects that type's pill). */
const GROUPED_VIEW_LIMIT = 3

type SortKey = 'relevance' | 'newest' | 'oldest' | 'az'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
]

/** "Relevance" is the pool's natural order (this app has no real relevance
 *  score to rank by) — every other option sorts by a real field (the
 *  record's own timestamp, or its title), never a fabricated ranking. */
function sortResults(items: SearchResultItem[], sort: SortKey): SearchResultItem[] {
  if (sort === 'relevance') return items
  const sorted = [...items]
  if (sort === 'newest') sorted.sort((a, b) => parseAppTimestamp(b.facets.updatedAt).getTime() - parseAppTimestamp(a.facets.updatedAt).getTime())
  else if (sort === 'oldest') sorted.sort((a, b) => parseAppTimestamp(a.facets.updatedAt).getTime() - parseAppTimestamp(b.facets.updatedAt).getTime())
  else sorted.sort((a, b) => a.title.localeCompare(b.title))
  return sorted
}

type ResultView = 'list' | 'grid'

function ResultsGrid({ items, view }: { items: SearchResultItem[]; view: ResultView }) {
  return (
    <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'flex flex-col gap-3'}>
      {items.map((item) => (
        <SearchResultCard key={`${item.type}-${item.id}`} item={item} layout={view} />
      ))}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: ResultView; onChange: (view: ResultView) => void }) {
  const options: { value: ResultView; label: string; icon: typeof LayoutList }[] = [
    { value: 'list', label: 'List view', icon: LayoutList },
    { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  ]
  return (
    <div className="flex shrink-0 gap-1 rounded-lg border border-border bg-muted/40 p-1" role="group" aria-label="Result view">
      {options.map((option) => {
        const Icon = option.icon
        const active = view === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

function SortMenu({ sort, onChange }: { sort: SortKey; onChange: (sort: SortKey) => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        <div className="flex flex-col">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SearchResultsPage() {
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces } = useAppData()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const typeParam = searchParams.get('type')
  const type: TypeFilter = TYPE_FILTERS.some((f) => f.value === typeParam) ? (typeParam as TypeFilter) : 'all'
  // A structured filter (e.g. clicking a dataset tag) — kept distinct from the
  // free-text `q` keyword search; see `filterByTag`.
  const tag = searchParams.get('tag') ?? ''

  // The filter rail's own selections. Not part of the URL (unlike type/q/tag)
  // — switching the content-type pill prunes this in place instead of
  // navigating, per the "content-type pill = what, filters = which" model.
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilters>({})
  // Results-area presentation only — independent of the filter/search state
  // above. Only meaningful for a single selected content type; the grouped
  // "All" view always shows its own compact grid, per type, unsorted.
  const [view, setView] = React.useState<ResultView>('list')
  const [sort, setSort] = React.useState<SortKey>('relevance')

  const updateParams = (next: { q?: string; type?: TypeFilter; tag?: string }) => {
    const params = new URLSearchParams(searchParams)
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    if (next.type !== undefined) {
      if (next.type && next.type !== 'all') params.set('type', next.type)
      else params.delete('type')
    }
    if (next.tag !== undefined) {
      if (next.tag) params.set('tag', next.tag)
      else params.delete('tag')
    }
    setSearchParams(params, { replace: false })
  }

  // Switching content type keeps shared filters (same key exists in the new
  // type's group list, e.g. Sector/Geography) and clears type-specific ones
  // (e.g. Format only means something for Datasets) — done in place, no
  // navigation, per "Switching content types" above.
  const filterKeysForType = React.useMemo(() => new Set(FILTER_GROUPS_BY_TYPE[type].map((g) => g.key)), [type])
  React.useEffect(() => {
    setActiveFilters((prev) => {
      const next: ActiveFilters = {}
      for (const [key, values] of Object.entries(prev)) {
        if (filterKeysForType.has(key)) next[key] = values
      }
      return next
    })
  }, [filterKeysForType])

  const setFilter = (key: string, values: string[]) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      if (values.length === 0) delete next[key]
      else next[key] = values
      return next
    })
  }

  // Local, controlled copy of the query so typing doesn't push a history
  // entry per keystroke — only submitting (Enter / Search button) navigates.
  const [draft, setDraft] = React.useState(query)
  React.useEffect(() => setDraft(query), [query])

  const index = React.useMemo(
    () => buildSearchIndex({ datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces }),
    [datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces],
  )

  const keywordMatches = React.useMemo(() => searchItems(index, query), [index, query])
  const tagMatches = React.useMemo(() => (tag ? filterByTag(keywordMatches, tag) : keywordMatches), [keywordMatches, tag])
  // The pool the filter rail computes its own counts from — current type +
  // keyword/tag matches, before any filter-group selection narrows it further.
  const typeMatches = React.useMemo(
    () => (type === 'all' ? tagMatches : tagMatches.filter((item) => item.type === type)),
    [tagMatches, type],
  )
  const results = React.useMemo(() => filterItems(typeMatches, activeFilters), [typeMatches, activeFilters])

  const countFor = (value: TypeFilter) => (value === 'all' ? tagMatches.length : tagMatches.filter((i) => i.type === value).length)
  const hasActiveFilters = Object.keys(activeFilters).length > 0
  const filterGroups = FILTER_GROUPS_BY_TYPE[type]

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 py-4">
      <h1 className="sr-only">Search results</h1>

      {/* Sticky so the search bar and content-type pills stay reachable while
          scrolling through results — `bg-page-background` matches the page's
          own background so results scrolling underneath don't show through. */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 bg-page-background py-3">
        <GlobalSearchField
          value={draft}
          onChange={setDraft}
          onSubmit={(value) => updateParams({ q: value.trim() })}
          placeholder="Search datasets, use cases, publications, and more"
          ariaLabel="Search CivicDataSpace"
          size="md"
        />

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap" role="group" aria-label="Filter results by content type">
          {TYPE_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={`${f.label} (${countFor(f.value)})`}
              pressed={type === f.value}
              onClick={() => updateParams({ type: f.value })}
              // "All" has no single content-type icon and stays its natural
              // width; the rest share the remaining width evenly so the row
              // lines up with the search bar above it.
              icon={f.value === 'all' ? undefined : TYPE_ICON[f.value]}
              className={f.value === 'all' ? 'shrink-0' : 'min-w-0 sm:flex-1'}
            />
          ))}
        </div>
      </div>

      {tag && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Active tag filter">
          <Chip label={`Clear tag: ${tag}`} pressed onClick={() => updateParams({ tag: '' })} />
        </div>
      )}

      {query.trim() === '' && type === 'all' && !tag && !hasActiveFilters ? (
        <EmptyState
          icon={SearchX}
          title="Search to get started"
          description="Enter a keyword, topic, location, or organisation name above, or choose a content type below to browse."
        />
      ) : (
        <div className="flex flex-col gap-7 sm:flex-row">
          <FilterRail
            groups={filterGroups}
            items={typeMatches}
            active={activeFilters}
            onChange={setFilter}
            onClearAll={() => setActiveFilters({})}
          />

          <div className="hidden shrink-0 self-stretch border-l border-border sm:block" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            {results.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={tag ? `No results tagged "${tag}"` : query.trim() ? `No results for "${query}"` : 'No results'}
                description="Try a different keyword, or clear a filter."
              />
            ) : type === 'all' ? (
              <div className="flex flex-col gap-8">
                {TYPE_FILTERS.filter((f) => f.value !== 'all').map((f) => {
                  const items = results.filter((item) => item.type === f.value)
                  if (items.length === 0) return null
                  return (
                    <section key={f.value} aria-labelledby={`section-${f.value}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h2 id={`section-${f.value}`} className="type-heading-3 text-foreground">
                          {f.label}
                        </h2>
                        {items.length > GROUPED_VIEW_LIMIT && (
                          <button
                            type="button"
                            onClick={() => updateParams({ type: f.value })}
                            className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            View all →
                          </button>
                        )}
                      </div>
                      <div className="mt-3">
                        <ResultsGrid items={items.slice(0, GROUPED_VIEW_LIMIT)} view="grid" />
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {results.length} {TYPE_FILTERS.find((f) => f.value === type)?.label}
                  </p>
                  <div className="flex items-center gap-4">
                    <SortMenu sort={sort} onChange={setSort} />
                    <ViewToggle view={view} onChange={setView} />
                  </div>
                </div>
                <div className="mt-4">
                  <ResultsGrid items={sortResults(results, sort)} view={view} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { SearchResultsPage }
