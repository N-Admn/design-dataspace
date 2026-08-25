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
  enablePreview: boolean
  /** API and Link resources attached to the dataset (CSV files are tracked separately in `files`). */
  resources: DatasetResource[]
}

export type DatasetStatus = 'published' | 'draft' | 'pending'

export interface DatasetRecord {
  id: string
  status: DatasetStatus
  updatedAt: string
  form: DatasetFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while edits are Pending, so Discard has the live version to revert to. */
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
  enablePreview: false,
  resources: [],
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
