import * as React from 'react'
import { BellPlus, BellRing, Database, FolderKanban, Plus, Send, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { StatusChip } from '@/components/notifications/StatusChip'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { useAuth, useGoToSignIn } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationsContext'
import { collaborativeRole, requestKindOf } from '@/lib/notification-model'
import { getPerson, orgNameOf } from '@/lib/notification-personas'
import type { AccessRequest } from '@/types/notifications'

/** How a person takes part in a collaborative: follow it, add an item straight away (owner and partners), or submit one for the
 *  owner's approval (everyone else). It reads the same store as the bell and the Notifications page, so a decision made there shows
 *  here at once, and the other way round. */
function CollaborativeParticipationBar({ collaborativeId }: { collaborativeId: string }) {
  const toast = useToast()
  const { isSignedIn } = useAuth()
  const goToSignIn = useGoToSignIn()
  const actions = useRequestActions()
  const { persona, state, follow, unfollow, removeItem, collaborativeInfo, collaborativeName, itemName } = useNotifications()

  const { access, published } = collaborativeInfo(collaborativeId)
  const name = collaborativeName(collaborativeId)
  const role = isSignedIn ? collaborativeRole(persona.id, access, published) : 'none'
  const followers = state.follows[collaborativeId] ?? []
  const following = followers.includes(persona.id)
  const canSubmitHere = role !== 'none' || access.submit === 'anyone'
  const partnerOrg = role === 'partner' ? access.partnerOrgIds.find((orgId) => persona.memberships.some((m) => m.kind === 'org' && m.orgId === orgId)) : undefined

  const mine = state.requests
    .filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collaborativeId && r.requesterId === persona.id)
    .sort((a, b) => b.createdAt - a.createdAt)
  // Only the latest word on each item: a declined submission that was later approved is not shown as declined.
  const latestPerItem = mine.filter((r, i) => mine.findIndex((o) => o.itemId === r.itemId && o.itemKind === r.itemKind) === i && r.status !== 'approved' && r.status !== 'withdrawn')
  const contributed = state.collabItems.filter((i) => i.collaborativeId === collaborativeId).sort((a, b) => b.at - a.at)

  // A decision that arrives while this page is open is announced once.
  const seen = React.useRef<Map<string, string>>(new Map())
  React.useEffect(() => {
    for (const r of mine) {
      const before = seen.current.get(r.id)
      seen.current.set(r.id, r.status)
      if (before === 'waiting' && (r.status === 'approved' || r.status === 'declined')) {
        toast({ title: r.status === 'approved' ? 'Your submission was approved' : 'Your submission was declined', description: `${itemName(r.itemKind, r.itemId)} · ${name}` })
      }
    }
  }, [mine, toast, name, itemName])

  const toggleFollow = () => {
    if (!isSignedIn) return goToSignIn()
    if (following) {
      unfollow(persona.id, collaborativeId)
      toast({ title: 'Unfollowed', description: `You will no longer get updates from ${name}.` })
    } else {
      follow(persona.id, collaborativeId)
      toast({ title: `Following ${name}`, description: 'You get one summary a day, only on days something changed.' })
    }
  }

  const canRemove = (addedById: string) => addedById === persona.id || role === 'owner'

  return (
    <section aria-label="Take part in this collaborative" className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface-default px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-default">
            <Users className="size-4 text-text-subdued" aria-hidden="true" />
            Take part
            {role === 'owner' && <Badge variant="accent">You manage this</Badge>}
            {role === 'partner' && <Badge variant="secondary">Partner{partnerOrg ? ` · ${orgNameOf(partnerOrg)}` : ''}</Badge>}
          </p>
          <p className="mt-0.5 text-sm text-text-subdued">
            {role === 'owner' || role === 'partner'
              ? 'You can add published datasets and use cases straight away.'
              : canSubmitHere
                ? 'Submit a published dataset or use case. The owner approves it before it shows here.'
                : 'Only partners can add items to this collaborative.'}
            {' '}
            {followers.length} {followers.length === 1 ? 'follower' : 'followers'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" aria-pressed={following} onClick={toggleFollow}>
            {following ? <BellRing className="size-4" aria-hidden="true" /> : <BellPlus className="size-4" aria-hidden="true" />}
            {following ? 'Following' : 'Follow'}
          </Button>
          {!isSignedIn ? (
            <Button type="button" onClick={goToSignIn}>
              Sign in to add an item
            </Button>
          ) : role !== 'none' ? (
            <Button type="button" onClick={() => actions.openPicker(collaborativeId, 'add')}>
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Button>
          ) : (
            <Button type="button" disabled={!canSubmitHere} onClick={() => actions.openPicker(collaborativeId, 'submit')}>
              <Send className="size-4" aria-hidden="true" />
              Submit an item
            </Button>
          )}
        </div>
      </div>

      {latestPerItem.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Your submissions">
          {latestPerItem.map((r) => (
            <SubmissionLine key={r.id} request={r} />
          ))}
        </ul>
      )}

      {contributed.length > 0 && (
        <div>
          <h2 className="type-label mb-2 text-text-subdued">Added to this collaborative</h2>
          <ul className="divide-y divide-border-default rounded-lg border border-border-default">
            {contributed.map((c) => {
              const Icon = c.itemKind === 'dataset' ? Database : FolderKanban
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                  <Icon className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-text-default">{itemName(c.itemKind, c.itemId)}</span>
                  <span className="text-xs text-text-subdued">Added by {c.addedById === persona.id ? 'you' : getPerson(c.addedById).name}</span>
                  {canRemove(c.addedById) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const result = removeItem(persona.id, c.id)
                        if (result.ok) toast({ title: 'Removed from this collaborative', description: itemName(c.itemKind, c.itemId) })
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

function SubmissionLine({ request }: { request: AccessRequest }) {
  const actions = useRequestActions()
  const { itemName } = useNotifications()
  const last = request.history[request.history.length - 1]
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-surface-subdued px-3 py-2 text-sm">
      <StatusChip status={request.status} />
      <span className="min-w-0 flex-1 text-text-default">
        {request.status === 'waiting' ? 'Waiting for approval: ' : request.status === 'declined' ? 'Declined: ' : ''}
        {itemName(request.itemKind, request.itemId)}
        {request.status === 'declined' && last?.reason && <span className="text-text-subdued"> · “{last.reason}”</span>}
      </span>
      {request.status === 'waiting' && (
        <Button type="button" variant="ghost" size="sm" onClick={() => actions.withdraw(request)}>
          Withdraw
        </Button>
      )}
      {request.status === 'declined' && request.collaborativeId && (
        <Button type="button" variant="ghost" size="sm" onClick={() => actions.openPicker(request.collaborativeId as string, 'submit')}>
          Submit another
        </Button>
      )}
    </li>
  )
}

export { CollaborativeParticipationBar }
