import * as React from 'react'
import { Eye } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getResourceTitle } from '@/lib/file-validation'
import type { DatasetFile } from '@/types/dataset'

const TABULAR_EXTENSIONS = ['CSV', 'XLS', 'XLSX', 'TSV']

interface FileMetaPatch {
  rowCount?: number
  columnCount?: number
}

interface FileDetailsSheetProps {
  /** The file to inspect, or null when the sheet is closed. */
  file: DatasetFile | null
  onOpenChange: (open: boolean) => void
  onTitleChange: (id: string, title: string) => void
  onMetaChange: (id: string, patch: FileMetaPatch) => void
  /** Opens the shared table/resource preview for this file. */
  onPreview: (file: DatasetFile) => void
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm text-foreground">{value || '—'}</div>
    </div>
  )
}

/** Shared File Details side sheet — used for both direct File Upload and Public
 * Platform files. System-inferred values are shown; the ones the product lets a
 * contributor adjust (title, row/column counts) stay editable here. */
function FileDetailsSheet({ file, onOpenChange, onTitleChange, onMetaChange, onPreview }: FileDetailsSheetProps) {
  const isPlatformImport = Boolean(file?.source && file.source !== 'File upload')
  const isTabular = file ? TABULAR_EXTENSIONS.includes(file.extension.toUpperCase()) : false

  const [titleDraft, setTitleDraft] = React.useState('')
  React.useEffect(() => {
    if (file) setTitleDraft(getResourceTitle(file))
    // Re-sync only when a different file is opened, not on every metadata edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id])

  const commitTitle = () => {
    if (!file) return
    const next = titleDraft.trim()
    if (next && next !== getResourceTitle(file)) onTitleChange(file.id, next)
    else setTitleDraft(getResourceTitle(file))
  }

  const commitCount = (key: 'rowCount' | 'columnCount', raw: string) => {
    if (!file) return
    const trimmed = raw.trim()
    if (trimmed === '') {
      onMetaChange(file.id, { [key]: undefined })
      return
    }
    const n = Number(trimmed)
    if (Number.isFinite(n) && n >= 0) onMetaChange(file.id, { [key]: Math.round(n) })
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

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ReadOnlyField label="File type" value={file.extension} />
                  <ReadOnlyField label="File size" value={file.sizeLabel} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="file-details-rows">Number of rows</Label>
                    <Input
                      id="file-details-rows"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="mt-1.5"
                      placeholder="Not detected"
                      defaultValue={file.rowCount ?? ''}
                      key={`rows-${file.id}`}
                      onBlur={(e) => commitCount('rowCount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file-details-cols">Number of columns</Label>
                    <Input
                      id="file-details-cols"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="mt-1.5"
                      placeholder="Not detected"
                      defaultValue={file.columnCount ?? ''}
                      key={`cols-${file.id}`}
                      onBlur={(e) => commitCount('columnCount', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ReadOnlyField label="Source" value={file.source ?? 'File upload'} />
                  <ReadOnlyField label={isPlatformImport ? 'Imported' : 'Uploaded'} value={file.uploadedAt} />
                </div>

                <ReadOnlyField label="Original filename" value={file.name} />

                {file.path && <ReadOnlyField label="Folder path" value={`${file.path}/`} />}

                {file.importUrl && (
                  <ReadOnlyField
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

                <p className="text-xs text-muted-foreground">
                  Row and column counts are inferred where the file can be read; adjust them if needed.
                </p>
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
