import * as React from 'react'
import { AlertCircle, CheckCircle2, Eye, Folder, Globe, Loader2, Pencil, Sparkles, Trash2, UploadCloud } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ResourcePreviewDialog, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { FileDetailsSheet } from '@/components/dataset/FileDetailsSheet'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { deriveDefaultResourceTitle, getResourceTitle, inferCsvShape, validateIncomingFiles } from '@/lib/file-validation'
import { formatUploadLimit } from '@/lib/generic-upload'
import { formatTimestamp } from '@/lib/format'
import {
  PLATFORM_LABELS,
  PLATFORM_OPTIONS,
  extractDatasetFromPlatform,
  platformOption,
  platformUrlErrorMessage,
  validatePlatformUrl,
  type ImportPlatform,
} from '@/lib/platform-import'
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_EXTENSIONS, type DatasetFile } from '@/types/dataset'

type UploadMethod = 'file' | 'platform'

const UPLOAD_METHODS: { value: UploadMethod; label: string; icon: typeof UploadCloud }[] = [
  { value: 'file', label: 'File Upload', icon: UploadCloud },
  { value: 'platform', label: 'Public Platform', icon: Globe },
]

let importIdCounter = 0

interface Step2DataFilesProps {
  files: DatasetFile[]
  onFilesAdd: (files: DatasetFile[]) => void
  onFileRemove: (id: string) => void
  onFileTitleChange: (id: string, title: string) => void
  onFileMetaChange: (id: string, patch: { rowCount?: number; columnCount?: number }) => void
}

function FileRow({
  file,
  onTitleChange,
  onOpenDetails,
  onRemove,
}: {
  file: DatasetFile
  onTitleChange: (id: string, title: string) => void
  onOpenDetails: () => void
  onRemove: () => void
}) {
  const title = getResourceTitle(file)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(title)
  const isPlatformImport = Boolean(file.source && file.source !== 'File upload')

  React.useEffect(() => {
    if (!isEditing) setDraft(title)
  }, [title, isEditing])

  const commit = () => {
    setIsEditing(false)
    const next = draft.trim()
    if (next) {
      onTitleChange(file.id, next)
    } else {
      setDraft(title)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
      <CheckCircle2 className="size-5 shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            autoFocus
            value={draft}
            aria-label={`Resource title for ${file.name}`}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(title)
                setIsEditing(false)
              }
            }}
            className="h-8 max-w-xs text-sm font-medium"
          />
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit title for ${file.name}`}
                  onClick={() => setIsEditing(true)}
                  className="size-6 shrink-0"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Edit title</TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant="secondary">{file.extension}</Badge>
          <span>Size: {file.sizeLabel}</span>
          <span>•</span>
          <span>{isPlatformImport ? 'Imported' : 'Uploaded'}: {file.uploadedAt}</span>
          <span>•</span>
          <span className="truncate">Original: {file.name}</span>
          {isPlatformImport && (
            <>
              <span>•</span>
              <span>Source: {file.source}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="success">Ready</Badge>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`View details for ${file.name}`}
            onClick={onOpenDetails}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${file.name}`}
            onClick={onRemove}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Step2DataFiles({
  files,
  onFilesAdd,
  onFileRemove,
  onFileTitleChange,
  onFileMetaChange,
}: Step2DataFilesProps) {
  const toast = useToast()
  const [method, setMethod] = React.useState<UploadMethod>('file')

  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const [detailsId, setDetailsId] = React.useState<string | null>(null)
  const [previewResource, setPreviewResource] = React.useState<PreviewResource | null>(null)

  // Public Platform import flow
  const [platform, setPlatform] = React.useState<ImportPlatform | ''>('')
  const [platformUrl, setPlatformUrl] = React.useState('')
  const [platformUrlTouched, setPlatformUrlTouched] = React.useState(false)
  const [extractStatus, setExtractStatus] = React.useState<'idle' | 'extracting' | 'error'>('idle')
  const [extractError, setExtractError] = React.useState<string | undefined>(undefined)

  const detailsFile = detailsId ? (files.find((f) => f.id === detailsId) ?? null) : null

  const urlError = platform ? validatePlatformUrl(platform, platformUrl) : 'empty'
  const canExtract = platform !== '' && urlError === null && extractStatus !== 'extracting'

  const handleIncoming = async (fileList: FileList | File[]) => {
    const raw = Array.from(fileList)
    const { accepted, errors } = validateIncomingFiles(raw, files)
    setUploadErrors(errors)
    if (errors.length > 0) {
      toast({ title: 'File upload failed', description: errors[0], variant: 'error' })
    }
    if (accepted.length === 0) return

    const enriched = await Promise.all(
      accepted.map(async (df) => {
        const original = raw.find((f) => f.name === df.name)
        const shape = original ? await inferCsvShape(original) : {}
        return { ...df, source: 'File upload', ...shape }
      }),
    )
    onFilesAdd(enriched)
    toast(
      enriched.length === 1
        ? { title: 'File uploaded', description: `${enriched[0].name} has been added.`, variant: 'success' }
        : { title: 'Files uploaded', description: `${enriched.length} files have been added.`, variant: 'success' },
    )
  }

  const handleMethodChange = (next: UploadMethod) => {
    if (next === method) return
    setMethod(next)
    setUploadErrors([])
  }

  const handlePlatformChange = (value: string) => {
    setPlatform(value as ImportPlatform)
    setPlatformUrl('')
    setPlatformUrlTouched(false)
    setExtractStatus('idle')
    setExtractError(undefined)
  }

  const handleExtract = async () => {
    if (platform === '' || extractStatus === 'extracting') return
    const err = validatePlatformUrl(platform, platformUrl)
    if (err) {
      setPlatformUrlTouched(true)
      return
    }
    setExtractStatus('extracting')
    setExtractError(undefined)
    const importedUrl = platformUrl.trim()
    const result = await extractDatasetFromPlatform(platform, importedUrl)
    if (result.ok) {
      const known = new Set(files.map((f) => `${f.path ?? ''}/${f.name}`.toLowerCase()))
      const imported: DatasetFile[] = result.files
        .filter((f) => !known.has(`${f.path ?? ''}/${f.name}`.toLowerCase()))
        .map((f) => ({
          id: `import-${(importIdCounter += 1)}-${f.name}`,
          name: f.name,
          title: deriveDefaultResourceTitle(f.name),
          extension: f.extension.toUpperCase(),
          sizeLabel: f.sizeLabel,
          sizeBytes: f.sizeBytes,
          uploadedAt: formatTimestamp(new Date()),
          source: PLATFORM_LABELS[platform],
          path: f.path,
          importUrl: importedUrl,
          rowCount: f.rowCount,
          columnCount: f.columnCount,
        }))
      setExtractStatus('idle')
      setPlatformUrl('')
      setPlatformUrlTouched(false)
      if (imported.length === 0) {
        toast({ title: 'Already imported', description: 'Those files are already in this dataset.', variant: 'success' })
      } else {
        onFilesAdd(imported)
        toast({
          title: 'Dataset extracted successfully',
          description: `${imported.length} file${imported.length === 1 ? '' : 's'} added.`,
          variant: 'success',
        })
      }
    } else {
      setExtractStatus('error')
      setExtractError(result.error)
      toast({ title: 'Extraction failed', description: result.error, variant: 'error' })
    }
  }

  const openPreview = (file: DatasetFile) => {
    setPreviewResource({
      title: getResourceTitle(file),
      fileName: file.name,
      extension: file.extension.toUpperCase(),
      sizeLabel: file.sizeLabel,
    })
  }

  // Folder-aware grouping — direct uploads have no `path` and render flat.
  const grouped = React.useMemo(() => {
    const map = new Map<string, DatasetFile[]>()
    for (const f of files) {
      const key = f.path ?? ''
      map.set(key, [...(map.get(key) ?? []), f])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [files])
  const hasFolders = grouped.some(([key]) => key !== '')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {UPLOAD_METHODS.map((option) => {
          const Icon = option.icon
          const isActive = option.value === method
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMethodChange(option.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {option.label}
            </button>
          )
        })}
      </div>

      {method === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Dataset File</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DropzoneUploadField
              extensions={SUPPORTED_FILE_EXTENSIONS}
              maxBytes={MAX_FILE_SIZE_BYTES}
              multiple
              onFiles={handleIncoming}
              showExtensionBadges
              formatHint={`Maximum file size limit: ${formatUploadLimit(MAX_FILE_SIZE_BYTES)}`}
            />

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
      )}

      {method === 'platform' && (
        <Card>
          <CardHeader>
            <CardTitle>Import from a public platform</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Select a platform, paste the dataset URL, then extract its files into this dataset.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <Label htmlFor="platform-select">
                Select Platform <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="platform-select"
                  options={PLATFORM_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
                  value={platform}
                  onChange={handlePlatformChange}
                  placeholder="Select a platform..."
                />
              </div>
            </div>

            {platform !== '' && (
              <div>
                <Label htmlFor="platform-url">
                  Dataset URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="platform-url"
                  className="mt-1.5"
                  placeholder={platformOption(platform).urlPlaceholder}
                  value={platformUrl}
                  onBlur={() => setPlatformUrlTouched(true)}
                  onChange={(e) => {
                    setPlatformUrl(e.target.value)
                    if (extractStatus === 'error') {
                      setExtractStatus('idle')
                      setExtractError(undefined)
                    }
                  }}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{platformOption(platform).urlHelp}</p>
                {platformUrlTouched && urlError && (
                  <FieldError message={platformUrlErrorMessage(urlError, platform)} />
                )}
              </div>
            )}

            {platform !== '' && urlError === null && (
              <div className="flex flex-col gap-2 border-t border-border pt-5">
                <Button
                  type="button"
                  className="self-start"
                  onClick={handleExtract}
                  disabled={!canExtract}
                >
                  {extractStatus === 'extracting' ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Extracting dataset files…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Extract Dataset
                    </>
                  )}
                </Button>

                {extractStatus === 'error' && extractError && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p className="font-medium">{extractError}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Uploaded Files ({files.length})</CardTitle>
          {files.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" />
              {files.length} File{files.length === 1 ? '' : 's'} Ready
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {files.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No files uploaded yet.</p>
          )}

          {hasFolders
            ? grouped.map(([key, groupFiles]) => (
                <div key={key || 'root'} className="flex flex-col gap-3">
                  {key !== '' && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Folder className="size-3.5" />
                      {key}/
                    </div>
                  )}
                  <div className={cn('flex flex-col gap-3', key !== '' && 'border-l border-border pl-3')}>
                    {groupFiles.map((file) => (
                      <FileRow
                        key={file.id}
                        file={file}
                        onTitleChange={onFileTitleChange}
                        onOpenDetails={() => setDetailsId(file.id)}
                        onRemove={() => {
                          onFileRemove(file.id)
                          toast({ title: 'File removed', variant: 'success' })
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            : files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onTitleChange={onFileTitleChange}
                  onOpenDetails={() => setDetailsId(file.id)}
                  onRemove={() => {
                    onFileRemove(file.id)
                    toast({ title: 'File removed', variant: 'success' })
                  }}
                />
              ))}
        </CardContent>
      </Card>

      <FileDetailsSheet
        file={detailsFile}
        onOpenChange={(open) => !open && setDetailsId(null)}
        onTitleChange={onFileTitleChange}
        onMetaChange={onFileMetaChange}
        onPreview={openPreview}
      />

      <ResourcePreviewDialog resource={previewResource} onOpenChange={(open) => !open && setPreviewResource(null)} />
    </div>
  )
}

export { Step2DataFiles }
