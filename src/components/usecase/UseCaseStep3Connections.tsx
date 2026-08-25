import * as React from 'react'
import { Building2, Plus, User, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import { AddContributorForm } from '@/components/usecase/AddContributorForm'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { OrganisationSearchField } from '@/components/shared/OrganisationSearchField'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import type { UseCaseConnections } from '@/types/usecase'
import type { Organisation } from '@/types/event'

interface UseCaseStep3ConnectionsProps {
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
        <X className="size-4" />
      </Button>
    </div>
  )
}

function UseCaseStep3Connections({ connections, onChange }: UseCaseStep3ConnectionsProps) {
  const { organisations, addOrganisation } = useAppData()
  const toast = useToast()
  const [showContributorForm, setShowContributorForm] = React.useState(false)
  const [showAddOrgForm, setShowAddOrgForm] = React.useState(false)

  const organizationIds = connections.organizations.map((o) => o.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Connect</h2>
        <p className="mt-1 text-sm text-muted-foreground">Datasets & people supporting this Use Case.</p>
      </div>

      <DatasetConnectionsCard
        datasets={connections.datasets}
        parentLabel="this Use Case"
        onChange={(datasets) => onChange({ ...connections, datasets })}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Contributors</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add people who contributed to this Use Case.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowContributorForm(true)}>
            <Plus className="size-4" />
            Add Contributor
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {connections.contributors.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No contributors added yet.</p>
          ) : (
            connections.contributors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
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
                  <X className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Organizations</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add organizations connected to this Use Case.
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

export { UseCaseStep3Connections }
