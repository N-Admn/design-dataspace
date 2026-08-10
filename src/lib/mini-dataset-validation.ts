import type { DatasetMetadata, DatasetResource } from '@/types/dataset'

export interface MiniDatasetBasicErrors {
  name?: string
  description?: string
  sector?: string
}

export function validateMiniDatasetBasics(metadata: DatasetMetadata): MiniDatasetBasicErrors {
  const errors: MiniDatasetBasicErrors = {}
  if (!metadata.name.trim()) errors.name = 'Enter a dataset name.'
  if (!metadata.description.trim()) errors.description = 'Enter a description.'
  if (!metadata.sector) errors.sector = 'Select a sector.'
  return errors
}

export function isMiniDatasetBasicsValid(metadata: DatasetMetadata): boolean {
  return Object.keys(validateMiniDatasetBasics(metadata)).length === 0
}

export function validateMiniDatasetResources(resources: DatasetResource[]): string | undefined {
  if (resources.length === 0) return 'Add at least one resource.'
  return undefined
}

export interface MiniDatasetLicenseErrors {
  license?: string
  accessType?: string
}

export function validateMiniDatasetLicense(metadata: DatasetMetadata): MiniDatasetLicenseErrors {
  const errors: MiniDatasetLicenseErrors = {}
  if (!metadata.license) errors.license = 'Select a license.'
  if (!metadata.accessType) errors.accessType = 'Select a visibility.'
  return errors
}

export function isMiniDatasetLicenseValid(metadata: DatasetMetadata): boolean {
  return Object.keys(validateMiniDatasetLicense(metadata)).length === 0
}
