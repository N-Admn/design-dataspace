import * as React from 'react'
import { BarChart3, Gauge, ImagePlus, LineChart, MapPin, PieChart, Sparkles } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { cn } from '@/lib/utils'
import type { UploadedAsset } from '@/lib/generic-upload'
import { useAppData } from '@/context/AppDataContext'
import {
  categoryOptionsFor,
  getFileColumns,
  getMockRows,
  recommendChartType,
  suggestFields,
  valueOptionsFor,
} from '@/lib/chart-data'
import type { ChartStep2Errors } from '@/lib/chart-validation'
import { MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS } from '@/types/event'
import { AGGREGATION_OPTIONS, CHART_TYPE_OPTIONS, type ChartConfig, type ChartFormState, type ChartType } from '@/types/chart'

const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX']

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  map: MapPin,
  'big-number': Gauge,
  'upload-image': ImagePlus,
}

function categoryFieldLabel(chartType: ChartType | null): string {
  if (chartType === 'map') return 'Geographic field'
  if (chartType === 'bar' || chartType === 'line') return 'X-axis'
  return 'Category'
}

function valueFieldLabel(chartType: ChartType | null): string {
  if (chartType === 'big-number') return 'Value / Measure'
  if (chartType === 'bar' || chartType === 'line') return 'Y-axis'
  return 'Value'
}

interface ChartStep2CreateProps {
  datasetId: string
  form: ChartFormState
  errors: ChartStep2Errors
  onSelectFile: (fileId: string) => void
  onSelectChartType: (chartType: ChartType) => void
  onConfigChange: <K extends keyof ChartConfig>(field: K, value: ChartConfig[K]) => void
  onUploadImage: (asset: UploadedAsset | null) => void
}

function ChartStep2Create({ datasetId, form, errors, onSelectFile, onSelectChartType, onConfigChange, onUploadImage }: ChartStep2CreateProps) {
  const { datasets } = useAppData()
  const dataset = datasets.find((d) => d.id === datasetId)
  const files = (dataset?.form.files ?? []).filter((f) => TABULAR_EXTENSIONS.includes(f.extension.toUpperCase()))

  const isUploadImage = form.chartType === 'upload-image'

  const columns = form.fileId ? getFileColumns(datasetId) : []
  const rows = form.fileId ? getMockRows(datasetId) : []
  const recommended = form.fileId ? recommendChartType(columns) : null

  const categoryOptions = form.chartType && !isUploadImage ? categoryOptionsFor(form.chartType, columns) : []
  const valueOptions = valueOptionsFor(columns)
  const suggestion = form.chartType && !isUploadImage ? suggestFields(form.chartType, columns) : {}

  // Fill in a suggested category/value the first time a chart type (or file) is chosen —
  // never overrides a field the contributor has already set. Not applicable to Upload Image,
  // which has no data-derived configuration.
  const lastAutoKey = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!form.chartType || !form.fileId || isUploadImage) return
    const key = `${form.fileId}:${form.chartType}`
    if (lastAutoKey.current === key) return
    lastAutoKey.current = key
    if (!form.config.categoryField && suggestion.category) onConfigChange('categoryField', suggestion.category)
    if (!form.config.valueField && suggestion.value) onConfigChange('valueField', suggestion.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.chartType, form.fileId])

  const isAxisChart = form.chartType === 'bar' || form.chartType === 'line'
  const isBigNumber = form.chartType === 'big-number'
  const noGeoField = form.chartType === 'map' && categoryOptions.length === 0

  const categoryColumnLabel = columns.find((c) => c.name === form.config.categoryField)?.label
  const valueColumnLabel = columns.find((c) => c.name === form.config.valueField)?.label

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Create your chart</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Visualization</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Choose the data and how you want to visualize it.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files available for this dataset.</p>
          ) : (
            <div>
              <Label htmlFor="chart-file">
                File / Resource <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="chart-file"
                  options={files.map((f) => ({ value: f.id, label: f.name }))}
                  value={form.fileId ?? undefined}
                  onChange={onSelectFile}
                  placeholder="Select a file or resource…"
                  invalid={Boolean(errors.file)}
                />
              </div>
              <FieldError message={errors.file} />
            </div>
          )}

          {form.fileId && (
            <div>
              <Label>
                Chart Type <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5 flex flex-col gap-3">
                {recommended && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    Recommended for this data: {CHART_TYPE_OPTIONS.find((o) => o.value === recommended)?.label}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CHART_TYPE_OPTIONS.map((option) => {
                    const Icon = CHART_TYPE_ICONS[option.value]
                    const isSelected = form.chartType === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onSelectChartType(option.value)}
                        className={cn(
                          'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                          {option.value === recommended && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
                <FieldError message={errors.chartType} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {form.fileId && isUploadImage && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Image</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadField
              id="chart-upload-image"
              label="Chart Image"
              required
              value={form.uploadedImage}
              onChange={onUploadImage}
              extensions={SUPPORTED_IMAGE_EXTENSIONS}
              maxBytes={MAX_IMAGE_BYTES}
              error={errors.image}
              fallbackIcon={ImagePlus}
              variant="dropzone"
              dropzoneTitle="Drag and drop a chart image here, or click to browse."
            />
          </CardContent>
        </Card>
      )}

      {form.fileId && form.chartType && !isUploadImage && (
        <Card>
          <CardHeader>
            <CardTitle>Configure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {form.chartType !== 'big-number' && (
              <div>
                <Label htmlFor="chart-category">
                  {categoryFieldLabel(form.chartType)} <span className="text-destructive">*</span>
                </Label>
                {noGeoField ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">No geographic field was found in this file.</p>
                ) : (
                  <>
                    <div className="mt-1.5">
                      <SearchableSelect
                        id="chart-category"
                        options={categoryOptions.map((c) => ({ value: c.name, label: c.label }))}
                        value={form.config.categoryField || undefined}
                        onChange={(value) => onConfigChange('categoryField', value)}
                        placeholder={`Select ${categoryFieldLabel(form.chartType).toLowerCase()}…`}
                        invalid={Boolean(errors.category)}
                      />
                    </div>
                    {!form.config.categoryField && suggestion.category && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Suggested: {categoryOptions.find((c) => c.name === suggestion.category)?.label}
                      </p>
                    )}
                  </>
                )}
                <FieldError message={errors.category} />
              </div>
            )}

            <div>
              <Label htmlFor="chart-value">
                {valueFieldLabel(form.chartType)} <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="chart-value"
                  options={valueOptions.map((c) => ({ value: c.name, label: c.label }))}
                  value={form.config.valueField || undefined}
                  onChange={(value) => onConfigChange('valueField', value)}
                  placeholder="Select a value column…"
                  invalid={Boolean(errors.value)}
                />
              </div>
              {!form.config.valueField && suggestion.value && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Suggested: {valueOptions.find((c) => c.name === suggestion.value)?.label}
                </p>
              )}
              <FieldError message={errors.value} />
            </div>

            {isAxisChart && (
              <>
                <div>
                  <Label htmlFor="chart-x-axis-label">X-axis Label</Label>
                  <Input
                    id="chart-x-axis-label"
                    className="mt-1.5"
                    placeholder={categoryColumnLabel ?? 'Display label for the X-axis'}
                    value={form.config.xAxisLabel}
                    onChange={(e) => onConfigChange('xAxisLabel', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="chart-y-axis-label">Y-axis Label</Label>
                  <Input
                    id="chart-y-axis-label"
                    className="mt-1.5"
                    placeholder={valueColumnLabel ?? 'Display label for the Y-axis'}
                    value={form.config.yAxisLabel}
                    onChange={(e) => onConfigChange('yAxisLabel', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="chart-aggregation">Aggregation</Label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      id="chart-aggregation"
                      options={AGGREGATION_OPTIONS}
                      value={form.config.aggregation}
                      onChange={(value) => onConfigChange('aggregation', value as ChartConfig['aggregation'])}
                      placeholder="Select aggregation…"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5">
                  <Checkbox
                    checked={form.config.showLegend}
                    onCheckedChange={(checked) => onConfigChange('showLegend', checked === true)}
                  />
                  <span className="text-sm font-medium text-foreground">Show legend</span>
                </label>
              </>
            )}

            {isBigNumber && (
              <>
                <div>
                  <Label htmlFor="chart-unit">
                    Unit <span className="font-normal text-muted-foreground">— Optional</span>
                  </Label>
                  <Input
                    id="chart-unit"
                    className="mt-1.5"
                    placeholder="e.g. %, ₹, Crore, People"
                    value={form.config.unit}
                    onChange={(e) => onConfigChange('unit', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="chart-display-label">Display Label</Label>
                  <Input
                    id="chart-display-label"
                    className="mt-1.5"
                    placeholder={valueColumnLabel ? `e.g. ${valueColumnLabel}` : 'e.g. Annual Health Budget'}
                    value={form.config.displayLabel}
                    onChange={(e) => onConfigChange('displayLabel', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {form.fileId && form.chartType && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPreviewCanvas form={form} columns={columns} rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { ChartStep2Create, categoryFieldLabel, valueFieldLabel }
