import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { cn } from '@/lib/utils'
import { LICENSE_OPTIONS, type DatasetMetadata } from '@/types/dataset'
import type { MiniDatasetLicenseErrors } from '@/lib/mini-dataset-validation'

interface DatasetLicenseAccessProps {
  metadata: DatasetMetadata
  errors: MiniDatasetLicenseErrors
  onChange: <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => void
}

function DatasetLicenseAccess({ metadata, errors, onChange }: DatasetLicenseAccessProps) {
  return (
    <div className="flex flex-col gap-5">
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
            htmlFor="mini-access-open"
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors',
              metadata.accessType === 'open' ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
            )}
          >
            <RadioGroupItem value="open" id="mini-access-open" className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-foreground">Open Access</span>
              <span className="block text-xs text-muted-foreground">Anyone can browse and download</span>
            </span>
          </Label>

          <Label
            htmlFor="mini-access-restricted"
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors',
              metadata.accessType === 'restricted' ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
            )}
          >
            <RadioGroupItem value="restricted" id="mini-access-restricted" className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-foreground">Restricted Access</span>
              <span className="block text-xs text-muted-foreground">Requires approval to access</span>
            </span>
          </Label>
        </RadioGroup>
        <FieldError message={errors.accessType} />
      </div>

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
    </div>
  )
}

export { DatasetLicenseAccess }
