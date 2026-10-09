import {
  ArrowLeft,
  BarChart3,
  Building2,
  Dna,
  FileStack,
  FileType2,
  Layers,
  MapPin,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ViewTabs } from '@/components/shared/ViewTabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { DatasetActions } from '@/components/dataset/consumer/DatasetActions'
import { DataDNAStory, DataDNATrust } from '@/pages/playground/data-dna/DataDNACards'
import type { Density } from '@/pages/playground/data-dna/data-dna-constants'
import {
  RELATION_ICONS,
  unavailableLabels,
  useDataDNAModel,
  visibleRelations,
  type DNAFact,
  type DNARelation,
} from '@/components/dataset/consumer/data-dna/use-data-dna'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
]

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}

const SECTION_HEADING = 'text-xs font-semibold uppercase tracking-wide text-text-subdued'

/** "At a glance": one clean list inside the card — label with its icon on the left, a restrained value on the right, hairline
 *  separators. No boxes around individual rows. */
export function GlanceList({ rows }: { rows: Row[] }) {
  return (
    <section aria-labelledby="dna3-glance-heading">
      <h2 id="dna3-glance-heading" className={SECTION_HEADING}>
        At a glance
      </h2>
      <dl className="mt-2 flex flex-col divide-y divide-border-default">
        {rows.map(({ id, label, value, icon: Icon }) => (
          <div key={id} className="flex min-w-0 items-center justify-between gap-4 py-2">
            <dt className="type-caption flex shrink-0 items-center gap-2 text-text-subdued">
              <Icon className="size-4 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
              {label}
            </dt>
            <dd className="type-label min-w-0 truncate text-right text-text-default" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** "Context": Sector, Geography and Publisher as three open blocks — icon, then label, then the value, which is the strongest of
 *  the three. Laid out in a row where there is room and reflowing to a column below. */
export function ContextRow({ rows }: { rows: Row[] }) {
  return (
    <section aria-labelledby="dna3-context-heading">
      <h2 id="dna3-context-heading" className={SECTION_HEADING}>
        Context
      </h2>
      <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
        {rows.map(({ id, label, value, icon: Icon }) => (
          <div key={id} className="flex min-w-0 flex-col gap-1">
            <Icon className="size-5 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
            <dt className="type-caption text-text-subdued">{label}</dt>
            <dd className="type-heading-3 min-w-0 truncate text-text-brand" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const TINT: Record<DNARelation['kind'], string> = {
  'use-cases': 'bg-accent/25',
  collaboratives: 'bg-chart-3/15',
  events: 'bg-chart-7/15',
  visualisations: 'bg-chart-1/15',
}

/** One of the four relationship sections inside the unified card: icon + count + label, then (when connected) up to two
 *  titles, or the first plus "+N more". Connected sections carry a soft tint chip behind the icon and open the listing;
 *  empty ones are plain text with no count shown as a number and no link. */
export function RelationSection({ relation, showItems }: { relation: DNARelation; showItems: boolean }) {
  const Icon = RELATION_ICONS[relation.kind]
  const count = relation.items.length
  const lines =
    count <= 2
      ? relation.items.map((item) => ({ key: item.id, text: item.title, href: item.href }))
      : [
          { key: relation.items[0].id, text: relation.items[0].title, href: relation.items[0].href },
          { key: 'more', text: `+${count - 1} more`, href: undefined },
        ]

  if (count === 0) {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <p className="type-label flex items-center gap-2 text-text-subdued">
          <Icon className="size-4 shrink-0 text-border-strong" strokeWidth={1.5} aria-hidden="true" />
          {relation.label}
        </p>
        <p className="type-caption text-text-subdued">No {relation.label.toLowerCase()} connected</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-w-0 flex-col gap-1">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg text-primary',
            TINT[relation.kind],
          )}
        >
          <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="type-heading-1 leading-none text-text-brand">{count}</p>
          <p className="type-label truncate text-text-default">{relation.label}</p>
        </div>
      </div>
      {showItems && (
        <ul className="relative z-10 flex min-w-0 flex-col pt-1">
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
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      />
    </div>
  )
}

/** Data DNA — Version 3: one card from top to bottom. The title and dataset actions open the card; the Data DNA download is a
 *  plain "Download" text action at the top right (its aria-label says what it downloads). Inside: the story (the one tinted
 *  block), a structured At a glance list beside an open Context row, one unified relationships card, and a quiet trust strip.
 *  Each fact still appears once. Prototype only. */
function DataDNAV3({
  datasetId,
  density,
  minHeightClass,
}: {
  datasetId: string
  density: Density
  minHeightClass?: string
}) {
  const toast = useToast()
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)
  const records = fact(model.stats, 'records')
  const size = fact(model.stats, 'size')
  const resources = fact(model.characteristics, 'resources')
  const formats = fact(model.characteristics, 'formats')
  const charts = model.relations.find((r) => r.kind === 'visualisations')

  const glance: Row[] = [
    records?.available
      ? { id: 'volume', label: 'Volume', value: records.value, icon: Table2 }
      : size?.available
        ? { id: 'size', label: 'File size', value: size.value, icon: Table2 }
        : null,
    resources?.available ? { id: 'files', label: 'Data files', value: resources.value, icon: FileStack } : null,
    formats?.available
      ? { id: 'types', label: 'File types', value: formats.value.split(', ').join(' · '), icon: FileType2 }
      : null,
    charts
      ? { id: 'visualisations', label: 'Visualisations', value: String(charts.items.length), icon: BarChart3 }
      : null,
  ].filter((r): r is Row => r !== null)

  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography ? { id: 'geography', label: 'Geography', value: model.geography, icon: MapPin } : null,
    { id: 'publisher', label: 'Publisher', value: model.publisher, icon: Building2 },
  ].filter((r): r is Row => r !== null)

  const relations = visibleRelations(model.relations, density)
  const trustIds = density === 'sparse' ? ['source', 'updated'] : ['source', 'updated', 'licence']
  const trust = model.provenance.filter((f) => f.available && trustIds.includes(f.id))
  const missing =
    density === 'rich'
      ? unavailableLabels({
          stats: [],
          headline: [],
          characteristics: [],
          provenance: model.provenance.filter((f) => ['source', 'licence'].includes(f.id)),
        })
      : []

  return (
    <div className={cn('flex flex-col gap-6', minHeightClass)}>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>

      <article
        aria-label="Data DNA"
        className="flex min-h-0 flex-col gap-5 rounded-2xl bg-page-background p-5 text-primary sm:p-6 md:flex-1"
      >
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <h1 className="type-heading-1 min-w-0 break-words text-text-brand lg:max-w-[60%]">{model.title}</h1>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <DatasetActions title={model.title} />
            {/* Quiet text action for the profile itself — nothing like the filled Download dataset button beside it. */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary"
              aria-label="Download the Data DNA profile"
              onClick={() => toast({ title: 'Prototype', description: 'Data DNA downloads are not wired up yet.' })}
            >
              <Dna className="size-4" aria-hidden="true" />
              Download
            </Button>
          </div>
        </header>

        <div className="grid md:flex-1">
          <DataDNAStory story={model.story} />
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-2">
          <GlanceList rows={glance} />
          <ContextRow rows={context} />
        </div>

        {relations.length > 0 && (
          <section aria-labelledby="dna3-used-heading" className="flex flex-col gap-2">
            <div>
              <h2 id="dna3-used-heading" className="type-heading-3 uppercase tracking-wide text-text-brand">
                Where this data is used
              </h2>
              <p className="type-caption text-text-subdued">The content in CivicDataSpace that builds on it.</p>
            </div>
            {/* One unified card; the four sections are separated by hairlines, not boxed individually. */}
            <div
              role="list"
              aria-label="Connected content"
              className="grid grid-cols-1 gap-5 rounded-xl border border-border-default bg-card p-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border-default [&>*]:lg:px-5 [&>*:first-child]:lg:pl-0 [&>*:last-child]:lg:pr-0"
            >
              {relations.map((relation) => (
                <div role="listitem" key={relation.kind} className="min-w-0">
                  <RelationSection relation={relation} showItems={density === 'rich'} />
                </div>
              ))}
            </div>
          </section>
        )}

        {trust.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className={SECTION_HEADING}>Provenance &amp; trust</h2>
            <DataDNATrust facts={trust} missing={missing} columns="lg:grid-cols-3" />
          </div>
        )}
      </article>

      <ViewTabs
        items={TABS}
        value="overview"
        onChange={() => {}}
        idPrefix="data-dna-v3-demo"
        label="Dataset views (demo)"
      />
    </div>
  )
}

export { DataDNAV3 }
