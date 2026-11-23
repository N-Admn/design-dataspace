import { Link, useParams } from 'react-router-dom'
import { Database, FolderKanban, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { BackLink } from '@/components/shared/BackLink'
import { PageHeader } from '@/components/shared/PageHeader'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { roleInOrganisation } from '@/lib/membership-source'
import { canDecide, collaborativeRole, fullDateTime, requestKindOf, timeAgo } from '@/lib/notification-model'
import { getPerson, orgNameOf, ownerName } from '@/lib/notification-personas'
import { useNow } from '@/hooks/use-now'
import type { ItemKind } from '@/types/notifications'

const VIA_LABEL = { owner: 'Added by the owner', partner: 'Added by a partner', approved: 'Approved submission' } as const

const itemHref = (kind: ItemKind, id: string) => (kind === 'use-case' ? `/explore/use-cases/${id}` : `/explore/datasets/${id}`)

function ItemLink({ kind, id, title }: { kind: ItemKind; id: string; title: string }) {
  const Icon = kind === 'dataset' ? Database : FolderKanban
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
      <a href={itemHref(kind, id)} target="_blank" rel="noreferrer" className="relative block min-h-[24px] min-w-0 truncate font-medium leading-[24px] text-text-default underline decoration-border-default underline-offset-2 hover:text-text-brand hover:decoration-current">
        {title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span className="shrink-0 text-xs text-text-subdued">{kind === 'dataset' ? 'Dataset' : 'Use case'}</span>
    </span>
  )
}

const ROW = 'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border-default px-3 py-2.5'

/** The Items view of a collaborative, in the dashboard: what is in it and who added it, the submissions waiting for the owner, and
 *  the partners. Owners and partners reach it; everyone else is told it is not theirs to manage. It reads the same store as the
 *  bell and the public page, so nothing here is a second copy of any decision. */
function CollaborativeItemsPage() {
  const { id } = useParams<{ id: string }>()
  const confirm = useConfirm()
  const toast = useToast()
  const now = useNow()
  const { collaboratives } = useAppData()
  const actions = useRequestActions()
  const { persona, state, collaborativeInfo, collaborativeName, itemName, removeItem } = useNotifications()

  const record = id ? collaboratives.find((c) => c.id === id) : undefined
  if (!id || !record) {
    return <EmptyState title="Collaborative not found" description="It may have been deleted." action={<Button asChild variant="outline"><Link to="/dashboard/collaboratives">Back to Collaboratives</Link></Button>} />
  }

  const { access, published } = collaborativeInfo(id)
  const role = collaborativeRole(persona.id, access, published)
  const name = collaborativeName(id)

  const back = <BackLink fallbackTo="/dashboard/collaboratives" />

  if (role === 'none') {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <EmptyState title="You don’t manage this collaborative" description="Only its owner and its partners manage items here. You can still follow it or submit an item from its public page." />
      </div>
    )
  }

  const form = record.publishedForm ?? record.form
  const ownerConnected = [
    ...form.connections.datasets.map((d) => ({ kind: 'dataset' as const, id: d.id, title: d.title })),
    ...form.connections.useCases.map((u) => ({ kind: 'use-case' as const, id: u.id, title: u.title })),
  ]
  const added = state.collabItems.filter((i) => i.collaborativeId === id).sort((a, b) => b.at - a.at)
  const waiting = state.requests
    .filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === id && r.status === 'waiting')
    .sort((a, b) => b.createdAt - a.createdAt)
  const isOwner = role === 'owner'
  const ownerDecides = canDecide(persona.id, access.owner)
  const followers = state.follows[id]?.length ?? 0

  const partnerNames = [
    ...new Set([
      ...access.partnerOrgIds.map(orgNameOf),
      ...form.connections.people.filter((p) => p.relationship === 'partner').map((p) => p.name),
    ]),
  ]

  const handleRemove = async (collabItemId: string, title: string) => {
    const ok = await confirm({
      title: 'Remove from this collaborative?',
      description: `“${title}” leaves ${name} straight away. It stays with its owner and can be added again.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    })
    if (!ok) return
    const result = removeItem(persona.id, collabItemId)
    if (result.ok) toast({ title: 'Removed from this collaborative', description: title })
    else toast({ title: 'You can’t remove that', description: 'Partners remove the items they added; the owner removes any item.', variant: 'error' })
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-col gap-3 border-b border-border-default px-6 py-5">
        {back}
        <PageHeader
          title={`Items · ${name}`}
          description="What is in this collaborative, who added it, and what is waiting for approval."
          action={
            <Badge variant={isOwner ? 'accent' : 'secondary'}>
              {isOwner ? 'You manage this' : `Partner${access.partnerOrgIds.length ? ` · ${orgNameOf(access.partnerOrgIds.find((o) => roleInOrganisation(persona.id, o) !== null) ?? '')}` : ''}`}
            </Badge>
          }
        />
        </div>
        <CardHeader className="flex-row items-center justify-between">
          <p className="text-sm font-medium text-text-default">{ownerConnected.length + added.length} in this collaborative</p>
          <Button type="button" variant="outline" size="sm" disabled={!published} onClick={() => actions.openPicker(id, 'add')}>
            <Plus className="size-4" aria-hidden="true" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-5">
          {!published && <p className="rounded-lg border border-dashed border-border-default px-3 py-2.5 text-sm text-text-subdued">Publish the collaborative before items can be added.</p>}
          {added.length === 0 && ownerConnected.length === 0 && published && (
            <p className="rounded-lg border border-dashed border-border-default px-3 py-2.5 text-sm text-text-subdued">No items yet.</p>
          )}
          <ul className="flex flex-col gap-2" aria-label="Items in this collaborative">
            {added.map((item) => {
              const title = itemName(item.itemKind, item.itemId)
              const canRemove = isOwner || item.addedById === persona.id
              return (
                <li key={item.id} className={ROW}>
                  <div className="min-w-0 flex-1">
                    <ItemLink kind={item.itemKind} id={item.itemId} title={title} />
                    <p className="mt-0.5 text-xs text-text-subdued">
                      Added by {item.addedById === persona.id ? 'you' : getPerson(item.addedById).name} · {VIA_LABEL[item.via]} · <time title={fullDateTime(item.at)}>{timeAgo(item.at, now)}</time>
                    </p>
                  </div>
                  {canRemove ? (
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${title}`} onClick={() => handleRemove(item.id, title)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <span className="text-xs text-text-subdued">Only the owner or the person who added it can remove it</span>
                  )}
                </li>
              )
            })}
            {ownerConnected.map((item) => (
              <li key={`${item.kind}:${item.id}`} className={ROW}>
                <div className="min-w-0 flex-1">
                  <ItemLink kind={item.kind} id={item.id} title={item.title} />
                  <p className="mt-0.5 text-xs text-text-subdued">Connected by the owner · changed in the collaborative’s editor</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waiting for approval</CardTitle>
          <p className="mt-1 text-sm text-text-subdued">Only the collaborative’s owner decides. Partners add items directly and don’t approve submissions.</p>
        </CardHeader>
        <CardContent className="p-5">
          {waiting.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-default px-3 py-2.5 text-sm text-text-subdued">Nothing is waiting.</p>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Submissions waiting for approval">
              {waiting.map((request) => (
                <li key={request.id} className={ROW}>
                  <div className="min-w-0 flex-1">
                    <ItemLink kind={request.itemKind ?? 'dataset'} id={request.itemId} title={actions.subjectName(request)} />
                    <p className="mt-0.5 text-xs text-text-subdued">
                      Submitted by {request.requesterId === persona.id ? 'you' : getPerson(request.requesterId).name} · <time title={fullDateTime(request.createdAt)}>{timeAgo(request.createdAt, now)}</time>
                    </p>
                  </div>
                  {ownerDecides ? (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => actions.approve(request)}>
                        Approve
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => actions.decline(request)}>
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-text-subdued">Waiting for {ownerName(access.owner)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners and followers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <h3 className="type-label text-text-subdued">Owner</h3>
            <p className="mt-1 text-sm text-text-default">{ownerName(access.owner)}</p>
            <h3 className="type-label mt-4 text-text-subdued">Partners</h3>
            {partnerNames.length === 0 ? (
              <p className="mt-1 text-sm text-text-subdued">No partners yet.</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1 text-sm text-text-default">
                {partnerNames.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-text-subdued">Partners add items directly once the collaborative is published.</p>
          </div>
          <div>
            <h3 className="type-label text-text-subdued">Who can submit items</h3>
            <p className="mt-1 text-sm text-text-default">{access.submit === 'anyone' ? 'Anyone signed in, with the owner’s approval' : 'Only partners'}</p>
            <h3 className="type-label mt-4 text-text-subdued">Followers</h3>
            <p className="mt-1 text-sm text-text-default">{followers} {followers === 1 ? 'follower gets' : 'followers get'} one summary a day.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { CollaborativeItemsPage }
