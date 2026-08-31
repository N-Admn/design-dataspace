import type { ApiKeyLocation } from '@/types/dataset'
import { API_KEY_LOCATION_OPTIONS } from '@/types/dataset'

export type AIModelStatus = 'draft' | 'published'

export const MODEL_TYPE_OPTIONS = [
  { value: 'llm', label: 'Large Language Model' },
  { value: 'classification', label: 'Classification' },
  { value: 'regression', label: 'Regression' },
  { value: 'computer-vision', label: 'Computer Vision' },
  { value: 'nlp', label: 'Natural Language Processing' },
  { value: 'forecasting', label: 'Forecasting' },
  { value: 'recommendation', label: 'Recommendation System' },
  { value: 'speech', label: 'Speech Recognition' },
  { value: 'other', label: 'Other' },
]

export const DOMAIN_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'climate', label: 'Climate & Environment' },
  { value: 'public-policy', label: 'Public Policy' },
  { value: 'finance', label: 'Finance' },
  { value: 'disaster-management', label: 'Disaster Management' },
  { value: 'governance', label: 'Governance' },
  { value: 'urban-planning', label: 'Urban Planning' },
  { value: 'general', label: 'General Purpose' },
]

export const TARGET_USER_OPTIONS = [
  { value: 'researchers', label: 'Researchers' },
  { value: 'developers', label: 'Developers' },
  { value: 'analysts', label: 'Analysts' },
  { value: 'government-teams', label: 'Government Teams' },
  { value: 'organisations', label: 'Organisations' },
  { value: 'general-users', label: 'General Users' },
]

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'ne', label: 'Nepali' },
  { value: 'si', label: 'Sinhala' },
]

export type LanguageSupportType = 'multilingual' | 'specific' | 'not_language_dependent' | ''

export const LANGUAGE_SUPPORT_OPTIONS: { value: LanguageSupportType; label: string }[] = [
  { value: 'multilingual', label: 'Multilingual' },
  { value: 'specific', label: 'Specific languages' },
  { value: 'not_language_dependent', label: 'Not language-dependent' },
]

export type AILifecycleStage = 'development' | 'beta' | 'stable' | 'deprecated'

export const LIFECYCLE_OPTIONS: { value: AILifecycleStage; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'beta', label: 'Beta' },
  { value: 'stable', label: 'Stable' },
  { value: 'deprecated', label: 'Deprecated' },
]

/** Provider belongs to the Access Method, never to the AI Model or Version.
 * The selected provider drives which configuration fields are shown, which
 * are required, and how the Access Method is validated — see
 * `validateAIModelAccessMethod` in `ai-model-validation.ts`. */
export type AccessMethodProvider = 'openai' | 'ollama' | 'together-ai' | 'replicate' | 'custom' | ''

export const PROVIDER_OPTIONS: { value: AccessMethodProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'together-ai', label: 'Together AI' },
  { value: 'replicate', label: 'Replicate' },
  { value: 'custom', label: 'Custom API' },
]

/** Only meaningful when provider === 'custom' — every other provider has a
 * fixed, implicit authentication scheme (API key). */
export type CustomApiAuthType = 'none' | 'bearer-token' | 'api-key' | 'custom-header'

export const CUSTOM_API_AUTH_OPTIONS: { value: CustomApiAuthType; label: string }[] = [
  { value: 'none', label: 'No Authentication' },
  { value: 'bearer-token', label: 'Bearer Token' },
  { value: 'api-key', label: 'API Key' },
  { value: 'custom-header', label: 'Custom Header' },
]

export interface AIModelMetadata {
  name: string
  modelType: string
  domain: string
  description: string
  targetUsers: string[]
  intendedUse: string
  sectors: string[]
  tags: string[]
  languageSupportType: LanguageSupportType
  /** Only meaningful when languageSupportType === 'specific'. */
  languages: string[]
  geographies: string[]
  website: string
  license: string
}

export interface AIModelAccessMethod {
  id: string
  name: string
  provider: AccessMethodProvider
  isPrimary: boolean
  /** Provider Model ID — required once a provider is selected, for every provider. */
  modelId: string
  /** Credential for OpenAI / Together AI / Replicate (each has a single, implicit
   * API-key auth scheme). Unused and hidden for Ollama and Custom API. */
  apiKey: string
  /** Ollama's endpoint, or Custom API's endpoint — the only two providers that
   * require a user-supplied URL. */
  endpointUrl: string
  /** Custom API only — every other provider has one fixed auth scheme. */
  authType: CustomApiAuthType
  /** Custom API only. Header name for Bearer Token / Custom Header; header-or-param
   * name for API Key. */
  headerName: string
  /** Custom API only, and only when authType === 'api-key': where the key is passed. */
  apiKeyLocation: ApiKeyLocation
  /** Custom API only — the bearer token / API key / custom header value. */
  credentialValue: string
  /** Custom API only — request payload template (supports {input}, {prompt},
   * {model_id}, {temperature}, {max_tokens} placeholders). */
  requestBody: string
  /** Custom API only — where in the response body the model output is found. */
  responsePath: string
  /** Custom API only. */
  timeoutSeconds: string
}

export interface AIModelVersion {
  id: string
  name: string
  lifecycleStage: AILifecycleStage
  isPrimary: boolean
  accessMethods: AIModelAccessMethod[]
  updatedAt: string
}

export interface AIModelFormState {
  metadata: AIModelMetadata
  versions: AIModelVersion[]
}

export interface AIModelRecord {
  id: string
  status: AIModelStatus
  updatedAt: string
  form: AIModelFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while a working copy has unpublished edits, so Discard can restore the live version. */
  publishedForm: AIModelFormState | null
}

export const emptyAIModelMetadata: AIModelMetadata = {
  name: '',
  modelType: '',
  domain: '',
  description: '',
  targetUsers: [],
  intendedUse: '',
  sectors: [],
  tags: [],
  languageSupportType: '',
  languages: [],
  geographies: [],
  website: '',
  license: '',
}

// Seeded from Date.now() (not 0) so freshly created records never collide with
// the small hardcoded ids in mock data (e.g. "version-1", "access-1").
let versionIdCounter = Date.now()
let accessMethodIdCounter = Date.now()

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function createAIModelAccessMethod(overrides: Partial<AIModelAccessMethod> = {}): AIModelAccessMethod {
  accessMethodIdCounter += 1
  return {
    id: `access-${accessMethodIdCounter}`,
    name: '',
    provider: '',
    isPrimary: false,
    modelId: '',
    apiKey: '',
    endpointUrl: '',
    authType: 'none',
    headerName: '',
    apiKeyLocation: 'header',
    credentialValue: '',
    requestBody: '',
    responsePath: '',
    timeoutSeconds: '30',
    ...overrides,
  }
}

/** The first version of a new AI Model is created automatically — the contributor
 * is never asked to type "1.0" or decide it's Primary. It starts with no Access
 * Methods; the contributor adds those explicitly (see the Versions empty state). */
export function createAIModelVersion(overrides: Partial<AIModelVersion> = {}): AIModelVersion {
  versionIdCounter += 1
  return {
    id: `version-${versionIdCounter}`,
    name: '1.0',
    lifecycleStage: 'development',
    isPrimary: true,
    accessMethods: [],
    updatedAt: todayIso(),
    ...overrides,
  }
}

export function createEmptyAIModelForm(): AIModelFormState {
  return {
    metadata: { ...emptyAIModelMetadata },
    versions: [createAIModelVersion()],
  }
}

export { API_KEY_LOCATION_OPTIONS }
export type { ApiKeyLocation }
