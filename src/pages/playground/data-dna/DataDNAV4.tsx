import {
  ArrowLeft,
  BarChart3,
  Building2,
  Dna,
  Download,
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
import { DataDNATrust } from '@/pages/playground/data-dna/DataDNACards'
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
const LABEL = 'text-xs font-semibold uppercase tracking-wide'
/** Every icon in the card is a small, thin-stroke outline in the tinted primary. */
const ICON = 'size-5 shrink-0 text-primary/70'

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}
const present = (r: Row | null): r is Row => r !== null

/** Hero — the storytelling panel: workspace light blue, the story in Display 2, a restrained DNA mark, and one small orange bar
 *  (the only use of the accent). */
function Hero({ story }: { story: string }) {
  return (
    <section
      aria-labelledby="dna4-story-heading"
      className="relative flex min-h-[220px] min-w-0 flex-col overflow-hidden rounded-2xl bg-workspace-hero-to p-6 sm:p-8"
    >
      <span aria-hidden="true" className="h-1 w-10 rounded-full bg-accent" />
      <h2 id="dna4-story-heading" className={cn(LABEL, 'mt-4 text-text-brand/80')}>
        What this data tells us
      </h2>
      <p className="type-display-2 mt-3 line-clamp-4 max-w-[34ch] text-text-brand">
        {story || 'No description has been provided.'}
      </p>
      <p className="type-caption mt-auto pt-4 text-text-brand/70">From the dataset description</p>
      <Dna
        className="pointer-events-none absolute -bottom-10 -right-6 size-48 text-primary/10"
        strokeWidth={0.75}
        aria-hidden="true"
      />
    </section>
  )
}

/** Scale — the compact companion to the hero: just the number, its unit and one small icon. */
function VolumePanel({ value, unit }: { value: string; unit: string }) {
  return (
    <section
      aria-label={`Volume: ${value} ${unit.toLowerCase()}`}
      className="relative flex min-w-0 flex-col justify-center rounded-2xl border border-border-default bg-card p-6"
    >
      <Table2 className={cn(ICON, 'absolute right-5 top-5')} strokeWidth={1.5} aria-hidden="true" />
      <p className="type-display-2 truncate text-text-brand">{value}</p>
      <p className="type-caption text-text-subdued">{unit}</p>
    </section>
  )
}

/** Characteristics — one horizontal group: small icon beside the value (or formats), the label beneath it. No boxes around the
 *  items; only a hairline above and below the group. */
function Characteristics({ rows }: { rows: Row[] }) {
  return (
    <section aria-label="At a glance" className="border-y border-border-default py-5">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ id, label, value, icon: Icon }) => (
          <li key={id} className="flex min-w-0 items-center gap-3">
            <Icon className={ICON} strokeWidth={1.5} aria-hidden="true" />
            <div className="min-w-0">
              <p className="type-heading-3 break-words text-text-brand">{value}</p>
              <p className="type-caption text-text-subdued">{label}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Context — three clean blocks in one open section: a small icon, the label, and the value as the stronger line. */
function Context({ rows }: { rows: Row[] }) {
  return (
    <section aria-labelledby="dna4-context-heading">
      <h2 id="dna4-context-heading" className={cn(LABEL, 'text-text-subdued')}>
        Context
      </h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
        {rows.map(({ id, label, value, icon: Icon }) => (
          <div key={id} className="flex min-w-0 flex-col gap-1">
            <Icon className="size-4 text-primary/70" strokeWidth={1.5} aria-hidden="true" />
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

/** One zone of the usage panel. Connected: icon, count, type and up to two linked titles (the first plus "+N more" beyond two).
 *  Visualisations carries the soft blue tint; the rest stay neutral. Nothing connected: quiet text only, no number, no link. */
function UsageZone({ relation, showItems }: { relation: DNARelation; showItems: boolean }) {
  const Icon = RELATION_ICONS[relation.kind]
  const count = relation.items.length
  if (count === 0) {
    return (
      <div className="flex min-w-0 flex-col gap-0.5 p-4">
        <p className="type-label flex items-center gap-2 text-text-subdued">
          <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          {relation.label}
        </p>
        <p className="type-caption text-text-subdued">No {relation.label.toLowerCase()} connected</p>
      </div>
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
    <div
      className={cn(
        'relative flex min-w-0 flex-col gap-1 rounded-xl p-4',
        relation.kind === 'visualisations' ? 'bg-chart-1/15' : 'bg-card',
      )}
    >
      <p className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary/70" strokeWidth={1.5} aria-hidden="true" />
        <span className="type-heading-1 leading-none text-text-brand">{count}</span>
        <span className="type-label text-text-default">{relation.label}</span>
      </p>
      {showItems && (
        <ul className="relative z-10 flex min-w-0 flex-col">
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
    </div>
  )
}

/** Data DNA — Version 4: a single composition read as story → scale → characteristics → context → usage → trust. The dataset
 *  title and the card's own Download sit at the top of the card; Back, Download dataset and Share stay outside it. Prototype only. */
function DataDNAV4({
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

  // Volume is the record count; when no file reports one, file size stands in and the unit says so.
  const volume = records?.available
    ? { value: records.value, unit: 'Records' }
    : size?.available
      ? { value: size.value, unit: 'File size' }
      : null
  const glance: Row[] = [
    resources?.available ? { id: 'files', label: 'Data files', value: resources.value, icon: FileStack } : null,
    // The dataset's own download counter — read from the record, not invented.
    { id: 'downloads', label: 'Downloads', value: model.record.downloadCount.toLocaleString(), icon: Download },
    formats?.available
      ? { id: 'types', label: 'File types', value: formats.value.split(', ').join(' · '), icon: FileType2 }
      : null,
    charts
      ? { id: 'visualisations', label: 'Visualisations', value: String(charts.items.length), icon: BarChart3 }
      : null,
  ].filter(present)
  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography ? { id: 'geography', label: 'Geography', value: model.geography, icon: MapPin } : null,
    { id: 'publisher', label: 'Publisher', value: model.publisher, icon: Building2 },
  ].filter(present)

  // Events are not part of Data DNA. If nothing is connected at all, still show the quiet "none connected" zones.
  const withoutEvents = model.relations.filter((r) => r.kind !== 'events')
  const connected = visibleRelations(model.relations, density).filter((r) => r.kind !== 'events')
  const relations = connected.length > 0 ? connected : withoutEvents

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
    <div className={cn('flex flex-col gap-8', minHeightClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        <DatasetActions title={model.title} />
      </div>

      <article
        aria-label="Data DNA"
        className="flex min-h-0 flex-col gap-6 rounded-2xl border border-border-default bg-card p-5 text-primary sm:p-6 md:flex-1"
      >
        <header className="flex items-start justify-between gap-4">
          <h1 className="type-heading-1 min-w-0 break-words text-text-brand lg:max-w-[70%]">{model.title}</h1>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-primary"
            aria-label="Download Data DNA"
            onClick={() => toast({ title: 'Prototype', description: 'Data DNA downloads are not wired up yet.' })}
          >
            <Dna className="size-4" aria-hidden="true" />
            Download
          </Button>
        </header>

        {/* Story and scale: the hero takes two thirds, the compact Volume panel the rest. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="grid lg:col-span-8">
            <Hero story={model.story} />
          </div>
          {volume && (
            <div className="grid lg:col-span-4">
              <VolumePanel value={volume.value} unit={volume.unit} />
            </div>
          )}
        </div>

        <Characteristics rows={glance} />
        <Context rows={context} />

        {relations.length > 0 && (
          <section
            aria-labelledby="dna4-used-heading"
            className="flex min-w-0 flex-col rounded-2xl bg-page-background p-5 sm:p-6"
          >
            <h2 id="dna4-used-heading" className={cn(LABEL, 'text-text-brand')}>
              Where this data is used
            </h2>
            <p className="type-caption text-text-subdued">The content in CivicDataSpace that builds on it.</p>
            <div role="list" aria-label="Connected content" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {relations.map((relation) => (
                <div role="listitem" key={relation.kind} className="grid min-w-0">
                  <UsageZone relation={relation} showItems={density === 'rich'} />
                </div>
              ))}
            </div>
          </section>
        )}

        {trust.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 px-6 py-4">
            <h2 className={cn(LABEL, 'text-text-subdued')}>Provenance &amp; trust</h2>
            <DataDNATrust facts={trust} missing={missing} columns="lg:grid-cols-3" bare />
          </div>
        )}
      </article>

      <ViewTabs
        items={TABS}
        value="overview"
        onChange={() => {}}
        idPrefix="data-dna-v4-demo"
        label="Dataset views (demo)"
      />
    </div>
  )
}

export { DataDNAV4 }
