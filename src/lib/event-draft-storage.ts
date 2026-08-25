import type { EventFormState, EventStatus } from '@/types/event'

/** Carries the in-progress (possibly unsaved) editor state into a preview tab
 * opened via window.open — localStorage is shared across same-origin tabs, so
 * the preview always reflects the current draft rather than the last-saved record. */
const DRAFT_KEY_PREFIX = 'civicdataspace:event-draft:'

export interface EventDraftSnapshot {
  id: string
  status: EventStatus
  form: EventFormState
}

export function saveEventDraftSnapshot(snapshot: EventDraftSnapshot) {
  try {
    window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${snapshot.id}`, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures (e.g. private browsing quota).
  }
}

export function loadEventDraftSnapshot(id: string): EventDraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as EventDraftSnapshot) : null
  } catch {
    return null
  }
}

export function clearEventDraftSnapshot(id: string) {
  try {
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
  } catch {
    // Ignore storage write failures.
  }
}
