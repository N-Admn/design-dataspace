import * as React from 'react'
import { ChevronLeft, ChevronRight, Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS, type DatasetRecord, type DatasetStatus } from '@/types/dataset'

interface DatasetListViewProps {
  datasets: DatasetRecord[]
  onAddDataset: () => void
  onViewDataset: (id: string) => void
  onEditDataset: (id: string) => void
  onDeleteDataset: (id: string) => void
}

const PAGE_SIZE = 12

type StatusFilter = 'all' | DatasetStatus

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function DatasetListView({
  datasets,
  onAddDataset,
  onViewDataset,
  onEditDataset,
  onDeleteDataset,
}: DatasetListViewProps) {
  const [filter, setFilter] = React.useState<StatusFilter>('all')
  const [page, setPage] = React.useState(1)

  const publishedCount = datasets.filter((d) => d.status === 'published').length
  const draftCount = datasets.filter((d) => d.status === 'draft').length

  const TABS: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: datasets.length },
    { key: 'published', label: 'Published', count: publishedCount },
    { key: 'draft', label: 'Draft', count: draftCount },
  ]

  const filteredDatasets =
    filter === 'all' ? datasets : datasets.filter((d) => d.status === filter)

  const totalPages = Math.max(1, Math.ceil(filteredDatasets.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageDatasets = filteredDatasets.slice(pageStart, pageStart + PAGE_SIZE)

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleFilterChange = (next: StatusFilter) => {
    setFilter(next)
    setPage(1)
  }

  return (
    <Card className={cn('flex flex-col', WORKSPACE_HEIGHT_CLASS)}>
      <CardHeader className="flex-row shrink-0 items-center justify-between">
        <div>
          <CardTitle>My Datasets</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            {datasets.length} dataset{datasets.length === 1 ? '' : 's'} · manage published
            datasets and continue drafts
          </p>
        </div>
        <Button type="button" onClick={onAddDataset}>
          <Plus className="size-4" />
          Add Dataset
        </Button>
      </CardHeader>
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-5" role="tablist">
        {TABS.map((tab) => {
          const isActive = tab.key === filter
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleFilterChange(tab.key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-medium',
                  isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {filteredDatasets.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {datasets.length === 0
              ? 'No datasets yet. Click "Add Dataset" to create your first one.'
              : `No ${filter} datasets.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Dataset Name</th>
                  <th className="px-5 py-3 font-medium">Sector</th>
                  <th className="px-5 py-3 font-medium">Geography</th>
                  <th className="px-5 py-3 font-medium">Files</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last Updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageDatasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {dataset.form.metadata.name || 'Untitled dataset'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {dataset.form.metadata.sector
                        ? optionLabel(SECTOR_OPTIONS, dataset.form.metadata.sector)
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {dataset.form.metadata.geography
                        ? optionLabel(GEOGRAPHY_OPTIONS, dataset.form.metadata.geography)
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{dataset.form.files.length}</td>
                    <td className="px-5 py-4">
                      {dataset.status === 'published' ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge className="border-transparent bg-warning/20 text-warning-foreground">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{dataset.updatedAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${dataset.form.metadata.name || 'dataset'}`}
                          onClick={() => onViewDataset(dataset.id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${dataset.form.metadata.name || 'dataset'}`}
                          onClick={() => onEditDataset(dataset.id)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${dataset.form.metadata.name || 'dataset'}`}
                          onClick={() => onDeleteDataset(dataset.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {filteredDatasets.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredDatasets.length)} of{' '}
            {filteredDatasets.length}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <p className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export { DatasetListView }
