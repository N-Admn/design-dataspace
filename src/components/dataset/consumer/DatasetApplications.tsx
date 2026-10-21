import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Network } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SearchResultCard } from '@/components/discover/SearchResultCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { useDataDNAModel, type RelationKind } from '@/components/dataset/consumer/data-dna/use-data-dna'
import { useContentCardItems } from '@/hooks/use-community'
import type { SearchResultType } from '@/lib/global-search'

/** Where the dataset is applied: the published use cases, collaboratives and events that draw on it, each as the Search page's own card.
 *  It reads the same relationships as the summary card's sentence ("supports 2 use cases, is part of 1 collaborative"), so the numbers
 *  there and the lists here always agree, and each part of that sentence links to its section here.
 *
 *  Publications are not listed: a publication carries no link to a dataset in the data model (it only belongs to an event). When
 *  publications can reference datasets, add a group for them here and in `use-data-dna.ts`. */

const GROUPS: { kind: Exclude<RelationKind, 'visualisations'>; title: string; intro: string; type: SearchResultType }[] = [
  { kind: 'use-cases', title: 'Use cases', intro: 'Stories that show how this data is used to answer a question or solve a problem.', type: 'use-case' },
  { kind: 'collaboratives', title: 'Collaboratives', intro: 'Initiatives that bring this dataset together with related resources, people and organisations.', type: 'collaborative' },
  { kind: 'events', title: 'Events', intro: 'Events where this dataset is shared as a related resource.', type: 'event' },
]

function DatasetApplications({ datasetId }: { datasetId: string }) {
  const model = useDataDNAModel(datasetId)
  const cards = useContentCardItems()
  const { hash } = useLocation()
  const [filter, setFilter] = React.useState<'all' | Exclude<RelationKind, 'visualisations'>>('all')

  // A link such as `?view=applications#collaboratives` (from the summary card) scrolls to that section once it has mounted.
  React.useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [hash, model])

  if (!model) return null
  const groups = GROUPS.map((g) => ({ ...g, items: model.relations.find((r) => r.kind === g.kind)?.items ?? [] })).filter((g) => g.items.length > 0)
  const shown = filter === 'all' ? groups : groups.filter((g) => g.kind === filter)
  const visualisations = model.relations.find((r) => r.kind === 'visualisations')?.items.length ?? 0

  return (
    <div className="py-6">
      <SectionHeader as="h2" title="Applications" description="Where this dataset is applied across CivicDataSpace: the published use cases, collaboratives and events that use it." />

      {/* The same chips as a collaborative's Explore section: All, then one for each kind that has something. */}
      {groups.length > 1 && (
        <div role="group" aria-label="Show" className="mt-4 flex flex-wrap gap-2">
          {[{ value: 'all' as const, label: 'All' }, ...groups.map((g) => ({ value: g.kind, label: g.title }))].map((chip) => {
            const active = filter === chip.value
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(chip.value)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-default text-text-default hover:border-primary/40 hover:text-text-brand',
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}

      {groups.length === 0 ? (
        <EmptyState className="mt-6" icon={Network} title="Not applied anywhere yet" description="No published use case, collaborative or event uses this dataset yet." />
      ) : (
        // The same rhythm as a collaborative's sections: wide gaps between them, a one-line description under each heading.
        <div className="mt-10 flex flex-col gap-14 lg:mt-12 lg:gap-16">
          {shown.map((group) => (
            <section key={group.kind} id={group.kind} aria-labelledby={`${group.kind}-heading`} className="scroll-mt-24">
              <h3 id={`${group.kind}-heading`} className="type-heading-2 text-text-brand">
                {group.title} <span className="font-normal text-text-subdued">· {group.items.length}</span>
              </h3>
              <p className="mb-6 mt-1 type-body text-text-subdued">{group.intro}</p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => {
                  const card = cards.get(`${group.type}:${item.id}`)
                  return (
                    <li key={item.id} className="min-w-0">
                      {card ? (
                        <SearchResultCard item={card} layout="grid" tintedMetadata />
                      ) : (
                        <Link to={item.href} className="block rounded-lg border border-border bg-card p-[18px] text-lg font-semibold hover:border-primary/40">
                          {item.title}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {visualisations > 0 && (
        <p className="type-body mt-10 text-text-subdued lg:mt-12">
          <BarChart3 className="mr-2 inline-block size-4 align-[-3px]" aria-hidden="true" />
          This dataset also powers {visualisations} {visualisations === 1 ? 'visualisation' : 'visualisations'}, shown under{' '}
          <Link to={`/explore/datasets/${datasetId}?view=visualisations`} className="font-medium text-text-brand underline underline-offset-2">
            Visualisations
          </Link>
          .
        </p>
      )}
    </div>
  )
}

export { DatasetApplications }
