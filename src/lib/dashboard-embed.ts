import type { UseCaseFormState } from '@/types/usecase'

/** Pulls the iframe's `src` out of pasted embed code. Only used to accept embed
 * code pasted where a URL is expected, and to migrate records saved before the
 * dashboard field became a plain URL. */
export function extractIframeSrc(code: string): string | null {
  const match = code.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)
  if (!match) return null
  const src = match[1].trim()
  return /^https?:\/\//i.test(src) ? src : null
}

/** Turns what an author pasted into the dashboard URL to embed, or null if it
 * isn't usable. Takes a plain http(s) link; if they pasted a provider's full
 * iframe embed code instead, its `src` is used. Deliberately format-only — no
 * provider-specific checks. The app builds the <iframe> itself from this URL,
 * so pasted HTML is never rendered. */
export function parseDashboardUrl(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (/<iframe/i.test(value)) return extractIframeSrc(value)
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** Records saved before the switch stored raw embed code in `dashboardEmbedCode`
 * and have no `dashboardUrl` — convert that to the URL it pointed at. */
export function withDashboardUrl(form: UseCaseFormState & { dashboardEmbedCode?: string }): UseCaseFormState {
  if (typeof form.dashboardUrl === 'string') return form
  const { dashboardEmbedCode, ...rest } = form
  return { ...rest, dashboardUrl: dashboardEmbedCode ? (extractIframeSrc(dashboardEmbedCode) ?? '') : '' }
}
