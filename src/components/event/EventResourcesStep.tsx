import * as React from 'react'
import { Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import {
  MOCK_AI_MODELS,
  MOCK_COLLABORATIVES,
  MOCK_PUBLICATIONS,
  MOCK_USE_CASES,
} from '@/lib/mock-related-content'
import {
  ResourceSearchField,
  RESOURCE_KIND_ICON,
  RESOURCE_KIND_LABEL,
  type ResourceCandidate,
  type ResourceKind,
} from '@/components/event/ResourceSearchField'
import { AddResourceDrawer, type AddResourceChoice } from '@/components/event/AddResourceDrawer'
import { DatasetCreationWizard } from '@/components/event/DatasetCreationWizard'
import { PublicationForm } from '@/components/event/PublicationForm'
import type { EventFormState, EventPublication, RelatedContentItem, RelatedContentType } from '@/types/event'

interface EventResourcesStepProps {
  form: EventFormState
  onChange: React.Dispatch<React.SetStateAction<EventFormState>>
}

/** Non-publication kinds map 1:1 onto a `relatedContent` bucket. */
const RELATED_BUCKET: Record<Exclude<ResourceKind, 'publication'>, keyof EventFormState['relatedContent']> = {
  dataset: 'datasets',
  'use-case': 'useCases',
  collaborative: 'collaboratives',
  'ai-model': 'aiModels',
}

const RELATED_TYPE: Record<Exclude<ResourceKind, 'publication'>, RelatedContentType> = {
  dataset: 'dataset',
  'use-case': 'use-case',
  collaborative: 'collaborative',
  'ai-model': 'ai-model',
}

interface DisplayGroup {
  kind: ResourceKind
  icon: LucideIcon
  label: string
  rows: { id: string; title: string; organisation?: string; source?: 'created' | 'reference' }[]
  onRemove: (id: string) => void
  /** Present only for kinds that can be built via "+ Add Resource" (dataset,
   * publication). Called for rows whose `source` is `'created'`. */
  onEdit?: (id: string) => void
}

function EventResourcesStep({ form, onChange }: EventResourcesStepProps) {
  const { datasets: allDatasets } = useAppData()
  const toast = useToast()

  const [addDrawerOpen, setAddDrawerOpen] = React.useState(false)
  const [datasetWizardOpen, setDatasetWizardOpen] = React.useState(false)
  const [publicationFormOpen, setPublicationFormOpen] = React.useState(false)
  // Set while the corresponding drawer is editing an already-connected,
  // event-created resource rather than adding a new one.
  const [editingDatasetId, setEditingDatasetId] = React.useState<string | null>(null)
  const [editingPublicationId, setEditingPublicationId] = React.useState<string | null>(null)

  const { relatedContent, publications } = form

  const selectedIds = React.useMemo(
    () =>
      new Set<string>([
        ...relatedContent.datasets.map((i) => i.id),
        ...relatedContent.useCases.map((i) => i.id),
        ...relatedContent.collaboratives.map((i) => i.id),
        ...relatedContent.aiModels.map((i) => i.id),
        ...publications.map((p) => p.id),
      ]),
    [relatedContent, publications],
  )

  // Every connectable CivicDataSpace resource, across all five types.
  const candidates: ResourceCandidate[] = React.useMemo(() => {
    const datasetCandidates: ResourceCandidate[] = allDatasets
      .filter((d) => d.status === 'published')
      .map((d) => ({ id: d.id, title: d.form.metadata.name || 'Untitled dataset', kind: 'dataset' as const }))

    const useCaseCandidates: ResourceCandidate[] = MOCK_USE_CASES.map((i) => ({
      id: i.id,
      title: i.title,
      kind: 'use-case' as const,
      organisation: i.organisation,
    }))

    const collaborativeCandidates: ResourceCandidate[] = MOCK_COLLABORATIVES.map((i) => ({
      id: i.id,
      title: i.title,
      kind: 'collaborative' as const,
      organisation: i.organisation,
    }))

    const aiModelCandidates: ResourceCandidate[] = MOCK_AI_MODELS.map((i) => ({
      id: i.id,
      title: i.title,
      kind: 'ai-model' as const,
      organisation: i.organisation,
    }))

    const publicationCandidates: ResourceCandidate[] = MOCK_PUBLICATIONS.map((i) => ({
      id: i.id,
      title: i.title,
      kind: 'publication' as const,
      organisation: i.organisation,
      publicationType: i.publicationType,
    }))

    return [
      ...datasetCandidates,
      ...useCaseCandidates,
      ...collaborativeCandidates,
      ...aiModelCandidates,
      ...publicationCandidates,
    ].filter((c) => !selectedIds.has(c.id))
  }, [allDatasets, selectedIds])

  const addRelated = (kind: Exclude<ResourceKind, 'publication'>, item: RelatedContentItem) => {
    const bucket = RELATED_BUCKET[kind]
    onChange((prev) => ({
      ...prev,
      relatedContent: { ...prev.relatedContent, [bucket]: [...prev.relatedContent[bucket], item] },
    }))
  }

  const removeRelated = (kind: Exclude<ResourceKind, 'publication'>, id: string) => {
    const bucket = RELATED_BUCKET[kind]
    onChange((prev) => ({
      ...prev,
      relatedContent: {
        ...prev.relatedContent,
        [bucket]: prev.relatedContent[bucket].filter((i) => i.id !== id),
      },
    }))
  }

  const addPublication = (publication: EventPublication) => {
    onChange((prev) => ({ ...prev, publications: [...prev.publications, publication] }))
  }

  const removePublication = (id: string) => {
    onChange((prev) => ({ ...prev, publications: prev.publications.filter((p) => p.id !== id) }))
  }

  // Selecting a search result connects it immediately, into the right type section.
  const handleSelect = (candidate: ResourceCandidate) => {
    if (candidate.kind === 'publication') {
      addPublication({
        id: candidate.id,
        title: candidate.title,
        description: '',
        publicationType: candidate.publicationType ?? 'other',
        organisation: candidate.organisation,
        source: 'reference',
      })
    } else {
      addRelated(candidate.kind, {
        id: candidate.id,
        title: candidate.title,
        type: RELATED_TYPE[candidate.kind],
        organisation: candidate.organisation,
        source: 'reference',
      })
    }
    toast({
      title: 'Resource connected',
      description: `"${candidate.title}" connected to this event.`,
      variant: 'success',
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

  const editingDataset = React.useMemo(
    () => allDatasets.find((d) => d.id === editingDatasetId) ?? undefined,
    [allDatasets, editingDatasetId],
  )
  const editingPublication = React.useMemo(
    () => publications.find((p) => p.id === editingPublicationId) ?? undefined,
    [publications, editingPublicationId],
  )

  const openEditDataset = (id: string) => {
    setEditingDatasetId(id)
    setDatasetWizardOpen(true)
  }

  const openEditPublication = (id: string) => {
    setEditingPublicationId(id)
    setPublicationFormOpen(true)
  }

  // Fired by the wizard both on create and on edit (same `onCreated` callback).
  const handleDatasetCreated = (datasetId: string, name: string) => {
    const title = name || 'Untitled dataset'
    if (editingDatasetId) {
      onChange((prev) => ({
        ...prev,
        relatedContent: {
          ...prev.relatedContent,
          datasets: prev.relatedContent.datasets.map((d) => (d.id === datasetId ? { ...d, title } : d)),
        },
      }))
      setDatasetWizardOpen(false)
      setEditingDatasetId(null)
      toast({ title: 'Dataset updated', description: `"${title}" updated.`, variant: 'success' })
      return
    }
    addRelated('dataset', { id: datasetId, title, type: 'dataset', source: 'created' })
    setDatasetWizardOpen(false)
    toast({
      title: 'Dataset created',
      description: `"${name}" created and connected to this event.`,
      variant: 'success',
    })
  }

  const handlePublicationCreated = (publication: EventPublication) => {
    if (editingPublicationId) {
      onChange((prev) => ({
        ...prev,
        publications: prev.publications.map((p) =>
          p.id === publication.id ? { ...publication, source: 'created' } : p,
        ),
      }))
      setPublicationFormOpen(false)
      setEditingPublicationId(null)
      toast({ title: 'Publication updated', description: `"${publication.title}" updated.`, variant: 'success' })
      return
    }
    addPublication({ ...publication, source: 'created' })
    setPublicationFormOpen(false)
    toast({
      title: 'Publication added',
      description: `"${publication.title}" added and connected.`,
      variant: 'success',
    })
  }

  const groups: DisplayGroup[] = [
    {
      kind: 'dataset',
      icon: RESOURCE_KIND_ICON.dataset,
      label: 'Datasets',
      rows: relatedContent.datasets,
      onRemove: (id) => removeRelated('dataset', id),
      onEdit: openEditDataset,
    },
    {
      kind: 'use-case',
      icon: RESOURCE_KIND_ICON['use-case'],
      label: 'Use Cases',
      rows: relatedContent.useCases,
      onRemove: (id) => removeRelated('use-case', id),
    },
    {
      kind: 'collaborative',
      icon: RESOURCE_KIND_ICON.collaborative,
      label: 'Collaboratives',
      rows: relatedContent.collaboratives,
      onRemove: (id) => removeRelated('collaborative', id),
    },
    {
      kind: 'ai-model',
      icon: RESOURCE_KIND_ICON['ai-model'],
      label: 'AI Models',
      rows: relatedContent.aiModels,
      onRemove: (id) => removeRelated('ai-model', id),
    },
    {
      kind: 'publication',
      icon: RESOURCE_KIND_ICON.publication,
      label: 'Publications',
      rows: publications.map((p) => ({
        id: p.id,
        title: p.title,
        organisation: p.organisation,
        source: p.source,
      })),
      onRemove: removePublication,
      onEdit: openEditPublication,
    },
  ]

  const nonEmptyGroups = groups.filter((g) => g.rows.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Resources</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">Add related content and resources.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setAddDrawerOpen(true)}>
            <Plus className="size-4" />
            Add Resource
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ResourceSearchField candidates={candidates} onSelect={handleSelect} />

          {nonEmptyGroups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No resources connected yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search above to connect related CivicDataSpace resources.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {nonEmptyGroups.map((group) => {
                const Icon = group.icon
                return (
                  <div key={group.kind} className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">{group.label}</p>
                    {group.rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[RESOURCE_KIND_LABEL[group.kind], row.organisation].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {row.source === 'created' && group.onEdit && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit ${row.title}`}
                              onClick={() => group.onEdit!(row.id)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${row.title}`}
                            onClick={() => group.onRemove(row.id)}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddResourceDrawer open={addDrawerOpen} onOpenChange={setAddDrawerOpen} onChoose={handleChoose} />

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
    </div>
  )
}

export { EventResourcesStep }
