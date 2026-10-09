import type { ReactNode } from 'react'
import { Dna, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { DNA_BLOCK_BASE, DNA_TONES, type DNATone } from '@/pages/playground/data-dna/data-dna-constants'
import { RELATION_ICONS, type DNAFact, type DNARelation } from '@/components/dataset/consumer/data-dna/use-data-dna'

/** The blocks inside the Data DNA hero card. They all share one frame (`DNABlock`); sizes come from the grid the card puts
 *  them in, never from a per-block height. */

function DNABlock({ tone, className, children }: { tone: DNATone; className?: string; children: ReactNode }) {
  return <div className={cn(DNA_BLOCK_BASE, DNA_TONES[tone], className)}>{children}</div>
}

function Overline({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-subdued">
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </p>
  )
}

/** The strongest element: the dataset's one-sentence story, in Display 2, on a soft blue tint. */
function DataDNAStory({ story }: { story: string }) {
  return (
    <DNABlock tone="story" className="p-6">
      <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-subdued">
        <Dna className="size-3.5 shrink-0" aria-hidden="true" />
        What this data tells us
      </h2>
      <p className="type-display-2 mt-3 line-clamp-4 text-text-brand">{story || 'No description has been provided.'}</p>
      <p className="type-caption mt-auto pt-3 text-text-subdued">From the dataset description</p>
      <Dna
        className="pointer-events-none absolute -bottom-6 -right-4 size-40 text-primary/10"
        strokeWidth={1}
        aria-hidden="true"
      />
    </DNABlock>
  )
}

/** A compact relevance signal: one value with a label and, optionally, one short supporting line. */
function DataDNASignal({ fact }: { fact: DNAFact }) {
  const Icon = fact.icon
  return (
    <DNABlock tone="plain">
      <Overline>{fact.overline}</Overline>
      <Icon className="absolute right-3 top-3 size-5 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
      <p className="type-heading-1 mt-1 truncate text-text-brand" title={fact.value}>
        {fact.value}
      </p>
      {fact.support && <p className="type-caption mt-auto truncate text-text-subdued">{fact.support}</p>}
    </DNABlock>
  )
}

/** Where the dataset is used. Connected: a tinted card with the count, up to two linked titles (or the first plus "+N more")
 *  and the whole card opening that type's listing. Nothing connected: a quiet muted card with plain words and no link. */
function DataDNARelationship({ relation, showItems }: { relation: DNARelation; showItems: boolean }) {
  const Icon = RELATION_ICONS[relation.kind]
  const count = relation.items.length

  if (count === 0) {
    return (
      <DNABlock tone="muted">
        <Overline icon={Icon}>{relation.label}</Overline>
        <p className="type-caption mt-auto text-text-subdued">No {relation.label.toLowerCase()} connected</p>
      </DNABlock>
    )
  }

  const lines =
    count <= 2
      ? relation.items.map((item) => ({ key: item.id, text: item.title, href: item.href }))
      : [
          { key: relation.items[0].id, text: relation.items[0].title, href: relation.items[0].href },
          { key: 'more', text: `+${count - 1} more`, href: undefined },
        ]
  return (
    <DNABlock tone={relation.kind} className="transition-shadow hover:shadow-md">
      <Overline icon={Icon}>{relation.label}</Overline>
      <p className="mt-1 flex items-baseline gap-2 text-text-brand">
        <span className="type-display-2">{count}</span>
        <span className="type-caption text-text-subdued">connected</span>
      </p>
      {showItems && (
        <ul className="relative z-10 mt-auto flex min-w-0 flex-col pt-1">
          {lines.map((line) => (
            <li key={line.key} className="min-w-0">
              {line.href ? (
                <Link
                  to={line.href}
                  title={line.text}
                  className="type-caption block truncate text-text-default underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  {line.text}
                </Link>
              ) : (
                <span className="type-caption block truncate text-text-subdued">{line.text}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <Link
        to={relation.listingHref}
        aria-label={`${relation.label}: ${count} connected. See all ${relation.label.toLowerCase()} connected to this dataset`}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      />
    </DNABlock>
  )
}

/** Provenance, kept visually secondary: one quiet strip of label/value pairs (no cards, no tints). */
function DataDNATrust({
  facts,
  missing,
  columns = 'lg:grid-cols-4',
  bare,
}: {
  facts: DNAFact[]
  missing: string[]
  columns?: string
  /** Drops the strip's own top divider when the caller draws one. */
  bare?: boolean
}) {
  return (
    <section
      aria-label="Provenance and trust"
      className={cn('flex flex-col gap-1.5', !bare && 'border-t border-border-default pt-4')}
    >
      <dl className={cn('grid grid-cols-2 gap-x-6 gap-y-3', columns)}>
        {facts.map((fact) => {
          const Icon = fact.icon
          return (
            <div key={fact.id} className="flex min-w-0 items-start gap-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <dt className="type-caption text-text-subdued">{fact.overline}</dt>
                <dd className="type-label truncate text-text-default" title={fact.value}>
                  {fact.value}
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
      {missing.length > 0 && (
        <p className="type-caption text-text-subdued">Not recorded for this dataset: {missing.join(', ')}.</p>
      )}
    </section>
  )
}

export { DNABlock, DataDNAStory, DataDNASignal, DataDNARelationship, DataDNATrust }
