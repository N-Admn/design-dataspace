/** Pulls the iframe's `src` out of pasted embed code. Deliberately simple format
 * validation only (well-formed iframe tag + an http(s) src) — no provider-specific
 * checks, per the prototype scope. Also means an <iframe> is only ever built from
 * a `src` we've extracted ourselves, never from blindly rendered pasted HTML. */
export function extractIframeSrc(code: string): string | null {
  const match = code.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)
  if (!match) return null
  const src = match[1].trim()
  return /^https?:\/\//i.test(src) ? src : null
}
