import * as React from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Copy,
  Database,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS } from '@/types/publication'
import {
  TREATMENT_BY_TYPE,
  type Connection,
  type DocPage,
  type SamplePublication,
  type Treatment,
} from '@/pages/playground/publication-detail/publication-sample-data'

/** Pieces the Publication Detail versions share: labels, the generated cover, figures, the citation and the connections.
 *  Playground-only; nothing here is used by a production page. */

const optionLabel = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value

export const typeLabel = (p: SamplePublication) => optionLabel(RESOURCE_TYPE_OPTIONS, p.resourceType)
export const sectorLabel = (p: SamplePublication) => optionLabel(SECTOR_OPTIONS, p.sector)
export const geographyLabel = (p: SamplePublication) => optionLabel(GEOGRAPHY_OPTIONS, p.geography)
export const licenceLabel = (p: SamplePublication) => optionLabel(LICENSE_OPTIONS, p.usageRights)
export const treatmentOf = (p: SamplePublication): Treatment => TREATMENT_BY_TYPE[p.resourceType]

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Each treatment's accent, from the chart palette. Used only on fills, stripes and markers, always next to a text label, never
 *  as the colour of text (slots 3–5 are below 3:1 on white). Written out in full so Tailwind sees every class. */
export const ACCENT: Record<Treatment, { fill: string; soft: string; border: string }> = {
  brief: { fill: 'bg-chart-8', soft: 'bg-chart-8/10', border: 'border-chart-8' },
  report: { fill: 'bg-chart-1', soft: 'bg-chart-1/10', border: 'border-chart-1' },
  toolkit: { fill: 'bg-chart-3', soft: 'bg-chart-3/10', border: 'border-chart-3' },
  'field-note': { fill: 'bg-chart-6', soft: 'bg-chart-6/10', border: 'border-chart-6' },
  'case-study': { fill: 'bg-chart-7', soft: 'bg-chart-7/10', border: 'border-chart-7' },
  deck: { fill: 'bg-chart-2', soft: 'bg-chart-2/10', border: 'border-chart-2' },
  article: { fill: 'bg-chart-1', soft: 'bg-chart-1/10', border: 'border-chart-1' },
}

/** A prototype action: says what would happen instead of going anywhere. */
export function usePrototypeAction() {
  const toast = useToast()
  return React.useCallback(
    (what: string) => toast({ title: 'Prototype', description: `${what} is not wired up in this playground.` }),
    [toast],
  )
}

/** A generated cover, standing in for the first page of the file: the type, the title and the publisher on the brand navy, with a
 *  stripe and a line pattern in the type's accent. `stacked` draws two sheets behind it, so it reads as a document. */
export function DocumentCover({
  pub,
  stacked = false,
  landscape = false,
  className,
}: {
  pub: SamplePublication
  stacked?: boolean
  /** 16:10 instead of 3:4, for slides. */
  landscape?: boolean
  className?: string
}) {
  const accent = ACCENT[treatmentOf(pub)]
  return (
    <div className={cn('relative', className)} aria-hidden="true">
      {stacked && (
        <>
          <div className="absolute inset-0 translate-x-4 translate-y-3 rotate-[4deg] rounded-lg border border-border-default bg-card shadow-sm" />
          <div className="absolute inset-0 translate-x-2 translate-y-1.5 rotate-[2deg] rounded-lg border border-border-default bg-card shadow-sm" />
        </>
      )}
      <div
        className={cn(
          'relative flex flex-col justify-between overflow-hidden rounded-lg bg-header-background p-6 text-text-on-brand shadow-lg',
          landscape ? 'aspect-[16/10]' : 'aspect-[3/4]',
        )}
      >
        <svg className="absolute -right-16 -top-16 size-64 opacity-30" viewBox="0 0 200 200">
          {[90, 74, 58, 42, 26].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
          ))}
        </svg>
        <div className="relative">
          <span className={cn('block h-1.5 w-12 rounded-full', accent.fill)} />
          <p className="type-caption mt-3 font-medium uppercase tracking-[0.025em]">{typeLabel(pub)}</p>
        </div>
        <p className="type-heading-2 relative line-clamp-6">{pub.title}</p>
        <div className="type-caption relative flex items-end justify-between gap-3 opacity-90">
          <span className="min-w-0 truncate">{pub.publisher}</span>
          <span className="shrink-0 tabular-nums">{new Date(pub.date).getUTCFullYear()}</span>
        </div>
      </div>
    </div>
  )
}

/** A horizontal bar figure, labelled on every bar so colour never carries the meaning. */
export function BarFigure({ figure }: { figure: NonNullable<DocPage['figure']> }) {
  const max = Math.max(...figure.bars.map((b) => b.value))
  return (
    <figure className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {figure.bars.map((b) => (
          <li key={b.label} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3">
            <span className="type-caption truncate text-text-secondary">{b.label}</span>
            <span className="flex items-center gap-2">
              <span className="h-3 rounded-sm bg-primary" style={{ width: `${(b.value / max) * 100}%` }} />
              <span className="type-caption shrink-0 tabular-nums text-text-default">
                {b.value.toLocaleString()}
                {figure.unit === '%' ? '%' : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <figcaption className="type-caption text-text-subdued">
        {figure.caption}
        {figure.unit !== '%' && ` (${figure.unit})`}
      </figcaption>
    </figure>
  )
}

export function citationFor(pub: SamplePublication) {
  const names = pub.contributors.map((c) => c.name).join(', ')
  return `${names} (${new Date(pub.date).getUTCFullYear()}). ${pub.title} [${typeLabel(pub)}]. ${pub.publisher}. CivicDataSpace.`
}

/** "Cite this": the citation as text and a copy button. */
export function CiteBlock({ pub }: { pub: SamplePublication }) {
  const toast = useToast()
  const citation = citationFor(pub)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      toast({ title: 'Citation copied' })
    } catch {
      toast({ title: 'Could not copy', description: 'Select the citation and copy it yourself.' })
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="type-body select-all rounded-lg bg-surface-subdued p-3 text-text-secondary">{citation}</p>
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={copy}>
        <Copy className="size-4" />
        Copy citation
      </Button>
    </div>
  )
}

const CONNECTION_GROUPS: { key: 'datasets' | 'useCases' | 'collaboratives'; label: string; one: string; verb: string; icon: LucideIcon }[] = [
  { key: 'datasets', label: 'Datasets', one: 'dataset', verb: 'draws on', icon: Database },
  { key: 'useCases', label: 'Use cases', one: 'use case', verb: 'informs', icon: BriefcaseBusiness },
  { key: 'collaboratives', label: 'Collaboratives', one: 'collaborative', verb: 'is part of', icon: Users },
]

/** One sentence that says how the publication connects, built from the counts so it can never disagree with the lists. */
export function connectionSentence(pub: SamplePublication) {
  const typeWord = typeLabel(pub).toLowerCase()
  const parts = CONNECTION_GROUPS.map((g) => {
    const n = pub.connections[g.key].length
    return n ? `${g.verb} ${n} ${n === 1 ? g.one : `${g.one}s`}` : null
  }).filter(Boolean) as string[]
  if (parts.length === 0) return null
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]
  return `This ${typeWord} ${list}.`
}

function ConnectionRow({ item, icon: Icon, onOpen }: { item: Connection; icon: LucideIcon; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-text-brand" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="type-label block text-text-default group-hover:text-text-brand">{item.title}</span>
          <span className="type-caption mt-0.5 block text-text-subdued">{item.meta}</span>
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-text-subdued" aria-hidden="true" />
      </button>
    </li>
  )
}

/** Where the publication sits in CivicDataSpace: datasets it draws on, use cases it informs, collaboratives it belongs to. Empty
 *  groups are left out; with nothing connected the section says so in one line. */
export function ConnectionsSection({
  pub,
  headingId,
  headingClassName = 'type-heading-1 text-text-default',
  filled = false,
}: {
  pub: SamplePublication
  headingId?: string
  /** The heading's type role and colour, so a variant can match its own section headings. */
  headingClassName?: string
  /** Borderless soft tiles instead of outlined cards. */
  filled?: boolean
}) {
  const prototype = usePrototypeAction()
  const groups = CONNECTION_GROUPS.filter((g) => pub.connections[g.key].length > 0)
  const sentence = connectionSentence(pub)
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className={headingClassName}>
          Connected on CivicDataSpace
        </h2>
        <p className="type-body text-text-subdued">{sentence ?? 'This publication is not connected to other records yet.'}</p>
      </div>
      {groups.length > 0 && (
        <div className={cn('grid gap-4', groups.length > 1 && 'md:grid-cols-2', groups.length > 2 && 'lg:grid-cols-3')}>
          {groups.map((g) => (
            <div
              key={g.key}
              className={cn('flex flex-col gap-1 p-3', filled ? 'rounded-2xl bg-page-background' : 'rounded-xl border border-border-default bg-card')}
            >
              <h3 className="type-caption flex items-center justify-between px-2.5 pt-1 font-medium uppercase tracking-[0.025em] text-text-subdued">
                {g.label}
                <span className="tabular-nums">{pub.connections[g.key].length}</span>
              </h3>
              <ul className="flex flex-col">
                {pub.connections[g.key].map((item) => (
                  <ConnectionRow key={item.id} item={item} icon={g.icon} onOpen={() => prototype(`Opening “${item.title}”`)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** Other publications to read next. Left out when there are none. */
export function ReadNext({ pub, onOpen, filled = false }: { pub: SamplePublication; onOpen: (id: string) => void; filled?: boolean }) {
  const items = pub.connections.publications
  if (items.length === 0) return null
  return (
    <section aria-label="Read next" className="flex flex-col gap-3">
      <h2 className="type-heading-2 text-text-default">Read next</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className={cn(
                'flex w-full items-center gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                filled ? 'rounded-2xl bg-page-background hover:bg-surface-hovered' : 'rounded-xl border border-border-default bg-card hover:bg-surface-hovered',
              )}
            >
              <BookOpen className="size-5 shrink-0 text-text-brand" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text-default">{item.title}</span>
                <span className="type-caption block text-text-subdued">{item.meta}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
