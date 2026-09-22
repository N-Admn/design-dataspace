import * as React from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Calendar, Download, FileQuestion, Hash, Info, Loader2, MapPin, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/ui/toast'
import { getResourceTitle } from '@/lib/file-validation'
import { resolveFilePreviewKind } from '@/lib/file-preview-kind'
import { computeColumnInsight, toNumber, type ChartColumn, type ChartColumnType, type ChartRow } from '@/lib/chart-data'
import { cn } from '@/lib/utils'
import type { DatasetFile } from '@/types/dataset'

const COLUMN_TYPE_META: Record<ChartColumnType, { glyph: string; icon: typeof Type; label: string }> = {
  categorical: { glyph: 'Aa', icon: Type, label: 'Text' },
  numeric: { glyph: '123', icon: Hash, label: 'Number' },
  date: { glyph: '', icon: Calendar, label: 'Date' },
  geo: { glyph: '', icon: MapPin, label: 'Geographic' },
}

function ColumnTypeIndicator({ type }: { type: ChartColumnType }) {
  const meta = COLUMN_TYPE_META[type]
  const Icon = meta.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-border-default bg-surface-subdued text-[10px] font-semibold text-text-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          {meta.glyph || <Icon className="size-3" aria-hidden="true" />}
          <span className="sr-only">Type: {meta.label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>Type: {meta.label}</TooltipContent>
    </Tooltip>
  )
}

type SortState = { column: string; direction: 'asc' | 'desc' } | null

function SortButton({ column, sort, onSort, children }: { column: ChartColumn; sort: SortState; onSort: (name: string) => void; children: React.ReactNode }) {
  const active = sort?.column === column.name
  const Icon = active ? (sort!.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={() => onSort(column.name)}
      aria-label={`Sort by ${column.label}${active ? `, ${sort!.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      className="group flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      {children}
      <Icon className={cn('size-3.5 shrink-0', active ? 'text-text-brand' : 'text-text-subdued opacity-0 group-hover:opacity-60')} aria-hidden="true" />
    </button>
  )
}

/** Insight row — one meaningful summary per column, directly under the
 * headers. Some columns (currently date/geo) have none: `computeColumnInsight`
 * returns `undefined` and the cell renders empty rather than a placeholder,
 * per "do not fabricate insights". Sticks directly beneath the header row
 * (same `top-10` as the header's own `h-10`) so it stays associated with the
 * headers while the body scrolls underneath. */
function InsightRow({ columns, rows }: { columns: ChartColumn[]; rows: ChartRow[] }) {
  return (
    <tr className="h-9 text-xs text-text-subdued">
      {columns.map((col, i) => (
        <td
          key={col.name}
          className={cn(
            'sticky top-10 whitespace-nowrap border-b border-border-default bg-surface-default px-4 py-1.5 italic',
            i === 0 ? 'z-30 left-0' : 'z-20',
          )}
        >
          {computeColumnInsight(col, rows) ?? ''}
        </td>
      ))}
    </tr>
  )
}

function NoPreview({ icon: Icon, title, description, onDownload }: { icon: typeof FileQuestion; title: string; description: string; onDownload: () => void }) {
  return (
    <EmptyState
      variant="filled"
      icon={Icon}
      title={title}
      description={description}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onDownload}>
          <Download className="size-4" />
          Download
        </Button>
      }
    />
  )
}

interface DataFilePreviewProps {
  file: DatasetFile
  columns: ChartColumn[]
  rows: ChartRow[]
  onOpenDetails: (file: DatasetFile) => void
}

/** The right-hand pane of the Data tab: the selected file's header (name,
 * format, size, row/column counts, File details, Download) and a preview
 * that depends on the file's type. For tabular files this is a read preview
 * with sorting and a per-column insight row — not a data-manipulation tool,
 * so there's no search box or column show/hide control here. */
function DataFilePreview({ file, columns, rows, onOpenDetails }: DataFilePreviewProps) {
  const toast = useToast()
  const [sort, setSort] = React.useState<SortState>(null)
  // Every other page in this prototype resolves synchronously from mock
  // context (see the Dataset Details implementation notes) — this one brief,
  // real transition mirrors the same convention `ResourcePreviewDialog`
  // already uses for its tabular preview, rather than a silent instant swap.
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setSort(null)
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(timer)
  }, [file.id])

  const title = getResourceTitle(file)
  const titleDiffersFromFilename = title.toLowerCase() !== file.name.toLowerCase()
  const kind = resolveFilePreviewKind(file.extension)

  const handleDownload = () => {
    // No file storage backs dataset files in this prototype — see the
    // Dataset Details implementation report's backend-gap notes.
    toast({ title: 'Download coming soon', description: "File downloads aren't available yet." })
  }

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.name === sort.column)
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      if (column?.type === 'numeric') {
        const an = toNumber(a[sort.column]) ?? -Infinity
        const bn = toNumber(b[sort.column]) ?? -Infinity
        return (an - bn) * factor
      }
      return String(a[sort.column] ?? '').localeCompare(String(b[sort.column] ?? '')) * factor
    })
  }, [rows, sort, columns])

  const toggleSort = (columnName: string) => {
    setSort((prev) => {
      if (prev?.column !== columnName) return { column: columnName, direction: 'asc' }
      if (prev.direction === 'asc') return { column: columnName, direction: 'desc' }
      return null
    })
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Subtle location context — only shown when the file actually has a
              folder path, and only distinguishes files, never becomes its own
              navigation (no links, no wrapping breadcrumb component). */}
          {file.path && (
            <p className="truncate text-xs text-text-subdued">{file.path.split('/').join(' / ')}</p>
          )}
          <p className="truncate text-sm font-semibold text-text-default">{title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-text-subdued">
            {titleDiffersFromFilename && <span className="truncate">{file.name}</span>}
            {titleDiffersFromFilename && <span aria-hidden="true">·</span>}
            <span>{file.extension}</span>
            <span aria-hidden="true">·</span>
            <span>{file.sizeLabel}</span>
            {file.rowCount != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{file.rowCount.toLocaleString()} rows</span>
              </>
            )}
            {file.columnCount != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{file.columnCount.toLocaleString()} columns</span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenDetails(file)}>
            <Info className="size-4" />
            File details
          </Button>
          <Button type="button" size="sm" onClick={handleDownload}>
            <Download className="size-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="border-t border-border-default pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-subdued">Data preview</p>

        {loading ? (
          <EmptyState variant="filled">
            <Loader2 className="size-6 animate-spin text-text-subdued" />
            <p className="text-sm text-text-subdued">Loading preview…</p>
          </EmptyState>
        ) : kind === 'tabular' ? (
          rows.length === 0 ? (
            <EmptyState icon={FileQuestion} title="This file has no rows" description="There's no data to preview yet." />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-text-subdued">
                Previewing the first {rows.length.toLocaleString()} rows
                {file.rowCount != null && rows.length < file.rowCount ? ` of ${file.rowCount.toLocaleString()}` : ''}
              </p>

              {/* Bounded viewport: vertical scroll for rows, horizontal scroll for
                  columns, both inside this box rather than the page itself. The
                  header (column names + insight row) and the first column stay
                  in view via independent `sticky` offsets on their own cells —
                  see the corner cell, which is sticky on both axes at once. */}
              <div className="max-h-[28rem] overflow-auto rounded-lg border border-border-default">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <caption className="sr-only">Preview of rows from {title}</caption>
                  <thead>
                    <tr className="h-10 text-left text-xs font-medium uppercase tracking-wide text-text-subdued">
                      {columns.map((col, i) => (
                        <th
                          key={col.name}
                          scope="col"
                          aria-sort={sort?.column === col.name ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                          className={cn(
                            'sticky top-0 whitespace-nowrap border-b border-border-default bg-surface-subdued px-4 py-2.5 font-medium',
                            i === 0 ? 'z-30 left-0' : 'z-20',
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <SortButton column={col} sort={sort} onSort={toggleSort}>
                              {col.label}
                            </SortButton>
                            <ColumnTypeIndicator type={col.type} />
                          </span>
                        </th>
                      ))}
                    </tr>
                    <InsightRow columns={columns} rows={rows} />
                  </thead>
                  <tbody>
                    {sortedRows.map((row, i) => (
                      <tr key={i} className="border-b border-border-default last:border-b-0 hover:bg-surface-subdued/30">
                        {columns.map((col, j) => (
                          <td key={col.name} className={cn('whitespace-nowrap px-4 py-2.5 text-text-default', j === 0 && 'sticky left-0 z-10 bg-surface-default')}>
                            {row[col.name] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : kind === 'image' ? (
        <NoPreview icon={FileQuestion} title="Image preview isn't available yet" description="This dataset's images aren't backed by real file storage yet." onDownload={handleDownload} />
      ) : kind === 'pdf' ? (
        <NoPreview icon={FileQuestion} title="PDF preview isn't available yet" description="This dataset's PDFs aren't backed by real file storage yet." onDownload={handleDownload} />
      ) : kind === 'audio' ? (
        <NoPreview icon={FileQuestion} title="Audio preview isn't available yet" description="This dataset's audio isn't backed by real file storage yet." onDownload={handleDownload} />
      ) : (
        <NoPreview
          icon={AlertTriangle}
          title={`${file.extension || 'This'} files can't be previewed`}
          description="Download the file to view it."
          onDownload={handleDownload}
        />
      )}
      </div>
    </div>
  )
}

export { DataFilePreview }
