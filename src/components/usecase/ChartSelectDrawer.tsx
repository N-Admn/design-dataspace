import * as React from 'react'
import { BarChart3, CheckCircle2, Search } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppData } from '@/context/AppDataContext'
import { CHART_TYPE_OPTIONS } from '@/types/chart'

interface ChartSelectDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (chart: { id: string; title: string }) => void
}

function ChartSelectDrawer({ open, onOpenChange, onSelect }: ChartSelectDrawerProps) {
  const { charts, datasets } = useAppData()
  const [query, setQuery] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [previewId, setPreviewId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedId(null)
      setPreviewId(null)
    }
  }, [open])

  const publishedCharts = charts.filter((c) => c.status === 'published')

  const q = query.trim().toLowerCase()
  const results = publishedCharts.filter((c) => !q || (c.form.name || '').toLowerCase().includes(q))
  const selected = publishedCharts.find((c) => c.id === selectedId)

  const handleConnect = () => {
    if (!selected) return
    onSelect({ id: selected.id, title: selected.form.name || 'Untitled chart' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Select Chart</DialogTitle>
          <DialogDescription>Choose an existing CivicDataSpace chart to embed in this block.</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-col gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search charts by name"
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No charts found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((chart) => {
                const isSelected = selectedId === chart.id
                const isPreviewing = previewId === chart.id
                const title = chart.form.name || 'Untitled chart'
                const datasetName = chart.form.datasetId
                  ? datasets.find((d) => d.id === chart.form.datasetId)?.form.metadata.name
                  : undefined
                const typeLabel = chart.form.chartType
                  ? CHART_TYPE_OPTIONS.find((o) => o.value === chart.form.chartType)?.label
                  : undefined

                return (
                  <div
                    key={chart.id}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId((prev) => (prev === chart.id ? null : chart.id))}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : <BarChart3 className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{title}</p>
                        {datasetName && <p className="truncate text-xs text-muted-foreground">{datasetName}</p>}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewId((prev) => (prev === chart.id ? null : chart.id))}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {isPreviewing ? 'Hide preview' : 'Preview chart'}
                    </button>
                    {isPreviewing && (
                      <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                        {typeLabel ? `${typeLabel} chart` : 'Chart'}
                        {datasetName ? ` built from ${datasetName}.` : '.'}
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
          <Button type="button" onClick={handleConnect} disabled={!selected}>
            Select Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ChartSelectDrawer }
