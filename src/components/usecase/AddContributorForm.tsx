import * as React from 'react'
import { User } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS } from '@/types/event'
import type { UploadedAsset } from '@/lib/generic-upload'

interface ContributorDraft {
  name: string
  role: string
  organisation?: string
  bio?: string
  image?: UploadedAsset | null
}

interface AddContributorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (contributor: ContributorDraft) => void
  /** What this contributor is being attached to — shown in the dialog description. */
  contentLabel?: string
  /** Example roles shown as Role field placeholder text, e.g. "e.g. Author, Editor, Director". */
  rolePlaceholder?: string
}

function AddContributorForm({
  open,
  onOpenChange,
  onAdd,
  contentLabel = 'Use Case',
  rolePlaceholder = 'e.g. Data Analyst',
}: AddContributorFormProps) {
  const confirm = useConfirm()
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState('')
  const [organisation, setOrganisation] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [image, setImage] = React.useState<UploadedAsset | null>(null)
  const [errors, setErrors] = React.useState<{ name?: string }>({})

  React.useEffect(() => {
    if (open) {
      setName('')
      setRole('')
      setOrganisation('')
      setBio('')
      setImage(null)
      setErrors({})
    }
  }, [open])

  const hasUnsavedChanges =
    name.trim() !== '' || role.trim() !== '' || organisation.trim() !== '' || bio.trim() !== '' || image !== null

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved contributor details. This cannot be undone.',
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
      setErrors({ name: 'Enter a contributor name.' })
      return
    }
    onAdd({ name: name.trim(), role: role.trim(), organisation: organisation.trim(), bio: bio.trim(), image })
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
          <DialogTitle>Add Contributor</DialogTitle>
          <DialogDescription>Add a person who contributed to this {contentLabel}.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <FileUploadField
              id="contributor-image"
              label="Profile Image"
              helperText="Upload a profile photo for this contributor."
              value={image}
              onChange={setImage}
              extensions={SUPPORTED_IMAGE_EXTENSIONS}
              maxBytes={MAX_IMAGE_BYTES}
              fallbackIcon={User}
              roundedFull
              variant="dropzone"
              dropzoneTitle="Drag and drop a photo here, or click to browse."
            />

            <div>
              <Label htmlFor="contributor-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contributor-name"
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
              <Label htmlFor="contributor-role">Role</Label>
              <Input
                id="contributor-role"
                className="mt-1.5"
                placeholder={rolePlaceholder}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contributor-organisation">Organisation</Label>
              <Input
                id="contributor-organisation"
                className="mt-1.5"
                placeholder="e.g. CivicDataLab"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contributor-bio">Description / Bio</Label>
              <Textarea
                id="contributor-bio"
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
            Add Contributor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddContributorForm }
