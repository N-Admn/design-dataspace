import * as React from 'react'
import {
  Building2,
  CalendarDays,
  Download,
  Landmark,
  MapPin,
  Share2,
  type LucideIcon,
} from 'lucide-react'

import { DatasetDetailHeader } from '@/components/dataset/consumer/DatasetDetailHeader'
import { ViewTabs } from '@/components/shared/ViewTabs'
import { useAppData } from '@/context/AppDataContext'
import { DataDNAPlayground } from '@/pages/playground/data-dna/DataDNAPlayground'
import {
  resolveDatasetPublisher,
  type DatasetPublisher,
} from '@/lib/dataset-publisher'
import { formatShortDate } from '@/lib/format'
import {
  GEOGRAPHY_OPTIONS,
  SECTOR_OPTIONS,
  type DatasetMetadata,
  type DatasetRecord,
} from '@/types/dataset'

/**
 * Visual-only comparison of the Dataset Details header — NOT part of the product. Variant A renders the
 * production DatasetDetailHeader unchanged; Variant B is an experimental dark-navy header that borrows the
 * More-menu visual language. All experimental styling lives in this file.
 */

const SAMPLE_DATASET_ID = 'ds-1'

// Test-only stand-in; not production data.
const LONG_TITLE =
  'National Economic Indicators, GDP Growth Projections & Sector-wise Fiscal Performance Across States and Union Territories (2020–2026)'

// The live header now looks like V5, so earlier versions that were built from the live header restore their own
// card look here with playground-only overrides.
// V1: the original live header: gradient cards, 26px icons, navy values.
const LEGACY_CARDS =
  '[&_li]:bg-transparent! [&_li]:bg-[linear-gradient(252deg,var(--workspace-hero-from)_0%,var(--workspace-hero-to)_97.53%)]! [&_li]:bg-origin-border! [&_li_svg]:size-[26px]! [&_li_svg]:text-primary/70! [&_li_div>span:last-child]:text-primary!'
// V6: bare cards (no fill), 36.4px icons in the previous navy tint, grey values.
const BARE_CARDS = '[&_li]:bg-transparent! [&_li_svg]:text-primary/70!'
// V7: V6 with a circular --workspace-hero-to (#d3e9ff) disc behind each icon (56.4px disc, 36.4px glyph), navy values.
const ICON_DISCS =
  '[&_li]:bg-transparent! [&_li_svg]:text-primary/70! [&_li_svg]:size-[56.4px]! [&_li_svg]:p-[10px]! [&_li_svg]:rounded-full [&_li_svg]:bg-[var(--workspace-hero-to)] [&_li_div>span:last-child]:text-primary!'

const VIEWS = [
  { key: 'overview', label: 'Overview' },
  { key: 'data', label: 'Data' },
  { key: 'visualisations', label: 'Visualisations' },
]

const optionLabel = (
  options: { value: string; label: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value

function FrameLabel({ children, note }: { children: string; note: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
        {children}
      </span>
      <span className="text-sm text-muted-foreground">{note}</span>
    </div>
  )
}

function SampleBreadcrumb({ title }: { title: string }) {
  return (
    <p className="truncate text-xs font-medium text-primary">
      Home <span aria-hidden="true">›</span> Explore{' '}
      <span aria-hidden="true">›</span> Datasets{' '}
      <span aria-hidden="true">›</span>{' '}
      <span className="text-muted-foreground">{title}</span>
    </p>
  )
}

function PlaceholderContent() {
  return (
    <section className="flex flex-col gap-3" aria-label="Placeholder content">
      <h2 className="type-heading-3 text-text-default">About this dataset</h2>
      <div className="h-3 w-full max-w-3xl rounded bg-muted" />
      <div className="h-3 w-full max-w-2xl rounded bg-muted" />
      <div className="h-3 w-3/5 max-w-xl rounded bg-muted" />
    </section>
  )
}

/** A Dataset Details-shaped frame: breadcrumb → header → tabs → placeholder. */
function Frame({
  idPrefix,
  title,
  children,
}: {
  idPrefix: string
  title: string
  children: React.ReactNode
}) {
  const [view, setView] = React.useState('overview')
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-dashed border-border-default p-4 sm:p-6">
      <SampleBreadcrumb title={title} />
      {children}
      <ViewTabs
        items={VIEWS}
        value={view}
        onChange={setView}
        idPrefix={idPrefix}
        label="Dataset views (demo)"
      />
      <PlaceholderContent />
    </div>
  )
}

type Tone = 'navy' | 'gradient' | 'page'

/** Surface treatments per variant. Navy is the original Proposed look; gradient reuses the Dashboard
 *  "My Workspace" wash (--workspace-hero-from → --workspace-hero-to) with brand-navy text. */
const TONES: Record<
  Tone,
  {
    surface: string
    title: string
    card: string
    icon: string
    label: string
    value: string
    share: string
    count: string
    ring: string
  }
> = {
  navy: {
    surface: 'bg-header-background text-primary-foreground',
    title: 'text-primary-foreground',
    card: 'border-primary-foreground/10 bg-primary-foreground/[0.07]',
    icon: 'text-primary-foreground/70',
    label: 'text-primary-foreground/70',
    value: 'text-primary-foreground',
    share:
      'border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10',
    count: 'text-primary-foreground/70',
    ring: 'focus-visible:ring-offset-header-background',
  },
  gradient: {
    surface:
      'bg-[linear-gradient(252deg,var(--workspace-hero-from)_0%,var(--workspace-hero-to)_97.53%)] text-primary',
    title: 'text-primary',
    card: 'border-primary/10 bg-white/55',
    icon: 'text-primary/70',
    label: 'text-muted-foreground',
    value: 'text-primary',
    share: 'border-primary/30 bg-white/40 text-primary hover:bg-white/70',
    count: 'text-muted-foreground',
    ring: 'focus-visible:ring-offset-[var(--workspace-hero-to)]',
  },
  // Page-background surface (--page-background) with white (bg-card) metadata cards.
  page: {
    surface: 'bg-page-background text-primary',
    title: 'text-primary',
    card: 'border-border bg-card',
    icon: 'text-primary/70',
    label: 'text-muted-foreground',
    value: 'text-primary',
    share: 'border-border bg-card text-primary hover:bg-muted',
    count: 'text-muted-foreground',
    ring: 'focus-visible:ring-offset-page-background',
  },
}

interface MetaCardProps {
  icon: LucideIcon
  label: string
  value: string
  tone?: Tone
}

function MetaCard({ icon: Icon, label, value, tone = 'navy' }: MetaCardProps) {
  const t = TONES[tone]
  return (
    <li
      className={`flex min-w-0 items-center gap-5 rounded-lg border px-6 py-5 ${t.card}`}
    >
      <Icon
        className={`size-[26px] shrink-0 ${t.icon}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`text-xs font-medium uppercase tracking-wide ${t.label}`}
        >
          {label}
        </span>
        <span className={`truncate text-sm font-semibold ${t.value}`}>
          {value}
        </span>
      </div>
    </li>
  )
}

interface ProposedHeaderProps {
  title: string
  publisher: string
  sector: string
  geography: string
  updated: string
  downloads: number
  tone?: Tone
}

function ProposedHeader({
  title,
  publisher,
  sector,
  geography,
  updated,
  downloads,
  tone = 'navy',
}: ProposedHeaderProps) {
  const t = TONES[tone]
  return (
    <header
      className={`flex flex-col gap-8 rounded-2xl p-6 sm:p-8 lg:gap-10 lg:p-10 ${t.surface}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <h1
          className={`type-heading-1 min-w-0 break-words lg:w-[68%] lg:flex-none ${t.title}`}
        >
          {title}
        </h1>
        <div className="flex shrink-0 items-start gap-2">
          <button
            type="button"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${t.share} ${t.ring}`}
          >
            <Share2 className="size-4" aria-hidden="true" />
            Share
          </button>
          {/* The usage count hangs directly under Download, centred on it */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${t.ring}`}
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </button>
            <p className={`text-xs ${t.count}`}>
              {downloads.toLocaleString()} downloads
            </p>
          </div>
        </div>
      </div>

      <ul
        aria-label="Dataset details"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MetaCard
          icon={Building2}
          label="Publisher"
          value={publisher}
          tone={tone}
        />
        <MetaCard icon={Landmark} label="Sector" value={sector} tone={tone} />
        <MetaCard
          icon={MapPin}
          label="Geography"
          value={geography}
          tone={tone}
        />
        <MetaCard
          icon={CalendarDays}
          label="Last updated"
          value={updated}
          tone={tone}
        />
      </ul>
    </header>
  )
}

interface VersionRenderArgs {
  title: string
  metadata: DatasetMetadata
  publisher: DatasetPublisher
  record: DatasetRecord
  shared: Omit<ProposedHeaderProps, 'title' | 'tone'>
}

/** Every variant shown on the page, in order. Each is rendered with the real title and with a long test title. */
const VERSIONS: {
  id: string
  note: string
  render: (args: VersionRenderArgs) => React.ReactNode
}[] = [
  {
    id: 'V1',
    note: 'The original live header: page-background surface, gradient metadata cards, 26px icons, navy values, outlined Share, primary Download.',
    render: ({ title, metadata, publisher, record }) => (
      <div className={LEGACY_CARDS}>
        <DatasetDetailHeader
          metadata={{ ...metadata, name: title }}
          publisher={publisher}
          updatedAt={record.updatedAt}
          downloadCount={record.downloadCount}
        />
      </div>
    ),
  },
  {
    id: 'V2',
    note: 'Dark navy container, lighter-navy metadata cards, orange primary action.',
    render: ({ title, shared }) => <ProposedHeader title={title} {...shared} />,
  },
  {
    id: 'V3',
    note: 'Dashboard “My Workspace” gradient, translucent light cards, brand-navy text.',
    render: ({ title, shared }) => (
      <ProposedHeader title={title} tone="gradient" {...shared} />
    ),
  },
  {
    id: 'V4',
    note: 'Page-background surface, white metadata cards, navy text, orange primary action.',
    render: ({ title, shared }) => (
      <ProposedHeader title={title} tone="page" {...shared} />
    ),
  },
  {
    id: 'V5',
    note: 'LIVE — applied to every dataset details page: white 80% cards, icons 40% larger (36.4px) in --border-strong (#727272), values in --border-strong; labels keep their original muted grey.',
    render: ({ title, metadata, publisher, record }) => (
      <DatasetDetailHeader
        metadata={{ ...metadata, name: title }}
        publisher={publisher}
        updatedAt={record.updatedAt}
        downloadCount={record.downloadCount}
      />
    ),
  },
  {
    id: 'V6',
    note: 'No background on the four metadata cards, icons 40% larger (36.4px), values in --border-strong (#727272).',
    render: ({ title, metadata, publisher, record }) => (
      <div className={BARE_CARDS}>
        <DatasetDetailHeader
          metadata={{ ...metadata, name: title }}
          publisher={publisher}
          updatedAt={record.updatedAt}
          downloadCount={record.downloadCount}
        />
      </div>
    ),
  },
  {
    id: 'V7',
    note: 'V6 with each metadata icon on a circular --workspace-hero-to (#d3e9ff) background and navy values.',
    render: ({ title, metadata, publisher, record }) => (
      <div className={ICON_DISCS}>
        <DatasetDetailHeader
          metadata={{ ...metadata, name: title }}
          publisher={publisher}
          updatedAt={record.updatedAt}
          downloadCount={record.downloadCount}
        />
      </div>
    ),
  },
]

function HeaderComparison() {
  const { datasets, organisationWorkspaces } = useAppData()
  const record = datasets.find((d) => d.id === SAMPLE_DATASET_ID)
  const form = record?.publishedForm
  if (!record || !form)
    return (
      <p className="py-10 text-sm text-muted-foreground">
        Sample dataset not found.
      </p>
    )

  const publisher = resolveDatasetPublisher(record, organisationWorkspaces)
  const { metadata } = form
  const shared = {
    publisher: publisher.name,
    sector: optionLabel(SECTOR_OPTIONS, metadata.sector),
    geography: optionLabel(GEOGRAPHY_OPTIONS, metadata.geography),
    updated: formatShortDate(record.updatedAt),
    downloads: record.downloadCount,
  }

  return (
    <div className="flex w-full flex-col gap-10 py-2">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-2 text-text-default">
          Dataset Details header — visual comparison
        </h2>
        <p className="text-sm text-muted-foreground">
          Playground only: nothing here is wired to the product. Sample content
          is mock dataset “{SAMPLE_DATASET_ID}”.
        </p>
      </div>

      {VERSIONS.map((version) => (
        <React.Fragment key={version.id}>
          {[
            { title: metadata.name, suffix: '', long: false },
            { title: LONG_TITLE, suffix: ' - long title', long: true },
          ].map(({ title, suffix, long }) => (
            <section
              key={version.id + suffix}
              className="flex flex-col gap-4"
              aria-label={`${version.id}${suffix}`}
            >
              <FrameLabel
                note={
                  long
                    ? 'Test only: a deliberately long mock title (dataset data is not changed).'
                    : version.note
                }
              >
                {`${version.id}${suffix}`}
              </FrameLabel>
              <Frame
                idPrefix={`playground-${version.id}${long ? '-long' : ''}`}
                title={title}
              >
                {version.render({ title, metadata, publisher, record, shared })}
              </Frame>
            </section>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

/** The Dataset playground: the header comparison, and the Data DNA metadata exploration. Both are prototypes. */
const PLAYGROUND_TABS = [
  { key: 'header', label: 'Header comparison' },
  { key: 'data-dna', label: 'Data DNA' },
]

function DatasetHeaderPlayground() {
  const [tab, setTab] = React.useState('header')
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ViewTabs items={PLAYGROUND_TABS} value={tab} onChange={setTab} idPrefix="dataset-playground" label="Dataset playground" />
      {tab === 'header' ? <HeaderComparison /> : <DataDNAPlayground />}
    </div>
  )
}

export { DatasetHeaderPlayground }
