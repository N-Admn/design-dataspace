import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { Button } from '@/components/ui/button'
import { SECTOR_OPTIONS, type DatasetMetadata } from '@/types/dataset'
import type { MiniDatasetBasicErrors } from '@/lib/mini-dataset-validation'

interface DatasetBasicDetailsProps {
  metadata: DatasetMetadata
  errors: MiniDatasetBasicErrors
  onChange: <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => void
  onCancel: () => void
  onNext: () => void
}

function DatasetBasicDetails({ metadata, errors, onChange, onCancel, onNext }: DatasetBasicDetailsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="mini-dataset-name">
          Dataset Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="mini-dataset-name"
          className="mt-1.5"
          placeholder="e.g. Maternal Health Indicator Dataset"
          value={metadata.name}
          aria-invalid={Boolean(errors.name)}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <Label htmlFor="mini-dataset-description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="mini-dataset-description"
          className="mt-1.5"
          rows={4}
          placeholder="Briefly describe what this dataset contains and how it relates to the event."
          value={metadata.description}
          aria-invalid={Boolean(errors.description)}
          onChange={(e) => onChange('description', e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>

      <div>
        <Label htmlFor="mini-dataset-sector">
          Sector <span className="text-destructive">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchableSelect
            id="mini-dataset-sector"
            options={SECTOR_OPTIONS}
            value={metadata.sector}
            onChange={(value) => onChange('sector', value)}
            placeholder="Select or search sector..."
            invalid={Boolean(errors.sector)}
          />
        </div>
        <FieldError message={errors.sector} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

export { DatasetBasicDetails }
