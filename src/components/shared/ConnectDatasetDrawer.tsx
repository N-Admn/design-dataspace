import * as React from 'react'
import { CheckCircle2, Database, Search } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useAppData } from '@/context/AppDataContext'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'

interface ConnectDatasetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ids of datasets already connected to the parent module — shown as "Connected" and non-selectable. */
  connectedIds: string[]
  /** What this drawer is connecting datasets to, e.g. "this event". Used in supporting copy. */
  parentLabel: string
  onConnect: (dataset: { id: string; title: string }) => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function ConnectDatasetDrawer({ open, onOpenChange, connectedIds, parentLabel, onConnect }: ConnectDatasetDrawerProps) {
  const { datasets } = useAppData()
  const [query, setQuery] = React.useState('')
  const [sector, setSector] = React.useState('')
  const [geography, setGeography] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [previewId, setPreviewId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSector('')
      setGeography('')
      setSelectedId(null)
      setPreviewId(null)
    }
  }, [open])

  const q = query.trim().toLowerCase()

  // Only published datasets are eligible to connect — drafts and pending content aren't public yet.
  const results = datasets.filter((d) => {
    if (d.status !== 'published') return false
    if (sector && d.form.metadata.sector !== sector) return false
    if (geography && d.form.metadata.geography !== geography) return false
    if (q && !(d.form.metadata.name || '').toLowerCase().includes(q)) return false
    return true
  })

  const clearFilters = () => {
    setQuery('')
    setSector('')
    setGeography('')
  }

  const hasActiveFilters = query.trim() !== '' || sector !== '' || geography !== ''

  const selectedDataset = datasets.find((d) => d.id === selectedId)

  const handleConnect = () => {
    if (!selectedDataset) return
    onConnect({ id: selectedDataset.id, title: selectedDataset.form.metadata.name || 'Untitled dataset' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Connect Dataset</DialogTitle>
          <DialogDescription>Select a published dataset to connect to {parentLabel}.</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-col gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or keyword"
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SearchableSelect
              options={SECTOR_OPTIONS}
              value={sector}
              onChange={setSector}
              placeholder="Sector"
            />
            <SearchableSelect
              options={GEOGRAPHY_OPTIONS}
              value={geography}
              onChange={setGeography}
              placeholder="Geography"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No datasets found.</p>
              {hasActiveFilters && (
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((dataset) => {
                const isConnected = connectedIds.includes(dataset.id)
                const isSelected = selectedId === dataset.id
                const isPreviewing = previewId === dataset.id
                const name = dataset.form.metadata.name || 'Untitled dataset'

                return (
                  <div
                    key={dataset.id}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border',
                      isConnected && 'opacity-60',
                    )}
                  >
                    <button
                      type="button"
                      disabled={isConnected}
                      onClick={() => setSelectedId((prev) => (prev === dataset.id ? null : dataset.id))}
                      className="flex w-full items-start gap-3 text-left disabled:cursor-not-allowed"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {isSelected ? (
                          <CheckCircle2 className="size-5 text-primary" />
                        ) : (
                          <Database className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dataset.form.metadata.sector ? optionLabel(SECTOR_OPTIONS, dataset.form.metadata.sector) : '—'}
                          {' · '}
                          {dataset.form.metadata.geography
                            ? optionLabel(GEOGRAPHY_OPTIONS, dataset.form.metadata.geography)
                            : '—'}
                        </p>
                      </div>
                      {isConnected && (
                        <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          Connected
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewId((prev) => (prev === dataset.id ? null : dataset.id))}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {isPreviewing ? 'Hide dataset' : 'View Dataset'}
                    </button>

                    {isPreviewing && (
                      <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                        <p>{dataset.form.metadata.description || 'No description provided.'}</p>
                        <p className="mt-1.5">
                          {dataset.form.files.length + (dataset.form.resources?.length ?? 0)} file(s) · Updated{' '}
                          {formatShortDate(dataset.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConnect} disabled={!selectedDataset}>
            Connect Dataset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ConnectDatasetDrawer }
