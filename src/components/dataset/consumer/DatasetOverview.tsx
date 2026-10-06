import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
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
import { formatIsoDateShort, formatShortDate } from '@/lib/format'
import type { DatasetPublisher } from '@/lib/dataset-publisher'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  PROMPT_DOMAIN_OPTIONS,
  SECTOR_OPTIONS,
  TARGET_LANGUAGE_OPTIONS,
  TARGET_MODEL_TYPE_OPTIONS,
  TASK_TYPE_OPTIONS,
  type DatasetFormState,
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

/** A label/value pair. With an `icon`, the icon sits beside the pair and is vertically centred on it. */
function InfoField({
  label,
  value,
  className,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  className?: string
  icon?: LucideIcon
}) {
  const content = (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">
        {label}
      </p>
      <div className="mt-1 min-w-0 text-sm text-text-default">{value}</div>
    </div>
  )
  if (!Icon) return <div className={className}>{content}</div>
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Icon
        className="size-6 shrink-0 text-[var(--border-strong)]"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {content}
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
function DatasetOverview({ form, publisher, updatedAt }: DatasetOverviewProps) {
  const { metadata, datasetType, promptDatasetMetadata } = form
  const isPromptDataset = datasetType === 'prompt_dataset'

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
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <InfoField
            icon={Layers}
            label="Sector"
            value={
              metadata.sector
                ? optionLabel(SECTOR_OPTIONS, metadata.sector)
                : '—'
            }
          />
          <InfoField
            icon={MapPin}
            label="Geography"
            value={
              metadata.geography
                ? optionLabel(GEOGRAPHY_OPTIONS, metadata.geography)
                : '—'
            }
          />
          <InfoField
            icon={Building2}
            label="Publisher"
            value={publisher.name}
          />
          <InfoField
            icon={Globe2}
            label="Source"
            value={
              metadata.sourceWebsite ? (
                <a
                  href={metadata.sourceWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 break-all text-text-brand underline-offset-2 hover:underline focus-visible:underline"
                >
                  {metadata.sourceWebsite}
                </a>
              ) : (
                '—'
              )
            }
          />
          <InfoField
            icon={CalendarPlus}
            label="Created"
            value={
              metadata.createDate
                ? formatIsoDateShort(metadata.createDate)
                : '—'
            }
          />
          <InfoField
            icon={CalendarDays}
            label="Last updated"
            value={formatShortDate(updatedAt)}
          />
          <InfoField
            icon={LockOpen}
            label="Access"
            value={
              metadata.accessType
                ? metadata.accessType === 'open'
                  ? 'Open Access'
                  : 'Restricted Access'
                : '—'
            }
          />
          <InfoField
            icon={Scale}
            label="License"
            value={
              metadata.license
                ? optionLabel(LICENSE_OPTIONS, metadata.license)
                : '—'
            }
          />
          <InfoField
            icon={Tag}
            label="Tags"
            // Spans the full card width instead of sharing one grid column with
            // Sector/Geography/etc. — a handful of tags already crowded a
            // quarter-width column, and it needs to keep working as the tag
            // count grows, not just fit today's five.
            className="sm:col-span-2 lg:col-span-3 xl:col-span-4"
            value={
              metadata.tags.length > 0 ? (
                // Single line, scrollable — a wrapping grid of tags pushed the rest
                // of the metadata grid down unpredictably as tag counts grew.
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
              ) : (
                '—'
              )
            }
          />
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
