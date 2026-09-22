import type { PublicationFormState } from '@/types/publication'

export interface PublicationDetailsErrors {
  name?: string
  description?: string
  contributors?: string
  date?: string
  sector?: string
  geography?: string
  usageRights?: string
  resourceType?: string
}

export function validatePublicationDetails(form: PublicationFormState): PublicationDetailsErrors {
  const errors: PublicationDetailsErrors = {}
  const { metadata } = form

  if (!metadata.name.trim()) errors.name = 'Enter a resource name.'
  if (!metadata.description.trim()) errors.description = 'Add a description or abstract.'
  if (metadata.contributors.length === 0) errors.contributors = 'Add at least one contributor.'
  if (!metadata.date) errors.date = 'Select a date.'
  if (!metadata.sector) errors.sector = 'Select a sector or domain.'
  if (!metadata.geography) errors.geography = 'Select a geography.'
  if (!metadata.usageRights) errors.usageRights = 'Select usage rights.'
  if (!metadata.resourceType) errors.resourceType = 'Select a resource type.'

  return errors
}

export function isPublicationDetailsValid(form: PublicationFormState): boolean {
  return Object.keys(validatePublicationDetails(form)).length === 0
}

export interface PublicationReadinessIssue {
  section: 'Details' | 'Files'
  message: string
  step: 1 | 2
}

export function getPublicationReadinessIssues(form: PublicationFormState): PublicationReadinessIssue[] {
  const issues: PublicationReadinessIssue[] = []

  Object.values(validatePublicationDetails(form)).forEach((message) => {
    if (message) issues.push({ section: 'Details', message, step: 2 })
  })

  if (form.blocks.length === 0) {
    issues.push({ section: 'Files', message: 'Add at least one file or video.', step: 1 })
  } else {
    const incomplete = form.blocks.some((b) => (b.type === 'file' ? !b.asset : !b.url.trim()))
    if (incomplete) issues.push({ section: 'Files', message: 'Finish every file or video you\'ve added.', step: 1 })
  }

  return issues
}

export function isPublicationReadyToPublish(form: PublicationFormState): boolean {
  return getPublicationReadinessIssues(form).length === 0
}
