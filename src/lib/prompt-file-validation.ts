import type { DatasetFile } from '@/types/dataset'

const TABULAR_EXTENSIONS = ['CSV', 'TSV', 'XLS', 'XLSX']

export type PromptFileMetadataStatus = 'ready' | 'incomplete' | 'error'

/** Metadata-completion status shown in the Prompt Files list (Section 11) — kept
 * separate from field-by-field validation (below), which drives the side sheet's
 * inline errors and the Review step's readiness checklist. */
export function promptFileMetadataStatus(file: DatasetFile): PromptFileMetadataStatus {
  const meta = file.promptFileMetadata
  const isTabular = TABULAR_EXTENSIONS.includes(file.extension.toUpperCase())

  if (isTabular && meta?.fieldsUnavailable) return 'error'
  if (!meta) return 'incomplete'
  if (!meta.promptFileName.trim() || !meta.promptFormat) return 'incomplete'
  if (isTabular && meta.fields.some((f) => !f.description?.trim())) return 'incomplete'

  return 'ready'
}

export interface PromptFileFieldErrors {
  promptFileName?: string
  promptFormat?: string
}

export function validatePromptFileMetadata(file: DatasetFile): PromptFileFieldErrors {
  const errors: PromptFileFieldErrors = {}
  const meta = file.promptFileMetadata

  if (!meta?.promptFileName.trim()) errors.promptFileName = 'Enter a prompt file name.'
  if (!meta?.promptFormat) errors.promptFormat = 'Add a prompt format before publishing this prompt file.'

  return errors
}

export function isPromptFileReadyToPublish(file: DatasetFile): boolean {
  return promptFileMetadataStatus(file) === 'ready'
}
