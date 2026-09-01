import { MAX_DOCUMENT_BYTES } from '@/lib/generic-upload'

export type AccessType = 'open' | 'restricted'

export interface DatasetFile {
  id: string
  /** The physical uploaded file's name — never edited by the contributor. */
  name: string
  /** Human-readable, contributor-editable label for this resource. Falls back to a
   *  filename-derived title (see getResourceTitle) when absent, e.g. for older records. */
  title?: string
  extension: string
  sizeLabel: string
  sizeBytes: number
  uploadedAt: string
  /** How the file entered the dataset — omitted means a direct "File upload".
   *  Platform imports set 'Kaggle' | 'GitHub' | 'Hugging Face'. */
  source?: string
  /** Folder path within the source (platform imports that preserve a hierarchy),
   *  e.g. "train" for `dataset/train/data.csv`. Omitted for flat / direct uploads. */
  path?: string
  /** The platform dataset/repository URL this file was imported from. */
  importUrl?: string
  /** System-inferred where it can be reliably determined (e.g. parsing a CSV
   *  header/lines). Contributor-editable in the File Details side sheet. */
  rowCount?: number
  columnCount?: number
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

export type ApiAuthMethod = 'none' | 'api-key' | 'bearer-token'
export type ApiKeyLocation = 'header' | 'query'
export type ApiResponseFormat = 'json' | 'csv'

export interface KeyValuePair {
  id: string
  key: string
  value: string
}

export interface DatasetResourceApiConfig {
  url: string
  method: 'GET'
  authMethod: ApiAuthMethod
  apiKey: string
  apiKeyLocation: ApiKeyLocation
  bearerToken: string
  parameters: KeyValuePair[]
  headers: KeyValuePair[]
  responseFormat: ApiResponseFormat
  /** Whether "Test connection" has succeeded for the config as currently entered. */
  tested: boolean
}

export interface DatasetResource {
  id: string
  type: DatasetResourceType
  file?: DatasetFile
  url?: string
  apiConfig?: DatasetResourceApiConfig
}

export const AUTH_METHOD_OPTIONS: { value: ApiAuthMethod; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'api-key', label: 'API Key' },
  { value: 'bearer-token', label: 'Bearer Token' },
]

export const API_KEY_LOCATION_OPTIONS: { value: ApiKeyLocation; label: string }[] = [
  { value: 'header', label: 'Header' },
  { value: 'query', label: 'Query parameter' },
]

export const API_RESPONSE_FORMAT_OPTIONS: { value: ApiResponseFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
]

export interface DatasetFormState {
  metadata: DatasetMetadata
  files: DatasetFile[]
  /** Vestigial: the Data Files stage now offers only File Upload and Public Platform
   *  import — both produce `files`. Kept for backward-compatibility with saved
   *  records (always `[]` for anything created through the current flow). */
  resources: DatasetResource[]
}

export type DatasetStatus = 'draft' | 'published'

export interface DatasetRecord {
  id: string
  status: DatasetStatus
  updatedAt: string
  form: DatasetFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while a working copy has unpublished edits, so Discard can restore the live version. */
  publishedForm: DatasetFormState | null
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
  resources: [],
}

export const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'csv', 'xls', 'xlsx', 'txt']
/** Data resource files share the platform-wide 500 MB document ceiling. */
export const MAX_FILE_SIZE_BYTES = MAX_DOCUMENT_BYTES

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
