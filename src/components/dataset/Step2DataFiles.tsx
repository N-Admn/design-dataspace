import * as React from 'react'
import { CheckCircle2, Eye, FileText, UploadCloud, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { validateIncomingFiles } from '@/lib/file-validation'
import { SUPPORTED_FILE_EXTENSIONS, type DatasetFile } from '@/types/dataset'

interface Step2DataFilesProps {
  files: DatasetFile[]
  onFilesAdd: (files: DatasetFile[]) => void
  onFileRemove: (id: string) => void
  enablePreview: boolean
  onTogglePreview: (value: boolean) => void
}

function Step2DataFiles({
  files,
  onFilesAdd,
  onFileRemove,
  enablePreview,
  onTogglePreview,
}: Step2DataFilesProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const [previewOpenId, setPreviewOpenId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleIncoming = (fileList: FileList | File[]) => {
    const { accepted, errors } = validateIncomingFiles(fileList, files)
    if (accepted.length > 0) onFilesAdd(accepted)
    setUploadErrors(errors)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Dataset File</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files.length > 0) handleIncoming(e.dataTransfer.files)
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40',
            )}
          >
            <UploadCloud className="size-9 text-muted-foreground" />
            <p className="text-sm text-foreground">
              Drag and drop multiple files here, or click to browse.
            </p>

            <div className="mt-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Supported File Types:</p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                {SUPPORTED_FILE_EXTENSIONS.map((ext) => (
                  <Badge key={ext} variant="muted">
                    {ext.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept={SUPPORTED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) handleIncoming(e.target.files)
                e.target.value = ''
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Browse File
            </Button>

            <p className="text-xs text-muted-foreground">Maximum file size limit: 50MB</p>
          </div>

          {uploadErrors.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              {uploadErrors.map((message) => (
                <p key={message} className="text-xs font-medium text-destructive">
                  {message}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Files ({files.length})</CardTitle>
          {files.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" />
              Ready
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {files.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          )}

          {files.map((file) => (
            <div key={file.id} className="rounded-lg border border-border">
              <div className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
                  <Badge variant="secondary">{file.extension}</Badge>
                  <span className="text-xs text-muted-foreground">{file.sizeLabel}</span>
                  <span className="w-full text-xs text-muted-foreground sm:w-auto">
                    Uploaded {file.uploadedAt}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Preview ${file.name}`}
                    onClick={() => setPreviewOpenId((id) => (id === file.id ? null : file.id))}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      previewOpenId === file.id && 'bg-muted text-primary',
                    )}
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onFileRemove(file.id)}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              {previewOpenId === file.id && (
                <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                  <FileText className="size-4" />
                  Preview isn't available yet for {file.name} — file will be processed after
                  publishing.
                </div>
              )}
            </div>
          ))}

          {files.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="enable-preview"
                checked={enablePreview}
                onCheckedChange={(checked) => onTogglePreview(checked === true)}
              />
              <Label htmlFor="enable-preview" className="cursor-pointer font-normal">
                Enable Preview
              </Label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { Step2DataFiles }
