import { FileText, Pencil, Trash2 } from 'lucide-react'

import { ManagementTable, type ManagementColumn, type ManagementRowAction } from '@/components/shared/management-table/ManagementTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { formatShortDate, parseAppTimestamp } from '@/lib/format'

export interface OrganisationContentItem {
  id: string
  title: string
  status: 'draft' | 'published'
  updatedAt: string
  /** Absent for records saved before organisation attribution existed. */
  createdBy?: string
}

interface OrganisationContentTableProps<T extends OrganisationContentItem> {
  title: string
  /** Label for the primary (name) column, e.g. "Dataset" or "Use Case". */
  primaryColumnLabel: string
  subtitle: (count: number) => string
  addLabel: string
  onAdd?: () => void
  items: T[]
  onOpen: (item: T) => void
  onDelete?: (item: T) => void
  emptyTitle: string
  emptyDescription: string
  searchPlaceholder: string
}

/** The single reusable table every Organisation Workspace content module
 * (Datasets, Use Cases, AI Models, Collaboratives, Charts, Events) renders
 * organisation-scoped records through — see Section 26: "prefer a generic
 * `ContentTable` ... over duplicated per-module table components." Each module
 * page normalizes its own record shape into `OrganisationContentItem` and hands
 * it here rather than this component knowing about six different form shapes. */
function OrganisationContentTable<T extends OrganisationContentItem>({
  title,
  primaryColumnLabel,
  subtitle,
  addLabel,
  onAdd,
  items,
  onOpen,
  onDelete,
  emptyTitle,
  emptyDescription,
  searchPlaceholder,
}: OrganisationContentTableProps<T>) {
  const columns: ManagementColumn<T>[] = [
    {
      key: 'title',
      label: primaryColumnLabel,
      sortable: true,
      compare: (a, b) => a.title.localeCompare(b.title),
      render: (item) => (
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="flex min-w-0 w-full items-center gap-2 text-left hover:text-text-brand"
        >
          <FileText className="size-4 shrink-0 text-text-subdued" />
          <TruncatedText className="min-w-0 flex-1 font-medium text-text-default">{item.title || 'Untitled'}</TruncatedText>
        </button>
      ),
    },
    {
      key: 'createdBy',
      label: 'Created by',
      widthRem: '10rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => (a.createdBy ?? '').localeCompare(b.createdBy ?? ''),
      render: (item) => item.createdBy ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      widthRem: '6.875rem',
      optional: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'updated',
      label: 'Last Updated',
      widthRem: '8.125rem',
      responsive: 'md',
      optional: true,
      sortable: true,
      compare: (a, b) => parseAppTimestamp(a.updatedAt).getTime() - parseAppTimestamp(b.updatedAt).getTime(),
      render: (item) => formatShortDate(item.updatedAt),
    },
  ]

  return (
    <ManagementTable<T, 'draft' | 'published'>
      title={title}
      subtitle={subtitle}
      addLabel={onAdd ? addLabel : undefined}
      onAdd={onAdd}
      items={items}
      getId={(item) => item.id}
      columns={columns}
      defaultSortKey="updated"
      defaultSortDirection="desc"
      statuses={[
        { key: 'draft', label: 'Draft' },
        { key: 'published', label: 'Published' },
      ]}
      getStatus={(item) => item.status}
      searchPlaceholder={searchPlaceholder}
      searchMatch={(item, query) => item.title.toLowerCase().includes(query.trim().toLowerCase())}
      getActions={(item) => {
        const actions: ManagementRowAction<T>[] = [
          { key: 'edit', icon: Pencil, label: () => `Edit ${item.title || 'item'}`, onClick: () => onOpen(item) },
        ]
        if (onDelete) {
          actions.push({
            key: 'delete',
            icon: Trash2,
            label: () => `Delete ${item.title || 'item'}`,
            onClick: () => onDelete(item),
            destructive: true,
          })
        }
        return actions
      }}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  )
}

export { OrganisationContentTable }
