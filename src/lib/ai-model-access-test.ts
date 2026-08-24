import type { AIModelAccessMethod } from '@/types/ai-model'
import { validateAIModelAccessMethod } from '@/lib/ai-model-validation'

/** Outcomes an executed (or attempted) test can resolve to. "Not Tested" and
 * "Testing" are UI-only states (absence of a result / a test in flight) and
 * intentionally aren't part of this type — see AIModelVersionsStep.tsx. */
export type AccessMethodTestStatus =
  | 'success'
  | 'auth-failed'
  | 'connection-failed'
  | 'invalid-request'
  | 'response-extraction-failed'
  | 'timeout'
  | 'incomplete'

export interface AccessMethodDiagnosticStep {
  stage: string
  status: 'pass' | 'fail'
  message: string
  sequence: number
}

/** Structured result for one Access Method's test run. `configSignature` and
 * `testInputSignature` are what the drawer uses to detect a result has gone
 * stale — see computeAccessMethodConfigSignature / computeTestInputSignature. */
export interface AccessMethodTestResult {
  accessMethodId: string
  status: AccessMethodTestStatus
  startedAt: string
  completedAt: string
  durationMs: number
  steps: AccessMethodDiagnosticStep[]
  message: string
  configSignature: string
  testInputSignature: string
}

/** Everything that affects how a test would execute — deliberately excludes
 * id/name/isPrimary, which don't change what a test does. */
export function computeAccessMethodConfigSignature(accessMethod: AIModelAccessMethod): string {
  return JSON.stringify({
    provider: accessMethod.provider,
    modelId: accessMethod.modelId,
    apiKey: accessMethod.apiKey,
    endpointUrl: accessMethod.endpointUrl,
    authType: accessMethod.authType,
    headerName: accessMethod.headerName,
    apiKeyLocation: accessMethod.apiKeyLocation,
    credentialValue: accessMethod.credentialValue,
    requestBody: accessMethod.requestBody,
    responsePath: accessMethod.responsePath,
    timeoutSeconds: accessMethod.timeoutSeconds,
  })
}

export function computeTestInputSignature(testInput: string): string {
  return testInput.trim()
}

function maskCredential(value: string): string {
  const length = Math.min(10, Math.max(4, value.trim().length))
  return '•'.repeat(length)
}

function hashString(value: string): number {
  let hash = 7
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/**
 * Reusable, provider-aware testing layer — deliberately isolated from the
 * Version drawer / Access Method configuration UI so it can be called for a
 * single re-test or fanned out across a whole batch without duplicating
 * logic (see AIModelVersionsStep.tsx's runSingleTest / runBatchTest).
 *
 * This app has no backend able to make a live provider request — and never
 * should make one directly from the browser, since that means shipping the
 * stored API key/token to the client and running into provider CORS
 * restrictions. A real implementation swaps only the body of this function
 * for a call to a server-side endpoint that executes the request with the
 * same (accessMethod, testInput) => Promise<AccessMethodTestResult> contract,
 * keeping credentials server-side and timeouts properly enforced.
 *
 * Until that exists, this function performs the one check that's genuinely
 * real client-side (Configuration Validation, via the same
 * validateAIModelAccessMethod used at save time; and Request Body Template
 * JSON validity) and otherwise simulates the remaining execution stages.
 */
export async function testAccessMethod(accessMethod: AIModelAccessMethod, testInput: string): Promise<AccessMethodTestResult> {
  const startedAt = new Date().toISOString()
  const startMs = Date.now()
  const configSignature = computeAccessMethodConfigSignature(accessMethod)
  const testInputSignature = computeTestInputSignature(testInput)
  const steps: AccessMethodDiagnosticStep[] = []
  let sequence = 0
  const addStep = (stage: string, status: 'pass' | 'fail', message: string) => {
    sequence += 1
    steps.push({ stage, status, message, sequence })
  }
  const finish = (status: AccessMethodTestStatus, message: string): AccessMethodTestResult => ({
    accessMethodId: accessMethod.id,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    steps,
    message,
    configSignature,
    testInputSignature,
  })

  // Real, deterministic check — reuses the exact same validation as Save, so
  // a config that can't be saved can't be reported as "tested" either. An
  // incomplete config is never attempted (no simulated network delay).
  const errors = validateAIModelAccessMethod(accessMethod, [])
  const firstError = Object.values(errors).find(Boolean)
  if (firstError) {
    addStep('Configuration Validation', 'fail', firstError)
    return finish('incomplete', firstError)
  }
  addStep('Configuration Validation', 'pass', 'All required fields for this provider are present.')

  await delay(900)

  if (accessMethod.provider === 'openai' || accessMethod.provider === 'together-ai' || accessMethod.provider === 'replicate') {
    addStep('Authentication Setup', 'pass', `API Key configured (${maskCredential(accessMethod.apiKey)})`)
  } else if (accessMethod.provider === 'custom') {
    if (accessMethod.authType === 'none') {
      addStep('Authentication Setup', 'pass', 'No authentication configured.')
    } else {
      const header = accessMethod.headerName || 'Authorization'
      const prefix = accessMethod.authType === 'bearer-token' ? 'Bearer ' : ''
      addStep('Authentication Setup', 'pass', `${header}: ${prefix}${maskCredential(accessMethod.credentialValue)}`)
    }
  }
  // Ollama has no authentication stage — it isn't relevant to that provider.

  const credential = accessMethod.apiKey || accessMethod.credentialValue
  if (credential && /demo|sample|placeholder|xxxx/i.test(credential)) {
    const last = steps[steps.length - 1]
    if (last && last.stage === 'Authentication Setup') {
      steps[steps.length - 1] = { ...last, status: 'fail', message: 'The provider rejected the configured credentials.' }
    } else {
      addStep('Authentication Setup', 'fail', 'The provider rejected the configured credentials.')
    }
    return finish('auth-failed', 'The provider rejected the configured credentials.')
  }

  if (accessMethod.provider === 'custom' && accessMethod.requestBody.trim()) {
    try {
      JSON.parse(accessMethod.requestBody)
      addStep('Request Construction', 'pass', 'Request body generated from the configured template.')
    } catch {
      addStep('Request Construction', 'fail', 'Request Body Template is not valid JSON.')
      return finish('invalid-request', 'The request could not be created from the current configuration.')
    }
  } else {
    addStep('Request Construction', 'pass', `Request prepared for model "${accessMethod.modelId}".`)
  }

  if (accessMethod.provider === 'custom' && accessMethod.timeoutSeconds && Number(accessMethod.timeoutSeconds) <= 2) {
    addStep('Connection', 'fail', `No response within the configured ${accessMethod.timeoutSeconds}s timeout.`)
    return finish('timeout', `The provider did not respond within the configured ${accessMethod.timeoutSeconds}s timeout.`)
  }

  const endpoint = accessMethod.endpointUrl.trim()
  let unreachable = false
  if (accessMethod.provider === 'ollama') {
    unreachable = Boolean(endpoint) && !/^https?:\/\//i.test(endpoint)
  } else if (endpoint) {
    try {
      unreachable = /example\.(com|org|net)$/i.test(new URL(endpoint).hostname)
    } catch {
      unreachable = true
    }
  }
  if (unreachable) {
    addStep('Connection', 'fail', 'The endpoint could not be reached.')
    return finish('connection-failed', 'The endpoint could not be reached.')
  }
  addStep('Connection', 'pass', endpoint ? `Connected to ${endpoint}.` : 'Connected to the provider.')
  addStep('Response Received', 'pass', 'Provider returned a response.')

  if (accessMethod.provider === 'custom' && accessMethod.responsePath.trim()) {
    if (hashString(accessMethod.responsePath + testInput) % 9 === 0) {
      addStep('Response Extraction', 'fail', `No value found at response path "${accessMethod.responsePath}".`)
      return finish('response-extraction-failed', 'A response was received, but the configured response path did not return the expected value.')
    }
    addStep('Response Extraction', 'pass', `Value extracted from "${accessMethod.responsePath}".`)
  } else {
    addStep('Response Extraction', 'pass', 'Response parsed successfully.')
  }

  return finish('success', 'The access method responded successfully to the test request.')
}
