import type { UploadedAsset } from '@/lib/generic-upload'

export type ChartStatus = 'draft' | 'pending' | 'published'

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

export interface ChartConfig {
  /** Category (pie), X-axis data field (bar/line), or geographic field (map). Unused for big-number/upload-image. */
  categoryField: string
  /** Value/measure (pie/map/big-number), or Y-axis data field (bar/line). */
  valueField: string
  aggregation: ChartAggregation
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
   * while edits are Pending, so Discard has the live version to revert to. */
  publishedForm: ChartFormState | null
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
