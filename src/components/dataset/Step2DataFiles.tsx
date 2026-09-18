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
import { PromptFileSideSheet } from '@/components/dataset/PromptFileSideSheet'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import {
  deriveDefaultResourceTitle,
  detectFileFields,
  getResourceTitle,
  inferCsvShape,
  validateIncomingFiles,
} from '@/lib/file-validation'
import { promptFileMetadataStatus } from '@/lib/prompt-file-validation'
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
import {
  MAX_FILE_SIZE_BYTES,
  PROMPT_FORMAT_OPTIONS,
  SUPPORTED_FILE_EXTENSIONS,
  emptyPromptFileMetadata,
  type DatasetFile,
  type DatasetType,
  type PromptFileMetadata,
} from '@/types/dataset'

type UploadMethod = 'file' | 'platform'

const PROMPT_FORMAT_LABEL: Record<string, string> = Object.fromEntries(
  PROMPT_FORMAT_OPTIONS.map((o) => [o.value, o.label]),
)

/** Whether a file came in through direct upload vs. a public-platform import —
 * derived from the existing `source` field rather than adding new state, so the
 * upload-method restriction (Section 8) works for records saved before it existed. */
function isManualUpload(file: DatasetFile): boolean {
  return !file.source || file.source === 'File upload'
}

const UPLOAD_METHODS: { value: UploadMethod; label: string; icon: typeof UploadCloud }[] = [
  { value: 'file', label: 'File Upload', icon: UploadCloud },
  { value: 'platform', label: 'Public Platform', icon: Globe },
]

let importIdCounter = 0

interface Step2DataFilesProps {
  datasetType: DatasetType
  files: DatasetFile[]
  onFilesAdd: (files: DatasetFile[]) => void
  onFileRemove: (id: string) => void
  onFileTitleChange: (id: string, title: string) => void
  onFileDescriptionChange: (id: string, description: string) => void
  onFileReplace: (id: string, replacement: DatasetFile) => void
  onPromptFileMetadataChange: (id: string, patch: Partial<PromptFileMetadata>) => void
}

const PROMPT_STATUS_BADGE: Record<ReturnType<typeof promptFileMetadataStatus>, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  ready: { label: 'Ready', variant: 'success' },
  incomplete: { label: 'Metadata incomplete', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
}

function FileRow({
  file,
  isPromptDataset,
  onTitleChange,
  onOpenDetails,
  onRemove,
}: {
  file: DatasetFile
  isPromptDataset: boolean
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
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-default px-4 py-3">
      <CheckCircle2 className="size-5 shrink-0 text-text-success" />
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
            <p className="truncate text-sm font-medium text-text-default">{title}</p>
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
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-subdued">
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
        {isPromptDataset && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {file.promptFileMetadata?.promptFormat && (
              <Badge variant="outline">
                {PROMPT_FORMAT_LABEL[file.promptFileMetadata.promptFormat] ?? file.promptFileMetadata.promptFormat}
              </Badge>
            )}
            {file.promptFileMetadata?.hasSystemPrompt && <Badge variant="muted">System prompt</Badge>}
            {file.promptFileMetadata?.hasExampleResponses && <Badge variant="muted">Example responses</Badge>}
            {file.promptFileMetadata && file.promptFileMetadata.fields.length > 0 && (
              <Badge variant="muted">
                {file.promptFileMetadata.fields.length} field{file.promptFileMetadata.fields.length === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isPromptDataset ? (
          <Badge variant={PROMPT_STATUS_BADGE[promptFileMetadataStatus(file)].variant}>
            {PROMPT_STATUS_BADGE[promptFileMetadataStatus(file)].label}
          </Badge>
        ) : (
          <Badge variant="success">Ready</Badge>
        )}
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
            className="text-text-critical-strong hover:bg-action-critical-default/10 hover:text-text-critical-strong"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Attaches initial Prompt File metadata (Section 9) to a freshly-added file when
 * the dataset is a Prompt Dataset. `detectedFields` is `null` when the schema
 * couldn't be read (non-tabular file, or a platform import with no parseable
 * schema) — surfaced later as the "schema unavailable" state, not silently as an
 * empty field list. */
function withPromptFileMetadata(file: DatasetFile, detectedFields: string[] | null): DatasetFile {
  const base = emptyPromptFileMetadata(getResourceTitle(file))
  return {
    ...file,
    promptFileMetadata: {
      ...base,
      fields: detectedFields ? detectedFields.map((name) => ({ name })) : [],
      fieldsUnavailable: detectedFields === null,
    },
  }
}

function Step2DataFiles({
  datasetType,
  files,
  onFilesAdd,
  onFileRemove,
  onFileTitleChange,
  onFileDescriptionChange,
  onFileReplace,
  onPromptFileMetadataChange,
}: Step2DataFilesProps) {
  const isPromptDataset = datasetType === 'prompt_dataset'
  const toast = useToast()
  const confirm = useConfirm()
  const [method, setMethod] = React.useState<UploadMethod>('file')

  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const [detailsId, setDetailsId] = React.useState<string | null>(null)
  const [previewResource, setPreviewResource] = React.useState<PreviewResource | null>(null)
  const [replacingFileId, setReplacingFileId] = React.useState<string | null>(null)
  const replaceInputRef = React.useRef<HTMLInputElement>(null)

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
        const withShape = { ...df, source: 'File upload', ...shape }
        if (!isPromptDataset || !original) return withShape
        const fields = await detectFileFields(original)
        return withPromptFileMetadata(withShape, fields)
      }),
    )
    onFilesAdd(enriched)
    toast(
      enriched.length === 1
        ? { title: 'File uploaded', description: `${enriched[0].name} has been added.`, variant: 'success' }
        : { title: 'Files uploaded', description: `${enriched.length} files have been added.`, variant: 'success' },
    )
  }

  const handleMethodChange = async (next: UploadMethod) => {
    if (next === method) return
    const blockingFiles = next === 'platform' ? files.filter(isManualUpload) : files.filter((f) => !isManualUpload(f))
    if (blockingFiles.length > 0) {
      const alreadyUsed = next === 'platform' ? 'manually' : 'from the public platform'
      const switchingTo = next === 'platform' ? 'importing files from the public platform' : 'uploading files manually'
      const ok = await confirm({
        title: 'Change upload method?',
        description: `You have already uploaded files ${alreadyUsed}. Clear these files before ${switchingTo}.`,
        confirmLabel: 'Clear Files and Switch',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      })
      if (!ok) return
      blockingFiles.forEach((f) => onFileRemove(f.id))
      toast({ title: 'Files cleared', description: 'Upload method switched.', variant: 'success' })
    }
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
        .map((f) => {
          const base: DatasetFile = {
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
          }
          // Platform imports don't return a real file to parse a schema from —
          // fields are unavailable until the file is replaced with a real upload.
          return isPromptDataset ? withPromptFileMetadata(base, null) : base
        })
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

  const handleReplaceFileClick = (file: DatasetFile) => {
    setReplacingFileId(file.id)
    replaceInputRef.current?.click()
  }

  const handleReplaceFileSelected = async (fileList: FileList | null) => {
    const id = replacingFileId
    setReplacingFileId(null)
    if (!fileList || fileList.length === 0 || !id) return
    const original = fileList[0]
    const current = files.find((f) => f.id === id)
    if (!current) return

    const { accepted, errors } = validateIncomingFiles([original], files.filter((f) => f.id !== id))
    if (errors.length > 0) {
      toast({ title: 'File replacement failed', description: errors[0], variant: 'error' })
      return
    }
    const [replacementBase] = accepted
    const shape = await inferCsvShape(original)
    const fields = isPromptDataset ? await detectFileFields(original) : null

    const previousFields = current.promptFileMetadata?.fields ?? []
    const nextFields = fields ? fields.map((name) => {
      const previous = previousFields.find((f) => f.name === name)
      return { name, description: previous?.description }
    }) : []
    const fieldsChanged = isPromptDataset && JSON.stringify(nextFields.map((f) => f.name)) !== JSON.stringify(previousFields.map((f) => f.name))

    const replacement: DatasetFile = {
      ...replacementBase,
      id,
      source: 'File upload',
      ...shape,
      promptFileMetadata: isPromptDataset
        ? { ...(current.promptFileMetadata ?? emptyPromptFileMetadata(getResourceTitle(current))), fields: nextFields, fieldsUnavailable: fields === null }
        : undefined,
    }
    onFileReplace(id, replacement)
    toast({
      title: 'File replaced',
      description: fieldsChanged
        ? 'The new file has different fields — review the field descriptions.'
        : `${replacement.name} has replaced the previous file.`,
      variant: 'success',
    })
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
      <div className="flex gap-1 rounded-lg border border-border-default bg-surface-subdued/40 p-1">
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
                isActive ? 'bg-surface-default text-text-brand shadow-sm' : 'text-text-subdued hover:text-text-default',
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
              <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2">
                {uploadErrors.map((message) => (
                  <p key={message} className="text-xs font-medium text-text-critical-strong">
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
            <p className="mt-1 text-sm font-normal text-text-subdued">
              Select a platform, paste the dataset URL, then extract its files into this dataset.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <Label htmlFor="platform-select">
                Select Platform <span className="text-text-critical-strong">*</span>
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
                  Dataset URL <span className="text-text-critical-strong">*</span>
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
                <p className="mt-1.5 text-xs text-text-subdued">{platformOption(platform).urlHelp}</p>
                {platformUrlTouched && urlError && (
                  <FieldError message={platformUrlErrorMessage(urlError, platform)} />
                )}
              </div>
            )}

            {platform !== '' && urlError === null && (
              <div className="flex flex-col gap-2 border-t border-border-default pt-5">
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
                  <div className="flex items-start gap-2 rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5 text-sm text-text-critical">
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
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-success">
              <CheckCircle2 className="size-4" />
              {files.length} File{files.length === 1 ? '' : 's'} Ready
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {files.length === 0 && (
            <p className="py-6 text-center text-sm text-text-subdued">No files uploaded yet.</p>
          )}

          {hasFolders
            ? grouped.map(([key, groupFiles]) => (
                <div key={key || 'root'} className="flex flex-col gap-3">
                  {key !== '' && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-subdued">
                      <Folder className="size-3.5" />
                      {key}/
                    </div>
                  )}
                  <div className={cn('flex flex-col gap-3', key !== '' && 'border-l border-border-default pl-3')}>
                    {groupFiles.map((file) => (
                      <FileRow
                        key={file.id}
                        file={file}
                        isPromptDataset={isPromptDataset}
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
                  isPromptDataset={isPromptDataset}
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

      {isPromptDataset ? (
        <PromptFileSideSheet
          file={detailsFile}
          onOpenChange={(open) => !open && setDetailsId(null)}
          onDescriptionChange={onFileDescriptionChange}
          onPromptFileMetadataChange={onPromptFileMetadataChange}
          onPreview={openPreview}
          onReplaceFileClick={handleReplaceFileClick}
        />
      ) : (
        <FileDetailsSheet
          file={detailsFile}
          onOpenChange={(open) => !open && setDetailsId(null)}
          onTitleChange={onFileTitleChange}
          onDescriptionChange={onFileDescriptionChange}
          onPreview={openPreview}
        />
      )}

      <input
        ref={replaceInputRef}
        type="file"
        className="hidden"
        accept={SUPPORTED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
        onChange={(e) => {
          void handleReplaceFileSelected(e.target.files)
          e.target.value = ''
        }}
      />

      <ResourcePreviewDialog resource={previewResource} onOpenChange={(open) => !open && setPreviewResource(null)} />
    </div>
  )
}

export { Step2DataFiles }
