import * as React from 'react'
import { CheckCircle2, Database, Layers, Plus, Search, Sparkles, Users2, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatasetCreationWizard } from '@/components/event/DatasetCreationWizard'
import { useAppData } from '@/context/AppDataContext'
import { MOCK_AI_MODELS, MOCK_COLLABORATIVES, MOCK_USE_CASES } from '@/lib/mock-related-content'
import {
  RELATED_CONTENT_TYPE_LABELS,
  type EventFormState,
  type EventRelatedContent,
  type RelatedContentItem,
  type RelatedContentType,
} from '@/types/event'

interface RelatedContentPanelProps {
  form: EventFormState
  onChange: React.Dispatch<React.SetStateAction<EventFormState>>
}

const BUCKET_KEY: Record<RelatedContentType, keyof EventRelatedContent> = {
  dataset: 'datasets',
  'use-case': 'useCases',
  collaborative: 'collaboratives',
  'ai-model': 'aiModels',
}

const TYPE_ICON: Record<RelatedContentType, typeof Database> = {
  dataset: Database,
  'use-case': Layers,
  collaborative: Users2,
  'ai-model': Sparkles,
}

function RelatedContentPanel({ form, onChange }: RelatedContentPanelProps) {
  const { datasets } = useAppData()
  const [query, setQuery] = React.useState('')
  const [showDatasetWizard, setShowDatasetWizard] = React.useState(false)
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  const q = query.trim().toLowerCase()

  const isSelected = (type: RelatedContentType, id: string) =>
    form.relatedContent[BUCKET_KEY[type]].some((item) => item.id === id)

  const datasetResults: RelatedContentItem[] = q
    ? datasets
        .filter((d) => d.form.metadata.name.toLowerCase().includes(q))
        .map((d) => ({ id: d.id, title: d.form.metadata.name || 'Untitled dataset', type: 'dataset' as const }))
        .filter((item) => !isSelected('dataset', item.id))
    : []

  const useCaseResults: RelatedContentItem[] = q
    ? MOCK_USE_CASES.filter((i) => i.title.toLowerCase().includes(q))
        .map((i) => ({ ...i, type: 'use-case' as const }))
        .filter((item) => !isSelected('use-case', item.id))
    : []

  const collaborativeResults: RelatedContentItem[] = q
    ? MOCK_COLLABORATIVES.filter((i) => i.title.toLowerCase().includes(q))
        .map((i) => ({ ...i, type: 'collaborative' as const }))
        .filter((item) => !isSelected('collaborative', item.id))
    : []

  const aiModelResults: RelatedContentItem[] = q
    ? MOCK_AI_MODELS.filter((i) => i.title.toLowerCase().includes(q))
        .map((i) => ({ ...i, type: 'ai-model' as const }))
        .filter((item) => !isSelected('ai-model', item.id))
    : []

  const allResults = [...datasetResults, ...useCaseResults, ...collaborativeResults, ...aiModelResults]
  const noDatasetResults = q.length > 0 && datasetResults.length === 0

  const addItem = (item: RelatedContentItem) => {
    onChange((prev) => ({
      ...prev,
      relatedContent: {
        ...prev.relatedContent,
        [BUCKET_KEY[item.type]]: [...prev.relatedContent[BUCKET_KEY[item.type]], item],
      },
    }))
    setJustAddedMessage(null)
  }

  const removeItem = (item: RelatedContentItem) => {
    onChange((prev) => ({
      ...prev,
      relatedContent: {
        ...prev.relatedContent,
        [BUCKET_KEY[item.type]]: prev.relatedContent[BUCKET_KEY[item.type]].filter((i) => i.id !== item.id),
      },
    }))
  }

  const allConnected: RelatedContentItem[] = [
    ...form.relatedContent.datasets,
    ...form.relatedContent.useCases,
    ...form.relatedContent.collaboratives,
    ...form.relatedContent.aiModels,
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Content</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          Connect this event with existing content on CivicDataSpace.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setJustAddedMessage(null)
            }}
            placeholder="Search datasets, use cases, collaboratives, AI models..."
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {q.length > 0 && (
          <div className="rounded-lg border border-border">
            {allResults.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found.</p>
            )}
            {allResults.map((item) => {
              const Icon = TYPE_ICON[item.type]
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => {
                    addItem(item)
                    setQuery('')
                  }}
                  className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted/50"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <Badge variant="secondary">{RELATED_CONTENT_TYPE_LABELS[item.type]}</Badge>
                </button>
              )
            })}

            {noDatasetResults && (
              <div className="border-t border-border bg-muted/30 px-4 py-4">
                <p className="text-sm font-medium text-foreground">No datasets found</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Can't find the dataset you're looking for?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2.5"
                  onClick={() => setShowDatasetWizard(true)}
                >
                  <Plus className="size-4" />
                  Add New Dataset
                </Button>
              </div>
            )}
          </div>
        )}

        {justAddedMessage && (
          <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            {justAddedMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {allConnected.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No related content connected yet.
            </p>
          ) : (
            allConnected.map((item) => {
              const Icon = TYPE_ICON[item.type]
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{RELATED_CONTENT_TYPE_LABELS[item.type]}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item)}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                    Remove
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </CardContent>

      <DatasetCreationWizard
        open={showDatasetWizard}
        onOpenChange={setShowDatasetWizard}
        onCreated={(datasetId, name) => {
          addItem({ id: datasetId, title: name || 'Untitled dataset', type: 'dataset' })
          setShowDatasetWizard(false)
          setQuery('')
          setJustAddedMessage('Dataset created and added to this event.')
        }}
      />
    </Card>
  )
}

export { RelatedContentPanel }
