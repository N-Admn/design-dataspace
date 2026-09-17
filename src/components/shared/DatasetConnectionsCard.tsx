import * as React from 'react'
import { CheckCircle2, Database, Plus, Search, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
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
  /** What datasets are being connected to, e.g. "this event" / "this Use Case". Used in inline copy and toasts. */
  parentLabel: string
  description?: string
  emptyHint?: string
  /** 'panel' (default) — the existing inline expanding search-and-filter panel,
   * unchanged, used by Event and Collaborative. 'dropdown' — the standardized
   * searchable dropdown used for Organisation/Contributor search: a full-width
   * search field that opens a popover of results; selecting one connects it
   * immediately and removes it from the candidate pool. Use Case → Connect is
   * the only current 'dropdown' consumer. */
  searchVariant?: 'panel' | 'dropdown'
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
  searchVariant = 'panel',
}: DatasetConnectionsCardProps) {
  const { datasets: allDatasets } = useAppData()
  const [showSearch, setShowSearch] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [sector, setSector] = React.useState('')
  const [geography, setGeography] = React.useState('')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [replacingId, setReplacingId] = React.useState<string | null>(null)
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  const isDropdown = searchVariant === 'dropdown'
  const connectedIds = datasets.map((d) => d.id)

  const addItem = (item: ConnectedDataset) => onChange([...datasets, item])
  const removeItem = (id: string) => onChange(datasets.filter((d) => d.id !== id))

  const resetSearch = () => {
    setQuery('')
    setSector('')
    setGeography('')
  }

  const openSearch = () => {
    setReplacingId(null)
    resetSearch()
    setShowSearch(true)
  }

  const openReplace = (id: string) => {
    setReplacingId(id)
    resetSearch()
    setShowSearch(true)
  }

  // Connection logic — shared by both search presentations and by "Replace" on
  // an unavailable dataset. Unchanged.
  const handleConnect = (dataset: ConnectedDataset) => {
    if (replacingId) {
      removeItem(replacingId)
      setReplacingId(null)
    }
    addItem(dataset)
    setJustAddedMessage(`"${dataset.title}" connected to ${parentLabel}.`)
    setShowSearch(false)
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

  const q = query.trim().toLowerCase()
  const hasActiveFilters = q !== '' || sector !== '' || geography !== ''

  // Only published datasets are eligible to connect — drafts aren't public yet.
  const results = allDatasets.filter((d) => {
    if (d.status !== 'published') return false
    if (sector && d.form.metadata.sector !== sector) return false
    if (geography && d.form.metadata.geography !== geography) return false
    if (q && !(d.form.metadata.name || '').toLowerCase().includes(q)) return false
    return true
  })

  // The dropdown presentation has no filters and, like the standardized
  // Organisation/Contributor dropdowns, drops an item from the candidate pool
  // once it's connected rather than showing it dimmed with a badge.
  const dropdownResults = results.filter((d) => !connectedIds.includes(d.id))

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Datasets</CardTitle>
          <p className="mt-1 text-sm font-normal text-text-subdued">{description}</p>
        </div>
        {isDropdown ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create New Dataset
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => (showSearch && !replacingId ? setShowSearch(false) : openSearch())}
            >
              <Plus className="size-4" />
              Connect Dataset
            </Button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="text-xs font-medium text-text-brand underline-offset-4 hover:underline focus-visible:underline"
            >
              + Create New Dataset
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {justAddedMessage && (
          <div className="flex items-center gap-2 rounded-md border border-surface-success/30 bg-surface-success/5 px-3 py-2.5 text-sm font-medium text-text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            {justAddedMessage}
          </div>
        )}

        {isDropdown ? (
          <>
            <Label className="sr-only">Search Datasets</Label>
            <Popover open={showSearch} onOpenChange={(next) => (next ? openSearch() : setShowSearch(false))}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-2 rounded-md border border-border-input bg-surface-default px-3 text-sm text-text-subdued transition-colors hover:border-border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <Search className="size-4 shrink-0" />
                  Search published datasets...
                </button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-3 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
                {replacingId && (
                  <p className="text-xs font-medium text-text-subdued">
                    Choose a replacement dataset for the unavailable one.
                  </p>
                )}
                <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search by name or keyword" />
                <SearchResultList
                  isEmpty={dropdownResults.length === 0}
                  emptyLabel="No datasets found."
                  className="max-h-72 overflow-y-auto"
                >
                  {dropdownResults.map((dataset) => {
                    const name = dataset.form.metadata.name || 'Untitled dataset'
                    return (
                      <SearchResultRow
                        key={dataset.id}
                        icon={Database}
                        primary={name}
                        secondary={[
                          dataset.form.metadata.sector ? optionLabel(SECTOR_OPTIONS, dataset.form.metadata.sector) : '—',
                          dataset.form.metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, dataset.form.metadata.geography) : '—',
                        ].join(' · ')}
                        onSelect={() => handleConnect({ id: dataset.id, title: name })}
                      />
                    )
                  })}
                </SearchResultList>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          showSearch && (
            <div className="flex flex-col gap-3 rounded-lg border border-border-default bg-surface-subdued/30 p-3">
              {replacingId && (
                <p className="text-xs font-medium text-text-subdued">
                  Choose a replacement dataset for the unavailable one.
                </p>
              )}
              <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search by name or keyword" />
              <div className="grid grid-cols-2 gap-2">
                <SearchableSelect options={SECTOR_OPTIONS} value={sector} onChange={setSector} placeholder="Sector" />
                <SearchableSelect
                  options={GEOGRAPHY_OPTIONS}
                  value={geography}
                  onChange={setGeography}
                  placeholder="Geography"
                />
              </div>

              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-sm font-medium text-text-default">No datasets found.</p>
                  {hasActiveFilters && (
                    <Button type="button" variant="outline" size="sm" onClick={resetSearch}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                  {results.map((dataset) => {
                    const isConnected = connectedIds.includes(dataset.id)
                    const name = dataset.form.metadata.name || 'Untitled dataset'

                    return (
                      <div
                        key={dataset.id}
                        className={
                          'flex items-center gap-3 rounded-lg border border-border-default bg-surface-default p-3' +
                          (isConnected ? ' opacity-60' : '')
                        }
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-subdued text-text-subdued">
                          <Database className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-default">{name}</p>
                          <p className="mt-0.5 text-xs text-text-subdued">
                            {dataset.form.metadata.sector ? optionLabel(SECTOR_OPTIONS, dataset.form.metadata.sector) : '—'}
                            {' · '}
                            {dataset.form.metadata.geography
                              ? optionLabel(GEOGRAPHY_OPTIONS, dataset.form.metadata.geography)
                              : '—'}
                          </p>
                        </div>
                        {isConnected ? (
                          <span className="shrink-0 rounded-full bg-surface-subdued px-2.5 py-0.5 text-xs font-medium text-text-subdued">
                            Connected
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleConnect({ id: dataset.id, title: name })}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setShowSearch(false)}>
                Cancel
              </Button>
            </div>
          )
        )}

        {datasets.length === 0 ? (
          <EmptyState title="No datasets connected yet." description={emptyHint} />
        ) : (
          <div className="flex flex-col gap-2">
            {datasets.map((item) => {
              const liveDataset = allDatasets.find((d) => d.id === item.id)
              // Missing means the dataset record itself is gone (e.g. deleted) — that's the only case
              // that should read as "unavailable". A dataset that exists but hasn't been published yet
              // (Draft) is still a valid connection, just not publicly visible yet.
              const isMissing = !liveDataset
              const isNotYetPublic = liveDataset && liveDataset.status !== 'published'
              const isPreviewing = previewId === item.id

              return (
                <div key={item.id} className="rounded-lg border border-border-default p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-subdued text-text-subdued">
                      <Database className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-default">{item.title}</p>
                      {isMissing ? (
                        <p className="mt-0.5 text-xs font-medium text-text-critical-strong">
                          Dataset unavailable — this dataset is no longer published.
                        </p>
                      ) : (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <StatusBadge status={liveDataset.status} />
                          {isNotYetPublic && (
                            <span className="text-xs text-text-subdued">Not yet publicly available.</span>
                          )}
                          <span className="text-xs text-text-subdued">
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
                        size="icon"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => removeItem(item.id)}
                        className="text-text-subdued hover:bg-action-critical-default/10 hover:text-text-critical-strong"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {isPreviewing && liveDataset && (
                    <div className="mt-2 rounded-md bg-surface-subdued/50 p-3 text-xs text-text-subdued">
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

      <DatasetCreationWizard open={createOpen} onOpenChange={setCreateOpen} onCreated={handleDatasetCreated} />
    </Card>
  )
}

export { DatasetConnectionsCard }
