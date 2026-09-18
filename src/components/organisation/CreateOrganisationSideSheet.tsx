import * as React from 'react'
import { Building2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FieldError } from '@/components/ui/field-error'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { CollapsibleFormSection } from '@/components/organisation/FormSection'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { MAX_IMAGE_BYTES } from '@/lib/generic-upload'
import { useAppData } from '@/context/AppDataContext'
import {
  validateCreateOrganisationForm,
  areMandatoryCreateFieldsFilled,
  ORGANISATION_DESCRIPTION_MAX_LENGTH,
  type CreateOrganisationErrors,
} from '@/lib/organisation-validation'
import {
  ORGANISATION_NAME_MAX_LENGTH,
  ORGANISATION_TYPE_OPTIONS,
  emptyOrganisationMetadata,
  type OrganisationMetadata,
  type OrganisationRecord,
} from '@/types/organisation-workspace'

const LOGO_EXTENSIONS = ['jpg', 'jpeg', 'png']

/** Focus/expand order for jumping to the first invalid field on submit — the
 * two collapsible-section fields (description/website/contactEmail/location →
 * Organisation Profile; linkedin/github/x → Social Profiles) are expanded
 * before focus moves, so the target is actually visible when focused. */
const FIELD_FOCUS_ORDER: (keyof CreateOrganisationErrors)[] = [
  'logo',
  'name',
  'type',
  'description',
  'website',
  'contactEmail',
  'linkedin',
  'github',
  'x',
]

const FIELD_DOM_IDS: Record<string, string> = {
  logo: 'org-logo-field',
  name: 'org-name',
  type: 'org-type',
  description: 'org-description',
  website: 'org-website',
  contactEmail: 'org-contact-email',
  linkedin: 'org-linkedin',
  github: 'org-github',
  x: 'org-x',
}

const PROFILE_SECTION_FIELDS = new Set(['description', 'website', 'contactEmail'])
const SOCIAL_SECTION_FIELDS = new Set(['linkedin', 'github', 'x'])

interface CreateOrganisationSideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (organisation: OrganisationRecord) => void
}

function CreateOrganisationSideSheet({ open, onOpenChange, onCreated }: CreateOrganisationSideSheetProps) {
  const { createOrganisationWorkspace, organisationWorkspaces } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()

  const [form, setForm] = React.useState<OrganisationMetadata>(emptyOrganisationMetadata)
  const [showErrors, setShowErrors] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [socialOpen, setSocialOpen] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm(emptyOrganisationMetadata)
      setShowErrors(false)
      setSubmitting(false)
      setSubmitError(null)
      setProfileOpen(false)
      setSocialOpen(false)
    }
  }, [open])

  const hasLogo = form.logo !== null
  const existingNames = organisationWorkspaces.map((o) => o.metadata.name)
  const errors = validateCreateOrganisationForm(form, hasLogo, existingNames)
  const visibleErrors = showErrors ? errors : {}
  const canSubmit = areMandatoryCreateFieldsFilled(form, hasLogo)
  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(emptyOrganisationMetadata)

  const update = <K extends keyof OrganisationMetadata>(field: K, value: OrganisationMetadata[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const requestClose = async () => {
    if (submitting) return
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard Changes?',
        description: 'You have unsaved changes. If you leave now, your changes will be lost.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (!ok) return
    }
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (submitting) return
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      if (Object.keys(errors).some((key) => PROFILE_SECTION_FIELDS.has(key))) setProfileOpen(true)
      if (Object.keys(errors).some((key) => SOCIAL_SECTION_FIELDS.has(key))) setSocialOpen(true)
      requestAnimationFrame(() => {
        const firstKey = FIELD_FOCUS_ORDER.find((key) => errors[key])
        if (firstKey) document.getElementById(FIELD_DOM_IDS[firstKey])?.focus()
      })
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const org = createOrganisationWorkspace({ ...form, name: form.name.trim() })
      setSubmitting(false)
      onCreated(org)
    } catch {
      setSubmitting(false)
      const message = 'We couldn’t create the organisation. Please try again.'
      setSubmitError(message)
      toast({ title: message, variant: 'error' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create Organisation</DialogTitle>
          <DialogDescription>
            Create an organisation to manage shared contributions on CivicDataSpace. You’ll become an admin by
            default and can invite members or assign roles later.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            {submitError && (
              <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                <p className="text-sm font-medium text-text-critical-strong">{submitError}</p>
              </div>
            )}

            {/* Organisation identity — the three mandatory fields, grouped together.
                Logo appears first, per the CivicDataSpace pattern of image-upload-first. */}
            <div id="org-logo-field" tabIndex={-1} className="flex flex-col gap-5 outline-none">
              <SectionHeader
                title="Organisation identity"
                description="Add the basic information people will use to identify this organisation."
              />
              <FileUploadField
                id="org-logo"
                label="Organisation logo"
                required
                value={form.logo}
                onChange={(asset) => update('logo', asset)}
                extensions={LOGO_EXTENSIONS}
                maxBytes={MAX_IMAGE_BYTES}
                roundedFull
                error={visibleErrors.logo}
                fallbackIcon={Building2}
                variant="dropzone"
                dropzoneTitle="Drag and drop a logo here, or click to browse."
              />

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="org-name">
                    Organisation name <span className="text-text-critical-strong">*</span>
                  </Label>
                  <span className="text-xs text-text-subdued">
                    {form.name.length}/{ORGANISATION_NAME_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="org-name"
                  className="mt-1.5"
                  placeholder="Enter organisation name"
                  value={form.name}
                  maxLength={ORGANISATION_NAME_MAX_LENGTH}
                  aria-invalid={Boolean(visibleErrors.name)}
                  aria-describedby={visibleErrors.name ? 'org-name-error' : undefined}
                  onChange={(e) => update('name', e.target.value)}
                />
                <FieldError id="org-name-error" message={visibleErrors.name} />
              </div>

              <div>
                <Label htmlFor="org-type">
                  Organisation type <span className="text-text-critical-strong">*</span>
                </Label>
                <div className="mt-1.5">
                  <SearchableSelect
                    id="org-type"
                    options={ORGANISATION_TYPE_OPTIONS}
                    value={form.type}
                    onChange={(value) => update('type', value)}
                    placeholder="Select an organisation type..."
                    invalid={Boolean(visibleErrors.type)}
                  />
                </div>
                <FieldError id="org-type-error" message={visibleErrors.type} />
              </div>
            </div>

            {/* Organisation details (optional, collapsed by default) */}
            <CollapsibleFormSection
              id="org-profile-section"
              title="Organisation details"
              description="Add more information to help people understand and contact this organisation. You can update these details later from Organisation Profile or Organisation Settings."
              open={profileOpen}
              onOpenChange={setProfileOpen}
            >
              <div>
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  className="mt-1.5"
                  rows={4}
                  placeholder="Describe the organisation and its work"
                  value={form.description}
                  maxLength={ORGANISATION_DESCRIPTION_MAX_LENGTH}
                  aria-invalid={Boolean(visibleErrors.description)}
                  aria-describedby={visibleErrors.description ? 'org-description-error' : undefined}
                  onChange={(e) => update('description', e.target.value)}
                />
                <FieldError id="org-description-error" message={visibleErrors.description} />
              </div>

              <div>
                <Label htmlFor="org-website">Homepage</Label>
                <Input
                  id="org-website"
                  className="mt-1.5"
                  placeholder="Enter organisation homepage"
                  value={form.website}
                  aria-invalid={Boolean(visibleErrors.website)}
                  aria-describedby={visibleErrors.website ? 'org-website-error' : undefined}
                  onChange={(e) => update('website', e.target.value)}
                />
                <FieldError id="org-website-error" message={visibleErrors.website} />
              </div>

              <div>
                <Label htmlFor="org-contact-email">Contact email</Label>
                <Input
                  id="org-contact-email"
                  type="email"
                  className="mt-1.5"
                  placeholder="Enter organisation contact email"
                  value={form.contactEmail}
                  aria-invalid={Boolean(visibleErrors.contactEmail)}
                  aria-describedby={visibleErrors.contactEmail ? 'org-contact-email-error' : undefined}
                  onChange={(e) => update('contactEmail', e.target.value)}
                />
                <FieldError id="org-contact-email-error" message={visibleErrors.contactEmail} />
              </div>

              <div>
                <Label htmlFor="org-location">Location</Label>
                <Input
                  id="org-location"
                  className="mt-1.5"
                  placeholder="Enter organisation location"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </div>
            </CollapsibleFormSection>

            {/* Social profiles (optional, collapsed by default) */}
            <CollapsibleFormSection
              id="org-social-section"
              title="Social profiles"
              description="Add links to the organisation’s public profiles."
              open={socialOpen}
              onOpenChange={setSocialOpen}
            >
              <div>
                <Label htmlFor="org-linkedin">LinkedIn profile</Label>
                <Input
                  id="org-linkedin"
                  className="mt-1.5"
                  placeholder="Enter LinkedIn profile URL"
                  value={form.linkedin}
                  aria-invalid={Boolean(visibleErrors.linkedin)}
                  aria-describedby={visibleErrors.linkedin ? 'org-linkedin-error' : undefined}
                  onChange={(e) => update('linkedin', e.target.value)}
                />
                <FieldError id="org-linkedin-error" message={visibleErrors.linkedin} />
              </div>

              <div>
                <Label htmlFor="org-github">GitHub profile</Label>
                <Input
                  id="org-github"
                  className="mt-1.5"
                  placeholder="Enter GitHub profile URL"
                  value={form.github}
                  aria-invalid={Boolean(visibleErrors.github)}
                  aria-describedby={visibleErrors.github ? 'org-github-error' : undefined}
                  onChange={(e) => update('github', e.target.value)}
                />
                <FieldError id="org-github-error" message={visibleErrors.github} />
              </div>

              <div>
                <Label htmlFor="org-x">Twitter/X profile</Label>
                <Input
                  id="org-x"
                  className="mt-1.5"
                  placeholder="Enter Twitter/X profile URL"
                  value={form.x}
                  aria-invalid={Boolean(visibleErrors.x)}
                  aria-describedby={visibleErrors.x ? 'org-x-error' : undefined}
                  onChange={(e) => update('x', e.target.value)}
                />
                <FieldError id="org-x-error" message={visibleErrors.x} />
              </div>
            </CollapsibleFormSection>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? 'Creating Organisation…' : 'Create Organisation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { CreateOrganisationSideSheet }
