import * as React from 'react'
import { UploadCloud } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import {
  MAX_PUBLICATION_BYTES,
  PUBLICATION_TYPE_OPTIONS,
  SUPPORTED_PUBLICATION_EXTENSIONS,
  type EventPublication,
} from '@/types/event'
import { validateAssetFile, buildUploadedAsset } from '@/lib/generic-upload'

interface PublicationFormProps {
  onCancel: () => void
  onAdd: (publication: EventPublication) => void
  initial?: Pick<EventPublication, 'id' | 'title' | 'description' | 'publicationType'>
}

let publicationIdCounter = 0

function PublicationForm({ onCancel, onAdd, initial }: PublicationFormProps) {
  const [title, setTitle] = React.useState(initial?.title ?? '')
  const [description, setDescription] = React.useState(initial?.description ?? '')
  const [publicationType, setPublicationType] = React.useState(initial?.publicationType ?? '')
  const [fileError, setFileError] = React.useState<string | undefined>(undefined)
  const [errors, setErrors] = React.useState<{ title?: string; publicationType?: string; file?: string }>({})
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const error = validateAssetFile(file, {
      extensions: SUPPORTED_PUBLICATION_EXTENSIONS,
      maxBytes: MAX_PUBLICATION_BYTES,
    })
    if (error) {
      setFileError(error)
      setPendingFile(null)
      return
    }
    setFileError(undefined)
    setPendingFile(file)
  }

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {}
    if (!title.trim()) nextErrors.title = 'Enter a publication title.'
    if (!publicationType) nextErrors.publicationType = 'Select a publication type.'
    if (!pendingFile) nextErrors.file = 'Upload a file.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    const asset = await buildUploadedAsset(pendingFile!)
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
      file: asset,
    })
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>{initial ? 'Edit Publication' : 'Add Publication'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <Label htmlFor="publication-title">
            Publication Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="publication-title"
            className="mt-1.5"
            value={title}
            aria-invalid={Boolean(errors.title)}
            onChange={(e) => setTitle(e.target.value)}
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
              onChange={setPublicationType}
              placeholder="Select publication type..."
              invalid={Boolean(errors.publicationType)}
            />
          </div>
          <FieldError message={errors.publicationType} />
        </div>

        <div>
          <Label>
            File Upload <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1.5">
            {pendingFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{pendingFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(pendingFile.size / (1024 * 1024)).toFixed(1)}MB
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  Replace
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <UploadCloud className="size-4" />
                Browse File
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={SUPPORTED_PUBLICATION_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ''
              }}
            />
          </div>
          <FieldError message={errors.file ?? fileError} />
          <p className="mt-1.5 text-xs text-muted-foreground">PDF, DOCX, PPTX, or XLSX. Maximum 10MB.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {initial ? 'Save Changes' : 'Add Publication'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { PublicationForm }
