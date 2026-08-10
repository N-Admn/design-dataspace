import * as React from 'react'
import { Building2, Plus, Search, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { useAppData } from '@/context/AppDataContext'
import type { EventFormState, Organisation } from '@/types/event'

interface EventConnectionsStepProps {
  form: EventFormState
  onChange: React.Dispatch<React.SetStateAction<EventFormState>>
}

function OrganisationCard({ org, onRemove }: { org: Organisation; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      {org.logo?.dataUrl ? (
        <img src={org.logo.dataUrl} alt="" className="size-9 shrink-0 rounded-md border border-border object-cover" />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Building2 className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
        <p className="text-xs text-muted-foreground">
          {org.isRegistered ? 'Registered organisation' : 'New organisation'}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${org.name}`}
        onClick={onRemove}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

function OrganisationSearchField({
  organisations,
  excludeIds,
  onSelect,
  placeholder,
}: {
  organisations: Organisation[]
  excludeIds: string[]
  onSelect: (org: Organisation) => void
  placeholder: string
}) {
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

function EventConnectionsStep({ form, onChange }: EventConnectionsStepProps) {
  const { organisations, addOrganisation } = useAppData()
  const [showAddOrg, setShowAddOrg] = React.useState(false)

  const organiserIds = form.organisers.map((o) => o.id)
  const partnerIds = form.partners.map((o) => o.id)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organiser</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label>Search Organisations</Label>
          <OrganisationSearchField
            organisations={organisations}
            excludeIds={organiserIds}
            placeholder="Search organisations..."
            onSelect={(org) => onChange((prev) => ({ ...prev, organisers: [org] }))}
          />
          {form.organisers.map((org) => (
            <OrganisationCard
              key={org.id}
              org={org}
              onRemove={() => onChange((prev) => ({ ...prev, organisers: [] }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label>Search Organisations</Label>
          <OrganisationSearchField
            organisations={organisations}
            excludeIds={partnerIds}
            placeholder="Search organisations..."
            onSelect={(org) =>
              onChange((prev) => ({ ...prev, partners: [...prev.partners, org] }))
            }
          />
          {form.partners.map((org) => (
            <OrganisationCard
              key={org.id}
              org={org}
              onRemove={() =>
                onChange((prev) => ({ ...prev, partners: prev.partners.filter((p) => p.id !== org.id) }))
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speakers</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="speaker-count">Speaker Count</Label>
          <Input
            id="speaker-count"
            type="number"
            min="0"
            className="mt-1.5 sm:max-w-xs"
            value={form.speakerCount}
            onChange={(e) => onChange((prev) => ({ ...prev, speakerCount: e.target.value }))}
          />
        </CardContent>
      </Card>

      {showAddOrg ? (
        <AddOrganisationForm
          onCancel={() => setShowAddOrg(false)}
          onCreate={(org) => {
            addOrganisation(org)
            setShowAddOrg(false)
          }}
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Add Organisation</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddOrg(true)}>
              <Plus className="size-4" />
              Add Organisation
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Can't find an organisation above? Add it here — it becomes selectable for this event
              immediately.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { EventConnectionsStep }
