import type { PublicationFormState, PublicationStatus } from '@/types/publication'

/** Carries the in-progress (possibly unsaved) editor state into a preview tab
 * opened via window.open — localStorage is shared across same-origin tabs, so
 * the preview always reflects the current draft rather than the last-saved record. */
const DRAFT_KEY_PREFIX = 'civicdataspace:publication-draft:'

export interface PublicationDraftSnapshot {
  id: string
  status: PublicationStatus
  form: PublicationFormState
}

export function savePublicationDraftSnapshot(snapshot: PublicationDraftSnapshot) {
  try {
    window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${snapshot.id}`, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures (e.g. private browsing quota).
  }
}

export function loadPublicationDraftSnapshot(id: string): PublicationDraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as PublicationDraftSnapshot) : null
  } catch {
    return null
  }
}

export function clearPublicationDraftSnapshot(id: string) {
  try {
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
  } catch {
    // Ignore storage write failures.
  }
}
