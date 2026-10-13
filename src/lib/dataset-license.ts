import { isValidHttpUrl } from '@/lib/validation'
import { LICENSE_TERMS_URLS, type DatasetMetadata } from '@/types/dataset'

/** The licence option that asks for the user's own link. */
export const CUSTOM_LICENSE_VALUE = 'other'

/** Where to read the licence terms: the custom link when the licence is "Other" (only if it is a real http(s) address, so a
 *  stored value can never become a `javascript:` link), otherwise the canonical page for the chosen option, if it has one. */
export function resolveLicenseUrl(metadata: Pick<DatasetMetadata, 'license' | 'licenseUrl'>): string | undefined {
  if (metadata.license === CUSTOM_LICENSE_VALUE) {
    const url = (metadata.licenseUrl ?? '').trim()
    return url && isValidHttpUrl(url) ? url : undefined
  }
  return metadata.license ? LICENSE_TERMS_URLS[metadata.license] : undefined
}
