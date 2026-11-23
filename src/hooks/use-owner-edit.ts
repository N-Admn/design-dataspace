import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationsContext'
import { canEditAsOwner, ownerOfWorkspaceItem } from '@/lib/notification-model'
import type { OwnerContext } from '@/types/notifications'

export type EditableKind = 'use-case' | 'ai-model' | 'publication' | 'event' | 'collaborative'

/** Where each kind is edited. They all open the same creation page that the workspace lists use, so editing from a public page is the
 *  same editing as from the workspace. `returnKey` is the name that kind's creation page uses for "where to go back to" when it was
 *  opened from an organisation workspace. */
const TARGET: Record<EditableKind, { path: string; idKey: string; orgSegment: string; returnKey: string }> = {
  'use-case': { path: '/dashboard/use-cases/new', idKey: 'useCaseId', orgSegment: 'use-cases', returnKey: 'organisationReturnTo' },
  'ai-model': { path: '/dashboard/ai-models/new', idKey: 'aiModelId', orgSegment: 'ai-models', returnKey: 'returnTo' },
  publication: { path: '/dashboard/publications/new', idKey: 'publicationId', orgSegment: 'publications', returnKey: 'returnTo' },
  event: { path: '/dashboard/events/new', idKey: 'eventId', orgSegment: 'events', returnKey: 'returnTo' },
  collaborative: { path: '/dashboard/collaboratives/new', idKey: 'collaborativeId', orgSegment: 'collaboratives', returnKey: 'returnTo' },
}

/** The Edit action for an item on its public page: a function for the owner (the person it belongs to, or the admins and editors of the
 *  owning organisation), and `undefined` for everyone else, including a visitor. It always opens the original item in the workspace that
 *  owns it; seeing the item from a collaborative or search changes nothing about who can edit it. */
export function useOwnerEdit(kind: EditableKind, record: { id: string; organisationId?: string } | undefined, owner?: OwnerContext | null): (() => void) | undefined {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const { persona } = useNotifications()
  if (!record || !isSignedIn) return undefined
  const resolved = owner ?? ownerOfWorkspaceItem(record.organisationId)
  if (!canEditAsOwner(persona.id, resolved)) return undefined
  const target = TARGET[kind]
  return () =>
    navigate(target.path, {
      state: {
        [target.idKey]: record.id,
        initialStep: 1,
        ...(record.organisationId ? { organisationId: record.organisationId, [target.returnKey]: `/organisations/${record.organisationId}/${target.orgSegment}` } : {}),
      },
    })
}
