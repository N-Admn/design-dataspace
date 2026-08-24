import type { CollaborativeFormState } from '@/types/collaborative'

function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export interface CollaborativeAboutErrors {
  name?: string
  description?: string
  externalUrl?: string
}

export function validateCollaborativeAbout(form: CollaborativeFormState): CollaborativeAboutErrors {
  const errors: CollaborativeAboutErrors = {}
  const { metadata } = form
  if (!metadata.name.trim()) errors.name = 'Enter a Collaborative name.'
  if (isRichTextEmpty(metadata.descriptionHtml)) errors.description = 'Add a description to continue.'
  if (metadata.externalUrl.trim() && !isValidUrl(metadata.externalUrl.trim())) errors.externalUrl = 'Enter a valid URL.'
  return errors
}

export interface CollaborativeContentErrors {
  content?: string
}

export function validateCollaborativeContent(form: CollaborativeFormState): CollaborativeContentErrors {
  const errors: CollaborativeContentErrors = {}
  const { connections } = form
  if (connections.datasets.length === 0 && connections.useCases.length === 0) {
    errors.content = 'Add at least one dataset or use case to continue.'
  }
  return errors
}

export interface CollaborativeReadinessIssue {
  section: 'About' | 'People' | 'Content'
  message: string
  step: 1 | 2 | 3
}

export function getCollaborativeReadinessIssues(form: CollaborativeFormState): CollaborativeReadinessIssue[] {
  const issues: CollaborativeReadinessIssue[] = []

  Object.values(validateCollaborativeAbout(form)).forEach((message) => {
    if (message) issues.push({ section: 'About', message, step: 1 })
  })
  Object.values(validateCollaborativeContent(form)).forEach((message) => {
    if (message) issues.push({ section: 'Content', message, step: 3 })
  })

  return issues
}

export function isCollaborativeReadyToPublish(form: CollaborativeFormState): boolean {
  return getCollaborativeReadinessIssues(form).length === 0
}
