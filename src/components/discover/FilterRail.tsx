import type { ReactNode } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { computeGroupOptions, type FilterGroupDef } from '@/lib/search-filters'
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

/** Left filter rail — multi-select groups render as checkboxes (OR within
 *  the group), single-select as radios. Groups and their options are entirely
 *  data-driven (see `lib/search-filters.ts`); an option with no matches in
 *  the current result pool isn't shown, rather than shown as a fake "0". */
function FilterRail({ groups, items, active, onChange, onClearAll }: FilterRailProps) {
  if (groups.length === 0) return null
  const hasActiveFilters = Object.keys(active).length > 0

  return (
    <div className="flex w-full shrink-0 flex-col gap-8 sm:w-[18%]">
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
              <div className="flex flex-col gap-3.5">
                {options.map((option) => {
                  const checked = selected.includes(option.value)
                  return (
                    <label key={option.value} className="cursor-pointer">
                      <OptionRow count={option.count}>
                        <Checkbox
                          className="mt-0.5"
                          checked={checked}
                          onCheckedChange={(next) =>
                            onChange(group.key, next ? [...selected, option.value] : selected.filter((v) => v !== option.value))
                          }
                        />
                        <span className="text-sm font-normal text-foreground">{option.label}</span>
                      </OptionRow>
                    </label>
                  )
                })}
              </div>
            )}
          </fieldset>
        )
      })}
    </div>
  )
}

export { FilterRail }
