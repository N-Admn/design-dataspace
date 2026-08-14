import * as React from 'react'
import { BarChart3, Building2, CheckCircle2, Database, LayoutDashboard, Plus, Trash2, User, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConnectDatasetDrawer } from '@/components/shared/ConnectDatasetDrawer'
import { DatasetCreationWizard } from '@/components/event/DatasetCreationWizard'
import { ChartSelectDrawer } from '@/components/usecase/ChartSelectDrawer'
import { AddContributorForm } from '@/components/usecase/AddContributorForm'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { OrganisationSearchField } from '@/components/shared/OrganisationSearchField'
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
  const { datasets, organisations, addOrganisation } = useAppData()
  const [showDatasetDrawer, setShowDatasetDrawer] = React.useState(false)
  const [showCreateDatasetDrawer, setShowCreateDatasetDrawer] = React.useState(false)
  const [showChartDrawer, setShowChartDrawer] = React.useState(false)
  const [showContributorForm, setShowContributorForm] = React.useState(false)
  const [addOrgFor, setAddOrgFor] = React.useState<'supportedBy' | 'partneredBy' | null>(null)
  const [dashboardTitle, setDashboardTitle] = React.useState('')
  const [dashboardUrl, setDashboardUrl] = React.useState('')
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)
  const dashboardIdCounter = React.useRef(0)

  const connectedDatasetIds = connections.datasets.map((d) => d.id)
  const connectedChartIds = connections.charts.map((c) => c.chartId)
  const supportedByIds = connections.supportedBy.map((o) => o.id)
  const partneredByIds = connections.partneredBy.map((o) => o.id)

  const addDashboard = () => {
    if (!dashboardTitle.trim() || !dashboardUrl.trim()) return
    dashboardIdCounter.current += 1
    onChange({
      ...connections,
      dashboards: [
        ...connections.dashboards,
        { id: `dashboard-${dashboardIdCounter.current}-${Date.now()}`, title: dashboardTitle.trim(), url: dashboardUrl.trim() },
      ],
    })
    setDashboardTitle('')
    setDashboardUrl('')
  }

  const handleDatasetCreated = (datasetId: string, name: string) => {
    onChange({ ...connections, datasets: [...connections.datasets, { id: datasetId, title: name || 'Untitled dataset' }] })
    setShowCreateDatasetDrawer(false)
    setJustAddedMessage(`"${name}" created and connected to this Use Case.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Connections</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connect related CivicDataSpace content, people and organizations.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Datasets</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">Connect datasets related to this Use Case.</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowDatasetDrawer(true)}>
              <Plus className="size-4" />
              Connect Dataset
            </Button>
            <button
              type="button"
              onClick={() => setShowCreateDatasetDrawer(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Create New Dataset
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {justAddedMessage && (
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
              <CheckCircle2 className="size-4 shrink-0" />
              {justAddedMessage}
            </div>
          )}
          {connections.datasets.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No datasets connected yet. Connect an existing published dataset to this Use Case.
            </p>
          ) : (
            connections.datasets.map((d) => {
              const record = datasets.find((ds) => ds.id === d.id)
              return (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Database className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                    {record && (
                      <div className="mt-0.5">
                        <StatusBadge status={record.status} />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${d.title}`}
                    onClick={() => onChange({ ...connections, datasets: connections.datasets.filter((x) => x.id !== d.id) })}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboards / Charts</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Connect CivicDataSpace charts or link to external dashboards.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Charts</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowChartDrawer(true)}>
                <Plus className="size-4" />
                Connect Chart
              </Button>
            </div>
            {connections.charts.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">No charts connected yet.</p>
            ) : (
              connections.charts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <BarChart3 className="size-5 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{c.title}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${c.title}`}
                    onClick={() => onChange({ ...connections, charts: connections.charts.filter((x) => x.id !== c.id) })}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <Label>Dashboards</Label>
            {connections.dashboards.length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">No dashboards connected yet.</p>
            )}
            {connections.dashboards.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <LayoutDashboard className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.url}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${d.title}`}
                  onClick={() => onChange({ ...connections, dashboards: connections.dashboards.filter((x) => x.id !== d.id) })}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder="Dashboard title" value={dashboardTitle} onChange={(e) => setDashboardTitle(e.target.value)} />
              <Input placeholder="https://dashboard.example.com" value={dashboardUrl} onChange={(e) => setDashboardUrl(e.target.value)} />
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addDashboard}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People & Organizations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Contributors</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowContributorForm(true)}>
                <Plus className="size-4" />
                Add Contributor
              </Button>
            </div>
            {connections.contributors.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">No contributors added yet.</p>
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
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <Label>Supported By</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddOrgFor('supportedBy')}>
                <Plus className="size-4" />
                Add Organization
              </Button>
            </div>
            <OrganisationSearchField
              organisations={organisations}
              excludeIds={supportedByIds}
              placeholder="Search organisations..."
              onSelect={(org) => onChange({ ...connections, supportedBy: [...connections.supportedBy, org] })}
            />
            {connections.supportedBy.map((org) => (
              <OrganisationRow
                key={org.id}
                org={org}
                onRemove={() =>
                  onChange({ ...connections, supportedBy: connections.supportedBy.filter((o) => o.id !== org.id) })
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <Label>Partnered By</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddOrgFor('partneredBy')}>
                <Plus className="size-4" />
                Add Organization
              </Button>
            </div>
            <OrganisationSearchField
              organisations={organisations}
              excludeIds={partneredByIds}
              placeholder="Search organisations..."
              onSelect={(org) => onChange({ ...connections, partneredBy: [...connections.partneredBy, org] })}
            />
            {connections.partneredBy.map((org) => (
              <OrganisationRow
                key={org.id}
                org={org}
                onRemove={() =>
                  onChange({ ...connections, partneredBy: connections.partneredBy.filter((o) => o.id !== org.id) })
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ConnectDatasetDrawer
        open={showDatasetDrawer}
        onOpenChange={setShowDatasetDrawer}
        connectedIds={connectedDatasetIds}
        parentLabel="this use case"
        onConnect={(dataset) =>
          onChange({ ...connections, datasets: [...connections.datasets, { id: dataset.id, title: dataset.title }] })
        }
      />

      <DatasetCreationWizard
        open={showCreateDatasetDrawer}
        onOpenChange={setShowCreateDatasetDrawer}
        onCreated={handleDatasetCreated}
      />

      <ChartSelectDrawer
        open={showChartDrawer}
        onOpenChange={setShowChartDrawer}
        onSelect={(chart) => {
          if (connectedChartIds.includes(chart.id)) {
            setShowChartDrawer(false)
            return
          }
          onChange({
            ...connections,
            charts: [...connections.charts, { id: `chart-link-${chart.id}-${Date.now()}`, chartId: chart.id, title: chart.title }],
          })
          setShowChartDrawer(false)
        }}
      />

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
        }}
      />

      <AddOrganisationForm
        open={addOrgFor !== null}
        onOpenChange={(open) => !open && setAddOrgFor(null)}
        onCreate={(org) => {
          const newOrg = addOrganisation(org)
          if (addOrgFor === 'supportedBy') {
            onChange({ ...connections, supportedBy: [...connections.supportedBy, newOrg] })
          } else if (addOrgFor === 'partneredBy') {
            onChange({ ...connections, partneredBy: [...connections.partneredBy, newOrg] })
          }
          setAddOrgFor(null)
        }}
      />
    </div>
  )
}

export { UseCaseStep3Connections }
