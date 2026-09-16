import type { UseCaseFormState } from '@/types/usecase'

/** Basic Information now lives at the top of the Builder step (step 1) — the
 * flow no longer has a separate Start step. */
export interface UseCaseBasicInfoErrors {
  thumbnail?: string
  title?: string
}

export function validateUseCaseBasicInfo(form: UseCaseFormState): UseCaseBasicInfoErrors {
  const errors: UseCaseBasicInfoErrors = {}
  const { metadata } = form
  if (!metadata.thumbnail) errors.thumbnail = 'Upload a thumbnail image.'
  if (!metadata.title.trim()) errors.title = 'Enter a use case title.'
  return errors
}

export function isUseCaseBasicInfoValid(form: UseCaseFormState): boolean {
  return Object.keys(validateUseCaseBasicInfo(form)).length === 0
}

export interface UseCaseReadinessIssue {
  section: 'Builder' | 'Connect'
  message: string
  step: 1 | 2
}

export function getUseCaseReadinessIssues(form: UseCaseFormState): UseCaseReadinessIssue[] {
  const issues: UseCaseReadinessIssue[] = []

  Object.values(validateUseCaseBasicInfo(form)).forEach((message) => {
    if (message) issues.push({ section: 'Builder', message, step: 1 })
  })

  return issues
}

export function isUseCaseReadyToPublish(form: UseCaseFormState): boolean {
  return getUseCaseReadinessIssues(form).length === 0
}
