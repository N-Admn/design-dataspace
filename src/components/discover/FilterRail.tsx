import * as React from 'react'
import type { ReactNode } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { computeGroupOptions, type FilterGroupDef, type FilterOption } from '@/lib/search-filters'
import { filterItems, type ActiveFilters, type SearchResultItem } from '@/lib/global-search'

interface FilterRailProps {
  groups: FilterGroupDef[]
  /** The current type + keyword-matched pool, before ANY filter group is
   *  applied. Each group's own counts are computed by further narrowing this
   *  by every *other* active group (AND across groups), so picking a value in
   *  one group can shrink another group's counts, but never its own. */
  items: SearchResultItem[]
  active: ActiveFilters
  onChange: (key: string, values: string[]) => void
  onClearAll: () => void
  /** Pins the rail below the sticky search block (its height, in px) so only the results scroll. */
  stickyTop?: number
}

/** One option row — label wraps onto multiple lines when long, without ever
 *  disturbing the count's alignment to the rail's right edge: the label sits
 *  in a `min-w-0 flex-1` column, the count is `shrink-0`, and the row aligns
 *  its children to the top so a wrapped label doesn't push the count (or the
 *  control) out of line with its first line of text. */
function OptionRow({ children, count }: { children: ReactNode; count: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex min-w-0 items-start gap-2">{children}</span>
      <span className="shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{count}</span>
    </div>
  )
}

/** How many options a checkbox group shows before the rest are folded away behind "Show all". */
const COLLAPSED_COUNT = 6

/** A group of checkboxes. A long list shows its most common options (and anything already ticked) with a "Show all N" button for the rest,
 *  so a list of seventeen does not push every other filter off the screen. Expanded, the options are in their own order. */
function CheckboxGroup({ groupKey, options, selected, onChange }: { groupKey: string; options: FilterOption[]; selected: string[]; onChange: (key: string, values: string[]) => void }) {
  const [expanded, setExpanded] = React.useState(false)
  const collapsible = options.length > COLLAPSED_COUNT + 1
  const visible = React.useMemo(() => {
    if (!collapsible || expanded) return options
    const keep = new Set(options.filter((o) => selected.includes(o.value)).map((o) => o.value))
    for (const o of [...options].sort((a, b) => b.count - a.count)) {
      if (keep.size >= COLLAPSED_COUNT) break
      keep.add(o.value)
    }
    return options.filter((o) => keep.has(o.value))
  }, [options, selected, collapsible, expanded])
  return (
    <div className="flex flex-col gap-3.5">
      {visible.map((option) => {
        const checked = selected.includes(option.value)
        // An option with nothing behind it (only listed for closed lists that show every value) is dimmed and cannot be ticked, unless it
        // is already ticked, so it can still be cleared.
        const empty = option.count === 0 && !checked
        return (
          <label key={option.value} className={empty ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <OptionRow count={option.count}>
              <Checkbox
                className="mt-0.5"
                checked={checked}
                disabled={empty}
                onCheckedChange={(next) => onChange(groupKey, next ? [...selected, option.value] : selected.filter((v) => v !== option.value))}
              />
              <span className={empty ? 'text-sm font-normal text-muted-foreground' : 'text-sm font-normal text-foreground'}>{option.label}</span>
            </OptionRow>
          </label>
        )
      })}
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="self-start rounded-sm text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? 'Show fewer' : `Show all ${options.length}`}
        </button>
      )}
    </div>
  )
}

/** Left filter rail — multi-select groups render as checkboxes (OR within
 *  the group), single-select as radios. Groups and their options are entirely
 *  data-driven (see `lib/search-filters.ts`); an option with no matches in
 *  the current result pool isn't shown, rather than shown as a fake "0". */
function FilterRail({ groups, items, active, onChange, onClearAll, stickyTop }: FilterRailProps) {
  if (groups.length === 0) return null
  const hasActiveFilters = Object.keys(active).length > 0

  return (
    <div
      className={cn(
        'flex w-full shrink-0 flex-col gap-8 sm:w-[18%]',
        stickyTop !== undefined && 'sm:sticky sm:self-start sm:overflow-y-auto sm:pb-6 sm:pr-2',
      )}
      style={stickyTop !== undefined ? { top: stickyTop, maxHeight: `calc(100dvh - ${stickyTop}px)` } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wider text-foreground">Filter by</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-sm text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear all
          </button>
        )}
      </div>

      {groups.map((group) => {
        const otherFilters = Object.fromEntries(Object.entries(active).filter(([key]) => key !== group.key))
        const pool = filterItems(items, otherFilters)
        const options = computeGroupOptions(group, pool)
        if (options.length === 0) return null
        const selected = active[group.key] ?? []

        return (
          <fieldset key={group.key} className="flex flex-col">
            {/* A margin on the legend itself, not the fieldset's flex `gap` —
                `<legend>` inside a flex container is inconsistently treated
                as a flex item across browsers, so relying on gap here risked
                this exact spacing silently not landing at 14px everywhere. */}
            <legend className="mb-3.5 text-sm font-semibold text-foreground">{group.label}</legend>

            {group.kind === 'single' ? (
              <RadioGroup
                value={selected[0] ?? 'any'}
                onValueChange={(value) => onChange(group.key, value === 'any' ? [] : [value])}
                className="gap-3.5"
              >
                <OptionRow count={pool.length}>
                  <RadioGroupItem value="any" id={`${group.key}-any`} className="mt-0.5" />
                  <Label htmlFor={`${group.key}-any`} className="text-sm font-normal text-foreground">
                    Any time
                  </Label>
                </OptionRow>
                {options.map((option) => (
                  <OptionRow key={option.value} count={option.count}>
                    <RadioGroupItem value={option.value} id={`${group.key}-${option.value}`} className="mt-0.5" />
                    <Label htmlFor={`${group.key}-${option.value}`} className="text-sm font-normal text-foreground">
                      {option.label}
                    </Label>
                  </OptionRow>
                ))}
              </RadioGroup>
            ) : (
              <CheckboxGroup groupKey={group.key} options={options} selected={selected} onChange={onChange} />
            )}
          </fieldset>
        )
      })}
    </div>
  )
}

export { FilterRail }
