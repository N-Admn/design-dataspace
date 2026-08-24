import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS } from '@/types/usecase'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import type { CollaborativeMetadata } from '@/types/collaborative'
import type { CollaborativeAboutErrors } from '@/lib/collaborative-validation'

const COLLABORATIVE_IMAGE_EXTENSIONS = [...SUPPORTED_IMAGE_EXTENSIONS, 'svg']

interface CollaborativeStep1AboutProps {
  metadata: CollaborativeMetadata
  errors: CollaborativeAboutErrors
  onChange: <K extends keyof CollaborativeMetadata>(field: K, value: CollaborativeMetadata[K]) => void
}

function CollaborativeStep1About({ metadata, errors, onChange }: CollaborativeStep1AboutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">About</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell people what this Collaborative is, what it focuses on, and why it matters.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FileUploadField
            id="collaborative-image"
            label="Collaborative Image"
            helperText="Add an image that represents this Collaborative."
            value={metadata.image}
            onChange={(asset) => onChange('image', asset)}
            extensions={COLLABORATIVE_IMAGE_EXTENSIONS}
            maxBytes={MAX_IMAGE_BYTES}
            variant="dropzone"
          />

          <div>
            <Label htmlFor="collaborative-name">
              Collaborative Name <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Use a clear name that describes the initiative.</p>
            <Input
              id="collaborative-name"
              className="mt-1.5"
              placeholder="e.g. FemHealth Data Collaborative"
              value={metadata.name}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="collaborative-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Describe the problem this Collaborative addresses, why collaboration is needed, and what the initiative
              aims to achieve.
            </p>
            <div className="mt-1.5">
              <RichTextEditor
                id="collaborative-description"
                value={metadata.descriptionHtml}
                onChange={(html) => onChange('descriptionHtml', html)}
                placeholder="Describe this Collaborative..."
              />
            </div>
            <FieldError message={errors.description} />
          </div>

          <div>
            <Label htmlFor="collaborative-external-url">External Link</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add a link to the Collaborative's website or external resource.
            </p>
            <Input
              id="collaborative-external-url"
              type="url"
              className="mt-1.5"
              placeholder="https://example.org"
              value={metadata.externalUrl}
              aria-invalid={Boolean(errors.externalUrl)}
              onChange={(e) => onChange('externalUrl', e.target.value)}
            />
            <FieldError message={errors.externalUrl} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Optional. Helps people discover this Collaborative.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="collaborative-sectors">Sectors</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-sectors"
                options={SECTOR_OPTIONS}
                values={metadata.sectors}
                onChange={(values) => onChange('sectors', values)}
                placeholder="Select sectors..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collaborative-sdg-goals">SDG Goals</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-sdg-goals"
                options={SDG_GOAL_OPTIONS}
                values={metadata.sdgGoals}
                onChange={(values) => onChange('sdgGoals', values)}
                placeholder="Select SDG goals..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collaborative-tags">Tags</Label>
            <div className="mt-1.5">
              <TagInput
                id="collaborative-tags"
                value={metadata.tags}
                onChange={(tags) => onChange('tags', tags)}
                placeholder="Type a tag and press Enter..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collaborative-geographies">Geography</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-geographies"
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

export { CollaborativeStep1About }
