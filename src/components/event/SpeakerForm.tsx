import * as React from 'react'
import { Mic2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS, type EventSpeaker } from '@/types/event'
import type { UploadedAsset } from '@/lib/generic-upload'

interface SpeakerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (speaker: EventSpeaker) => void
  initial?: EventSpeaker
}

let speakerIdCounter = 0

function SpeakerForm({ open, onOpenChange, onSave, initial }: SpeakerFormProps) {
  const confirm = useConfirm()
  const [name, setName] = React.useState(initial?.name ?? '')
  const [designation, setDesignation] = React.useState(initial?.designation ?? '')
  const [organisation, setOrganisation] = React.useState(initial?.organisation ?? '')
  const [bio, setBio] = React.useState(initial?.bio ?? '')
  const [image, setImage] = React.useState<UploadedAsset | null>(initial?.image ?? null)
  const [errors, setErrors] = React.useState<{ name?: string }>({})

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setDesignation(initial?.designation ?? '')
      setOrganisation(initial?.organisation ?? '')
      setBio(initial?.bio ?? '')
      setImage(initial?.image ?? null)
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const hasUnsavedChanges =
    name.trim() !== (initial?.name ?? '') ||
    designation.trim() !== (initial?.designation ?? '') ||
    organisation.trim() !== (initial?.organisation ?? '') ||
    bio.trim() !== (initial?.bio ?? '') ||
    image !== (initial?.image ?? null)

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved speaker details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (ok) onOpenChange(false)
      return
    }
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrors({ name: 'Enter a speaker name.' })
      return
    }
    let id = initial?.id
    if (!id) {
      speakerIdCounter += 1
      id = `speaker-${speakerIdCounter}`
    }
    onSave({
      id,
      name: name.trim(),
      designation: designation.trim(),
      organisation: organisation.trim(),
      bio: bio.trim(),
      image,
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
          <DialogTitle>{initial ? 'Edit Speaker' : 'Add Speaker'}</DialogTitle>
          <DialogDescription>Add a speaker featured at this event.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <FileUploadField
              id="speaker-image"
              label="Profile Image"
              helperText="Upload a profile photo for this speaker."
              value={image}
              onChange={setImage}
              extensions={SUPPORTED_IMAGE_EXTENSIONS}
              maxBytes={MAX_IMAGE_BYTES}
              fallbackIcon={Mic2}
              roundedFull
              variant="dropzone"
              dropzoneTitle="Drag and drop a photo here, or click to browse."
            />

            <div>
              <Label htmlFor="speaker-name">
                Speaker Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="speaker-name"
                className="mt-1.5"
                value={name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({})
                }}
              />
              <FieldError message={errors.name} />
            </div>

            <div>
              <Label htmlFor="speaker-designation">Designation / Role</Label>
              <Input
                id="speaker-designation"
                className="mt-1.5"
                placeholder="e.g. Data Scientist"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="speaker-organisation">Organisation</Label>
              <Input
                id="speaker-organisation"
                className="mt-1.5"
                placeholder="e.g. CivicDataLab"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="speaker-bio">Description / Bio</Label>
              <Textarea
                id="speaker-bio"
                className="mt-1.5"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {initial ? 'Save Changes' : 'Add Speaker'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SpeakerForm }
