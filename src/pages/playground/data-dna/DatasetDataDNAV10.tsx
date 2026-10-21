import {
  Activity,
  BarChart3,
  CalendarDays,
  Cpu,
  Download,
  Save,
  FileStack,
  FileType2,
  Globe2,
  Languages,
  Layers,
  ListChecks,
  Lock,
  MapPin,
  Scale,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'
import { Link } from 'react-router-dom'

import datasetDnaIllustration from '@/assets/data-dna/dataset-dna-card.png'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useDataDNAModel, type DNAFact } from '@/components/dataset/consumer/data-dna/use-data-dna'
import type {
  CardRow,
  CardView,
  GlanceIconKey,
  ProvenanceIconKey,
  UsagePart,
} from '@/pages/playground/data-dna/data-dna-scenarios'
import { logoFit } from '@/lib/org-logo'

/** The card's surfaces, all existing tokens: workspace light blue for the story, a soft lavender (chart-7 tint) for the
 *  supporting and context cards, white for usage and provenance. */
const LAVENDER = 'bg-chart-7/10'
const WHITE = 'bg-card'
const CARD = 'min-w-0 rounded-2xl'

/** The outer card's height per breakpoint, so every dataset gets the same card at the same width and the inner cards stretch
 *  to fill it. Below lg the cards stack and these are the existing heights of the complete reference dataset; from lg the
 *  two-column layout is sized to hold a three-line title. They are minimums: only content that genuinely does not fit makes
 *  the card taller. Written out in full so Tailwind generates them. */
const CARD_HEIGHT = 'min-h-[1460px] sm:min-h-[1140px] md:min-h-[1160px] lg:min-h-[680px]'

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
  more,
  lines,
}: {
  value: string
  label: string
  valueClass?: string
  /** Extra items beyond `value`: shown as a compact `+N`. The name then stays on one line and truncates, so a long name
   *  or a large count can never push the card out of shape; the count is always kept visible. */
  more?: number
  /** Limits the value to this many lines (ellipsis after); the full text stays in the DOM and in a tooltip. */
  lines?: 2
}) {
  return (
    <div className="min-w-0">
      {more ? (
        <p className={cn(valueClass, 'flex min-w-0 items-baseline gap-1.5 text-text-brand')}>
          <span className="min-w-0 truncate" title={value}>
            {value}
          </span>
          <span aria-hidden="true" className="shrink-0 tabular-nums text-text-subdued">
            +{more}
          </span>
          <span className="sr-only">and {more} more</span>
        </p>
      ) : (
        <p
          className={cn(valueClass, 'break-words text-text-brand', lines && 'line-clamp-2')}
          title={lines ? value : undefined}
        >
          {value}
        </p>
      )}
      <p className="type-caption text-text-subdued">{label}</p>
    </div>
  )
}

/** The dataset title. On screen it is limited to three lines and ends in an ellipsis; when that cuts it, hovering or
 *  focusing it shows the whole title (the heading's text itself is always complete for assistive technology). In the
 *  export version the full title is shown, never truncated. */
function CardTitle({ title, exportMode }: { title: string; exportMode: boolean }) {
  const ref = React.useRef<HTMLHeadingElement>(null)
  const [truncated, setTruncated] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || exportMode) return
    const measure = () => setTruncated(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [title, exportMode])

  const className = cn(
    'type-display-1 min-w-0 break-words text-black lg:max-w-[70%]',
    !exportMode && 'line-clamp-3',
    truncated && 'cursor-default rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
  )
  const heading = (
    <h1 ref={ref} className={className} tabIndex={truncated ? 0 : undefined}>
      {title}
    </h1>
  )
  // The same heading element is always rendered (swapping it for a wrapped copy would remount it and drop the observer);
  // the tooltip is simply held closed while nothing is cut off.
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={truncated ? undefined : false}>
        <TooltipTrigger asChild>{heading}</TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-[min(36rem,90vw)] whitespace-normal break-words text-sm">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    return <img src={imageUrl} alt="" className={`size-10 shrink-0 rounded-full ${logoFit(imageUrl, 'p-1.5')}`} />
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

const GLANCE_ICONS: Record<GlanceIconKey, LucideIcon> = {
  files: FileStack,
  types: FileType2,
  task: ListChecks,
  language: Languages,
  model: Cpu,
  variables: Activity,
}
const PROVENANCE_ICONS: Record<ProvenanceIconKey, LucideIcon> = {
  licence: Scale,
  source: Globe2,
  updated: CalendarDays,
  access: Lock,
}
const CONTEXT_ICONS = { sector: Layers, geography: MapPin } as const

/** Bottom-row columns follow the number of items so the remaining metadata spreads evenly. Written out in full so Tailwind generates them. */
const PROVENANCE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const present = <T,>(r: T | null): r is T => r !== null
const fact = (facts: DNAFact[], id: string) => facts.find((f) => f.id === id)

/** One continuous statement built from whichever relationship counts are known; each part with connections can link to that content type's listing. */
function UsageSentence({ parts }: { parts: UsagePart[] }) {
  const rendered = parts.map((p) => {
    const text = (
      <>
        <Em>{p.count}</Em> {plural(p.count, p.nouns[0], p.nouns[1])}
      </>
    )
    return (
      <>
        {p.lead}{' '}
        {p.href && p.count > 0 ? (
          <Link
            to={p.href}
            aria-label={`${p.count} ${plural(p.count, p.nouns[0], p.nouns[1])}. See all connected to this dataset`}
            className="underline decoration-border-strong underline-offset-2 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {text}
          </Link>
        ) : (
          text
        )}
      </>
    )
  })
  return (
    <>
      This dataset{' '}
      {rendered.map((node, i) => (
        <span key={parts[i].kind}>
          {node}
          {i < rendered.length - 1 ? (rendered.length === 2 ? ' and ' : i === rendered.length - 2 ? ', and ' : ', ') : ''}
        </span>
      ))}
      .
    </>
  )
}

/** The Data DNA card, rendered from a resolved view. Everything optional is hidden rather than shown empty; the layout
 *  regions (story, context, usage, metrics, provenance) stay the same and only resize or drop out. */
function DataDNACardV10({ view, exportMode = false }: { view: CardView; exportMode?: boolean }) {
  const toast = useToast()
  const { context, usage, volume, downloads, glance, provenance, publisher } = view
  const hasMetricsCard = Boolean(volume || downloads)
  const hasRight = Boolean(usage) || hasMetricsCard || glance.length > 0
  const hasBottom = provenance.length > 0 || Boolean(publisher)
  const stackContext = context.length === 2 && context.some((c) => c.value.length > 16)

  return (
    <article
      aria-label="Data DNA"
      className={cn(
        'flex flex-col gap-4 rounded-3xl bg-page-background p-5 text-primary sm:p-6',
        CARD_HEIGHT,
      )}
    >
      <header className="mb-1 flex items-start justify-between gap-4">
        <CardTitle title={view.title} exportMode={exportMode} />
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
          Below lg the wrappers dissolve and the cards stack as story, usage, context, volume. With nothing for the
          right-hand column, the left one takes the full width. */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={cn('contents lg:flex lg:min-h-0 lg:flex-col lg:gap-4', hasRight ? 'lg:col-span-6' : 'lg:col-span-12')}>
          <section
            aria-labelledby="dna10-story-heading"
            className={cn(
              CARD,
              'order-1 lg:order-none relative flex min-h-[220px] lg:min-h-[240px] lg:flex-1 flex-col overflow-hidden bg-workspace-hero-to p-6 sm:p-8',
            )}
          >
            <h2 id="dna10-story-heading" className="text-xs font-semibold uppercase tracking-wide text-text-brand/80">
              What this data tells us
            </h2>
            <p className="type-heading-1 mt-3 line-clamp-5 text-text-brand sm:max-w-[20ch]">{view.story}</p>
            {/* The CivicDataSpace logo, small, in the grey-blue the "From the dataset description" line had (text-brand at 70%). The logo is a
                white-and-orange PNG with empty margins, so it is used as a mask (its shape) filled with the current text colour. The wrapper
                keeps the caption's old footprint (16px line + 16px top padding) and the logo overflows it evenly, so the card's size does
                not change. */}
            <div className="mt-auto box-content flex h-4 items-center pt-4">
              <span
                role="img"
                aria-label="CivicDataSpace"
                className="block h-9 shrink-0 bg-current text-text-brand/70"
                style={{
                  aspectRatio: '669 / 326',
                  WebkitMask: 'url(/brand/civicdataspace-logo.svg) left center / contain no-repeat',
                  mask: 'url(/brand/civicdataspace-logo.svg) left center / contain no-repeat',
                }}
              />
            </div>
            {/* The Data DNA illustration (source: visuals/data-dna-cards), lower right; hidden on phones where the story needs the width. */}
            <img
              src={datasetDnaIllustration}
              alt=""
              decoding="async"
              draggable={false}
              className="pointer-events-none absolute bottom-3 right-4 hidden h-32 w-auto object-contain sm:block"
            />
          </section>

          {context.length > 0 && (
            <section aria-labelledby="dna10-context-heading" className={cn(CARD, LAVENDER, 'order-3 lg:order-none p-6')}>
              <h2 id="dna10-context-heading" className="sr-only">
                Context
              </h2>
              <dl
                className={cn(
                  'grid h-full items-center divide-border-default',
                  context.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                  // Two long values do not fit side by side on a phone: stack them there rather than break words mid-way.
                  stackContext ? 'max-sm:grid-cols-1 max-sm:divide-y sm:divide-x' : 'divide-x',
                )}
              >
                {context.map(({ id, label, value }) => {
                  const Icon = CONTEXT_ICONS[id]
                  return (
                    <div
                      key={id}
                      className={cn(
                        'flex min-w-0 items-center gap-3 px-4 first:pl-0 last:pr-0',
                        stackContext && 'max-sm:px-0 max-sm:py-3 max-sm:first:pt-0 max-sm:last:pb-0',
                      )}
                    >
                      <Icon className="size-8 shrink-0 text-primary/80" strokeWidth={1.25} aria-hidden="true" />
                      <div className="min-w-0">
                        <dd className="type-heading-3 line-clamp-2 break-words text-text-brand" title={value}>
                          {value}
                        </dd>
                        <dt className="type-caption text-text-subdued">{label}</dt>
                      </div>
                    </div>
                  )
                })}
              </dl>
            </section>
          )}
        </div>

        {hasRight && (
          <div className="contents lg:col-span-6 lg:flex lg:min-h-0 lg:flex-col lg:gap-4">
            {usage && (
              <section
                aria-labelledby="dna10-used-heading"
                className={cn(
                  CARD,
                  WHITE,
                  'order-2 lg:order-none p-6 lg:min-h-[110px] lg:p-4 xl:p-6',
                  // Nothing beneath it: it takes the column's height.
                  !hasMetricsCard && glance.length === 0 && 'lg:flex-1',
                )}
              >
                <h2 id="dna10-used-heading" className="sr-only">
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
                  <p
                    className={cn(
                      'type-heading-3 min-w-0 break-words font-normal',
                      usage.kind === 'empty' ? 'text-text-subdued' : 'text-text-default',
                    )}
                  >
                    {usage.kind === 'sentence' ? <UsageSentence parts={usage.parts} /> : usage.message}
                  </p>
                </div>
              </section>
            )}

            {(hasMetricsCard || glance.length > 0) && (
              <div
                className={cn(
                  'order-4 grid grid-cols-1 gap-4 lg:order-none lg:min-h-0 lg:flex-1',
                  hasMetricsCard && glance.length > 0 && 'sm:grid-cols-2',
                )}
              >
                {hasMetricsCard && (
                  <section aria-label="Volume and downloads" className={cn(CARD, WHITE, 'flex flex-col p-6')}>
                    {/* Version 6.1's icon style: 61px, in the lavender of the neighbouring cards (chart-7 at 10% over the page background). */}
                    {(() => {
                      const Icon = volume ? Table2 : Download
                      const top = volume ?? { value: downloads ?? '', label: 'Downloads' }
                      return (
                        <div className="flex flex-1 flex-col">
                          <Icon
                            className="size-[61px] shrink-0"
                            style={{
                              color: 'color-mix(in srgb, var(--chart-7) 10%, var(--page-background))',
                            }}
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          {/* Pushed down so the figure sits just above the divider, level in spacing with Downloads beneath it. */}
                          <div className="mt-auto">
                            <ValueLabel value={top.value} label={top.label} valueClass="type-heading-2" />
                          </div>
                        </div>
                      )
                    })()}
                    {volume && downloads && (
                      <div className="mt-4 border-t border-border-default pt-4">
                        <ValueLabel value={downloads} label="Downloads" valueClass="type-heading-2" />
                      </div>
                    )}
                  </section>
                )}

                {glance.length > 0 && (
                  <ul
                    aria-label="At a glance"
                    className={cn(
                      'grid grid-cols-1 gap-4 lg:auto-rows-fr',
                      !hasMetricsCard && glance.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2',
                      // Beside the metrics card the rows stack; alone, they spread across the width (one row = full width).
                      hasMetricsCard ? 'lg:grid-cols-1' : glance.length === 1 ? 'lg:grid-cols-1' : 'lg:grid-cols-2',
                    )}
                  >
                    {glance.map(({ id, label, value, icon }) => (
                      <li key={id} className={cn(CARD, LAVENDER, 'flex items-center gap-4 p-4')}>
                        <OrangeDisc icon={GLANCE_ICONS[icon]} />
                        <ValueLabel value={value} label={label} lines={2} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Provenance split into two cards: licence, source and last updated on the left; the publisher on the right. */}
      {hasBottom && (
        <div className={cn('grid grid-cols-1 gap-4', provenance.length > 0 && publisher && 'lg:grid-cols-4')}>
          {provenance.length > 0 && (
            <section aria-label="Provenance and trust" className={cn(CARD, WHITE, 'p-6', publisher && 'lg:col-span-3')}>
              <ul className={cn('grid gap-x-6 gap-y-4', PROVENANCE_COLS[Math.min(provenance.length, 4)])}>
                {provenance.map(({ id, label, value, icon, more }) => (
                  <li key={id} className="flex min-w-0 items-center gap-3">
                    <SoftDisc icon={PROVENANCE_ICONS[icon]} />
                    <ValueLabel value={value} label={label} more={more} lines={2} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {publisher && (
            <section aria-label="Publisher" className={cn(CARD, LAVENDER, 'p-6')}>
              <ul className="flex h-full items-center">
                <li className="flex min-w-0 items-center gap-3">
                  <span className="-my-1 flex">
                    <ProfileImage name={publisher.name} imageUrl={publisher.avatarUrl} />
                  </span>
                  <ValueLabel value={publisher.name} label="Publisher" lines={2} />
                </li>
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  )
}

/** Data DNA — Version 10: Version 8 with the "From the dataset description" line replaced by a small grey CivicDataSpace logo. Playground only. */
function DatasetDataDNAV10({ datasetId }: { datasetId: string }) {
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

  const glance: CardRow<GlanceIconKey>[] = [
    resources?.available ? { id: 'files', label: 'Data files', value: resources.value, icon: 'files' as const } : null,
    formats?.available
      ? { id: 'types', label: 'File types', value: formats.value.split(', ').join(' · '), icon: 'types' as const }
      : null,
  ].filter(present)

  const context: CardView['context'] = [
    model.domain ? { id: 'sector' as const, label: 'Sector', value: model.domain } : null,
    model.geography ? { id: 'geography' as const, label: 'Geography', value: model.geography } : null,
  ].filter(present)

  // Events are not part of Data DNA.
  const usage = model.relations.filter((r) => r.kind !== 'events')
  const part = (kind: UsagePart['kind'], lead: string, nouns: [string, string]): UsagePart => {
    const relation = usage.find((r) => r.kind === kind)
    return { kind, lead, nouns, count: relation?.items.length ?? 0, href: relation?.listingHref }
  }

  const licence = fact(model.provenance, 'licence')
  const source = fact(model.provenance, 'source')
  const provenance: CardRow<ProvenanceIconKey>[] = [
    licence?.available ? { id: 'licence', label: 'License', value: licence.value, icon: 'licence' as const } : null,
    source?.available
      ? {
          id: 'source',
          label: model.sourceCount > 1 ? 'Sources' : 'Source',
          value: source.value,
          icon: 'source' as const,
          more: model.sourceCount > 1 ? model.sourceCount - 1 : undefined,
        }
      : null,
    { id: 'updated', label: 'Last Updated', value: model.updated, icon: 'updated' as const },
  ].filter(present)

  const view: CardView = {
    title: model.title,
    story: model.story || 'No description has been provided.',
    context,
    usage: {
      kind: 'sentence',
      parts: [
        part('use-cases', 'supports', ['use case', 'use cases']),
        part('collaboratives', 'is part of', ['collaborative', 'collaboratives']),
        part('visualisations', 'powers', ['visualisation', 'visualisations']),
      ],
    },
    volume,
    downloads: model.record.downloadCount.toLocaleString(),
    glance,
    provenance,
    publisher: { name: model.publisher, avatarUrl: model.publisherAvatarUrl },
  }
  return <DataDNACardV10 view={view} />
}

export { DatasetDataDNAV10, DataDNACardV10 }
