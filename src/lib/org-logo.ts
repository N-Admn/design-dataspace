/** Organisation logos, looked up by the organisation's website.
 *
 *  - An organisation's own uploaded logo always wins.
 *  - Next come the local copies in `src/assets/org-logos` (one file per website domain), so the logos of the organisations used in the sample
 *    data need no outside service. Those copies were fetched through Logo.dev's API; see the README in that folder.
 *  - Any other website falls back to Logo.dev's image service, only when a publishable key (`pk_…`, safe in the browser) is set in
 *    `VITE_LOGO_DEV_TOKEN`. `fallback=monogram` makes it draw a letter badge for a domain it has no logo for, so the image never breaks.
 *    Logo.dev's free plan asks commercial sites to show a link back to them; add one before relying on this in production.
 *  - With no local copy and no key, nothing is requested and the placeholder stays.
 *  - Placeholder domains (example.*, test, local, localhost) are skipped, so sample data using them keeps its own placeholders. */

import type { UploadedAsset } from '@/lib/generic-upload'

const TOKEN = (import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined)?.trim()
const PLACEHOLDER_HOST = /(^|\.)(example(\.[a-z]+)?|test|invalid|local|localhost)$/i

/** Domains whose Logo.dev image is blank, so a placeholder is better than the picture. */
const NO_LOGO = new Set(['wateraid.org'])

/** The local copies, by domain: `src/assets/org-logos/who.int.webp` is the logo for who.int. */
const LOCAL_FILES = import.meta.glob('/src/assets/org-logos/*.webp', { eager: true, import: 'default' }) as Record<string, string>
const LOCAL = new Map(Object.entries(LOCAL_FILES).map(([path, url]) => [path.split('/').pop()!.replace(/\.webp$/, ''), url]))
const LOCAL_URLS = new Set(LOCAL.values())

function hostOf(website: string | undefined): string | null {
  const raw = website?.trim()
  if (!raw) return null
  try {
    const host = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./i, '')
    return host.includes('.') && !PLACEHOLDER_HOST.test(host) && !NO_LOGO.has(host) ? host : null
  } catch {
    return null
  }
}

/** The logo for a website: the local copy if there is one, else Logo.dev's image when a key is set, else undefined. */
export function siteLogoUrl(website: string | undefined, size = 128): string | undefined {
  const host = hostOf(website)
  if (!host) return undefined
  const local = LOCAL.get(host)
  if (local) return local
  if (!TOKEN) return undefined
  return `https://img.logo.dev/${encodeURIComponent(host)}?token=${encodeURIComponent(TOKEN)}&size=${size}&format=png&retina=true&fallback=monogram`
}

/** An organisation's logo: the uploaded one, else the one for its website, else null (the caller's placeholder). */
export function organisationLogoUrl(org: { logo?: { dataUrl?: string } | null; website?: string }): string | null {
  return org.logo?.dataUrl || siteLogoUrl(org.website) || null
}

/** For sample data: a logo "upload" that is really the logo for a domain, so every place that shows a stored logo shows it.
 *  Null when there is none, which leaves the usual placeholder. */
export function siteLogoAsset(domain: string, name: string): UploadedAsset | null {
  const url = siteLogoUrl(domain)
  return url ? { id: `asset-logo-${name}`, name: `${name}.webp`, extension: 'webp', sizeLabel: '', sizeBytes: 0, uploadedAt: '06/08/2026 09:00:00', dataUrl: url } : null
}

/** Whether a URL is a website logo (a local copy or Logo.dev's), as opposed to an uploaded photo. */
const isSiteLogo = (url: string | null | undefined) => Boolean(url) && (LOCAL_URLS.has(url!) || url!.startsWith('https://img.logo.dev/'))

/** How to fit a logo image in a round frame. Website logos are squares with their own background, so in a circle they are shown whole
 *  with the margin that keeps their corners inside it (a square inscribed in a circle is about 70% of its width, so about 15% a side);
 *  anything else, such as an uploaded photo, fills the circle.
 *
 *  `padding` is a Tailwind padding class worked out from the image's own size (p-2 on a 56px image). It is not a percentage on purpose:
 *  a percentage padding is measured against the *parent's* width, so in a wide parent (a pill, a card) it would swallow the whole image. */
export function logoFit(url: string | null | undefined, padding = 'p-1.5'): string {
  return isSiteLogo(url) ? `bg-white object-contain ${padding}` : 'object-cover'
}
