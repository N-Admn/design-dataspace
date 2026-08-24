import type { CollaborativeFormState, CollaborativeStatus } from '@/types/collaborative'

/** Carries the in-progress (possibly unsaved) editor state into a preview tab
 * opened via window.open — localStorage is shared across same-origin tabs, so
 * the preview always reflects the current draft rather than the last-saved record. */
const DRAFT_KEY_PREFIX = 'civicdataspace:collaborative-draft:'

export interface CollaborativeDraftSnapshot {
  id: string
  status: CollaborativeStatus
  form: CollaborativeFormState
}

export function saveCollaborativeDraftSnapshot(snapshot: CollaborativeDraftSnapshot) {
  try {
    window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${snapshot.id}`, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures (e.g. private browsing quota).
  }
}

export function loadCollaborativeDraftSnapshot(id: string): CollaborativeDraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as CollaborativeDraftSnapshot) : null
  } catch {
    return null
  }
}

export function clearCollaborativeDraftSnapshot(id: string) {
  try {
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
  } catch {
    // Ignore storage write failures.
  }
}
