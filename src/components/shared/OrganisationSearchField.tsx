import * as React from 'react'
import { Building2, Search } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import type { Organisation } from '@/types/event'

interface OrganisationSearchFieldProps {
  organisations: Organisation[]
  excludeIds: string[]
  onSelect: (org: Organisation) => void
  placeholder: string
}

function OrganisationSearchField({ organisations, excludeIds, onSelect, placeholder }: OrganisationSearchFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const results = organisations
    .filter((o) => !excludeIds.includes(o.id))
    .filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2 rounded-md border border-border-input bg-surface-default px-3 text-sm text-text-subdued transition-colors hover:border-border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <Search className="size-4 shrink-0" />
          {placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search organisations..." />
        <SearchResultList
          isEmpty={results.length === 0}
          emptyLabel="No organisations found."
          className="max-h-72 overflow-y-auto"
        >
          {results.map((org) => (
            <SearchResultRow
              key={org.id}
              icon={Building2}
              primary={org.name}
              secondary={org.isRegistered ? 'Registered organisation' : 'New organisation'}
              onSelect={() => {
                onSelect(org)
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

export { OrganisationSearchField }
