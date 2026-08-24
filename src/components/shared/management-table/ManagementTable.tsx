import * as React from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Plus, Search, SlidersHorizontal, X, type LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { useMediaQuery } from '@/hooks/use-media-query'

// ---------- Shared row-geometry tokens (the validated Datasets reference values) ----------
const PAGE_SIZE = 10
const HEADER_HEIGHT_REM = '3rem' // 48px
const ROW_MIN_HEIGHT_REM = '3rem' // 48px — responsive floor
const ROW_MAX_HEIGHT_REM = '4.5rem' // 72px — cap; 3.5rem (56px) is where rows land whenever there's enough room
const FOOTER_HEIGHT_REM = '3.5rem' // 56px
const ACTIONS_WIDTH_REM = '7rem'

export interface ManagementColumn<T> {
  key: string
  label: string
  /** Omit only for the primary (first) column — it's always the flexible 1fr column. */
  widthRem?: string
  /** Hidden below this breakpoint, independent of the Columns toggle state. */
  responsive?: 'md' | 'lg'
  /** Toggleable via the Columns control. Omit for columns that are always shown. */
  optional?: boolean
  /** Only meaningful when optional is true. */
  defaultVisible?: boolean
  sortable?: boolean
  compare?: (a: T, b: T) => number
  align?: 'left' | 'right'
  render: (row: T) => React.ReactNode
}

export interface ManagementFilterDef<T> {
  key: string
  label: string
  placeholder: string
  options: { value: string; label: string }[]
  matches: (row: T, value: string) => boolean
}

export interface ManagementRowAction<T> {
  key: string
  icon: LucideIcon
  label: (row: T) => string
  onClick: (row: T) => void
  destructive?: boolean
}

export interface ManagementTableProps<T, S extends string> {
  title: string
  subtitle: (count: number) => string
  addLabel: string
  onAdd: () => void
  items: T[]
  getId: (row: T) => string
  columns: ManagementColumn<T>[]
  defaultSortKey: string
  defaultSortDirection?: 'asc' | 'desc'
  filters?: ManagementFilterDef<T>[]
  statuses?: { key: S; label: string }[]
  getStatus?: (row: T) => S
  searchPlaceholder: string
  searchMatch?: (row: T, query: string) => boolean
  getActions: (row: T) => ManagementRowAction<T>[]
  emptyTitle: string
  emptyDescription: string
  tabEmptyMessage?: (statusKey: S) => string
  /** Not wired by any module today — every list loads synchronously from mock
   * app state with no real fetch, so these never fire. Kept so a future real
   * data layer can drive them without changing this component's contract. */
  loading?: boolean
  loadError?: boolean
  onRetry?: () => void
}

interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

function SortableHeader({ label, active, direction, onSort }: { label: string; active: boolean; direction: 'asc' | 'desc'; onSort: () => void }) {
  return (
    <button
      type="button"
      onClick={onSort}
      aria-label={`Sort by ${label}${active ? `, ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      className="group flex items-center gap-1 text-left font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {active ? (
        direction === 'asc' ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowDown className="size-3.5 text-primary" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
      )}
    </button>
  )
}

function RowActionButton<T>({ action, row }: { action: ManagementRowAction<T>; row: T }) {
  const label = action.label(row)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={() => action.onClick(row)}
          className={cn(action.destructive && 'text-destructive hover:bg-destructive/10 hover:text-destructive')}
        >
          <action.icon className="!size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

function CenteredBodyMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center">{children}</div>
}

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('h-3.5 animate-pulse rounded bg-muted', className)} />
}

function ManagementTable<T, S extends string>({
  title,
  subtitle,
  addLabel,
  onAdd,
  items,
  getId,
  columns,
  defaultSortKey,
  defaultSortDirection = 'desc',
  filters = [],
  statuses,
  getStatus,
  searchPlaceholder,
  searchMatch,
  getActions,
  emptyTitle,
  emptyDescription,
  tabEmptyMessage,
  loading = false,
  loadError = false,
  onRetry,
}: ManagementTableProps<T, S>) {
  const isLgUp = useMediaQuery('(min-width: 1024px)')
  const isMdUp = useMediaQuery('(min-width: 768px)')

  const [statusTab, setStatusTab] = React.useState<S | 'all'>('all')
  const [query, setQuery] = React.useState('')
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})
  const [sort, setSort] = React.useState<SortState>({ key: defaultSortKey, direction: defaultSortDirection })
  const [page, setPage] = React.useState(1)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [columnsOpen, setColumnsOpen] = React.useState(false)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    () => new Set(columns.filter((c) => c.optional && c.defaultVisible !== false).map((c) => c.key)),
  )

  const primaryColumn = columns[0]

  const isColumnVisible = React.useCallback(
    (col: ManagementColumn<T>) => {
      if (col.optional && !visibleColumns.has(col.key)) return false
      if (col.responsive === 'lg' && !isLgUp) return false
      if (col.responsive === 'md' && !isMdUp) return false
      return true
    },
    [visibleColumns, isLgUp, isMdUp],
  )

  const visibleSecondaryColumns = columns.slice(1).filter(isColumnVisible)
  const columnTemplate = ['minmax(0, 1fr)', ...visibleSecondaryColumns.map((c) => c.widthRem!), ACTIONS_WIDTH_REM].join(' ')

  const optionalColumns = columns.filter((c) => c.optional)
  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const publishedTabs = statuses
    ? [{ key: 'all' as const, label: 'All', count: items.length }, ...statuses.map((s) => ({ key: s.key, label: s.label, count: items.filter((i) => getStatus?.(i) === s.key).length }))]
    : []

  const tabFiltered = statuses && getStatus && statusTab !== 'all' ? items.filter((i) => getStatus(i) === statusTab) : items
  const searched = query.trim() && searchMatch ? tabFiltered.filter((i) => searchMatch(i, query)) : tabFiltered
  const filtered = searched.filter((row) => filters.every((f) => !filterValues[f.key] || f.matches(row, filterValues[f.key])))

  const sortColumn = columns.find((c) => c.key === sort.key)
  const sorted = sortColumn?.compare
    ? [...filtered].sort((a, b) => (sort.direction === 'asc' ? sortColumn.compare!(a, b) : -sortColumn.compare!(a, b)))
    : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE)

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleStatusTabChange = (next: S | 'all') => {
    setStatusTab(next)
    setPage(1)
  }
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }
  const clearSearch = () => {
    setQuery('')
    setPage(1)
  }
  const activeFilterCount = filters.filter((f) => filterValues[f.key]).length
  const hasActiveFilters = activeFilterCount > 0
  const clearFilters = () => {
    setFilterValues({})
    setPage(1)
  }
  const handleSortClick = (key: string) => {
    setSort((prev) => (prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }))
    setPage(1)
  }

  let body: React.ReactNode

  if (loading) {
    body = (
      <div role="table" className="flex h-full flex-col text-sm">
        <div role="rowgroup" className="min-h-0 flex-1" style={{ display: 'grid', gridTemplateRows: `repeat(${PAGE_SIZE}, minmax(${ROW_MIN_HEIGHT_REM}, ${ROW_MAX_HEIGHT_REM}))` }}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div role="row" key={i} className="grid items-center border-b border-border last:border-b-0" style={{ gridTemplateColumns: columnTemplate }}>
              <div className="px-4">
                <SkeletonBar className="w-2/3" />
              </div>
              {visibleSecondaryColumns.map((col) => (
                <div className="px-4" key={col.key}>
                  <SkeletonBar className="w-16" />
                </div>
              ))}
              <div className="px-4">
                <SkeletonBar className="w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  } else if (loadError) {
    body = (
      <CenteredBodyMessage>
        <AlertTriangle className="size-6 text-destructive" />
        <p className="text-sm font-medium text-foreground">Couldn't load {title.toLowerCase()}</p>
        <p className="text-sm text-muted-foreground">Something went wrong while loading your {title.toLowerCase()}.</p>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" className="mt-1" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CenteredBodyMessage>
    )
  } else if (items.length === 0) {
    body = (
      <CenteredBodyMessage>
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        <Button type="button" size="sm" className="mt-1" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </CenteredBodyMessage>
    )
  } else if (tabFiltered.length === 0) {
    body = (
      <CenteredBodyMessage>
        <p className="text-sm text-muted-foreground">{statusTab !== 'all' && tabEmptyMessage ? tabEmptyMessage(statusTab) : ''}</p>
      </CenteredBodyMessage>
    )
  } else if (sorted.length === 0) {
    const hasQuery = query.trim() !== ''
    body = (
      <CenteredBodyMessage>
        <p className="text-sm font-medium text-foreground">
          {hasActiveFilters && !hasQuery && `No ${title.toLowerCase()} match your filters.`}
          {hasQuery && !hasActiveFilters && `No matching ${title.toLowerCase()}`}
          {hasQuery && hasActiveFilters && `No ${title.toLowerCase()} match your search and filters.`}
        </p>
        {hasQuery && <p className="text-sm text-muted-foreground">Try a different search term.</p>}
        <div className="mt-1 flex items-center gap-2">
          {hasQuery && (
            <Button type="button" variant="outline" size="sm" onClick={clearSearch}>
              Clear search
            </Button>
          )}
          {hasActiveFilters && (
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </CenteredBodyMessage>
    )
  } else {
    body = (
      <div role="table" className="flex h-full flex-col text-sm">
        <div
          role="row"
          className="grid shrink-0 items-center border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
          style={{ gridTemplateColumns: columnTemplate, height: HEADER_HEIGHT_REM }}
        >
          <div role="columnheader" className="px-4" aria-sort={sort.key === primaryColumn.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}>
            {primaryColumn.sortable ? (
              <SortableHeader label={primaryColumn.label} active={sort.key === primaryColumn.key} direction={sort.direction} onSort={() => handleSortClick(primaryColumn.key)} />
            ) : (
              primaryColumn.label
            )}
          </div>
          {visibleSecondaryColumns.map((col) => (
            <div
              key={col.key}
              role="columnheader"
              className={cn('px-4', col.align === 'right' && 'text-right')}
              aria-sort={sort.key === col.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              {col.sortable ? (
                <SortableHeader label={col.label} active={sort.key === col.key} direction={sort.direction} onSort={() => handleSortClick(col.key)} />
              ) : (
                col.label
              )}
            </div>
          ))}
          <div role="columnheader" className="px-4 text-right">
            Actions
          </div>
        </div>

        <div role="rowgroup" className="min-h-0 flex-1" style={{ display: 'grid', gridTemplateRows: `repeat(${pageItems.length}, minmax(${ROW_MIN_HEIGHT_REM}, ${ROW_MAX_HEIGHT_REM}))` }}>
          {pageItems.map((row) => {
            const rowActions = getActions(row)
            return (
              <div key={getId(row)} role="row" className="grid items-center border-b border-border last:border-b-0 hover:bg-muted/30" style={{ gridTemplateColumns: columnTemplate }}>
                <div role="cell" className="min-w-0 px-4">
                  {primaryColumn.render(row)}
                </div>
                {visibleSecondaryColumns.map((col) => (
                  <div key={col.key} role="cell" className={cn('min-w-0 px-4 text-muted-foreground', col.align === 'right' && 'text-right')}>
                    {col.render(row)}
                  </div>
                ))}
                <div role="cell" className="px-4">
                  <div className="flex items-center justify-end gap-2">
                    {rowActions.map((action) => (
                      <RowActionButton key={action.key} action={action} row={row} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const showPagination = !loading && !loadError && sorted.length > 0

  const statusTabsRow = statuses && (
    <div className="flex shrink-0 items-center gap-1 border-b border-border px-5" role="tablist">
      {publishedTabs.map((tab) => {
        const isActive = tab.key === statusTab
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleStatusTabChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
              isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-medium', isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>{tab.count}</span>
          </button>
        )
      })}
    </div>
  )

  const searchFilterRow = (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
      <div className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" onClick={clearSearch} aria-label="Clear search" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {filters.length > 0 && (
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                <SlidersHorizontal className="size-4" />
                Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4">
              <div className="flex flex-col gap-4">
                {filters.map((f) => (
                  <div key={f.key}>
                    <Label htmlFor={`filter-${f.key}`}>{f.label}</Label>
                    <div className="mt-1.5">
                      <SearchableSelect
                        id={`filter-${f.key}`}
                        options={f.options}
                        value={filterValues[f.key] ?? ''}
                        onChange={(value) => {
                          setFilterValues((prev) => ({ ...prev, [f.key]: value }))
                          setPage(1)
                        }}
                        placeholder={f.placeholder}
                      />
                    </div>
                  </div>
                ))}
                {activeFilterCount > 0 && (
                  <Button type="button" variant="ghost" size="sm" className="self-start" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {optionalColumns.length > 0 && (
          <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                <Columns3 className="size-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-1">
              <div className="flex flex-col">
                <label className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 opacity-60">
                  <Checkbox checked disabled />
                  <span className="flex-1 text-sm text-foreground">{primaryColumn.label}</span>
                  <span className="text-xs text-muted-foreground">locked</span>
                </label>
                {optionalColumns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 hover:bg-muted">
                    <Checkbox checked={visibleColumns.has(col.key)} onCheckedChange={() => toggleColumn(col.key)} />
                    <span className="flex-1 text-sm text-foreground">{col.label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 opacity-60">
                  <Checkbox checked disabled />
                  <span className="flex-1 text-sm text-foreground">Actions</span>
                  <span className="text-xs text-muted-foreground">locked</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )

  return (
    <Card className={cn('flex flex-col', WORKSPACE_HEIGHT_CLASS)}>
      <CardHeader className="flex-row shrink-0 items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">{subtitle(items.length)}</p>
        </div>
        <Button type="button" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </CardHeader>

      {searchFilterRow}
      {statusTabsRow}

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">{body}</CardContent>

      {showPagination && (
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5" style={{ height: FOOTER_HEIGHT_REM }}>
          <p className="text-xs text-muted-foreground">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <p className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <Button type="button" variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export { ManagementTable }
