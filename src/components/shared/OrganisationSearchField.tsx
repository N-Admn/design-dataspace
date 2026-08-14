import * as React from 'react'
import { Building2, Search } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
            placeholder="Search organisations..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {results.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No organisations found.</p>
          )}
          {results.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => {
                onSelect(org)
                setOpen(false)
                setQuery('')
              }}
              className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted"
            >
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="block text-foreground">{org.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {org.isRegistered ? 'Registered organisation' : 'New organisation'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { OrganisationSearchField }
