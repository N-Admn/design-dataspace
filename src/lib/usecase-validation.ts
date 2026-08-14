import type { UseCaseFormState } from '@/types/usecase'

export interface UseCaseMetadataErrors {
  title?: string
  runningStatus?: string
  startedOn?: string
  sectors?: string
  sdgGoals?: string
}

export function validateUseCaseMetadata(form: UseCaseFormState): UseCaseMetadataErrors {
  const errors: UseCaseMetadataErrors = {}
  const { metadata } = form
  if (!metadata.title.trim()) errors.title = 'Enter a use case title.'
  if (!metadata.runningStatus) errors.runningStatus = 'Select a running status.'
  if (!metadata.startedOn) errors.startedOn = 'Select a start date.'
  if (metadata.sectors.length === 0) errors.sectors = 'Select at least one sector.'
  if (metadata.sdgGoals.length === 0) errors.sdgGoals = 'Select at least one SDG goal.'
  return errors
}

export function isUseCaseMetadataValid(form: UseCaseFormState): boolean {
  return Object.keys(validateUseCaseMetadata(form)).length === 0
}

export interface UseCaseIntroductionErrors {
  thumbnail?: string
  description?: string
}

function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

export function validateUseCaseIntroduction(form: UseCaseFormState): UseCaseIntroductionErrors {
  const errors: UseCaseIntroductionErrors = {}
  if (!form.introduction.thumbnail) errors.thumbnail = 'Thumbnail is required.'
  if (isRichTextEmpty(form.introduction.descriptionHtml)) errors.description = 'Description is required.'
  return errors
}

export function isUseCaseIntroductionValid(form: UseCaseFormState): boolean {
  return Object.keys(validateUseCaseIntroduction(form)).length === 0
}

export interface UseCaseReadinessIssue {
  section: 'Metadata' | 'Builder' | 'Connections'
  message: string
  step: 1 | 2 | 3
}

export function getUseCaseReadinessIssues(form: UseCaseFormState): UseCaseReadinessIssue[] {
  const issues: UseCaseReadinessIssue[] = []
  const metadataErrors = validateUseCaseMetadata(form)
  const introErrors = validateUseCaseIntroduction(form)

  Object.values(metadataErrors).forEach((message) => {
    if (message) issues.push({ section: 'Metadata', message, step: 1 })
  })
  Object.values(introErrors).forEach((message) => {
    if (message) issues.push({ section: 'Builder', message, step: 2 })
  })

  return issues
}

export function isUseCaseReadyToPublish(form: UseCaseFormState): boolean {
  return getUseCaseReadinessIssues(form).length === 0
}
