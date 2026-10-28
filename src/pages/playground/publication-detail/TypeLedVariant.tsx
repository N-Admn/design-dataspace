import * as React from 'react'
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe2,
  Layers,
  MapPin,
  Presentation,
  Quote,
  Scale,
  Share2,
} from 'lucide-react'

import { EntityAvatar } from '@/components/community/DirectoryParts'
import { InfoField } from '@/components/shared/InfoField'
import { ResourcePreviewDialog, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { LICENSE_TERMS_URLS } from '@/types/dataset'
import { FileShowcase, UnplayableVideo, YouTubePlayer, parseYouTubeId } from '@/pages/playground/publication-detail/FileShowcase'
import {
  ACCENT,
  BarFigure,
  CiteBlock,
  ConnectionsSection,
  DocumentCover,
  ReadNext,
  formatDate,
  geographyLabel,
  licenceLabel,
  sectorLabel,
  treatmentOf,
  typeLabel,
  usePrototypeAction,
} from '@/pages/playground/publication-detail/publication-shared'
import type { SamplePublication, Treatment } from '@/pages/playground/publication-detail/publication-sample-data'

/** Variant B, "Shaped by type", built only from what today's publication upload flow collects (details, contributors,
 *  classification, the uploaded files and videos), so every type goes live through the one existing flow.
 *
 *  The type changes the page subtly, never its fields or interactions:
 *  - its accent colour (the cover tile and the type badge),
 *  - its shape: documents get a portrait cover and a paged reader; presentations a landscape cover and a slide stage that leads;
 *    toolkits and guides lead with their files (a toolkit is a bundle of uploaded templates); articles, field notes and case
 *    studies read as one continuous column,
 *  - the order of its sections.
 *  Interactions are the same everywhere: turn pages, preview a file, download.
 *
 *  With `proposed`, three optional fields from the upload-flow proposal are shown too: key highlights, a pull quote and a
 *  cover image. Containers are borderless soft tiles, the same surface language as the Collaborative and Dataset pages. */

type Shape = 'document' | 'slides' | 'bundle' | 'reading'

const SHAPE_BY_TREATMENT: Record<Treatment, Shape> = {
  brief: 'document',
  report: 'document',
  deck: 'slides',
  toolkit: 'bundle',
  article: 'reading',
  'field-note': 'reading',
  'case-study': 'reading',
}

/** A borderless tile on the soft page-background fill. */
const TILE = 'rounded-2xl bg-page-background'

interface FileItem {
  title: string
  description?: string
  extension: string
  sizeLabel: string
}

const filesOf = (pub: SamplePublication): FileItem[] => [pub.file, ...(pub.extraFiles ?? [])]

const lengthLabel = (pub: SamplePublication) => {
  const n = pub.pages.length
  return treatmentOf(pub) === 'deck' ? `${n} slide${n === 1 ? '' : 's'}` : `${n} page${n === 1 ? '' : 's'}`
}

/* ── Hero ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

function Cover({ pub, shape, proposed }: { pub: SamplePublication; shape: Shape; proposed: boolean }) {
  const accent = ACCENT[treatmentOf(pub)]
  const landscape = shape === 'slides'
  return (
    <div className={cn('flex items-center justify-center rounded-2xl p-6 sm:p-8', accent.soft)}>
      {proposed && pub.coverImageUrl ? (
        <img
          src={pub.coverImageUrl}
          alt=""
          className={cn('w-full rounded-lg object-cover shadow-lg', landscape ? 'aspect-[16/10] max-w-sm lg:max-w-none' : 'aspect-[3/4] max-w-[9rem] lg:max-w-[15rem]')}
        />
      ) : (
        <DocumentCover pub={pub} landscape={landscape} className={cn('w-full', landscape ? 'max-w-sm lg:max-w-none' : 'max-w-[9rem] lg:max-w-[15rem]')} />
      )}
    </div>
  )
}

function Contributors({ pub }: { pub: SamplePublication }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 -space-x-2">
        {pub.contributors.slice(0, 3).map((c) => (
          <EntityAvatar key={c.name} kind="individual" name={c.name} imageUrl={null} className="size-10 ring-2 ring-page-background" />
        ))}
      </div>
      <p className="type-body min-w-0">
        <span className="block font-medium text-text-default">{pub.contributors.map((c) => c.name).join(', ')}</span>
        <span className="block text-text-subdued">Published by {pub.publisher}</span>
      </p>
    </div>
  )
}

function Hero({ pub, shape, proposed }: { pub: SamplePublication; shape: Shape; proposed: boolean }) {
  const prototype = usePrototypeAction()
  const toast = useToast()
  const accent = ACCENT[treatmentOf(pub)]
  const files = filesOf(pub)
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied' })
    } catch {
      prototype('Sharing')
    }
  }
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: 'Licence', value: licenceLabel(pub) },
    { label: 'Length', value: lengthLabel(pub) },
    { label: files.length > 1 ? 'Files' : 'File', value: files.length > 1 ? `${files.length} files` : `${pub.file.extension} · ${pub.file.sizeLabel}` },
    { label: 'Published', value: formatDate(pub.date) },
  ]

  return (
    <header className={cn('grid gap-4', shape === 'slides' ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]' : 'lg:grid-cols-[minmax(0,1fr)_18rem]')}>
      <div className={cn(TILE, 'flex min-w-0 flex-col gap-5 p-6 sm:p-8')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline" className={cn('gap-1.5 border-transparent', accent.soft)}>
            <span className={cn('size-2 rounded-full', accent.fill)} aria-hidden="true" />
            {typeLabel(pub)}
          </Badge>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => prototype('Downloading the file')}>
              <Download className="size-4" />
              Download {files.length > 1 ? 'all' : pub.file.extension}
            </Button>
            <Button type="button" variant="outline" size="icon" className="rounded-full bg-card" onClick={share} aria-label="Share">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
        <h1 className="type-display-1 text-pretty text-text-default">{pub.title}</h1>
        <p className="type-heading-3 max-w-3xl font-normal text-text-secondary">{pub.description}</p>
        <div className="flex flex-wrap gap-2">
          <Tag onClick={() => prototype('Searching by sector')}>{sectorLabel(pub)}</Tag>
          <Tag onClick={() => prototype('Searching by geography')}>{geographyLabel(pub)}</Tag>
        </div>
        <Contributors pub={pub} />
        <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-card p-4 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="type-caption text-text-subdued">{f.label}</dt>
              <dd className="type-label truncate text-text-brand">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Cover pub={pub} shape={shape} proposed={proposed} />
    </header>
  )
}

/* ── Reading the file ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** One page or slide, drawn as paper. A stand-in for the uploaded PDF/PPTX rendered in the browser. */
function Sheet({ pub, page }: { pub: SamplePublication; page: number }) {
  const slides = treatmentOf(pub) === 'deck'
  const current = pub.pages[page]
  if (!current) return null
  return (
    <article
      aria-live="polite"
      className={cn(
        'mx-auto flex w-full flex-col gap-4 bg-card shadow-sm',
        slides ? 'aspect-video max-w-4xl justify-center rounded-lg p-6 sm:p-12' : 'min-h-[30rem] max-w-2xl rounded-md p-6 sm:p-12',
      )}
    >
      {!slides && (
        <header className="type-caption flex justify-between gap-4 text-text-subdued">
          <span className="min-w-0 truncate">{pub.title}</span>
          <span className="shrink-0 tabular-nums">{page + 1}</span>
        </header>
      )}
      <h3 className={cn('text-text-brand', slides && page === 0 ? 'type-display-2' : 'type-heading-1')}>{current.heading}</h3>
      {current.paragraphs.map((p) => (
        <p key={p} className={cn('type-body', slides ? 'text-text-secondary' : 'text-text-default')}>
          {p}
        </p>
      ))}
      {current.figure && <BarFigure figure={current.figure} />}
    </article>
  )
}

/** The paged reader: contents on the left (from the file's own bookmarks), the page on a soft tile, previous / next. */
function PagedReader({ pub, title }: { pub: SamplePublication; title: string }) {
  const [page, setPage] = React.useState(0)
  React.useEffect(() => setPage(0), [pub.id])
  const slides = treatmentOf(pub) === 'deck'
  const unit = slides ? 'Slide' : 'Page'
  const total = pub.pages.length
  const go = (next: number) => setPage(Math.max(0, Math.min(total - 1, next)))
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <SectionHeader as="h2" title={title} />
      <div className={cn(TILE, 'grid gap-4 p-3 sm:p-4', !slides && 'lg:grid-cols-[15rem_minmax(0,1fr)]')}>
        {!slides && (
          <nav aria-label="Contents" className="flex flex-col gap-1 p-2">
            <p className="type-eyebrow px-3 pb-1 uppercase text-text-subdued">Contents</p>
            <ol className="flex flex-col gap-0.5">
              {pub.pages.map((p, i) => (
                <li key={`${p.heading}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setPage(i)}
                    aria-current={i === page ? 'page' : undefined}
                    className={cn(
                      'type-body flex w-full gap-2 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                      i === page ? 'bg-card font-medium text-text-default' : 'text-text-secondary hover:bg-card/60',
                    )}
                  >
                    <span className="type-caption w-4 shrink-0 pt-0.5 tabular-nums text-text-subdued">{i + 1}</span>
                    <span className="min-w-0">{p.heading}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex min-w-0 flex-col gap-4 py-2">
          <Sheet pub={pub} page={page} />
          <div className="flex items-center justify-between gap-3 px-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => go(page - 1)} disabled={page === 0}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="type-label tabular-nums text-text-subdued">
              {unit} {page + 1} of {total}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => go(page + 1)} disabled={page === total - 1}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** The continuous reader for article-like types: the file's text as one column, no page chrome. */
function ContinuousReader({ pub, quote }: { pub: SamplePublication; quote?: SamplePublication['pullQuote'] }) {
  return (
    <section aria-label="Read" className="flex max-w-3xl flex-col gap-8">
      {pub.pages.map((p, i) => (
        <React.Fragment key={`${p.heading}-${i}`}>
          <div className="flex flex-col gap-3">
            <h2 className="type-heading-2 text-text-brand">{p.heading}</h2>
            {p.paragraphs.map((para) => (
              <p key={para} className="type-body text-text-default">
                {para}
              </p>
            ))}
            {p.figure && (
              <div className={cn(TILE, 'p-5')}>
                <BarFigure figure={p.figure} />
              </div>
            )}
          </div>
          {i === 0 && quote && <PullQuote quote={quote} />}
        </React.Fragment>
      ))}
    </section>
  )
}

/** The uploaded files: each with its title, description, format and size; preview opens the platform's preview dialog. */
function FilesSection({ pub, title, description }: { pub: SamplePublication; title: string; description?: string }) {
  const prototype = usePrototypeAction()
  const [preview, setPreview] = React.useState<PreviewResource | null>(null)
  const files = filesOf(pub)
  const Icon = treatmentOf(pub) === 'deck' ? Presentation : FileText
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <SectionHeader as="h2" title={title} description={description} />
      <ul className={cn('grid gap-3', files.length > 1 && 'md:grid-cols-2')}>
        {files.map((f) => (
          <li key={f.title} className={cn(TILE, 'flex items-start gap-4 p-4')}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-text-brand" aria-hidden="true">
              <Icon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="type-label text-text-default">{f.title}</p>
              {f.description && <p className="type-body text-text-secondary">{f.description}</p>}
              <p className="type-caption text-text-subdued">
                {f.extension} · {f.sizeLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Preview ${f.title}`}
                onClick={() => setPreview({ title: f.title, fileName: `${f.title}.${f.extension.toLowerCase()}`, extension: f.extension, sizeLabel: f.sizeLabel })}
              >
                <Eye className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Download ${f.title}`} onClick={() => prototype(`Downloading “${f.title}”`)}>
                <Download className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ResourcePreviewDialog resource={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </section>
  )
}

/* ── Proposed optional fields ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Key highlights: up to three one-line points, the same for every type. */
function Highlights({ pub }: { pub: SamplePublication }) {
  const accent = ACCENT[treatmentOf(pub)]
  const items = pub.keyFindings.slice(0, 3)
  if (items.length === 0) return null
  return (
    <section aria-label="In brief" className="flex flex-col gap-4">
      <SectionHeader as="h2" title="In brief" />
      <ol className={cn('grid gap-4', items.length > 1 && 'md:grid-cols-3')}>
        {items.map((f, i) => (
          <li key={f} className={cn(TILE, 'flex flex-col gap-3 p-6')}>
            <span className={cn('type-heading-3 flex size-9 items-center justify-center rounded-full tabular-nums text-text-brand', accent.soft)} aria-hidden="true">
              {i + 1}
            </span>
            <p className="type-heading-3 font-normal text-text-default">{f}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function PullQuote({ quote }: { quote: NonNullable<SamplePublication['pullQuote']> }) {
  return (
    <figure className="flex flex-col gap-3">
      <Quote className="size-7 text-accent" aria-hidden="true" />
      <blockquote className="type-display-2 font-normal text-text-default">“{quote.text}”</blockquote>
      <figcaption className="type-label text-text-subdued">{quote.attribution}</figcaption>
    </figure>
  )
}

/* ── The page ───────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

export type Layout = 'shaped' | 'showcase'

function Body({ pub, shape, proposed, layout }: { pub: SamplePublication; shape: Shape; proposed: boolean; layout: Layout }) {
  const quote = proposed ? pub.pullQuote : undefined
  const highlights = proposed ? <Highlights pub={pub} /> : null
  const youtubeId = pub.video ? parseYouTubeId(pub.video.url) : null
  const video = pub.video ? (
    <section aria-label="Video" className="flex max-w-3xl flex-col gap-4">
      <SectionHeader as="h2" title="Watch" description={pub.video.title} />
      {youtubeId ? <YouTubePlayer id={youtubeId} title={pub.video.title} /> : <UnplayableVideo url={pub.video.url} />}
    </section>
  ) : null
  if (layout === 'showcase') {
    return (
      <>
        {highlights}
        <FileShowcase pub={pub} />
        {quote && <PullQuote quote={quote} />}
      </>
    )
  }
  const extraFiles = (pub.extraFiles?.length ?? 0) > 0

  switch (shape) {
    case 'slides':
      return (
        <>
          <PagedReader pub={pub} title="Slides" />
          {video}
          {highlights}
          {quote && <PullQuote quote={quote} />}
        </>
      )
    case 'bundle':
      return (
        <>
          <FilesSection pub={pub} title="What’s inside" description={`${filesOf(pub).length} files you can preview or download.`} />
          {highlights}
          <PagedReader pub={pub} title={`Read the ${typeLabel(pub).split(' /')[0].toLowerCase()}`} />
          {quote && <PullQuote quote={quote} />}
          {video}
        </>
      )
    case 'reading':
      return (
        <>
          {highlights}
          <ContinuousReader pub={pub} quote={quote} />
          {extraFiles && <FilesSection pub={pub} title="Files" />}
          {video}
        </>
      )
    default:
      return (
        <>
          {highlights}
          <PagedReader pub={pub} title={`Read the ${typeLabel(pub).toLowerCase()}`} />
          {quote && <PullQuote quote={quote} />}
          {extraFiles && <FilesSection pub={pub} title="Files" />}
          {video}
        </>
      )
  }
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
  layout = 'shaped',
}: {
  pub: SamplePublication
  onOpenPublication: (id: string) => void
  /** Show the optional fields from the upload-flow proposal (highlights, pull quote, cover image). */
  proposed?: boolean
  /** `shaped`: the body takes the type's shape. `showcase`: the files and videos in the Dataset page's list + viewer layout. */
  layout?: Layout
}) {
  const shape = SHAPE_BY_TREATMENT[treatmentOf(pub)]
  return (
    <div className="flex flex-col gap-12">
      <Hero pub={pub} shape={shape} proposed={proposed} />
      <Body pub={pub} shape={shape} proposed={proposed} layout={layout} />
      <ConnectionsSection pub={pub} headingId="connections-b" headingClassName="type-heading-2 text-text-brand" filled />
      <PublicationInformation pub={pub} />
      <ReadNext pub={pub} onOpen={onOpenPublication} filled />
    </div>
  )
}

export { TypeLedVariant }
