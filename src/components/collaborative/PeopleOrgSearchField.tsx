import * as React from 'react'
import { Building2, Search, User } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
      <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or organisations..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {results.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No people or organisations found.</p>
          )}
          {results.map((result) => (
            <button
              key={`${result.kind}-${result.refId}`}
              type="button"
              onClick={() => {
                onSelect(result)
                setOpen(false)
                setQuery('')
              }}
              className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted"
            >
              {result.logo?.dataUrl ? (
                <img src={result.logo.dataUrl} alt="" className="size-7 shrink-0 rounded-full border border-border object-cover" />
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {result.kind === 'person' ? <User className="size-3.5" /> : <Building2 className="size-3.5" />}
                </div>
              )}
              <span className="min-w-0">
                <span className="block truncate text-foreground">{result.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{result.context}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { PeopleOrgSearchField }
