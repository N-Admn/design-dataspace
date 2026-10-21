/** Organisation logos, by organisation.
 *
 *  An organisation's logo is, in order:
 *  1. the one it uploaded;
 *  2. a local copy of its real logo, if one is saved in `src/assets/org-logos` (one file per website domain, such as `who.int.webp`);
 *  3. a mock logo from `src/assets/org-logos/mock`, picked from the organisation's name, so the same organisation always gets the same one.
 *
 *  Nothing is requested from an outside service, and no organisation is left with a placeholder. Placeholder domains (example.*, test,
 *  local, localhost) never match a real logo, so they get a mock. */

import type { UploadedAsset } from '@/lib/generic-upload'

const PLACEHOLDER_HOST = /(^|\.)(example(\.[a-z]+)?|test|invalid|local|localhost)$/i

/** The local copies of real logos, by domain: `src/assets/org-logos/who.int.webp` is the logo for who.int. */
const LOCAL_FILES = import.meta.glob('/src/assets/org-logos/*.webp', { eager: true, import: 'default' }) as Record<string, string>
const LOCAL = new Map(Object.entries(LOCAL_FILES).map(([path, url]) => [path.split('/').pop()!.replace(/\.webp$/, ''), url]))

/** The mock logos, in file order (`mock-01.png`, `mock-02.png`, …). */
const MOCK_FILES = import.meta.glob('/src/assets/org-logos/mock/*.png', { eager: true, import: 'default' }) as Record<string, string>
const MOCKS = Object.entries(MOCK_FILES)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

const SITE_LOGOS = new Set([...LOCAL.values(), ...MOCKS])

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

/** The local copy of a website's real logo, if there is one. */
export function siteLogoUrl(website: string | undefined): string | undefined {
  const host = hostOf(website)
  return host ? LOCAL.get(host) : undefined
}

/** A mock logo for a name: always the same one for the same name. */
export function mockOrgLogo(name: string): string {
  let h = 0
  for (const ch of name.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return MOCKS[h % MOCKS.length]
}

/** An organisation's logo, by name and (optionally) its uploaded logo and website. Never empty. */
export function orgLogoFor(name: string | undefined, uploaded?: string | null, website?: string): string {
  return uploaded || siteLogoUrl(website) || mockOrgLogo(name || website || 'organisation')
}

/** An organisation workspace's logo, with the same order. */
export function organisationLogoUrl(org: { name?: string; logo?: { dataUrl?: string } | null; website?: string }): string {
  return orgLogoFor(org.name, org.logo?.dataUrl, org.website)
}

/** For sample data: a logo "upload" that is really a logo file, so every place that shows a stored logo shows it. */
export function siteLogoAsset(domain: string, name: string): UploadedAsset {
  const url = orgLogoFor(name, null, domain)
  return { id: `asset-logo-${name}`, name: `${name}.${url.includes('.png') ? 'png' : 'webp'}`, extension: url.includes('.png') ? 'png' : 'webp', sizeLabel: '', sizeBytes: 0, uploadedAt: '06/08/2026 09:00:00', dataUrl: url }
}

/** Whether a URL is one of these logo files (as opposed to an uploaded photo). */
const isSiteLogo = (url: string | null | undefined) => Boolean(url) && SITE_LOGOS.has(url!)

/** How to fit a logo image in a round frame. These logos are squares with their own background, so in a circle they are shown whole
 *  with the margin that keeps their corners inside it (a square inscribed in a circle is about 70% of its width, so about 15% a side);
 *  anything else, such as an uploaded photo, fills the circle.
 *
 *  `padding` is a Tailwind padding class worked out from the image's own size (p-2 on a 56px image). It is not a percentage on purpose:
 *  a percentage padding is measured against the *parent's* width, so in a wide parent (a pill, a card) it would swallow the whole image. */
export function logoFit(url: string | null | undefined, padding = 'p-1.5'): string {
  return isSiteLogo(url) ? `bg-white object-contain ${padding}` : 'object-cover'
}
