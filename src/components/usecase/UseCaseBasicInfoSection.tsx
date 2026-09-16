import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import type { UseCaseMetadata } from '@/types/usecase'
import type { UseCaseBasicInfoErrors } from '@/lib/usecase-validation'

interface UseCaseBasicInfoSectionProps {
  metadata: UseCaseMetadata
  errors: UseCaseBasicInfoErrors
  onChange: <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => void
}

/** First section of the Builder step — title, subtitle, thumbnail. Split out of
 * the old Start step's metadata form so it can live at the top of Builder
 * instead of its own step. */
function UseCaseBasicInfoSection({ metadata, errors, onChange }: UseCaseBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          Introduce your Use Case with a title, short summary, and image.
        </p>
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
  )
}

export { UseCaseBasicInfoSection }
