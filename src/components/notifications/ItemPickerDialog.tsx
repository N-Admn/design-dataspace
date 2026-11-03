import * as React from 'react'
import { Database, FolderKanban, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { isRestricted, itemInCollaborative, requestKindOf } from '@/lib/notification-model'
import { cn } from '@/lib/utils'
import type { ItemKind } from '@/types/notifications'

interface ItemPickerDialogProps {
  collaborativeId: string | null
  /** Owners and partners add straight away; everyone else submits for the owner's approval. */
  mode: 'add' | 'submit'
  onClose: () => void
  onConfirm: (collaborativeId: string, itemKind: ItemKind, itemId: string) => void
}

interface Choice {
  kind: ItemKind
  id: string
  title: string
  restricted: boolean
}

/** Picks one published dataset or use case for a collaborative. Drafts never appear: only published items can be added. Items
 *  already in the collaborative, or already waiting there, are left out. */
function ItemPickerDialog({ collaborativeId, mode, onClose, onConfirm }: ItemPickerDialogProps) {
  const { datasets, useCases, collaboratives } = useAppData()
  const { state, persona } = useNotifications()
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    setQuery('')
    setSelected(null)
  }, [collaborativeId])

  const collaborative = collaborativeId ? collaboratives.find((c) => c.id === collaborativeId) : undefined

  const choices = React.useMemo<Choice[]>(() => {
    if (!collaborativeId) return []
    const all: Choice[] = [
      ...datasets.filter((d) => d.status === 'published').map((d) => ({ kind: 'dataset' as const, id: d.id, title: d.form.metadata.name, restricted: isRestricted(d) })),
      ...useCases.filter((u) => u.status === 'published').map((u) => ({ kind: 'use-case' as const, id: u.id, title: u.form.metadata.title, restricted: false })),
    ]
    return all.filter(
      (c) =>
        !itemInCollaborative(state.collabItems, collaborativeId, c.id, c.kind) &&
        !state.requests.some(
          (r) => requestKindOf(r) === 'submission' && r.collaborativeId === collaborativeId && r.itemId === c.id && r.itemKind === c.kind && r.requesterId === persona.id && r.status === 'waiting',
        ),
    )
  }, [collaborativeId, datasets, useCases, state.collabItems, state.requests, persona.id])

  const shown = choices.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
  const chosen = choices.find((c) => `${c.kind}:${c.id}` === selected)

  return (
    <Dialog open={collaborativeId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="center" className="flex max-w-lg flex-col gap-0 p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (collaborativeId && chosen) onConfirm(collaborativeId, chosen.kind, chosen.id)
          }}
        >
          <DialogHeader className="pr-14">
            <DialogTitle>{mode === 'add' ? 'Add an item' : 'Submit an item'}</DialogTitle>
            <DialogDescription>
              {mode === 'add'
                ? `Pick a published dataset or use case. It joins ${collaborative?.form.metadata.name ?? 'the collaborative'} straight away.`
                : `Pick a published dataset or use case. The owner of ${collaborative?.form.metadata.name ?? 'the collaborative'} approves it before it shows.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 px-6 py-4">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search published items" aria-label="Search published items" />
            <ul role="radiogroup" aria-label="Published items" className="max-h-72 divide-y divide-border-default overflow-y-auto rounded-lg border border-border-default">
              {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-text-subdued">Nothing to add. Every matching item is already there or waiting.</li>}
              {shown.map((c) => {
                const key = `${c.kind}:${c.id}`
                const Icon = c.kind === 'dataset' ? Database : FolderKanban
                return (
                  <li key={key}>
                    <label className={cn('flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm hover:bg-surface-subdued', selected === key && 'bg-surface-subdued')}>
                      <input type="radio" name="collab-item" className="mt-1" checked={selected === key} onChange={() => setSelected(key)} />
                      <Icon className="mt-0.5 size-4 shrink-0 text-text-subdued" aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-text-default">{c.title}</span>
                      <span className="shrink-0 text-xs text-text-subdued">{c.kind === 'dataset' ? 'Dataset' : 'Use case'}</span>
                      {c.restricted && <Lock className="mt-0.5 size-3.5 shrink-0 text-text-subdued" aria-label="Restricted" />}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border-default px-6 py-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!chosen}>
              {mode === 'add' ? 'Add item' : 'Submit for approval'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ItemPickerDialog }
