import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldError } from '@/components/ui/field-error'
import { cn } from '@/lib/utils'
import { LICENSE_OPTIONS, SECTOR_OPTIONS, type DatasetMetadata, type DatasetResource } from '@/types/dataset'
import type { MiniDatasetLicenseErrors } from '@/lib/mini-dataset-validation'

interface DatasetLicenseAccessProps {
  metadata: DatasetMetadata
  resources: DatasetResource[]
  errors: MiniDatasetLicenseErrors
  onChange: <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => void
  onBack: () => void
  onSubmit: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function resourceSummary(resources: DatasetResource[]): string {
  if (resources.length === 0) return '—'
  return resources
    .map((r) => (r.type === 'csv' ? r.file?.name : r.url) ?? '')
    .filter(Boolean)
    .join(', ')
}

function DatasetLicenseAccess({
  metadata,
  resources,
  errors,
  onChange,
  onBack,
  onSubmit,
}: DatasetLicenseAccessProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="mini-dataset-license">
          License <span className="text-destructive">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchableSelect
            id="mini-dataset-license"
            options={LICENSE_OPTIONS}
            value={metadata.license}
            onChange={(value) => onChange('license', value)}
            placeholder="Select a license..."
            invalid={Boolean(errors.license)}
          />
        </div>
        <FieldError message={errors.license} />
      </div>

      <div>
        <Label>
          Visibility <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          className="mt-1.5 grid grid-cols-2 gap-3"
          value={metadata.accessType}
          onValueChange={(value) => onChange('accessType', value as DatasetMetadata['accessType'])}
        >
          <Label
            htmlFor="mini-visibility-open"
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-lg border border-input p-3 text-sm font-medium transition-colors',
              metadata.accessType === 'open' ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/40',
            )}
          >
            <RadioGroupItem value="open" id="mini-visibility-open" />
            Open
          </Label>
          <Label
            htmlFor="mini-visibility-restricted"
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-lg border border-input p-3 text-sm font-medium transition-colors',
              metadata.accessType === 'restricted'
                ? 'border-primary bg-primary/5 text-primary'
                : 'hover:border-primary/40',
            )}
          >
            <RadioGroupItem value="restricted" id="mini-visibility-restricted" />
            Restricted
          </Label>
        </RadioGroup>
        <FieldError message={errors.accessType} />
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Review</p>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Dataset Name</dt>
            <dd className="text-foreground">{metadata.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Sector</dt>
            <dd className="text-foreground">{metadata.sector ? optionLabel(SECTOR_OPTIONS, metadata.sector) : '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd className="text-foreground">{metadata.description || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Resource</dt>
            <dd className="truncate text-foreground">{resourceSummary(resources)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">License</dt>
            <dd className="text-foreground">{metadata.license ? optionLabel(LICENSE_OPTIONS, metadata.license) : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Visibility</dt>
            <dd className="text-foreground">
              {metadata.accessType === 'open' ? 'Open' : metadata.accessType === 'restricted' ? 'Restricted' : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit}>
          Create &amp; Add Dataset
        </Button>
      </div>
    </div>
  )
}

export { DatasetLicenseAccess }
