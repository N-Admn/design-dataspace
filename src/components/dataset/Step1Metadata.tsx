import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldError } from '@/components/ui/field-error'
import { cn } from '@/lib/utils'
import {
  GEOGRAPHY_OPTIONS,
  LICENSE_OPTIONS,
  SECTOR_OPTIONS,
  TASK_TYPE_OPTIONS,
  PROMPT_DOMAIN_OPTIONS,
  TARGET_LANGUAGE_OPTIONS,
  TARGET_MODEL_TYPE_OPTIONS,
  type DatasetMetadata,
  type DatasetType,
  type PromptDatasetMetadata,
} from '@/types/dataset'
import type { MetadataErrors, PromptDatasetMetadataErrors } from '@/lib/validation'

interface Step1MetadataProps {
  datasetType: DatasetType
  metadata: DatasetMetadata
  errors: MetadataErrors
  onChange: <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => void
  promptMetadata: PromptDatasetMetadata
  promptErrors: PromptDatasetMetadataErrors
  onPromptChange: <K extends keyof PromptDatasetMetadata>(field: K, value: PromptDatasetMetadata[K]) => void
}

function PromptDatasetMetadataFields({
  promptMetadata,
  promptErrors,
  onPromptChange,
}: {
  promptMetadata: PromptDatasetMetadata
  promptErrors: PromptDatasetMetadataErrors
  onPromptChange: <K extends keyof PromptDatasetMetadata>(field: K, value: PromptDatasetMetadata[K]) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Dataset Metadata</CardTitle>
        <p className="mt-1 text-sm font-normal text-text-subdued">
          Additional metadata specific to prompt datasets for AI/ML use cases.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <Label htmlFor="prompt-task-type">
            Task Type <span className="text-text-critical-strong">*</span>
          </Label>
          <div className="mt-1.5">
            <SearchableSelect
              id="prompt-task-type"
              options={TASK_TYPE_OPTIONS}
              value={promptMetadata.taskType}
              onChange={(value) => onPromptChange('taskType', value)}
              placeholder="Search and select a task type..."
              invalid={Boolean(promptErrors.taskType)}
            />
          </div>
          <FieldError message={promptErrors.taskType} />
        </div>

        <div>
          <Label htmlFor="prompt-domain">
            Domain <span className="text-text-critical-strong">*</span>
          </Label>
          <div className="mt-1.5">
            <SearchableSelect
              id="prompt-domain"
              options={PROMPT_DOMAIN_OPTIONS}
              value={promptMetadata.domain}
              onChange={(value) => onPromptChange('domain', value)}
              placeholder="Search and select a domain..."
              invalid={Boolean(promptErrors.domain)}
            />
          </div>
          <FieldError message={promptErrors.domain} />
        </div>

        <div>
          <Label htmlFor="prompt-target-languages">
            Target Languages <span className="text-text-critical-strong">*</span>
          </Label>
          <div className="mt-1.5">
            <MultiSelect
              id="prompt-target-languages"
              options={TARGET_LANGUAGE_OPTIONS}
              values={promptMetadata.targetLanguages}
              onChange={(values) => onPromptChange('targetLanguages', values)}
              placeholder="Select target languages..."
              searchPlaceholder="Search languages..."
              invalid={Boolean(promptErrors.targetLanguages)}
            />
          </div>
          <FieldError message={promptErrors.targetLanguages} />
        </div>

        <div>
          <Label htmlFor="prompt-target-model-types">
            Target Model Types <span className="text-text-critical-strong">*</span>
          </Label>
          <div className="mt-1.5">
            <MultiSelect
              id="prompt-target-model-types"
              options={TARGET_MODEL_TYPE_OPTIONS}
              values={promptMetadata.targetModelTypes}
              onChange={(values) => onPromptChange('targetModelTypes', values)}
              placeholder="Select target model types..."
              searchPlaceholder="Search model types..."
              invalid={Boolean(promptErrors.targetModelTypes)}
            />
          </div>
          <FieldError message={promptErrors.targetModelTypes} />
        </div>
      </CardContent>
    </Card>
  )
}

function Step1Metadata({ datasetType, metadata, errors, onChange, promptMetadata, promptErrors, onPromptChange }: Step1MetadataProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="dataset-name">
              Dataset name <span className="text-text-critical-strong">*</span>
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
              Description <span className="text-text-critical-strong">*</span>
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
              Sector <span className="text-text-critical-strong">*</span>
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
            <p className="mt-1.5 text-xs text-text-subdued">
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
            <Label htmlFor="source-website">Source website</Label>
            <Input
              id="source-website"
              className="mt-1.5"
              placeholder="http://data.city.name.gov/dataset"
              value={metadata.sourceWebsite}
              onChange={(e) => onChange('sourceWebsite', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="create-date">Dataset creation date</Label>
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
              Access type <span className="text-text-critical-strong">*</span>
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
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-border-input p-4 transition-colors',
                  metadata.accessType === 'open'
                    ? 'border-border-brand bg-action-primary-default/5'
                    : 'hover:border-border-brand/40',
                )}
              >
                <RadioGroupItem value="open" id="access-open" className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-text-default">Open Access</span>
                  <span className="block text-xs text-text-subdued">
                    Anyone can browse and download
                  </span>
                </span>
              </Label>

              <Label
                htmlFor="access-restricted"
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-border-input p-4 transition-colors',
                  metadata.accessType === 'restricted'
                    ? 'border-border-brand bg-action-primary-default/5'
                    : 'hover:border-border-brand/40',
                )}
              >
                <RadioGroupItem value="restricted" id="access-restricted" className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-text-default">
                    Restricted Access
                  </span>
                  <span className="block text-xs text-text-subdued">
                    Requires approval to access
                  </span>
                </span>
              </Label>
            </RadioGroup>
            <FieldError message={errors.accessType} />
          </div>

          <div>
            <Label htmlFor="dataset-license">
              License <span className="text-text-critical-strong">*</span>
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
              <p className="mt-1.5 text-xs text-text-subdued">
                CC BY 4.0 is recommended for open government data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {datasetType === 'prompt_dataset' && (
        <PromptDatasetMetadataFields
          promptMetadata={promptMetadata}
          promptErrors={promptErrors}
          onPromptChange={onPromptChange}
        />
      )}
    </div>
  )
}

export { Step1Metadata }
