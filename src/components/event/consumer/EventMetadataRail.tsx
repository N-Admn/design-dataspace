import type { ReactNode } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Building2, CalendarDays, Clock, Globe2, MapPin, Radio } from 'lucide-react'

import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  EVENT_LIFECYCLE_LABELS,
  EVENT_REGISTRATION_LABELS,
  formatEventDateRange,
  formatEventTimeRange,
  getEventLifecycleStatus,
  getEventRegistrationState,
  type EventLifecycleStatus,
  type EventRegistrationState,
} from '@/lib/event-status'
import { ACCESS_TYPE_LABELS, type EventMetadata, type Organisation } from '@/types/event'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

const LIFECYCLE_BADGE_VARIANT: Record<EventLifecycleStatus, BadgeVariant> = {
  upcoming: 'secondary',
  ongoing: 'success',
  completed: 'muted',
}

const REGISTRATION_BADGE_VARIANT: Record<EventRegistrationState, BadgeVariant> = {
  open: 'success',
  'not-yet-open': 'warning',
  closed: 'muted',
  'not-required': 'muted',
  'event-completed': 'muted',
}

/** Organisation/partner names beyond this many collapse into a "+N more" —
 *  keeps the sticky rail from growing indefinitely on events with a long
 *  partner list. */
const MAX_VISIBLE_PARTNERS = 3

function RailRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-text-default">
      <span className="mt-0.5 shrink-0 text-text-subdued">{icon}</span>
      <span>{children}</span>
    </div>
  )
}

/** Compact horizontal row — icon + name on one line — used for both
 *  Organiser and Partners inside the narrow rail. Distinct from the larger
 *  entity cards elsewhere on the page; this is the "just tell me who"
 *  treatment a sticky sidebar needs. Links out to the organisation's own
 *  site when known; CivicDataSpace has no public organisation profile route
 *  yet, so no internal link is invented. */
function RailOrgRow({ organisation }: { organisation: Organisation }) {
  const content = (
    <>
      {organisation.logo ? (
        <img src={organisation.logo.dataUrl} alt="" className="size-6 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subdued text-text-subdued">
          <Building2 className="size-3.5" />
        </span>
      )}
      <span className="min-w-0 truncate text-sm text-text-default">{organisation.name}</span>
    </>
  )
  if (organisation.url) {
    return (
      <a
        href={organisation.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </a>
    )
  }
  return <div className="flex items-center gap-2">{content}</div>
}

function RailOrgGroup({ title, organisations }: { title: string; organisations: Organisation[] }) {
  if (organisations.length === 0) return null
  const visible = organisations.slice(0, MAX_VISIBLE_PARTNERS)
  const overflow = organisations.length - visible.length
  return (
    <div className="flex flex-col gap-2 border-t border-border-default pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">{title}</p>
      {visible.map((org) => (
        <RailOrgRow key={org.id} organisation={org} />
      ))}
      {overflow > 0 && <p className="text-xs text-text-subdued">+{overflow} more</p>}
    </div>
  )
}

/** Registration state + primary CTA — the only interactive element in the
 *  card. Fully derived, never contributor-set. Once an "open" event is
 *  actually underway, joining the live online session is the more useful
 *  action than "registering" for it, so the CTA reads "Join" and targets the
 *  online link when one exists — otherwise it falls back to "Register" and
 *  the registration URL, exactly as for an upcoming event. */
function RegistrationBlock({ metadata }: { metadata: EventMetadata }) {
  const lifecycle = getEventLifecycleStatus(metadata)
  const state = getEventRegistrationState(metadata)

  if (state === 'open') {
    const canJoinOnline = (metadata.accessType === 'online' || metadata.accessType === 'hybrid') && metadata.onlineUrl
    const useJoin = lifecycle === 'ongoing' && canJoinOnline
    const label = useJoin ? 'Join →' : 'Register →'
    const href = useJoin ? metadata.onlineUrl : metadata.registrationUrl

    return (
      <div className="flex flex-col gap-3">
        <Badge variant="success">Registration Open</Badge>
        {href ? (
          <Button asChild className="w-full">
            <a href={href} target="_blank" rel="noreferrer">
              {label}
            </a>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {label}
          </Button>
        )}
      </div>
    )
  }

  return <Badge variant={REGISTRATION_BADGE_VARIANT[state]}>{EVENT_REGISTRATION_LABELS[state]}</Badge>
}

interface EventMetadataRailProps {
  metadata: EventMetadata
  organisers: Organisation[]
  partners: Organisation[]
}

/** The sticky right rail — "who is organising this and what do I need to
 *  know about the event": event information, then Organiser, then Partners,
 *  in that order. Sits beside the thumbnail in the event-information block
 *  and stays sticky through the rest of the page on desktop (see
 *  `EventDetailPage`). Never repeats the title, subtitle, Event Type or
 *  Theme/Sector shown in `EventIdentity`. */
function EventMetadataRail({ metadata, organisers, partners }: EventMetadataRailProps) {
  const lifecycle = getEventLifecycleStatus(metadata)
  const timeRange = formatEventTimeRange(metadata)
  const isOnline = metadata.accessType === 'online'
  const isHybrid = metadata.accessType === 'hybrid'
  // "Online" is already conveyed by the Access Type row above — the Location
  // row only adds information for hybrid/in-person events with an actual
  // venue/city, so a purely online event doesn't show the same word twice.
  const location = isOnline ? undefined : [metadata.city, metadata.country].filter(Boolean).join(', ') || metadata.venueName || undefined

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <Badge variant={LIFECYCLE_BADGE_VARIANT[lifecycle]} className="w-fit">
          {EVENT_LIFECYCLE_LABELS[lifecycle]}
        </Badge>

        <div className="flex flex-col gap-2.5">
          <RailRow icon={<CalendarDays className="size-4" />}>{formatEventDateRange(metadata)}</RailRow>
          {timeRange && <RailRow icon={<Clock className="size-4" />}>{timeRange}</RailRow>}
          {metadata.accessType && (
            <RailRow icon={<Radio className="size-4" />}>{ACCESS_TYPE_LABELS[metadata.accessType]}</RailRow>
          )}
          {location && <RailRow icon={<MapPin className="size-4" />}>{location}</RailRow>}
          {(isOnline || isHybrid) && metadata.onlineUrl && (
            <RailRow icon={<Globe2 className="size-4" />}>
              <a
                href={metadata.onlineUrl}
                target="_blank"
                rel="noreferrer"
                className="text-text-brand underline-offset-2 hover:underline focus-visible:underline"
              >
                Join online
              </a>
            </RailRow>
          )}
        </div>

        <div className="border-t border-border-default pt-4">
          <RegistrationBlock metadata={metadata} />
        </div>

        <RailOrgGroup title="Organiser" organisations={organisers} />
        <RailOrgGroup title="Partners" organisations={partners} />
      </CardContent>
    </Card>
  )
}

export { EventMetadataRail }
