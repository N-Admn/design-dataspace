import { Building2, CalendarDays, Database, FileText, Layers, MapPin, Mic2, Sparkles, Users2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { SECTOR_OPTIONS } from '@/types/dataset'
import { formatEventDateRange, getRegistrationStatus } from '@/lib/event-status'
import { ACCESS_TYPE_LABELS, EVENT_TYPE_OPTIONS, PUBLICATION_TYPE_OPTIONS, type EventFormState } from '@/types/event'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function EventPreview({ form }: { form: EventFormState }) {
  const { metadata, organisers, partners, speakers, publications, relatedContent } = form
  const registration = getRegistrationStatus(metadata)
  const showVenue =
    (metadata.accessType === 'hybrid' || metadata.accessType === 'in-person') &&
    [metadata.venueName, metadata.address, metadata.city, metadata.state, metadata.country].some(Boolean)
  const hasSpeakers = speakers.length > 0
  const hasRelatedContent =
    relatedContent.datasets.length > 0 ||
    relatedContent.useCases.length > 0 ||
    relatedContent.collaboratives.length > 0 ||
    relatedContent.aiModels.length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Hero / Introduction */}
      <div className="border-b border-border">
        {metadata.coverImage?.dataUrl && (
          <img src={metadata.coverImage.dataUrl} alt="" className="h-56 w-full object-cover" />
        )}
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-primary">{metadata.title || 'Untitled Event'}</h1>
          {metadata.subtitle && <p className="mt-2 text-base text-muted-foreground">{metadata.subtitle}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {metadata.eventType && <Badge variant="secondary">{optionLabel(EVENT_TYPE_OPTIONS, metadata.eventType)}</Badge>}
            {metadata.theme && <Badge variant="muted">{optionLabel(SECTOR_OPTIONS, metadata.theme)}</Badge>}
          </div>
        </div>
      </div>

      {/* Schedule, location & registration */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-5">
        <div className="flex items-start gap-2.5 text-sm text-foreground">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>{formatEventDateRange(metadata)}</span>
        </div>
        {metadata.accessType && (
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {ACCESS_TYPE_LABELS[metadata.accessType]}
              {showVenue &&
                ` · ${[metadata.venueName, metadata.address, metadata.city, metadata.state, metadata.country].filter(Boolean).join(', ')}`}
            </span>
          </div>
        )}
        {metadata.registrationRequired && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
            {registration === 'open' ? (
              <Badge variant="success">Registration Open</Badge>
            ) : (
              <Badge variant="muted">Registration Closed</Badge>
            )}
            {metadata.registrationUrl && (
              <a href={metadata.registrationUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                Register →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Overview */}
      {metadata.overview && (
        <div className="border-b border-border px-6 py-5">
          <p className="whitespace-pre-line text-sm text-foreground">{metadata.overview}</p>
        </div>
      )}

      {/* Organiser & partners */}
      {(organisers.length > 0 || partners.length > 0) && (
        <div className="flex flex-col gap-4 border-b border-border px-6 py-5">
          {organisers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Organiser</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {organisers.map((o) => (
                  <span
                    key={o.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Building2 className="size-3" />
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {partners.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Partners</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {partners.map((o) => (
                  <span
                    key={o.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Building2 className="size-3" />
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Speakers */}
      {hasSpeakers && (
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mic2 className="size-4 shrink-0 text-muted-foreground" />
            <span>
              {speakers.length} speaker{speakers.length === 1 ? '' : 's'} confirmed
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {speakers.map((speaker) => {
              const secondary = [speaker.designation, speaker.organisation].filter(Boolean).join(' · ')
              return (
                <div key={speaker.id} className="flex items-center gap-3">
                  {speaker.image?.dataUrl ? (
                    <img
                      src={speaker.image.dataUrl}
                      alt=""
                      className="size-9 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Mic2 className="size-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{speaker.name}</p>
                    {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Publications */}
      {publications.length > 0 && (
        <div className="border-b border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Publications</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {publications.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-foreground">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{p.title}</span>
                <Badge variant="secondary">
                  {PUBLICATION_TYPE_OPTIONS.find((o) => o.value === p.publicationType)?.label ?? p.publicationType}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related content */}
      {hasRelatedContent && (
        <div className="flex flex-col gap-4 px-6 py-5">
          {relatedContent.datasets.length > 0 && (
            <RelatedGroup icon={Database} label="Datasets" items={relatedContent.datasets.map((i) => i.title)} />
          )}
          {relatedContent.useCases.length > 0 && (
            <RelatedGroup icon={Layers} label="Use Cases" items={relatedContent.useCases.map((i) => i.title)} />
          )}
          {relatedContent.collaboratives.length > 0 && (
            <RelatedGroup icon={Users2} label="Collaboratives" items={relatedContent.collaboratives.map((i) => i.title)} />
          )}
          {relatedContent.aiModels.length > 0 && (
            <RelatedGroup icon={Sparkles} label="AI Models" items={relatedContent.aiModels.map((i) => i.title)} />
          )}
        </div>
      )}
    </div>
  )
}

function RelatedGroup({ icon: Icon, label, items }: { icon: typeof Database; label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((title) => (
          <Badge key={title} variant="accent">
            {title}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export { EventPreview }
