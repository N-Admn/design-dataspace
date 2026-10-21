import { logoDevAsset } from '@/lib/org-logo'
import type { Organisation } from '@/types/event'

export const MOCK_ORGANISATIONS: Organisation[] = [
  {
    id: 'org-1',
    name: 'CivicDataLab',
    url: 'https://civicdatalab.in',
    sectorType: 'technology',
    logo: logoDevAsset('civicdatalab.in', 'civicdatalab') ?? undefined,
    isRegistered: true,
  },
  {
    id: 'org-2',
    name: 'World Bank',
    url: 'https://worldbank.org',
    sectorType: 'multilateral',
    logo: logoDevAsset('worldbank.org', 'world-bank') ?? undefined,
    isRegistered: true,
  },
  {
    id: 'org-3',
    name: 'United Nations (Women)',
    url: 'https://unwomen.org',
    sectorType: 'multilateral',
    logo: logoDevAsset('unwomen.org', 'un-women') ?? undefined,
    isRegistered: true,
  },
]
