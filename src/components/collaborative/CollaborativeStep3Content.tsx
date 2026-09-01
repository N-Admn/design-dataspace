import * as React from 'react'
import { CheckCircle2, FolderKanban, Plus, Search, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'
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
  const [showUseCaseSearch, setShowUseCaseSearch] = React.useState(false)
  const [useCaseQuery, setUseCaseQuery] = React.useState('')
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  const connectedUseCaseIds = connections.useCases.map((u) => u.id)
  const q = useCaseQuery.trim().toLowerCase()
  const useCaseResults = useCases
    .filter((u) => u.status === 'published')
    .filter((u) => !q || (u.form.metadata.title || '').toLowerCase().includes(q))

  const connectUseCase = (useCase: { id: string; title: string }) => {
    onChange({ ...connections, useCases: [...connections.useCases, useCase] })
    setJustAddedMessage(`"${useCase.title}" connected to this Collaborative.`)
    setShowUseCaseSearch(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Content</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connect datasets and use cases related to this Collaborative.</p>
      </div>

      <DatasetConnectionsCard
        datasets={connections.datasets}
        parentLabel="this Collaborative"
        description="Connect published datasets that support or relate to this Collaborative."
        onChange={(datasets) => onChange({ ...connections, datasets })}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Use Cases</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Connect published Use Cases that are part of or related to this Collaborative.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUseCaseSearch((prev) => !prev)}
            >
              <Plus className="size-4" />
              Connect Use Case
            </Button>
            <button
              type="button"
              onClick={onCreateUseCase}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Create New Use Case
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

          {showUseCaseSearch && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={useCaseQuery}
                  onChange={(e) => setUseCaseQuery(e.target.value)}
                  placeholder="Search published use cases..."
                  className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              {useCaseResults.length === 0 ? (
                <div className="flex flex-col items-center gap-1 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">No published Use Cases found.</p>
                  <p className="text-xs text-muted-foreground">Only published Use Cases can be connected.</p>
                </div>
              ) : (
                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                  {useCaseResults.map((useCase) => {
                    const isConnected = connectedUseCaseIds.includes(useCase.id)
                    const title = useCase.form.metadata.title || 'Untitled Use Case'

                    return (
                      <div
                        key={useCase.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border border-border bg-card p-3',
                          isConnected && 'opacity-60',
                        )}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <FolderKanban className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{title}</p>
                          {useCase.form.metadata.sectors.length > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {useCase.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).join(', ')}
                            </p>
                          )}
                        </div>
                        {isConnected ? (
                          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Connected
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="shrink-0"
                            onClick={() => connectUseCase({ id: useCase.id, title })}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => setShowUseCaseSearch(false)}
              >
                Cancel
              </Button>
            </div>
          )}

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
