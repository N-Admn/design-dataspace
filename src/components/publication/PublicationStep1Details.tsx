import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/ui/tag-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationMetadata } from '@/types/publication'
import type { PublicationDetailsErrors } from '@/lib/publication-validation'

interface PublicationStep1DetailsProps {
  metadata: PublicationMetadata
  errors: PublicationDetailsErrors
  onChange: <K extends keyof PublicationMetadata>(field: K, value: PublicationMetadata[K]) => void
}

function PublicationStep1Details({ metadata, errors, onChange }: PublicationStep1DetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="publication-name">
              Resource Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="publication-name"
              className="mt-1.5"
              placeholder="e.g. State of Open Water Data in South Asia"
              value={metadata.name}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="publication-description">
              Description / Abstract <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="publication-description"
              className="mt-1.5"
              rows={4}
              placeholder="Summarize the findings, report or research this Publication contains..."
              value={metadata.description}
              aria-invalid={Boolean(errors.description)}
              onChange={(e) => onChange('description', e.target.value)}
            />
            <FieldError message={errors.description} />
          </div>

          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="publication-authors">
                Author Name(s) <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <TagInput
                  id="publication-authors"
                  value={metadata.authors}
                  onChange={(authors) => onChange('authors', authors)}
                  placeholder="Type a name and press Enter..."
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">May differ from the account or organization publishing this.</p>
              <FieldError message={errors.authors} />
            </div>
            <div className="flex-1">
              <Label htmlFor="publication-date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="publication-date"
                type="date"
                className="mt-1.5"
                value={metadata.date}
                aria-invalid={Boolean(errors.date)}
                onChange={(e) => onChange('date', e.target.value)}
              />
              <FieldError message={errors.date} />
            </div>
          </div>

          <div>
            <Label htmlFor="publication-external-link">External Source Link</Label>
            <Input
              id="publication-external-link"
              className="mt-1.5"
              placeholder="https://example.org/original-source"
              value={metadata.externalLink}
              onChange={(e) => onChange('externalLink', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="publication-resource-type">
              Resource Type <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="publication-resource-type"
                options={RESOURCE_TYPE_OPTIONS}
                value={metadata.resourceType}
                onChange={(value) => onChange('resourceType', value)}
                placeholder="Select a resource type..."
                invalid={Boolean(errors.resourceType)}
              />
            </div>
            <FieldError message={errors.resourceType} />
          </div>

          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="publication-sector">
                Sector / Domain <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="publication-sector"
                  options={SECTOR_OPTIONS}
                  value={metadata.sector}
                  onChange={(value) => onChange('sector', value)}
                  placeholder="Search and select a sector..."
                  invalid={Boolean(errors.sector)}
                />
              </div>
              <FieldError message={errors.sector} />
            </div>
            <div className="flex-1">
              <Label htmlFor="publication-geography">
                Geography <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="publication-geography"
                  options={GEOGRAPHY_OPTIONS}
                  value={metadata.geography}
                  onChange={(value) => onChange('geography', value)}
                  placeholder="Search and select geography..."
                  invalid={Boolean(errors.geography)}
                />
              </div>
              <FieldError message={errors.geography} />
            </div>
          </div>

          <div>
            <Label htmlFor="publication-usage-rights">
              Usage Rights <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="publication-usage-rights"
                options={LICENSE_OPTIONS}
                value={metadata.usageRights}
                onChange={(value) => onChange('usageRights', value)}
                placeholder="Select usage rights..."
                invalid={Boolean(errors.usageRights)}
              />
            </div>
            <FieldError message={errors.usageRights} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { PublicationStep1Details }
