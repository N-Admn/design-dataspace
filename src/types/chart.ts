import type { UploadedAsset } from '@/lib/generic-upload'

export type ChartStatus = 'draft' | 'published'

/** "Upload Image" is a visualization type alongside the data-driven ones, not a
 * separate creation method — every chart still resolves to exactly one File /
 * Resource of one Dataset regardless of which type is selected. */
export type ChartType = 'bar' | 'line' | 'pie' | 'map' | 'big-number' | 'upload-image'

export const CHART_TYPE_OPTIONS: { value: ChartType; label: string; description: string }[] = [
  { value: 'bar', label: 'Bar', description: 'Compare values across categories.' },
  { value: 'line', label: 'Line', description: 'Show change or trends over time.' },
  { value: 'pie', label: 'Pie', description: 'Show parts of a meaningful whole.' },
  { value: 'map', label: 'Map', description: 'Show values by geography.' },
  { value: 'big-number', label: 'Big Number', description: 'Highlight one key value.' },
  { value: 'upload-image', label: 'Upload Image', description: 'Add an externally created visualization.' },
]

export type ChartAggregation = 'sum' | 'average' | 'count'

export const AGGREGATION_OPTIONS: { value: ChartAggregation; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'average', label: 'Average' },
  { value: 'count', label: 'Count' },
]

/** One measured value — a numeric field plus how its rows are combined. */
export interface ChartValue {
  field: string
  aggregation: ChartAggregation
}

export interface ChartConfig {
  /** Category (pie), X-axis data field (bar/line), or geographic field (map). Unused for big-number/upload-image. */
  categoryField: string
  /** Value/measure (pie/map/big-number), or the first Y-axis value (bar/line). */
  valueField: string
  aggregation: ChartAggregation
  /** Bar/Line only — values after the first (`valueField`); each becomes its own series.
   * Bar charts always draw multiple series side by side — never stacked, since the
   * values aren't guaranteed to add up to a meaningful whole. */
  extraValues?: ChartValue[]
  /** Bar/Line only — a category whose distinct values each become a coloured series.
   * Only used with a single value; extra values take precedence. */
  splitField?: string
  showLegend: boolean
  /** Big Number only — optional contextual unit shown beside the value (e.g. "%", "₹", "Crore"). */
  unit: string
  /** Big Number only — the descriptive text shown under the value. Independent from `unit`. */
  displayLabel: string
  /** Bar/Line only — display label for the X-axis, independent from the underlying `categoryField` name. */
  xAxisLabel: string
  /** Bar/Line only — display label for the Y-axis, independent from the underlying `valueField` name. */
  yAxisLabel: string
}

export interface ChartFormState {
  datasetId: string | null
  fileId: string | null
  chartType: ChartType | null
  config: ChartConfig
  /** Only used when chartType is "upload-image" — the chart's actual visual. */
  uploadedImage: UploadedAsset | null
  name: string
}

export interface ChartRecord {
  id: string
  status: ChartStatus
  updatedAt: string
  form: ChartFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while a working copy has unpublished edits, so Discard can restore the live version. */
  publishedForm: ChartFormState | null
  /** Present only for content created within an Organisation Workspace — absent
   *  (undefined) means it belongs to the individual's My Workspace. */
  organisationId?: string
  /** Display name of the member who created this record. */
  createdBy?: string
}

export const emptyChartConfig: ChartConfig = {
  categoryField: '',
  valueField: '',
  aggregation: 'sum',
  showLegend: true,
  unit: '',
  displayLabel: '',
  xAxisLabel: '',
  yAxisLabel: '',
}

export const emptyChartForm: ChartFormState = {
  datasetId: null,
  fileId: null,
  chartType: null,
  config: emptyChartConfig,
  uploadedImage: null,
  name: '',
}

/** Every value on the chart, in order — the first lives in `valueField`/`aggregation`
 * (which pie, map and big-number read directly), the rest in `extraValues`. */
export function chartValues(config: ChartConfig): ChartValue[] {
  if (!config.valueField) return []
  return [{ field: config.valueField, aggregation: config.aggregation }, ...(config.extraValues ?? [])]
}

/** The inverse of `chartValues` — the config fields to write for a new list of values. */
export function valuesToConfig(values: ChartValue[]): Pick<ChartConfig, 'valueField' | 'aggregation' | 'extraValues'> {
  const [first, ...rest] = values
  return { valueField: first?.field ?? '', aggregation: first?.aggregation ?? 'sum', extraValues: rest }
}

/** "Sum of", "Average of", "Count of" — prefixes a value's field label in plain language. */
export function aggregationPhrase(aggregation: ChartAggregation): string {
  const label = AGGREGATION_OPTIONS.find((o) => o.value === aggregation)?.label ?? 'Sum'
  return `${label} of`
}

/** Size of the categorical chart palette (--chart-1 … --chart-8). Colours are never
 * cycled, so this is the most series a bar/line chart can show, and the most slices a
 * pie shows before the rest fold into "Other". */
export const MAX_SERIES = 8

/** "Pie", "Map", "Big Number" … — the chart type's display name. */
export function chartTypeName(chartType: ChartType | null): string {
  return CHART_TYPE_OPTIONS.find((o) => o.value === chartType)?.label ?? 'This'
}
