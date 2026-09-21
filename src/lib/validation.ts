import type { DatasetFormState, DatasetMetadata } from '@/types/dataset'
import type { PromptDatasetMetadata } from '@/types/prompt-dataset'
import { isPromptFileReadyToPublish } from '@/lib/prompt-file-validation'

export type MetadataErrors = Partial<Record<keyof DatasetMetadata, string>>

export function validateMetadata(metadata: DatasetMetadata): MetadataErrors {
  const errors: MetadataErrors = {}

  if (!metadata.name.trim()) errors.name = 'Enter a dataset name.'
  if (!metadata.description.trim()) errors.description = 'Enter a description.'
  if (!metadata.sector) errors.sector = 'Select a sector.'
  if (!metadata.accessType) errors.accessType = 'Select an access type.'
  if (!metadata.license) errors.license = 'Select a license.'

  return errors
}

export function isMetadataValid(metadata: DatasetMetadata): boolean {
  return Object.keys(validateMetadata(metadata)).length === 0
}

export type PromptDatasetMetadataErrors = Partial<Record<keyof PromptDatasetMetadata, string>>

/** Prompt Dataset dataset-level metadata is required before publishing, mirroring
 * the standard Dataset metadata rules — never blocks saving a draft. */
export function validatePromptDatasetMetadata(metadata: PromptDatasetMetadata): PromptDatasetMetadataErrors {
  const errors: PromptDatasetMetadataErrors = {}

  if (!metadata.taskType) errors.taskType = 'Select a task type.'
  if (!metadata.domain) errors.domain = 'Select a domain.'
  if (metadata.targetLanguages.length === 0) errors.targetLanguages = 'Select at least one target language.'
  if (metadata.targetModelTypes.length === 0) errors.targetModelTypes = 'Select at least one target model type.'

  return errors
}

export function isPromptDatasetMetadataValid(metadata: PromptDatasetMetadata): boolean {
  return Object.keys(validatePromptDatasetMetadata(metadata)).length === 0
}

/** Single readiness check used to gate Publish for both dataset types — see
 * Step3Review's readiness checklist for the itemised, user-facing version. */
export function isDatasetFormPublishable(form: DatasetFormState): boolean {
  if (!isMetadataValid(form.metadata)) return false
  if (form.datasetType !== 'prompt_dataset') return true
  if (!isPromptDatasetMetadataValid(form.promptDatasetMetadata)) return false
  if (form.files.length === 0) return false
  return form.files.every((file) => isPromptFileReadyToPublish(file))
}
