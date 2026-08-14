import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import type { UseCaseRecord } from '@/types/usecase'

export const MOCK_USE_CASE_RECORDS: UseCaseRecord[] = [
  {
    id: 'usecase-1',
    status: 'published',
    updatedAt: '06/08/2026 10:20:00',
    form: {
      metadata: {
        title: 'Maternal Health Monitoring in Rural Districts',
        platformUrl: 'https://data.gov.in/use-cases/maternal-health-monitoring',
        runningStatus: 'ongoing',
        startedOn: '2025-01-15',
        completedOn: '',
        sectors: ['health'],
        sdgGoals: ['sdg-3', 'sdg-5'],
        geographies: ['india'],
        tags: ['Maternal Health', 'Rural', 'Monitoring'],
        logo: null,
      },
      introduction: {
        thumbnail: null,
        subtitle: 'Using district health survey data to track maternal care access and outcomes.',
        descriptionHtml:
          '<p>This use case demonstrates how the District Health Infrastructure dataset was used to identify gaps in maternal care access across rural districts, informing a targeted outreach programme.</p>',
      },
      blocks: [
        { id: 'block-seed-1', type: 'heading', text: 'The Challenge', level: 2 },
        {
          id: 'block-seed-2',
          type: 'paragraph',
          html: '<p>Maternal mortality in several rural districts remained above the national average despite existing health infrastructure investment.</p>',
        },
        {
          id: 'block-seed-3',
          type: 'callout',
          highlight: '32% reduction in maternal mortality',
          supportingText: 'Observed across the 12 pilot districts within 18 months of the outreach programme launch.',
        },
      ],
      connections: {
        datasets: [{ id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' }],
        charts: [],
        dashboards: [],
        contributors: [{ id: 'contributor-seed-1', name: 'Dr. Aisha Verma', role: 'Public Health Researcher' }],
        supportedBy: [MOCK_ORGANISATIONS[1]],
        partneredBy: [MOCK_ORGANISATIONS[2]],
      },
    },
  },
  {
    id: 'usecase-2',
    status: 'draft',
    updatedAt: '11/08/2026 15:42:00',
    form: {
      metadata: {
        title: 'Urban Water Access Gap Analysis',
        platformUrl: '',
        runningStatus: 'planned',
        startedOn: '2026-08-01',
        completedOn: '',
        sectors: ['water-sanitation'],
        sdgGoals: ['sdg-6'],
        geographies: [],
        tags: [],
        logo: null,
      },
      introduction: {
        thumbnail: null,
        subtitle: '',
        descriptionHtml: '',
      },
      blocks: [],
      connections: {
        datasets: [],
        charts: [],
        dashboards: [],
        contributors: [],
        supportedBy: [],
        partneredBy: [],
      },
    },
  },
]
