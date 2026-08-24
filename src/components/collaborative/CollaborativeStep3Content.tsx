import * as React from 'react'
import { CheckCircle2, FolderKanban, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import { ConnectUseCaseDrawer } from '@/components/shared/ConnectUseCaseDrawer'
import { useAppData } from '@/context/AppDataContext'
import type { CollaborativeConnections } from '@/types/collaborative'

interface CollaborativeStep3ContentProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
  onCreateUseCase: () => void
}

function CollaborativeStep3Content({ connections, onChange, onCreateUseCase }: CollaborativeStep3ContentProps) {
  const { useCases } = useAppData()
  const [showUseCaseDrawer, setShowUseCaseDrawer] = React.useState(false)
  const [justAddedMessage, setJustAddedMessage] = React.useState<string | null>(null)

  const connectedUseCaseIds = connections.useCases.map((u) => u.id)

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
            <Button type="button" variant="outline" size="sm" onClick={() => setShowUseCaseDrawer(true)}>
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
          {connections.useCases.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-sm font-medium text-foreground">No Use Cases connected yet.</p>
              <p className="text-xs text-muted-foreground">Connect an existing published Use Case to this Collaborative.</p>
            </div>
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

      <ConnectUseCaseDrawer
        open={showUseCaseDrawer}
        onOpenChange={setShowUseCaseDrawer}
        connectedIds={connectedUseCaseIds}
        parentLabel="this Collaborative"
        onConnect={(useCase) => {
          onChange({ ...connections, useCases: [...connections.useCases, useCase] })
          setJustAddedMessage(`"${useCase.title}" connected to this Collaborative.`)
        }}
      />
    </div>
  )
}

export { CollaborativeStep3Content }
