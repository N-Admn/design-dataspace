import type { ReactNode } from 'react'
import { ArrowRight, CalendarDays, CheckCircle2, FolderKanban, Globe, Link2, Pencil, Send } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicVisibilityNotice } from '@/components/dataset/PublicVisibilityNotice'
import { formatFileSize } from '@/lib/format'
import { useAppData } from '@/context/AppDataContext'
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
  /** True when this dataset already has a published/pending version — the primary action submits for review instead of publishing directly. */
  hasLiveVersion?: boolean
  onEditMetadata: () => void
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

function Step3Review({ form, datasetId, canPublish, hasLiveVersion, onEditMetadata, onPublish }: Step3ReviewProps) {
  const { metadata, files, resources } = form
  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Metadata</CardTitle>
          <button
            type="button"
            aria-label="Edit metadata"
            onClick={onEditMetadata}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Publishing Settings</CardTitle>
          <button
            type="button"
            aria-label="Edit publishing settings"
            onClick={onEditMetadata}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {files.length === 0 && (
            <p className="text-sm text-muted-foreground">No files uploaded.</p>
          )}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border px-4 py-3"
            >
              <CheckCircle2 className="size-5 shrink-0 text-success" />
              <span className="text-sm font-medium text-foreground">{file.name}</span>
              <Badge variant="secondary">{file.extension}</Badge>
              <span className="text-xs text-muted-foreground">{file.sizeLabel}</span>
              <span className="text-xs text-muted-foreground">{file.uploadedAt}</span>
            </div>
          ))}
          {files.length > 0 && (
            <p className="pt-1 text-right text-sm font-medium text-foreground">
              Total file size: {formatFileSize(totalBytes)}
            </p>
          )}
        </CardContent>
      </Card>

      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border px-4 py-3"
              >
                {resource.type === 'api' ? (
                  <Globe className="size-5 shrink-0 text-muted-foreground" />
                ) : (
                  <Link2 className="size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{resource.url}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <Badge variant="secondary">{resource.type === 'api' ? 'API' : 'Link'}</Badge>
                    {resource.type === 'api' && resource.apiConfig && (
                      <>
                        <span>
                          {resource.apiConfig.method} · {resource.apiConfig.responseFormat.toUpperCase()}
                        </span>
                        <span>•</span>
                        <span className={resource.apiConfig.tested ? 'text-success' : undefined}>
                          {resource.apiConfig.tested ? '✓ Connected' : 'Not tested'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {datasetId && <UsedInSection datasetId={datasetId} />}

      <PublicVisibilityNotice hasLiveVersion={hasLiveVersion} />

      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-5 text-center">
        <p className="text-sm text-muted-foreground">
          {hasLiveVersion
            ? 'Submitting will send your changes for review before they go live.'
            : 'Your dataset will be publicly available immediately after publishing.'}
        </p>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-md"
          disabled={!canPublish}
          onClick={onPublish}
        >
          {hasLiveVersion ? 'Submit Changes' : 'Publish Dataset'}
          <Send className="size-4" />
        </Button>
        {!canPublish && (
          <p className="text-xs font-medium text-destructive">
            Complete the required fields in Metadata before publishing.
          </p>
        )}
      </div>
    </div>
  )
}

export { Step3Review }
