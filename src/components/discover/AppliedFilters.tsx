import { X } from 'lucide-react'

interface AppliedFilter {
  key: string
  value: string
  group: string
  label: string
}

/** The filters currently applied, as removable chips above the results (“Sector: Gender ×”), with Clear all. They are what is narrowing
 *  the list, so an empty result always shows what to take away. Renders nothing when no filter is applied. */
function AppliedFilters({ filters, onRemove, onClearAll }: { filters: AppliedFilter[]; onRemove: (key: string, value: string) => void; onClearAll: () => void }) {
  if (filters.length === 0) return null
  return (
    <div role="group" aria-label="Applied filters" className="mb-4 flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={`${f.key}:${f.value}`}
          type="button"
          onClick={() => onRemove(f.key, f.value)}
          aria-label={`Remove filter ${f.group}: ${f.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-subdued px-3 py-1 text-sm text-text-default transition-colors hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <span className="text-text-subdued">{f.group}:</span>
          {f.label}
          <X className="size-3.5 text-text-subdued" aria-hidden="true" />
        </button>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-sm text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export { AppliedFilters }
