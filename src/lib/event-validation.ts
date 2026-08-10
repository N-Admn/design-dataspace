import type { EventMetadata } from '@/types/event'

export type EventInformationErrors = Partial<Record<keyof EventMetadata, string>>

export function validateEventInformation(metadata: EventMetadata): EventInformationErrors {
  const errors: EventInformationErrors = {}

  if (!metadata.title.trim()) errors.title = 'Enter an event title.'
  if (!metadata.eventType) errors.eventType = 'Select an event type.'
  if (!metadata.theme) errors.theme = 'Select a theme/sector.'
  if (!metadata.overview.trim()) errors.overview = 'Enter a detail overview.'
  if (!metadata.startDate) errors.startDate = 'Select a start date.'
  if (!metadata.startTime) errors.startTime = 'Select a start time.'
  if (!metadata.endDate) errors.endDate = 'Select an end date.'
  if (!metadata.endTime) errors.endTime = 'Select an end time.'

  if (metadata.registrationRequired) {
    if (!metadata.registrationUrl.trim()) errors.registrationUrl = 'Enter a registration URL.'
    if (!metadata.registrationEndDate) errors.registrationEndDate = 'Select a registration end date.'
    if (!metadata.registrationEndTime) errors.registrationEndTime = 'Select a registration end time.'
  }

  if (!metadata.accessType) errors.accessType = 'Select an access type.'

  if (metadata.accessType === 'hybrid' || metadata.accessType === 'in-person') {
    if (!metadata.venueName.trim()) errors.venueName = 'Enter a venue name.'
  }

  return errors
}

export function isEventInformationValid(metadata: EventMetadata): boolean {
  return Object.keys(validateEventInformation(metadata)).length === 0
}
