import * as React from 'react'
import { ChevronLeft, ChevronRight, Eye, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import { TABLE_ROW_HEIGHT_PX, WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import type { UseCaseRecord, UseCaseStatus } from '@/types/usecase'

interface UseCaseListViewProps {
  useCases: UseCaseRecord[]
  onAddUseCase: () => void
  onViewUseCase: (id: string) => void
  onEditUseCase: (id: string) => void
  onDeleteUseCase: (id: string) => void
}

const PAGE_SIZE = 8

type StatusFilter = 'all' | UseCaseStatus

function UseCaseListView({
  useCases,
  onAddUseCase,
  onViewUseCase,
  onEditUseCase,
  onDeleteUseCase,
}: UseCaseListViewProps) {
  const [filter, setFilter] = React.useState<StatusFilter>('all')
  const [page, setPage] = React.useState(1)

  const publishedCount = useCases.filter((u) => u.status === 'published').length
  const draftCount = useCases.filter((u) => u.status === 'draft').length
  const pendingCount = useCases.filter((u) => u.status === 'pending').length

  const TABS: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: useCases.length },
    { key: 'draft', label: 'Draft', count: draftCount },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'published', label: 'Published', count: publishedCount },
  ]

  const filteredUseCases = filter === 'all' ? useCases : useCases.filter((u) => u.status === filter)

  const totalPages = Math.max(1, Math.ceil(filteredUseCases.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageUseCases = filteredUseCases.slice(pageStart, pageStart + PAGE_SIZE)

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
          <CardTitle>Use Cases</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Create, manage and publish Use Cases that demonstrate how civic data is being used.
          </p>
        </div>
        <Button type="button" onClick={onAddUseCase}>
          <Plus className="size-4" />
          Add Use Case
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
        {filteredUseCases.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {useCases.length === 0 && 'No content yet. Click "Add Use Case" to create your first one.'}
            {useCases.length > 0 && filter === 'published' && 'No published content yet.'}
            {useCases.length > 0 && filter === 'draft' && 'No drafts yet.'}
            {useCases.length > 0 && filter === 'pending' && 'No pending content.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[13%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="truncate px-5 py-3 font-medium">Use Case</th>
                  <th className="truncate px-5 py-3 font-medium">Status</th>
                  <th className="truncate px-5 py-3 font-medium">Last Updated</th>
                  <th className="truncate px-5 py-3 font-medium">Contributor</th>
                  <th className="truncate px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageUseCases.map((useCase) => {
                  const title = useCase.form.metadata.title || 'Untitled Use Case'
                  const contributor = useCase.form.connections.contributors[0]?.name ?? '—'
                  return (
                    <tr
                      key={useCase.id}
                      style={{ height: TABLE_ROW_HEIGHT_PX }}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <FolderKanban className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
                        </div>
                      </td>
                      <td className="truncate px-5 py-3">
                        <StatusBadge status={useCase.status} />
                      </td>
                      <td className="truncate px-5 py-3 text-muted-foreground">{useCase.updatedAt}</td>
                      <td className="truncate px-5 py-3 text-muted-foreground">{contributor}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          {useCase.status !== 'draft' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`View ${title}`}
                              onClick={() => onViewUseCase(useCase.id)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={useCase.status === 'draft' ? `Continue editing ${title}` : `Edit ${title}`}
                            onClick={() => onEditUseCase(useCase.id)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${title}`}
                            onClick={() => onDeleteUseCase(useCase.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {filteredUseCases.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredUseCases.length)} of{' '}
            {filteredUseCases.length}
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

export { UseCaseListView }
