import * as React from 'react'
import { Database, FolderKanban, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { isRestricted, requestKindOf } from '@/lib/notification-model'
import { cn } from '@/lib/utils'
import type { ItemKind } from '@/types/notifications'

interface ItemPickerDrawerProps {
  collaborativeId: string | null
  /** Owners and partners add straight away; everyone else submits for the owner's approval. */
  mode: 'add' | 'submit'
  onClose: () => void
  onCloseAutoFocus?: (event: Event) => void
  onConfirm: (collaborativeId: string, itemKind: ItemKind, itemId: string) => void
}

interface Choice {
  kind: ItemKind
  id: string
  title: string
  restricted: boolean
  /** Someone has already submitted it and the owner has not decided yet. */
  underReviewBy?: string
}

/** The one item picker for collaboratives, opened from the public page's Contribute button, the collaborative's Items view and
 *  My Contributions. A right-hand drawer, as every contributor action that collects input is (contributor-form-patterns, Pattern 1).
 *  Picks one published dataset or use case for a collaborative. Drafts never appear: only published items can be added. Items
 *  already in the collaborative, or already waiting there, are left out. */
function ItemPickerDrawer({ collaborativeId, mode, onClose, onCloseAutoFocus, onConfirm }: ItemPickerDrawerProps) {
  const { datasets, useCases, collaboratives } = useAppData()
  const { state, persona, hasItem } = useNotifications()
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
    return all
      .filter((c) => !hasItem(collaborativeId, c.id, c.kind))
      .map((c) => {
        const waiting = state.requests.find((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collaborativeId && r.itemId === c.id && r.itemKind === c.kind && r.status === 'waiting')
        return waiting ? { ...c, underReviewBy: waiting.requesterId === persona.id ? 'you' : 'someone' } : c
      })
  }, [collaborativeId, datasets, useCases, hasItem, state.collabItems, state.requests, persona.id])

  const shown = choices.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
  const chosen = choices.find((c) => `${c.kind}:${c.id}` === selected)

  const confirm = useConfirm()
  const dirty = selected !== null || query.trim() !== ''
  // Closing with something chosen or typed asks first, as every contributor drawer does.
  const attemptClose = async () => {
    if (dirty) {
      const discard = await confirm({ title: 'Discard changes?', description: 'Your choice has not been saved.', confirmLabel: 'Discard', variant: 'destructive' })
      if (!discard) return
    }
    onClose()
  }
  const title = mode === 'add' ? 'Add Item' : 'Submit an Item'

  return (
    <Dialog open={collaborativeId !== null} onOpenChange={(open) => !open && void attemptClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0" onCloseAutoFocus={onCloseAutoFocus}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            if (collaborativeId && chosen) onConfirm(collaborativeId, chosen.kind, chosen.id)
          }}
        >
          <DialogHeader className="pr-14">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === 'add'
                ? `Pick a published dataset or use case. It joins ${collaborative?.form.metadata.name ?? 'the collaborative'} straight away.`
                : `Pick a published dataset or use case. The owner of ${collaborative?.form.metadata.name ?? 'the collaborative'} approves it before it shows.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search published items" aria-label="Search published items" />
            <fieldset className="min-w-0">
              <legend className="sr-only">Published items</legend>
              <ul className="divide-y divide-border-default rounded-lg border border-border-default">
                {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-text-subdued">Nothing matches. Items already in the collaborative are not listed.</li>}
                {shown.map((c) => {
                  const key = `${c.kind}:${c.id}`
                  const Icon = c.kind === 'dataset' ? Database : FolderKanban
                  return (
                    <li key={key}>
                      <label
                        className={cn(
                          'flex items-start gap-3 px-4 py-2.5 text-sm',
                          c.underReviewBy ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-surface-subdued',
                          selected === key && 'bg-surface-subdued',
                        )}
                      >
                        <input type="radio" name="collab-item" className="mt-1" checked={selected === key} disabled={Boolean(c.underReviewBy)} onChange={() => setSelected(key)} />
                        <Icon className="mt-0.5 size-4 shrink-0 text-text-subdued" aria-hidden="true" />
                        <span className={cn('min-w-0 flex-1', c.underReviewBy ? 'text-text-subdued' : 'text-text-default')}>
                          {c.title}
                          {c.underReviewBy && (
                            <span className="mt-0.5 block text-xs">
                              Already under review{c.underReviewBy === 'you' ? ' (you submitted it)' : ''}. The owner has not decided yet.
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-text-subdued">{c.kind === 'dataset' ? 'Dataset' : 'Use case'}</span>
                        {c.restricted && <Lock className="mt-0.5 size-3.5 shrink-0 text-text-subdued" aria-label="Restricted" />}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => void attemptClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={!chosen}>
              {mode === 'add' ? 'Add Item' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ItemPickerDrawer }
