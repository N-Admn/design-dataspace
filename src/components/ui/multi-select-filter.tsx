import * as React from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface MultiSelectFilterOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  options: MultiSelectFilterOption[]
  /** Selected values, in the order they were picked. */
  value: string[]
  onToggle: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  id?: string
}

/** Same dropdown pattern as SearchableSelect (trigger button, popover, search
 *  field, checkmarks) but multi-select: selected options float to the top of the
 *  list in selection order, above a divider, with the rest in their default order.
 *  Deselecting an option drops it back to its original position. */
function MultiSelectFilter({
  options,
  value,
  onToggle,
  placeholder,
  searchPlaceholder,
  emptyText = 'No results found.',
  id,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const selectedSet = React.useMemo(() => new Set(value), [value])
  const selectedOptions = React.useMemo(
    () => value.map((v) => options.find((o) => o.value === v)).filter((o): o is MultiSelectFilterOption => Boolean(o)),
    [value, options],
  )

  const ordered = React.useMemo(
    () => [...selectedOptions, ...options.filter((o) => !selectedSet.has(o.value))],
    [selectedOptions, options, selectedSet],
  )
  const q = query.trim().toLowerCase()
  const filtered = q ? ordered.filter((o) => o.label.toLowerCase().includes(q)) : ordered

  // Divider sits after the last selected option, but only when the unfiltered list
  // actually has both a selected and an unselected group to separate.
  const dividerAfterValue =
    !q && selectedOptions.length > 0 && selectedOptions.length < options.length
      ? selectedOptions[selectedOptions.length - 1].value
      : null

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
          )}
        >
          <span className={cn('truncate text-left', selectedOptions.length === 0 && 'text-muted-foreground')}>
            {selectedOptions.length === 0 ? placeholder : selectedOptions.map((o) => o.label).join(', ')}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder ?? placeholder}
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
          )}
          {filtered.map((option) => {
            const isSelected = selectedSet.has(option.value)
            return (
              <React.Fragment key={option.value}>
                <button
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="size-4 text-primary" />}
                </button>
                {dividerAfterValue === option.value && <div className="my-1 border-t border-border" />}
              </React.Fragment>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelectFilter }
