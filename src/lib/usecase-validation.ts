import type { UseCaseFormState } from '@/types/usecase'

export interface UseCaseStartErrors {
  thumbnail?: string
  title?: string
}

export function validateUseCaseStart(form: UseCaseFormState): UseCaseStartErrors {
  const errors: UseCaseStartErrors = {}
  const { metadata } = form
  if (!metadata.thumbnail) errors.thumbnail = 'Upload a thumbnail image.'
  if (!metadata.title.trim()) errors.title = 'Enter a use case title.'
  return errors
}

export function isUseCaseStartValid(form: UseCaseFormState): boolean {
  return Object.keys(validateUseCaseStart(form)).length === 0
}

export interface UseCaseReadinessIssue {
  section: 'Start' | 'Builder' | 'Connect'
  message: string
  step: 1 | 2 | 3
}

export function getUseCaseReadinessIssues(form: UseCaseFormState): UseCaseReadinessIssue[] {
  const issues: UseCaseReadinessIssue[] = []

  Object.values(validateUseCaseStart(form)).forEach((message) => {
    if (message) issues.push({ section: 'Start', message, step: 1 })
  })

  return issues
}

export function isUseCaseReadyToPublish(form: UseCaseFormState): boolean {
  return getUseCaseReadinessIssues(form).length === 0
}
