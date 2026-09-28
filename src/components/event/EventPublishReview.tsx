import * as React from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, Database, ExternalLink, Eye, Layers, Sparkles, Users2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { ResourcePreviewDialog, assetToPreviewResource, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SECTOR_OPTIONS } from '@/types/dataset'
import {
  EVENT_LIFECYCLE_LABELS,
  EVENT_REGISTRATION_LABELS,
  formatEventDateRange,
  getEventLifecycleStatus,
  getEventRegistrationState,
} from '@/lib/event-status'
import { validateEventInformation, getEventPublishRecommendations } from '@/lib/event-validation'
import {
  ACCESS_TYPE_LABELS,
  EVENT_TYPE_OPTIONS,
  PUBLICATION_TYPE_OPTIONS,
  type EventFormState,
} from '@/types/event'

const REGISTRATION_BADGE_VARIANT: Record<ReturnType<typeof getEventRegistrationState>, 'success' | 'warning' | 'muted'> = {
  open: 'success',
  'not-yet-open': 'warning',
  closed: 'muted',
  'not-required': 'muted',
  'event-completed': 'muted',
}

const LIFECYCLE_BADGE_VARIANT: Record<ReturnType<typeof getEventLifecycleStatus>, 'secondary' | 'success' | 'muted'> = {
  upcoming: 'secondary',
  ongoing: 'success',
  completed: 'muted',
}

interface EventPublishReviewProps {
  form: EventFormState
  onEditSection: (step: 1 | 2 | 3) => void
  onPreview: () => void
}

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

function EventPublishReview({ form, onEditSection, onPreview }: EventPublishReviewProps) {
  const { metadata } = form
  const lifecycle = getEventLifecycleStatus(metadata)
  const registration = getEventRegistrationState(metadata)
  const errors = validateEventInformation(metadata)
  const errorMessages = Object.values(errors).filter((message): message is string => Boolean(message))
  const recommendations = getEventPublishRecommendations(form)
  const [preview, setPreview] = React.useState<PreviewResource | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h2"
        title="Review & Publish"
        description="Check your information before making this content available publicly."
      />

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border-default bg-surface-default px-5 py-4">
        <ReviewField label="Event Status" value={<Badge variant={LIFECYCLE_BADGE_VARIANT[lifecycle]}>{EVENT_LIFECYCLE_LABELS[lifecycle]}</Badge>} />
        <ReviewField
          label="Registration Status"
          value={<Badge variant={REGISTRATION_BADGE_VARIANT[registration]}>{EVENT_REGISTRATION_LABELS[registration]}</Badge>}
        />
        <p className="ml-auto max-w-xs text-xs text-muted-foreground">
          Both are calculated automatically from the schedule below and update on their own as the event approaches.
        </p>
      </div>

      {errorMessages.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 shrink-0" />
            Fix the following before publishing
          </p>
          <ul className="list-disc pl-6">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md bg-primary/5 px-4 py-3 text-sm text-primary">
          <p className="font-semibold">Recommendations</p>
          <ul className="list-disc pl-6">
            {recommendations.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
          <p className="text-xs">These are optional — they won't block publishing.</p>
        </div>
      )}

      <ReviewSection title="Information" defaultOpen onEdit={() => onEditSection(1)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ReviewField label="Event Title" value={metadata.title || '—'} />
          </div>
          {metadata.subtitle && (
            <div className="sm:col-span-2">
              <ReviewField label="Subtitle" value={metadata.subtitle} />
            </div>
          )}
          <ReviewField
            label="Event Type"
            value={metadata.eventType ? optionLabel(EVENT_TYPE_OPTIONS, metadata.eventType) : '—'}
          />
          <ReviewField
            label="Theme/Sector"
            value={metadata.theme ? optionLabel(SECTOR_OPTIONS, metadata.theme) : '—'}
          />
          <div className="sm:col-span-2">
            <ReviewField label="Detail Overview" value={metadata.overview || '—'} />
          </div>
          <ReviewField label="Schedule" value={formatEventDateRange(metadata)} />
          <ReviewField
            label="Access Type"
            value={metadata.accessType ? ACCESS_TYPE_LABELS[metadata.accessType] : '—'}
          />
          {(metadata.accessType === 'online' || metadata.accessType === 'hybrid') && (
            <ReviewField label="Online Event Link" value={metadata.onlineUrl || '—'} />
          )}
          {(metadata.accessType === 'hybrid' || metadata.accessType === 'in-person') && (
            <div className="sm:col-span-2">
              <ReviewField
                label="Venue"
                value={
                  [metadata.venueName, metadata.address, metadata.city, metadata.state, metadata.country]
                    .filter(Boolean)
                    .join(', ') || '—'
                }
              />
            </div>
          )}
          <ReviewField
            label="Registration"
            value={<Badge variant={REGISTRATION_BADGE_VARIANT[registration]}>{EVENT_REGISTRATION_LABELS[registration]}</Badge>}
          />
          {metadata.registrationRequired && (
            <ReviewField label="Registration URL" value={metadata.registrationUrl || '—'} />
          )}
        </div>
      </ReviewSection>

      <ReviewSection title="Connections" defaultOpen onEdit={() => onEditSection(2)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReviewField
            label="Organiser"
            value={form.organisers.length > 0 ? form.organisers.map((o) => o.name).join(', ') : '—'}
          />
          <ReviewField
            label="Partners"
            value={form.partners.length > 0 ? form.partners.map((o) => o.name).join(', ') : '—'}
          />
          <ReviewField
            label="Speakers"
            value={form.speakers.length > 0 ? form.speakers.map((s) => s.name).join(', ') : '—'}
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Publications" defaultOpen onEdit={() => onEditSection(3)}>
        {form.publications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No publications added.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {form.publications.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{p.title}</span>
                <Badge variant="secondary">
                  {PUBLICATION_TYPE_OPTIONS.find((o) => o.value === p.publicationType)?.label ?? p.publicationType}
                </Badge>
                {p.file && (
                  <>
                    <span className="text-xs text-muted-foreground">{p.file.sizeLabel}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label={`Preview ${p.title}`}
                      onClick={() => setPreview(assetToPreviewResource(p.file!, p.title))}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Related Content" defaultOpen onEdit={() => onEditSection(3)}>
        <RelatedGroup icon={Database} label="Datasets" items={form.relatedContent.datasets.map((i) => i.title)} />
        <RelatedGroup icon={Layers} label="Use Cases" items={form.relatedContent.useCases.map((i) => i.title)} />
        <RelatedGroup
          icon={Users2}
          label="Collaboratives"
          items={form.relatedContent.collaboratives.map((i) => i.title)}
        />
        <RelatedGroup icon={Sparkles} label="AI Models" items={form.relatedContent.aiModels.map((i) => i.title)} />
      </ReviewSection>

      <ReviewPublishPanel>
        <p className="text-sm text-muted-foreground">
          Open a full preview of this event in a new tab, exactly as it will appear once published.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" onClick={onPreview}>
          Preview Event
          <ExternalLink className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Publishing happens from inside the preview.</p>
      </ReviewPublishPanel>

      <ResourcePreviewDialog resource={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </div>
  )
}

function RelatedGroup({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof Database
  label: string
  items: string[]
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None connected.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((title) => (
            <Badge key={title} variant="accent">
              {title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export { EventPublishReview }
