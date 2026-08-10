import type { ReactNode } from 'react'
import { CheckCircle2, Pencil, Send } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/format'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  SECTOR_OPTIONS,
  type DatasetFormState,
} from '@/types/dataset'

interface Step3ReviewProps {
  form: DatasetFormState
  canPublish: boolean
  onEditMetadata: () => void
  onPublish: () => void
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

function Step3Review({ form, canPublish, onEditMetadata, onPublish }: Step3ReviewProps) {
  const { metadata, files } = form
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

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your dataset will be publicly available immediately after publishing.
        </p>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-md"
          disabled={!canPublish}
          onClick={onPublish}
        >
          Publish Dataset
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
