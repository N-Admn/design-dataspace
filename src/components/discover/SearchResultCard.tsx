import { Calendar, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { RESOURCE_KIND_ICON } from '@/components/event/ResourceSearchField'
import { SEARCH_TYPE_LABEL, type SearchResultItem, type SearchResultType } from '@/lib/global-search'

const TYPE_ICON: Record<SearchResultType, LucideIcon> = {
  dataset: RESOURCE_KIND_ICON.dataset,
  'use-case': RESOURCE_KIND_ICON['use-case'],
  publication: RESOURCE_KIND_ICON.publication,
  collaborative: RESOURCE_KIND_ICON.collaborative,
  event: Calendar,
}

function SearchResultCard({ item }: { item: SearchResultItem }) {
  const Icon = TYPE_ICON[item.type]

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <Badge variant="secondary">{SEARCH_TYPE_LABEL[item.type]}</Badge>
      </div>
      <div className="mt-3 min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        {(item.organisation || item.meta) && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {[item.organisation, item.meta].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </>
  )

  const cardClass = 'flex flex-col rounded-lg border border-border bg-card p-4'

  if (!item.href) {
    return <div className={cardClass}>{body}</div>
  }

  return (
    <Link
      to={item.href}
      className={`${cardClass} transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {body}
    </Link>
  )
}

export { SearchResultCard }
