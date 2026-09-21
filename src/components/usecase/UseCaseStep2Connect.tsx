import * as React from 'react'
import { Building2, Plus, Trash2, User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import { AddContributorForm } from '@/components/usecase/AddContributorForm'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { OrganisationSearchField } from '@/components/shared/OrganisationSearchField'
import { SpeakerSearchField } from '@/components/event/SpeakerSearchField'
import { UseCaseClassificationSection } from '@/components/usecase/UseCaseClassificationSection'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { MOCK_PEOPLE, type MockPerson } from '@/lib/mock-people'
import type { UseCaseConnections, UseCaseMetadata } from '@/types/usecase'
import type { Organisation } from '@/types/event'

interface UseCaseStep2ConnectProps {
  metadata: UseCaseMetadata
  onMetadataChange: <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => void
  connections: UseCaseConnections
  onChange: (connections: UseCaseConnections) => void
}

function OrganisationRow({ org, onRemove }: { org: Organisation; onRemove: () => void }) {
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
        <p className="text-xs text-muted-foreground">{org.isRegistered ? 'Registered organisation' : 'New organisation'}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${org.name}`}
        onClick={onRemove}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

function UseCaseStep2Connect({ metadata, onMetadataChange, connections, onChange }: UseCaseStep2ConnectProps) {
  const { organisations, addOrganisation } = useAppData()
  const toast = useToast()
  const [showContributorForm, setShowContributorForm] = React.useState(false)
  const [showAddOrgForm, setShowAddOrgForm] = React.useState(false)

  const organizationIds = connections.organizations.map((o) => o.id)

  /** Add a CivicDataSpace contributor straight to the Contributors list. Mirrors
   * how Event's Speaker search connects a directory profile. */
  const addContributorFromDirectory = (person: MockPerson) => {
    onChange({
      ...connections,
      contributors: [
        ...connections.contributors,
        { id: `contributor-${person.id}`, name: person.name, role: person.role ?? '', organisation: person.organisation },
      ],
    })
    toast({ title: 'Contributor added', description: `"${person.name}" added and connected.`, variant: 'success' })
  }

  return (
    <div className="flex flex-col gap-6">
      <UseCaseClassificationSection metadata={metadata} onChange={onMetadataChange} />

      <DatasetConnectionsCard
        datasets={connections.datasets}
        parentLabel="this Use Case"
        onChange={(datasets) => onChange({ ...connections, datasets })}
        searchVariant="dropdown"
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Contributors</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add the people and organisations involved in creating this content.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowContributorForm(true)}>
            <Plus className="size-4" />
            Add Contributor
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label className="sr-only">Search Contributors</Label>
          <SpeakerSearchField
            people={MOCK_PEOPLE}
            excludeNames={connections.contributors.map((c) => c.name)}
            placeholder="Search contributors..."
            onSelect={addContributorFromDirectory}
          />
          {connections.contributors.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No contributors added yet.</p>
          ) : (
            connections.contributors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {c.image?.dataUrl ? (
                  <img src={c.image.dataUrl} alt="" className="size-9 shrink-0 rounded-full border border-border object-cover" />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  {[c.role, c.organisation].filter(Boolean).length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {[c.role, c.organisation].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.name}`}
                  onClick={() =>
                    onChange({ ...connections, contributors: connections.contributors.filter((x) => x.id !== c.id) })
                  }
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Organisations</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Connect the organisations involved in this content.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddOrgForm(true)}>
            <Plus className="size-4" />
            Add Organization
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label className="sr-only">Search organisations</Label>
          <OrganisationSearchField
            organisations={organisations}
            excludeIds={organizationIds}
            placeholder="Search organisations..."
            onSelect={(org) => onChange({ ...connections, organizations: [...connections.organizations, org] })}
          />
          {connections.organizations.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No organizations added yet.</p>
          ) : (
            connections.organizations.map((org) => (
              <OrganisationRow
                key={org.id}
                org={org}
                onRemove={() =>
                  onChange({ ...connections, organizations: connections.organizations.filter((o) => o.id !== org.id) })
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <AddContributorForm
        open={showContributorForm}
        onOpenChange={setShowContributorForm}
        onAdd={(contributor) => {
          onChange({
            ...connections,
            contributors: [
              ...connections.contributors,
              { id: `contributor-${Date.now()}`, ...contributor },
            ],
          })
          setShowContributorForm(false)
          toast({ title: 'Contributor added', description: `"${contributor.name}" added and connected.`, variant: 'success' })
        }}
      />

      <AddOrganisationForm
        open={showAddOrgForm}
        onOpenChange={setShowAddOrgForm}
        onCreate={(org) => {
          const newOrg = addOrganisation(org)
          onChange({ ...connections, organizations: [...connections.organizations, newOrg] })
          setShowAddOrgForm(false)
          toast({ title: 'Organisation created', description: `"${newOrg.name}" created and connected.`, variant: 'success' })
        }}
      />
    </div>
  )
}

export { UseCaseStep2Connect }
