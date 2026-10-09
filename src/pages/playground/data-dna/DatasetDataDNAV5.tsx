import {
  BarChart3,
  Building2,
  CalendarDays,
  Dna,
  FileStack,
  FileType2,
  Globe2,
  Layers,
  MapPin,
  Scale,
  Table2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import datasetDnaIllustration from '@/assets/data-dna/dataset-dna-card.png'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useDataDNAModel, type DNAFact } from '@/components/dataset/consumer/data-dna/use-data-dna'

/** The card's surfaces, all existing tokens: workspace light blue for the story, a soft lavender (chart-7 tint) for the
 *  supporting and context cards, white for usage and provenance. */
const LAVENDER = 'bg-chart-7/10'
const WHITE = 'bg-card'
const CARD = 'min-w-0 rounded-2xl'

/** An icon on a round orange accent disc, with the icon itself a blue outline (supporting metrics). */
function OrangeDisc({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent">
      <Icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
    </span>
  )
}

/** The controlled orange accent: an orange outline icon on a small, light (30%) orange disc (usage and provenance). */
function SoftDisc({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/30">
      <Icon className="size-4 text-text-accent-strong" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}

/** Value above label, the pattern used across the card. */
function ValueLabel({
  value,
  label,
  valueClass = 'type-heading-3',
}: {
  value: string
  label: string
  valueClass?: string
}) {
  return (
    <div className="min-w-0">
      <p className={cn(valueClass, 'break-words text-text-brand')}>{value}</p>
      <p className="type-caption text-text-subdued">{label}</p>
    </div>
  )
}

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}
const present = <T,>(r: T | null): r is T => r !== null
const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)

/** Data DNA — Version 5 (KPI cards), kept for comparison in the playground; Dataset Details now ships Version 6.1. It holds the dataset title, the profile's
 *  own Download, and the story, volume, metrics, context, usage and provenance cards. Back, Download dataset, Share and the
 *  Overview / Data / Visualisations tabs belong to the page around it. Every value is read or counted from the dataset and the
 *  published records connected to it (see `use-data-dna`); nothing is invented, and fields the model lacks are simply left out. */
function DatasetDataDNAV5({ datasetId }: { datasetId: string }) {
  const toast = useToast()
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  const records = fact(model.stats, 'records')
  const size = fact(model.stats, 'size')
  const resources = fact(model.characteristics, 'resources')
  const formats = fact(model.characteristics, 'formats')
  const charts = model.relations.find((r) => r.kind === 'visualisations')

  // Records is the record count; when no file reports one, file size stands in and is labelled as what it is.
  const volume = records?.available
    ? { value: records.value, label: 'Records' }
    : size?.available
      ? { value: size.value, label: 'File size' }
      : null

  const metrics: Row[] = [
    resources?.available ? { id: 'files', label: 'Data files', value: resources.value, icon: FileStack } : null,
    formats?.available
      ? { id: 'types', label: 'File types', value: formats.value.split(', ').join(' · '), icon: FileType2 }
      : null,
    charts
      ? {
          id: 'vis',
          label: charts.items.length === 1 ? 'Visualisation' : 'Visualisations',
          value: String(charts.items.length),
          icon: BarChart3,
        }
      : null,
  ].filter(present)

  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography ? { id: 'geography', label: 'Geography', value: model.geography, icon: MapPin } : null,
  ].filter(present)

  // Events are not part of Data DNA.
  const usage = model.relations.filter((r) => r.kind !== 'events')
  const usageLabel = {
    'use-cases': 'Use Case',
    collaboratives: 'Collaboratives',
    visualisations: 'Visualization',
  } as Record<string, string>
  const usageIcon = { 'use-cases': Layers, collaboratives: Users, visualisations: BarChart3 } as Record<
    string,
    LucideIcon
  >

  const licence = fact(model.provenance, 'licence')
  const source = fact(model.provenance, 'source')
  const provenance: Row[] = [
    { id: 'publisher', label: 'Publisher', value: model.publisher, icon: Building2 },
    licence?.available ? { id: 'licence', label: 'License', value: licence.value, icon: Scale } : null,
    source?.available ? { id: 'source', label: 'Source', value: source.value, icon: Globe2 } : null,
    { id: 'updated', label: 'Last Updated', value: model.updated, icon: CalendarDays },
  ].filter(present)

  return (
    <article
      aria-label="Data DNA"
      className="flex min-h-0 flex-col gap-5 rounded-3xl bg-page-background p-5 text-primary sm:p-6"
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

      {/* Top block: story (6) · volume + downloads (3) · three supporting metrics (3). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          aria-labelledby="dna5-story-heading"
          className={cn(
            CARD,
            'relative flex min-h-[220px] lg:min-h-[280px] flex-col overflow-hidden bg-workspace-hero-to p-6 sm:p-8 lg:col-span-6',
          )}
        >
          <h2 id="dna5-story-heading" className="text-xs font-semibold uppercase tracking-wide text-text-brand/80">
            What this data tells us
          </h2>
          <p className="type-display-2 mt-3 line-clamp-5 text-text-brand sm:max-w-[20ch]">
            {model.story || 'No description has been provided.'}
          </p>
          <p className="type-caption mt-auto pt-4 text-text-brand/70">From the dataset description</p>
          {/* The Data DNA illustration (source: visuals/data-dna-cards), lower right; hidden on phones where the story needs the width. */}
          <img
            src={datasetDnaIllustration}
            alt=""
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute bottom-3 right-4 hidden h-32 w-auto object-contain sm:block"
          />
        </section>

        <section aria-label="Volume and downloads" className={cn(CARD, WHITE, 'flex flex-col p-6 lg:col-span-3')}>
          {volume && (
            <div className="flex flex-1 flex-col">
              <Table2 className="size-10 text-primary/80" strokeWidth={1.25} aria-hidden="true" />
              {/* Pushed down so Records sits just above the divider, level in spacing with Downloads beneath it. */}
              <div className="mt-auto">
                <ValueLabel value={volume.value} label={volume.label} valueClass="type-display-2" />
              </div>
            </div>
          )}
          <div className="mt-4 border-t border-border-default pt-4">
            <ValueLabel
              value={model.record.downloadCount.toLocaleString()}
              label="Downloads"
              valueClass="type-heading-1"
            />
          </div>
        </section>

        <ul
          aria-label="At a glance"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1 lg:grid-rows-3"
        >
          {metrics.map(({ id, label, value, icon }) => (
            <li key={id} className={cn(CARD, LAVENDER, 'flex items-center gap-4 p-4')}>
              <OrangeDisc icon={icon} />
              <ValueLabel value={value} label={label} />
            </li>
          ))}
        </ul>
      </div>

      {/* Context (lavender, two items split by a divider) beside Where this data is used (white, three sections). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section aria-labelledby="dna5-context-heading" className={cn(CARD, LAVENDER, 'p-6 lg:col-span-6')}>
          <h2 id="dna5-context-heading" className="sr-only">
            Context
          </h2>
          <dl className="grid h-full grid-cols-2 items-center divide-x divide-border-default">
            {context.map(({ id, label, value, icon: Icon }) => (
              <div key={id} className="flex min-w-0 items-center gap-3 px-4 first:pl-0 last:pr-0">
                <Icon className="size-8 shrink-0 text-primary/80" strokeWidth={1.25} aria-hidden="true" />
                <div className="min-w-0">
                  <dd className="type-heading-3 truncate text-text-brand">{value}</dd>
                  <dt className="type-caption text-text-subdued">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="dna5-used-heading" className={cn(CARD, WHITE, 'p-6 lg:col-span-6 lg:p-4 xl:p-6')}>
          <h2 id="dna5-used-heading" className="sr-only">
            Where this data is used
          </h2>
          <ul className="grid grid-cols-1 divide-y divide-border-default sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {usage.map((relation) => {
              const count = relation.items.length
              const Icon = usageIcon[relation.kind]
              const body = (
                <div className="flex min-w-0 items-center gap-2 px-3 py-2 sm:py-0 lg:px-2 xl:gap-3 xl:px-4">
                  <SoftDisc icon={Icon} />
                  <div className="min-w-0">
                    <p className="type-heading-1 leading-none text-text-brand">{count}</p>
                    <p className="type-caption mt-1 text-text-subdued">{usageLabel[relation.kind]}</p>
                  </div>
                </div>
              )
              return (
                <li key={relation.kind} className="min-w-0 first:[&>*]:pl-0 last:[&>*]:pr-0">
                  {count > 0 ? (
                    <Link
                      to={relation.listingHref}
                      aria-label={`${usageLabel[relation.kind]}: ${count} connected. See all connected to this dataset`}
                      className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div aria-label={`${usageLabel[relation.kind]}: none connected`}>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section aria-label="Provenance and trust" className={cn(CARD, WHITE, 'p-6')}>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {provenance.map(({ id, label, value, icon }) => (
            <li key={id} className="flex min-w-0 items-center gap-3">
              <SoftDisc icon={icon} />
              <ValueLabel value={value} label={label} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

export { DatasetDataDNAV5 }
