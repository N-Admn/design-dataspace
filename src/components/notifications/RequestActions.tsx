import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications, type ActionResult } from '@/context/NotificationsContext'
import { HistorySheet } from '@/components/notifications/HistorySheet'
import { ItemPickerDialog } from '@/components/notifications/ItemPickerDialog'
import { ownerOfDataset, requestKindOf } from '@/lib/notification-model'
import { getPerson, ownerName } from '@/lib/notification-personas'
import type { AccessRequest, ItemKind } from '@/types/notifications'

export const NOTIFICATIONS_PATH = '/dashboard/notifications'

interface RequestActions {
  /** Opens the reason dialog, then sends the request. */
  openRequestAccess: (datasetId: string) => void
  /** Opens the item picker: owners and partners add straight away, everyone else submits for approval. */
  openPicker: (collaborativeId: string, mode: 'add' | 'submit') => void
  approve: (request: AccessRequest) => void
  /** Opens a confirmation (with an optional reason) before declining. */
  decline: (request: AccessRequest) => void
  /** Opens a confirmation before revoking. */
  revoke: (request: AccessRequest) => void
  withdraw: (request: AccessRequest) => void
  openHistory: (request: AccessRequest) => void
  datasetName: (datasetId: string) => string
  /** What a request is about, named: the dataset asked for, or the item submitted. */
  subjectName: (request: AccessRequest) => string
  collaborativeName: (collaborativeId: string) => string
}

const RequestActionsContext = React.createContext<RequestActions | null>(null)

type Pending =
  | { kind: 'request'; datasetId: string }
  | { kind: 'pick'; collaborativeId: string; mode: 'add' | 'submit' }
  | { kind: 'decline' | 'revoke'; requestId: string }
  | null

/** The one place that turns a click on Request access / Approve / Decline / Revoke / Withdraw into a store change, a toast and,
 *  where the action is hard to take back, a confirmation. Mounted once, so the dataset page, the bell and the page all behave
 *  the same. Approving has no undo; declining and revoking ask first. */
function RequestActionsProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { datasets } = useAppData()
  const notifications = useNotifications()
  const { persona, state } = notifications
  const [pending, setPending] = React.useState<Pending>(null)
  const [reason, setReason] = React.useState('')
  const [historyId, setHistoryId] = React.useState<string | null>(null)

  const datasetName = React.useCallback(
    (id: string) => datasets.find((d) => d.id === id)?.form.metadata.name || 'this dataset',
    [datasets],
  )
  const subjectName = React.useCallback((request: AccessRequest) => notifications.itemName(request.itemKind, request.itemId), [notifications])
  const ownerLabel = React.useCallback(
    (datasetId: string) => {
      const owner = ownerOfDataset(datasets.find((d) => d.id === datasetId))
      return owner ? ownerName(owner) : 'The owner'
    },
    [datasets],
  )

  const close = () => {
    setPending(null)
    setReason('')
  }

  /** A decision that lost the race: say who decided, in plain words, and leave the row as the store now has it. */
  const reportStale = (result: Extract<ActionResult, { ok: false }>) => {
    if (result.reason === 'already-decided') {
      const by = result.byId ? (result.byId === persona.id ? 'you' : getPerson(result.byId).name) : 'someone else'
      toast({ title: 'Already decided', description: `This request was already handled by ${by}.`, variant: 'error' })
    } else {
      toast({ title: "You can't do that", description: 'Only the people who manage this dataset can decide access.', variant: 'error' })
    }
  }

  const value: RequestActions = {
    datasetName,
    subjectName,
    collaborativeName: notifications.collaborativeName,
    openPicker: (collaborativeId, mode) => setPending({ kind: 'pick', collaborativeId, mode }),
    openRequestAccess: (datasetId) => setPending({ kind: 'request', datasetId }),
    approve: (request) => {
      const result = notifications.decide(persona.id, request.id, 'approved')
      if (!result.ok) return reportStale(result)
      toast(
        requestKindOf(request) === 'submission'
          ? { title: 'Submission approved', description: `${subjectName(request)} is now part of ${notifications.collaborativeName(request.collaborativeId ?? '')}.` }
          : { title: 'Access approved', description: `${getPerson(request.requesterId).name} can now open ${datasetName(request.itemId)}.` },
      )
    },
    decline: (request) => setPending({ kind: 'decline', requestId: request.id }),
    revoke: (request) => setPending({ kind: 'revoke', requestId: request.id }),
    withdraw: (request) => {
      const result = notifications.withdraw(persona.id, request.id)
      if (!result.ok) return reportStale(result)
      toast(
        requestKindOf(request) === 'submission'
          ? { title: 'Submission withdrawn', description: `${subjectName(request)} will not be added unless you submit it again.` }
          : { title: 'Request withdrawn', description: `You can ask for access to ${datasetName(request.itemId)} again later.` },
      )
    },
    openHistory: (request) => setHistoryId(request.id),
  }

  const submitRequest = () => {
    if (pending?.kind !== 'request') return
    const result = notifications.requestAccess(persona.id, pending.datasetId, reason)
    close()
    if (!result.ok) {
      toast({ title: 'Request already sent', description: 'You already have a request for this dataset.', variant: 'error' })
      return
    }
    const requestId = result.request.id
    toast({
      title: 'Request sent',
      description: `${ownerLabel(pending.datasetId)} will be notified.`,
      action: { label: 'View request', onClick: () => navigate(`${NOTIFICATIONS_PATH}?request=${requestId}`) },
    })
  }

  const confirmPick = (collaborativeId: string, itemKind: ItemKind, itemId: string) => {
    if (pending?.kind !== 'pick') return
    const mode = pending.mode
    const name = notifications.itemName(itemKind, itemId)
    const collaborative = notifications.collaborativeName(collaborativeId)
    const result = mode === 'add' ? notifications.addItem(persona.id, collaborativeId, itemKind, itemId) : notifications.submitItem(persona.id, collaborativeId, itemKind, itemId)
    close()
    if (!result.ok) {
      toast({ title: mode === 'add' ? 'Could not add the item' : 'Could not submit the item', description: result.reason === 'exists' ? 'It is already there, or already waiting.' : 'You are not allowed to do that here.', variant: 'error' })
      return
    }
    if (mode === 'add') {
      toast({ title: 'Item added', description: `${name} is now part of ${collaborative}.` })
      return
    }
    const requestId = (result as { request?: AccessRequest }).request?.id ?? ''
    toast({
      title: 'Submitted for approval',
      description: `${name} shows on ${collaborative} once its owner approves.`,
      action: { label: 'View submission', onClick: () => navigate(`${NOTIFICATIONS_PATH}?request=${requestId}`) },
    })
  }

  const submitDecision = () => {
    if (pending?.kind !== 'decline' && pending?.kind !== 'revoke') return
    const { kind, requestId } = pending
    const result = kind === 'decline' ? notifications.decide(persona.id, requestId, 'declined', reason) : notifications.revoke(persona.id, requestId, reason)
    close()
    if (!result.ok) return reportStale(result)
    const submission = requestKindOf(result.request) === 'submission'
    toast(
      kind === 'decline'
        ? { title: submission ? 'Submission declined' : 'Request declined', description: `${getPerson(result.request.requesterId).name} can ${submission ? 'submit again' : 'ask again'} later.` }
        : { title: 'Access revoked', description: `${getPerson(result.request.requesterId).name} can no longer open ${datasetName(result.request.itemId)}.` },
    )
  }

  const pendingRequest = pending && (pending.kind === 'decline' || pending.kind === 'revoke') ? state.requests.find((r) => r.id === pending.requestId) : undefined
  const historyRequest = historyId ? state.requests.find((r) => r.id === historyId) : undefined

  return (
    <RequestActionsContext.Provider value={value}>
      {children}

      <Dialog open={pending?.kind === 'request'} onOpenChange={(open) => !open && close()}>
        <DialogContent variant="center" className="flex max-w-md flex-col gap-0 p-0">
          {pending?.kind === 'request' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitRequest()
              }}
            >
              <DialogHeader className="pr-14">
                <DialogTitle className="flex items-center gap-2">
                  <Lock className="size-4" aria-hidden="true" />
                  Request access
                </DialogTitle>
                <DialogDescription>
                  {ownerLabel(pending.datasetId)} reviews every request to <span className="font-medium text-text-default">{datasetName(pending.datasetId)}</span>.
                  You will see the answer here and by email.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 px-6 py-4">
                <Label htmlFor="request-access-reason">Why do you need it? (optional)</Label>
                <Textarea
                  id="request-access-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="A line on how you plan to use the data helps the owner decide."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-border-default px-6 py-4">
                <Button type="button" variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Send request</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pendingRequest !== undefined} onOpenChange={(open) => !open && close()}>
        <DialogContent variant="center" className="flex max-w-md flex-col gap-0 p-0">
          {pendingRequest && pending && (pending.kind === 'decline' || pending.kind === 'revoke') && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitDecision()
              }}
            >
              <DialogHeader className="pr-14">
                <DialogTitle>{pending.kind === 'decline' ? 'Decline this request?' : 'Revoke access?'}</DialogTitle>
                <DialogDescription>
                  {pending.kind === 'decline'
                    ? requestKindOf(pendingRequest) === 'submission'
                      ? `${getPerson(pendingRequest.requesterId).name} will be told ${subjectName(pendingRequest)} was not added to ${notifications.collaborativeName(pendingRequest.collaborativeId ?? '')}. They can submit again.`
                      : `${getPerson(pendingRequest.requesterId).name} will be told their request for ${datasetName(pendingRequest.itemId)} was declined. They can ask again.`
                    : `${getPerson(pendingRequest.requesterId).name} will lose access to ${datasetName(pendingRequest.itemId)} straight away. They can ask again.`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 px-6 py-4">
                <Label htmlFor="request-decision-reason">Reason (optional)</Label>
                <Textarea
                  id="request-decision-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="Shared with the person so they know what to change."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-border-default px-6 py-4">
                <Button type="button" variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  {pending.kind === 'decline' ? 'Decline request' : 'Revoke access'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ItemPickerDialog
        collaborativeId={pending?.kind === 'pick' ? pending.collaborativeId : null}
        mode={pending?.kind === 'pick' ? pending.mode : 'submit'}
        onClose={close}
        onConfirm={(collaborativeId, itemKind, itemId) => confirmPick(collaborativeId, itemKind, itemId)}
      />

      <HistorySheet request={historyRequest} datasetName={historyRequest ? datasetName(historyRequest.itemId) : ''} onClose={() => setHistoryId(null)} />
    </RequestActionsContext.Provider>
  )
}

function useRequestActions(): RequestActions {
  const ctx = React.useContext(RequestActionsContext)
  if (!ctx) throw new Error('useRequestActions must be used inside <RequestActionsProvider>')
  return ctx
}

export { RequestActionsProvider, useRequestActions }
