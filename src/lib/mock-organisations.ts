import type { Organisation } from '@/types/event'

export const MOCK_ORGANISATIONS: Organisation[] = [
  {
    id: 'org-1',
    name: 'CivicDataLab',
    url: 'https://civicdatalab.in',
    sectorType: 'technology',
    isRegistered: true,
  },
  {
    id: 'org-2',
    name: 'World Bank',
    url: 'https://worldbank.org',
    sectorType: 'multilateral',
    isRegistered: true,
  },
  {
    id: 'org-3',
    name: 'United Nations (Women)',
    url: 'https://unwomen.org',
    sectorType: 'multilateral',
    isRegistered: true,
  },
]
