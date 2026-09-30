import * as React from 'react'
import {
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Gauge,
  GripVertical,
  Hash,
  ImagePlus,
  LineChart,
  MapPin,
  PieChart,
  Search,
  Sparkles,
  Type,
  X,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { ChartDatasetPicker } from '@/components/chart/ChartDatasetPicker'
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
  type ChartColumn,
  type ChartColumnType,
} from '@/lib/chart-data'
import type { ChartBuildErrors } from '@/lib/chart-validation'
import { MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS } from '@/types/event'
import {
  AGGREGATION_OPTIONS,
  CHART_TYPE_OPTIONS,
  MAX_SERIES,
  chartTypeName,
  aggregationPhrase,
  chartValues,
  valuesToConfig,
  type ChartAggregation,
  type ChartConfig,
  type ChartFormState,
  type ChartType,
  type ChartValue,
} from '@/types/chart'

const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX']

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  map: MapPin,
  'big-number': Gauge,
  'upload-image': ImagePlus,
}

const COLUMN_TYPE_META: Record<ChartColumnType, { label: string; icon: typeof Hash }> = {
  numeric: { label: 'Number', icon: Hash },
  categorical: { label: 'Text', icon: Type },
  date: { label: 'Date', icon: Calendar },
  geo: { label: 'Location', icon: MapPin },
}

function categoryFieldLabel(chartType: ChartType | null): string {
  if (chartType === 'map') return 'Geographic field'
  if (chartType === 'bar' || chartType === 'line') return 'X-axis'
  return 'Category'
}

function valueFieldLabel(chartType: ChartType | null): string {
  if (chartType === 'bar' || chartType === 'line') return 'Values (Y-axis)'
  return 'Value'
}

function categoryHelper(chartType: ChartType | null): string {
  if (chartType === 'bar') return 'What each bar represents, e.g. State'
  if (chartType === 'line') return 'What each point represents, e.g. Quarter'
  if (chartType === 'map') return 'Where each value goes on the map'
  return 'Each slice is one of these, e.g. Sector'
}

function valueHelper(chartType: ChartType | null): string {
  if (chartType === 'bar' || chartType === 'line') return 'The numbers to measure. Add more than one to compare them.'
  if (chartType === 'pie') return 'The number that sizes each slice'
  if (chartType === 'map') return 'The number that colours each region'
  return 'The number to highlight'
}

/** Drag payload key — the field's `name` travels in dataTransfer, but browsers hide
 * it until drop, so the builder also tracks the dragged column in state to light up
 * the zones that accept it. */
const DRAG_TYPE = 'text/plain'

/** Every field in the selected file, draggable into the drop zones. Fills the height
 * of the Configure column beside it and scrolls internally, so a wide file never
 * stretches the card. */
function FieldList({
  columns,
  roleFor,
  onDragField,
}: {
  columns: ChartColumn[]
  roleFor: (name: string) => string | null
  onDragField: (column: ChartColumn | null) => void
}) {
  const [query, setQuery] = React.useState('')
  const q = query.trim().toLowerCase()
  const visible = q ? columns.filter((c) => c.label.toLowerCase().includes(q)) : columns

  return (
    <div className="relative h-80 lg:h-auto lg:min-h-96">
      <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col gap-2 border-b border-border bg-muted/40 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="type-label text-foreground">Fields</p>
            <p className="type-caption text-muted-foreground">
              {q ? `${visible.length} of ${columns.length}` : columns.length}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              aria-label="Search fields"
              className="type-body w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="type-caption text-muted-foreground">Drag a field into a box on the right.</p>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-1.5" aria-label="Fields in this file">
          {visible.length === 0 && <li className="type-body px-3 py-6 text-center text-muted-foreground">No fields match your search.</li>}
          {visible.map((column) => {
            const meta = COLUMN_TYPE_META[column.type]
            const Icon = meta.icon
            const role = roleFor(column.name)
            return (
              <li
                key={column.name}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_TYPE, column.name)
                  e.dataTransfer.effectAllowed = 'copy'
                  onDragField(column)
                }}
                onDragEnd={() => onDragField(null)}
                className={cn(
                  'group flex cursor-grab items-center gap-3 rounded-md px-2.5 py-2 hover:bg-muted active:cursor-grabbing',
                  role && 'bg-primary/5',
                )}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="type-body truncate text-foreground" title={column.label}>
                    {column.label}
                  </p>
                  <p className="type-caption text-muted-foreground">{meta.label}</p>
                </div>
                {role && <span className="type-caption shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{role}</span>}
                <GripVertical className="size-4 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground" aria-hidden />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** A labelled box that accepts dragged fields. `canAccept` decides whether the field
 * currently being dragged may land here; zones that can't take it fade out. */
function DropZone({
  label,
  htmlFor,
  required,
  helper,
  dragging,
  canAccept,
  onDropField,
  note,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  helper: string
  dragging: ChartColumn | null
  canAccept: boolean
  onDropField: (name: string) => void
  note?: string
  error?: string
  children: React.ReactNode
}) {
  const [over, setOver] = React.useState(false)
  const active = dragging !== null && canAccept

  return (
    <div>
      <Label htmlFor={htmlFor}>
        {label} {required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">— Optional</span>}
      </Label>
      <p className="type-caption mt-0.5 text-muted-foreground">{helper}</p>
      <div
        onDragOver={(e) => {
          if (!active) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          if (!over) setOver(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const name = e.dataTransfer.getData(DRAG_TYPE)
          if (active && name) onDropField(name)
        }}
        className={cn(
          'mt-1.5 flex flex-col gap-1.5 rounded-lg border border-dashed p-1.5 transition-colors',
          error ? 'border-destructive' : 'border-border',
          active && 'border-primary bg-primary/5',
          active && over && 'bg-primary/10',
          dragging && !canAccept && 'opacity-50',
        )}
      >
        {children}
        {active && over && <p className="type-caption px-2 py-1 text-primary">Drop {dragging.label} here</p>}
      </div>
      {note && <p className="type-caption mt-1.5 text-muted-foreground">{note}</p>}
      <FieldError message={error} />
    </div>
  )
}

function FieldChip({
  column,
  text,
  onRemove,
  trailing,
}: {
  column: ChartColumn | undefined
  text: string
  onRemove: () => void
  trailing?: React.ReactNode
}) {
  const Icon = column ? COLUMN_TYPE_META[column.type].icon : Hash
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${text}`}
        className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="type-body min-w-0 flex-1 truncate text-foreground" title={text}>
        {text}
      </span>
      {trailing}
    </div>
  )
}

/** Sum / Average / Count for one value, opened from the chevron on its chip. */
function AggregationMenu({ value, fieldLabel, onChange }: { value: ChartAggregation; fieldLabel: string; onChange: (value: ChartAggregation) => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Change how ${fieldLabel} is combined`}
          className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <p className="type-caption px-2 pb-1 pt-1.5 text-muted-foreground">Combine rows by</p>
        {AGGREGATION_OPTIONS.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="type-body flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-foreground hover:bg-muted"
            >
              {option.label}
              {selected && <Check className="size-4 text-primary" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

interface ChartStep1BuildProps {
  form: ChartFormState
  errors: ChartBuildErrors
  onSelectDataset: (datasetId: string | null) => void
  onSelectFile: (fileId: string) => void
  onSelectChartType: (chartType: ChartType) => void
  onConfigChange: (patch: Partial<ChartConfig>) => void
  onUploadImage: (asset: UploadedAsset | null) => void
}

function ChartStep1Build({
  form,
  errors,
  onSelectDataset,
  onSelectFile,
  onSelectChartType,
  onConfigChange,
  onUploadImage,
}: ChartStep1BuildProps) {
  const { datasets } = useAppData()
  const datasetId = form.datasetId
  const dataset = datasetId ? datasets.find((d) => d.id === datasetId) : undefined
  const files = (dataset?.form.files ?? []).filter((f) => TABULAR_EXTENSIONS.includes(f.extension.toUpperCase()))

  const [dragging, setDragging] = React.useState<ChartColumn | null>(null)

  const isUploadImage = form.chartType === 'upload-image'

  const columns = datasetId && form.fileId ? getFileColumns(datasetId) : []
  const rows = datasetId && form.fileId ? getMockRows(datasetId) : []
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
    const patch: Partial<ChartConfig> = {}
    if (!form.config.categoryField && suggestion.category) patch.categoryField = suggestion.category
    if (!form.config.valueField && suggestion.value) patch.valueField = suggestion.value
    if (Object.keys(patch).length > 0) onConfigChange(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.chartType, form.fileId])

  const isAxisChart = form.chartType === 'bar' || form.chartType === 'line'
  const isBigNumber = form.chartType === 'big-number'
  const isSingleValueChart = form.chartType === 'pie' || form.chartType === 'map' || isBigNumber
  const noGeoField = form.chartType === 'map' && categoryOptions.length === 0

  const values = chartValues(form.config)
  const splitField = isAxisChart ? (form.config.splitField ?? '') : ''
  const columnFor = (name: string) => columns.find((c) => c.name === name)
  const labelFor = (name: string) => columnFor(name)?.label ?? name

  const categoryColumnLabel = form.config.categoryField ? labelFor(form.config.categoryField) : undefined
  const valueColumnLabel = form.config.valueField ? labelFor(form.config.valueField) : undefined

  // ── Field placement ────────────────────────────────────────────────────────
  const setValues = (next: ChartValue[]) => onConfigChange(valuesToConfig(next))

  // Pie, map and big-number hold exactly one value: once it's set, the zone accepts
  // nothing more — remove the chip to choose a different one.
  const valuesFull = isSingleValueChart ? values.length >= 1 : values.length >= MAX_SERIES
  const valuesBlockedBySplit = isAxisChart && Boolean(splitField) && values.length >= 1

  const canAddValue = (column: ChartColumn) =>
    column.type === 'numeric' && !values.some((v) => v.field === column.name) && !valuesFull && !valuesBlockedBySplit

  const addValue = (name: string) => {
    const column = columnFor(name)
    if (!column || !canAddValue(column)) return
    setValues([...values, { field: name, aggregation: 'sum' as ChartAggregation }])
  }

  const valueNote = (() => {
    if (isSingleValueChart && values.length >= 1) return `${chartTypeName(form.chartType)} charts show one value. Remove it to choose a different one.`
    if (valuesBlockedBySplit) return 'Remove the Split by colour field to add more values.'
    if (values.length >= MAX_SERIES) return `You can compare up to ${MAX_SERIES} values.`
    return undefined
  })()

  const canSetCategory = (column: ChartColumn) => categoryOptions.some((c) => c.name === column.name)
  const setCategory = (name: string) => {
    const column = columnFor(name)
    if (column && canSetCategory(column)) onConfigChange({ categoryField: name })
  }

  const canSetSplit = (column: ChartColumn) =>
    isAxisChart && column.type !== 'numeric' && column.name !== form.config.categoryField && values.length <= 1
  const setSplit = (name: string) => {
    const column = columnFor(name)
    if (column && canSetSplit(column)) onConfigChange({ splitField: name })
  }

  const roleFor = (name: string): string | null => {
    if (!isBigNumber && name === form.config.categoryField) return categoryFieldLabel(form.chartType)
    if (values.some((v) => v.field === name)) return isAxisChart ? 'Y-axis' : 'Value'
    if (name === splitField) return 'Colour'
    return null
  }

  const handleSelectChartType = (chartType: ChartType) => {
    onSelectChartType(chartType)
  }

  const splitOptions = columns.filter((c) => c.type !== 'numeric' && c.name !== form.config.categoryField)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <p className="type-body mt-1 text-muted-foreground">Choose the dataset and the file you want to visualize.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="chart-dataset">
              Dataset <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <ChartDatasetPicker datasetId={datasetId} error={errors.dataset} onSelect={onSelectDataset} />
            </div>
          </div>

          {dataset &&
            (files.length === 0 ? (
              <p className="type-body text-muted-foreground">No tabular files are available in this dataset.</p>
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
            ))}
        </CardContent>
      </Card>

      {form.fileId && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recommended && (
              <p className="type-caption flex items-center gap-1.5 text-muted-foreground">
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
                    onClick={() => handleSelectChartType(option.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      {option.value === recommended && (
                        <span className="type-caption rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Recommended</span>
                      )}
                    </div>
                    <p className="type-body font-semibold text-foreground">{option.label}</p>
                    <p className="type-caption text-muted-foreground">{option.description}</p>
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.chartType} />
          </CardContent>
        </Card>
      )}

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
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <FieldList columns={columns} roleFor={roleFor} onDragField={setDragging} />

            <div className="flex flex-col gap-5">
              {!isBigNumber && (
                <DropZone
                  label={categoryFieldLabel(form.chartType)}
                  htmlFor="chart-category"
                  required
                  helper={categoryHelper(form.chartType)}
                  dragging={dragging}
                  canAccept={dragging ? canSetCategory(dragging) : false}
                  onDropField={setCategory}
                  error={errors.category}
                >
                  {noGeoField ? (
                    <p className="type-body px-2 py-1.5 text-muted-foreground">No geographic field was found in this file.</p>
                  ) : form.config.categoryField ? (
                    <FieldChip
                      column={columnFor(form.config.categoryField)}
                      text={labelFor(form.config.categoryField)}
                      onRemove={() => onConfigChange({ categoryField: '' })}
                    />
                  ) : (
                    <SearchableSelect
                      id="chart-category"
                      options={categoryOptions.map((c) => ({ value: c.name, label: c.label }))}
                      value={undefined}
                      onChange={setCategory}
                      placeholder="+ Add a field"
                      invalid={Boolean(errors.category)}
                    />
                  )}
                </DropZone>
              )}

              <DropZone
                label={valueFieldLabel(form.chartType)}
                htmlFor="chart-value"
                required
                helper={valueHelper(form.chartType)}
                dragging={dragging}
                canAccept={dragging ? canAddValue(dragging) : false}
                onDropField={addValue}
                note={valueNote}
                error={errors.value}
              >
                {values.map((value, index) => (
                  <FieldChip
                    key={value.field}
                    column={columnFor(value.field)}
                    text={`${aggregationPhrase(value.aggregation)} ${labelFor(value.field)}`}
                    onRemove={() => setValues(values.filter((_, i) => i !== index))}
                    trailing={
                      <AggregationMenu
                        value={value.aggregation}
                        fieldLabel={labelFor(value.field)}
                        onChange={(aggregation) => setValues(values.map((v, i) => (i === index ? { ...v, aggregation } : v)))}
                      />
                    }
                  />
                ))}
                {!valuesFull && !valuesBlockedBySplit && (
                  <SearchableSelect
                    id="chart-value"
                    options={valueOptions.filter((c) => !values.some((v) => v.field === c.name)).map((c) => ({ value: c.name, label: c.label }))}
                    value={undefined}
                    onChange={addValue}
                    placeholder={values.length === 0 ? '+ Add a field' : '+ Add another value'}
                    invalid={Boolean(errors.value)}
                  />
                )}
              </DropZone>

              {isAxisChart && (
                <DropZone
                  label="Split by colour"
                  htmlFor="chart-split"
                  helper={form.chartType === 'line' ? 'Draws one line per category, e.g. Sector' : 'Splits each bar by a category, e.g. Sector'}
                  dragging={dragging}
                  canAccept={dragging ? canSetSplit(dragging) : false}
                  onDropField={setSplit}
                  note={values.length > 1 ? 'Use a single value to split by colour.' : undefined}
                  error={errors.split}
                >
                  {splitField ? (
                    <FieldChip column={columnFor(splitField)} text={labelFor(splitField)} onRemove={() => onConfigChange({ splitField: '' })} />
                  ) : values.length > 1 ? (
                    <p className="type-body px-2 py-1.5 text-muted-foreground">Not available with more than one value</p>
                  ) : (
                    <SearchableSelect
                      id="chart-split"
                      options={splitOptions.map((c) => ({ value: c.name, label: c.label }))}
                      value={undefined}
                      onChange={setSplit}
                      placeholder="+ Add a field"
                    />
                  )}
                </DropZone>
              )}

              {isAxisChart && (
                <>
                  <div>
                    <Label htmlFor="chart-x-axis-label">X-axis Label</Label>
                    <Input
                      id="chart-x-axis-label"
                      className="mt-1.5"
                      placeholder={categoryColumnLabel ?? 'Display label for the X-axis'}
                      value={form.config.xAxisLabel}
                      onChange={(e) => onConfigChange({ xAxisLabel: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chart-y-axis-label">Y-axis Label</Label>
                    <Input
                      id="chart-y-axis-label"
                      className="mt-1.5"
                      placeholder={values.length > 1 ? 'Value' : (valueColumnLabel ?? 'Display label for the Y-axis')}
                      value={form.config.yAxisLabel}
                      onChange={(e) => onConfigChange({ yAxisLabel: e.target.value })}
                    />
                  </div>

                  {/* A legend only has something to say once colours stand for different
                      series — a single series is already named by the Y-axis. */}
                  {(values.length > 1 || Boolean(splitField)) && (
                    <label className="flex items-center gap-2.5">
                      <Checkbox
                        checked={form.config.showLegend}
                        onCheckedChange={(checked) => onConfigChange({ showLegend: checked === true })}
                      />
                      <span className="type-label text-foreground">Show legend</span>
                    </label>
                  )}
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
                      onChange={(e) => onConfigChange({ unit: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chart-display-label">Display Label</Label>
                    <Input
                      id="chart-display-label"
                      className="mt-1.5"
                      placeholder={valueColumnLabel ? `e.g. ${valueColumnLabel}` : 'e.g. Annual Health Budget'}
                      value={form.config.displayLabel}
                      onChange={(e) => onConfigChange({ displayLabel: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {form.fileId && form.chartType && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPreviewCanvas form={form} columns={columns} rows={rows} size="large" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { ChartStep1Build, categoryFieldLabel, valueFieldLabel }
