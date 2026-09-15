import * as React from 'react'
import { Database, FileText, Layers, Sparkles, Users2, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'

export type ResourceKind = 'dataset' | 'use-case' | 'collaborative' | 'ai-model' | 'publication'

export interface ResourceCandidate {
  id: string
  title: string
  kind: ResourceKind
  /** Organisation / contributor, shown after the type when available. */
  organisation?: string
  /** Publication type value — carried through so a connected publication keeps its badge. */
  publicationType?: string
}

export const RESOURCE_KIND_LABEL: Record<ResourceKind, string> = {
  dataset: 'Dataset',
  'use-case': 'Use Case',
  collaborative: 'Collaborative',
  'ai-model': 'AI Model',
  publication: 'Publication',
}

export const RESOURCE_KIND_ICON: Record<ResourceKind, LucideIcon> = {
  dataset: Database,
  'use-case': Layers,
  collaborative: Users2,
  'ai-model': Sparkles,
  publication: FileText,
}

type Filter = 'all' | ResourceKind

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dataset', label: 'Datasets' },
  { value: 'use-case', label: 'Use Cases' },
  { value: 'collaborative', label: 'Collaboratives' },
  { value: 'ai-model', label: 'AI Models' },
  { value: 'publication', label: 'Publications' },
]

interface ResourceSearchFieldProps {
  /** All connectable resources, already stripped of anything selected. */
  candidates: ResourceCandidate[]
  onSelect: (candidate: ResourceCandidate) => void
}

/** Secondary line under a result: "Type · Organisation", organisation dropped when absent. */
function candidateDetail(candidate: ResourceCandidate): string {
  return [RESOURCE_KIND_LABEL[candidate.kind], candidate.organisation].filter(Boolean).join(' · ')
}

function ResourceSearchField({ candidates, onSelect }: ResourceSearchFieldProps) {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<Filter>('all')

  const q = query.trim().toLowerCase()
  const active = q.length > 0

  const results = active
    ? candidates
        .filter((c) => filter === 'all' || c.kind === filter)
        .filter((c) => c.title.toLowerCase().includes(q))
    : []

  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={query} onChange={setQuery} placeholder="Search resources by name…" />

      {active && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === f.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <SearchResultList isEmpty={results.length === 0} emptyLabel="No resources found.">
            {results.map((candidate) => (
              <SearchResultRow
                key={`${candidate.kind}-${candidate.id}`}
                icon={RESOURCE_KIND_ICON[candidate.kind]}
                primary={candidate.title}
                secondary={candidateDetail(candidate)}
                onSelect={() => {
                  onSelect(candidate)
                  setQuery('')
                  setFilter('all')
                }}
              />
            ))}
          </SearchResultList>
        </>
      )}
    </div>
  )
}

export { ResourceSearchField }
