import * as React from 'react'
import { CheckCircle2, FolderKanban, Plus, Search, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import { useAppData } from '@/context/AppDataContext'
import { SECTOR_OPTIONS } from '@/types/dataset'
import type { CollaborativeConnections } from '@/types/collaborative'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

interface CollaborativeStep3ContentProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
  onCreateUseCase: () => void
}

function CollaborativeStep3Content({ connections, onChange, onCreateUseCase }: CollaborativeStep3ContentProps) {
  const { useCases } = useAppData()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [useCaseQuery, setUseCaseQuery] = React.useState('')
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  // Same dropdown pattern as the Datasets card above: only published use cases,
  // and anything already connected drops out of the list.
  const connectedUseCaseIds = connections.useCases.map((u) => u.id)
  const q = useCaseQuery.trim().toLowerCase()
  const useCaseResults = useCases
    .filter((u) => u.status === 'published' && !connectedUseCaseIds.includes(u.id))
    .filter((u) => !q || (u.form.metadata.title || '').toLowerCase().includes(q))

  const connectUseCase = (useCase: { id: string; title: string }) => {
    onChange({ ...connections, useCases: [...connections.useCases, useCase] })
    setJustAddedMessage(`"${useCase.title}" connected to this Collaborative.`)
    setSearchOpen(false)
    setUseCaseQuery('')
  }

  return (
    <div className="flex flex-col gap-6">
      <DatasetConnectionsCard
        datasets={connections.datasets}
        parentLabel="this Collaborative"
        description="Connect published datasets that support or relate to this Collaborative."
        onChange={(datasets) => onChange({ ...connections, datasets })}
        searchVariant="dropdown"
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Use Cases</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Connect published Use Cases that are part of or related to this Collaborative.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onCreateUseCase}>
            <Plus className="size-4" />
            Create New Use Case
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {justAddedMessage && (
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2.5 text-sm font-medium text-success-text">
              <CheckCircle2 className="size-4 shrink-0" />
              {justAddedMessage}
            </div>
          )}

          <Label className="sr-only">Search Use Cases</Label>
          <Popover
            open={searchOpen}
            onOpenChange={(next) => {
              setSearchOpen(next)
              if (next) setUseCaseQuery('')
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-full items-center gap-2 rounded-md border border-border-input bg-surface-default px-3 text-sm text-text-subdued transition-colors hover:border-border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <Search className="size-4 shrink-0" />
                Search published use cases...
              </button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-3 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
              <SearchInput autoFocus value={useCaseQuery} onChange={setUseCaseQuery} placeholder="Search by title" />
              <SearchResultList
                isEmpty={useCaseResults.length === 0}
                emptyLabel="No published use cases found."
                className="max-h-72 overflow-y-auto"
              >
                {useCaseResults.map((useCase) => {
                  const title = useCase.form.metadata.title || 'Untitled Use Case'
                  const sectors = useCase.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).join(', ')
                  return (
                    <SearchResultRow
                      key={useCase.id}
                      icon={FolderKanban}
                      primary={title}
                      secondary={sectors || '—'}
                      onSelect={() => connectUseCase({ id: useCase.id, title })}
                    />
                  )
                })}
              </SearchResultList>
            </PopoverContent>
          </Popover>

          {connections.useCases.length === 0 ? (
            <EmptyState
              title="No Use Cases connected yet."
              description="Connect an existing published Use Case to this Collaborative."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {connections.useCases.map((item) => {
                const record = useCases.find((u) => u.id === item.id)
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FolderKanban className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      {record && (
                        <div className="mt-0.5">
                          <StatusBadge status={record.status} />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.title}`}
                      onClick={() =>
                        onChange({ ...connections, useCases: connections.useCases.filter((x) => x.id !== item.id) })
                      }
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { CollaborativeStep3Content }
