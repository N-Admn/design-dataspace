import * as React from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Download,
  FileText,
  Globe2,
  Layers,
  MapPin,
  Quote,
  Scale,
  Share2,
  type LucideIcon,
} from 'lucide-react'

import { EntityAvatar } from '@/components/community/DirectoryParts'
import { InfoField } from '@/components/shared/InfoField'
import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { publicationIllustration } from '@/lib/publication-type'
import { LICENSE_TERMS_URLS } from '@/types/dataset'
import { FileShowcase } from '@/pages/playground/publication-detail/FileShowcase'
import {
  CiteBlock,
  ConnectionsSection,
  ReadNext,
  formatDate,
  geographyLabel,
  licenceLabel,
  sectorLabel,
  typeLabel,
  usePrototypeAction,
} from '@/pages/playground/publication-detail/publication-shared'
import type { SamplePublication } from '@/pages/playground/publication-detail/publication-sample-data'

/** "Shaped by type", built only from what today's publication upload flow collects (details, contributors, classification,
 *  the uploaded files and videos), so every type goes live through the one existing flow.
 *
 *  The type shows as a label and a hand-drawn illustration in the title card (policy brief, toolkit, report, case study, or a
 *  generic publication); colour stays on the brand surfaces the Dataset and Collaborative pages use, and the type never
 *  changes the fields or interactions. There is no thumbnail: a publication can hold several files, so no one file speaks for
 *  it. People read it file by file in the file showcase, the same list + viewer as the Dataset page's data files.
 *
 *  With `proposed`, two optional fields from the upload-flow proposal are shown too: key highlights and a pull quote. */

const filesOf = (pub: SamplePublication) => [pub.file, ...(pub.extraFiles ?? [])]

/* ── Hero ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** The bar above the bento, as on the Dataset and Collaborative pages: Back on the left; Download and Share on the right. */
function ActionBar({ pub }: { pub: SamplePublication }) {
  const prototype = usePrototypeAction()
  const files = filesOf(pub)
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <Button type="button" variant="ghost" size="sm" className="-ml-3 text-text-subdued hover:text-text-default" onClick={() => prototype('Going back')}>
        <ArrowLeft />
        Back
      </Button>
      <div className="flex items-center gap-2">
        <Button type="button" size="lg" onClick={() => prototype('Downloading the file')}>
          <Download className="size-4" aria-hidden="true" />
          Download {files.length > 1 ? 'all' : pub.file.extension}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full border-primary bg-transparent text-primary hover:bg-primary/5"
              aria-label={`Share ${typeLabel(pub).toLowerCase()}`}
              title="Share"
            >
              <Share2 className="size-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-4">
            <p className="type-label text-text-default">Share this {typeLabel(pub).toLowerCase()}</p>
            <SocialShareLinks url={window.location.href} title={pub.title} className="mt-3" />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function Contributors({ pub }: { pub: SamplePublication }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 -space-x-2">
        {pub.contributors.slice(0, 3).map((c) => (
          <EntityAvatar key={c.name} kind="individual" name={c.name} imageUrl={null} className="size-10 ring-2 ring-secondary" />
        ))}
      </div>
      <p className="type-body min-w-0">
        <span className="block font-medium text-text-default">{pub.contributors.map((c) => c.name).join(', ')}</span>
        <span className="block text-text-subdued">Published by {pub.publisher}</span>
      </p>
    </div>
  )
}

/** One fact on a soft white card, as on the Dataset page's header: a large grey line icon beside a label/value pair. */
function FactCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-5 rounded-lg bg-card/80 px-6 py-5">
      <Icon className="size-9 shrink-0 text-[var(--border-strong)]" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="type-eyebrow text-muted-foreground">{label}</span>
        <span className="type-label truncate text-[var(--border-strong)]">{children}</span>
      </div>
    </li>
  )
}

/** The title card on the Dataset page's identity surface: the type, the title, tags and contributors beside the type's
 *  illustration, then the facts on soft white cards. */
function TitleCard({ pub }: { pub: SamplePublication }) {
  const prototype = usePrototypeAction()
  const files = filesOf(pub)
  const facts = 3 + (pub.externalLink ? 1 : 0)

  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-2xl bg-secondary p-6 sm:p-8 lg:gap-10 lg:p-10">
      <div className="flex items-center justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-5 sm:w-[68%] sm:flex-none">
          <span className="type-label w-fit rounded-full bg-primary px-3.5 py-1 text-text-on-brand">{typeLabel(pub)}</span>
          <h1 className="type-display-2 text-pretty break-words text-primary">{pub.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Tag onClick={() => prototype('Searching by sector')}>{sectorLabel(pub)}</Tag>
            <Tag onClick={() => prototype('Searching by geography')}>{geographyLabel(pub)}</Tag>
          </div>
          <Contributors pub={pub} />
        </div>
        <img
          src={publicationIllustration(pub.resourceType)}
          alt=""
          className="hidden w-36 shrink-0 object-contain sm:block md:w-44 lg:mr-6 lg:w-52"
        />
      </div>
      <ul
        aria-label={`${typeLabel(pub)} details`}
        style={{ '--fact-cols': facts } as React.CSSProperties}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--fact-cols),minmax(0,1fr))]"
      >
        <FactCard icon={Scale} label="Licence">
          {licenceLabel(pub)}
        </FactCard>
        <FactCard icon={FileText} label={files.length > 1 ? 'Files' : 'File'}>
          {files.length > 1 ? `${files.length} files` : `${pub.file.extension} · ${pub.file.sizeLabel}`}
        </FactCard>
        <FactCard icon={CalendarDays} label="Published">
          {formatDate(pub.date)}
        </FactCard>
        {pub.externalLink && (
          <FactCard icon={Globe2} label="Source">
            <a
              href={pub.externalLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Original publication (opens in a new tab)"
              className="inline-flex max-w-full items-center gap-0.5 rounded-sm underline-offset-2 hover:text-text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <span className="truncate">Original publication</span>
              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
            </a>
          </FactCard>
        )}
      </ul>
    </div>
  )
}

/** The Collaborative page's stat-panel badge tints, one per highlight, so the three blocks read as a set. */
const HIGHLIGHT_BADGES = ['bg-chart-1/10', 'bg-chart-3/15', 'bg-chart-4/15']

/** Key highlights as the bento's second row: always three equal columns on the same surface as the title card, every block the
 *  same height (also when stacked). */
function HighlightBlocks({ pub }: { pub: SamplePublication }) {
  const items = pub.keyFindings.slice(0, 3)
  if (items.length === 0) return null
  return (
    <ol aria-label="Key highlights" className="grid auto-rows-fr gap-4 md:grid-cols-3">
      {items.map((f, i) => (
        <li key={f} className="flex flex-col gap-4 rounded-2xl bg-secondary p-6 sm:p-8">
          <span
            className={cn('type-heading-3 flex size-[45px] shrink-0 items-center justify-center rounded-full tabular-nums text-text-brand', HIGHLIGHT_BADGES[i])}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <p className="type-heading-3 font-normal text-text-default">{f}</p>
        </li>
      ))}
    </ol>
  )
}

/** The hero as a bento: the full-width title card, then the three key highlights. */
function Hero({ pub, proposed }: { pub: SamplePublication; proposed: boolean }) {
  return (
    <header className="flex flex-col gap-4">
      <ActionBar pub={pub} />
      <TitleCard pub={pub} />
      {proposed && <HighlightBlocks pub={pub} />}
    </header>
  )
}

/* ── The page ───────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

function PullQuote({ quote }: { quote: NonNullable<SamplePublication['pullQuote']> }) {
  return (
    <figure className="flex flex-col gap-3">
      <Quote className="size-7 text-accent" aria-hidden="true" />
      <blockquote className="type-display-2 font-normal text-text-default">“{quote.text}”</blockquote>
      <figcaption className="type-label text-text-subdued">{quote.attribution}</figcaption>
    </figure>
  )
}

/** The publication's metadata in the Dataset page's "Dataset information" pattern: icon + label/value fields in three columns,
 *  then divided sub-sections (contributors, source, citation). Only today's upload fields; an empty optional one drops out. */
function PublicationInformation({ pub }: { pub: SamplePublication }) {
  const termsUrl = LICENSE_TERMS_URLS[pub.usageRights]
  return (
    <Card>
      <CardHeader>
        <h2 className="type-heading-2 text-text-brand">{typeLabel(pub)} information</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <InfoField icon={FileText} label="Resource type" value={typeLabel(pub)} />
          {pub.sector && <InfoField icon={Layers} label="Sector" value={sectorLabel(pub)} />}
          {pub.geography && <InfoField icon={MapPin} label="Geography" value={geographyLabel(pub)} />}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <InfoField icon={CalendarDays} label="Published" value={formatDate(pub.date)} />
          {pub.usageRights && (
            <InfoField
              icon={Scale}
              label="Licence"
              value={
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span>{licenceLabel(pub)}</span>
                  {termsUrl && (
                    <a
                      href={termsUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View licence terms: ${licenceLabel(pub)}`}
                      className="inline-flex items-center gap-0.5 text-text-brand underline-offset-2 hover:underline focus-visible:underline"
                    >
                      View licence terms
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              }
            />
          )}
          <InfoField icon={Building2} label="Publisher" value={pub.publisher} />
        </div>

        <section aria-labelledby="pub-contributors" className="flex flex-col gap-4 border-t border-border-default pt-5">
          <h3 id="pub-contributors" className="type-heading-3 text-text-brand">
            Contributors
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pub.contributors.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <EntityAvatar kind="individual" name={c.name} imageUrl={null} className="size-10" />
                <span className="min-w-0">
                  <span className="type-label block break-words text-text-default">{c.name}</span>
                  {(c.designation || c.organisation) && (
                    <span className="type-caption block text-text-subdued">{[c.designation, c.organisation].filter(Boolean).join(', ')}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {pub.externalLink && (
          <section aria-labelledby="pub-source" className="flex flex-col gap-4 border-t border-border-default pt-5">
            <h3 id="pub-source" className="type-heading-3 text-text-brand">
              Source
            </h3>
            <div className="flex items-start gap-4">
              <Globe2 className="mt-0.5 size-6 shrink-0 text-[var(--border-strong)]" strokeWidth={1.5} aria-hidden="true" />
              <a
                href={pub.externalLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Original publication (opens in a new tab)"
                className="inline-flex max-w-full items-baseline gap-1 break-words text-base font-semibold text-text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                <span className="min-w-0 break-words">Original publication</span>
                <ArrowUpRight className="size-4 shrink-0 self-center" aria-hidden="true" />
              </a>
            </div>
          </section>
        )}

        <section aria-labelledby="pub-cite" className="flex flex-col gap-4 border-t border-border-default pt-5">
          <h3 id="pub-cite" className="type-heading-3 text-text-brand">
            Cite this
          </h3>
          <CiteBlock pub={pub} />
        </section>
      </CardContent>
    </Card>
  )
}

function TypeLedVariant({
  pub,
  onOpenPublication,
  proposed = false,
}: {
  pub: SamplePublication
  onOpenPublication: (id: string) => void
  /** Show the optional fields from the upload-flow proposal (key highlights, pull quote). */
  proposed?: boolean
}) {
  return (
    <div className="flex flex-col gap-12">
      <Hero pub={pub} proposed={proposed} />
      <FileShowcase pub={pub} />
      {proposed && pub.pullQuote && <PullQuote quote={pub.pullQuote} />}
      <ConnectionsSection pub={pub} headingId="connections-b" headingClassName="type-heading-2 text-text-brand" filled />
      <PublicationInformation pub={pub} />
      <ReadNext pub={pub} onOpen={onOpenPublication} filled />
    </div>
  )
}

export { TypeLedVariant }
