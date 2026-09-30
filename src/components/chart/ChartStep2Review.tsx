import * as React from 'react'
import { AlertTriangle, CheckCircle2, Eye, Loader2, Send } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { ResourcePreviewDialog, assetToPreviewResource, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ChartPreviewCanvas } from '@/components/chart/ChartPreviewCanvas'
import { categoryFieldLabel, valueFieldLabel } from '@/components/chart/ChartStep1Build'
import { useAppData } from '@/context/AppDataContext'
import { getFileColumns, getMockRows } from '@/lib/chart-data'
import { getChartReadiness, isChartReadyToPublish, validateChartName } from '@/lib/chart-validation'
import { CHART_TYPE_OPTIONS, aggregationPhrase, chartValues, type ChartFormState } from '@/types/chart'

interface ChartStep2ReviewProps {
  form: ChartFormState
  otherCharts: { name: string; datasetId: string | null }[]
  onNameChange: (name: string) => void
  onEditBuild: () => void
  onPublish: () => void
  publishState: 'idle' | 'checking' | 'publishing'
  hasLiveVersion: boolean
}

function ChartStep2Review({ form, otherCharts, onNameChange, onEditBuild, onPublish, publishState, hasLiveVersion }: ChartStep2ReviewProps) {
  const { datasets } = useAppData()
  const [nameTouched, setNameTouched] = React.useState(false)
  const [preview, setPreview] = React.useState<PreviewResource | null>(null)

  const dataset = form.datasetId ? datasets.find((d) => d.id === form.datasetId) : undefined
  const file = dataset?.form.files.find((f) => f.id === form.fileId)
  const columns = form.datasetId ? getFileColumns(form.datasetId) : []
  const rows = form.datasetId ? getMockRows(form.datasetId) : []

  const readiness = getChartReadiness(form, columns, otherCharts)
  const ready = isChartReadyToPublish(readiness)
  const nameError = validateChartName(form.name, form.datasetId, otherCharts).name
  const busy = publishState !== 'idle'
  const values = chartValues(form.config)
  const isAxisChart = form.chartType === 'bar' || form.chartType === 'line'

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h2"
        title="Review & Publish"
        description="Check your information before making this content available publicly."
      />

      <ReviewSection title="Dataset & Source" defaultOpen onEdit={onEditBuild}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dataset</p>
            <p className="mt-1 text-sm text-foreground">{dataset?.form.metadata.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">File / Resource</p>
            <p className="mt-1 text-sm text-foreground">{file?.name || '—'}</p>
          </div>
        </div>
      </ReviewSection>

      {form.chartType === 'upload-image' && (
        <ReviewSection title="Chart Image" defaultOpen onEdit={onEditBuild}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Image</p>
              <p className="mt-1 truncate text-sm text-foreground">{form.uploadedImage?.name || '—'}</p>
            </div>
            {form.uploadedImage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={`Preview ${form.uploadedImage.name}`}
                onClick={() => setPreview(assetToPreviewResource(form.uploadedImage!, form.name))}
              >
                <Eye className="size-4" />
              </Button>
            )}
          </div>
        </ReviewSection>
      )}

      {form.chartType && form.chartType !== 'upload-image' && (
        <ReviewSection title="Chart Type & Configuration" defaultOpen onEdit={onEditBuild}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              {values.length === 0 ? (
                <p className="mt-1 text-sm text-foreground">—</p>
              ) : (
                values.map((v) => (
                  <p key={v.field} className="mt-1 text-sm text-foreground">
                    {aggregationPhrase(v.aggregation)} {columns.find((c) => c.name === v.field)?.label ?? v.field}
                  </p>
                ))
              )}
            </div>
            {isAxisChart && form.config.splitField && values.length === 1 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Split by colour</p>
                <p className="mt-1 text-sm text-foreground">
                  {columns.find((c) => c.name === form.config.splitField)?.label ?? form.config.splitField}
                </p>
              </div>
            )}
          </div>
        </ReviewSection>
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
          <ChartPreviewCanvas form={form} columns={columns} rows={rows} size="large" />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className={ready ? 'text-sm font-semibold text-success-text' : 'text-sm font-semibold text-warning-foreground'}>
          {ready ? 'Ready to publish' : 'Needs attention'}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {readiness.map((item) => {
            const fixable = item.step === 1
            return (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success-text" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
                  )}
                  <p className="text-sm text-foreground">{item.ok ? item.label : (item.message ?? item.label)}</p>
                </div>
                {!item.ok && fixable && (
                  <Button type="button" variant="outline" size="sm" onClick={onEditBuild}>
                    Fix →
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          {hasLiveVersion
            ? 'Publishing will replace the current public version of this chart immediately.'
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
              {hasLiveVersion ? 'Publish Changes' : 'Publish Chart'}
              <Send className="size-4" />
            </>
          )}
        </Button>
      </ReviewPublishPanel>

      <ResourcePreviewDialog resource={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </div>
  )
}

export { ChartStep2Review }
