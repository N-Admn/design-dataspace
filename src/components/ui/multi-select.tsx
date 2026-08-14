import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  id?: string
  invalid?: boolean
}

function MultiSelect({
  options,
  values,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText = 'No results found.',
  id,
  invalid,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  return (
    <div className="flex flex-col gap-2">
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
            aria-invalid={invalid || undefined}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            )}
          >
            <span className={cn('truncate text-left', values.length === 0 && 'text-muted-foreground')}>
              {values.length === 0 ? placeholder : `${values.length} selected`}
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
              const isSelected = values.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-muted',
                    isSelected && 'bg-muted',
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="size-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => {
            const option = options.find((o) => o.value === value)
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
              >
                {option?.label ?? value}
                <button
                  type="button"
                  onClick={() => toggle(value)}
                  className="rounded-full text-accent-foreground/70 hover:text-accent-foreground"
                  aria-label={`Remove ${option?.label ?? value}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { MultiSelect }
