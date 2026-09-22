import * as React from 'react'
import { Plus, Trash2, User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { AddContributorForm } from '@/components/usecase/AddContributorForm'
import { SpeakerSearchField } from '@/components/event/SpeakerSearchField'
import { useToast } from '@/components/ui/toast'
import { MOCK_PEOPLE, type MockPerson } from '@/lib/mock-people'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS, type PublicationMetadata } from '@/types/publication'
import type { PublicationDetailsErrors } from '@/lib/publication-validation'

interface PublicationStep1DetailsProps {
  metadata: PublicationMetadata
  errors: PublicationDetailsErrors
  onChange: <K extends keyof PublicationMetadata>(field: K, value: PublicationMetadata[K]) => void
}

function PublicationStep1Details({ metadata, errors, onChange }: PublicationStep1DetailsProps) {
  const toast = useToast()
  const [showContributorForm, setShowContributorForm] = React.useState(false)

  /** Add a CivicDataSpace contributor straight to the Contributors list. Mirrors
   * how Use Case's Contributors section connects a directory profile. */
  const addContributorFromDirectory = (person: MockPerson) => {
    onChange('contributors', [
      ...metadata.contributors,
      { id: `contributor-${person.id}`, name: person.name, role: person.role ?? '', organisation: person.organisation },
    ])
    toast({ title: 'Contributor added', description: `"${person.name}" added and connected.`, variant: 'success' })
  }

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

          <div>
            <Label htmlFor="publication-date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="publication-date"
              type="date"
              className="mt-1.5 sm:max-w-xs"
              value={metadata.date}
              aria-invalid={Boolean(errors.date)}
              onChange={(e) => onChange('date', e.target.value)}
            />
            <FieldError message={errors.date} />
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
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Contributors</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add the people and organisations involved in creating this content.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowContributorForm(true)}>
            <Plus className="size-4" />
            Add Contributor
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label className="sr-only">Search Contributors</Label>
          <SpeakerSearchField
            people={MOCK_PEOPLE}
            excludeNames={metadata.contributors.map((c) => c.name)}
            placeholder="Search contributors..."
            onSelect={addContributorFromDirectory}
          />
          {metadata.contributors.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No contributors added yet.</p>
          ) : (
            metadata.contributors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {c.image?.dataUrl ? (
                  <img src={c.image.dataUrl} alt="" className="size-9 shrink-0 rounded-full border border-border object-cover" />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  {[c.role, c.organisation].filter(Boolean).length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {[c.role, c.organisation].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.name}`}
                  onClick={() =>
                    onChange(
                      'contributors',
                      metadata.contributors.filter((x) => x.id !== c.id),
                    )
                  }
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
          <FieldError message={errors.contributors} />
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

      <AddContributorForm
        open={showContributorForm}
        onOpenChange={setShowContributorForm}
        contentLabel="Publication"
        rolePlaceholder="e.g. Author, Editor, Director"
        onAdd={(contributor) => {
          onChange('contributors', [...metadata.contributors, { id: `contributor-${Date.now()}`, ...contributor }])
          setShowContributorForm(false)
          toast({ title: 'Contributor added', description: `"${contributor.name}" added and connected.`, variant: 'success' })
        }}
      />
    </div>
  )
}

export { PublicationStep1Details }
