import * as React from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, Download } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'
import { getResourceDescription, getResourceTitle } from '@/lib/file-validation'
import { downloadFileMetadata } from '@/lib/file-metadata-export'
import { PROMPT_FORMAT_OPTIONS, type DatasetFile } from '@/types/dataset'

/** Formats the "Download metadata" export currently supports. A single entry
 *  today, but the selector and `downloadFileMetadata` are both already
 *  format-aware so a second format is a one-line addition here later. */
const METADATA_FORMATS: { value: 'json'; label: string }[] = [{ value: 'json', label: 'JSON' }]

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

/** A single resource-level value. Falls back to "Unable to determine" rather than
 *  a blank field — same convention as the contributor-facing File Details sheet. */
function DetailField({ label, value }: { label: string; value: ReactNode }) {
  const hasValue = value !== undefined && value !== null && value !== ''
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{label}</p>
      {hasValue ? (
        <div className="mt-1 break-words text-sm text-text-default">{value}</div>
      ) : (
        <p className="mt-1 text-sm text-text-subdued">Unable to determine</p>
      )}
    </div>
  )
}

interface ResourceDetailsSheetProps {
  file: DatasetFile | null
  onOpenChange: (open: boolean) => void
}

/** Read-only "File Details" side sheet for the consumer Dataset Details page —
 *  the same right-drawer pattern as the contributor `FileDetailsSheet`, without
 *  the editable Title/Description fields (nothing on this page is editable). */
function ResourceDetailsSheet({ file, onOpenChange }: ResourceDetailsSheetProps) {
  const toast = useToast()
  const isPlatformImport = Boolean(file?.source && file.source !== 'File upload')
  const promptMeta = file?.promptFileMetadata
  const [format, setFormat] = React.useState<'json'>('json')
  const [formatOpen, setFormatOpen] = React.useState(false)

  const handleDownloadMetadata = () => {
    if (!file) return
    downloadFileMetadata(file, format)
    toast({ title: 'Metadata downloaded', description: `Saved as ${format.toUpperCase()}.`, variant: 'success' })
  }

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate">{file ? getResourceTitle(file) : 'File details'}</DialogTitle>
          <DialogDescription>
            {isPlatformImport ? `Imported from ${file?.source}.` : 'A data file in this dataset.'}
          </DialogDescription>
        </DialogHeader>

        {file && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <DetailField label="Description" value={getResourceDescription(file)} />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <DetailField label="File type" value={file.extension} />
                  <DetailField label="File size" value={file.sizeLabel} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <DetailField label="Number of rows" value={file.rowCount != null ? file.rowCount.toLocaleString() : undefined} />
                  <DetailField
                    label="Number of columns"
                    value={file.columnCount != null ? file.columnCount.toLocaleString() : undefined}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <DetailField label="Source" value={file.source ?? 'File upload'} />
                  <DetailField label={isPlatformImport ? 'Imported' : 'Uploaded'} value={file.uploadedAt} />
                </div>

                <DetailField label="Original filename" value={file.name} />

                {promptMeta && (
                  <div className="border-t border-border-default pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">Prompt file metadata</p>
                    <div className="mt-3 flex flex-col gap-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <DetailField
                          label="Prompt format"
                          value={promptMeta.promptFormat ? optionLabel(PROMPT_FORMAT_OPTIONS, promptMeta.promptFormat) : undefined}
                        />
                        <DetailField label="System prompt" value={promptMeta.hasSystemPrompt ? 'Included' : 'Not included'} />
                      </div>
                      <DetailField label="Example responses" value={promptMeta.hasExampleResponses ? 'Included' : 'Not included'} />
                      <DetailField
                        label="Schema / fields"
                        value={
                          promptMeta.fieldsUnavailable ? (
                            'Unable to determine'
                          ) : promptMeta.fields.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {promptMeta.fields.map((field) => (
                                <div key={field.name} className="flex items-start gap-2">
                                  <Badge variant="secondary" className="shrink-0">
                                    {field.name}
                                  </Badge>
                                  {field.description && <span className="text-text-subdued">{field.description}</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            undefined
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Downloads the metadata shown above, not the file itself — a
                    separate, always-available action distinct from the file-level
                    Download button in the main preview header (which downloads the
                    file's actual content and isn't backed by real storage yet). */}
                <div className="border-t border-border-default pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">Download metadata</p>
                  <p className="mt-1 text-sm text-text-subdued">Downloads this file's metadata, not the file itself.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Popover open={formatOpen} onOpenChange={setFormatOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" aria-label={`Metadata format: ${format.toUpperCase()}`}>
                          {format.toUpperCase()}
                          <ChevronDown className="size-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-32 p-1">
                        <div className="flex flex-col">
                          {METADATA_FORMATS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={format === option.value}
                              onClick={() => {
                                setFormat(option.value)
                                setFormatOpen(false)
                              }}
                              className="rounded-sm px-2.5 py-1.5 text-left text-sm text-text-default hover:bg-surface-subdued"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button type="button" size="sm" onClick={handleDownloadMetadata}>
                      <Download className="size-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end border-t border-border px-6 py-4">
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

export { ResourceDetailsSheet }
