import * as React from 'react'
import { AlertTriangle, Eye, FileText, RefreshCw } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { getResourceDescription, getResourceTitle } from '@/lib/file-validation'
import { validatePromptFileMetadata } from '@/lib/prompt-file-validation'
import {
  PROMPT_FILE_NAME_MAX_LENGTH,
  PROMPT_FORMAT_OPTIONS,
  emptyPromptFileMetadata,
  type DatasetFile,
  type PromptFileMetadata,
} from '@/types/dataset'

interface PromptFileSideSheetProps {
  file: DatasetFile | null
  /** True when the parent dataset is Published — Prompt File metadata becomes
   *  read-only, matching how the standard Dataset lifecycle already treats
   *  published content (Section 13). */
  readOnly?: boolean
  onOpenChange: (open: boolean) => void
  onDescriptionChange: (id: string, description: string) => void
  onPromptFileMetadataChange: (id: string, patch: Partial<PromptFileMetadata>) => void
  onPreview: (file: DatasetFile) => void
  onReplaceFileClick: (file: DatasetFile) => void
}

/** Prompt File Details side sheet — the file-level metadata editor for a single
 * file within a Prompt Dataset (Section 10). Field *names* always come from the
 * uploaded file's schema and are never editable here; only descriptions are. */
function PromptFileSideSheet({
  file,
  readOnly = false,
  onOpenChange,
  onDescriptionChange,
  onPromptFileMetadataChange,
  onPreview,
  onReplaceFileClick,
}: PromptFileSideSheetProps) {
  const meta = file?.promptFileMetadata ?? (file ? emptyPromptFileMetadata(getResourceTitle(file)) : null)

  const [nameDraft, setNameDraft] = React.useState('')
  const [descriptionDraft, setDescriptionDraft] = React.useState('')

  React.useEffect(() => {
    if (file && meta) {
      setNameDraft(meta.promptFileName)
      setDescriptionDraft(getResourceDescription(file))
    }
    // Re-sync when a different file is opened, or when "Change file" swaps the
    // physical file under the same prompt file id — `file.name` (the uploaded
    // file's own name) only changes on replace, never on ordinary field edits,
    // so it's a safe signal without re-syncing (and clobbering) on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id, file?.name])

  if (!file || !meta) {
    return <Dialog open={false} onOpenChange={onOpenChange} />
  }

  const errors = validatePromptFileMetadata(file)

  const commitName = () => {
    const next = nameDraft.trim().slice(0, PROMPT_FILE_NAME_MAX_LENGTH)
    setNameDraft(next)
    if (next !== meta.promptFileName) onPromptFileMetadataChange(file.id, { promptFileName: next })
  }

  const commitDescription = () => {
    const next = descriptionDraft.trim()
    if (next !== getResourceDescription(file)) onDescriptionChange(file.id, next)
  }

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate">Prompt File Details</DialogTitle>
          <DialogDescription>
            {readOnly ? 'This dataset is published — prompt file details are read-only.' : 'Configure metadata for this prompt file.'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt-file-name">
                  Prompt File Name <span className="text-text-critical-strong">*</span>
                </Label>
                <span className="text-xs text-text-subdued">
                  {nameDraft.length}/{PROMPT_FILE_NAME_MAX_LENGTH}
                </span>
              </div>
              <Input
                id="prompt-file-name"
                className="mt-1.5"
                value={nameDraft}
                maxLength={PROMPT_FILE_NAME_MAX_LENGTH}
                disabled={readOnly}
                aria-invalid={Boolean(errors.promptFileName)}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
              />
              <FieldError message={errors.promptFileName} />
            </div>

            <div className="rounded-lg border border-border-default p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">
                File associated with this prompt file
              </p>
              <div className="mt-2 flex items-center gap-2">
                <FileText className="size-4 shrink-0 text-text-subdued" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-default">{file.name}</span>
                <span className="shrink-0 rounded-full bg-surface-subdued px-2 py-0.5 text-xs text-text-subdued">
                  {file.extension}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-success">File available</p>
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onReplaceFileClick(file)}
                >
                  <RefreshCw className="size-3.5" />
                  Change file
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="prompt-file-description">File Description</Label>
              <Textarea
                id="prompt-file-description"
                className="mt-1.5"
                rows={3}
                value={descriptionDraft}
                disabled={readOnly}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={commitDescription}
              />
            </div>

            <div>
              <Label htmlFor="prompt-format">
                Prompt Format <span className="text-text-critical-strong">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="prompt-format"
                  options={PROMPT_FORMAT_OPTIONS}
                  value={meta.promptFormat}
                  onChange={(value) => !readOnly && onPromptFileMetadataChange(file.id, { promptFormat: value })}
                  placeholder="Select a prompt format..."
                  invalid={Boolean(errors.promptFormat)}
                />
              </div>
              <FieldError message={errors.promptFormat} />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border-default p-3">
              <Checkbox
                id="prompt-has-system-prompt"
                className="mt-0.5"
                checked={meta.hasSystemPrompt}
                disabled={readOnly}
                onCheckedChange={(checked) =>
                  onPromptFileMetadataChange(file.id, { hasSystemPrompt: checked === true })
                }
              />
              <div>
                <Label htmlFor="prompt-has-system-prompt" className="font-medium">
                  Contains System Prompt
                </Label>
                <p className="mt-0.5 text-xs text-text-subdued">This prompt file contains a system prompt.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border-default p-3">
              <Checkbox
                id="prompt-has-example-responses"
                className="mt-0.5"
                checked={meta.hasExampleResponses}
                disabled={readOnly}
                onCheckedChange={(checked) =>
                  onPromptFileMetadataChange(file.id, { hasExampleResponses: checked === true })
                }
              />
              <div>
                <Label htmlFor="prompt-has-example-responses" className="font-medium">
                  Contains Example Responses
                </Label>
                <p className="mt-0.5 text-xs text-text-subdued">This prompt file contains example responses.</p>
              </div>
            </div>

            <div className="border-t border-border-default pt-5">
              <p className="text-sm font-semibold text-text-default">File Fields</p>
              <p className="mt-1 text-xs text-text-subdued">
                Describe what each field in this prompt file contains.
              </p>

              {meta.fieldsUnavailable && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5 text-sm text-text-critical">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p className="font-medium">This file's schema could not be read. Replace the file or try again.</p>
                </div>
              )}

              {!meta.fieldsUnavailable && meta.fields.length === 0 && (
                <p className="mt-3 text-sm text-text-subdued">No fields were detected for this file.</p>
              )}

              {meta.fields.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                  {meta.fields.map((field, index) => (
                    <div key={field.name} className="rounded-lg border border-border-default p-3">
                      <Label className="font-mono text-xs text-text-default">{field.name}</Label>
                      <Textarea
                        className="mt-1.5"
                        rows={2}
                        placeholder="Describe what this field contains..."
                        value={field.description ?? ''}
                        disabled={readOnly}
                        onChange={(e) => {
                          const nextFields = meta.fields.map((f, i) =>
                            i === index ? { ...f, description: e.target.value } : f,
                          )
                          onPromptFileMetadataChange(file.id, { fields: nextFields })
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onPreview(file)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { PromptFileSideSheet }
