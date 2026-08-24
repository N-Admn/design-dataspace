import { SECTOR_OPTIONS } from '@/types/dataset'
import {
  DOMAIN_OPTIONS,
  MODEL_TYPE_OPTIONS,
  type AIModelAccessMethod,
  type AIModelFormState,
  type AIModelMetadata,
  type AIModelVersion,
} from '@/types/ai-model'

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
}

export interface AIModelDetailsErrors {
  name?: string
  modelType?: string
  domain?: string
  description?: string
  targetUsers?: string
  intendedUse?: string
  sectors?: string
  languageSupportType?: string
  languages?: string
  website?: string
  license?: string
}

export function validateAIModelDetails(form: AIModelFormState, otherNames: string[]): AIModelDetailsErrors {
  const errors: AIModelDetailsErrors = {}
  const { metadata } = form
  const name = metadata.name.trim()

  if (!name) {
    errors.name = 'Enter a model name.'
  } else if (otherNames.some((existing) => existing.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = 'A model with this name already exists.'
  }

  if (!metadata.modelType) errors.modelType = 'Select a model type.'
  if (!metadata.domain) errors.domain = 'Select a domain.'
  if (!metadata.description.trim()) errors.description = 'Add a description of the model.'
  if (metadata.sectors.length === 0) errors.sectors = 'Select at least one sector.'
  if (!metadata.languageSupportType) errors.languageSupportType = 'Define how language support applies to this model.'
  if (metadata.languageSupportType === 'specific' && metadata.languages.length === 0) {
    errors.languages = 'Select at least one supported language.'
  }
  if (metadata.website.trim() && !isValidUrl(metadata.website.trim())) errors.website = 'Enter a valid website URL.'
  if (!metadata.license) errors.license = 'Select a usage license.'

  return errors
}

export interface AIModelVersionErrors {
  name?: string
}

export function validateAIModelVersion(version: Pick<AIModelVersion, 'name'>, otherNames: string[]): AIModelVersionErrors {
  const errors: AIModelVersionErrors = {}
  const name = version.name.trim()

  if (!name) {
    errors.name = 'Enter a version name.'
  } else if (otherNames.some((existing) => existing.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = 'This version already exists.'
  }

  return errors
}

export interface AIModelAccessMethodErrors {
  name?: string
  provider?: string
  modelId?: string
  apiKey?: string
  endpointUrl?: string
  headerName?: string
  credentialValue?: string
  timeoutSeconds?: string
  responsePath?: string
}

const RESPONSE_PATH_PATTERN = /^[A-Za-z0-9_.[\]]+$/

/** Provider-specific credential label — surfaced in error copy so a Together AI
 * contributor never sees a generic "API key" message meant for OpenAI. */
function apiKeyFieldLabel(provider: AIModelAccessMethod['provider']): string {
  if (provider === 'openai') return 'OpenAI API key'
  if (provider === 'together-ai') return 'Together AI API key'
  if (provider === 'replicate') return 'Replicate API token'
  return 'API key'
}

/** Each provider is its own configuration shape: which fields exist, which are
 * required, and how they're validated all depend on `provider`. This is the
 * single source of truth both the form and the readiness/publish checks use. */
export function validateAIModelAccessMethod(
  accessMethod: Pick<
    AIModelAccessMethod,
    'name' | 'provider' | 'modelId' | 'apiKey' | 'endpointUrl' | 'authType' | 'headerName' | 'credentialValue' | 'timeoutSeconds' | 'responsePath'
  >,
  otherNames: string[],
): AIModelAccessMethodErrors {
  const errors: AIModelAccessMethodErrors = {}
  const name = accessMethod.name.trim()

  if (!name) {
    errors.name = 'Enter a name for this access method.'
  } else if (otherNames.some((existing) => existing.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = 'This access method already exists for the version.'
  }

  if (!accessMethod.provider) {
    errors.provider = 'Select a provider.'
    return errors
  }

  if (!accessMethod.modelId.trim()) errors.modelId = 'Enter the provider model ID.'

  if (accessMethod.provider === 'openai' || accessMethod.provider === 'together-ai' || accessMethod.provider === 'replicate') {
    if (!accessMethod.apiKey.trim()) errors.apiKey = `Enter your ${apiKeyFieldLabel(accessMethod.provider)}.`
    return errors
  }

  if (accessMethod.provider === 'ollama') {
    const url = accessMethod.endpointUrl.trim()
    if (!url || !isValidUrl(url)) errors.endpointUrl = 'Enter a valid Ollama endpoint URL.'
    return errors
  }

  // provider === 'custom'
  const url = accessMethod.endpointUrl.trim()
  if (!url || !isValidUrl(url)) errors.endpointUrl = 'Enter a valid API endpoint URL.'

  if (accessMethod.authType === 'bearer-token') {
    if (!accessMethod.headerName.trim()) errors.headerName = 'Enter the authentication header name.'
    if (!accessMethod.credentialValue.trim()) errors.credentialValue = 'Enter the bearer token.'
  } else if (accessMethod.authType === 'api-key') {
    if (!accessMethod.headerName.trim()) errors.headerName = 'Enter the header or parameter name.'
    if (!accessMethod.credentialValue.trim()) errors.credentialValue = 'Enter the API key.'
  } else if (accessMethod.authType === 'custom-header') {
    if (!accessMethod.headerName.trim()) errors.headerName = 'Enter the header name.'
    if (!accessMethod.credentialValue.trim()) errors.credentialValue = 'Enter the header value.'
  }
  // authType === 'none' — no credential requested or required.

  if (accessMethod.timeoutSeconds.trim() && !isPositiveNumber(accessMethod.timeoutSeconds)) {
    errors.timeoutSeconds = 'Enter a positive number of seconds.'
  }
  if (accessMethod.responsePath.trim() && !RESPONSE_PATH_PATTERN.test(accessMethod.responsePath.trim())) {
    errors.responsePath = 'Use a path like choices[0].message.content.'
  }

  return errors
}

export type AccessMethodReadiness = 'ready' | 'incomplete'

/** Configuration Readiness ("is this sufficiently configured?") — distinct from
 * the AI Model's Draft/Pending/Published lifecycle Status. */
export function getAccessMethodReadiness(accessMethod: AIModelAccessMethod): AccessMethodReadiness {
  const errors = validateAIModelAccessMethod(accessMethod, [])
  return Object.values(errors).some(Boolean) ? 'incomplete' : 'ready'
}

/** Concise per-Version summary for the Versions table's "Access Methods" column —
 * never the technical config, just enough to say "is this version usable?" */
export function summarizeAccessMethods(accessMethods: AIModelAccessMethod[]): string {
  if (accessMethods.length === 0) return '0 configured'
  const ready = accessMethods.filter((a) => getAccessMethodReadiness(a) === 'ready').length
  const incomplete = accessMethods.length - ready
  if (incomplete === 0) return `${accessMethods.length} configured`
  return `${ready} ready · ${incomplete} incomplete`
}

export function getPrimaryAccessMethod(version: AIModelVersion | undefined): AIModelAccessMethod | undefined {
  if (!version) return undefined
  return version.accessMethods.find((a) => a.isPrimary) ?? version.accessMethods[0]
}

export type ModelAccessReadiness = 'ready' | 'incomplete' | 'not-configured'

/** Access readiness for the AI Model as a whole — used by the AI Models list
 * table's "Access" column. Reflects the Primary version's Primary access
 * method only, never exposes technical config. */
export function getModelAccessReadiness(form: AIModelFormState): ModelAccessReadiness {
  const primaryVersion = form.versions.find((v) => v.isPrimary) ?? form.versions[0]
  const primaryAccess = getPrimaryAccessMethod(primaryVersion)
  if (!primaryAccess) return 'not-configured'
  return getAccessMethodReadiness(primaryAccess) === 'ready' ? 'ready' : 'incomplete'
}

export interface AIModelReadinessIssue {
  section: 'Model Information' | 'Versions' | 'Access Methods'
  message: string
  step: 1 | 2
  versionId?: string
}

export function getAIModelReadinessIssues(form: AIModelFormState, otherModelNames: string[] = []): AIModelReadinessIssue[] {
  const issues: AIModelReadinessIssue[] = []

  Object.values(validateAIModelDetails(form, otherModelNames)).forEach((message) => {
    if (message) issues.push({ section: 'Model Information', message, step: 1 })
  })

  if (form.versions.length === 0) {
    issues.push({ section: 'Versions', message: 'Create at least one version.', step: 2 })
    return issues
  }

  const primaryVersions = form.versions.filter((v) => v.isPrimary)
  if (primaryVersions.length !== 1) {
    issues.push({ section: 'Versions', message: 'Mark exactly one version as Primary.', step: 2 })
  }
  const primaryVersion = primaryVersions[0] ?? form.versions[0]
  const otherVersionNames = form.versions.filter((v) => v.id !== primaryVersion.id).map((v) => v.name)
  Object.values(validateAIModelVersion(primaryVersion, otherVersionNames)).forEach((message) => {
    if (message) issues.push({ section: 'Versions', message, step: 2, versionId: primaryVersion.id })
  })

  if (primaryVersion.accessMethods.length === 0) {
    issues.push({
      section: 'Access Methods',
      message: 'Add at least one access method to the Primary version.',
      step: 2,
      versionId: primaryVersion.id,
    })
  } else {
    const primaryAccessMethods = primaryVersion.accessMethods.filter((a) => a.isPrimary)
    if (primaryVersion.accessMethods.length > 1 && primaryAccessMethods.length !== 1) {
      issues.push({
        section: 'Access Methods',
        message: 'Select a Primary Access Method for this version.',
        step: 2,
        versionId: primaryVersion.id,
      })
    }
    const primaryAccess = primaryAccessMethods[0] ?? primaryVersion.accessMethods[0]
    const otherAccessNames = primaryVersion.accessMethods.filter((a) => a.id !== primaryAccess.id).map((a) => a.name)
    Object.values(validateAIModelAccessMethod(primaryAccess, otherAccessNames)).forEach((message) => {
      if (message) issues.push({ section: 'Access Methods', message, step: 2, versionId: primaryVersion.id })
    })
  }

  return issues
}

export function isAIModelReadyToPublish(form: AIModelFormState, otherModelNames: string[] = []): boolean {
  return getAIModelReadinessIssues(form, otherModelNames).length === 0
}

export interface AIModelSuggestions {
  sectors: string[]
  targetUsers: string[]
  tags: string[]
  languages: string[]
}

const SECTOR_KEYWORDS: [string, string[]][] = [
  ['health', ['health', 'medical', 'clinical', 'disease', 'hospital', 'patient']],
  ['agriculture', ['crop', 'farm', 'agricultur', 'soil', 'irrigation', 'yield']],
  ['education', ['education', 'student', 'school', 'learning', 'curriculum']],
  ['environment', ['climate', 'environment', 'emission', 'pollution', 'weather', 'flood']],
  ['finance', ['finance', 'credit', 'loan', 'banking', 'payment', 'fraud']],
  ['urban-development', ['urban', 'city', 'infrastructure', 'housing', 'planning']],
  ['water-sanitation', ['water', 'sanitation', 'sewage']],
  ['transportation', ['traffic', 'transport', 'mobility', 'vehicle', 'logistics']],
  ['energy', ['energy', 'power', 'electricity', 'grid', 'solar']],
]

const TARGET_USER_KEYWORDS: [string, string[]][] = [
  ['researchers', ['research', 'study', 'academic', 'dataset']],
  ['developers', ['api', 'sdk', 'integrat', 'developer', 'endpoint']],
  ['analysts', ['analysis', 'dashboard', 'insight', 'analytics', 'forecast']],
  ['government-teams', ['government', 'policy', 'public sector', 'administration', 'ministry']],
  ['organisations', ['organisation', 'organization', 'ngo', 'enterprise', 'institution']],
  ['general-users', ['citizen', 'public', 'everyone', 'general', 'community']],
]

const DOMAIN_TO_SECTOR: Record<string, string> = {
  health: 'health',
  agriculture: 'agriculture',
  education: 'education',
  climate: 'environment',
  finance: 'finance',
  'urban-planning': 'urban-development',
}

function matchKeywords(text: string, table: [string, string[]][]): string[] {
  const lower = text.toLowerCase()
  return table.filter(([, words]) => words.some((word) => lower.includes(word))).map(([key]) => key)
}

/** Infers likely classification values from what the contributor has already
 * typed so they can accept a chip instead of hunting through the taxonomy —
 * never applied automatically, always presented for the contributor to confirm. */
export function suggestAIModelClassification(
  metadata: Pick<AIModelMetadata, 'name' | 'description' | 'modelType' | 'domain'>,
): AIModelSuggestions {
  const text = `${metadata.name} ${metadata.description}`
  const domainSector = DOMAIN_TO_SECTOR[metadata.domain]
  const keywordSectors = matchKeywords(text, SECTOR_KEYWORDS)
  const sectors = Array.from(new Set([...(domainSector ? [domainSector] : []), ...keywordSectors])).slice(0, 4)

  const targetUsers = matchKeywords(text, TARGET_USER_KEYWORDS).slice(0, 3)

  const modelTypeLabel = MODEL_TYPE_OPTIONS.find((o) => o.value === metadata.modelType)?.label
  const domainLabel = DOMAIN_OPTIONS.find((o) => o.value === metadata.domain)?.label
  const sectorLabels = sectors
    .map((value) => SECTOR_OPTIONS.find((o) => o.value === value)?.label)
    .filter((label): label is string => Boolean(label))
  const tags = Array.from(new Set([modelTypeLabel, domainLabel, ...sectorLabels].filter((v): v is string => Boolean(v)))).slice(0, 5)

  const languages = text.trim() ? ['en'] : []

  return { sectors, targetUsers, tags, languages }
}
