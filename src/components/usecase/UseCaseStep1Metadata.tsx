import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import { SDG_GOAL_OPTIONS, type UseCaseMetadata } from '@/types/usecase'
import type { UseCaseStartErrors } from '@/lib/usecase-validation'

interface UseCaseStep1MetadataProps {
  metadata: UseCaseMetadata
  errors: UseCaseStartErrors
  onChange: <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => void
}

function UseCaseStep1Metadata({ metadata, errors, onChange }: UseCaseStep1MetadataProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Start</h2>
        <p className="mt-1 text-sm text-muted-foreground">Name and classify this Use Case.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FileUploadField
            id="usecase-thumbnail"
            label="Thumbnail"
            required
            helperText="Upload an image that represents this Use Case."
            value={metadata.thumbnail}
            onChange={(asset) => onChange('thumbnail', asset)}
            extensions={SUPPORTED_IMAGE_EXTENSIONS}
            maxBytes={MAX_IMAGE_BYTES}
            error={errors.thumbnail}
            variant="dropzone"
          />

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
            <Label htmlFor="usecase-subtitle">Subtitle</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Add a short, one-line summary.</p>
            <Input
              id="usecase-subtitle"
              className="mt-1.5"
              placeholder="Keep it concise..."
              value={metadata.subtitle}
              onChange={(e) => onChange('subtitle', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Optional. Helps people discover this Use Case.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
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

          <div>
            <Label htmlFor="usecase-sdg-goals">SDG Goals</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="usecase-sdg-goals"
                options={SDG_GOAL_OPTIONS}
                values={metadata.sdgGoals}
                onChange={(values) => onChange('sdgGoals', values)}
                placeholder="Select SDG goals..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="usecase-sectors">Sectors</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="usecase-sectors"
                options={SECTOR_OPTIONS}
                values={metadata.sectors}
                onChange={(values) => onChange('sectors', values)}
                placeholder="Select sectors..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="usecase-geographies">Geography</Label>
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
        </CardContent>
      </Card>
    </div>
  )
}

export { UseCaseStep1Metadata }
