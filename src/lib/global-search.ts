import type { DatasetRecord } from '@/types/dataset'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import type { UseCaseRecord } from '@/types/usecase'
import type { CollaborativeRecord } from '@/types/collaborative'
import type { EventRecord } from '@/types/event'
import { formatEventDateRange } from '@/lib/event-status'

/**
 * Global search — aggregates the platform's five public content types into one
 * result set. Reuses each module's existing published records (AppDataContext)
 * rather than a separate index; there is no backend search API yet, so this
 * runs entirely client-side over the same data every module already has.
 *
 * Publications have no standalone module/record type — they only exist as
 * sub-items of Events (`EventRecord.form.publications`) — so they're indexed
 * from there. That also means a publication result links to the *event* it
 * belongs to (the only publication route that actually exists), not a
 * publication detail page.
 */

export type SearchResultType = 'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event'

export const SEARCH_TYPE_LABEL: Record<SearchResultType, string> = {
  dataset: 'Dataset',
  'use-case': 'Use Case',
  publication: 'Publication',
  collaborative: 'Collaborative',
  event: 'Event',
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
   * Where this result links to. Only Use Case, Collaborative, and Event have
   * an existing public preview route — Datasets and Publications don't have
   * one yet, so those results render without a link rather than pointing
   * somewhere invented. See the module doc comment above.
   */
  href?: string
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

export interface GlobalSearchSource {
  datasets: DatasetRecord[]
  useCases: UseCaseRecord[]
  collaboratives: CollaborativeRecord[]
  events: EventRecord[]
}

/** Builds the flat, mixed-type result pool — published content only. */
export function buildSearchIndex({ datasets, useCases, collaboratives, events }: GlobalSearchSource): SearchResultItem[] {
  const items: SearchResultItem[] = []

  for (const d of datasets) {
    if (d.status !== 'published') continue
    items.push({
      id: d.id,
      type: 'dataset',
      title: d.form.metadata.name || 'Untitled dataset',
      description: d.form.metadata.description,
      meta: sectorGeoMeta(d.form.metadata.sector, d.form.metadata.geography),
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
    })
  }

  for (const c of collaboratives) {
    if (c.status !== 'published') continue
    items.push({
      id: c.id,
      type: 'collaborative',
      title: c.form.metadata.name || 'Untitled Collaborative',
      organisation: c.form.connections.people.find((p) => p.kind === 'organisation')?.name,
      meta: c.form.metadata.sectors.map((s) => optionLabel(SECTOR_OPTIONS, s)).filter(Boolean).join(', ') || undefined,
      href: `/dashboard/collaboratives/${c.id}/preview`,
    })
  }

  for (const e of events) {
    if (e.status !== 'published') continue
    const location = [e.form.metadata.city, e.form.metadata.country].filter(Boolean).join(', ')
    items.push({
      id: e.id,
      type: 'event',
      title: e.form.metadata.title || 'Untitled Event',
      description: e.form.metadata.subtitle,
      organisation: e.form.organisers[0]?.name,
      meta: [e.form.metadata.startDate && formatEventDateRange(e.form.metadata), location].filter(Boolean).join(' · ') || undefined,
      href: `/dashboard/events/${e.id}/preview`,
    })

    for (const pub of e.form.publications) {
      items.push({
        id: `${e.id}-${pub.id}`,
        type: 'publication',
        title: pub.title,
        description: pub.description,
        organisation: pub.organisation,
        meta: e.form.metadata.title ? `From ${e.form.metadata.title}` : undefined,
        href: `/dashboard/events/${e.id}/preview`,
      })
    }
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
