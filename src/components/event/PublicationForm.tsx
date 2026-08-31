import * as React from 'react'
import { FileText } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { deriveDefaultResourceTitle } from '@/lib/file-validation'
import {
  MAX_DOCUMENT_BYTES,
  PUBLICATION_TYPE_OPTIONS,
  SUPPORTED_PUBLICATION_EXTENSIONS,
  type EventPublication,
} from '@/types/event'
import type { UploadedAsset } from '@/lib/generic-upload'

interface PublicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (publication: EventPublication) => void
  initial?: Pick<EventPublication, 'id' | 'title' | 'description' | 'publicationType'>
}

let publicationIdCounter = 0

function PublicationForm({ open, onOpenChange, onAdd, initial }: PublicationFormProps) {
  const confirm = useConfirm()
  const [title, setTitle] = React.useState(initial?.title ?? '')
  const [description, setDescription] = React.useState(initial?.description ?? '')
  const [publicationType, setPublicationType] = React.useState(initial?.publicationType ?? '')
  const [errors, setErrors] = React.useState<{ title?: string; publicationType?: string; file?: string }>({})
  const [pendingAsset, setPendingAsset] = React.useState<UploadedAsset | null>(null)
  const titleTouched = React.useRef(Boolean(initial?.title))
  const typeTouched = React.useRef(Boolean(initial?.publicationType))

  React.useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setDescription(initial?.description ?? '')
      setPublicationType(initial?.publicationType ?? '')
      setPendingAsset(null)
      setErrors({})
      titleTouched.current = Boolean(initial?.title)
      typeTouched.current = Boolean(initial?.publicationType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFileChange = (asset: UploadedAsset | null) => {
    setPendingAsset(asset)
    setErrors((prev) => ({ ...prev, file: undefined }))
    if (!asset) return
    if (!titleTouched.current) setTitle(deriveDefaultResourceTitle(asset.name))
    if (!typeTouched.current && asset.extension.toLowerCase() === 'pptx') {
      setPublicationType('presentation')
    }
  }

  const hasUnsavedChanges =
    title.trim() !== (initial?.title ?? '') ||
    description.trim() !== (initial?.description ?? '') ||
    publicationType !== (initial?.publicationType ?? '') ||
    pendingAsset !== null

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved publication details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (ok) onOpenChange(false)
      return
    }
    onOpenChange(false)
  }

  const handleSubmit = () => {
    const nextErrors: typeof errors = {}
    if (!title.trim()) nextErrors.title = 'Enter a publication title.'
    if (!publicationType) nextErrors.publicationType = 'Select a publication type.'
    if (!pendingAsset) nextErrors.file = 'Upload a file.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    let id = initial?.id
    if (!id) {
      publicationIdCounter += 1
      id = `publication-${publicationIdCounter}`
    }
    onAdd({
      id,
      title: title.trim(),
      description: description.trim(),
      publicationType,
      file: pendingAsset!,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose()
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>{initial ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
          <DialogDescription>
            Add supporting content such as reports, presentations, or reading material.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <FileUploadField
              id="publication-file"
              label="File Upload"
              required
              helperText="Upload the file first — the title below is prefilled from it."
              value={pendingAsset}
              onChange={handleFileChange}
              extensions={SUPPORTED_PUBLICATION_EXTENSIONS}
              maxBytes={MAX_DOCUMENT_BYTES}
              error={errors.file}
              fallbackIcon={FileText}
              variant="dropzone"
              dropzoneTitle="Drag and drop a file here, or click to browse."
            />

            <div>
              <Label htmlFor="publication-title">
                Publication Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="publication-title"
                className="mt-1.5"
                value={title}
                aria-invalid={Boolean(errors.title)}
                onChange={(e) => {
                  titleTouched.current = true
                  setTitle(e.target.value)
                }}
              />
              <FieldError message={errors.title} />
            </div>

            <div>
              <Label htmlFor="publication-description">Description</Label>
              <Textarea
                id="publication-description"
                className="mt-1.5"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="publication-type">
                Publication Type <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="publication-type"
                  options={PUBLICATION_TYPE_OPTIONS}
                  value={publicationType}
                  onChange={(value) => {
                    typeTouched.current = true
                    setPublicationType(value)
                  }}
                  placeholder="Select publication type..."
                  invalid={Boolean(errors.publicationType)}
                />
              </div>
              <FieldError message={errors.publicationType} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {initial ? 'Save Changes' : 'Add Publication'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { PublicationForm }
