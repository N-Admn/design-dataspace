import * as React from 'react'
import { ChevronDown, LayoutGrid, LayoutList } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** The two controls at the right of a results toolbar, shared by the Search results page and the Community directory: a sort menu
 *  and a list / grid switch. */

export type ResultView = 'list' | 'grid'

function ViewToggle({ view, onChange }: { view: ResultView; onChange: (view: ResultView) => void }) {
  const options: { value: ResultView; label: string; icon: typeof LayoutList }[] = [
    { value: 'list', label: 'List view', icon: LayoutList },
    { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  ]
  return (
    <div className="flex shrink-0 gap-1 rounded-lg border border-border bg-muted/40 p-1" role="group" aria-label="Result view">
      {options.map((option) => {
        const Icon = option.icon
        const active = view === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

function SortMenu<T extends string>({ sort, options, onChange }: { sort: T; options: { value: T; label: string }[]; onChange: (sort: T) => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sort: {options.find((o) => o.value === sort)?.label}
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <div className="flex flex-col">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ViewToggle, SortMenu }
