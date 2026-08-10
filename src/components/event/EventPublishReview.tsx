import * as React from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, Database, Layers, Pencil, Send, Sparkles, Users2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SECTOR_OPTIONS } from '@/types/dataset'
import { formatEventDateRange, getRegistrationStatus } from '@/lib/event-status'
import {
  ACCESS_TYPE_LABELS,
  EVENT_TYPE_OPTIONS,
  PUBLICATION_TYPE_OPTIONS,
  type EventFormState,
} from '@/types/event'

interface EventPublishReviewProps {
  form: EventFormState
  canPublish: boolean
  onEditSection: (step: 1 | 2 | 3) => void
  onPublish: () => void
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

function ReviewSection({
  title,
  editStep,
  onEditSection,
  defaultOpen,
  children,
}: {
  title: string
  editStep: 1 | 2 | 3
  onEditSection: (step: 1 | 2 | 3) => void
  defaultOpen: boolean
  children: ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left"
        >
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', !open && '-rotate-90')} />
          <CardTitle>{title}</CardTitle>
        </button>
        <button
          type="button"
          aria-label={`Edit ${title}`}
          onClick={() => onEditSection(editStep)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <Pencil className="size-4" />
        </button>
      </CardHeader>
      {open && <CardContent className="flex flex-col gap-5">{children}</CardContent>}
    </Card>
  )
}

function EventPublishReview({ form, canPublish, onEditSection, onPublish }: EventPublishReviewProps) {
  const { metadata } = form
  const registration = getRegistrationStatus(metadata)

  return (
    <div className="flex flex-col gap-6">
      <ReviewSection title="Information" editStep={1} onEditSection={onEditSection} defaultOpen>
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
            value={
              registration === 'not-required' ? (
                <Badge variant="muted">Not Required</Badge>
              ) : registration === 'open' ? (
                <Badge variant="success">Open</Badge>
              ) : (
                <Badge variant="muted">Closed</Badge>
              )
            }
          />
          {metadata.registrationRequired && (
            <ReviewField label="Registration URL" value={metadata.registrationUrl || '—'} />
          )}
        </div>
      </ReviewSection>

      <ReviewSection title="Connections" editStep={2} onEditSection={onEditSection} defaultOpen={false}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReviewField
            label="Organiser"
            value={form.organisers.length > 0 ? form.organisers.map((o) => o.name).join(', ') : '—'}
          />
          <ReviewField
            label="Partners"
            value={form.partners.length > 0 ? form.partners.map((o) => o.name).join(', ') : '—'}
          />
          <ReviewField label="Speaker Count" value={form.speakerCount || '—'} />
        </div>
      </ReviewSection>

      <ReviewSection title="Publications" editStep={3} onEditSection={onEditSection} defaultOpen={false}>
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
                <span className="text-xs text-muted-foreground">{p.file.sizeLabel}</span>
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Related Content" editStep={3} onEditSection={onEditSection} defaultOpen={false}>
        <RelatedGroup icon={Database} label="Datasets" items={form.relatedContent.datasets.map((i) => i.title)} />
        <RelatedGroup icon={Layers} label="Use Cases" items={form.relatedContent.useCases.map((i) => i.title)} />
        <RelatedGroup
          icon={Users2}
          label="Collaboratives"
          items={form.relatedContent.collaboratives.map((i) => i.title)}
        />
        <RelatedGroup icon={Sparkles} label="AI Models" items={form.relatedContent.aiModels.map((i) => i.title)} />
      </ReviewSection>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          The event will be publicly available immediately after publishing.
        </p>
        <Button type="button" size="lg" className="w-full max-w-md" disabled={!canPublish} onClick={onPublish}>
          Publish Event
          <Send className="size-4" />
        </Button>
        {!canPublish && (
          <p className="text-xs font-medium text-destructive">
            Complete the required fields in Information before publishing.
          </p>
        )}
      </div>
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
