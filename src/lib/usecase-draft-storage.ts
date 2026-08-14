import type { UseCaseFormState, UseCaseStatus } from '@/types/usecase'

/** Carries the in-progress (possibly unsaved) editor state into a preview tab
 * opened via window.open — localStorage is shared across same-origin tabs, so
 * the preview always reflects the current draft rather than the last-saved record. */
const DRAFT_KEY_PREFIX = 'civicdataspace:usecase-draft:'

export interface UseCaseDraftSnapshot {
  id: string
  status: UseCaseStatus
  form: UseCaseFormState
}

export function saveUseCaseDraftSnapshot(snapshot: UseCaseDraftSnapshot) {
  try {
    window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${snapshot.id}`, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures (e.g. private browsing quota).
  }
}

export function loadUseCaseDraftSnapshot(id: string): UseCaseDraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as UseCaseDraftSnapshot) : null
  } catch {
    return null
  }
}

export function clearUseCaseDraftSnapshot(id: string) {
  try {
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
  } catch {
    // Ignore storage write failures.
  }
}
