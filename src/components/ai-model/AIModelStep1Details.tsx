import * as React from 'react'
import { Plus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import {
  DOMAIN_OPTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_SUPPORT_OPTIONS,
  MODEL_TYPE_OPTIONS,
  TARGET_USER_OPTIONS,
  type AIModelFormState,
  type AIModelMetadata,
} from '@/types/ai-model'
import { suggestAIModelClassification, validateAIModelDetails, type AIModelDetailsErrors } from '@/lib/ai-model-validation'

interface AIModelStep1DetailsProps {
  form: AIModelFormState
  otherNames: string[]
  onChange: <K extends keyof AIModelMetadata>(field: K, value: AIModelMetadata[K]) => void
}

function SuggestionRow({
  label,
  options,
  onAdd,
}: {
  label: string
  options: { value: string; label: string }[]
  onAdd: (value: string) => void
}) {
  if (options.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onAdd(option.value)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Plus className="size-3" />
          {option.label}
        </button>
      ))}
    </div>
  )
}

function AIModelStep1Details({ form, otherNames, onChange }: AIModelStep1DetailsProps) {
  const { metadata } = form
  const [touched, setTouched] = React.useState<Partial<Record<keyof AIModelDetailsErrors, boolean>>>({})

  const errors = validateAIModelDetails(form, otherNames)
  const shown = (field: keyof AIModelDetailsErrors) => (touched[field] ? errors[field] : undefined)
  const markTouched = (field: keyof AIModelDetailsErrors) => setTouched((prev) => ({ ...prev, [field]: true }))

  const suggestions = React.useMemo(
    () => suggestAIModelClassification(metadata),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadata.name, metadata.description, metadata.modelType, metadata.domain],
  )

  const suggestedSectorOptions = suggestions.sectors
    .filter((v) => !metadata.sectors.includes(v))
    .map((v) => SECTOR_OPTIONS.find((o) => o.value === v))
    .filter((o): o is { value: string; label: string } => Boolean(o))

  const suggestedTargetUserOptions = suggestions.targetUsers
    .filter((v) => !metadata.targetUsers.includes(v))
    .map((v) => TARGET_USER_OPTIONS.find((o) => o.value === v))
    .filter((o): o is { value: string; label: string } => Boolean(o))

  const suggestedTags = suggestions.tags.filter((t) => !metadata.tags.includes(t))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Model Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the model, who it is for, and how it should be discovered.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Model</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="model-name">
              Model Name <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Use a clear name that identifies the model.</p>
            <Input
              id="model-name"
              className="mt-1.5"
              placeholder="Enter the model name"
              value={metadata.name}
              aria-invalid={Boolean(shown('name'))}
              onChange={(e) => onChange('name', e.target.value)}
              onBlur={() => markTouched('name')}
            />
            <FieldError message={shown('name')} />
          </div>

          <div>
            <Label htmlFor="model-type">
              Model Type <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="model-type"
                options={MODEL_TYPE_OPTIONS}
                value={metadata.modelType}
                onChange={(value) => {
                  onChange('modelType', value)
                  markTouched('modelType')
                }}
                placeholder="Search and select a model type..."
                invalid={Boolean(shown('modelType'))}
              />
            </div>
            <FieldError message={shown('modelType')} />
          </div>

          <div>
            <Label htmlFor="model-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Explain the model in language that is useful to someone discovering or evaluating it.
            </p>
            <Textarea
              id="model-description"
              className="mt-1.5"
              rows={4}
              placeholder="Describe what this model does, the problem it addresses, and what users should know about it."
              value={metadata.description}
              aria-invalid={Boolean(shown('description'))}
              onChange={(e) => onChange('description', e.target.value)}
              onBlur={() => markTouched('description')}
            />
            <FieldError message={shown('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purpose &amp; Audience</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Help people understand who can use this model and what it is intended for.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="model-target-users">Target Users</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="model-target-users"
                options={TARGET_USER_OPTIONS}
                values={metadata.targetUsers}
                onChange={(values) => {
                  onChange('targetUsers', values)
                  markTouched('targetUsers')
                }}
                placeholder="Select target users..."
                invalid={Boolean(shown('targetUsers'))}
              />
            </div>
            <SuggestionRow
              label="Suggested:"
              options={suggestedTargetUserOptions}
              onAdd={(value) => onChange('targetUsers', [...metadata.targetUsers, value])}
            />
            <FieldError message={shown('targetUsers')} />
          </div>

          <div>
            <Label htmlFor="model-intended-use">Intended Use</Label>
            <Textarea
              id="model-intended-use"
              className="mt-1.5"
              rows={3}
              placeholder="Describe what this model is intended to be used for."
              value={metadata.intendedUse}
              aria-invalid={Boolean(shown('intendedUse'))}
              onChange={(e) => onChange('intendedUse', e.target.value)}
              onBlur={() => markTouched('intendedUse')}
            />
            <FieldError message={shown('intendedUse')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Add information that helps people discover and understand this model.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="model-domain">
              Domain <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="model-domain"
                options={DOMAIN_OPTIONS}
                value={metadata.domain}
                onChange={(value) => {
                  onChange('domain', value)
                  markTouched('domain')
                }}
                placeholder="Search and select a domain..."
                invalid={Boolean(shown('domain'))}
              />
            </div>
            <FieldError message={shown('domain')} />
          </div>

          <div>
            <Label htmlFor="model-sectors">
              Sectors <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <MultiSelect
                id="model-sectors"
                options={SECTOR_OPTIONS}
                values={metadata.sectors}
                onChange={(values) => {
                  onChange('sectors', values)
                  markTouched('sectors')
                }}
                placeholder="Select sectors..."
                invalid={Boolean(shown('sectors'))}
              />
            </div>
            <SuggestionRow
              label="Suggested sectors:"
              options={suggestedSectorOptions}
              onAdd={(value) => onChange('sectors', [...metadata.sectors, value])}
            />
            <FieldError message={shown('sectors')} />
          </div>

          <div>
            <Label htmlFor="model-tags">Tags</Label>
            <div className="mt-1.5">
              <TagInput
                id="model-tags"
                value={metadata.tags}
                onChange={(tags) => onChange('tags', tags)}
                placeholder="Type a tag and press Enter..."
              />
            </div>
            {suggestedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Suggested tags:</span>
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onChange('tags', [...metadata.tags, tag])}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Plus className="size-3" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="model-language-support">
              Language Support <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Define how language support applies to this model.</p>
            <div className="mt-1.5">
              <SearchableSelect
                id="model-language-support"
                options={LANGUAGE_SUPPORT_OPTIONS}
                value={metadata.languageSupportType}
                onChange={(value) => {
                  onChange('languageSupportType', value as AIModelMetadata['languageSupportType'])
                  if (value !== 'specific') onChange('languages', [])
                  markTouched('languageSupportType')
                }}
                placeholder="Select language support..."
                invalid={Boolean(shown('languageSupportType'))}
              />
            </div>
            <FieldError message={shown('languageSupportType')} />
          </div>

          {metadata.languageSupportType === 'specific' && (
            <div>
              <Label htmlFor="model-languages">
                Supported Languages <span className="text-destructive">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Select the languages this model is designed to support.</p>
              <div className="mt-1.5">
                <MultiSelect
                  id="model-languages"
                  options={LANGUAGE_OPTIONS}
                  values={metadata.languages}
                  onChange={(values) => {
                    onChange('languages', values)
                    markTouched('languages')
                  }}
                  placeholder="Select supported languages..."
                  invalid={Boolean(shown('languages'))}
                />
              </div>
              <FieldError message={shown('languages')} />
            </div>
          )}

          <div>
            <Label htmlFor="model-geography">Geography</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Only add this if the model is geographically scoped.</p>
            <div className="mt-1.5">
              <MultiSelect
                id="model-geography"
                options={GEOGRAPHY_OPTIONS}
                values={metadata.geographies}
                onChange={(values) => onChange('geographies', values)}
                placeholder="Select geography..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="model-website">Model Website</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Add the model's official website or documentation page.</p>
            <Input
              id="model-website"
              type="url"
              className="mt-1.5"
              placeholder="https://example.org/model"
              value={metadata.website}
              aria-invalid={Boolean(shown('website'))}
              onChange={(e) => onChange('website', e.target.value)}
              onBlur={() => markTouched('website')}
            />
            <FieldError message={shown('website')} />
          </div>

          <div>
            <Label htmlFor="model-license">
              Usage License <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="model-license"
                options={LICENSE_OPTIONS}
                value={metadata.license}
                onChange={(value) => {
                  onChange('license', value)
                  markTouched('license')
                }}
                placeholder="Select a license..."
                invalid={Boolean(shown('license'))}
              />
            </div>
            <FieldError message={shown('license')} />
            {!metadata.license && (
              <button
                type="button"
                onClick={() => onChange('license', 'cc-by-4.0')}
                className="mt-1.5 text-xs font-medium text-primary hover:underline"
              >
                Use suggested default — CC BY 4.0
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AIModelStep1Details }
