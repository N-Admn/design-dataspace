import * as React from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { docPath, groupLabel, searchDocs } from '@/pages/documentation/content'

/** The documentation search: a field and, while something is typed, a list of matching pages and sections with an excerpt. It searches the
 *  documentation only (titles, headings, text and aliases). Arrow keys move through the results, Enter opens one, Escape clears. */

function DocSearch({
  placeholder,
  ariaLabel,
  onNavigate,
  size = 'sm',
  /** Called with whether results are showing, so a sidebar can swap its navigation for them. */
  onActiveChange,
  className,
}: {
  placeholder: string
  ariaLabel: string
  onNavigate?: () => void
  size?: 'sm' | 'lg'
  onActiveChange?: (active: boolean) => void
  className?: string
}) {
  const [query, setQuery] = React.useState('')
  const [index, setIndex] = React.useState(0)
  const listId = React.useId()
  const hits = React.useMemo(() => searchDocs(query), [query])
  const searching = query.trim().length > 0

  React.useEffect(() => onActiveChange?.(searching), [searching, onActiveChange])
  React.useEffect(() => setIndex(0), [query])

  const hrefOf = (hit: (typeof hits)[number]) => `${docPath(hit.article.slug)}${hit.sectionId ? `#${hit.sectionId}` : ''}`
  const idOf = (i: number) => `${listId}-${i}`

  const linkRefs = React.useRef<(HTMLAnchorElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && hits.length > 0) {
      e.preventDefault()
      setIndex((i) => (i + 1) % hits.length)
    } else if (e.key === 'ArrowUp' && hits.length > 0) {
      e.preventDefault()
      setIndex((i) => (i - 1 + hits.length) % hits.length)
    } else if (e.key === 'Enter' && hits[index]) {
      e.preventDefault()
      linkRefs.current[index]?.click()
    } else if (e.key === 'Escape' && query) {
      e.preventDefault()
      setQuery('')
    }
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground', size === 'lg' ? 'size-5' : 'size-4')} aria-hidden="true" />
        <input
          type="search"
          role="combobox"
          aria-expanded={searching}
          aria-controls={listId}
          aria-activedescendant={searching && hits.length > 0 ? idOf(index) : undefined}
          aria-label={ariaLabel}
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-input bg-background pl-9 pr-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden',
            size === 'lg' ? 'h-12 text-base' : 'h-9 text-sm',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-control-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div id={listId} role="listbox" aria-label="Search results" className={cn(searching ? 'mt-3' : 'hidden')}>
        {searching && hits.length === 0 && (
          <p role="status" className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No pages found for “{query.trim()}”. Try a different word, or clear the search.
          </p>
        )}
        {hits.length > 0 && (
          <>
            <p role="status" className="sr-only">
              {hits.length} {hits.length === 1 ? 'result' : 'results'}
            </p>
            <ul className="flex flex-col gap-1">
              {hits.map((hit, i) => (
                <li key={`${hit.article.slug}#${hit.sectionId ?? ''}`}>
                  <Link
                    ref={(el) => {
                      linkRefs.current[i] = el
                    }}
                    id={idOf(i)}
                    role="option"
                    aria-selected={i === index}
                    to={hrefOf(hit)}
                    tabIndex={-1}
                    onClick={() => {
                      setQuery('')
                      onNavigate?.()
                    }}
                    className={cn(
                      'block rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      i === index ? 'border-primary/40 bg-secondary' : 'border-transparent hover:bg-control-hover',
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {hit.article.title}
                      {hit.sectionTitle && <span className="font-normal text-muted-foreground"> · {hit.sectionTitle}</span>}
                    </span>
                    <span className="block text-xs text-muted-foreground">{groupLabel(hit.article.group)}</span>
                    {hit.excerpt && <span className="mt-1 block text-xs text-text-subdued">{hit.excerpt}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export { DocSearch }
