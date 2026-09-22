import type { DatasetRecord } from '@/types/dataset'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import type { UseCaseRecord } from '@/types/usecase'
import type { CollaborativeRecord } from '@/types/collaborative'
import type { EventRecord, EventMetadata } from '@/types/event'
import type { AIModelRecord } from '@/types/ai-model'
import type { OrganisationRecord } from '@/types/organisation-workspace'
import { formatEventDateRange } from '@/lib/event-status'
import { resolveDatasetPublisher } from '@/lib/dataset-publisher'
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
}

/** Builds the flat, mixed-type result pool — published content only. */
export function buildSearchIndex({
  datasets,
  useCases,
  collaboratives,
  events,
  aiModels,
  organisationWorkspaces,
}: GlobalSearchSource): SearchResultItem[] {
  const items: SearchResultItem[] = []

  for (const d of datasets) {
    if (d.status !== 'published') continue
    const publisher = resolveDatasetPublisher(d, organisationWorkspaces)
    items.push({
      id: d.id,
      type: 'dataset',
      title: d.form.metadata.name || 'Untitled dataset',
      description: d.form.metadata.description,
      organisation: publisher.name,
      meta: sectorGeoMeta(d.form.metadata.sector, d.form.metadata.geography),
      href: `/explore/datasets/${d.id}`,
      tags: d.form.metadata.tags,
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
    items.push({
      id: u.id,
      type: 'use-case',
      title: u.form.metadata.title || 'Untitled Use Case',
      description: u.form.metadata.subtitle,
      organisation,
      meta: u.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/use-cases/${u.id}/preview`,
      thumbnailUrl: u.form.metadata.thumbnail?.dataUrl ?? null,
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
    const orgNames = c.form.connections.people.filter((p) => p.kind === 'organisation').map((p) => p.name)
    items.push({
      id: c.id,
      type: 'collaborative',
      title: c.form.metadata.name || 'Untitled Collaborative',
      organisation: orgNames[0],
      meta: c.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/collaboratives/${c.id}/preview`,
      thumbnailUrl: c.form.metadata.image?.dataUrl ?? null,
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
    items.push({
      id: m.id,
      type: 'ai-model',
      title: m.form.metadata.name || 'Untitled AI Model',
      description: m.form.metadata.description,
      meta: m.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/ai-models/${m.id}/preview`,
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
