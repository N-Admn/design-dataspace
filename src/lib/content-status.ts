/** LIFECYCLE STATUS — deliberately just two persistent values across every module
 * (Datasets, Use Cases, AI Models, Collaboratives, Charts, Events):
 *
 *  - `draft`     — never published; not publicly available.
 *  - `published` — publicly available.
 *
 * This is the ONLY thing shown in a Status column / status badge. It is separate
 * from EDIT STATE (Saved | Unsaved changes) — see `hasUnsavedEdits`. Editing an
 * already-published item never changes its status: the working copy is held in
 * `form` while `publishedForm` keeps the version the public sees; the item stays
 * `published` until the user explicitly publishes again or discards. */
export type ContentStatus = 'draft' | 'published'

interface LifecycleRecord<F> {
  status: ContentStatus
  form: F
  publishedForm: F | null
}

/** EDIT STATE — has the working copy changed since it was last saved/loaded?
 * "Unsaved changes" is an editing indicator, never a lifecycle status. Shared by
 * every creation flow so the check can't drift per module. */
export function hasUnsavedEdits(current: unknown, lastSaved: unknown): boolean {
  return JSON.stringify(current) !== JSON.stringify(lastSaved)
}

/** True when a published record has a persisted working copy that differs from the
 * version the public currently sees. Drives the dashboard "continue working" queue —
 * it is NOT a status, is never rendered as a badge, and has no list/table action.
 * Unpublished edits are resolved only from inside the creation flow (publish, or
 * the leave-with-unsaved-changes gate's Discard). */
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
