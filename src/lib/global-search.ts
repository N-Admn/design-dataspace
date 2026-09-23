import type { DatasetRecord } from '@/types/dataset'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import type { UseCaseRecord } from '@/types/usecase'
import type { CollaborativeRecord } from '@/types/collaborative'
import { PUBLICATION_TYPE_OPTIONS, type EventRecord, type EventMetadata } from '@/types/event'
import { MODEL_TYPE_OPTIONS, PROVIDER_OPTIONS, type AIModelRecord } from '@/types/ai-model'
import type { OrganisationRecord } from '@/types/organisation-workspace'
import type { ChartRecord } from '@/types/chart'
import { formatEventDateRange } from '@/lib/event-status'
import { resolveDatasetPublisher, resolvePublisherByOrganisation } from '@/lib/dataset-publisher'
import { getPrimaryAccessMethod } from '@/lib/ai-model-validation'
import { parseAppTimestamp } from '@/lib/format'

/**
 * Global search — aggregates the platform's six public content types into one
 * result set. Reuses each module's existing published records (AppDataContext)
 * rather than a separate index; there is no backend search API yet, so this
 * runs entirely client-side over the same data every module already has.
 *
 * Publications have no standalone module/record type — they only exist as
 * sub-items of Events (`EventRecord.form.publications`) — so they're indexed
 * from there. That also means a publication result links to the *event* it
 * belongs to (the only publication route that actually exists), not a
 * publication detail page, and that "Sector"/"Geography" aren't available for
 * publications — a publication carries neither field itself, only its parent
 * event does, and that isn't the same thing.
 */

export type SearchResultType = 'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event' | 'ai-model'

export const SEARCH_TYPE_LABEL: Record<SearchResultType, string> = {
  dataset: 'Dataset',
  'use-case': 'Use Case',
  publication: 'Publication',
  collaborative: 'Collaborative',
  event: 'Event',
  'ai-model': 'AI Model',
}

/**
 * Structured attributes behind the filter rail — deliberately only fields
 * that already exist on the underlying record. A field left `undefined`/`[]`
 * here means the data model genuinely has nothing to filter by, not that a
 * count was fabricated as zero; see each `buildSearchIndex` push site for
 * which fields are and aren't populated per type, and why.
 */
export interface SearchFacets {
  sector?: string[]
  geography?: string[]
  organisation?: string[]
  datasetType?: string[]
  access?: string[]
  format?: string[]
  license?: string[]
  contributors?: string[]
  datasetsUsed?: string[]
  eventType?: string[]
  eventStatus?: string[]
  publicationType?: string[]
  modelType?: string[]
  provider?: string[]
  /** Raw app timestamp ("DD/MM/YYYY HH:mm:ss") backing the "Updated"/"Date"
   *  recency filter. Publications reuse their parent event's, since a
   *  publication has no timestamp of its own. */
  updatedAt: string
  /** Publications only — the parent event's year, the closest real date a
   *  publication has (it carries no date of its own). */
  year?: string
}

export interface SearchResultItem {
  id: string
  type: SearchResultType
  title: string
  description?: string
  organisation?: string
  /** Extra metadata line(s) — sector/geography, date, location, etc. */
  meta?: string
  /**
   * Where this result links to. Only Use Case, Collaborative, Event, and AI
   * Model have an existing public preview route — Datasets and Publications
   * don't have one yet, so those results render without a link rather than
   * pointing somewhere invented. See the module doc comment above.
   */
  href?: string
  /** Structured tag values (currently only populated for datasets) — matched
   * exactly by `filterByTag`, distinct from the free-text `searchItems` query. */
  tags?: string[]
  /** The record's own cover image/thumbnail, when the module has one and the
   * contributor actually uploaded one — Use Case (`metadata.thumbnail`),
   * Collaborative (`metadata.image`), and Event (`metadata.coverImage`).
   * `undefined` means the type has no such field at all (Dataset,
   * Publication, AI Model); `null` means the field exists but nothing was
   * uploaded, so the card falls back to a placeholder rather than an
   * invented image. */
  thumbnailUrl?: string | null
  /** Structured display metadata for the ContentCard system, keyed by name
   *  rather than a positional array — each `buildSearchIndex` push site below
   *  only sets the fields its type actually has real data for; a field left
   *  unset means the record genuinely has nothing there, never a fabricated
   *  value. See `lib/content-card.ts` for how these become the card's 2–3
   *  metadata rows. */
  cardMeta?: {
    geography?: string
    formats?: string[]
    datasetCount?: number
    chartCount?: number
    useCaseCount?: number
    contributorCount?: number
    year?: string
    publicationType?: string
    version?: string
    modelType?: string
    accessMethod?: string
    dateRange?: string
    location?: string
  }
  /** Real attribution only — one entry for a single-publisher record, several
   *  for a record with multiple connected organisations/organisers, or
   *  omitted entirely when the record has no attribution to show (see each
   *  push site). `avatarUrl` follows the same real-image-or-null convention
   *  as `thumbnailUrl` above. */
  publishers?: { name: string; avatarUrl?: string | null }[]
  facets: SearchFacets
}

function optionLabel(options: { value: string; label: string }[], value: string): string | undefined {
  return options.find((o) => o.value === value)?.label
}

function sectorGeoMeta(sector: string, geography: string): string | undefined {
  const parts = [sector && optionLabel(SECTOR_OPTIONS, sector), geography && optionLabel(GEOGRAPHY_OPTIONS, geography)].filter(
    Boolean,
  )
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/** Upcoming / ongoing / past — computed from the event's own start/end dates,
 *  the closest thing this data model has to a public-facing "event status"
 *  (there's no separate status field beyond the internal draft/published
 *  lifecycle, which consumers never see). */
function eventTimeStatus(metadata: EventMetadata, now = new Date()): 'upcoming' | 'ongoing' | 'past' {
  const start = metadata.startDate ? new Date(`${metadata.startDate}T${metadata.startTime || '00:00'}`) : null
  if (!start || Number.isNaN(start.getTime())) return 'upcoming'
  const end = metadata.endDate ? new Date(`${metadata.endDate}T${metadata.endTime || '23:59'}`) : start
  if (now < start) return 'upcoming'
  if (end && !Number.isNaN(end.getTime()) && now > end) return 'past'
  return 'ongoing'
}

export interface GlobalSearchSource {
  datasets: DatasetRecord[]
  useCases: UseCaseRecord[]
  collaboratives: CollaborativeRecord[]
  events: EventRecord[]
  aiModels: AIModelRecord[]
  organisationWorkspaces: OrganisationRecord[]
  charts: ChartRecord[]
}

/** Builds the flat, mixed-type result pool — published content only. */
export function buildSearchIndex({
  datasets,
  useCases,
  collaboratives,
  events,
  aiModels,
  organisationWorkspaces,
  charts,
}: GlobalSearchSource): SearchResultItem[] {
  const items: SearchResultItem[] = []

  for (const d of datasets) {
    if (d.status !== 'published') continue
    const publisher = resolveDatasetPublisher(d, organisationWorkspaces)
    const chartCount = charts.filter((c) => c.status === 'published' && c.form.datasetId === d.id).length
    items.push({
      id: d.id,
      type: 'dataset',
      title: d.form.metadata.name || 'Untitled dataset',
      description: d.form.metadata.description,
      organisation: publisher.name,
      meta: sectorGeoMeta(d.form.metadata.sector, d.form.metadata.geography),
      href: `/explore/datasets/${d.id}`,
      tags: d.form.metadata.tags,
      cardMeta: {
        geography: d.form.metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, d.form.metadata.geography) : undefined,
        formats: Array.from(new Set(d.form.files.map((f) => f.extension.toUpperCase()))),
        chartCount,
      },
      publishers: [{ name: publisher.name, avatarUrl: publisher.avatarUrl }],
      facets: {
        sector: d.form.metadata.sector ? [d.form.metadata.sector] : [],
        geography: d.form.metadata.geography ? [d.form.metadata.geography] : [],
        organisation: [publisher.name],
        datasetType: [d.form.datasetType],
        access: d.form.metadata.accessType ? [d.form.metadata.accessType] : [],
        format: Array.from(new Set(d.form.files.map((f) => f.extension.toUpperCase()))),
        license: d.form.metadata.license ? [d.form.metadata.license] : [],
        updatedAt: d.updatedAt,
      },
    })
  }

  for (const u of useCases) {
    if (u.status !== 'published') continue
    const organisation = u.form.connections.organizations[0]?.name
    // Prefer the connected organisation(s) as the publisher; fall back to the
    // first credited contributor when none is set — still real attribution
    // from the record, never invented.
    const useCasePublishers: SearchResultItem['publishers'] =
      u.form.connections.organizations.length > 0
        ? u.form.connections.organizations.map((o) => ({ name: o.name, avatarUrl: o.logo?.dataUrl ?? null }))
        : u.form.connections.contributors.slice(0, 1).map((c) => ({ name: c.name, avatarUrl: c.image?.dataUrl ?? null }))
    items.push({
      id: u.id,
      type: 'use-case',
      title: u.form.metadata.title || 'Untitled Use Case',
      description: u.form.metadata.subtitle,
      organisation,
      meta: u.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/use-cases/${u.id}/preview`,
      thumbnailUrl: u.form.metadata.thumbnail?.dataUrl ?? null,
      cardMeta: {
        datasetCount: u.form.connections.datasets.length,
        chartCount: u.form.blocks.filter((b) => b.type === 'chart').length,
        geography: u.form.metadata.geographies[0] ? optionLabel(GEOGRAPHY_OPTIONS, u.form.metadata.geographies[0]) : undefined,
      },
      publishers: useCasePublishers.length > 0 ? useCasePublishers : undefined,
      facets: {
        sector: u.form.metadata.sectors,
        geography: u.form.metadata.geographies,
        organisation: u.form.connections.organizations.map((o) => o.name),
        contributors: u.form.connections.contributors.map((c) => c.name),
        datasetsUsed: u.form.connections.datasets.map((d) => d.title),
        updatedAt: u.updatedAt,
      },
    })
  }

  for (const c of collaboratives) {
    if (c.status !== 'published') continue
    const orgPeople = c.form.connections.people.filter((p) => p.kind === 'organisation')
    const orgNames = orgPeople.map((p) => p.name)
    // Prefer the connected organisations as the publisher(s); fall back to
    // any connected person when the collaborative has none — still real
    // attribution from the record.
    const collaborativePublishers = (orgPeople.length > 0 ? orgPeople : c.form.connections.people.slice(0, 1)).map(
      (p) => ({ name: p.name, avatarUrl: p.logo?.dataUrl ?? null }),
    )
    items.push({
      id: c.id,
      type: 'collaborative',
      title: c.form.metadata.name || 'Untitled Collaborative',
      organisation: orgNames[0],
      meta: c.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/collaboratives/${c.id}/preview`,
      thumbnailUrl: c.form.metadata.image?.dataUrl ?? null,
      cardMeta: {
        datasetCount: c.form.connections.datasets.length,
        useCaseCount: c.form.connections.useCases.length,
        contributorCount: c.form.connections.people.length,
      },
      publishers: collaborativePublishers.length > 0 ? collaborativePublishers : undefined,
      // No "Status" facet: the model has no field beyond the internal
      // draft/published lifecycle, which consumer search doesn't expose.
      facets: {
        sector: c.form.metadata.sectors,
        geography: c.form.metadata.geographies,
        organisation: orgNames,
        updatedAt: c.updatedAt,
      },
    })
  }

  for (const e of events) {
    if (e.status !== 'published') continue
    const location = [e.form.metadata.city, e.form.metadata.country].filter(Boolean).join(', ')
    const organiserNames = e.form.organisers.map((o) => o.name)
    items.push({
      id: e.id,
      type: 'event',
      title: e.form.metadata.title || 'Untitled Event',
      description: e.form.metadata.subtitle,
      organisation: organiserNames[0],
      meta: [e.form.metadata.startDate && formatEventDateRange(e.form.metadata), location].filter(Boolean).join(' · ') || undefined,
      href: `/dashboard/events/${e.id}/preview`,
      thumbnailUrl: e.form.metadata.coverImage?.dataUrl ?? null,
      cardMeta: {
        dateRange: e.form.metadata.startDate ? formatEventDateRange(e.form.metadata) : undefined,
        location: location || undefined,
      },
      publishers:
        e.form.organisers.length > 0
          ? e.form.organisers.map((o) => ({ name: o.name, avatarUrl: o.logo?.dataUrl ?? null }))
          : undefined,
      // No "Geography" facet: events have a venue city/country, not a value
      // from the shared GEOGRAPHY_OPTIONS list the other modules use.
      // "Sector" here is the organiser's sector (ORG_SECTOR_OPTIONS) — a
      // different, org-level taxonomy from Dataset/Use Case's SECTOR_OPTIONS,
      // since the event itself has no sector field of its own.
      facets: {
        sector: e.form.organisers[0]?.sectorType ? [e.form.organisers[0].sectorType] : [],
        organisation: organiserNames,
        eventType: e.form.metadata.eventType ? [e.form.metadata.eventType] : [],
        eventStatus: [eventTimeStatus(e.form.metadata)],
        updatedAt: e.updatedAt,
      },
    })

    for (const pub of e.form.publications) {
      const year = e.form.metadata.startDate ? e.form.metadata.startDate.slice(0, 4) : undefined
      items.push({
        id: `${e.id}-${pub.id}`,
        type: 'publication',
        title: pub.title,
        description: pub.description,
        organisation: pub.organisation,
        meta: e.form.metadata.title ? `From ${e.form.metadata.title}` : undefined,
        href: `/dashboard/events/${e.id}/preview`,
        cardMeta: {
          year,
          publicationType: pub.publicationType ? optionLabel(PUBLICATION_TYPE_OPTIONS, pub.publicationType) : undefined,
        },
        // No avatar: a publication's `organisation` is a plain string with no
        // logo field of its own (unlike Dataset/Event's Organisation record).
        publishers: pub.organisation ? [{ name: pub.organisation }] : undefined,
        // No "Sector"/"Geography": a publication carries neither field — only
        // its parent event might, and that isn't the same thing as the
        // publication's own. "Year" is the parent event's year, the closest
        // real date available.
        facets: {
          publicationType: pub.publicationType ? [pub.publicationType] : [],
          organisation: pub.organisation ? [pub.organisation] : [],
          updatedAt: e.updatedAt,
          year,
        },
      })
    }
  }

  for (const m of aiModels) {
    if (m.status !== 'published') continue
    const primaryVersion = m.form.versions.find((v) => v.isPrimary) ?? m.form.versions[0]
    const primaryAccess = getPrimaryAccessMethod(primaryVersion)
    const publisher = resolvePublisherByOrganisation(m.organisationId, m.createdBy, organisationWorkspaces)
    items.push({
      id: m.id,
      type: 'ai-model',
      title: m.form.metadata.name || 'Untitled AI Model',
      description: m.form.metadata.description,
      meta: m.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/ai-models/${m.id}/preview`,
      cardMeta: {
        version: primaryVersion?.name,
        modelType: m.form.metadata.modelType ? optionLabel(MODEL_TYPE_OPTIONS, m.form.metadata.modelType) : undefined,
        accessMethod: primaryAccess?.provider ? optionLabel(PROVIDER_OPTIONS, primaryAccess.provider) : undefined,
      },
      publishers: [{ name: publisher.name, avatarUrl: publisher.avatarUrl }],
      // No "Access" facet: AI Models have no public/restricted access field
      // like Dataset's — only per-access-method auth configuration, which
      // isn't a comparable "who can use this" classification.
      facets: {
        sector: m.form.metadata.sectors,
        geography: m.form.metadata.geographies,
        modelType: m.form.metadata.modelType ? [m.form.metadata.modelType] : [],
        provider: primaryAccess?.provider ? [primaryAccess.provider] : [],
        updatedAt: m.updatedAt,
      },
    })
  }

  return items
}

/** Tokenized, case-insensitive, AND-across-tokens / OR-across-fields match —
 * good enough for keyword, multi-word, and short natural-language queries
 * ("maternal health in India") without a real search backend.
 *
 * An empty query matches everything — the results page uses that to support
 * "browse all of this type" from a type filter with no keyword (e.g. the
 * landing page's discovery cards), while still showing its own separate
 * empty-query prompt when no type is chosen either. */
export function searchItems(items: SearchResultItem[], query: string): SearchResultItem[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return items
  return items.filter((item) => {
    const haystack = [item.title, item.description, item.organisation, item.meta]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return tokens.every((t) => haystack.includes(t))
  })
}

/** Exact (case/whitespace-insensitive) match against an item's structured
 * `tags` — the "click a tag" filter, kept separate from `searchItems`'s
 * free-text keyword matching so a tag never partially matches an unrelated
 * word in a title or description. */
export function filterByTag(items: SearchResultItem[], tag: string): SearchResultItem[] {
  const normalized = tag.trim().toLowerCase()
  if (!normalized) return items
  return items.filter((item) => item.tags?.some((t) => t.trim().toLowerCase() === normalized))
}

/** Recency buckets shared by every "Updated"/"Date" single-select filter. */
export const RECENCY_DAYS: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365 }

function matchesRecency(item: SearchResultItem, bucket: string): boolean {
  const days = RECENCY_DAYS[bucket]
  if (!days) return true
  const updated = parseAppTimestamp(item.facets.updatedAt)
  return updated.getTime() >= Date.now() - days * 86400000
}

/** Active filter selections, keyed by filter-group key (see `lib/search-filters.ts`).
 *  Every value is an array even for single-select groups (one entry, or none). */
export type ActiveFilters = Record<string, string[]>

/** AND across groups, OR within a group — `Sector = Health + Education AND
 *  Format = CSV` matches an item with sector Health OR Education, and format
 *  CSV. `updated` (the "Last updated"/"Date" recency filter) is handled
 *  specially since it's a range against a timestamp, not a direct
 *  facet-array match. */
export function matchesFilters(item: SearchResultItem, active: ActiveFilters): boolean {
  for (const [key, values] of Object.entries(active)) {
    if (!values || values.length === 0) continue

    if (key === 'updated') {
      if (!matchesRecency(item, values[0])) return false
      continue
    }

    const itemValues = item.facets[key as keyof SearchFacets] as string[] | undefined
    if (!itemValues || !itemValues.some((v) => values.includes(v))) return false
  }
  return true
}

export function filterItems(items: SearchResultItem[], active: ActiveFilters): SearchResultItem[] {
  return items.filter((item) => matchesFilters(item, active))
}
