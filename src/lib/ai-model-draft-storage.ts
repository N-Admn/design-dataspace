import type { AIModelFormState, AIModelStatus } from '@/types/ai-model'

/** Carries the in-progress (possibly unsaved) editor state into a preview tab
 * opened via window.open — localStorage is shared across same-origin tabs, so
 * the preview always reflects the current draft rather than the last-saved record. */
const DRAFT_KEY_PREFIX = 'civicdataspace:ai-model-draft:'

export interface AIModelDraftSnapshot {
  id: string
  status: AIModelStatus
  form: AIModelFormState
}

export function saveAIModelDraftSnapshot(snapshot: AIModelDraftSnapshot) {
  try {
    window.localStorage.setItem(`${DRAFT_KEY_PREFIX}${snapshot.id}`, JSON.stringify(snapshot))
  } catch {
    // Ignore storage write failures (e.g. private browsing quota).
  }
}

export function loadAIModelDraftSnapshot(id: string): AIModelDraftSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
    return raw ? (JSON.parse(raw) as AIModelDraftSnapshot) : null
  } catch {
    return null
  }
}

export function clearAIModelDraftSnapshot(id: string) {
  try {
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
  } catch {
    // Ignore storage write failures.
  }
}
