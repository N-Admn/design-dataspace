import { EmptyPreviewState } from '@/components/chart/EmptyPreviewState'
import { MapChoroplethPreview } from '@/components/chart/MapChoroplethPreview'
import {
  aggregateRows,
  aggregateSingleValue,
  buildSeries,
  formatChartNumber as formatNumber,
  type ChartColumn,
  type ChartRow,
  type ChartSeries,
  type SeriesData,
} from '@/lib/chart-data'
import { validateChartBuild } from '@/lib/chart-validation'
import { AGGREGATION_OPTIONS, MAX_SERIES, aggregationPhrase, chartValues, type ChartFormState } from '@/types/chart'

/** The categorical palette, in its colorblind-safe order. Slots are assigned in this
 * order and never cycled — past 8, pies fold the rest into "Other" and bar/line
 * charts ask for fewer series (see MAX_SERIES). */
const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
]


/** Authoring surfaces (the chart builder and review) use the large size so the preview
 * has room to breathe; embedded previews (dataset pages, use cases) keep the compact default. */
const PREVIEW_SIZES = {
  default: { plotClass: 'h-48', barMax: 160, lineHeight: 200, pieClass: 'size-40', bigNumberClass: 'py-10' },
  large: { plotClass: 'h-80', barMax: 280, lineHeight: 320, pieClass: 'size-56', bigNumberClass: 'py-20' },
}
type PreviewSize = keyof typeof PREVIEW_SIZES
type PreviewDims = (typeof PREVIEW_SIZES)[PreviewSize]

/** A single series — every bar is the same value measured for a different category,
 * so they share one colour; the X-axis labels already name each bar. */
function BarPreview({
  points,
  xAxisLabel,
  yAxisLabel,
  dims,
}: {
  points: { label: string; value: number }[]
  xAxisLabel: string
  yAxisLabel: string
  dims: PreviewDims
}) {
  const max = Math.max(...points.map((p) => p.value), 1)
  return (
    <div className="flex items-stretch gap-2">
      {yAxisLabel && (
        <div className="flex w-14 shrink-0 items-center justify-end sm:w-20">
          <span className="text-right text-xs leading-tight text-muted-foreground" title={yAxisLabel}>
            {yAxisLabel}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={`flex ${dims.plotClass} items-end gap-3 px-1`}>
          {points.map((point) => (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-medium tabular-nums text-foreground">{formatNumber(point.value)}</span>
              <div
                className="w-full rounded-t-md"
                style={{ height: `${Math.max((point.value / max) * dims.barMax, 4)}px`, backgroundColor: SERIES_COLORS[0] }}
              />
              <span className="w-full truncate text-center text-xs text-muted-foreground" title={point.label}>
                {point.label}
              </span>
            </div>
          ))}
        </div>
        {xAxisLabel && <p className="mt-2 text-center text-xs text-muted-foreground">{xAxisLabel}</p>}
      </div>
    </div>
  )
}

function SeriesLegend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {series.map((s, i) => (
        <span key={s.name} className="type-caption inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[i] }} />
          {s.name}
        </span>
      ))}
    </div>
  )
}

/** Bar chart with two or more series, drawn side by side (grouped) — never stacked,
 * since the series aren't guaranteed to be parts of one whole. */
function GroupedBarPreview({
  data,
  xAxisLabel,
  yAxisLabel,
  showLegend,
  dims,
}: {
  data: SeriesData
  xAxisLabel: string
  yAxisLabel: string
  showLegend: boolean
  dims: PreviewDims
}) {
  const maxValue = Math.max(...data.series.flatMap((s) => s.values), 1)

  return (
    <div className="flex items-stretch gap-2">
      {yAxisLabel && (
        <div className="flex w-14 shrink-0 items-center justify-end sm:w-20">
          <span className="type-caption text-right text-muted-foreground" title={yAxisLabel}>
            {yAxisLabel}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={`flex ${dims.plotClass} items-end gap-3 px-1`}>
          {data.categories.map((category, ci) => (
            <div key={category} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-end gap-0.5" style={{ height: `${dims.barMax}px` }}>
                {data.series.map((s, si) => (
                  <div
                    key={s.name}
                    className="min-w-0 flex-1 rounded-t-sm"
                    title={`${s.name}: ${formatNumber(s.values[ci])}`}
                    style={{
                      height: `${Math.max((s.values[ci] / maxValue) * 100, 1)}%`,
                      backgroundColor: SERIES_COLORS[si],
                    }}
                  />
                ))}
              </div>
              <span className="type-caption w-full truncate text-center text-muted-foreground" title={category}>
                {category}
              </span>
            </div>
          ))}
        </div>
        {xAxisLabel && <p className="type-caption mt-2 text-center text-muted-foreground">{xAxisLabel}</p>}
        {showLegend && <SeriesLegend series={data.series} />}
      </div>
    </div>
  )
}

function LinePreview({
  data,
  xAxisLabel,
  yAxisLabel,
  showLegend,
  dims,
}: {
  data: SeriesData
  xAxisLabel: string
  yAxisLabel: string
  showLegend: boolean
  dims: PreviewDims
}) {
  const width = 480
  const height = dims.lineHeight
  const padding = 24
  const all = data.series.flatMap((s) => s.values)
  const max = Math.max(...all, 1)
  const min = Math.min(...all, 0)
  const range = max - min || 1
  const step = data.categories.length > 1 ? (width - padding * 2) / (data.categories.length - 1) : 0
  const isMulti = data.series.length > 1

  const lines = data.series.map((s, si) => ({
    name: s.name,
    color: SERIES_COLORS[si],
    coords: s.values.map((value, i) => ({
      label: data.categories[i],
      x: padding + i * step,
      y: height - padding - ((value - min) / range) * (height - padding * 2),
    })),
  }))
  const coords = lines[0]?.coords ?? []

  return (
    <div className="flex items-stretch gap-2">
      {yAxisLabel && (
        <div className="flex w-14 shrink-0 items-center justify-end sm:w-20">
          <span className="text-right text-xs leading-tight text-muted-foreground" title={yAxisLabel}>
            {yAxisLabel}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className={`${dims.plotClass} w-full`} preserveAspectRatio="none">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth={1} />
          {lines.map((line) => (
            <g key={line.name}>
              <polyline fill="none" stroke={line.color} strokeWidth={2} points={line.coords.map((c) => `${c.x},${c.y}`).join(' ')} />
              {line.coords.map((c) => (
                <circle key={c.label} cx={c.x} cy={c.y} r={3.5} fill={line.color} />
              ))}
            </g>
          ))}
        </svg>
        <div className="mt-1 flex justify-between px-1 text-xs text-muted-foreground">
          {coords.map((c) => (
            <span key={c.label} className="max-w-[70px] truncate" title={c.label}>
              {c.label}
            </span>
          ))}
        </div>
        {xAxisLabel && <p className="mt-2 text-center text-xs text-muted-foreground">{xAxisLabel}</p>}
        {isMulti && showLegend && <SeriesLegend series={data.series} />}
      </div>
    </div>
  )
}

/** Past the palette's 8 slots, the smallest slices fold into one "Other" slice rather
 * than reusing a colour — so every colour still means exactly one slice. */
function foldIntoOther(points: { label: string; value: number }[]): { label: string; value: number }[] {
  if (points.length <= MAX_SERIES) return points
  const sorted = [...points].sort((a, b) => b.value - a.value)
  const kept = sorted.slice(0, MAX_SERIES - 1)
  const other = sorted.slice(MAX_SERIES - 1).reduce((sum, p) => sum + p.value, 0)
  return [...kept, { label: 'Other', value: other }]
}

function PiePreview({ points: rawPoints, showLegend, dims }: { points: { label: string; value: number }[]; showLegend: boolean; dims: PreviewDims }) {
  const points = foldIntoOther(rawPoints)
  const total = points.reduce((sum, p) => sum + p.value, 0) || 1
  let cursor = 0
  const stops = points.map((point, i) => {
    const start = (cursor / total) * 360
    cursor += point.value
    const end = (cursor / total) * 360
    return `${SERIES_COLORS[i]} ${start}deg ${end}deg`
  })

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div
        className={`${dims.pieClass} shrink-0 rounded-full`}
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Pie chart"
      />
      {showLegend && (
        <div className="flex flex-col gap-1.5">
          {points.map((point, i) => (
            <div key={point.label} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: SERIES_COLORS[i] }} />
              <span className="text-foreground">{point.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
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
function BigNumberPreview({ value, unit, label, dims }: { value: number; unit: string; label: string; dims: PreviewDims }) {
  const formatted = formatNumber(value)
  const trimmedUnit = unit.trim()
  const isCurrency = isCurrencySymbolUnit(trimmedUnit)

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${dims.bigNumberClass} text-center`}>
      <p className="flex flex-wrap items-baseline justify-center gap-x-1.5">
        {isCurrency && <span className="text-3xl font-semibold text-primary">{trimmedUnit}</span>}
        <span className="text-5xl font-bold leading-none tabular-nums text-primary">{formatted}</span>
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
  size?: PreviewSize
}

function ChartPreviewCanvas({ form, columns, rows, size = 'default' }: ChartPreviewCanvasProps) {
  const dims = PREVIEW_SIZES[size]
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

  const errors = validateChartBuild(form, columns)
  if (errors.category || errors.value || errors.split) {
    return (
      <EmptyPreviewState
        message="This chart can't be generated with the selected fields."
        detail={errors.category ?? errors.value ?? errors.split}
        warning
      />
    )
  }

  const valueColumn = columns.find((c) => c.name === config.valueField)
  const valueLabel = valueColumn?.label ?? config.valueField
  const aggregationLabel = AGGREGATION_OPTIONS.find((o) => o.value === config.aggregation)?.label ?? 'Sum'

  if (chartType === 'big-number') {
    const value = aggregateSingleValue(rows, config.valueField, config.aggregation)
    const label = config.displayLabel.trim() || `${aggregationLabel} of ${valueLabel}`
    return <BigNumberPreview value={value} unit={config.unit} label={label} dims={dims} />
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
    const values = chartValues(config)
    const labelFor = (field: string) => columns.find((c) => c.name === field)?.label ?? field
    const data = buildSeries(
      rows,
      config.categoryField,
      values.map((v) => ({ ...v, label: values.length > 1 ? `${aggregationPhrase(v.aggregation)} ${labelFor(v.field)}` : labelFor(v.field) })),
      config.splitField,
    )
    const isMulti = data.series.length > 1
    if (data.series.length > MAX_SERIES) {
      return (
        <EmptyPreviewState
          message="Too many groups to tell apart by colour."
          detail={`${labelFor(config.splitField ?? '')} has ${data.series.length} groups — Split by colour works with up to ${MAX_SERIES}. Choose a field with fewer groups.`}
          warning
        />
      )
    }

    // Custom axis labels are optional — fall back to the underlying dataset field's
    // label so the axis is never blank, without altering the field mapping itself.
    const xAxisLabel = config.xAxisLabel.trim() || labelFor(config.categoryField)
    const yAxisLabel = config.yAxisLabel.trim() || (values.length > 1 ? 'Value' : valueLabel)

    if (chartType === 'line') {
      return <LinePreview data={data} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} showLegend={config.showLegend} dims={dims} />
    }
    if (isMulti) {
      return <GroupedBarPreview data={data} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} showLegend={config.showLegend} dims={dims} />
    }
    return <BarPreview points={points} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} dims={dims} />
  }
  return <PiePreview points={points} showLegend={config.showLegend} dims={dims} />
}

export { ChartPreviewCanvas }
