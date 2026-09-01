import type { DatasetFormState, DatasetRecord } from '@/types/dataset'

function mb(value: number) {
  return Math.round(value * 1024 * 1024)
}

const ds1Form: DatasetFormState = {
  metadata: {
    name: 'National Economic Indicators & GDP Growth Projections (2020–2026)',
    description:
      'Quarterly national and state-level economic indicators covering GDP growth, sector performance, labour trends, and economic projections from 2020 to 2026.',
    sector: 'finance',
    geography: 'india',
    tags: ['GDP', 'Economy', 'Growth', 'Finance', 'National Indicators'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-08-05',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds1-file-1',
      name: 'gdp_quarterly_breakdown_2020_2026.csv',
      extension: 'CSV',
      sizeLabel: '4.2MB',
      sizeBytes: mb(4.2),
      uploadedAt: '05/08/2026 09:14:22',
    },
    {
      id: 'ds1-file-2',
      name: 'state_labor_force_census_data.xlsx',
      extension: 'XLSX',
      sizeLabel: '6.8MB',
      sizeBytes: mb(6.8),
      uploadedAt: '05/08/2026 09:14:22',
    },
    {
      id: 'ds1-file-3',
      name: 'methodology_data_dictionary_v2.pdf',
      extension: 'PDF',
      sizeLabel: '0.9MB',
      sizeBytes: mb(0.9),
      uploadedAt: '05/08/2026 09:14:22',
    },
  ],
  resources: [],
}

const ds2Form: DatasetFormState = {
  metadata: {
    name: 'District Health Infrastructure & Service Availability (2024)',
    description:
      'District-level information on public health infrastructure, healthcare facilities, service availability, and key capacity indicators across India.',
    sector: 'health',
    geography: 'india',
    tags: ['Health', 'Hospitals', 'Healthcare', 'District', 'Infrastructure'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-07-18',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds2-file-1',
      name: 'district_health_facilities_2024.csv',
      extension: 'CSV',
      sizeLabel: '3.1MB',
      sizeBytes: mb(3.1),
      uploadedAt: '18/07/2026 14:02:10',
    },
    {
      id: 'ds2-file-2',
      name: 'health_service_availability.xlsx',
      extension: 'XLSX',
      sizeLabel: '2.4MB',
      sizeBytes: mb(2.4),
      uploadedAt: '18/07/2026 14:02:10',
    },
    {
      id: 'ds2-file-3',
      name: 'metadata_dictionary.pdf',
      extension: 'PDF',
      sizeLabel: '0.6MB',
      sizeBytes: mb(0.6),
      uploadedAt: '18/07/2026 14:02:10',
    },
  ],
  resources: [],
}

const ds3Form: DatasetFormState = {
  metadata: {
    name: 'India District Financial Inclusion Index (2024)',
    description:
      'District-level financial inclusion indicators covering banking access, digital payment adoption, credit penetration, and savings account ownership.',
    sector: 'finance',
    geography: 'india',
    tags: ['Finance', 'Financial Inclusion', 'Banking', 'District', 'Digital Payments'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-05-01',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds3-file-1',
      name: 'district_financial_inclusion_2024.csv',
      extension: 'CSV',
      sizeLabel: '2.8MB',
      sizeBytes: mb(2.8),
      uploadedAt: '03/05/2026 16:40:00',
    },
    {
      id: 'ds3-file-2',
      name: 'banking_access_indicators.xlsx',
      extension: 'XLSX',
      sizeLabel: '1.9MB',
      sizeBytes: mb(1.9),
      uploadedAt: '03/05/2026 16:40:00',
    },
  ],
  resources: [],
}

const ds4Form: DatasetFormState = {
  metadata: {
    name: 'State-wise Education Infrastructure & Enrollment Statistics (2023–24)',
    description:
      'State-level education infrastructure, school availability, student enrollment, and basic education indicators for the 2023–24 academic year.',
    sector: 'education',
    geography: 'india',
    tags: ['Education', 'Schools', 'Enrollment', 'Infrastructure', 'Students'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-06-22',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds4-file-1',
      name: 'education_infrastructure_2023_24.csv',
      extension: 'CSV',
      sizeLabel: '3.6MB',
      sizeBytes: mb(3.6),
      uploadedAt: '22/06/2026 11:15:30',
    },
    {
      id: 'ds4-file-2',
      name: 'state_enrollment_statistics.xlsx',
      extension: 'XLSX',
      sizeLabel: '2.2MB',
      sizeBytes: mb(2.2),
      uploadedAt: '22/06/2026 11:15:30',
    },
    {
      id: 'ds4-file-3',
      name: 'data_methodology.pdf',
      extension: 'PDF',
      sizeLabel: '0.7MB',
      sizeBytes: mb(0.7),
      uploadedAt: '22/06/2026 11:15:30',
    },
  ],
  resources: [],
}

const ds5Form: DatasetFormState = {
  metadata: {
    name: 'Urban Water Supply & Coverage Indicators (2024)',
    description:
      'Urban water supply indicators covering household access, service coverage, supply frequency, and infrastructure across selected Indian cities.',
    sector: 'water-sanitation',
    geography: 'india',
    tags: ['Water', 'Urban', 'Sanitation', 'Infrastructure', 'Cities'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-07-12',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds5-file-1',
      name: 'urban_water_supply_2024.csv',
      extension: 'CSV',
      sizeLabel: '2.1MB',
      sizeBytes: mb(2.1),
      uploadedAt: '12/07/2026 08:45:00',
    },
    {
      id: 'ds5-file-2',
      name: 'city_water_coverage.xlsx',
      extension: 'XLSX',
      sizeLabel: '1.5MB',
      sizeBytes: mb(1.5),
      uploadedAt: '12/07/2026 08:45:00',
    },
  ],
  resources: [],
}

const ds6Form: DatasetFormState = {
  metadata: {
    name: 'State Climate Risk & Vulnerability Indicators (2025)',
    description:
      'State-level indicators covering climate exposure, vulnerability, environmental risk, and population affected by climate-related events.',
    sector: 'environment',
    geography: 'india',
    tags: ['Climate', 'Risk', 'Vulnerability', 'Environment'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds6-file-1',
      name: 'climate_risk_indicators_2025.csv',
      extension: 'CSV',
      sizeLabel: '2.0MB',
      sizeBytes: mb(2.0),
      uploadedAt: '10/08/2026 17:30:00',
    },
    {
      id: 'ds6-file-2',
      name: 'state_vulnerability_index.xlsx',
      extension: 'XLSX',
      sizeLabel: '1.4MB',
      sizeBytes: mb(1.4),
      uploadedAt: '10/08/2026 17:30:00',
    },
  ],
  resources: [],
}

const ds7Form: DatasetFormState = {
  metadata: {
    name: 'Municipal Expenditure & Budget Utilisation (2024–25)',
    description:
      'Municipal-level budget allocation, expenditure, and budget utilisation indicators for selected urban local bodies.',
    sector: 'finance',
    geography: 'india',
    tags: ['Municipal', 'Budget', 'Expenditure', 'Governance', 'Urban'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  files: [
    {
      id: 'ds7-file-1',
      name: 'municipal_budget_2024_25.xlsx',
      extension: 'XLSX',
      sizeLabel: '1.8MB',
      sizeBytes: mb(1.8),
      uploadedAt: '09/08/2026 12:10:00',
    },
  ],
  resources: [],
}

const ds8Form: DatasetFormState = {
  metadata: {
    name: 'Maternal Health Service Utilisation Indicators (2024)',
    description:
      'Indicators related to maternal healthcare service utilisation, antenatal care, institutional deliveries, and access to maternal health services.',
    sector: 'health',
    geography: 'india',
    tags: ['Maternal Health', 'Healthcare', 'Women', 'Public Health'],
    sourceWebsite: '',
    createDate: '',
    accessType: 'restricted',
    license: '',
  },
  files: [],
  resources: [],
}

// ds-5 is published and live, but the contributor has a saved working copy with
// edits that haven't been published yet — surfaces as "Published · Unsaved changes".
const ds5WorkingForm: DatasetFormState = {
  ...ds5Form,
  metadata: {
    ...ds5Form.metadata,
    description: `${ds5Form.metadata.description} Updated with newly added Q3 coverage figures, not yet published.`,
  },
}

export const MOCK_DATASETS: DatasetRecord[] = [
  { id: 'ds-1', status: 'published', updatedAt: '05/08/2026 09:14:22', form: ds1Form, publishedForm: ds1Form },
  { id: 'ds-2', status: 'published', updatedAt: '18/07/2026 14:02:10', form: ds2Form, publishedForm: ds2Form },
  { id: 'ds-3', status: 'published', updatedAt: '03/05/2026 16:40:00', form: ds3Form, publishedForm: ds3Form },
  { id: 'ds-4', status: 'published', updatedAt: '22/06/2026 11:15:30', form: ds4Form, publishedForm: ds4Form },
  { id: 'ds-5', status: 'published', updatedAt: '12/07/2026 08:45:00', form: ds5WorkingForm, publishedForm: ds5Form },
  { id: 'ds-6', status: 'draft', updatedAt: '10/08/2026 17:30:00', form: ds6Form, publishedForm: null },
  { id: 'ds-7', status: 'draft', updatedAt: '09/08/2026 12:10:00', form: ds7Form, publishedForm: null },
  { id: 'ds-8', status: 'draft', updatedAt: '08/08/2026 09:05:00', form: ds8Form, publishedForm: null },
]
