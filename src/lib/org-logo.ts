/** Organisation logos from Logo.dev (https://github.com/logo-dev/logo-api), looked up by the organisation's website.
 *
 *  - It is only a fallback: an organisation's own uploaded logo always wins.
 *  - Needs a Logo.dev *publishable* key (`pk_…`, safe in the browser) in `VITE_LOGO_DEV_TOKEN`. With no key set nothing is requested and
 *    every placeholder stays as it was.
 *  - `fallback=monogram` makes Logo.dev draw a letter badge for a domain it has no logo for, so the image never breaks.
 *  - Placeholder domains (example.*, test, local, localhost) are skipped, so the sample data keeps its own placeholders.
 *  - Logo.dev's free plan asks commercial sites to show a link back to Logo.dev; add one before this goes live. */

import type { UploadedAsset } from '@/lib/generic-upload'

const TOKEN = (import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined)?.trim()
const PLACEHOLDER_HOST = /(^|\.)(example(\.[a-z]+)?|test|invalid|local|localhost)$/i

function hostOf(website: string | undefined): string | null {
  const raw = website?.trim()
  if (!raw) return null
  try {
    const host = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./i, '')
    return host.includes('.') && !PLACEHOLDER_HOST.test(host) ? host : null
  } catch {
    return null
  }
}

/** The Logo.dev image for a website, or undefined when there is no key or no usable domain. */
export function logoDevUrl(website: string | undefined, size = 128): string | undefined {
  const host = hostOf(website)
  if (!TOKEN || !host) return undefined
  return `https://img.logo.dev/${encodeURIComponent(host)}?token=${encodeURIComponent(TOKEN)}&size=${size}&format=png&retina=true&fallback=monogram`
}

/** An organisation's logo: the uploaded one, else the Logo.dev one for its website, else null (the caller's placeholder). */
export function organisationLogoUrl(org: { logo?: { dataUrl?: string } | null; website?: string }): string | null {
  return org.logo?.dataUrl || logoDevUrl(org.website) || null
}

/** For sample data: a logo "upload" that is really the Logo.dev image for a domain, so every place that shows a stored logo shows it.
 *  Null without a key, which leaves the usual placeholder. */
export function logoDevAsset(domain: string, name: string): UploadedAsset | null {
  const url = logoDevUrl(domain)
  return url ? { id: `asset-logodev-${name}`, name: `${name}.png`, extension: 'png', sizeLabel: '', sizeBytes: 0, uploadedAt: '06/08/2026 09:00:00', dataUrl: url } : null
}

/** How to fit a logo image in a round frame. Logo.dev logos are squares with their own background, so in a circle they are shown whole
 *  with the margin that keeps their corners inside it (a square inscribed in a circle is about 70% of its width, so about 15% a side);
 *  anything else, such as an uploaded photo, fills the circle.
 *
 *  `padding` is a Tailwind padding class worked out from the image's own size (p-2 on a 56px image). It is not a percentage on purpose:
 *  a percentage padding is measured against the *parent's* width, so in a wide parent (a pill, a card) it would swallow the whole image. */
export function logoFit(url: string | null | undefined, padding = 'p-1.5'): string {
  return url?.startsWith('https://img.logo.dev/') ? `bg-white object-contain ${padding}` : 'object-cover'
}
