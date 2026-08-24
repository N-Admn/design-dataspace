import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldError } from '@/components/ui/field-error'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { cn } from '@/lib/utils'
import { SECTOR_OPTIONS } from '@/types/dataset'
import {
  EVENT_TYPE_OPTIONS,
  MAX_IMAGE_BYTES,
  SUPPORTED_IMAGE_EXTENSIONS,
  type EventAccessType,
  type EventMetadata,
} from '@/types/event'
import type { EventInformationErrors } from '@/lib/event-validation'

interface EventInformationStepProps {
  metadata: EventMetadata
  errors: EventInformationErrors
  onChange: <K extends keyof EventMetadata>(field: K, value: EventMetadata[K]) => void
}

function RadioCard({
  id,
  name,
  selected,
  onSelect,
  title,
  description,
}: {
  id: string
  name: string
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
}) {
  return (
    <Label
      htmlFor={id}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border border-input p-4 transition-colors',
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
      )}
    >
      <RadioGroupItem value={name} id={id} className="mt-0.5" />
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
    </Label>
  )
}

function EventInformationStep({ metadata, errors, onChange }: EventInformationStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label>Registration required?</Label>
            <RadioGroup
              className="mt-1.5 grid grid-cols-2 gap-3 sm:max-w-xs"
              value={metadata.registrationRequired ? 'yes' : 'no'}
              onValueChange={(value) => onChange('registrationRequired', value === 'yes')}
            >
              <RadioCard
                id="registration-no"
                name="no"
                selected={!metadata.registrationRequired}
                onSelect={() => onChange('registrationRequired', false)}
                title="No"
              />
              <RadioCard
                id="registration-yes"
                name="yes"
                selected={metadata.registrationRequired}
                onSelect={() => onChange('registrationRequired', true)}
                title="Yes"
              />
            </RadioGroup>
          </div>

          {metadata.registrationRequired && (
            <>
              <div>
                <Label htmlFor="registration-url">
                  Registration URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registration-url"
                  className="mt-1.5"
                  placeholder="https://example.com/register"
                  value={metadata.registrationUrl}
                  aria-invalid={Boolean(errors.registrationUrl)}
                  onChange={(e) => onChange('registrationUrl', e.target.value)}
                />
                <FieldError message={errors.registrationUrl} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Users will be redirected to this external page to register.
                </p>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="registration-end-date">
                    Registration End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="registration-end-date"
                    type="date"
                    className="mt-1.5"
                    value={metadata.registrationEndDate}
                    aria-invalid={Boolean(errors.registrationEndDate)}
                    onChange={(e) => onChange('registrationEndDate', e.target.value)}
                  />
                  <FieldError message={errors.registrationEndDate} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="registration-end-time">
                    Registration End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="registration-end-time"
                    type="time"
                    className="mt-1.5"
                    value={metadata.registrationEndTime}
                    aria-invalid={Boolean(errors.registrationEndTime)}
                    onChange={(e) => onChange('registrationEndTime', e.target.value)}
                  />
                  <FieldError message={errors.registrationEndTime} />
                </div>
              </div>
            </>
          )}

          <p className="rounded-md bg-primary/5 px-3 py-2.5 text-xs text-primary">
            Registration status and event actions are updated automatically based on your event and
            registration dates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Identity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label htmlFor="event-title">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="event-title"
              className="mt-1.5"
              placeholder="e.g. Open Data Summit 2026"
              value={metadata.title}
              aria-invalid={Boolean(errors.title)}
              onChange={(e) => onChange('title', e.target.value)}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <Label htmlFor="event-subtitle">Event Subtitle</Label>
            <Input
              id="event-subtitle"
              className="mt-1.5"
              placeholder="e.g. Building Trusted Public Data Ecosystems for Better Governance"
              value={metadata.subtitle}
              onChange={(e) => onChange('subtitle', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="event-type">
                Event Type <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="event-type"
                  options={EVENT_TYPE_OPTIONS}
                  value={metadata.eventType}
                  onChange={(value) => onChange('eventType', value)}
                  placeholder="Select event type..."
                  invalid={Boolean(errors.eventType)}
                />
              </div>
              <FieldError message={errors.eventType} />
            </div>
            <div className="flex-1">
              <Label htmlFor="event-theme">
                Theme/Sector <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="event-theme"
                  options={SECTOR_OPTIONS}
                  value={metadata.theme}
                  onChange={(value) => onChange('theme', value)}
                  placeholder="Search and select a theme/sector..."
                  invalid={Boolean(errors.theme)}
                />
              </div>
              <FieldError message={errors.theme} />
            </div>
          </div>

          <div>
            <Label htmlFor="event-overview">
              Detail Overview <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="event-overview"
              className="mt-1.5"
              rows={5}
              placeholder="Include the event's objectives, agenda, expected outcomes, and target audience..."
              value={metadata.overview}
              aria-invalid={Boolean(errors.overview)}
              onChange={(e) => onChange('overview', e.target.value)}
            />
            <FieldError message={errors.overview} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="start-date">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start-date"
              type="date"
              className="mt-1.5"
              value={metadata.startDate}
              aria-invalid={Boolean(errors.startDate)}
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            <FieldError message={errors.startDate} />
          </div>
          <div>
            <Label htmlFor="start-time">
              Start Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start-time"
              type="time"
              className="mt-1.5"
              value={metadata.startTime}
              aria-invalid={Boolean(errors.startTime)}
              onChange={(e) => onChange('startTime', e.target.value)}
            />
            <FieldError message={errors.startTime} />
          </div>
          <div>
            <Label htmlFor="end-date">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end-date"
              type="date"
              className="mt-1.5"
              value={metadata.endDate}
              aria-invalid={Boolean(errors.endDate)}
              onChange={(e) => onChange('endDate', e.target.value)}
            />
            <FieldError message={errors.endDate} />
          </div>
          <div>
            <Label htmlFor="end-time">
              End Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end-time"
              type="time"
              className="mt-1.5"
              value={metadata.endTime}
              aria-invalid={Boolean(errors.endTime)}
              onChange={(e) => onChange('endTime', e.target.value)}
            />
            <FieldError message={errors.endTime} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Format &amp; Location</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label>
              Access Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3"
              value={metadata.accessType}
              onValueChange={(value) => onChange('accessType', value as EventAccessType)}
            >
              <RadioCard
                id="access-online"
                name="online"
                selected={metadata.accessType === 'online'}
                onSelect={() => onChange('accessType', 'online')}
                title="Online"
              />
              <RadioCard
                id="access-hybrid"
                name="hybrid"
                selected={metadata.accessType === 'hybrid'}
                onSelect={() => onChange('accessType', 'hybrid')}
                title="Hybrid"
              />
              <RadioCard
                id="access-in-person"
                name="in-person"
                selected={metadata.accessType === 'in-person'}
                onSelect={() => onChange('accessType', 'in-person')}
                title="In-Person"
              />
            </RadioGroup>
            <FieldError message={errors.accessType} />
          </div>

          {(metadata.accessType === 'hybrid' || metadata.accessType === 'in-person') && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="venue-name">
                  Venue Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue-name"
                  className="mt-1.5"
                  placeholder="e.g. India Habitat Centre"
                  value={metadata.venueName}
                  aria-invalid={Boolean(errors.venueName)}
                  onChange={(e) => onChange('venueName', e.target.value)}
                />
                <FieldError message={errors.venueName} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="venue-address">Address/Location</Label>
                <Input
                  id="venue-address"
                  className="mt-1.5"
                  value={metadata.address}
                  onChange={(e) => onChange('address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="venue-city">City/Locality</Label>
                <Input
                  id="venue-city"
                  className="mt-1.5"
                  value={metadata.city}
                  onChange={(e) => onChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="venue-state">State/Province/Region</Label>
                <Input
                  id="venue-state"
                  className="mt-1.5"
                  value={metadata.state}
                  onChange={(e) => onChange('state', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="venue-country">Country</Label>
                <Input
                  id="venue-country"
                  className="mt-1.5"
                  value={metadata.country}
                  onChange={(e) => onChange('country', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FileUploadField
            id="event-cover-image"
            value={metadata.coverImage}
            onChange={(asset) => onChange('coverImage', asset)}
            extensions={SUPPORTED_IMAGE_EXTENSIONS}
            maxBytes={MAX_IMAGE_BYTES}
            variant="dropzone"
          />
          <p className="text-xs text-muted-foreground">
            Thumbnail for listing cards is generated automatically from this image.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export { EventInformationStep }
