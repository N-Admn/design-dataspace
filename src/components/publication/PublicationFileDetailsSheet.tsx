import * as React from 'react'
import { Eye, Lock, Trash2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getPublicationFileDescription, getPublicationFileTitle } from '@/lib/publication-file'
import type { PublicationFileBlock } from '@/types/publication'

interface InferredFieldProps {
  label: string
  value: React.ReactNode
}

/** A single system-inferred value. Read-only by design. */
function InferredField({ label, value }: InferredFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm text-foreground">{value ?? '—'}</div>
    </div>
  )
}

interface PublicationFileDetailsSheetProps {
  /** The file block to inspect, or null when the sheet is closed. */
  block: PublicationFileBlock | null
  onOpenChange: (open: boolean) => void
  onTitleChange: (id: string, title: string) => void
  onDescriptionChange: (id: string, description: string) => void
  /** Opens the shared resource preview for this file. */
  onPreview: (block: PublicationFileBlock) => void
  /** Removes this file block entirely. */
  onRemove: (id: string) => void
}

/** File Details side sheet for a Publication's uploaded files — mirrors the
 *  Dataset File Details sheet, minus the tabular row/column and platform-import fields
 *  that don't apply to reports, slide decks or other document uploads. */
function PublicationFileDetailsSheet({ block, onOpenChange, onTitleChange, onDescriptionChange, onPreview, onRemove }: PublicationFileDetailsSheetProps) {
  const [titleDraft, setTitleDraft] = React.useState('')
  const [descriptionDraft, setDescriptionDraft] = React.useState('')

  React.useEffect(() => {
    if (block) {
      setTitleDraft(getPublicationFileTitle(block))
      setDescriptionDraft(getPublicationFileDescription(block))
    }
    // Re-sync only when a different block is opened, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id])

  const commitTitle = () => {
    if (!block) return
    const next = titleDraft.trim()
    if (next && next !== getPublicationFileTitle(block)) onTitleChange(block.id, next)
    else setTitleDraft(getPublicationFileTitle(block))
  }

  const commitDescription = () => {
    if (!block) return
    const next = descriptionDraft.trim()
    if (next !== getPublicationFileDescription(block)) onDescriptionChange(block.id, next)
  }

  return (
    <Dialog open={block !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate">{block ? getPublicationFileTitle(block) : 'File details'}</DialogTitle>
          <DialogDescription>Uploaded to this Publication.</DialogDescription>
        </DialogHeader>

        {block && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="publication-file-title">Title</Label>
                  <Input
                    id="publication-file-title"
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
                  <Label htmlFor="publication-file-description">Description</Label>
                  <Textarea
                    id="publication-file-description"
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

                <div className="border-t border-border pt-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Lock className="size-3" />
                    Read from the file — not editable
                  </div>

                  <div className="mt-3 flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InferredField label="File type" value={block.asset?.extension} />
                      <InferredField label="File size" value={block.asset?.sizeLabel} />
                    </div>
                    <InferredField label="Uploaded" value={block.asset?.uploadedAt} />
                    <InferredField label="Original filename" value={block.asset?.name} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => onPreview(block)}>
                  <Eye className="size-4" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onRemove(block.id)
                    onOpenChange(false)
                  }}
                >
                  <Trash2 className="size-4" />
                  Remove File
                </Button>
              </div>
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

export { PublicationFileDetailsSheet }
