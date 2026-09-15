import * as React from 'react'
import { Search, User } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import type { MockPerson } from '@/lib/mock-people'

interface SpeakerSearchFieldProps {
  people: MockPerson[]
  /** Names already on the Speakers list — filtered out of results. */
  excludeNames: string[]
  onSelect: (person: MockPerson) => void
  placeholder: string
}

/** Detail line shown under a contributor's name: "Organisation · Role", with the
 * role dropped when absent (organisation is always present — see the results
 * filter, which only lists organisation-affiliated contributors). */
function formatContributorDetail(person: MockPerson): string {
  return [person.organisation, person.role].filter(Boolean).join(' · ')
}

function SpeakerSearchField({ people, excludeNames, onSelect, placeholder }: SpeakerSearchFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const q = query.trim().toLowerCase()
  const excluded = new Set(excludeNames.map((n) => n.trim().toLowerCase()))
  const results = people
    // Only organisation-affiliated contributors are eligible as speakers —
    // independent / unaffiliated profiles are never listed.
    .filter((p) => Boolean(p.organisation))
    .filter((p) => !excluded.has(p.name.trim().toLowerCase()))
    .filter((p) => !q || p.name.toLowerCase().includes(q))

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
        <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search contributors by name..." />
        <SearchResultList
          isEmpty={results.length === 0}
          emptyLabel="No contributors found."
          className="max-h-72 overflow-y-auto"
        >
          {results.map((person) => (
            <SearchResultRow
              key={person.id}
              icon={User}
              primary={person.name}
              secondary={formatContributorDetail(person)}
              onSelect={() => {
                onSelect(person)
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

export { SpeakerSearchField }
