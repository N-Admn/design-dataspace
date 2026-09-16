import type { UploadedAsset } from '@/lib/generic-upload'
import type { PublicationFormState, PublicationRecord } from '@/types/publication'

function fakeAsset(name: string, extension: string, sizeLabel: string): UploadedAsset {
  return {
    id: `asset-${name}`,
    name,
    extension,
    sizeLabel,
    sizeBytes: 2_400_000,
    uploadedAt: '02/08/2026 11:00:00',
  }
}

const publication1Form: PublicationFormState = {
  metadata: {
    name: 'State of Open Water Data in South Asia',
    description:
      'A cross-country review of open water and sanitation datasets published by government bodies, covering coverage gaps, licensing practices, and recommendations for standardisation.',
    authors: ['Dr. Meera Krishnan', 'Farhan Ali'],
    date: '2026-07-15',
    sector: 'water-sanitation',
    geography: 'global',
    usageRights: 'cc-by-4.0',
    resourceType: 'research',
    externalLink: 'https://civicdatalab.in/research/open-water-data',
  },
  blocks: [
    {
      id: 'pub-block-1',
      type: 'file',
      title: 'Full Research Report (PDF)',
      asset: fakeAsset('open-water-data-report.pdf', 'PDF', '4.8 MB'),
    },
    {
      id: 'pub-block-2',
      type: 'video',
      title: 'Findings walkthrough',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'pub-block-3',
      type: 'file',
      title: 'Presentation Slide Deck',
      asset: fakeAsset('open-water-data-slides.pptx', 'PPTX', '2.1 MB'),
    },
  ],
}

const publication2Form: PublicationFormState = {
  metadata: {
    name: 'Community Health Worker Field Notes — Q2 2026',
    description: '',
    authors: [],
    date: '',
    sector: '',
    geography: '',
    usageRights: '',
    resourceType: 'field-note',
    externalLink: '',
  },
  blocks: [],
}

export const MOCK_PUBLICATION_RECORDS: PublicationRecord[] = [
  {
    id: 'publication-1',
    status: 'published',
    updatedAt: '15/07/2026 09:30:00',
    form: publication1Form,
    publishedForm: publication1Form,
  },
  {
    id: 'publication-2',
    status: 'draft',
    updatedAt: '20/08/2026 16:05:00',
    form: publication2Form,
    publishedForm: null,
  },
]
