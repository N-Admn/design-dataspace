/** The content lifecycle is deliberately just two persistent statuses across every
 * module (Datasets, Use Cases, AI Models, Collaboratives, Charts, Events):
 *
 *  - `draft`     — never published; not publicly available.
 *  - `published` — publicly available.
 *
 * Editing an already-published item never changes its status. The working copy is
 * held in `form` while `publishedForm` keeps the version the public sees; the item
 * stays `published` and the public version stays live until the user explicitly
 * publishes again (which replaces `publishedForm`) or discards (which restores it). */
export type ContentStatus = 'draft' | 'published'

interface LifecycleRecord<F> {
  status: ContentStatus
  form: F
  publishedForm: F | null
}

/** True when a published item has a working copy that differs from the version the
 * public currently sees — i.e. saved edits that have not been published yet.
 * Surfaced in list views as "Published · Unsaved changes". */
export function hasUnpublishedEdits<F>(record: LifecycleRecord<F> | null | undefined): boolean {
  if (!record || record.status !== 'published' || record.publishedForm == null) return false
  return JSON.stringify(record.form) !== JSON.stringify(record.publishedForm)
}

/** Resolves the stored lifecycle state for an upsert, given the caller's intent:
 *
 *  - intent `'publish'`  → item becomes/stays `published`; `publishedForm` is replaced
 *    with the incoming form (this is the only path that updates the public version).
 *  - intent `'save'`     → persist the working copy without publishing. A brand-new or
 *    still-draft item stays `draft`; an already-published item stays `published` with
 *    its live `publishedForm` untouched, so the public version keeps showing while the
 *    edits sit unpublished.
 *
 * Never flips `published` → `draft` and never auto-publishes. */
export function resolveLifecycle<F>(
  existing: { status: ContentStatus; publishedForm: F | null } | undefined,
  intent: 'save' | 'publish',
  form: F,
): { status: ContentStatus; publishedForm: F | null } {
  if (intent === 'publish') {
    return { status: 'published', publishedForm: form }
  }
  if (existing?.status === 'published') {
    return { status: 'published', publishedForm: existing.publishedForm }
  }
  return { status: 'draft', publishedForm: existing?.publishedForm ?? null }
}
