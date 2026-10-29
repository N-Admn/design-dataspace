import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Copy,
  Download,
  FileText,
  Globe2,
  Layers,
  MapPin,
  Scale,
  Share2,
  type LucideIcon,
} from 'lucide-react'

import { EntityAvatar } from '@/components/community/DirectoryParts'
import { PublicationFiles } from '@/components/publication/PublicationFiles'
import { InfoField } from '@/components/shared/InfoField'
import { SocialShareLinks } from '@/components/shared/SocialShareLinks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tag } from '@/components/ui/tag'
import { useToast } from '@/components/ui/toast'
import { formatShortDate } from '@/lib/format'
import { publicationIllustration } from '@/lib/publication-type'
import { searchFacetHref } from '@/lib/search-links'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, LICENSE_TERMS_URLS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationFileBlock, type PublicationFormState } from '@/types/publication'

/** The published Publication page. The type shows as a label and a hand-drawn illustration in the title card (policy brief,
 *  toolkit, report, case study, or a generic publication); colour stays on the brand surfaces the Dataset and Collaborative
 *  pages use. There is no thumbnail: a publication can hold several files, so no one file speaks for it. People read it file by
 *  file in the files browser, then the publication's information and citation. Only today's upload fields are used. */

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

interface PublicationPreviewProps {
  form: PublicationFormState
  /** Who published it: the owning Organisation Workspace, or the individual who created it. */
  publisher: { name: string; avatarUrl: string | null }
  publishedAt?: string
  /** Shown at the left of the action bar, e.g. a "Back" button. */
  onBack?: () => void
  /** Link the share menu points at. Defaults to the current page. */
  shareUrl?: string
}

/** "2026-07-15" (the form's date field) as "15 Jul 2026"; falls back to the record's last update. */
function displayDate(date: string, publishedAt?: string) {
  if (date) return formatShortDate(date.split('-').reverse().join('/'))
  return publishedAt ? formatShortDate(publishedAt) : null
}

const fileBlocksOf = (form: PublicationFormState) =>
  form.blocks.filter((b): b is PublicationFileBlock & { asset: NonNullable<PublicationFileBlock['asset']> } => b.type === 'file' && !!b.asset)

/* ── Hero ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** The bar above the hero, as on the Dataset and Collaborative pages: Back on the left; Download and Share on the right. */
function ActionBar({ form, onBack, shareUrl }: Pick<PublicationPreviewProps, 'form' | 'onBack' | 'shareUrl'>) {
  const toast = useToast()
  const files = fileBlocksOf(form)
  const only = files.length === 1 ? files[0].asset : null
  const title = form.metadata.name || 'Untitled Publication'
  const typeWord = form.metadata.resourceType ? optionLabel(RESOURCE_TYPE_OPTIONS, form.metadata.resourceType).toLowerCase() : 'publication'
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {onBack ? (
        <Button type="button" variant="ghost" size="sm" className="-ml-3 text-text-subdued hover:text-text-default" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {only?.dataUrl ? (
          <Button asChild size="lg">
            <a href={only.dataUrl} download={only.name}>
              <Download className="size-4" aria-hidden="true" />
              Download {only.extension.toUpperCase()}
            </a>
          </Button>
        ) : (
          files.length > 0 && (
            <Button
              type="button"
              size="lg"
              onClick={() =>
                toast({
                  title: 'Download coming soon',
                  description: files.length > 1 ? 'Download each file from the list below for now.' : 'This sample file has no stored copy.',
                })
              }
            >
              <Download className="size-4" aria-hidden="true" />
              {files.length > 1 ? 'Download all' : `Download ${files[0].asset.extension.toUpperCase()}`}
            </Button>
          )
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full border-primary bg-transparent text-primary hover:bg-primary/5"
              aria-label={`Share ${typeWord}`}
              title="Share"
            >
              <Share2 className="size-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-4">
            <p className="type-label text-text-default">Share this {typeWord}</p>
            <SocialShareLinks url={shareUrl ?? window.location.href} title={title} className="mt-3" />
          </PopoverContent>
        </Popover>
      </div>
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

/** The title card on the grey brand surface: the type, the title, tags and contributors beside the type's illustration, then
 *  the facts on soft white cards. Empty optional fields simply drop out. */
function TitleCard({ form, publisher, publishedAt }: Pick<PublicationPreviewProps, 'form' | 'publisher' | 'publishedAt'>) {
  const { metadata } = form
  const files = fileBlocksOf(form)
  const date = displayDate(metadata.date, publishedAt)
  const typeLabel = metadata.resourceType ? optionLabel(RESOURCE_TYPE_OPTIONS, metadata.resourceType) : null
  const facts = [metadata.usageRights, files.length > 0, date, metadata.externalLink].filter(Boolean).length

  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-2xl bg-secondary p-6 sm:p-8 lg:gap-10 lg:p-10">
      <div className="flex items-center justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-5 sm:w-[68%] sm:flex-none">
          {typeLabel && (
            <Link
              to={searchFacetHref('publication', 'resourceType', metadata.resourceType)}
              className="type-label w-fit rounded-full bg-primary px-3.5 py-1 text-text-on-brand transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
            >
              {typeLabel}
            </Link>
          )}
          <h1 className="type-display-2 text-pretty break-words text-primary">{metadata.name || 'Untitled Publication'}</h1>
          {(metadata.sector || metadata.geography) && (
            <ul className="flex flex-wrap gap-2" aria-label="Topics">
              {metadata.sector && (
                <li>
                  <Tag to={searchFacetHref('publication', 'sector', metadata.sector)}>{optionLabel(SECTOR_OPTIONS, metadata.sector)}</Tag>
                </li>
              )}
              {metadata.geography && (
                <li>
                  <Tag to={searchFacetHref('publication', 'geography', metadata.geography)}>{optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)}</Tag>
                </li>
              )}
            </ul>
          )}
          <div className="flex items-center gap-3">
            {metadata.contributors.length > 0 && (
              <div className="flex shrink-0 -space-x-2">
                {metadata.contributors.slice(0, 3).map((c) => (
                  <EntityAvatar key={c.id} kind="individual" name={c.name} imageUrl={c.image?.dataUrl ?? null} className="size-10 ring-2 ring-secondary" />
                ))}
              </div>
            )}
            <p className="type-body min-w-0">
              {metadata.contributors.length > 0 && (
                <span className="block font-medium text-text-default">{metadata.contributors.map((c) => c.name).join(', ')}</span>
              )}
              <span className={metadata.contributors.length > 0 ? 'block text-text-subdued' : 'block font-medium text-text-default'}>
                Published by {publisher.name}
              </span>
            </p>
          </div>
        </div>
        <img
          src={publicationIllustration(metadata.resourceType)}
          alt=""
          className="hidden w-36 shrink-0 object-contain sm:block md:w-44 lg:mr-6 lg:w-52"
        />
      </div>
      {facts > 0 && (
        <ul
          aria-label={`${typeLabel ?? 'Publication'} details`}
          style={{ '--fact-cols': facts } as React.CSSProperties}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--fact-cols),minmax(0,1fr))]"
        >
          {metadata.usageRights && (
            <FactCard icon={Scale} label="Licence">
              {optionLabel(LICENSE_OPTIONS, metadata.usageRights)}
            </FactCard>
          )}
          {files.length > 0 && (
            <FactCard icon={FileText} label={files.length > 1 ? 'Files' : 'File'}>
              {files.length > 1 ? `${files.length} files` : `${files[0].asset.extension.toUpperCase()} · ${files[0].asset.sizeLabel}`}
            </FactCard>
          )}
          {date && (
            <FactCard icon={CalendarDays} label="Published">
              {date}
            </FactCard>
          )}
          {metadata.externalLink && (
            <FactCard icon={Globe2} label="Source">
              <a
                href={metadata.externalLink}
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
      )}
    </div>
  )
}

/* ── Information ────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

function citationFor(form: PublicationFormState, publisher: string, publishedAt?: string) {
  const { metadata } = form
  const names = metadata.contributors.map((c) => c.name).join(', ')
  const year = metadata.date ? metadata.date.slice(0, 4) : publishedAt?.split(/[/ ]/)[2]
  const type = metadata.resourceType ? ` [${optionLabel(RESOURCE_TYPE_OPTIONS, metadata.resourceType)}]` : ''
  return `${names ? `${names} ` : ''}${year ? `(${year}). ` : ''}${metadata.name || 'Untitled Publication'}${type}. ${publisher}. CivicDataSpace.`
}

/** "Cite this": the citation as text and a copy button. */
function CiteBlock({ citation }: { citation: string }) {
  const toast = useToast()
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

/** The publication's metadata in the Dataset page's "Dataset information" pattern: icon + label/value fields in three columns,
 *  then divided sub-sections (contributors, source, citation). An empty optional field drops out. */
function PublicationInformation({ form, publisher, publishedAt }: Pick<PublicationPreviewProps, 'form' | 'publisher' | 'publishedAt'>) {
  const { metadata } = form
  const typeLabel = metadata.resourceType ? optionLabel(RESOURCE_TYPE_OPTIONS, metadata.resourceType) : 'Publication'
  const termsUrl = LICENSE_TERMS_URLS[metadata.usageRights]
  const date = displayDate(metadata.date, publishedAt)
  return (
    <Card>
      <CardHeader>
        <h2 className="type-heading-2 text-text-brand">{typeLabel} information</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <InfoField icon={FileText} label="Resource type" value={typeLabel} />
          {metadata.sector && <InfoField icon={Layers} label="Sector" value={optionLabel(SECTOR_OPTIONS, metadata.sector)} />}
          {metadata.geography && <InfoField icon={MapPin} label="Geography" value={optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)} />}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {date && <InfoField icon={CalendarDays} label="Published" value={date} />}
          {metadata.usageRights && (
            <InfoField
              icon={Scale}
              label="Licence"
              value={
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span>{optionLabel(LICENSE_OPTIONS, metadata.usageRights)}</span>
                  {termsUrl && (
                    <a
                      href={termsUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View licence terms: ${optionLabel(LICENSE_OPTIONS, metadata.usageRights)}`}
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
          <InfoField icon={Building2} label="Publisher" value={publisher.name} />
        </div>

        {metadata.contributors.length > 0 && (
          <section aria-labelledby="pub-contributors" className="flex flex-col gap-4 border-t border-border-default pt-5">
            <h3 id="pub-contributors" className="type-heading-3 text-text-brand">
              Contributors
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metadata.contributors.map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <EntityAvatar kind="individual" name={c.name} imageUrl={c.image?.dataUrl ?? null} className="size-10" />
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
        )}

        {metadata.externalLink && (
          <section aria-labelledby="pub-source" className="flex flex-col gap-4 border-t border-border-default pt-5">
            <h3 id="pub-source" className="type-heading-3 text-text-brand">
              Source
            </h3>
            <div className="flex items-start gap-4">
              <Globe2 className="mt-0.5 size-6 shrink-0 text-[var(--border-strong)]" strokeWidth={1.5} aria-hidden="true" />
              <a
                href={metadata.externalLink}
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
          <CiteBlock citation={citationFor(form, publisher.name, publishedAt)} />
        </section>
      </CardContent>
    </Card>
  )
}

function PublicationPreview({ form, publisher, publishedAt, onBack, shareUrl }: PublicationPreviewProps) {
  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <ActionBar form={form} onBack={onBack} shareUrl={shareUrl} />
        <TitleCard form={form} publisher={publisher} publishedAt={publishedAt} />
      </header>
      <PublicationFiles blocks={form.blocks} />
      <PublicationInformation form={form} publisher={publisher} publishedAt={publishedAt} />
    </article>
  )
}

export { PublicationPreview }
