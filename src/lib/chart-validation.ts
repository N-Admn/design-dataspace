import type { ChartColumn } from '@/lib/chart-data'
import type { ChartFormState } from '@/types/chart'

export interface ChartStep1Errors {
  dataset?: string
}

export function validateChartStep1(form: ChartFormState): ChartStep1Errors {
  return form.datasetId ? {} : { dataset: 'Select a dataset to continue.' }
}

export interface ChartStep2Errors {
  image?: string
  file?: string
  chartType?: string
  category?: string
  value?: string
}

export function validateChartStep2(form: ChartFormState, columns: ChartColumn[]): ChartStep2Errors {
  const errors: ChartStep2Errors = {}

  if (!form.fileId) {
    errors.file = 'Select a file or resource to continue.'
    return errors
  }
  if (!form.chartType) {
    errors.chartType = 'Select a chart type to continue.'
    return errors
  }

  if (form.chartType === 'upload-image') {
    if (!form.uploadedImage) errors.image = 'Upload a chart image to continue.'
    return errors
  }

  if (form.chartType !== 'big-number') {
    const categoryField = form.config.categoryField
    if (!categoryField) {
      errors.category = form.chartType === 'map' ? 'Select a geographic field.' : 'Select a category column.'
    } else if (form.chartType === 'map') {
      const column = columns.find((c) => c.name === categoryField)
      if (column?.type !== 'geo') errors.category = "We couldn't identify geographic values in this column."
    }
  }

  if (!form.config.valueField) {
    errors.value = 'Select a value column.'
  } else {
    const column = columns.find((c) => c.name === form.config.valueField)
    if (column && column.type !== 'numeric') errors.value = 'Choose a numeric column for this value.'
  }

  return errors
}

export interface ChartNameErrors {
  name?: string
}

const CHART_NAME_MAX_LENGTH = 120

export function validateChartName(
  name: string,
  datasetId: string | null,
  otherCharts: { name: string; datasetId: string | null }[],
): ChartNameErrors {
  const trimmed = name.trim()
  if (!trimmed) return { name: 'Add a name for this chart.' }
  if (trimmed.length > CHART_NAME_MAX_LENGTH) return { name: `Keep the chart name under ${CHART_NAME_MAX_LENGTH} characters.` }
  const isDuplicate = otherCharts.some(
    (chart) => chart.datasetId === datasetId && chart.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (isDuplicate) return { name: 'A chart with this name already exists for this dataset.' }
  return {}
}

export interface ChartReadinessItem {
  key: string
  label: string
  ok: boolean
  message?: string
  step: 1 | 2 | 3
}

export function getChartReadiness(
  form: ChartFormState,
  columns: ChartColumn[],
  otherCharts: { name: string; datasetId: string | null }[],
): ChartReadinessItem[] {
  const step1 = validateChartStep1(form)
  const step2 = validateChartStep2(form, columns)
  const nameErrors = validateChartName(form.name, form.datasetId, otherCharts)

  const base: ChartReadinessItem[] = [
    { key: 'dataset', label: 'Dataset selected', ok: !step1.dataset, message: step1.dataset, step: 1 },
    { key: 'file', label: 'File selected', ok: !step2.file, message: step2.file, step: 2 },
    { key: 'type', label: 'Chart type selected', ok: !step2.chartType, message: step2.chartType, step: 2 },
  ]

  if (form.chartType === 'upload-image') {
    return [
      ...base,
      { key: 'image', label: 'Chart image uploaded', ok: !step2.image, message: step2.image, step: 2 },
      { key: 'name', label: 'Chart name added', ok: !nameErrors.name, message: nameErrors.name, step: 3 },
    ]
  }

  const configOk = !step2.category && !step2.value
  const previewOk = !step2.file && !step2.chartType && configOk

  return [
    ...base,
    { key: 'config', label: 'Configuration valid', ok: configOk, message: step2.category ?? step2.value, step: 2 },
    {
      key: 'preview',
      label: 'Chart preview generated',
      ok: previewOk,
      message: previewOk ? undefined : "This chart can't be generated with the selected fields.",
      step: 2,
    },
    { key: 'name', label: 'Chart name added', ok: !nameErrors.name, message: nameErrors.name, step: 3 },
  ]
}

export function isChartReadyToPublish(items: ChartReadinessItem[]): boolean {
  return items.every((item) => item.ok)
}
