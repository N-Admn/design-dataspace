import { SECTOR_OPTIONS } from '@/types/dataset'
import { EVENT_TYPE_OPTIONS, PUBLICATION_TYPE_OPTIONS } from '@/types/event'
import { MODEL_TYPE_OPTIONS } from '@/types/ai-model'
import { RECENCY_DAYS, type SearchFacets, type SearchResultItem, type SearchResultType } from '@/lib/global-search'
import { parseAppTimestamp } from '@/lib/format'

export type TypeFilter = 'all' | SearchResultType

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface FilterGroupDef {
  key: string
  label: string
  kind: 'multi' | 'single'
  /** A closed option list (label lookup + which values are even meaningful) —
   *  omitted for free-form facets (Format) where the values themselves come
   *  from whatever's in the data. */
  fixedOptions?: { value: string; label: string }[]
}

const EVENT_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'past', label: 'Past' },
]

export const RECENCY_OPTIONS = [
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'quarter', label: 'Past 3 months' },
  { value: 'year', label: 'Past year' },
]

// The recency filter is the same underlying facet (`updatedAt`) everywhere —
// only its visible label changes ("Last updated" vs "Date") — so the
// selection carries over when switching between two types that both show it.
const lastUpdated = (label = 'Last updated'): FilterGroupDef => ({ key: 'updated', label, kind: 'single', fixedOptions: RECENCY_OPTIONS })
const sector: FilterGroupDef = { key: 'sector', label: 'Sector', kind: 'multi', fixedOptions: SECTOR_OPTIONS }

const ALL_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

const DATASET_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), { key: 'format', label: 'Format', kind: 'multi' }]

const USE_CASE_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

const PUBLICATION_FILTER_GROUPS: FilterGroupDef[] = [
  lastUpdated(),
  { key: 'publicationType', label: 'Type', kind: 'multi', fixedOptions: PUBLICATION_TYPE_OPTIONS },
]

const COLLABORATIVE_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

const EVENT_FILTER_GROUPS: FilterGroupDef[] = [
  { key: 'eventType', label: 'Type', kind: 'multi', fixedOptions: EVENT_TYPE_OPTIONS },
  { key: 'eventStatus', label: 'Status', kind: 'multi', fixedOptions: EVENT_STATUS_OPTIONS },
  lastUpdated('Date'),
]

const AI_MODEL_FILTER_GROUPS: FilterGroupDef[] = [
  { key: 'modelType', label: 'Type', kind: 'multi', fixedOptions: MODEL_TYPE_OPTIONS },
  lastUpdated('Date'),
]

export const FILTER_GROUPS_BY_TYPE: Record<TypeFilter, FilterGroupDef[]> = {
  all: ALL_FILTER_GROUPS,
  dataset: DATASET_FILTER_GROUPS,
  'use-case': USE_CASE_FILTER_GROUPS,
  collaborative: COLLABORATIVE_FILTER_GROUPS,
  event: EVENT_FILTER_GROUPS,
  publication: PUBLICATION_FILTER_GROUPS,
  'ai-model': AI_MODEL_FILTER_GROUPS,
}

/** Real counts only — computed from the current (type + query + other-filter)
 *  result pool, never invented. An option with zero matches in that pool is
 *  left out rather than shown as "0". */
export function computeGroupOptions(group: FilterGroupDef, items: SearchResultItem[]): FilterOption[] {
  if (group.key === 'updated') {
    return RECENCY_OPTIONS.map((option) => {
      const days = RECENCY_DAYS[option.value]
      const cutoff = Date.now() - days * 86400000
      const count = items.filter((item) => parseAppTimestamp(item.facets.updatedAt).getTime() >= cutoff).length
      return { ...option, count }
    }).filter((o) => o.count > 0)
  }

  const counts = new Map<string, number>()
  for (const item of items) {
    const values = (item.facets[group.key as keyof SearchFacets] as string[] | undefined) ?? []
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  if (group.fixedOptions) {
    return group.fixedOptions
      .map((o) => ({ value: o.value, label: o.label, count: counts.get(o.value) ?? 0 }))
      .filter((o) => o.count > 0)
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
