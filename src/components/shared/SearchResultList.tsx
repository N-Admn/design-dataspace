import * as React from 'react'
import { Search, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Canonical builder-search dropdown anatomy, extracted from the Resources search
 * so Organisation and Contributor searches present identically:
 *   [type icon]  Primary name
 *                Secondary metadata
 * Purely presentational — every search keeps its own data source, filtering and
 * selection logic.
 */

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoFocus?: boolean
  className?: string
}

/** Search field: leading magnifier + borderless text input in a rounded border box. */
function SearchInput({ value, onChange, placeholder, autoFocus, className }: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border-input bg-surface-default px-3 py-2',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-text-subdued" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-text-subdued"
      />
    </div>
  )
}

interface SearchResultListProps {
  isEmpty: boolean
  emptyLabel: string
  children: React.ReactNode
  className?: string
}

/** Bordered results container with a centered empty state. */
function SearchResultList({ isEmpty, emptyLabel, children, className }: SearchResultListProps) {
  return (
    <div className={cn('rounded-lg border border-border-default', className)}>
      {isEmpty ? (
        <p className="px-4 py-6 text-center text-sm text-text-subdued">{emptyLabel}</p>
      ) : (
        children
      )}
    </div>
  )
}

interface SearchResultRowProps {
  icon: LucideIcon
  primary: string
  secondary?: string
  onSelect: () => void
}

/** One result: leading type icon, primary name, optional secondary metadata line. */
function SearchResultRow({ icon: Icon, primary, secondary, onSelect }: SearchResultRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 border-b border-border-default px-4 py-3 text-left last:border-b-0 hover:bg-surface-subdued/50"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-subdued text-text-subdued">
        <Icon className="size-4" />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text-default">{primary}</span>
        {secondary && <span className="block truncate text-xs text-text-subdued">{secondary}</span>}
      </span>
    </button>
  )
}

export { SearchInput, SearchResultList, SearchResultRow }
