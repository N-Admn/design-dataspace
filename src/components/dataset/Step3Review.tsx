import * as React from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Eye, FolderKanban, Gauge, ImagePlus, LineChart, MapPin, PieChart, Send } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { ResourcePreviewDialog, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { PublicVisibilityNotice } from '@/components/dataset/PublicVisibilityNotice'
import { formatFileSize } from '@/lib/format'
import { getResourceTitle } from '@/lib/file-validation'
import { useAppData } from '@/context/AppDataContext'
import { CHART_TYPE_OPTIONS, type ChartType } from '@/types/chart'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  SECTOR_OPTIONS,
  type DatasetFormState,
} from '@/types/dataset'

const USED_IN_VISIBLE_LIMIT = 5

interface Step3ReviewProps {
  form: DatasetFormState
  /** The saved dataset's id, or null for a brand-new dataset that hasn't been saved yet. */
  datasetId: string | null
  canPublish: boolean
  /** True when this dataset already has a published version — publishing replaces the live version immediately. */
  hasLiveVersion?: boolean
  /** 1 = Data Files, 2 = Metadata. */
  onEditStep: (step: 1 | 2) => void
  onPublish: () => void
}

function UsedInSection({ datasetId }: { datasetId: string }) {
  const { events, useCases } = useAppData()

  const usedInEvents = events
    .filter((event) => event.status === 'published')
    .filter((event) => event.form.relatedContent.datasets.some((d) => d.id === datasetId))
    .map((event) => ({ id: event.id, title: event.form.metadata.title || 'Untitled event', type: 'Event' as const }))

  const usedInUseCases = useCases
    .filter((useCase) => useCase.status === 'published')
    .filter((useCase) => useCase.form.connections.datasets.some((d) => d.id === datasetId))
    .map((useCase) => ({
      id: useCase.id,
      title: useCase.form.metadata.title || 'Untitled use case',
      type: 'Use Case' as const,
    }))

  const usedIn = [...usedInEvents, ...usedInUseCases]

  if (usedIn.length === 0) return null

  const visible = usedIn.slice(0, USED_IN_VISIBLE_LIMIT)
  const remaining = usedIn.length - visible.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Used in</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          Explore published CivicDataSpace content that uses this dataset.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-0">
        {visible.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0"
          >
            {item.type === 'Event' ? (
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <FolderKanban className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.title}</span>
            <Badge variant="secondary">{item.type}</Badge>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        ))}
        {remaining > 0 && (
          <p className="px-5 py-3 text-xs text-muted-foreground">+{remaining} more</p>
        )}
      </CardContent>
    </Card>
  )
}

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  map: MapPin,
  'big-number': Gauge,
  'upload-image': ImagePlus,
}

function ChartsSection({ datasetId }: { datasetId: string }) {
  const { charts } = useAppData()
  const datasetCharts = charts.filter((chart) => chart.status === 'published' && chart.form.datasetId === datasetId)

  if (datasetCharts.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charts</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">Visualizations published for this dataset.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-0">
        {datasetCharts.map((chart) => {
          const Icon = chart.form.chartType ? CHART_TYPE_ICONS[chart.form.chartType] : BarChart3
          const typeLabel = chart.form.chartType ? CHART_TYPE_OPTIONS.find((o) => o.value === chart.form.chartType)?.label : '—'
          return (
            <div key={chart.id} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {chart.form.name || 'Untitled chart'}
              </span>
              <Badge variant="secondary">{typeLabel}</Badge>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

function Step3Review({ form, datasetId, canPublish, hasLiveVersion, onEditStep, onPublish }: Step3ReviewProps) {
  const { metadata, files } = form
  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0)
  const [preview, setPreview] = React.useState<PreviewResource | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <ReviewSection title="Metadata" defaultOpen onEdit={() => onEditStep(2)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ReviewField label="Dataset Name" value={metadata.name || '—'} />
          </div>
          <div className="sm:col-span-2">
            <ReviewField label="Description" value={metadata.description || '—'} />
          </div>
          <ReviewField label="Sector" value={metadata.sector ? optionLabel(SECTOR_OPTIONS, metadata.sector) : '—'} />
          <ReviewField
            label="Geography"
            value={metadata.geography ? optionLabel(GEOGRAPHY_OPTIONS, metadata.geography) : '—'}
          />
          <div className="sm:col-span-2">
            <ReviewField
              label="Tags"
              value={
                metadata.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag) => (
                      <Badge key={tag} variant="accent">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
          </div>
          <ReviewField label="Source Website" value={metadata.sourceWebsite || '—'} />
          <ReviewField label="Create Date" value={metadata.createDate || '—'} />
        </div>
      </ReviewSection>

      <ReviewSection title="Publishing Settings" defaultOpen onEdit={() => onEditStep(2)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReviewField
            label="Access Type"
            value={
              metadata.accessType === 'open'
                ? 'Open Access'
                : metadata.accessType === 'restricted'
                  ? 'Restricted Access'
                  : '—'
            }
          />
          <ReviewField
            label="License"
            value={metadata.license ? optionLabel(LICENSE_OPTIONS, metadata.license) : '—'}
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Uploaded Files" defaultOpen onEdit={() => onEditStep(1)}>
        <div className="flex flex-col gap-3">
          {files.length === 0 && (
            <p className="text-sm text-muted-foreground">No files uploaded.</p>
          )}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border px-4 py-3"
            >
              <CheckCircle2 className="size-5 shrink-0 text-success" />
              <span className="text-sm font-medium text-foreground">{getResourceTitle(file)}</span>
              <Badge variant="secondary">{file.extension}</Badge>
              <span className="text-xs text-muted-foreground">{file.sizeLabel}</span>
              <span className="text-xs text-muted-foreground">{file.uploadedAt}</span>
              <span className="text-xs text-muted-foreground">Original: {file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto shrink-0"
                aria-label={`Preview ${getResourceTitle(file)}`}
                onClick={() =>
                  setPreview({
                    title: getResourceTitle(file),
                    fileName: file.name,
                    extension: file.extension.toUpperCase(),
                    sizeLabel: file.sizeLabel,
                  })
                }
              >
                <Eye className="size-4" />
              </Button>
            </div>
          ))}
          {files.length > 0 && (
            <p className="pt-1 text-right text-sm font-medium text-foreground">
              Total file size: {formatFileSize(totalBytes)}
            </p>
          )}
        </div>
      </ReviewSection>

      {datasetId && <ChartsSection datasetId={datasetId} />}

      {datasetId && <UsedInSection datasetId={datasetId} />}

      <PublicVisibilityNotice hasLiveVersion={hasLiveVersion} />

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          {hasLiveVersion
            ? 'Publishing will replace the current public version of this dataset immediately.'
            : 'Your dataset will be publicly available immediately after publishing.'}
        </p>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-md"
          disabled={!canPublish}
          onClick={onPublish}
        >
          {hasLiveVersion ? 'Publish Changes' : 'Publish Dataset'}
          <Send className="size-4" />
        </Button>
        {!canPublish && (
          <p className="text-xs font-medium text-destructive">
            Complete the required fields in Metadata before publishing.
          </p>
        )}
      </ReviewPublishPanel>

      <ResourcePreviewDialog resource={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </div>
  )
}

export { Step3Review }
