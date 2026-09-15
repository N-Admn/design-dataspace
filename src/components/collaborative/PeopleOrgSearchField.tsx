import * as React from 'react'
import { Building2, Search, User } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import { MOCK_PEOPLE } from '@/lib/mock-people'
import type { Organisation } from '@/types/event'
import type { CollaborativePerson } from '@/types/collaborative'

export type PeopleOrgSearchResult = Omit<CollaborativePerson, 'relationship'>

interface PeopleOrgSearchFieldProps {
  organisations: Organisation[]
  excludeIds: string[]
  onSelect: (result: PeopleOrgSearchResult) => void
  placeholder: string
}

function PeopleOrgSearchField({ organisations, excludeIds, onSelect, placeholder }: PeopleOrgSearchFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const q = query.trim().toLowerCase()

  const people: PeopleOrgSearchResult[] = MOCK_PEOPLE.filter((p) => !excludeIds.includes(p.id))
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .map((p) => ({ refId: p.id, kind: 'person', name: p.name, context: p.title }))

  const orgs: PeopleOrgSearchResult[] = organisations
    .filter((o) => !excludeIds.includes(o.id))
    .filter((o) => !q || o.name.toLowerCase().includes(q))
    .map((o) => ({
      refId: o.id,
      kind: 'organisation',
      name: o.name,
      context: o.isRegistered ? 'Registered organisation' : 'New organisation',
      logo: o.logo,
    }))

  const results = [...people, ...orgs]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="size-4 shrink-0" />
          {placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search people or organisations..." />
        <SearchResultList
          isEmpty={results.length === 0}
          emptyLabel="No people or organisations found."
          className="max-h-72 overflow-y-auto"
        >
          {results.map((result) => (
            <SearchResultRow
              key={`${result.kind}-${result.refId}`}
              icon={result.kind === 'person' ? User : Building2}
              primary={result.name}
              secondary={result.context}
              onSelect={() => {
                onSelect(result)
                setOpen(false)
                setQuery('')
              }}
            />
          ))}
        </SearchResultList>
      </PopoverContent>
    </Popover>
  )
}

export { PeopleOrgSearchField }
