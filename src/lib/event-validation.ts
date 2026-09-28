import type { EventFormState, EventMetadata } from '@/types/event'

export type EventInformationErrors = Partial<Record<keyof EventMetadata, string>>

/** Blocking validation — everything here must pass before an event can be
 *  published. Mirrors the "contributor input → validation" half of the
 *  contract; the derived-state half (lifecycle/registration) lives in
 *  `event-status.ts` and is never validated here since it's never entered. */
export function validateEventInformation(metadata: EventMetadata): EventInformationErrors {
  const errors: EventInformationErrors = {}

  if (!metadata.title.trim()) errors.title = 'Enter an event title.'
  if (!metadata.overview.trim()) errors.overview = 'Enter a detail overview.'

  if (!metadata.startDate) errors.startDate = 'Select a start date.'
  if (!metadata.startTime) errors.startTime = 'Select a start time.'
  if (!metadata.endDate) errors.endDate = 'Select an end date.'
  if (!metadata.endTime) errors.endTime = 'Select an end time.'

  if (metadata.startDate && metadata.startTime && metadata.endDate && metadata.endTime) {
    const start = new Date(`${metadata.startDate}T${metadata.startTime}`)
    const end = new Date(`${metadata.endDate}T${metadata.endTime}`)
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() <= start.getTime()) {
      errors.endDate = 'End must be later than start.'
    }
  }

  if (metadata.registrationRequired) {
    if (!metadata.registrationUrl.trim()) errors.registrationUrl = 'Enter a registration URL.'
    if (!metadata.registrationEndDate) errors.registrationEndDate = 'Select a registration end date.'
    if (!metadata.registrationEndTime) errors.registrationEndTime = 'Select a registration end time.'

    if (metadata.registrationStartDate && metadata.registrationEndDate) {
      const opens = new Date(`${metadata.registrationStartDate}T${metadata.registrationStartTime || '00:00'}`)
      const closes = new Date(`${metadata.registrationEndDate}T${metadata.registrationEndTime || '23:59'}`)
      if (!Number.isNaN(opens.getTime()) && !Number.isNaN(closes.getTime()) && closes.getTime() <= opens.getTime()) {
        errors.registrationEndDate = 'Registration end must be later than registration opening.'
      }
    }
  }

  if (!metadata.accessType) errors.accessType = 'Select an access type.'

  // Conditional access validation — each format requires only the
  // information it actually needs, not the union of every field.
  if (metadata.accessType === 'online' || metadata.accessType === 'hybrid') {
    if (!metadata.onlineUrl.trim()) errors.onlineUrl = 'Enter the online event link.'
  }
  if (metadata.accessType === 'hybrid' || metadata.accessType === 'in-person') {
    if (!metadata.venueName.trim()) errors.venueName = 'Enter a venue name.'
  }

  return errors
}

export function isEventInformationValid(metadata: EventMetadata): boolean {
  return Object.keys(validateEventInformation(metadata)).length === 0
}

/** Non-blocking Review & Publish recommendations — optional content that
 *  makes the public event page more useful but must never prevent
 *  publishing (per the documented required-vs-optional content rules). */
export function getEventPublishRecommendations(form: EventFormState): string[] {
  const recommendations: string[] = []
  if (form.organisers.length === 0) recommendations.push('No organiser added — consider adding who is running this event.')
  if (form.speakers.length === 0) recommendations.push('No speakers added.')
  if (!form.metadata.coverImage) recommendations.push('No cover image added.')
  const hasRelatedContent =
    form.relatedContent.datasets.length > 0 ||
    form.relatedContent.useCases.length > 0 ||
    form.relatedContent.collaboratives.length > 0 ||
    form.relatedContent.aiModels.length > 0
  if (form.publications.length === 0 && !hasRelatedContent) {
    recommendations.push('No publications or related content connected.')
  }
  return recommendations
}
