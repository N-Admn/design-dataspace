import type { UploadedAsset } from '@/lib/generic-upload'
import type { CollaborativeFormState, CollaborativeRecord } from '@/types/collaborative'

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

const collaborative1Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(
      'https://images.pexels.com/photos/76969/cold-front-warm-front-hurricane-felix-76969.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'hero.jpg',
    ),
    name: 'Climate and Health Data Collaborative',
    slug: 'climate-health-data',
    descriptionHtml:
      '<p>A cross-sector initiative bringing together health and climate researchers to track the public-health impact of extreme weather events, and to make that data openly available for policy planning.</p>',
    externalUrl: 'https://civicdatalab.in',
    sectors: ['health', 'environment'],
    sdgGoals: ['sdg-3', 'sdg-13'],
    tags: ['Climate', 'Health', 'Disaster Resilience'],
    geographies: ['india'],
  },
  connections: {
    people: [
      { refId: 'org-1', kind: 'organisation', name: 'CivicDataLab', context: 'Registered organisation', relationship: 'partner' },
      { refId: 'person-1', kind: 'person', name: 'Dr. Aisha Verma', context: 'Public Health Researcher', relationship: 'contributor' },
    ],
    datasets: [{ id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' }],
    useCases: [{ id: 'usecase-1', title: 'Maternal Health Monitoring in Rural Districts' }],
  },
}

const collaborative2Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(
      'https://images.pexels.com/photos/17609960/pexels-photo-17609960.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'hero.jpg',
    ),
    name: 'Urban Water Resilience Network',
    slug: 'urban-water-resilience',
    descriptionHtml: '',
    externalUrl: '',
    sectors: ['water-sanitation'],
    sdgGoals: ['sdg-6'],
    tags: [],
    geographies: [],
  },
  connections: {
    people: [],
    datasets: [],
    useCases: [],
  },
}

export const MOCK_COLLABORATIVE_RECORDS: CollaborativeRecord[] = [
  {
    id: 'collaborative-1',
    status: 'published',
    updatedAt: '10/08/2026 09:15:00',
    form: collaborative1Form,
    publishedForm: collaborative1Form,
  },
  {
    id: 'collaborative-2',
    status: 'draft',
    updatedAt: '15/08/2026 14:05:00',
    form: collaborative2Form,
    publishedForm: null,
  },
]
