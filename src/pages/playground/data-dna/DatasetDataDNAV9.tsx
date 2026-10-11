import {
  BarChart3,
  CalendarDays,
  Save,
  FileStack,
  FileType2,
  Globe2,
  Layers,
  MapPin,
  Scale,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import type * as React from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useDataDNAModel, type DNAFact } from '@/components/dataset/consumer/data-dna/use-data-dna'

/** The card's surfaces, all existing tokens: workspace light blue for the story, a soft lavender (chart-7 tint) for the
 *  supporting and context cards, white for usage and provenance. */
const LAVENDER = 'bg-chart-7/10'
const WHITE = 'bg-card'
const CARD = 'min-w-0 rounded-2xl'

/** A bare white outline icon, no disc (supporting metrics). */
function OrangeDisc({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-8 shrink-0 text-white" strokeWidth={1.5} aria-hidden="true" />
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

/** A sentence with its key value emphasised: strong navy, no larger than the text around it. */
function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-text-brand">{children}</strong>
}
const plural = (n: number | string, one: string, many = `${one}s`) => (String(n) === '1' ? one : many)
const initials = (name: string) => {
  const parts = name.trim().split(/[\s.]+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** A round profile image; when none is set, an initials circle (never an invented photo). */
function ProfileImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-accent text-sm font-semibold text-text-on-accent"
    >
      {initials(name)}
    </span>
  )
}

interface Row {
  id: string
  label: string
  value: string
  icon: LucideIcon
}
/** The description's first sentence, as written (it ends at the first full stop, question or exclamation mark). */
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0]?.trim() ?? ''
const present = <T,>(r: T | null): r is T => r !== null
const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)

/** Data DNA — Version 9: Version 8 with the "What this data tells us" card on the brand blue and all of its text in white. Playground only. */
function DatasetDataDNAV9({ datasetId }: { datasetId: string }) {
  const toast = useToast()
  const model = useDataDNAModel(datasetId)
  if (!model) return <p className="py-10 text-sm text-text-subdued">Dataset not found.</p>

  const records = fact(model.stats, 'records')
  const size = fact(model.stats, 'size')
  const resources = fact(model.characteristics, 'resources')
  const formats = fact(model.characteristics, 'formats')

  // Records is the record count; when no file reports one, file size stands in and is labelled as what it is.
  const volume = records?.available
    ? { value: records.value, label: 'Records' }
    : size?.available
      ? { value: size.value, label: 'File size' }
      : null

  const metrics: Row[] = [
    resources?.available
      ? {
          id: 'files',
          label: 'Data files',
          value: resources.value,
          icon: FileStack,
        }
      : null,
    formats?.available
      ? {
          id: 'types',
          label: 'File types',
          value: formats.value.split(', ').join(' · '),
          icon: FileType2,
        }
      : null,
  ].filter(present)

  const context: Row[] = [
    model.domain ? { id: 'sector', label: 'Sector', value: model.domain, icon: Layers } : null,
    model.geography
      ? {
          id: 'geography',
          label: 'Geography',
          value: model.geography,
          icon: MapPin,
        }
      : null,
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
  // The publisher carries a profile image: its logo/avatar when one is set, otherwise initials.
  const provenance: Row[] = [
    licence?.available ? { id: 'licence', label: 'License', value: licence.value, icon: Scale } : null,
    source?.available ? { id: 'source', label: 'Source', value: source.value, icon: Globe2 } : null,
    {
      id: 'updated',
      label: 'Last Updated',
      value: model.updated,
      icon: CalendarDays,
    },
  ].filter(present)

  return (
    <article
      aria-label="Data DNA"
      className="flex min-h-0 flex-col gap-5 rounded-3xl bg-page-background p-5 text-primary sm:p-6"
    >
      <header className="flex items-start justify-between gap-4">
        <h1 className="type-display-1 min-w-0 break-words text-black lg:max-w-[70%]">{model.title}</h1>
        {/* A round filled icon button (the same treatment as Version 6) that saves the Data DNA. */}
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Save Data DNA"
          title="Save Data DNA"
          onClick={() =>
            toast({
              title: 'Prototype',
              description: 'Data DNA downloads are not wired up yet.',
            })
          }
        >
          <Save className="size-5" aria-hidden="true" />
        </Button>
      </header>

      {/* Two columns from lg: story over context, and usage over volume + supporting metrics; each stacks at a 16px gap.
          Below lg the wrappers dissolve and the cards stack as story, usage, context, volume. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="contents lg:col-span-6 lg:flex lg:flex-col lg:gap-4">
          <section
            aria-labelledby="dna9-story-heading"
            className={cn(
              CARD,
              'order-1 lg:order-none lg:flex-1 relative flex min-h-[220px] lg:min-h-[280px] flex-col overflow-hidden bg-primary p-6 sm:p-8',
            )}
          >
            <h2 id="dna9-story-heading" className="sr-only">
              What this data tells us
            </h2>
            <p className="type-heading-1 mb-4 line-clamp-6 text-white">
              {firstSentence(model.description) || model.story || 'No description has been provided.'}
            </p>
            {/* The CivicDataSpace logo (as in the nav bar), lower right, so a saved card says where it came from. */}
            <img src="/brand/CDS-Logo.png" alt="CivicDataSpace" className="mt-auto h-10 w-auto shrink-0 self-end" />
          </section>

          <section
            aria-labelledby="dna9-context-heading"
            className={cn(CARD, LAVENDER, 'order-3 flex min-h-[110px] items-center p-6 lg:order-none')}
          >
            <h2 id="dna9-context-heading" className="sr-only">
              Context
            </h2>
            <dl className="grid w-full grid-cols-2 items-center divide-x divide-border-default">
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
        </div>
        <div className="contents lg:col-span-6 lg:flex lg:flex-col lg:gap-4">
          <section
            aria-labelledby="dna9-used-heading"
            className={cn(CARD, WHITE, 'order-2 min-h-[110px] lg:order-none lg:p-4 xl:p-6 p-6')}
          >
            <h2 id="dna9-used-heading" className="sr-only">
              Where this data is used
            </h2>
            <div className="flex h-full min-w-0 items-center gap-4">
              {/* No disc; the icon is 61px (like the other two card icons) in the lavender of the neighbouring cards (chart-7 at 10% over the page background, rgb 226 226 240). */}
              <BarChart3
                className="size-[61px] shrink-0"
                style={{
                  color: 'color-mix(in srgb, var(--chart-7) 10%, var(--page-background))',
                }}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <p className="type-heading-3 min-w-0 break-words font-normal text-text-default">{usageSentence}</p>
            </div>
          </section>

          <div className="order-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-none lg:flex-1">
            <section aria-label="Volume and downloads" className={cn(CARD, WHITE, 'flex flex-col p-6')}>
              {volume && (
                <div className="flex flex-1 flex-col">
                  {/* Version 6.1's icon style: 61px, in the lavender of the neighbouring cards (chart-7 at 10% over the page background). */}
                  <Table2
                    className="size-[61px] shrink-0"
                    style={{
                      color: 'color-mix(in srgb, var(--chart-7) 10%, var(--page-background))',
                    }}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {/* Pushed down so Records sits just above the divider, level in spacing with Downloads beneath it. */}
                  <div className="mt-auto">
                    <ValueLabel value={volume.value} label={volume.label} valueClass="type-heading-2" />
                  </div>
                </div>
              )}
              <div className="mt-4 border-t border-border-default pt-4">
                <ValueLabel
                  value={model.record.downloadCount.toLocaleString()}
                  label="Downloads"
                  valueClass="type-heading-2"
                />
              </div>
            </section>

            <ul
              aria-label="At a glance"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:auto-rows-fr"
            >
              {metrics.map(({ id, label, value, icon }) => (
                <li key={id} className={cn(CARD, LAVENDER, 'flex items-center gap-4 p-4')}>
                  <OrangeDisc icon={icon} />
                  <ValueLabel value={value} label={label} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Provenance split into two cards: licence, source and last updated on the left; the publisher on the right. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <section
          aria-label="Provenance and trust"
          className={cn(CARD, WHITE, 'flex min-h-[110px] items-center p-6 lg:col-span-3')}
        >
          <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {provenance.map(({ id, label, value, icon }) => (
              <li key={id} className="flex min-w-0 items-center gap-3">
                <SoftDisc icon={icon} />
                <ValueLabel value={value} label={label} />
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Publisher" className={cn(CARD, LAVENDER, 'flex min-h-[110px] items-center p-6')}>
          <ul className="flex h-full items-center">
            <li className="flex min-w-0 items-center gap-3">
              <span className="-my-1 flex">
                <ProfileImage name={model.publisher} imageUrl={model.publisherAvatarUrl} />
              </span>
              <ValueLabel value={model.publisher} label="Publisher" />
            </li>
          </ul>
        </section>
      </div>
    </article>
  )
}

export { DatasetDataDNAV9 }
