import type { DatasetMetadata } from '@/types/dataset'

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
