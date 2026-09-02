import * as React from 'react'
import { Eye, Lock } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getResourceDescription, getResourceTitle } from '@/lib/file-validation'
import type { DatasetFile } from '@/types/dataset'

const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX', 'TSV']

interface FileDetailsSheetProps {
  /** The file to inspect, or null when the sheet is closed. */
  file: DatasetFile | null
  onOpenChange: (open: boolean) => void
  onTitleChange: (id: string, title: string) => void
  onDescriptionChange: (id: string, description: string) => void
  /** Opens the shared table/resource preview for this file. */
  onPreview: (file: DatasetFile) => void
}

/** A single system-inferred value. Read-only by design — falls back to a clear
 *  "couldn't read this" status rather than an editable input. */
function InferredField({
  label,
  value,
  fallback = 'Unable to determine',
  fallbackHint = 'We couldn’t read this information from the file.',
}: {
  label: string
  value: React.ReactNode
  fallback?: string
  fallbackHint?: string
}) {
  const hasValue = value !== undefined && value !== null && value !== ''
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {hasValue ? (
        <div className="mt-1 break-words text-sm text-foreground">{value}</div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">{fallback}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{fallbackHint}</p>
        </>
      )}
    </div>
  )
}

/** Shared File Details side sheet — used for both direct File Upload and Public
 * Platform files. Only Title and Description are editable; every structural value
 * (type, size, row/column counts, original filename, source, date) is
 * system-inferred and shown read-only. */
function FileDetailsSheet({ file, onOpenChange, onTitleChange, onDescriptionChange, onPreview }: FileDetailsSheetProps) {
  const isPlatformImport = Boolean(file?.source && file.source !== 'File upload')
  const isTabular = file ? TABULAR_EXTENSIONS.includes(file.extension.toUpperCase()) : false

  const [titleDraft, setTitleDraft] = React.useState('')
  const [descriptionDraft, setDescriptionDraft] = React.useState('')
  React.useEffect(() => {
    if (file) {
      setTitleDraft(getResourceTitle(file))
      setDescriptionDraft(getResourceDescription(file))
    }
    // Re-sync only when a different file is opened, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id])

  const commitTitle = () => {
    if (!file) return
    const next = titleDraft.trim()
    if (next && next !== getResourceTitle(file)) onTitleChange(file.id, next)
    else setTitleDraft(getResourceTitle(file))
  }

  const commitDescription = () => {
    if (!file) return
    const next = descriptionDraft.trim()
    if (next !== getResourceDescription(file)) onDescriptionChange(file.id, next)
  }

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate">{file ? getResourceTitle(file) : 'File details'}</DialogTitle>
          <DialogDescription>
            {isPlatformImport ? `Imported from ${file?.source}.` : 'Uploaded to this dataset.'}
          </DialogDescription>
        </DialogHeader>

        {file && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                {/* --- Editable --- */}
                <div>
                  <Label htmlFor="file-details-title">Title</Label>
                  <Input
                    id="file-details-title"
                    className="mt-1.5"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="file-details-description">Description</Label>
                  <Textarea
                    id="file-details-description"
                    className="mt-1.5"
                    rows={3}
                    value={descriptionDraft}
                    onChange={(e) => setDescriptionDraft(e.target.value)}
                    onBlur={commitDescription}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Starts from a system-generated summary — edit it to add context.
                  </p>
                </div>

                {/* --- System-inferred, read-only --- */}
                <div className="border-t border-border pt-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Lock className="size-3" />
                    Read from the file — not editable
                  </div>

                  <div className="mt-3 flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InferredField label="File type" value={file.extension} />
                      <InferredField label="File size" value={file.sizeLabel} />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InferredField
                        label="Number of rows"
                        value={file.rowCount != null ? file.rowCount.toLocaleString() : undefined}
                      />
                      <InferredField
                        label="Number of columns"
                        value={file.columnCount != null ? file.columnCount.toLocaleString() : undefined}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InferredField label="Source" value={file.source ?? 'File upload'} />
                      <InferredField label={isPlatformImport ? 'Imported' : 'Uploaded'} value={file.uploadedAt} />
                    </div>

                    <InferredField label="Original filename" value={file.name} />

                    {file.path && <InferredField label="Folder path" value={`${file.path}/`} />}

                    {file.importUrl && (
                      <InferredField
                        label="Imported from"
                        value={
                          <a
                            href={file.importUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2"
                          >
                            {file.importUrl}
                          </a>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onPreview(file)}>
                <Eye className="size-4" />
                Preview{isTabular ? ' table' : ''}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { FileDetailsSheet }
