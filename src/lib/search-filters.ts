import { SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS } from '@/types/usecase'
import { RESOURCE_TYPE_OPTIONS } from '@/types/publication'
import { EVENT_TYPE_OPTIONS } from '@/types/event'
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
  /** List every option of a closed list, even one with no matching records (shown as 0). Used where the whole list is itself
   *  information, such as the 17 SDG goals. Other groups leave out an option that matches nothing. */
  showEmpty?: boolean
}

export const RECENCY_OPTIONS = [
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'quarter', label: 'Past 3 months' },
  { value: 'year', label: 'Past year' },
]

// The recency filter is the same underlying facet (`updatedAt`) with the same
// "Last updated" label everywhere, so the selection carries over when
// switching between types.
const lastUpdated = (): FilterGroupDef => ({ key: 'updated', label: 'Last updated', kind: 'single', fixedOptions: RECENCY_OPTIONS })
const sector: FilterGroupDef = { key: 'sector', label: 'Sector', kind: 'multi', fixedOptions: SECTOR_OPTIONS }

// One group of its own on each tab, after "Last updated": the field that best tells that kind of content apart. Geography is deliberately
// not a filter anywhere: its list grows without bound and would need nesting and endless scrolling.
// The SDG goals' full names are too long for the rail (they wrap onto two lines and crowd the counts), so the filter uses the short
// name of each goal, in goal order. The numbered full names stay in the forms and on the pages.
const SDG_SHORT_NAMES: Record<string, string> = {
  'sdg-1': 'No Poverty',
  'sdg-2': 'Zero Hunger',
  'sdg-3': 'Good Health',
  'sdg-4': 'Quality Education',
  'sdg-5': 'Gender Equality',
  'sdg-6': 'Clean Water & Sanitation',
  'sdg-7': 'Clean Energy',
  'sdg-8': 'Decent Work & Growth',
  'sdg-9': 'Industry & Innovation',
  'sdg-10': 'Reduced Inequalities',
  'sdg-11': 'Sustainable Cities',
  'sdg-12': 'Responsible Consumption',
  'sdg-13': 'Climate Action',
  'sdg-14': 'Life Below Water',
  'sdg-15': 'Life on Land',
  'sdg-16': 'Peace & Justice',
  'sdg-17': 'Partnerships',
}
const SDG_FILTER_OPTIONS = SDG_GOAL_OPTIONS.map((o) => ({ value: o.value, label: SDG_SHORT_NAMES[o.value] ?? o.label }))
const sdgGoal: FilterGroupDef = { key: 'sdgGoal', label: 'SDG goals', kind: 'multi', fixedOptions: SDG_FILTER_OPTIONS, showEmpty: true }
const resourceType: FilterGroupDef = { key: 'resourceType', label: 'Resource type', kind: 'multi', fixedOptions: RESOURCE_TYPE_OPTIONS }
const eventType: FilterGroupDef = { key: 'eventType', label: 'Event type', kind: 'multi', fixedOptions: EVENT_TYPE_OPTIONS }

const ALL_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

const DATASET_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

const USE_CASE_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sdgGoal]

const PUBLICATION_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), resourceType]

const COLLABORATIVE_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sdgGoal]

const EVENT_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), eventType]

const AI_MODEL_FILTER_GROUPS: FilterGroupDef[] = [lastUpdated(), sector]

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
 *  left out rather than shown as "0" — except one that is already selected
 *  (`selected`), which stays listed so an applied filter can never disappear
 *  from the rail while it is still narrowing the results. */
export function computeGroupOptions(group: FilterGroupDef, items: SearchResultItem[], selected: string[] = []): FilterOption[] {
  if (group.key === 'updated') {
    return RECENCY_OPTIONS.map((option) => {
      const days = RECENCY_DAYS[option.value]
      const cutoff = Date.now() - days * 86400000
      const count = items.filter((item) => parseAppTimestamp(item.facets.updatedAt).getTime() >= cutoff).length
      return { ...option, count }
    }).filter((o) => o.count > 0 || selected.includes(o.value))
  }

  const counts = new Map<string, number>()
  for (const item of items) {
    const values = (item.facets[group.key as keyof SearchFacets] as string[] | undefined) ?? []
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  if (group.fixedOptions) {
    return group.fixedOptions
      .map((o) => ({ value: o.value, label: o.label, count: counts.get(o.value) ?? 0 }))
      .filter((o) => o.count > 0 || group.showEmpty || selected.includes(o.value))
  }

  for (const value of selected) if (!counts.has(value)) counts.set(value, 0)
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** The applied selections as plain pairs — group title and option label — for the removable chips above the results. Only groups the
 *  current tab has, in the rail's order. */
export function describeActiveFilters(type: TypeFilter, active: Record<string, string[]>): { key: string; value: string; group: string; label: string }[] {
  const out: { key: string; value: string; group: string; label: string }[] = []
  for (const group of FILTER_GROUPS_BY_TYPE[type]) {
    const options = group.key === 'updated' ? RECENCY_OPTIONS : (group.fixedOptions ?? [])
    for (const value of active[group.key] ?? []) {
      out.push({ key: group.key, value, group: group.label, label: options.find((o) => o.value === value)?.label ?? value })
    }
  }
  return out
}
