import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useOwnerEdit } from '@/hooks/use-owner-edit'
import { useRequestActions } from '@/components/notifications/RequestActions'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useAuth, useGoToSignIn } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationsContext'
import { collaborativeRole, canSubmit, isReadOnlyOnCollaborative, requestKindOf } from '@/lib/notification-model'
import { useGoBack } from '@/hooks/use-go-back'
import { buildCollaborativeDetail, type CollaborativeCredit } from '@/lib/collaborative-detail-data'
import { getPerson, ownerName } from '@/lib/notification-personas'
import { CollaborativeDetailView } from '@/pages/playground/collaborative-detail/CollaborativeDetailView'

/** The public Collaborative page (`/explore/collaboratives/:id`). Consumers only ever see the live **published** version, the same
 *  rule as the other Explore detail pages; content is read from the record and the published datasets and use cases it connects. */
function CollaborativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Back to wherever the reader came from; the Collaboratives search tab when the page was opened directly.
  const goBack = useGoBack('/search?type=collaborative')
  const toast = useToast()
  const { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications } = useAppData()
  const { isSignedIn } = useAuth()
  const goToSignIn = useGoToSignIn()
  const actions = useRequestActions()
  const { persona, state, follow, unfollow, collaborativeInfo, collaborativeName, itemName, itemOwner } = useNotifications()

  const record = id ? collaboratives.find((c) => c.id === id) : undefined
  // A collaborative's owner comes from its own access record, which can differ from the workspace it was made in.
  const onEdit = useOwnerEdit('collaborative', record, record ? collaborativeInfo(record.id).access.owner : undefined)

  // A decision on the reader's own submission that arrives while the page is open is announced once.
  const mySubmissions = state.requests.filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === id && r.requesterId === persona.id)
  const seen = React.useRef<Map<string, string>>(new Map())
  React.useEffect(() => {
    for (const r of mySubmissions) {
      const before = seen.current.get(r.id)
      seen.current.set(r.id, r.status)
      if (before === 'waiting' && (r.status === 'approved' || r.status === 'declined')) {
        toast({ title: r.status === 'approved' ? 'Your submission was approved' : 'Your submission was declined', description: `${itemName(r.itemKind, r.itemId)} · ${collaborativeName(id ?? '')}` })
      }
    }
  }, [mySubmissions, toast, itemName, collaborativeName, id])
  // Credit: who added each item, and the owners of every item, listed as contributors. All read from the same store as the rest.
  const credit = React.useMemo<CollaborativeCredit | undefined>(() => {
    if (!record) return undefined
    const { access } = collaborativeInfo(record.id)
    const form = record.publishedForm
    const flowItems = state.collabItems.filter((i) => i.collaborativeId === record.id).sort((a, b) => b.at - a.at)
    const ownerConnected = [
      ...(form?.connections.datasets ?? []).map((d) => ({ kind: 'dataset' as const, id: d.id })),
      ...(form?.connections.useCases ?? []).map((u) => ({ kind: 'use-case' as const, id: u.id })),
    ]
    const owners = new Map<string, { name: string; kind: 'person' | 'organisation' }>()
    for (const item of [...ownerConnected, ...flowItems.map((i) => ({ kind: i.itemKind, id: i.itemId }))]) {
      const owner = itemOwner(item.kind, item.id)
      if (owner) owners.set(ownerName(owner), { name: ownerName(owner), kind: owner.kind === 'org' ? 'organisation' : 'person' })
    }
    return {
      defaultAddedBy: ownerName(access.owner),
      items: flowItems.map((i) => ({ kind: i.itemKind, id: i.itemId, addedBy: getPerson(i.addedById).name })),
      contributors: [...owners.values()],
    }
  }, [record, state.collabItems, collaborativeInfo, itemOwner])

  const data = React.useMemo(
    () => (record ? buildCollaborativeDetail(record, { datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications }, credit) : null),
    [record, credit, datasets, useCases, collaboratives, events, aiModels, organisationWorkspaces, charts, publications],
  )

  if (!record || !data) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-24 text-center">
        <EmptyState title="Collaborative not found" description="This Collaborative may have been unpublished or does not exist." />
        <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    )
  }

  const { access, published } = collaborativeInfo(record.id)
  const role = isSignedIn ? collaborativeRole(persona.id, access, published) : 'none'
  const following = (state.follows[record.id] ?? []).includes(persona.id)
  const name = record.form.metadata.name

  // The reader's own items here, for the "My contributions" chip: what they added themselves, plus what they connected as the owner.
  const mine = isSignedIn
    ? {
        datasets: [
          ...state.collabItems.filter((i) => i.collaborativeId === record.id && i.addedById === persona.id && i.itemKind === 'dataset').map((i) => i.itemId),
          ...(role === 'owner' ? (record.publishedForm?.connections.datasets ?? []).map((d) => d.id) : []),
        ],
        useCases: [
          ...state.collabItems.filter((i) => i.collaborativeId === record.id && i.addedById === persona.id && i.itemKind === 'use-case').map((i) => i.itemId),
          ...(role === 'owner' ? (record.publishedForm?.connections.useCases ?? []).map((u) => u.id) : []),
        ],
      }
    : undefined

  // Contribute adapts to who is reading: owners and partners add straight away, everyone else submits for the owner's approval, and a
  // signed-out reader is sent to sign in first.
  const cta = !isSignedIn
    ? { tagline: 'Want to contribute to this collaborative?', label: 'Contribute', onClick: goToSignIn }
    : role !== 'none'
      ? { tagline: 'Want to contribute to this collaborative?', label: 'Add item', onClick: () => actions.openPicker(record.id, 'add') }
      : {
          tagline: 'Want to contribute to this collaborative?',
          label: 'Submit an item',
          onClick: canSubmit(persona.id, access, published)
            ? () => actions.openPicker(record.id, 'submit')
            : () =>
                isReadOnlyOnCollaborative(persona.id, access)
                  ? toast({ title: 'Evaluators can’t contribute', description: 'As an Evaluator you can read this collaborative, not add to it.' })
                  : toast({ title: 'Only partners can add items', description: 'The owner has limited this collaborative to its partners.' }),
        }

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2">
      <CollaborativeDetailView
        data={data}
        hideEmptySections
        unifiedSearch
        mine={mine}
        onEdit={onEdit}
        onBack={goBack}
        follow={{
          following,
          label: `Follow ${name}`,
          onToggle: () => {
            if (!isSignedIn) return goToSignIn()
            if (following) {
              unfollow(persona.id, record.id)
              toast({ title: 'Unfollowed', description: `You will no longer get updates from ${name}.` })
            } else {
              follow(persona.id, record.id)
              toast({ title: `Following ${name}`, description: 'You are notified when new public content is added or the collaborative changes.' })
            }
          },
        }}
        cta={cta}
        onOpenResource={(resource) => resource.href && navigate(resource.href)}
      />
    </div>
  )
}

export { CollaborativeDetailPage }
