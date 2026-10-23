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

/** The Connect step's one required field: at least one SDG goal, so a use case can always be found by goal on Search. */
export interface UseCaseConnectErrors {
  sdgGoals?: string
}

export function validateUseCaseConnect(form: UseCaseFormState): UseCaseConnectErrors {
  const errors: UseCaseConnectErrors = {}
  if (form.metadata.sdgGoals.length === 0) errors.sdgGoals = 'Select at least one SDG goal.'
  return errors
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
  Object.values(validateUseCaseConnect(form)).forEach((message) => {
    if (message) issues.push({ section: 'Connect', message, step: 2 })
  })

  return issues
}

export function isUseCaseReadyToPublish(form: UseCaseFormState): boolean {
  return getUseCaseReadinessIssues(form).length === 0
}
