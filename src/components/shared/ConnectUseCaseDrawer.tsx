import * as React from 'react'
import { CheckCircle2, FolderKanban, Search } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'
import { SECTOR_OPTIONS } from '@/types/dataset'

interface ConnectUseCaseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ids of use cases already connected to the parent module — shown as "Connected" and non-selectable. */
  connectedIds: string[]
  parentLabel: string
  onConnect: (useCase: { id: string; title: string }) => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function ConnectUseCaseDrawer({ open, onOpenChange, connectedIds, parentLabel, onConnect }: ConnectUseCaseDrawerProps) {
  const { useCases } = useAppData()
  const [query, setQuery] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedId(null)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const published = useCases.filter((u) => u.status === 'published')
  const results = published.filter((u) => !q || (u.form.metadata.title || '').toLowerCase().includes(q))

  const selected = published.find((u) => u.id === selectedId)

  const handleConnect = () => {
    if (!selected) return
    onConnect({ id: selected.id, title: selected.form.metadata.title || 'Untitled Use Case' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Connect Use Case</DialogTitle>
          <DialogDescription>Select a published Use Case to connect to {parentLabel}.</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 items-center gap-2 border-b border-border px-6 py-4">
          <div className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search published use cases..."
              className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No published Use Cases found.</p>
              <p className="text-xs text-muted-foreground">Only published Use Cases can be connected.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((useCase) => {
                const isConnected = connectedIds.includes(useCase.id)
                const isSelected = selectedId === useCase.id
                const title = useCase.form.metadata.title || 'Untitled Use Case'

                return (
                  <button
                    key={useCase.id}
                    type="button"
                    disabled={isConnected}
                    onClick={() => setSelectedId((prev) => (prev === useCase.id ? null : useCase.id))}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border',
                      isConnected && 'opacity-60',
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : <FolderKanban className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{title}</p>
                      {useCase.form.metadata.sectors.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {useCase.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).join(', ')}
                        </p>
                      )}
                    </div>
                    {isConnected && (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Connected
                      </span>
                    )}
                  </button>
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
            Connect Use Case
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ConnectUseCaseDrawer }
