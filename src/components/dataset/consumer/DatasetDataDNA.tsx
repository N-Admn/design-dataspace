import {
  BarChart3,
  Building2,
  CalendarDays,
  FileStack,
  Globe2,
  Layers,
  MapPin,
  Save,
  Scale,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import type * as React from 'react'
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

/** A sentence with its key value emphasised: strong navy, no larger than the text around it. */
function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-text-brand">{children}</strong>
}
const plural = (n: number | string, one: string, many = `${one}s`) => (String(n) === '1' ? one : many)
/** "CSV, XLSX, PDF, MD" → "CSV, XLSX, PDF and MD". */
const sayList = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}
const present = <T,>(r: T | null): r is T => r !== null
const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)

/** The dataset's Data DNA (Version 6.1): Version 6 with the facts consolidated into three statements (records + downloads, contents, usage) (icon → sentence, the key value
 *  emphasised inside it) instead of number-over-label KPIs. Provenance is unchanged. Every value is read or counted from the
 *  dataset and its connected records; nothing is invented. Shown at the top of Dataset Details; Back, Download dataset, Share and the tabs belong to the page around it. */
function DatasetDataDNA({ datasetId }: { datasetId: string }) {
  const toast = useToast()
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  const records = fact(model.stats, 'records')
  const size = fact(model.stats, 'size')
  const resources = fact(model.characteristics, 'resources')
  const formats = fact(model.characteristics, 'formats')
  const charts = model.relations.find((r) => r.kind === 'visualisations')

  // Three consolidated statements. Records is the record count; when no file reports one, the total file size is stated instead.
  const filesCount = resources?.available ? resources.value : null
  const formatList = formats?.available ? formats.value.split(', ') : []
  const visCount = charts?.items.length ?? 0
  const downloads = model.record.downloadCount
  const volumeSentence = (
    <>
      {records?.available ? (
        <>
          This dataset contains <Em>{records.value}</Em> {plural(records.value.replace(/,/g, ''), 'record')}
        </>
      ) : size?.available ? (
        <>
          The data files total <Em>{size.value}</Em>
        </>
      ) : (
        <>This dataset</>
      )}{' '}
      {records?.available || !size?.available ? 'and has' : 'and have'} been downloaded{' '}
      <Em>{downloads.toLocaleString()}</Em> {plural(downloads, 'time')}.
    </>
  )
  const contentsSentence = (
    <>
      The dataset includes <Em>{filesCount ?? 0}</Em> data {plural(filesCount ?? 0, 'file')}
      {formatList.length > 0 && (
        <>
          {' '}
          in <Em>{sayList(formatList)}</Em> {plural(formatList.length, 'format')}
        </>
      )}
      ,{' '}
      {visCount === 0 ? (
        <>with no visualisations created from this data.</>
      ) : (
        <>
          with <Em>{visCount}</Em> {plural(visCount, 'visualisation')} created from this data.
        </>
      )}
    </>
  )

  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography ? { id: 'geography', label: 'Geography', value: model.geography, icon: MapPin } : null,
  ].filter(present)

  // Events are not part of Data DNA.
  const usage = model.relations.filter((r) => r.kind !== 'events')
  // One continuous statement; each part that has connections links to that content type's listing.
  const part = (kind: string, lead: string, noun: [string, string]) => {
    const relation = usage.find((r) => r.kind === kind)
    const n = relation?.items.length ?? 0
    const text = (
      <>
        <Em>{n}</Em> {plural(n, noun[0], noun[1])}
      </>
    )
    return (
      <>
        {lead}{' '}
        {relation && n > 0 ? (
          <Link
            to={relation.listingHref}
            aria-label={`${n} ${plural(n, noun[0], noun[1])}. See all connected to this dataset`}
            className="underline decoration-border-strong underline-offset-2 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {text}
          </Link>
        ) : (
          text
        )}
      </>
    )
  }
  const usageSentence = (
    <>
      This dataset {part('use-cases', 'supports', ['use case', 'use cases'])},{' '}
      {part('collaboratives', 'is part of', ['collaborative', 'collaboratives'])}, and{' '}
      {part('visualisations', 'powers', ['visualisation', 'visualisations'])}.
    </>
  )

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
        {/* A round filled icon button (the same treatment as the search button) with a download arrow; its accessible name says
            what it downloads. */}
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Save Data DNA"
          title="Save Data DNA"
          onClick={() => toast({ title: 'Prototype', description: 'Data DNA downloads are not wired up yet.' })}
        >
          <Save className="size-5" aria-hidden="true" />
        </Button>
      </header>

      {/* Top block: story (6) · volume + downloads (3) · three supporting metrics (3). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          aria-labelledby="dna-story-heading"
          className={cn(
            CARD,
            'relative flex min-h-[220px] lg:min-h-[280px] flex-col overflow-hidden bg-workspace-hero-to p-6 sm:p-8 lg:col-span-6',
          )}
        >
          <h2 id="dna-story-heading" className="text-xs font-semibold uppercase tracking-wide text-text-brand/80">
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

        <section
          aria-label="Records and downloads"
          className={cn(CARD, WHITE, 'flex flex-col justify-between gap-4 p-6 lg:col-span-3')}
        >
          {/* The icon takes the lavender of the neighbouring card (chart-7 at 10% over the page background, rgb 226 226 240), at 61px. */}
          <Table2
            className="size-[61px] shrink-0"
            style={{ color: 'color-mix(in srgb, var(--chart-7) 10%, var(--page-background))' }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {/* Sentence at the bottom right of the card, right-aligned. */}
          <p className="type-heading-3 self-end text-right font-normal text-text-default">{volumeSentence}</p>
        </section>

        <section
          aria-label="About the data"
          className={cn(CARD, LAVENDER, 'flex flex-col justify-between gap-4 p-6 lg:col-span-3')}
        >
          <p className="type-heading-3 font-normal text-text-default">{contentsSentence}</p>
          {/* The icon stands alone — no disc — 80% larger than the previous 34px (61px), in white. */}
          <FileStack
            className="size-[61px] shrink-0 self-end text-primary-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </section>
      </div>

      {/* Context (lavender, two items split by a divider) beside Where this data is used (white, three sections). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section aria-labelledby="dna-context-heading" className={cn(CARD, LAVENDER, 'p-6 lg:col-span-6')}>
          <h2 id="dna-context-heading" className="sr-only">
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

        <section
          aria-labelledby="dna-used-heading"
          className={cn(CARD, WHITE, 'p-6 lg:col-span-6 lg:min-h-[110px] lg:p-4 xl:p-6')}
        >
          <h2 id="dna-used-heading" className="sr-only">
            Where this data is used
          </h2>
          <div className="flex h-full min-w-0 items-center gap-4">
            {/* No disc; the icon is 61px (like the other two card icons) in the lavender of the neighbouring cards (chart-7 at 10% over the page background, rgb 226 226 240). */}
            <BarChart3
              className="size-[61px] shrink-0"
              style={{ color: 'color-mix(in srgb, var(--chart-7) 10%, var(--page-background))' }}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="type-heading-3 min-w-0 break-words font-normal text-text-default">{usageSentence}</p>
          </div>
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

export { DatasetDataDNA }
