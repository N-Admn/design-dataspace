import * as React from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Send } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { categoryFieldLabel, valueFieldLabel } from '@/components/chart/ChartStep2Create'
import { useAppData } from '@/context/AppDataContext'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import { getChartReadiness, isChartReadyToPublish, validateChartName } from '@/lib/chart-validation'
import { CHART_TYPE_OPTIONS, type ChartFormState } from '@/types/chart'

interface ChartStep3ReviewProps {
  form: ChartFormState
  otherCharts: { name: string; datasetId: string | null }[]
  onNameChange: (name: string) => void
  onEditStep: (step: 1 | 2) => void
  onPublish: () => void
  publishState: 'idle' | 'checking' | 'publishing'
  hasLiveVersion: boolean
}

function ChartStep3Review({ form, otherCharts, onNameChange, onEditStep, onPublish, publishState, hasLiveVersion }: ChartStep3ReviewProps) {
  const { datasets } = useAppData()
  const [nameTouched, setNameTouched] = React.useState(false)

  const dataset = form.datasetId ? datasets.find((d) => d.id === form.datasetId) : undefined
  const file = dataset?.form.files.find((f) => f.id === form.fileId)
  const columns = form.datasetId ? getFileColumns(form.datasetId) : []
  const rows = form.datasetId ? getMockRows(form.datasetId) : []

  const readiness = getChartReadiness(form, columns, otherCharts)
  const ready = isChartReadyToPublish(readiness)
  const nameError = validateChartName(form.name, form.datasetId, otherCharts).name
  const busy = publishState !== 'idle'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">Check your chart before publishing.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Dataset &amp; Source</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(1)}>
            Edit →
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dataset</p>
            <p className="mt-1 text-sm text-foreground">{dataset?.form.metadata.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">File / Resource</p>
            <p className="mt-1 text-sm text-foreground">{file?.name || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {form.chartType === 'upload-image' && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Chart Image</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(2)}>
              Edit →
            </Button>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Image</p>
              <p className="mt-1 text-sm text-foreground">{form.uploadedImage?.name || '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {form.chartType && form.chartType !== 'upload-image' && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Chart Type &amp; Configuration</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(2)}>
              Edit →
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chart Type</p>
              <p className="mt-1 text-sm text-foreground">
                {form.chartType ? CHART_TYPE_OPTIONS.find((o) => o.value === form.chartType)?.label : '—'}
              </p>
            </div>
            {form.chartType && form.chartType !== 'big-number' && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {categoryFieldLabel(form.chartType)}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {columns.find((c) => c.name === form.config.categoryField)?.label || '—'}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{valueFieldLabel(form.chartType)}</p>
              <p className="mt-1 text-sm text-foreground">{columns.find((c) => c.name === form.config.valueField)?.label || '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Chart Name</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="chart-name">
            Chart name <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">Use a name that describes what this chart shows.</p>
          <Input
            id="chart-name"
            placeholder="e.g. Population by District"
            value={form.name}
            aria-invalid={Boolean(nameTouched && nameError)}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setNameTouched(true)}
          />
          <FieldError message={nameTouched ? nameError : undefined} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartPreviewCanvas form={form} columns={columns} rows={rows} />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {readiness.map((item) => {
            const fixStep = item.step === 1 || item.step === 2 ? item.step : null
            return (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
                  )}
                  <p className="text-sm text-foreground">{item.ok ? item.label : (item.message ?? item.label)}</p>
                </div>
                {!item.ok && fixStep && (
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(fixStep)}>
                    Fix →
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {hasLiveVersion
            ? 'Submitting will send your changes for review before they go live.'
            : "Once published, this chart will appear on the dataset's public page."}
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" disabled={!ready || busy} onClick={onPublish}>
          {publishState === 'checking' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Checking chart…
            </>
          ) : publishState === 'publishing' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publishing chart…
            </>
          ) : (
            <>
              {hasLiveVersion ? 'Submit Changes' : 'Publish Chart'}
              <Send className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export { ChartStep3Review }
