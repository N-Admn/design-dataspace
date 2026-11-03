import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusChip } from '@/components/notifications/StatusChip'
import { useNotifications } from '@/context/NotificationsContext'
import { HISTORY_LABELS, fullDateTime } from '@/lib/notification-model'
import { getPerson } from '@/lib/notification-personas'
import type { AccessRequest } from '@/types/notifications'

interface HistorySheetProps {
  request: AccessRequest | undefined
  datasetName: string
  onClose: () => void
}

/** The request's timeline in a right-hand side sheet: who did what, when, and why. */
function HistorySheet({ request, datasetName, onClose }: HistorySheetProps) {
  const { persona } = useNotifications()
  return (
    <Dialog open={request !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        {request && (
          <>
            <DialogHeader className="pr-14">
              <DialogTitle>Request history</DialogTitle>
              <DialogDescription>{datasetName}</DialogDescription>
              <div className="mt-2 flex items-center gap-2">
                <StatusChip status={request.status} />
                <span className="text-xs text-text-subdued">Requested by {request.requesterId === persona.id ? 'you' : getPerson(request.requesterId).name}</span>
              </div>
            </DialogHeader>
            <ol className="flex flex-col px-6 py-5" aria-label="Timeline">
              {request.history.map((entry, i) => {
                const actor = entry.actorId === persona.id ? 'You' : getPerson(entry.actorId).name
                return (
                  <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < request.history.length - 1 && <span className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px bg-border-default" aria-hidden="true" />}
                    <span className="mt-1 size-6 shrink-0 rounded-full border-2 border-border-default bg-surface-default" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm text-text-default">
                        <span className="font-medium">{actor}</span> {HISTORY_LABELS[entry.action]}
                      </p>
                      {entry.reason && <p className="mt-1 rounded-md bg-surface-subdued px-3 py-2 text-sm text-text-subdued">“{entry.reason}”</p>}
                      <p className="mt-1 text-xs text-text-subdued">{fullDateTime(entry.at)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { HistorySheet }
