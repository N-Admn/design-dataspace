import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { TagInput } from '@/components/ui/tag-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldError } from '@/components/ui/field-error'
import { cn } from '@/lib/utils'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  SECTOR_OPTIONS,
  type DatasetMetadata,
} from '@/types/dataset'
import type { MetadataErrors } from '@/lib/validation'

interface Step1MetadataProps {
  metadata: DatasetMetadata
  errors: MetadataErrors
  onChange: <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => void
}

function Step1Metadata({ metadata, errors, onChange }: Step1MetadataProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="dataset-name">
              Dataset Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dataset-name"
              className="mt-1.5"
              placeholder="e.g. Municipal Expenditure Budget 2024"
              value={metadata.name}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="dataset-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="dataset-description"
              className="mt-1.5"
              rows={4}
              placeholder="Describe what this dataset contains, its purpose, time range covered, and any important context for potential users..."
              value={metadata.description}
              aria-invalid={Boolean(errors.description)}
              onChange={(e) => onChange('description', e.target.value)}
            />
            <FieldError message={errors.description} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="dataset-sector">
              Sector <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="dataset-sector"
                options={SECTOR_OPTIONS}
                value={metadata.sector}
                onChange={(value) => onChange('sector', value)}
                placeholder="Search and select a sector..."
                invalid={Boolean(errors.sector)}
              />
            </div>
            <FieldError message={errors.sector} />
          </div>

          <div>
            <Label htmlFor="dataset-geography">Geography</Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="dataset-geography"
                options={GEOGRAPHY_OPTIONS}
                value={metadata.geography}
                onChange={(value) => onChange('geography', value)}
                placeholder="Search and select geography..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dataset-tags">Tags</Label>
            <div className="mt-1.5">
              <TagInput
                id="dataset-tags"
                value={metadata.tags}
                onChange={(tags) => onChange('tags', tags)}
                placeholder="Type a tag and press Enter..."
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Press Enter to add. Tags improve discoverability.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="source-website">Source Website</Label>
            <Input
              id="source-website"
              className="mt-1.5"
              placeholder="http://data.city.name.gov/dataset"
              value={metadata.sourceWebsite}
              onChange={(e) => onChange('sourceWebsite', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="create-date">Dataset Creation Date</Label>
            <Input
              id="create-date"
              type="date"
              className="mt-1.5"
              placeholder="dd/mm/yyyy"
              value={metadata.createDate}
              onChange={(e) => onChange('createDate', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label>
              Access Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2"
              value={metadata.accessType}
              onValueChange={(value) => onChange('accessType', value as DatasetMetadata['accessType'])}
              aria-invalid={Boolean(errors.accessType)}
            >
              <Label
                htmlFor="access-open"
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors',
                  metadata.accessType === 'open'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/40',
                )}
              >
                <RadioGroupItem value="open" id="access-open" className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Open Access</span>
                  <span className="block text-xs text-muted-foreground">
                    Anyone can browse and download
                  </span>
                </span>
              </Label>

              <Label
                htmlFor="access-restricted"
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors',
                  metadata.accessType === 'restricted'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/40',
                )}
              >
                <RadioGroupItem value="restricted" id="access-restricted" className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    Restricted Access
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Requires approval to access
                  </span>
                </span>
              </Label>
            </RadioGroup>
            <FieldError message={errors.accessType} />
          </div>

          <div>
            <Label htmlFor="dataset-license">
              License <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="dataset-license"
                options={LICENSE_OPTIONS}
                value={metadata.license}
                onChange={(value) => onChange('license', value)}
                placeholder="Select a license..."
                invalid={Boolean(errors.license)}
              />
            </div>
            <FieldError message={errors.license} />
            {!errors.license && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                CC BY 4.0 is recommended for open government data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { Step1Metadata }
