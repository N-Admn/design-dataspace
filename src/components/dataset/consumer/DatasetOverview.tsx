import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CalendarPlus,
  Globe2,
  Layers,
  LockOpen,
  MapPin,
  Scale,
  Tag,
  type LucideIcon,
} from 'lucide-react'

import { badgeVariants } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { InfoField } from '@/components/shared/InfoField'
import { formatIsoDateShort, formatShortDate } from '@/lib/format'
import type { DatasetPublisher } from '@/lib/dataset-publisher'
import { resolveLicenseUrl } from '@/lib/dataset-license'
import { getDatasetSources, sourceDisplayName } from '@/lib/dataset-sources'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  PROMPT_DOMAIN_OPTIONS,
  SECTOR_OPTIONS,
  TARGET_LANGUAGE_OPTIONS,
  TARGET_MODEL_TYPE_OPTIONS,
  TASK_TYPE_OPTIONS,
  type DatasetFormState,
  type DatasetSource,
} from '@/types/dataset'

function optionLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Card headings here match the Data tab's "Data files" heading (type-heading-2). The shared
 *  CardTitle is type-heading-3, and the two classes can't be merged reliably, so this is a local h3. */
function OverviewCardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 data-slot="card-title" className="type-heading-2 text-text-brand">
      {children}
    </h3>
  )
}

/** The publisher's logo/avatar when one is actually set, otherwise an
 *  initials circle — never an invented placeholder photo. Used only in
 *  "About the publisher"; the header and Dataset Information's Publisher
 *  field stay text-only. */
function PublisherAvatar({ publisher }: { publisher: DatasetPublisher }) {
  if (publisher.avatarUrl) {
    return (
      <img
        src={publisher.avatarUrl}
        alt=""
        className="size-16 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-accent text-base font-semibold text-text-on-accent"
    >
      {initials(publisher.name) || <Building2 className="size-6" />}
    </div>
  )
}

function labelsFor(
  options: { value: string; label: string }[],
  values: string[],
): string {
  return values.length > 0
    ? values.map((v) => optionLabel(options, v)).join(', ')
    : '—'
}

/** One compact provenance row: an icon and a prominent title. With a link, the title itself is the link and ends in a small
 *  external-link icon; without one it is plain text, never styled as clickable. */
function ProvenanceRow({
  icon: Icon,
  title,
  href,
}: {
  icon: LucideIcon
  title: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon
        className="mt-0.5 size-6 shrink-0 text-[var(--border-strong)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            title={href}
            aria-label={`${title} (opens in a new tab)`}
            className="inline-flex max-w-full items-baseline gap-1 break-words text-base font-semibold text-text-brand underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <span className="min-w-0 break-words">{title}</span>
            <ArrowUpRight className="size-4 shrink-0 self-center" aria-hidden="true" />
          </a>
        ) : (
          <p className="break-words text-base font-semibold text-text-default">{title}</p>
        )}
      </div>
    </div>
  )
}

/** The dataset's documented sources as compact rows with subtle dividers. A source with a website has its name as the link;
 *  one without is plain text. More than two collapse behind "View all sources". */
const SOURCES_SHOWN_COLLAPSED = 2
function SourcesList({ sources }: { sources: DatasetSource[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? sources : sources.slice(0, SOURCES_SHOWN_COLLAPSED)
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ul className="flex min-w-0 flex-col divide-y divide-border-default">
        {visible.map((source) => (
          <li key={source.id} className="min-w-0 py-3 first:pt-0 last:pb-0">
            <ProvenanceRow
              icon={Globe2}
              title={sourceDisplayName(source)}
              href={source.websiteUrl || undefined}
            />
          </li>
        ))}
      </ul>
      {sources.length > SOURCES_SHOWN_COLLAPSED && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="self-center text-sm font-medium text-text-brand underline-offset-2 hover:underline focus-visible:underline"
        >
          {expanded
            ? 'Show fewer sources'
            : `View all ${sources.length} sources`}
        </button>
      )}
    </div>
  )
}

interface DatasetOverviewProps {
  form: DatasetFormState
  publisher: DatasetPublisher
  updatedAt: string
}

/** Helps a visitor understand a dataset before touching the actual data. Keeps
 *  dataset-level metadata (this component) separate from resource/file-level
 *  metadata, which lives in the Data view instead — see `DatasetDataExplorer`. */
/** TEMPORARY: placeholder sources shown on every dataset details page while the layout is reviewed — some with links,
 *  some without. Replace with `getDatasetSources(metadata)` once real data is wired in. */
const PLACEHOLDER_SOURCES: DatasetSource[] = [
  {
    id: 'ph-1',
    name: 'data.gov.in',
    websiteUrl: 'https://data.gov.in',
  },
  {
    id: 'ph-2',
    name: 'Reserve Bank of India',
    websiteUrl: 'https://www.rbi.org.in',
  },
  {
    id: 'ph-3',
    name: 'Ministry of Statistics and Programme Implementation',
    websiteUrl: '',
  },
  {
    id: 'ph-4',
    name: 'National Sample Survey Office',
    websiteUrl: '',
  },
  {
    id: 'ph-5',
    name: 'World Bank Open Data',
    websiteUrl: 'https://data.worldbank.org',
  },
]

function DatasetOverview({ form, publisher, updatedAt }: DatasetOverviewProps) {
  const { metadata, datasetType, promptDatasetMetadata } = form
  const isPromptDataset = datasetType === 'prompt_dataset'
  const savedSources = getDatasetSources(metadata)
  const sources = savedSources.length >= 4 ? savedSources : PLACEHOLDER_SOURCES
  const licenseUrl = resolveLicenseUrl(metadata)

  return (
    <div className="flex flex-col gap-6 py-6">
      <h2 className="sr-only">Overview</h2>
      <Card>
        <CardHeader>
          <OverviewCardTitle>About this dataset</OverviewCardTitle>
        </CardHeader>
        <CardContent>
          {/* The description runs the full width of the card. */}
          <p className="text-sm leading-relaxed text-text-default">
            {metadata.description ||
              'No description has been provided for this dataset.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <OverviewCardTitle>Dataset information</OverviewCardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Core classification: three equal columns. Optional fields drop out when the dataset has no value. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {metadata.sector && (
              <InfoField
                icon={Layers}
                label="Sector"
                value={optionLabel(SECTOR_OPTIONS, metadata.sector)}
              />
            )}
            {metadata.geography && (
              <InfoField
                icon={MapPin}
                label="Geography"
                value={optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)}
              />
            )}
            <InfoField
              icon={Building2}
              label="Publisher"
              value={publisher.name}
            />
          </div>

          {/* Lifecycle and access: three equal columns. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {metadata.createDate && (
              <InfoField
                icon={CalendarPlus}
                label="Created"
                value={formatIsoDateShort(metadata.createDate)}
              />
            )}
            <InfoField
              icon={CalendarDays}
              label="Last updated"
              value={formatShortDate(updatedAt)}
            />
            {metadata.accessType && (
              <InfoField
                icon={LockOpen}
                label="Access"
                value={
                  metadata.accessType === 'open'
                    ? 'Open Access'
                    : 'Restricted Access'
                }
              />
            )}
            {metadata.license && (
              <InfoField
                icon={Scale}
                label="Licence"
                value={
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span>
                      {optionLabel(LICENSE_OPTIONS, metadata.license)}
                    </span>
                    {licenseUrl && (
                      <a
                        href={licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={licenseUrl}
                        aria-label={`View licence terms: ${optionLabel(LICENSE_OPTIONS, metadata.license)}`}
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
          </div>

          {metadata.tags.length > 0 && (
            <div className="border-t border-border-default pt-5">
              <div className="min-w-0">
                {
                  <InfoField
                    icon={Tag}
                    label="Tags"
                    // Spans the full card width — it has to keep working as the tag count grows, not just fit today's five.
                    value={
                      // Single line, scrollable — a wrapping grid of tags pushed the rest of the card down unpredictably.
                      <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-1">
                        {metadata.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/search?type=dataset&tag=${encodeURIComponent(tag)}`}
                            className={cn(
                              badgeVariants({ variant: 'muted' }),
                              'shrink-0 transition-colors hover:bg-surface-accent hover:text-text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                            )}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    }
                  />
                }
              </div>
            </div>
          )}

          <section
            aria-labelledby="dataset-provenance-heading"
            className="flex flex-col gap-4 border-t border-border-default pt-5"
          >
            <h4
              id="dataset-provenance-heading"
              className="type-heading-3 text-text-brand"
            >
              Source &amp; Provenance
            </h4>
            {/* No field labels: a source is identified by its name. A dash stands in when the dataset documents no source. */}
            <div className="min-w-0">
              {sources.length > 0 ? (
                <SourcesList sources={sources} />
              ) : (
                <ProvenanceRow icon={Globe2} title="—" />
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      {isPromptDataset && (
        <Card>
          <CardHeader>
            <OverviewCardTitle>Prompt Dataset details</OverviewCardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoField
              label="Task type"
              value={
                promptDatasetMetadata.taskType
                  ? optionLabel(
                      TASK_TYPE_OPTIONS,
                      promptDatasetMetadata.taskType,
                    )
                  : '—'
              }
            />
            <InfoField
              label="Domain"
              value={
                promptDatasetMetadata.domain
                  ? optionLabel(
                      PROMPT_DOMAIN_OPTIONS,
                      promptDatasetMetadata.domain,
                    )
                  : '—'
              }
            />
            <InfoField
              label="Target languages"
              value={labelsFor(
                TARGET_LANGUAGE_OPTIONS,
                promptDatasetMetadata.targetLanguages,
              )}
            />
            <InfoField
              label="Target model types"
              value={labelsFor(
                TARGET_MODEL_TYPE_OPTIONS,
                promptDatasetMetadata.targetModelTypes,
              )}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <OverviewCardTitle>About the publisher</OverviewCardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <PublisherAvatar publisher={publisher} />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-sm font-medium text-text-default">
              {publisher.name}
            </p>
            {publisher.description && (
              <p className="max-w-3xl text-sm text-text-subdued">
                {publisher.description}
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-subdued">
              {publisher.location && <span>{publisher.location}</span>}
              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-brand underline-offset-2 hover:underline focus-visible:underline"
                >
                  {publisher.website}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { DatasetOverview }
