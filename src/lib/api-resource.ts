import type { DatasetResourceApiConfig } from '@/types/dataset'

export interface ApiConnectionTestResult {
  success: boolean
  message: string
}

/** Simulated connection check — validates the URL shape since there's no live backend to call. */
export function testApiConnection(config: DatasetResourceApiConfig): Promise<ApiConnectionTestResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      try {
        const parsed = new URL(config.url)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          resolve({ success: false, message: 'URL must use http or https.' })
          return
        }
        if (config.authMethod === 'api-key' && !config.apiKey.trim()) {
          resolve({ success: false, message: 'Enter an API key to authenticate the request.' })
          return
        }
        if (config.authMethod === 'bearer-token' && !config.bearerToken.trim()) {
          resolve({ success: false, message: 'Enter a bearer token to authenticate the request.' })
          return
        }
        resolve({
          success: true,
          message: 'API endpoint is reachable and returned a valid response.',
        })
      } catch {
        resolve({
          success: false,
          message: 'Unable to connect to this API. Check the endpoint URL, authentication, parameters, or headers and try again.',
        })
      }
    }, 700)
  })
}
