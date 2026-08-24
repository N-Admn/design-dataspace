import { EmptyPreviewState } from '@/components/chart/EmptyPreviewState'
import { MapChoroplethPreview } from '@/components/chart/MapChoroplethPreview'
import { aggregateRows, aggregateSingleValue, formatChartNumber as formatNumber, type ChartColumn, type ChartRow } from '@/lib/chart-data'
import { validateChartStep2 } from '@/lib/chart-validation'
import { AGGREGATION_OPTIONS, type ChartFormState } from '@/types/chart'

const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function BarPreview({
  points,
  xAxisLabel,
  yAxisLabel,
  showLegend,
}: {
  points: { label: string; value: number }[]
  xAxisLabel: string
  yAxisLabel: string
  showLegend: boolean
}) {
  const max = Math.max(...points.map((p) => p.value), 1)
  return (
    <div className="flex items-stretch gap-2">
      {yAxisLabel && (
        <div className="flex w-14 shrink-0 items-center justify-end sm:w-20">
          <span className="text-right text-[11px] leading-tight text-muted-foreground" title={yAxisLabel}>
            {yAxisLabel}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex h-48 items-end gap-3 px-1">
          {points.map((point, i) => (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-foreground">{formatNumber(point.value)}</span>
              <div
                className="w-full rounded-t-md"
                style={{ height: `${Math.max((point.value / max) * 160, 4)}px`, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="w-full truncate text-center text-[11px] text-muted-foreground" title={point.label}>
                {point.label}
              </span>
            </div>
          ))}
        </div>
        {xAxisLabel && <p className="mt-2 text-center text-xs text-muted-foreground">{xAxisLabel}</p>}
        {showLegend && (
          <div className="mt-3 flex flex-wrap gap-2">
            {points.map((point, i) => (
              <span key={point.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                {point.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinePreview({
  points,
  xAxisLabel,
  yAxisLabel,
}: {
  points: { label: string; value: number }[]
  xAxisLabel: string
  yAxisLabel: string
}) {
  const width = 480
  const height = 200
  const padding = 24
  const max = Math.max(...points.map((p) => p.value), 1)
  const min = Math.min(...points.map((p) => p.value), 0)
  const range = max - min || 1
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0

  const coords = points.map((point, i) => {
    const x = padding + i * step
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
    return { ...point, x, y }
  })

  return (
    <div className="flex items-stretch gap-2">
      {yAxisLabel && (
        <div className="flex w-14 shrink-0 items-center justify-end sm:w-20">
          <span className="text-right text-[11px] leading-tight text-muted-foreground" title={yAxisLabel}>
            {yAxisLabel}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" preserveAspectRatio="none">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth={1} />
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
          />
          {coords.map((c) => (
            <circle key={c.label} cx={c.x} cy={c.y} r={3.5} fill="var(--primary)" />
          ))}
        </svg>
        <div className="mt-1 flex justify-between px-1 text-[11px] text-muted-foreground">
          {coords.map((c) => (
            <span key={c.label} className="max-w-[70px] truncate" title={c.label}>
              {c.label}
            </span>
          ))}
        </div>
        {xAxisLabel && <p className="mt-2 text-center text-xs text-muted-foreground">{xAxisLabel}</p>}
      </div>
    </div>
  )
}

function PiePreview({ points, showLegend }: { points: { label: string; value: number }[]; showLegend: boolean }) {
  const total = points.reduce((sum, p) => sum + p.value, 0) || 1
  let cursor = 0
  const stops = points.map((point, i) => {
    const start = (cursor / total) * 360
    cursor += point.value
    const end = (cursor / total) * 360
    return `${SERIES_COLORS[i % SERIES_COLORS.length]} ${start}deg ${end}deg`
  })

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div
        className="size-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Pie chart"
      />
      {showLegend && (
        <div className="flex flex-col gap-1.5">
          {points.map((point, i) => (
            <div key={point.label} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
              <span className="text-foreground">{point.label}</span>
              <span className="text-xs text-muted-foreground">
                {formatNumber(point.value)} · {Math.round((point.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** A lone currency-style symbol reads as part of the numeric expression ("₹ 2,555")
 * so it sits close to the number at a size just below it; a descriptive unit
 * ("Cr", "%", "Million") is measurement context, not the value itself, so it
 * stays clearly secondary — smaller still, lighter weight. */
function isCurrencySymbolUnit(unit: string): boolean {
  return /^[₹$€£]$/.test(unit.trim())
}

/** Three fixed typography levels — value, unit, display label — reused for every
 * Big Number chart rather than sized ad hoc, so hierarchy stays consistent
 * across datasets: the value is always the dominant element regardless of
 * how long the unit or label happens to be. */
function BigNumberPreview({ value, unit, label }: { value: number; unit: string; label: string }) {
  const formatted = formatNumber(value)
  const trimmedUnit = unit.trim()
  const isCurrency = isCurrencySymbolUnit(trimmedUnit)

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <p className="flex flex-wrap items-baseline justify-center gap-x-1.5">
        {isCurrency && <span className="text-3xl font-semibold text-primary">{trimmedUnit}</span>}
        <span className="text-5xl font-bold leading-none text-primary">{formatted}</span>
        {trimmedUnit && !isCurrency && <span className="text-lg font-medium text-primary/70">{trimmedUnit}</span>}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

interface ChartPreviewCanvasProps {
  form: ChartFormState
  columns: ChartColumn[]
  rows: ChartRow[]
}

function ChartPreviewCanvas({ form, columns, rows }: ChartPreviewCanvasProps) {
  if (form.chartType === 'upload-image') {
    if (!form.uploadedImage?.dataUrl) {
      return <EmptyPreviewState message="Complete the required fields to preview this chart." />
    }
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
        <img src={form.uploadedImage.dataUrl} alt={form.name || 'Uploaded chart'} className="w-full object-contain" />
      </div>
    )
  }

  const { chartType, config } = form

  if (!chartType) {
    return <EmptyPreviewState message="Complete the required fields to preview this chart." />
  }

  const missingRequired = chartType === 'big-number' ? !config.valueField : !config.categoryField || !config.valueField
  if (missingRequired) {
    return <EmptyPreviewState message="Complete the required fields to preview this chart." />
  }

  const errors = validateChartStep2(form, columns)
  if (errors.category || errors.value) {
    return <EmptyPreviewState message="This chart can't be generated with the selected fields." detail={errors.category ?? errors.value} warning />
  }

  const valueColumn = columns.find((c) => c.name === config.valueField)
  const valueLabel = valueColumn?.label ?? config.valueField
  const aggregationLabel = AGGREGATION_OPTIONS.find((o) => o.value === config.aggregation)?.label ?? 'Sum'

  if (chartType === 'big-number') {
    const value = aggregateSingleValue(rows, config.valueField, config.aggregation)
    const label = config.displayLabel.trim() || `${aggregationLabel} of ${valueLabel}`
    return <BigNumberPreview value={value} unit={config.unit} label={label} />
  }

  if (chartType === 'map') {
    // Delegates its own aggregation/boundary-matching to buildChoroplethData —
    // unlike the other chart types it can't rely on the generic `points` list
    // below, since it also needs to reconcile regions the data has no row for.
    return (
      <MapChoroplethPreview
        rows={rows}
        categoryField={config.categoryField}
        valueField={config.valueField}
        aggregation={config.aggregation}
        valueLabel={valueLabel}
      />
    )
  }

  const points = aggregateRows(rows, config.categoryField, config.valueField, config.aggregation)
  if (points.length === 0) {
    return <EmptyPreviewState message="This chart can't be generated with the selected fields." detail="No matching numeric values were found." warning />
  }

  if (chartType === 'bar' || chartType === 'line') {
    // Custom axis labels are optional — fall back to the underlying dataset field's
    // label so the axis is never blank, without altering the field mapping itself.
    const categoryColumn = columns.find((c) => c.name === config.categoryField)
    const categoryLabel = categoryColumn?.label ?? config.categoryField
    const xAxisLabel = config.xAxisLabel.trim() || categoryLabel
    const yAxisLabel = config.yAxisLabel.trim() || valueLabel
    if (chartType === 'bar') return <BarPreview points={points} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} showLegend={config.showLegend} />
    return <LinePreview points={points} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />
  }
  return <PiePreview points={points} showLegend={config.showLegend} />
}

export { ChartPreviewCanvas }
