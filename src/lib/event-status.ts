import type { EventMetadata } from '@/types/event'

export function formatEventDateRange(metadata: EventMetadata): string {
  const formatDate = (value: string) => {
    if (!value) return ''
    const date = new Date(`${value}T00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const start = formatDate(metadata.startDate)
  const end = formatDate(metadata.endDate)

  if (!start) return '—'
  if (!end || end === start) return start
  return `${start} – ${end}`
}

export function formatEventTimeRange(metadata: EventMetadata): string {
  const formatTime = (value: string) => {
    if (!value) return ''
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours)) return value
    return new Date(2000, 0, 1, hours, minutes || 0).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const start = formatTime(metadata.startTime)
  const end = formatTime(metadata.endTime)

  if (!start) return ''
  if (!end || end === start) return start
  return `${start} – ${end}`
}

/** Parses a `YYYY-MM-DD` + `HH:mm` pair into a `Date`, falling back to
 *  `fallbackTime` when only the date is set (e.g. an end date with no end
 *  time still needs a boundary to compare "now" against). `null` when there's
 *  no date at all, or the pair doesn't parse. */
function parseEventBoundary(date: string, time: string, fallbackTime: string): Date | null {
  if (!date) return null
  const value = new Date(`${date}T${time || fallbackTime}`)
  return Number.isNaN(value.getTime()) ? null : value
}

export type EventLifecycleStatus = 'upcoming' | 'ongoing' | 'completed'

export const EVENT_LIFECYCLE_LABELS: Record<EventLifecycleStatus, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  completed: 'Completed',
}

/** The event's own lifecycle, derived purely from its schedule — never a
 *  contributor-editable field. This is the single source of truth for
 *  "is this event upcoming/ongoing/completed" shared by the contributor
 *  preview, Review & Publish, and the consumer Event Details page, so none
 *  of the three can disagree about where an event stands. */
export function getEventLifecycleStatus(metadata: EventMetadata, now: Date = new Date()): EventLifecycleStatus {
  const start = parseEventBoundary(metadata.startDate, metadata.startTime, '00:00')
  if (!start) return 'upcoming'
  const end = parseEventBoundary(metadata.endDate, metadata.endTime, '23:59') ?? start
  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'ongoing'
}

export type EventRegistrationState = 'open' | 'not-yet-open' | 'closed' | 'not-required' | 'event-completed'

export const EVENT_REGISTRATION_LABELS: Record<EventRegistrationState, string> = {
  open: 'Registration Open',
  'not-yet-open': 'Registration opens soon',
  closed: 'Registration closed',
  'not-required': 'No registration required',
  'event-completed': 'Event concluded',
}

/** Registration state — like the lifecycle status, fully derived rather than
 *  contributor-set: whether registration is required at all, its optional
 *  opening/closing window, and the event's own schedule. "Event concluded"
 *  always wins once the event itself has ended, regardless of the
 *  registration window still technically being "open". */
export function getEventRegistrationState(metadata: EventMetadata, now: Date = new Date()): EventRegistrationState {
  if (getEventLifecycleStatus(metadata, now) === 'completed') return 'event-completed'
  if (!metadata.registrationRequired) return 'not-required'

  const opens = parseEventBoundary(metadata.registrationStartDate, metadata.registrationStartTime, '00:00')
  if (opens && now < opens) return 'not-yet-open'

  const closes = parseEventBoundary(metadata.registrationEndDate, metadata.registrationEndTime, '23:59')
  if (closes && now > closes) return 'closed'

  return 'open'
}
