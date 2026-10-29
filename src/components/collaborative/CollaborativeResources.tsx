import * as React from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { AddResourceDrawer, type AddResourceChoice } from '@/components/event/AddResourceDrawer'
import { DatasetCreationWizard } from '@/components/event/DatasetCreationWizard'
import { PublicationForm } from '@/components/event/PublicationForm'
import {
  ResourceSearchField,
  RESOURCE_KIND_ICON,
  RESOURCE_KIND_LABEL,
  type ResourceCandidate,
} from '@/components/event/ResourceSearchField'
import { buildSearchIndex } from '@/lib/global-search'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { PUBLICATION_TYPE_OPTIONS, type EventPublication } from '@/types/event'
import type { CollaborativeConnectedItem, CollaborativeConnections } from '@/types/collaborative'
import type { ResourceKind } from '@/components/event/ResourceSearchField'

/** The Collaborative's "Resources" section: one search and one list for the publications, events, datasets and use cases connected to it. It reads and writes `connections` (each kind keeps its own list there); the kinds are
 *  only brought together here, in how they are presented. Same as the Event flow's Resources section: the search connects existing
 *  published records, and "Add Resource" creates a new dataset or publication and connects it. */

type ConnectableKind = Extract<ResourceKind, 'publication' | 'event' | 'dataset' | 'use-case'>

/** Display and search order: publications, events, datasets, use cases. */
const KINDS: ConnectableKind[] = ['publication', 'event', 'dataset', 'use-case']

const optionLabel = (options: { value: string; label: string }[], value: string | undefined) =>
  value ? options.find((o) => o.value === value)?.label : undefined

const GROUP_LABEL: Record<ConnectableKind, string> = { publication: 'Publications', event: 'Events', dataset: 'Datasets', 'use-case': 'Use Cases' }

interface CollaborativeResourcesProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
}

function CollaborativeResources({ connections, onChange }: CollaborativeResourcesProps) {
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications } = useAppData()
  const toast = useToast()
  const [addDrawerOpen, setAddDrawerOpen] = React.useState(false)
  const [datasetWizardOpen, setDatasetWizardOpen] = React.useState(false)
  const [publicationFormOpen, setPublicationFormOpen] = React.useState(false)
  // Set while a drawer is editing something this Collaborative created, rather than adding a new one.
  const [editingDatasetId, setEditingDatasetId] = React.useState<string | null>(null)
  const [editingPublicationId, setEditingPublicationId] = React.useState<string | null>(null)

  const connectedIds = React.useMemo<Record<ConnectableKind, string[]>>(
    () => ({
      publication: (connections.publications ?? []).map((p) => p.id),
      event: (connections.events ?? []).map((e) => e.id),
      dataset: connections.datasets.map((d) => d.id),
      'use-case': connections.useCases.map((u) => u.id),
    }),
    [connections],
  )

  // Everything that can be connected, from the published records only (drafts are never offered). The search index already holds just
  // those, with the same descriptive line the Search page shows; publications include the standalone ones.
  const index = React.useMemo(
    () => buildSearchIndex({ datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications }),
    [datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications],
  )

  const allCandidates: ResourceCandidate[] = React.useMemo(() => {
    const fromIndex = (type: 'publication' | 'event'): ResourceCandidate[] =>
      index.filter((i) => i.type === type).map((i) => ({ id: i.id, kind: type, title: i.title, detail: i.meta, publicationType: i.cardMeta?.publicationType }))
    const datasetCandidates = datasets
      .filter((d) => d.status === 'published')
      .map<ResourceCandidate>((d) => ({
        id: d.id,
        kind: 'dataset',
        title: d.form.metadata.name || 'Untitled dataset',
        detail: [optionLabel(SECTOR_OPTIONS, d.form.metadata.sector), optionLabel(GEOGRAPHY_OPTIONS, d.form.metadata.geography)].filter(Boolean).join(' · ') || undefined,
      }))
    const useCaseCandidates = useCases
      .filter((u) => u.status === 'published')
      .map<ResourceCandidate>((u) => ({
        id: u.id,
        kind: 'use-case',
        title: u.form.metadata.title || 'Untitled Use Case',
        detail: u.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      }))
    return [...fromIndex('publication'), ...fromIndex('event'), ...datasetCandidates, ...useCaseCandidates]
  }, [index, datasets, useCases])

  // Anything already connected drops out, so nothing can be added twice.
  const candidates = React.useMemo(() => allCandidates.filter((c) => !connectedIds[c.kind as ConnectableKind].includes(c.id)), [allCandidates, connectedIds])
  const detailOf = (kind: ConnectableKind, row: CollaborativeConnectedItem) =>
    row.publication
      ? PUBLICATION_TYPE_OPTIONS.find((o) => o.value === row.publication?.publicationType)?.label
      : allCandidates.find((c) => c.kind === kind && c.id === row.id)?.detail

  const connect = (selected: ResourceCandidate[]) => {
    if (selected.length === 0) return
    const pick = (kind: ConnectableKind): CollaborativeConnectedItem[] =>
      selected.filter((c) => c.kind === kind && !connectedIds[kind].includes(c.id)).map((c) => ({ id: c.id, title: c.title }))
    onChange({
      ...connections,
      publications: [...(connections.publications ?? []), ...pick('publication')],
      events: [...(connections.events ?? []), ...pick('event')],
      datasets: [...connections.datasets, ...pick('dataset')],
      useCases: [...connections.useCases, ...pick('use-case')],
    })
    toast({
      title: selected.length === 1 ? 'Resource connected' : 'Resources connected',
      description: selected.length === 1 ? `"${selected[0].title}" connected to this Collaborative.` : `${selected.length} resources connected to this Collaborative.`,
      variant: 'success',
    })
  }

  const remove = (kind: ConnectableKind, id: string) => {
    const without = (items: CollaborativeConnectedItem[] | undefined) => (items ?? []).filter((x) => x.id !== id)
    onChange({
      ...connections,
      ...(kind === 'publication' && { publications: without(connections.publications) }),
      ...(kind === 'event' && { events: without(connections.events) }),
      ...(kind === 'dataset' && { datasets: without(connections.datasets) }),
      ...(kind === 'use-case' && { useCases: without(connections.useCases) }),
    })
  }

  const handleChoose = (choice: AddResourceChoice) => {
    setAddDrawerOpen(false)
    if (choice === 'dataset') {
      setEditingDatasetId(null)
      setDatasetWizardOpen(true)
    } else {
      setEditingPublicationId(null)
      setPublicationFormOpen(true)
    }
  }

  // The wizard calls this both on create and on edit.
  const handleDatasetCreated = (datasetId: string, name: string) => {
    const title = name || 'Untitled dataset'
    if (editingDatasetId) {
      onChange({ ...connections, datasets: connections.datasets.map((d) => (d.id === datasetId ? { ...d, title } : d)) })
      toast({ title: 'Dataset updated', description: `"${title}" updated.`, variant: 'success' })
    } else {
      onChange({ ...connections, datasets: [...connections.datasets, { id: datasetId, title, source: 'created' }] })
      toast({ title: 'Dataset created', description: `"${title}" created and connected to this Collaborative.`, variant: 'success' })
    }
    setDatasetWizardOpen(false)
    setEditingDatasetId(null)
  }

  const handlePublicationCreated = (publication: EventPublication) => {
    const existing = connections.publications ?? []
    if (editingPublicationId) {
      onChange({
        ...connections,
        publications: existing.map((p) =>
          p.id === publication.id ? { ...p, title: publication.title, publication: { ...publication, source: 'created' } } : p,
        ),
      })
      toast({ title: 'Publication updated', description: `"${publication.title}" updated.`, variant: 'success' })
    } else {
      onChange({
        ...connections,
        publications: [...existing, { id: publication.id, title: publication.title, source: 'created', publication: { ...publication, source: 'created' } }],
      })
      toast({ title: 'Publication added', description: `"${publication.title}" added and connected.`, variant: 'success' })
    }
    setPublicationFormOpen(false)
    setEditingPublicationId(null)
  }

  const editingDataset = React.useMemo(() => datasets.find((d) => d.id === editingDatasetId) ?? undefined, [datasets, editingDatasetId])
  const editingPublication = (connections.publications ?? []).find((p) => p.id === editingPublicationId)?.publication

  const openEdit = (kind: ConnectableKind, id: string) => {
    if (kind === 'dataset') {
      setEditingDatasetId(id)
      setDatasetWizardOpen(true)
    } else if (kind === 'publication') {
      setEditingPublicationId(id)
      setPublicationFormOpen(true)
    }
  }

  const groups: { kind: ConnectableKind; rows: CollaborativeConnectedItem[] }[] = [
    { kind: 'publication', rows: connections.publications ?? [] },
    { kind: 'event', rows: connections.events ?? [] },
    { kind: 'dataset', rows: connections.datasets },
    { kind: 'use-case', rows: connections.useCases },
  ]
  const nonEmpty = groups.filter((g) => g.rows.length > 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Resources</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Add or connect the datasets, use cases, and other resources associated with this Collaborative.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setAddDrawerOpen(true)}>
          <Plus className="size-4" />
          Add Resource
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ResourceSearchField
          candidates={candidates}
          kinds={KINDS}
          placeholder="Search resources by name..."
          onSelect={(candidate) => connect([candidate])}
        />

        {nonEmpty.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No resources connected yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Search above to connect related CivicDataSpace resources.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {nonEmpty.map((group) => {
              const Icon = RESOURCE_KIND_ICON[group.kind]
              return (
                <div key={group.kind} className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">{GROUP_LABEL[group.kind]}</p>
                  {group.rows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[RESOURCE_KIND_LABEL[group.kind], detailOf(group.kind, row)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {row.source === 'created' && (group.kind === 'dataset' || group.kind === 'publication') && (
                        <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${row.title}`} onClick={() => openEdit(group.kind, row.id)}>
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${row.title}`}
                        onClick={() => remove(group.kind, row.id)}
                        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <AddResourceDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        onChoose={handleChoose}
        description="Create a new resource and connect it to this Collaborative."
      />

      <DatasetCreationWizard
        key={editingDatasetId ?? 'new-dataset'}
        open={datasetWizardOpen}
        onOpenChange={(open) => {
          setDatasetWizardOpen(open)
          if (!open) setEditingDatasetId(null)
        }}
        onCreated={handleDatasetCreated}
        initial={editingDataset}
      />

      <PublicationForm
        key={editingPublicationId ?? 'new-publication'}
        open={publicationFormOpen}
        onOpenChange={(open) => {
          setPublicationFormOpen(open)
          if (!open) setEditingPublicationId(null)
        }}
        onAdd={handlePublicationCreated}
        initial={editingPublication}
      />
    </Card>
  )
}

export { CollaborativeResources }
