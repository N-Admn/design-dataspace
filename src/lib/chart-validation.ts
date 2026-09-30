import type { ChartColumn } from '@/lib/chart-data'
import { chartValues, type ChartFormState } from '@/types/chart'

export interface ChartBuildErrors {
  dataset?: string
  image?: string
  file?: string
  chartType?: string
  category?: string
  value?: string
  split?: string
}

export function validateChartBuild(form: ChartFormState, columns: ChartColumn[]): ChartBuildErrors {
  const errors: ChartBuildErrors = {}

  if (!form.datasetId) {
    errors.dataset = 'Select a dataset to continue.'
    return errors
  }
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

  const values = chartValues(form.config)
  if (values.length === 0) {
    errors.value = 'Select a value column.'
  } else {
    const nonNumeric = values.some((v) => {
      const column = columns.find((c) => c.name === v.field)
      return column && column.type !== 'numeric'
    })
    if (nonNumeric) errors.value = 'Choose a numeric column for this value.'
  }

  const isAxisChart = form.chartType === 'bar' || form.chartType === 'line'
  const splitField = form.config.splitField
  if (isAxisChart && splitField && values.length <= 1 && splitField === form.config.categoryField) {
    errors.split = 'Choose a different field than the X-axis to split by colour.'
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
  step: 1 | 2
}

export function getChartReadiness(
  form: ChartFormState,
  columns: ChartColumn[],
  otherCharts: { name: string; datasetId: string | null }[],
): ChartReadinessItem[] {
  const build = validateChartBuild(form, columns)
  const nameErrors = validateChartName(form.name, form.datasetId, otherCharts)

  const base: ChartReadinessItem[] = [
    { key: 'dataset', label: 'Dataset selected', ok: !build.dataset, message: build.dataset, step: 1 },
    { key: 'file', label: 'File selected', ok: !build.dataset && !build.file, message: build.file, step: 1 },
    { key: 'type', label: 'Chart type selected', ok: !build.dataset && !build.file && !build.chartType, message: build.chartType, step: 1 },
  ]

  if (form.chartType === 'upload-image') {
    return [
      ...base,
      { key: 'image', label: 'Chart image uploaded', ok: !build.image, message: build.image, step: 1 },
      { key: 'name', label: 'Chart name added', ok: !nameErrors.name, message: nameErrors.name, step: 2 },
    ]
  }

  const configOk = !build.category && !build.value && !build.split
  const previewOk = Object.keys(build).length === 0

  return [
    ...base,
    { key: 'config', label: 'Configuration valid', ok: configOk, message: build.category ?? build.value ?? build.split, step: 1 },
    {
      key: 'preview',
      label: 'Chart preview generated',
      ok: previewOk,
      message: previewOk ? undefined : "This chart can't be generated with the selected fields.",
      step: 1,
    },
    { key: 'name', label: 'Chart name added', ok: !nameErrors.name, message: nameErrors.name, step: 2 },
  ]
}

export function isChartReadyToPublish(items: ChartReadinessItem[]): boolean {
  return items.every((item) => item.ok)
}
