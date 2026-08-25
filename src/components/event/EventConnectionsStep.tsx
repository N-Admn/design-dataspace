import * as React from 'react'
import { Building2, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { OrganisationSearchField } from '@/components/shared/OrganisationSearchField'
import { useToast } from '@/components/ui/toast'
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

function EventConnectionsStep({ form, onChange }: EventConnectionsStepProps) {
  const { organisations, addOrganisation } = useAppData()
  const [addOrgTarget, setAddOrgTarget] = React.useState<'organiser' | 'partner' | null>(null)
  const toast = useToast()

  const organiserIds = form.organisers.map((o) => o.id)
  const partnerIds = form.partners.map((o) => o.id)

  const handleCreateOrg = (org: Omit<Organisation, 'id'>) => {
    const newOrg = addOrganisation(org)
    if (addOrgTarget === 'organiser') {
      onChange((prev) => ({ ...prev, organisers: [newOrg] }))
      toast({ title: 'Organisation created', description: `"${newOrg.name}" created and set as organiser.`, variant: 'success' })
    } else {
      onChange((prev) => ({ ...prev, partners: [...prev.partners, newOrg] }))
      toast({ title: 'Organisation created', description: `"${newOrg.name}" created and added as a partner.`, variant: 'success' })
    }
    setAddOrgTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Organiser</CardTitle>
          <button
            type="button"
            onClick={() => setAddOrgTarget('organiser')}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add New Organisation
          </button>
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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Partners</CardTitle>
          <button
            type="button"
            onClick={() => setAddOrgTarget('partner')}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add New Organisation
          </button>
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

      <AddOrganisationForm
        open={addOrgTarget !== null}
        onOpenChange={(open) => !open && setAddOrgTarget(null)}
        onCreate={handleCreateOrg}
      />
    </div>
  )
}

export { EventConnectionsStep }
