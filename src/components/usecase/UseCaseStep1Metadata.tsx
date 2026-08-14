import * as React from 'react'
import { Building2, UploadCloud } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { validateAssetFile, buildUploadedAsset } from '@/lib/generic-upload'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RUNNING_STATUS_OPTIONS, SDG_GOAL_OPTIONS, type UseCaseMetadata, type UseCaseRunningStatus } from '@/types/usecase'
import type { UseCaseMetadataErrors } from '@/lib/usecase-validation'

const SUPPORTED_LOGO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_LOGO_BYTES = 10 * 1024 * 1024

interface UseCaseStep1MetadataProps {
  metadata: UseCaseMetadata
  errors: UseCaseMetadataErrors
  onChange: <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => void
}

function UseCaseStep1Metadata({ metadata, errors, onChange }: UseCaseStep1MetadataProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [logoError, setLogoError] = React.useState<string | undefined>(undefined)

  const handleLogoFile = async (file: File) => {
    const error = validateAssetFile(file, { extensions: SUPPORTED_LOGO_EXTENSIONS, maxBytes: MAX_LOGO_BYTES })
    if (error) {
      setLogoError(error)
      return
    }
    setLogoError(undefined)
    onChange('logo', await buildUploadedAsset(file, true))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Metadata</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the structured information used to classify and describe this Use Case.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="usecase-title">
              Use Case Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="usecase-title"
              className="mt-1.5"
              placeholder="e.g. Maternal Health Monitoring in Rural Districts"
              value={metadata.title}
              aria-invalid={Boolean(errors.title)}
              onChange={(e) => onChange('title', e.target.value)}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <Label htmlFor="usecase-platform-url">Platform URL</Label>
            <Input
              id="usecase-platform-url"
              className="mt-1.5"
              placeholder="https://example.org/use-case"
              value={metadata.platformUrl}
              onChange={(e) => onChange('platformUrl', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="usecase-running-status">
                Running Status <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="usecase-running-status"
                  options={RUNNING_STATUS_OPTIONS}
                  value={metadata.runningStatus}
                  onChange={(value) => onChange('runningStatus', value as UseCaseRunningStatus)}
                  placeholder="Select running status..."
                  invalid={Boolean(errors.runningStatus)}
                />
              </div>
              <FieldError message={errors.runningStatus} />
            </div>

            <div />

            <div>
              <Label htmlFor="usecase-started-on">
                Started On <span className="text-destructive">*</span>
              </Label>
              <Input
                id="usecase-started-on"
                type="date"
                className="mt-1.5"
                value={metadata.startedOn}
                aria-invalid={Boolean(errors.startedOn)}
                onChange={(e) => onChange('startedOn', e.target.value)}
              />
              <FieldError message={errors.startedOn} />
            </div>

            <div>
              <Label htmlFor="usecase-completed-on">Completed On</Label>
              <Input
                id="usecase-completed-on"
                type="date"
                className="mt-1.5"
                value={metadata.completedOn}
                onChange={(e) => onChange('completedOn', e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Leave empty if this Use Case is ongoing.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="usecase-sectors">
              Sectors <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <MultiSelect
                id="usecase-sectors"
                options={SECTOR_OPTIONS}
                values={metadata.sectors}
                onChange={(values) => onChange('sectors', values)}
                placeholder="Select sectors..."
                invalid={Boolean(errors.sectors)}
              />
            </div>
            <FieldError message={errors.sectors} />
          </div>

          <div>
            <Label htmlFor="usecase-sdg-goals">
              SDG Goals <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <MultiSelect
                id="usecase-sdg-goals"
                options={SDG_GOAL_OPTIONS}
                values={metadata.sdgGoals}
                onChange={(values) => onChange('sdgGoals', values)}
                placeholder="Select SDG goals..."
                invalid={Boolean(errors.sdgGoals)}
              />
            </div>
            <FieldError message={errors.sdgGoals} />
          </div>

          <div>
            <Label htmlFor="usecase-geographies">Geographies</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="usecase-geographies"
                options={GEOGRAPHY_OPTIONS}
                values={metadata.geographies}
                onChange={(values) => onChange('geographies', values)}
                placeholder="Select geographies..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="usecase-tags">Tags</Label>
            <div className="mt-1.5">
              <TagInput
                id="usecase-tags"
                value={metadata.tags}
                onChange={(tags) => onChange('tags', tags)}
                placeholder="Type a tag and press Enter..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Logo</Label>
          <div className="mt-1.5">
            {metadata.logo ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                {metadata.logo.dataUrl ? (
                  <img
                    src={metadata.logo.dataUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <Building2 className="size-10 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{metadata.logo.name}</p>
                  <p className="text-xs text-muted-foreground">{metadata.logo.sizeLabel}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  Replace
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange('logo', null)}>
                  Remove
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
              accept={SUPPORTED_LOGO_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleLogoFile(file)
                e.target.value = ''
              }}
            />
          </div>
          <FieldError message={logoError} />
          <p className="mt-1.5 text-xs text-muted-foreground">Optional. JPG, PNG, or WEBP. Maximum 10MB.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export { UseCaseStep1Metadata }
