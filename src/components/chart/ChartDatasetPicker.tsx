import * as React from 'react'
import { Database, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

interface ChartDatasetPickerProps {
  datasetId: string | null
  error?: string
  onSelect: (datasetId: string | null) => void
}

/** Dataset selection for the chart Build step: a searchable list that collapses to
 * the chosen dataset (with a Change action) once one is picked. */
function ChartDatasetPicker({ datasetId, error, onSelect }: ChartDatasetPickerProps) {
  const { datasets } = useAppData()
  const [query, setQuery] = React.useState('')

  // Only datasets the contributor is authorized to manage — published content in
  // My Workspace. Charts can't be created for arbitrary public datasets.
  const eligible = datasets.filter((d) => d.status === 'published')

  const q = query.trim().toLowerCase()
  const results = q ? eligible.filter((d) => (d.form.metadata.name || '').toLowerCase().includes(q)) : eligible

  const selected = datasetId ? eligible.find((d) => d.id === datasetId) : undefined

  return (
    <div className="flex flex-col gap-3">
      {selected ? (
        <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Database className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="type-body truncate font-semibold text-foreground">{selected.form.metadata.name || 'Untitled dataset'}</p>
            <p className="type-caption mt-1 text-muted-foreground">
              {selected.form.metadata.sector ? optionLabel(SECTOR_OPTIONS, selected.form.metadata.sector) : '—'}
              {' · '}
              {selected.form.metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, selected.form.metadata.geography) : '—'}
              {' · '}
              {selected.form.files.length} file{selected.form.files.length === 1 ? '' : 's'}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onSelect(null)}>
            Change
          </Button>
        </div>
      ) : eligible.length === 0 ? (
        <EmptyState
          title="No datasets available"
          description="You can create charts for datasets you own or have permission to manage."
        />
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              id="chart-dataset"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your datasets…"
              className="type-body h-6 w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {results.length === 0 ? (
              <p className="type-body py-6 text-center text-muted-foreground">No datasets match your search.</p>
            ) : (
              results.map((dataset) => {
                const name = dataset.form.metadata.name || 'Untitled dataset'
                return (
                  <button
                    key={dataset.id}
                    type="button"
                    onClick={() => onSelect(dataset.id)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Database className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="type-label truncate text-foreground">{name}</p>
                      <p className="type-caption mt-1 text-muted-foreground">
                        Your workspace
                        {' · '}
                        {dataset.form.metadata.sector ? optionLabel(SECTOR_OPTIONS, dataset.form.metadata.sector) : '—'}
                        {' · '}
                        {dataset.form.metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, dataset.form.metadata.geography) : '—'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
      <FieldError message={error} />
    </div>
  )
}

export { ChartDatasetPicker }
