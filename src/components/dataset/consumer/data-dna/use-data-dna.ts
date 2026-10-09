import {
  Building2,
  CalendarDays,
  Database,
  FileStack,
  FileType2,
  Globe2,
  Languages,
  Layers,
  LockOpen,
  MapPin,
  Ruler,
  Scale,
  ScrollText,
  Table2,
  type LucideIcon,
} from 'lucide-react'

import { useAppData } from '@/context/AppDataContext'
import { resolveDatasetPublisher } from '@/lib/dataset-publisher'
import { formatShortDate } from '@/lib/format'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS, type DatasetRecord } from '@/types/dataset'

/** The view model behind Data DNA: every value is read or counted from the mock dataset and the records connected to
 *  it. Nothing is invented — a fact the data doesn't hold is returned with `available: false` and is shown as
 *  "Not recorded" (rich density) or left out. */

/** Exploration-only knob used by the playground: which already-available facts are shown. */
export type Density = 'rich' | 'moderate' | 'sparse'

export interface DNAFact {
  id: string
  overline: string
  value: string
  support?: string
  icon: LucideIcon
  available: boolean
  /** core: always shown · extra: moderate and rich · optional: rich only. */
  tier: 'core' | 'extra' | 'optional'
}

export type RelationKind = 'use-cases' | 'collaboratives' | 'events' | 'visualisations'
export interface DNARelation {
  kind: RelationKind
  label: string
  items: { id: string; title: string; href: string }[]
  /** Where the whole category opens: the Search page on that content type's tab (the dataset's Visualisations tab for charts). */
  listingHref: string
}

export interface DataDNAModel {
  record: DatasetRecord
  title: string
  publisher: string
  /** The publisher's logo/avatar when one is actually set, otherwise null (callers show initials). */
  publisherAvatarUrl: string | null
  domain: string
  geography: string
  updated: string
  story: string
  stats: DNAFact[]
  headline: DNAFact[]
  characteristics: DNAFact[]
  relations: DNARelation[]
  provenance: DNAFact[]
}

const label = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value

function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

/** A concise one-line statement from the description: the first sentence, cut at its first clause boundary (a comma, or
 *  "covering" / "including" / "with"), then closed with the sentence's own trailing scope ("across India", "from 2020 to
 *  2026") when it has one. Everything comes from the text — nothing is added. */
function storyFrom(description: string, max = 90): string {
  const first = description.split(/(?<=[.!?])\s/)[0]?.trim() ?? ''
  if (!first) return ''
  const clause = first.split(/,|;|\s(?:covering|including|with)\s/)[0].replace(/[.,;:\s]+$/, '')
  const tail = first.match(/\s((?:across|in|from)\s[^,;]+?)\.?$/)?.[1]
  let text = tail && !clause.endsWith(tail) ? `${clause} ${tail}` : clause
  if (text.length > max) text = clause
  if (text.length > max) return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
  return `${text}.`
}

export function useDataDNAModel(datasetId: string): DataDNAModel | null {
  const { datasets, organisationWorkspaces, useCases, collaboratives, events, charts } = useAppData()
  const record = datasets.find((d) => d.id === datasetId)
  const form = record?.publishedForm
  if (!record || !form) return null

  const { metadata, files } = form
  const publisher = resolveDatasetPublisher(record, organisationWorkspaces)
  const domain = metadata.sector ? label(SECTOR_OPTIONS, metadata.sector) : ''
  const geography = metadata.geography ? label(GEOGRAPHY_OPTIONS, metadata.geography) : ''
  const updated = formatShortDate(record.updatedAt)

  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0)
  const filesWithRows = files.filter((f) => typeof f.rowCount === 'number')
  const records = filesWithRows.reduce((sum, f) => sum + (f.rowCount ?? 0), 0)
  const formats = [...new Set(files.map((f) => f.extension).filter(Boolean))]
  const licence = metadata.license ? label(LICENSE_OPTIONS, metadata.license) : ''
  const host = (() => {
    try {
      return metadata.sourceWebsite ? new URL(metadata.sourceWebsite).host : ''
    } catch {
      return metadata.sourceWebsite
    }
  })()

  const stats: DNAFact[] = [
    filesWithRows.length > 0
      ? {
          id: 'records',
          overline: 'Records',
          value: records.toLocaleString(),
          support:
            filesWithRows.length === files.length
              ? `Across ${files.length} file${files.length === 1 ? '' : 's'}`
              : `In ${filesWithRows.length} of ${files.length} files`,
          icon: Table2,
          available: true,
          tier: 'core',
        }
      : {
          id: 'records',
          overline: 'Records',
          value: 'Not recorded',
          support: 'No file reports a row count',
          icon: Table2,
          available: false,
          tier: 'optional',
        },
    files.length > 0
      ? {
          id: 'size',
          overline: 'File size',
          value: formatSize(totalBytes),
          support: `Across ${files.length} file${files.length === 1 ? '' : 's'}`,
          icon: Ruler,
          available: true,
          tier: 'core',
        }
      : { id: 'size', overline: 'File size', value: 'No files', icon: Ruler, available: false, tier: 'optional' },
  ]

  const headline: DNAFact[] = [
    {
      id: 'domain',
      overline: 'Domain',
      value: domain || 'Not recorded',
      icon: Layers,
      available: Boolean(domain),
      tier: domain ? 'core' : 'optional',
    },
    {
      id: 'geography',
      overline: 'Geography',
      value: geography || 'Not recorded',
      icon: MapPin,
      available: Boolean(geography),
      tier: geography ? 'core' : 'optional',
    },
  ]

  const characteristics: DNAFact[] = [
    {
      id: 'resources',
      overline: 'Resources',
      value: String(files.length),
      support: files.length === 1 ? 'file in this dataset' : 'files in this dataset',
      icon: FileStack,
      available: files.length > 0,
      tier: 'extra',
    },
    {
      id: 'formats',
      overline: 'Formats',
      value: formats.join(', ') || 'Not recorded',
      support: formats.length > 1 ? `${formats.length} formats` : undefined,
      icon: FileType2,
      available: formats.length > 0,
      tier: 'extra',
    },
    {
      id: 'type',
      overline: 'Data type',
      value: form.datasetType === 'prompt_dataset' ? 'Prompt dataset' : 'Dataset',
      icon: Database,
      available: true,
      tier: 'optional',
    },
    {
      id: 'access',
      overline: 'Access',
      value:
        metadata.accessType === 'open'
          ? 'Open access'
          : metadata.accessType === 'restricted'
            ? 'Restricted access'
            : 'Not recorded',
      icon: LockOpen,
      available: Boolean(metadata.accessType),
      tier: 'optional',
    },
    // Named in the brief but not part of the dataset model — shown only as a marker in rich density.
    {
      id: 'coverage',
      overline: 'Coverage',
      value: 'Not recorded',
      support: 'No coverage field on datasets',
      icon: CalendarDays,
      available: false,
      tier: 'optional',
    },
    {
      id: 'language',
      overline: 'Language',
      value: 'Not recorded',
      support: 'No language field on datasets',
      icon: Languages,
      available: false,
      tier: 'optional',
    },
  ]

  const provenance: DNAFact[] = [
    { id: 'publisher', overline: 'Publisher', value: publisher.name, icon: Building2, available: true, tier: 'core' },
    { id: 'updated', overline: 'Last updated', value: updated, icon: CalendarDays, available: true, tier: 'core' },
    {
      id: 'source',
      overline: 'Source',
      value: host || 'Not recorded',
      support: files[0]?.source ? `Files imported from ${files[0].source}` : undefined,
      icon: Globe2,
      available: Boolean(host),
      tier: 'extra',
    },
    {
      id: 'licence',
      overline: 'Licence',
      value: licence || 'Not recorded',
      icon: Scale,
      available: Boolean(licence),
      tier: 'extra',
    },
    {
      id: 'methodology',
      overline: 'Methodology & documentation',
      value: 'Not recorded',
      support: 'The dataset model has no documentation field yet',
      icon: ScrollText,
      available: false,
      tier: 'optional',
    },
  ]

  // Relationships: published records that reference this dataset.
  const live = <T extends { status: string; form: unknown; publishedForm: unknown }>(r: T) =>
    r.status === 'published' ? ((r.publishedForm ?? r.form) as T['form']) : null
  const relations: DNARelation[] = [
    {
      kind: 'use-cases',
      label: 'Use Cases',
      listingHref: '/search?type=use-cases',
      items: useCases.flatMap((r) => {
        const f = live(r)
        return f && f.connections.datasets.some((d) => d.id === datasetId)
          ? [{ id: r.id, title: f.metadata.title, href: `/explore/use-cases/${r.id}` }]
          : []
      }),
    },
    {
      kind: 'collaboratives',
      label: 'Collaboratives',
      listingHref: '/search?type=collaboratives',
      items: collaboratives.flatMap((r) => {
        const f = live(r)
        return f && f.connections.datasets.some((d) => d.id === datasetId)
          ? [{ id: r.id, title: f.metadata.name, href: `/dashboard/collaboratives/${r.id}/preview` }]
          : []
      }),
    },
    {
      kind: 'events',
      label: 'Events',
      listingHref: '/search?type=events',
      items: events.flatMap((r) => {
        const f = live(r)
        return f && f.relatedContent.datasets.some((d) => d.id === datasetId)
          ? [{ id: r.id, title: f.metadata.title, href: `/explore/events/${r.id}` }]
          : []
      }),
    },
    {
      kind: 'visualisations',
      label: 'Visualisations',
      listingHref: `/explore/datasets/${datasetId}?view=visualisations`,
      items: charts
        .filter((c) => c.status === 'published' && c.form.datasetId === datasetId)
        .map((c) => ({
          id: c.id,
          title: c.form.name || 'Untitled visualisation',
          href: `/explore/datasets/${datasetId}?view=visualisations`,
        })),
    },
  ]

  return {
    record,
    title: metadata.name,
    publisher: publisher.name,
    publisherAvatarUrl: publisher.avatarUrl,
    domain,
    geography,
    updated,
    story: storyFrom(metadata.description),
    stats,
    headline,
    characteristics,
    relations,
    provenance,
  }
}

const TIER_RANK = { core: 0, extra: 1, optional: 2 } as const
const MAX_TIER: Record<Density, number> = { rich: 2, moderate: 1, sparse: 0 }

/** Density only decides which already-available facts are shown; it never adds or changes data. */
export function visibleFacts(facts: DNAFact[], density: Density): DNAFact[] {
  return facts.filter((f) => f.available && TIER_RANK[f.tier] <= MAX_TIER[density])
}

/** Facts the dataset doesn't hold. They never become cards (empty cards would make the profile look unfinished); rich
 *  density names them in one quiet line instead. */
export function unavailableLabels(
  model: Pick<DataDNAModel, 'stats' | 'headline' | 'characteristics' | 'provenance'>,
): string[] {
  return [...model.stats, ...model.headline, ...model.characteristics, ...model.provenance]
    .filter((f) => !f.available)
    .map((f) => f.overline)
}

export function visibleRelations(relations: DNARelation[], density: Density): DNARelation[] {
  return density === 'rich' ? relations : relations.filter((r) => r.items.length > 0)
}

export const RELATION_ICONS: Record<RelationKind, LucideIcon> = {
  'use-cases': FileStack,
  collaboratives: Globe2,
  events: CalendarDays,
  visualisations: Table2,
}
