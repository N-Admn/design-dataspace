import * as React from 'react'
import { Pencil } from 'lucide-react'

import { useOrganisation } from '@/hooks/use-organisation'
import { useAppData } from '@/context/AppDataContext'
import { OrganisationNotFound } from '@/components/organisation/OrganisationNotFound'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { useToast } from '@/components/ui/toast'
import { validateOrganisationMetadata, isOrganisationMetadataValid } from '@/lib/organisation-validation'
import {
  ORGANISATION_NAME_MAX_LENGTH,
  ORGANISATION_TYPE_OPTIONS,
  type OrganisationMetadata,
} from '@/types/organisation-workspace'

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{label}</p>
      <p className="mt-1 text-sm text-text-default">{value || '—'}</p>
    </div>
  )
}

function OrganisationProfilePage() {
  const { organisation, permissions } = useOrganisation()
  const { updateOrganisationWorkspaceMetadata } = useAppData()
  const toast = useToast()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<OrganisationMetadata | null>(null)
  const [showErrors, setShowErrors] = React.useState(false)

  if (!organisation) return <OrganisationNotFound />

  const startEditing = () => {
    setDraft(organisation.metadata)
    setShowErrors(false)
    setEditing(true)
  }

  const update = <K extends keyof OrganisationMetadata>(field: K, value: OrganisationMetadata[K]) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = () => {
    if (!draft) return
    if (!isOrganisationMetadataValid(draft)) {
      setShowErrors(true)
      return
    }
    updateOrganisationWorkspaceMetadata(organisation.id, { ...draft, name: draft.name.trim() })
    setEditing(false)
    toast({ title: 'Organisation profile updated', variant: 'success' })
  }

  const errors = draft ? validateOrganisationMetadata(draft) : {}
  const visibleErrors = showErrors ? errors : {}
  const typeLabel = ORGANISATION_TYPE_OPTIONS.find((o) => o.value === organisation.metadata.type)?.label ?? '—'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organisation Profile"
        description={
          permissions.canEditOrganisation
            ? 'Manage this organisation’s public profile information.'
            : 'View this organisation’s profile information.'
        }
        action={
          permissions.canEditOrganisation &&
          !editing && (
            <Button type="button" onClick={startEditing}>
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {editing && draft ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="org-profile-name">
                    Organisation name <span className="text-text-critical-strong">*</span>
                  </Label>
                  <span className="text-xs text-text-subdued">
                    {draft.name.length}/{ORGANISATION_NAME_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="org-profile-name"
                  className="mt-1.5"
                  value={draft.name}
                  maxLength={ORGANISATION_NAME_MAX_LENGTH}
                  aria-invalid={Boolean(visibleErrors.name)}
                  onChange={(e) => update('name', e.target.value)}
                />
                <FieldError message={visibleErrors.name} />
              </div>

              <div>
                <Label htmlFor="org-profile-description">Description</Label>
                <Textarea
                  id="org-profile-description"
                  className="mt-1.5"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="org-profile-type">Organisation type</Label>
                <div className="mt-1.5">
                  <SearchableSelect
                    id="org-profile-type"
                    options={ORGANISATION_TYPE_OPTIONS}
                    value={draft.type}
                    onChange={(value) => update('type', value)}
                    placeholder="Select an organisation type..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="org-profile-website">Website</Label>
                <Input
                  id="org-profile-website"
                  className="mt-1.5"
                  placeholder="https://example.org"
                  value={draft.website}
                  onChange={(e) => update('website', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border-default pt-5">
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <ReadOnlyField label="Organisation name" value={organisation.metadata.name} />
              <ReadOnlyField label="Description" value={organisation.metadata.description} />
              <ReadOnlyField label="Organisation type" value={typeLabel} />
              <ReadOnlyField label="Website" value={organisation.metadata.website} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { OrganisationProfilePage }
