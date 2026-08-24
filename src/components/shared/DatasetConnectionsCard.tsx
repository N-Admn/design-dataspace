import * as React from 'react'
import { CheckCircle2, Database, Plus, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConnectDatasetDrawer } from '@/components/shared/ConnectDatasetDrawer'
import { DatasetCreationWizard } from '@/components/event/DatasetCreationWizard'
import { useAppData } from '@/context/AppDataContext'
import { formatShortDate } from '@/lib/format'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'

interface ConnectedDataset {
  id: string
  title: string
}

interface DatasetConnectionsCardProps {
  datasets: ConnectedDataset[]
  onChange: (datasets: ConnectedDataset[]) => void
  /** What datasets are being connected to, e.g. "this event" / "this Use Case". Used in drawer copy and toasts. */
  parentLabel: string
  description?: string
  emptyHint?: string
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function DatasetConnectionsCard({
  datasets,
  onChange,
  parentLabel,
  description = `Connect datasets related to ${parentLabel}.`,
  emptyHint = `Connect an existing published dataset to ${parentLabel}.`,
}: DatasetConnectionsCardProps) {
  const { datasets: allDatasets } = useAppData()
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [replacingId, setReplacingId] = React.useState<string | null>(null)
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  const connectedIds = datasets.map((d) => d.id)

  const addItem = (item: ConnectedDataset) => onChange([...datasets, item])
  const removeItem = (id: string) => onChange(datasets.filter((d) => d.id !== id))

  const handleConnect = (dataset: ConnectedDataset) => {
    if (replacingId) {
      removeItem(replacingId)
      setReplacingId(null)
    }
    addItem(dataset)
    setJustAddedMessage(`"${dataset.title}" connected to ${parentLabel}.`)
  }

  const handleDatasetCreated = (datasetId: string, name: string) => {
    if (replacingId) {
      removeItem(replacingId)
      setReplacingId(null)
    }
    addItem({ id: datasetId, title: name || 'Untitled dataset' })
    setCreateOpen(false)
    setJustAddedMessage(`"${name}" created and connected to ${parentLabel}.`)
  }

  const openReplace = (id: string) => {
    setReplacingId(id)
    setConnectOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Datasets</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReplacingId(null)
              setConnectOpen(true)
            }}
          >
            <Plus className="size-4" />
            Connect Dataset
          </Button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
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

        {datasets.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm font-medium text-foreground">No datasets connected yet.</p>
            <p className="text-xs text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {datasets.map((item) => {
              const liveDataset = allDatasets.find((d) => d.id === item.id)
              // Missing means the dataset record itself is gone (e.g. deleted) — that's the only case
              // that should read as "unavailable". A dataset that exists but hasn't been published yet
              // (Draft/Pending) is still a valid connection, just not publicly visible yet.
              const isMissing = !liveDataset
              const isNotYetPublic = liveDataset && liveDataset.status !== 'published'
              const isPreviewing = previewId === item.id

              return (
                <div key={item.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Database className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      {isMissing ? (
                        <p className="mt-0.5 text-xs font-medium text-destructive">
                          Dataset unavailable — this dataset is no longer published.
                        </p>
                      ) : (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <StatusBadge status={liveDataset.status} />
                          {isNotYetPublic && (
                            <span className="text-xs text-muted-foreground">Not yet publicly available.</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {liveDataset.form.metadata.sector
                              ? optionLabel(SECTOR_OPTIONS, liveDataset.form.metadata.sector)
                              : '—'}
                            {' · '}
                            {liveDataset.form.metadata.geography
                              ? optionLabel(GEOGRAPHY_OPTIONS, liveDataset.form.metadata.geography)
                              : '—'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isMissing ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => openReplace(item.id)}>
                          Replace
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewId((prev) => (prev === item.id ? null : item.id))}
                        >
                          {isPreviewing ? 'Hide' : 'View Dataset'}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {isPreviewing && liveDataset && (
                    <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                      <p>{liveDataset.form.metadata.description || 'No description provided.'}</p>
                      <p className="mt-1.5">
                        {liveDataset.form.files.length + (liveDataset.form.resources?.length ?? 0)} file(s) ·
                        Updated {formatShortDate(liveDataset.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <ConnectDatasetDrawer
        open={connectOpen}
        onOpenChange={(next) => {
          setConnectOpen(next)
          if (!next) setReplacingId(null)
        }}
        connectedIds={connectedIds}
        parentLabel={parentLabel}
        onConnect={handleConnect}
      />

      <DatasetCreationWizard open={createOpen} onOpenChange={setCreateOpen} onCreated={handleDatasetCreated} />
    </Card>
  )
}

export { DatasetConnectionsCard }
