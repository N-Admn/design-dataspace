import * as React from 'react'
import { Users2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { ContentNameCell } from '@/components/shared/ContentNameCell'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { collaborativeRole } from '@/lib/notification-model'

/** One collaborative the signed-in person has put something into, with what and when. */
interface ContributedCollaborative {
  id: string
  name: string
  datasets: number
  useCases: number
  lastAt: number
  /** How the person stands with the collaborative: they may own it, be a partner, or only have contributed. */
  role: 'Owner' | 'Partner' | 'Contributor'
}

const ROLE_LABEL = { owner: 'Owner', partner: 'Partner', none: 'Contributor' } as const

const formatDate = (at: number) => new Date(at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const count = (n: number) => (n > 0 ? String(n) : '—')

/** My Contributions: the collaboratives the person has contributed to. They are not necessarily collaboratives they own or manage;
 *  each opens on its public page, where the "My contributions" chip narrows it to their own items. Editing stays with the item itself,
 *  in the workspace that owns it. What is still waiting for approval, or was declined, lives in Notifications & Requests. */
function MyContributionsPage() {
  const { collaboratives } = useAppData()
  const { persona, state, collaborativeName, collaborativeInfo } = useNotifications()

  const rows = React.useMemo<ContributedCollaborative[]>(() => {
    const byCollaborative = new Map<string, ContributedCollaborative>()
    for (const item of state.collabItems) {
      if (item.addedById !== persona.id) continue
      // Only published collaboratives can be opened; a withdrawn or deleted one has no page to go to.
      if (!collaboratives.some((c) => c.id === item.collaborativeId && c.status === 'published')) continue
      const { access, published } = collaborativeInfo(item.collaborativeId)
      const row =
        byCollaborative.get(item.collaborativeId) ??
        { id: item.collaborativeId, name: collaborativeName(item.collaborativeId), datasets: 0, useCases: 0, lastAt: 0, role: ROLE_LABEL[collaborativeRole(persona.id, access, published)] }
      if (item.itemKind === 'dataset') row.datasets += 1
      if (item.itemKind === 'use-case') row.useCases += 1
      row.lastAt = Math.max(row.lastAt, item.at)
      byCollaborative.set(item.collaborativeId, row)
    }
    return [...byCollaborative.values()]
  }, [state.collabItems, persona.id, collaboratives, collaborativeInfo, collaborativeName])

  const columns: ManagementColumn<ContributedCollaborative>[] = [
    {
      key: 'name',
      label: 'Collaborative',
      sortable: true,
      compare: (a, b) => a.name.localeCompare(b.name),
      render: (c) => <ContentNameCell name={c.name} icon={Users2} liveHref={`/explore/collaboratives/${c.id}`} />,
    },
    {
      key: 'datasets',
      label: 'Datasets',
      widthRem: '6.875rem',
      sortable: true,
      compare: (a, b) => a.datasets - b.datasets,
      render: (c) => count(c.datasets),
    },
    {
      key: 'use-cases',
      label: 'Use Cases',
      widthRem: '6.875rem',
      sortable: true,
      compare: (a, b) => a.useCases - b.useCases,
      render: (c) => count(c.useCases),
    },
    {
      key: 'role',
      label: 'Your role',
      widthRem: '7.5rem',
      responsive: 'lg',
      optional: true,
      render: (c) => c.role,
    },
    {
      key: 'last',
      label: 'Last Contributed',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => a.lastAt - b.lastAt,
      render: (c) => formatDate(c.lastAt),
    },
  ]

  const getActions = (): ManagementRowAction<ContributedCollaborative>[] => []

  return (
    <ManagementTable<ContributedCollaborative, string>
      title="My Contributions"
      subtitle={(n) => (n === 1 ? 'You have contributed to 1 collaborative.' : `You have contributed to ${n} collaboratives.`)}
      items={rows}
      getId={(c) => c.id}
      columns={columns}
      defaultSortKey="last"
      defaultSortDirection="desc"
      viewTabs={{ items: [{ key: 'collaboratives', label: 'Collaboratives' }], value: 'collaboratives', onChange: () => {}, label: 'Contributions' }}
      searchPlaceholder="Search collaboratives..."
      searchMatch={(c, q) => c.name.toLowerCase().includes(q.trim().toLowerCase())}
      getActions={getActions}
      emptyTitle="No contributions yet"
      emptyDescription="Collaboratives you add items to will be listed here. Open any collaborative and choose Add item or Submit an item."
    />
  )
}

export { MyContributionsPage }
