import type { UploadedAsset } from '@/lib/generic-upload'
import type { Organisation } from '@/types/event'

/** Mockup logo — a stand-in square image, not this organisation's real
 *  branding (see the rest of the mock data's use of stock photography for
 *  fictional speakers/covers). Gives event Organiser/Partner rows and card
 *  publisher avatars an actual image instead of a generic building icon or
 *  bare initials. */
function fakeLogo(url: string, name: string): UploadedAsset {
  return {
    id: `asset-${name}`,
    name,
    extension: 'jpg',
    sizeLabel: '48 KB',
    sizeBytes: 48_000,
    uploadedAt: '06/08/2026 09:00:00',
    dataUrl: url,
  }
}

export const MOCK_ORGANISATIONS: Organisation[] = [
  {
    id: 'org-1',
    name: 'CivicDataLab',
    url: 'https://civicdatalab.in',
    sectorType: 'technology',
    logo: fakeLogo('https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=200', 'civicdatalab-logo.jpg'),
    isRegistered: true,
  },
  {
    id: 'org-2',
    name: 'World Bank',
    url: 'https://worldbank.org',
    sectorType: 'multilateral',
    logo: fakeLogo('https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=200', 'world-bank-logo.jpg'),
    isRegistered: true,
  },
  {
    id: 'org-3',
    name: 'United Nations (Women)',
    url: 'https://unwomen.org',
    sectorType: 'multilateral',
    logo: fakeLogo('https://images.pexels.com/photos/2990650/pexels-photo-2990650.jpeg?auto=compress&cs=tinysrgb&w=200', 'un-women-logo.jpg'),
    isRegistered: true,
  },
]
