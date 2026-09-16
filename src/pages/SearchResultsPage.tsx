import * as React from 'react'
import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { Chip } from '@/components/discover/Chip'
import { GlobalSearchField } from '@/components/discover/GlobalSearchField'
import { SearchResultCard } from '@/components/discover/SearchResultCard'
import { useAppData } from '@/context/AppDataContext'
import { buildSearchIndex, searchItems, SEARCH_TYPE_LABEL, type SearchResultType } from '@/lib/global-search'

type TypeFilter = 'all' | SearchResultType

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dataset', label: 'Datasets' },
  { value: 'use-case', label: 'Use Cases' },
  { value: 'publication', label: 'Publications' },
  { value: 'collaborative', label: 'Collaboratives' },
  { value: 'event', label: 'Events' },
]

function SearchResultsPage() {
  const { datasets, useCases, collaboratives, events } = useAppData()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const typeParam = searchParams.get('type')
  const type: TypeFilter = TYPE_FILTERS.some((f) => f.value === typeParam) ? (typeParam as TypeFilter) : 'all'

  const updateParams = (next: { q?: string; type?: TypeFilter }) => {
    const params = new URLSearchParams(searchParams)
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q)
      else params.delete('q')
    }
    if (next.type !== undefined) {
      if (next.type && next.type !== 'all') params.set('type', next.type)
      else params.delete('type')
    }
    setSearchParams(params, { replace: false })
  }

  // Local, controlled copy of the query so typing doesn't push a history
  // entry per keystroke — only submitting (Enter / Search button) navigates.
  const [draft, setDraft] = React.useState(query)
  React.useEffect(() => setDraft(query), [query])

  const index = React.useMemo(
    () => buildSearchIndex({ datasets, useCases, collaboratives, events }),
    [datasets, useCases, collaboratives, events],
  )

  const allMatches = React.useMemo(() => searchItems(index, query), [index, query])
  const results = type === 'all' ? allMatches : allMatches.filter((item) => item.type === type)

  const countFor = (value: TypeFilter) => (value === 'all' ? allMatches.length : allMatches.filter((i) => i.type === value).length)

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="sr-only">Search results</h1>
      <GlobalSearchField
        value={draft}
        onChange={setDraft}
        onSubmit={(value) => updateParams({ q: value.trim() })}
        placeholder="Search datasets, use cases, publications, and more"
        ariaLabel="Search CivicDataSpace"
        size="md"
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter results by content type">
        {TYPE_FILTERS.map((f) => (
          <Chip key={f.value} label={`${f.label} (${countFor(f.value)})`} pressed={type === f.value} onClick={() => updateParams({ type: f.value })} />
        ))}
      </div>

      {query.trim() === '' && type === 'all' ? (
        <EmptyState
          icon={SearchX}
          title="Search to get started"
          description="Enter a keyword, topic, location, or organisation name above, or choose a content type below to browse."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No results for "${query}"`}
          description="Try a different keyword, or clear the content-type filter."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? '' : 's'} {type !== 'all' && `in ${SEARCH_TYPE_LABEL[type as SearchResultType]}`}
            {query.trim() && ` for "${query}"`}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { SearchResultsPage }
