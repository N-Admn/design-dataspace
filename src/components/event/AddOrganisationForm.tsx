import * as React from 'react'
import { Building2, UploadCloud } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { ORG_SECTOR_OPTIONS, MAX_IMAGE_BYTES, SUPPORTED_IMAGE_EXTENSIONS, type Organisation } from '@/types/event'
import { validateAssetFile, buildUploadedAsset, type UploadedAsset } from '@/lib/generic-upload'

interface AddOrganisationFormProps {
  onCancel: () => void
  onCreate: (org: Omit<Organisation, 'id'>) => void
}

function AddOrganisationForm({ onCancel, onCreate }: AddOrganisationFormProps) {
  const [name, setName] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [sectorType, setSectorType] = React.useState('')
  const [logo, setLogo] = React.useState<UploadedAsset | null>(null)
  const [errors, setErrors] = React.useState<{ name?: string; sectorType?: string; logo?: string }>({})
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleLogoFile = async (file: File) => {
    const error = validateAssetFile(file, { extensions: SUPPORTED_IMAGE_EXTENSIONS, maxBytes: MAX_IMAGE_BYTES })
    if (error) {
      setErrors((prev) => ({ ...prev, logo: error }))
      return
    }
    setErrors((prev) => ({ ...prev, logo: undefined }))
    setLogo(await buildUploadedAsset(file, true))
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
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>Add Organisation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
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

        <div>
          <Label>
            Logo <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1.5">
            {logo ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                {logo.dataUrl ? (
                  <img src={logo.dataUrl} alt="" className="size-10 shrink-0 rounded-md border border-border object-cover" />
                ) : (
                  <Building2 className="size-10 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{logo.name}</p>
                  <p className="text-xs text-muted-foreground">{logo.sizeLabel}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  Replace
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                <UploadCloud className="size-4" />
                Upload Logo
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={SUPPORTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleLogoFile(file)
                e.target.value = ''
              }}
            />
          </div>
          <FieldError message={errors.logo} />
          <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG, or WEBP. Maximum 10MB.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Add Organisation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { AddOrganisationForm }
