import { COLLABORATIVE_DESCRIPTION_MAX_LENGTH, type CollaborativeFormState } from '@/types/collaborative'

function isRichTextEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim() === ''
}

/** Visible character count of rich-text HTML — what the description limit counts. */
export function richTextLength(html: string): number {
  if (!html) return 0
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').length
}

/** Turn a name into a subdomain label: "Sleep & Health Research" → "sleep-health-research". */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // strip accents left over from NFKD, e.g. "é" → "e"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '')
}

/** A DNS label: 3–63 chars, lowercase letters/digits/hyphens, no leading or trailing hyphen. */
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/

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
  slug?: string
  description?: string
  externalUrl?: string
}

/** `takenSlugs` — slugs already used by other Collaboratives (never this one's own). */
export function validateCollaborativeAbout(form: CollaborativeFormState, takenSlugs: string[] = []): CollaborativeAboutErrors {
  const errors: CollaborativeAboutErrors = {}
  const { metadata } = form
  // `?? ''` — preview snapshots written before the URL field existed have no slug.
  const slug = (metadata.slug ?? '').trim()
  if (!metadata.name.trim()) errors.name = 'Enter a Collaborative name.'
  if (!slug) errors.slug = 'Enter a Collaborative URL.'
  else if (!SLUG_PATTERN.test(slug))
    errors.slug = 'Use 3–63 lowercase letters, numbers or hyphens, starting and ending with a letter or number.'
  else if (takenSlugs.includes(slug)) errors.slug = 'This URL is already taken by another Collaborative.'
  if (isRichTextEmpty(metadata.descriptionHtml)) errors.description = 'Add a description to continue.'
  else if (richTextLength(metadata.descriptionHtml) > COLLABORATIVE_DESCRIPTION_MAX_LENGTH)
    errors.description = `Shorten the description to ${COLLABORATIVE_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters or fewer.`
  if (metadata.externalUrl.trim() && !isValidUrl(metadata.externalUrl.trim())) errors.externalUrl = 'Enter a valid URL.'
  return errors
}

/** Slugs used by every Collaborative except `excludeId` (the one being edited). */
export function takenCollaborativeSlugs(records: { id: string; form: CollaborativeFormState }[], excludeId: string | null): string[] {
  return records.filter((r) => r.id !== excludeId).map((r) => r.form.metadata.slug?.trim()).filter(Boolean) as string[]
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

export function getCollaborativeReadinessIssues(form: CollaborativeFormState, takenSlugs: string[] = []): CollaborativeReadinessIssue[] {
  const issues: CollaborativeReadinessIssue[] = []

  Object.values(validateCollaborativeAbout(form, takenSlugs)).forEach((message) => {
    if (message) issues.push({ section: 'About', message, step: 1 })
  })
  Object.values(validateCollaborativeContent(form)).forEach((message) => {
    if (message) issues.push({ section: 'Content', message, step: 3 })
  })

  return issues
}

export function isCollaborativeReadyToPublish(form: CollaborativeFormState, takenSlugs: string[] = []): boolean {
  return getCollaborativeReadinessIssues(form, takenSlugs).length === 0
}
