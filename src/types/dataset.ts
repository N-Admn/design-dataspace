export type AccessType = 'open' | 'restricted'

export interface DatasetFile {
  id: string
  name: string
  extension: string
  sizeLabel: string
  sizeBytes: number
  uploadedAt: string
}

export interface DatasetMetadata {
  name: string
  description: string
  sector: string
  geography: string
  tags: string[]
  sourceWebsite: string
  createDate: string
  accessType: AccessType | ''
  license: string
}

export type DatasetResourceType = 'csv' | 'api' | 'link'

export interface DatasetResource {
  id: string
  type: DatasetResourceType
  file?: DatasetFile
  url?: string
}

export interface DatasetFormState {
  metadata: DatasetMetadata
  files: DatasetFile[]
  enablePreview: boolean
  /** Populated only for datasets created through the lightweight Event → Related
   * Content mini-wizard, which supports CSV/API/Link resources instead of the
   * multi-file uploader the full Dataset flow uses. */
  resources?: DatasetResource[]
}

export type DatasetStatus = 'published' | 'draft'

export interface DatasetRecord {
  id: string
  status: DatasetStatus
  updatedAt: string
  form: DatasetFormState
}

export const emptyDatasetForm: DatasetFormState = {
  metadata: {
    name: '',
    description: '',
    sector: '',
    geography: '',
    tags: [],
    sourceWebsite: '',
    createDate: '',
    accessType: '',
    license: '',
  },
  files: [],
  enablePreview: false,
}

export const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'csv', 'xls', 'xlsx', 'txt']
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export const SECTOR_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'environment', label: 'Environment' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'housing', label: 'Housing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'urban-development', label: 'Urban Development' },
  { value: 'water-sanitation', label: 'Water & Sanitation' },
]

export const GEOGRAPHY_OPTIONS = [
  { value: 'india', label: 'India' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'nepal', label: 'Nepal' },
  { value: 'sri-lanka', label: 'Sri Lanka' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'bhutan', label: 'Bhutan' },
  { value: 'global', label: 'Global' },
]

export const LICENSE_OPTIONS = [
  { value: 'cc-by-4.0', label: 'CC BY 4.0' },
  { value: 'cc-by-sa-4.0', label: 'CC BY-SA 4.0' },
  { value: 'cc0-1.0', label: 'CC0 1.0 (Public Domain)' },
  { value: 'odc-by', label: 'Open Data Commons Attribution' },
  { value: 'gov-ogd-india', label: 'Government Open Data License – India' },
  { value: 'other', label: 'Other' },
]
