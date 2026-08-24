import * as React from 'react'
import { Building2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { ORG_SECTOR_OPTIONS, MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS, type Organisation } from '@/types/event'
import type { UploadedAsset } from '@/lib/generic-upload'

interface AddOrganisationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (org: Omit<Organisation, 'id'>) => void
}

function AddOrganisationForm({ open, onOpenChange, onCreate }: AddOrganisationFormProps) {
  const confirm = useConfirm()
  const [name, setName] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [sectorType, setSectorType] = React.useState('')
  const [logo, setLogo] = React.useState<UploadedAsset | null>(null)
  const [errors, setErrors] = React.useState<{ name?: string; sectorType?: string; logo?: string }>({})

  React.useEffect(() => {
    if (open) {
      setName('')
      setUrl('')
      setSectorType('')
      setLogo(null)
      setErrors({})
    }
  }, [open])

  const hasUnsavedChanges = name.trim() !== '' || url.trim() !== '' || sectorType !== '' || logo !== null

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved organisation details. This cannot be undone.',
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
    if (!name.trim()) nextErrors.name = 'Enter an organisation name.'
    if (!sectorType) nextErrors.sectorType = 'Select a sector/domain type.'
    if (!logo) nextErrors.logo = 'Upload a logo.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onCreate({ name: name.trim(), url: url.trim(), sectorType, logo: logo ?? undefined, isRegistered: false })
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
          <DialogTitle>Add Organisation</DialogTitle>
          <DialogDescription>Add an organisation to this event.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="org-name">
                Organisation Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-name"
                className="mt-1.5"
                value={name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldError message={errors.name} />
            </div>

            <div>
              <Label htmlFor="org-url">URL</Label>
              <Input
                id="org-url"
                className="mt-1.5"
                placeholder="https://example.org"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="org-sector">
                Sector/Domain Type <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="org-sector"
                  options={ORG_SECTOR_OPTIONS}
                  value={sectorType}
                  onChange={setSectorType}
                  placeholder="Select or search sector/domain type..."
                  invalid={Boolean(errors.sectorType)}
                />
              </div>
              <FieldError message={errors.sectorType} />
            </div>

            <FileUploadField
              id="org-logo"
              label="Logo"
              required
              value={logo}
              onChange={(asset) => {
                setLogo(asset)
                setErrors((prev) => ({ ...prev, logo: undefined }))
              }}
              extensions={SUPPORTED_IMAGE_EXTENSIONS}
              maxBytes={MAX_IMAGE_BYTES}
              error={errors.logo}
              fallbackIcon={Building2}
              uploadLabel="Upload Logo"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Add Organisation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddOrganisationForm }
