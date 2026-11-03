import * as React from 'react'
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { StatusChip } from '@/components/notifications/StatusChip'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { useAuth, useGoToSignIn } from '@/context/AuthContext'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { hasAccess, isOwnerSide, isRestricted, latestRequestBy, ownerOfDataset } from '@/lib/notification-model'
import { getPerson, ownerName } from '@/lib/notification-personas'

/** The access state of a restricted dataset, in one place on the page: what is locked, and the one thing the visitor can do about
 *  it. It reads the same store as the bell and the Notifications page, so a decision made elsewhere changes it at once. */
function RestrictedAccessBar({ datasetId }: { datasetId: string }) {
  const toast = useToast()
  const { isSignedIn } = useAuth()
  const goToSignIn = useGoToSignIn()
  const { datasets } = useAppData()
  const { persona, state } = useNotifications()
  const actions = useRequestActions()

  const dataset = datasets.find((d) => d.id === datasetId)
  const restricted = isRestricted(dataset)
  const owner = ownerOfDataset(dataset)
  const unlocked = hasAccess(isSignedIn ? persona.id : null, dataset, state.requests)
  const request = isSignedIn ? latestRequestBy(state.requests, persona.id, datasetId) : undefined
  const ownerSide = Boolean(isSignedIn && owner && isOwnerSide(persona.id, owner))

  // Access that arrives while the visitor is on the page (or after they switch person) is announced once.
  const wasUnlocked = React.useRef(unlocked)
  const lastPersona = React.useRef(persona.id)
  React.useEffect(() => {
    if (lastPersona.current !== persona.id) {
      lastPersona.current = persona.id
      wasUnlocked.current = unlocked
      return
    }
    if (!wasUnlocked.current && unlocked && !ownerSide) toast({ title: 'You now have access', description: 'Downloads and data are unlocked.' })
    wasUnlocked.current = unlocked
  }, [unlocked, ownerSide, persona.id, toast])

  if (!restricted || !owner) return null
  const owned = ownerName(owner)
  const last = request?.history[request.history.length - 1]

  let body: React.ReactNode
  if (ownerSide) {
    body = (
      <>
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-text-success" aria-hidden="true" />
        <p className="text-sm text-text-default">
          <span className="font-medium">Restricted access.</span> You can open everything because this dataset belongs to {owner.kind === 'personal' ? 'you' : owned}.
        </p>
      </>
    )
  } else if (unlocked) {
    body = (
      <>
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-text-success" aria-hidden="true" />
        <p className="text-sm text-text-default">
          <span className="font-medium">You have access.</span> {owned} approved your request.
        </p>
      </>
    )
  } else {
    const cta = !isSignedIn ? (
      <Button type="button" onClick={goToSignIn}>
        <Lock className="size-4" aria-hidden="true" />
        Sign in to request access
      </Button>
    ) : request?.status === 'waiting' ? (
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled>
          Request sent
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => actions.withdraw(request)}>
          Withdraw
        </Button>
      </div>
    ) : (
      <Button type="button" onClick={() => actions.openRequestAccess(datasetId)}>
        <Lock className="size-4" aria-hidden="true" />
        {request ? 'Request access again' : 'Request access'}
      </Button>
    )
    const note =
      request?.status === 'waiting'
        ? `Waiting for ${owned} to decide.`
        : request?.status === 'declined'
          ? `Your request was declined${last?.reason ? `: “${last.reason}”` : '.'}`
          : request?.status === 'revoked'
            ? `Your access was revoked${last?.actorId ? ` by ${getPerson(last.actorId).name}` : ''}.`
            : request?.status === 'withdrawn'
              ? 'You withdrew your request.'
              : `Files, downloads, data and charts open once ${owned} approves your request.`
    body = (
      <>
        <Lock className="mt-0.5 size-5 shrink-0 text-text-subdued" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-default">
              Restricted access
              {request && <StatusChip status={request.status} />}
            </p>
            <p className="mt-0.5 text-sm text-text-subdued">{note}</p>
          </div>
          {cta}
        </div>
      </>
    )
  }

  return (
    <section aria-label="Access to this dataset" className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-default px-4 py-3.5">
      {body}
    </section>
  )
}

export { RestrictedAccessBar }
