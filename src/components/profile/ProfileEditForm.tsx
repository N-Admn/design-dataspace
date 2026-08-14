import * as React from 'react'
import { KeyRound, ShieldCheck, UploadCloud } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FieldError } from '@/components/ui/field-error'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { SECTOR_OPTIONS } from '@/types/dataset'
import { BIO_MAX_LENGTH, type ContributorProfile, type ProfileSocialLinks } from '@/types/profile'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'

interface ProfileEditFormProps {
  profile: ContributorProfile
  onSave: (profile: ContributorProfile) => void
}

type FormErrors = Partial<Record<'firstName' | 'lastName' | keyof ProfileSocialLinks, string>>

const URL_PATTERN = /^https?:\/\/.+\..+/i

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function ProfileEditForm({ profile, onSave }: ProfileEditFormProps) {
  const confirm = useConfirm()
  const toast = useToast()
  const { datasets, events } = useAppData()
  const [firstName, setFirstName] = React.useState(profile.firstName)
  const [lastName, setLastName] = React.useState(profile.lastName)
  const [location, setLocation] = React.useState(profile.location)
  const [bio, setBio] = React.useState(profile.bio)
  const [avatarDataUrl, setAvatarDataUrl] = React.useState(profile.avatarDataUrl)
  const [social, setSocial] = React.useState<ProfileSocialLinks>(profile.social)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const initials = (firstName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase() || 'U'

  const publishedDatasets = datasets.filter((d) => d.status === 'published')
  const publishedEvents = events.filter((e) => e.status === 'published')
  const areas = Array.from(
    new Set(
      publishedDatasets
        .map((d) => d.form.metadata.sector)
        .filter((sector): sector is string => Boolean(sector)),
    ),
  ).map((sector) => optionLabel(SECTOR_OPTIONS, sector))

  const hasUnsavedChanges =
    firstName.trim() !== profile.firstName ||
    lastName.trim() !== profile.lastName ||
    location.trim() !== profile.location ||
    bio.trim() !== profile.bio ||
    avatarDataUrl !== profile.avatarDataUrl ||
    social.github.trim() !== profile.social.github ||
    social.linkedin.trim() !== profile.social.linkedin ||
    social.x.trim() !== profile.social.x

  const resetForm = () => {
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setLocation(profile.location)
    setBio(profile.bio)
    setAvatarDataUrl(profile.avatarDataUrl)
    setSocial(profile.social)
    setErrors({})
  }

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
    resetForm()
  }

  const handleAvatarFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setAvatarDataUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  const updateSocial = <K extends keyof ProfileSocialLinks>(field: K, value: string) => {
    setSocial((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSave = () => {
    const nextErrors: FormErrors = {}
    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.'
    if (!lastName.trim()) nextErrors.lastName = 'Enter your last name.'
    ;(['github', 'linkedin', 'x'] as const).forEach((field) => {
      const value = social[field].trim()
      if (value && !URL_PATTERN.test(value)) {
        nextErrors[field] = 'Enter a valid URL (starting with https://).'
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSave({
      ...profile,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location: location.trim(),
      bio: bio.trim(),
      avatarDataUrl,
      social: {
        github: social.github.trim(),
        linkedin: social.linkedin.trim(),
        x: social.x.trim(),
      },
    })
  }

  return (
    <Card>
      <div className="px-6 py-4">
        <h1 className="text-lg font-semibold text-primary">My Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your profile information and how you appear on CivicDataSpace.
        </p>
      </div>

      <div className="border-t border-border px-6 py-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                Basic information associated with your CivicDataSpace profile.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="profile-first-name">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="profile-first-name"
                    className="mt-1.5"
                    value={firstName}
                    aria-invalid={Boolean(errors.firstName)}
                    onChange={(e) => {
                      setFirstName(e.target.value)
                      setErrors((prev) => ({ ...prev, firstName: undefined }))
                    }}
                  />
                  <FieldError message={errors.firstName} />
                </div>
                <div>
                  <Label htmlFor="profile-last-name">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="profile-last-name"
                    className="mt-1.5"
                    value={lastName}
                    aria-invalid={Boolean(errors.lastName)}
                    onChange={(e) => {
                      setLastName(e.target.value)
                      setErrors((prev) => ({ ...prev, lastName: undefined }))
                    }}
                  />
                  <FieldError message={errors.lastName} />
                </div>
              </div>

              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" className="mt-1.5" value={profile.email} disabled readOnly />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Email is linked to your account and cannot be changed here.
                </p>
              </div>

              <div>
                <Label htmlFor="profile-location">Location</Label>
                <Input
                  id="profile-location"
                  className="mt-1.5"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <Label htmlFor="profile-bio">Bio</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Briefly describe your role, expertise or areas of interest.
                </p>
                <Textarea
                  id="profile-bio"
                  className="mt-1.5"
                  rows={3}
                  maxLength={BIO_MAX_LENGTH}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {bio.length} / {BIO_MAX_LENGTH}
                </p>
              </div>

              <div>
                <Label>Profile picture</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  {avatarDataUrl ? (
                    <img
                      src={avatarDataUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {initials}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="size-4" />
                      {avatarDataUrl ? 'Change' : 'Upload picture'}
                    </Button>
                    {avatarDataUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarDataUrl(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAvatarFile(file)
                      e.target.value = ''
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">JPG or PNG · Max 5 MB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social profiles</CardTitle>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                Add links to your professional or social profiles.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <Label htmlFor="profile-github">GitHub</Label>
                  <Input
                    id="profile-github"
                    className="mt-1.5"
                    placeholder="https://github.com/username"
                    value={social.github}
                    aria-invalid={Boolean(errors.github)}
                    onChange={(e) => updateSocial('github', e.target.value)}
                  />
                  <FieldError message={errors.github} />
                </div>
                <div>
                  <Label htmlFor="profile-linkedin">LinkedIn</Label>
                  <Input
                    id="profile-linkedin"
                    className="mt-1.5"
                    placeholder="https://linkedin.com/in/username"
                    value={social.linkedin}
                    aria-invalid={Boolean(errors.linkedin)}
                    onChange={(e) => updateSocial('linkedin', e.target.value)}
                  />
                  <FieldError message={errors.linkedin} />
                </div>
                <div>
                  <Label htmlFor="profile-x">X</Label>
                  <Input
                    id="profile-x"
                    className="mt-1.5"
                    placeholder="https://x.com/username"
                    value={social.x}
                    aria-invalid={Boolean(errors.x)}
                    onChange={(e) => updateSocial('x', e.target.value)}
                  />
                  <FieldError message={errors.x} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                Your published contribution footprint on CivicDataSpace.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-foreground">
                <span className="font-semibold text-primary">{publishedDatasets.length}</span> Datasets ·{' '}
                <span className="font-semibold text-primary">{publishedEvents.length}</span> Events
              </p>
              {areas.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Areas of contribution
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {areas.map((area) => (
                      <Badge key={area} variant="accent">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account &amp; security</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">Account email</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign-in method</p>
                    <p className="text-sm text-muted-foreground">Google</p>
                  </div>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">••••••••</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast({ title: 'Change password', description: 'This area isn’t available yet.' })
                  }
                >
                  Change password →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete account</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Permanently delete your CivicDataSpace account and account information.
                </p>
              </div>
              <Button type="button" variant="destructive" className="shrink-0" onClick={() => setDeleteDialogOpen(true)}>
                Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save changes
        </Button>
      </div>

      <DeleteAccountDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} email={profile.email} />
    </Card>
  )
}

export { ProfileEditForm }
