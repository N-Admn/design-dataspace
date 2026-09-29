import * as React from 'react'
import { Building2, Pencil } from 'lucide-react'

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
import { FileUploadField } from '@/components/shared/FileUploadField'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { MAX_IMAGE_BYTES } from '@/lib/generic-upload'
import { validateOrganisationMetadata, isOrganisationMetadataValid, ORGANISATION_DESCRIPTION_MAX_LENGTH } from '@/lib/organisation-validation'
import {
  ORGANISATION_NAME_MAX_LENGTH,
  ORGANISATION_TYPE_OPTIONS,
  type OrganisationMetadata,
} from '@/types/organisation-workspace'

const LOGO_EXTENSIONS = ['jpg', 'jpeg', 'png']

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{label}</p>
      <p className="mt-1 text-sm text-text-default">{value || '—'}</p>
    </div>
  )
}

function ReadOnlyLinkField({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-text-brand hover:underline">
          {url}
        </a>
      ) : (
        <p className="mt-1 text-sm text-text-default">—</p>
      )}
    </div>
  )
}

function OrganisationProfilePage() {
  const { organisation, permissions } = useOrganisation()
  const { updateOrganisationWorkspaceMetadata } = useAppData()
  const confirm = useConfirm()
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

  const hasUnsavedChanges = draft !== null && JSON.stringify(draft) !== JSON.stringify(organisation.metadata)

  const handleCancel = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Unsaved changes',
        description: 'You have unsaved changes. Are you sure you want to leave?',
        confirmLabel: 'Discard changes',
        cancelLabel: 'Stay',
        variant: 'destructive',
      })
      if (!ok) return
    }
    setEditing(false)
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
  const meta = organisation.metadata

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
          <CardTitle>Organisation identity</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Basic information people will use to identify this organisation.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {editing && draft ? (
            <>
              <FileUploadField
                id="org-profile-logo"
                label="Organisation logo"
                value={draft.logo}
                onChange={(asset) => update('logo', asset)}
                extensions={LOGO_EXTENSIONS}
                maxBytes={MAX_IMAGE_BYTES}
                roundedFull
                uploadLabel="Upload logo"
                fallbackIcon={Building2}
              />

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
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {meta.logo?.dataUrl ? (
                  <img src={meta.logo.dataUrl} alt="" className="size-16 rounded-full border border-border-default object-cover" />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-surface-accent text-text-on-accent">
                    <Building2 className="size-7" />
                  </div>
                )}
                <div className="flex-1">
                  <ReadOnlyField label="Organisation name" value={meta.name} />
                </div>
              </div>
              <ReadOnlyField label="Organisation type" value={typeLabel} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organisation details</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Helps people understand and contact this organisation.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {editing && draft ? (
            <>
              <div>
                <Label htmlFor="org-profile-description">Description</Label>
                <Textarea
                  id="org-profile-description"
                  className="mt-1.5"
                  rows={4}
                  maxLength={ORGANISATION_DESCRIPTION_MAX_LENGTH}
                  value={draft.description}
                  aria-invalid={Boolean(visibleErrors.description)}
                  onChange={(e) => update('description', e.target.value)}
                />
                <FieldError message={visibleErrors.description} />
              </div>

              <div>
                <Label htmlFor="org-profile-website">Website</Label>
                <Input
                  id="org-profile-website"
                  className="mt-1.5"
                  placeholder="https://example.org"
                  value={draft.website}
                  aria-invalid={Boolean(visibleErrors.website)}
                  onChange={(e) => update('website', e.target.value)}
                />
                <FieldError message={visibleErrors.website} />
              </div>

              <div>
                <Label htmlFor="org-profile-contact-email">Contact email</Label>
                <Input
                  id="org-profile-contact-email"
                  type="email"
                  className="mt-1.5"
                  placeholder="contact@example.org"
                  value={draft.contactEmail}
                  aria-invalid={Boolean(visibleErrors.contactEmail)}
                  onChange={(e) => update('contactEmail', e.target.value)}
                />
                <FieldError message={visibleErrors.contactEmail} />
              </div>

              <div>
                <Label htmlFor="org-profile-location">Location</Label>
                <Input
                  id="org-profile-location"
                  className="mt-1.5"
                  placeholder="City, Country"
                  value={draft.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <ReadOnlyField label="Description" value={meta.description} />
              <ReadOnlyLinkField label="Website" url={meta.website} />
              <ReadOnlyField label="Contact email" value={meta.contactEmail} />
              <ReadOnlyField label="Location" value={meta.location} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social profiles</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Links to the organisation’s public profiles.
          </p>
        </CardHeader>
        <CardContent>
          {editing && draft ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="org-profile-linkedin">LinkedIn</Label>
                <Input
                  id="org-profile-linkedin"
                  className="mt-1.5"
                  placeholder="https://linkedin.com/company/..."
                  value={draft.linkedin}
                  aria-invalid={Boolean(visibleErrors.linkedin)}
                  onChange={(e) => update('linkedin', e.target.value)}
                />
                <FieldError message={visibleErrors.linkedin} />
              </div>
              <div>
                <Label htmlFor="org-profile-github">GitHub</Label>
                <Input
                  id="org-profile-github"
                  className="mt-1.5"
                  placeholder="https://github.com/..."
                  value={draft.github}
                  aria-invalid={Boolean(visibleErrors.github)}
                  onChange={(e) => update('github', e.target.value)}
                />
                <FieldError message={visibleErrors.github} />
              </div>
              <div>
                <Label htmlFor="org-profile-x">X</Label>
                <Input
                  id="org-profile-x"
                  className="mt-1.5"
                  placeholder="https://x.com/..."
                  value={draft.x}
                  aria-invalid={Boolean(visibleErrors.x)}
                  onChange={(e) => update('x', e.target.value)}
                />
                <FieldError message={visibleErrors.x} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <ReadOnlyLinkField label="LinkedIn" url={meta.linkedin} />
              <ReadOnlyLinkField label="GitHub" url={meta.github} />
              <ReadOnlyLinkField label="X" url={meta.x} />
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

export { OrganisationProfilePage }
