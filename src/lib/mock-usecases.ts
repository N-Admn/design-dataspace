import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import type { UploadedAsset } from '@/lib/generic-upload'
import type { UseCaseFormState, UseCaseRecord } from '@/types/usecase'

function fakeAsset(url: string, name: string): UploadedAsset {
  return {
    id: `asset-${name}`,
    name,
    extension: 'jpg',
    sizeLabel: '1.2 MB',
    sizeBytes: 1_200_000,
    uploadedAt: '06/08/2026 09:00:00',
    dataUrl: url,
  }
}

const useCase1Form: UseCaseFormState = {
  metadata: {
    thumbnail: fakeAsset('https://picsum.photos/seed/maternal-health/1200/675', 'hero.jpg'),
    title: 'Maternal Health Monitoring in Rural Districts',
    subtitle:
      'How twelve districts used open health-facility data to close a maternal mortality gap that outlived a decade of infrastructure spending.',
    tags: ['Maternal Health', 'Rural', 'Monitoring'],
    sdgGoals: ['sdg-3', 'sdg-5'],
    sectors: ['health'],
    geographies: ['india'],
  },
  blocks: [
    { id: 'block-seed-1', type: 'heading', text: 'The Challenge', level: 2 },
    {
      id: 'block-seed-2',
      type: 'text',
      html:
        '<p>Maternal mortality in several rural districts remained above the national average despite a decade of health infrastructure investment. Facilities existed on paper, but frontline workers had no shared way to see which ones actually had staff, supplies, and functioning referral links on any given day.</p><p>A team of public health researchers and district officials set out to answer a simple question: was the gap about missing infrastructure, or about invisible infrastructure?</p>',
    },
    {
      id: 'block-seed-3',
      type: 'image',
      asset: fakeAsset('https://picsum.photos/seed/health-worker/1000/650', 'field-visit.jpg'),
      caption: 'A community health worker records facility readiness data during a routine district visit.',
    },
    { id: 'block-seed-4', type: 'heading', text: 'What the data showed', level: 2 },
    {
      id: 'block-seed-5',
      type: 'text',
      html:
        '<p>Cross-referencing facility registries with service-availability surveys revealed that nearly a third of listed maternal care centres were operating below minimum staffing thresholds. Referral times between primary centres and district hospitals varied by as much as 4x across geographically similar blocks.</p><ul><li>28% of primary health centres lacked a resident midwife</li><li>Average referral time to emergency obstetric care: 96 minutes</li><li>Only 41% of facilities reported functioning blood-storage units</li></ul>',
    },
    {
      id: 'block-seed-6',
      type: 'highlight',
      highlight: '32% reduction in maternal mortality',
      supportingText: 'Observed across the 12 pilot districts within 18 months of the outreach programme launch.',
    },
    { id: 'block-seed-7', type: 'heading', text: 'From data to action', level: 3 },
    {
      id: 'block-seed-8',
      type: 'text',
      html:
        '<p>District health officers used the published dataset to reroute mobile midwife deployments toward the lowest-staffed facilities and renegotiate ambulance contracts along the slowest referral corridors. Within six months, average referral time fell from 96 to 52 minutes.</p>',
    },
    {
      id: 'block-seed-9',
      type: 'chart',
      chartId: 'chart-referral-time',
      chartTitle: 'Average obstetric referral time, before vs. after intervention',
      caption: 'District-level referral times narrowed sharply after mobile deployment was reprioritised using the open facility dataset.',
    },
    {
      id: 'block-seed-10',
      type: 'link',
      url: 'https://civicdataspace.in/datasets/district-health-infrastructure-2024',
      label: 'District Health Infrastructure & Service Availability (2024)',
      description: 'The full facility-level dataset used to identify staffing and referral gaps.',
    },
  ],
  connections: {
    datasets: [{ id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' }],
    contributors: [
      { id: 'contributor-seed-1', name: 'Dr. Aisha Verma', role: 'Public Health Researcher' },
      { id: 'contributor-seed-2', name: 'Rohan Mehta', role: 'Data Analyst, District Health Mission' },
    ],
    organizations: [MOCK_ORGANISATIONS[1], MOCK_ORGANISATIONS[2]],
  },
}

const useCase2Form: UseCaseFormState = {
  metadata: {
    thumbnail: null,
    title: 'Urban Water Access Gap Analysis',
    subtitle: '',
    tags: [],
    sdgGoals: ['sdg-6'],
    sectors: ['water-sanitation'],
    geographies: [],
  },
  blocks: [],
  connections: {
    datasets: [],
    contributors: [],
    organizations: [],
  },
}

export const MOCK_USE_CASE_RECORDS: UseCaseRecord[] = [
  {
    id: 'usecase-1',
    status: 'published',
    updatedAt: '06/08/2026 10:20:00',
    form: useCase1Form,
    publishedForm: useCase1Form,
  },
  {
    id: 'usecase-2',
    status: 'draft',
    updatedAt: '11/08/2026 15:42:00',
    form: useCase2Form,
    publishedForm: null,
  },
]
