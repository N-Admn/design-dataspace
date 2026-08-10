import type { DatasetRecord } from '@/types/dataset'

export const MOCK_DATASETS: DatasetRecord[] = [
  {
    id: 'ds-1',
    status: 'published',
    updatedAt: '20/05/2026 18:26:14',
    form: {
      metadata: {
        name: 'India District Financial Inclusion Index (2024)',
        description:
          'This dataset provides district-level financial inclusion indicators across India for 2024. It includes banking access, digital payment adoption, credit penetration, and savings account ownership to support policy planning, financial analysis, and public research.',
        sector: 'finance',
        geography: 'india',
        tags: ['Finance', 'Budget', 'India'],
        sourceWebsite: 'https://data.gov.in',
        createDate: '2026-05-01',
        accessType: 'open',
        license: 'cc-by-4.0',
      },
      files: [
        {
          id: 'demo-file-1',
          name: 'Dataset_file_1.csv',
          extension: 'CSV',
          sizeLabel: '2.5MB',
          sizeBytes: Math.round(2.5 * 1024 * 1024),
          uploadedAt: '20/05/2026 18:26:14',
        },
        {
          id: 'demo-file-2',
          name: 'Dataset_file_2.csv',
          extension: 'CSV',
          sizeLabel: '2.5MB',
          sizeBytes: Math.round(2.5 * 1024 * 1024),
          uploadedAt: '20/05/2026 18:26:14',
        },
        {
          id: 'demo-file-3',
          name: 'Dataset_file_3.csv',
          extension: 'CSV',
          sizeLabel: '2.5MB',
          sizeBytes: Math.round(2.5 * 1024 * 1024),
          uploadedAt: '20/05/2026 18:26:14',
        },
      ],
      enablePreview: false,
    },
  },
  {
    id: 'ds-2',
    status: 'published',
    updatedAt: '02/03/2026 11:04:52',
    form: {
      metadata: {
        name: 'National Education Enrollment Statistics (2023-24)',
        description:
          'District and state-wise school enrollment, dropout, and literacy statistics collected from the annual education census.',
        sector: 'education',
        geography: 'india',
        tags: ['Education', 'Literacy'],
        sourceWebsite: 'https://data.gov.in/education',
        createDate: '2026-03-02',
        accessType: 'open',
        license: 'cc-by-4.0',
      },
      files: [
        {
          id: 'ds2-file-1',
          name: 'Enrollment_Statistics_2023_24.xlsx',
          extension: 'XLSX',
          sizeLabel: '4.1MB',
          sizeBytes: Math.round(4.1 * 1024 * 1024),
          uploadedAt: '02/03/2026 11:04:52',
        },
      ],
      enablePreview: true,
    },
  },
  {
    id: 'ds-3',
    status: 'draft',
    updatedAt: '08/08/2026 09:12:30',
    form: {
      metadata: {
        name: 'Municipal Expenditure Budget 2024',
        description: 'Draft in progress — line-item municipal expenditure for FY2024.',
        sector: 'finance',
        geography: '',
        tags: [],
        sourceWebsite: '',
        createDate: '',
        accessType: '',
        license: '',
      },
      files: [],
      enablePreview: false,
    },
  },
  {
    id: 'ds-4',
    status: 'draft',
    updatedAt: '05/08/2026 16:47:09',
    form: {
      metadata: {
        name: 'Urban Air Quality Monitoring Dataset',
        description:
          'Hourly air quality index readings from municipal monitoring stations across major metro areas.',
        sector: 'environment',
        geography: 'india',
        tags: ['Environment', 'Air Quality'],
        sourceWebsite: 'http://data.city.name.gov/dataset',
        createDate: '',
        accessType: 'open',
        license: '',
      },
      files: [
        {
          id: 'ds4-file-1',
          name: 'AQI_Readings_Q2.csv',
          extension: 'CSV',
          sizeLabel: '1.2MB',
          sizeBytes: Math.round(1.2 * 1024 * 1024),
          uploadedAt: '05/08/2026 16:47:09',
        },
      ],
      enablePreview: false,
    },
  },
]
