import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import type { UseCaseFormState, UseCaseRecord } from '@/types/usecase'

const useCase1Form: UseCaseFormState = {
  metadata: {
    thumbnail: null,
    title: 'Maternal Health Monitoring in Rural Districts',
    subtitle: 'Using district health survey data to track maternal care access and outcomes.',
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
      html: '<p>Maternal mortality in several rural districts remained above the national average despite existing health infrastructure investment.</p>',
    },
    {
      id: 'block-seed-3',
      type: 'highlight',
      highlight: '32% reduction in maternal mortality',
      supportingText: 'Observed across the 12 pilot districts within 18 months of the outreach programme launch.',
    },
  ],
  connections: {
    datasets: [{ id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' }],
    contributors: [{ id: 'contributor-seed-1', name: 'Dr. Aisha Verma', role: 'Public Health Researcher' }],
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
