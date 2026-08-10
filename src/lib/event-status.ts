import type { EventMetadata, RegistrationStatus } from '@/types/event'

export function getRegistrationStatus(
  metadata: EventMetadata,
  now: Date = new Date(),
): RegistrationStatus {
  if (!metadata.registrationRequired) return 'not-required'
  if (!metadata.registrationEndDate) return 'open'

  const endDateTime = new Date(`${metadata.registrationEndDate}T${metadata.registrationEndTime || '23:59'}`)
  if (Number.isNaN(endDateTime.getTime())) return 'open'

  return now.getTime() > endDateTime.getTime() ? 'closed' : 'open'
}

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
