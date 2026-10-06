import { emptyPromptDatasetMetadata, type DatasetFormState, type DatasetRecord } from '@/types/dataset'

function mb(value: number) {
  return Math.round(value * 1024 * 1024)
}

const ds1Form: DatasetFormState = {
  metadata: {
    name: 'National Economic Indicators & GDP Growth Projections (2020–2026)',
    description:
      'Quarterly national and state-level economic indicators covering GDP growth, sector performance, labour trends, and economic projections from 2020 to 2026. The dataset brings together headline GDP series with a quarterly breakdown by sector, state-level labour force and unemployment figures, and forward-looking projections, so that trends can be compared across regions and over time. A methodology note and data dictionary describe how each indicator is defined and calculated. It is intended for researchers, journalists, and policy teams who need a consistent view of how the economy is changing. Because the series are published on a common quarterly calendar, readers can line up headline growth against sector contributions, see which states are driving or lagging national performance, and test how projections compare with observed outcomes as new quarters are added. Notes alongside the data record revisions and known gaps, so that anyone reusing the figures in a report, dashboard or model can cite them with confidence and understand their limits.',
    sector: 'finance',
    geography: 'india',
    tags: ['GDP', 'Economy', 'Growth', 'Finance', 'National Indicators'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-08-05',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  // Imported from GitHub, preserving its folder structure — demonstrates the
  // Data tab's nested folder/file browser (DatasetFile.path) alongside a flat
  // direct-upload dataset like ds-2, rather than every mock dataset being a
  // flat list. Mock data only; no model/API change.
  files: [
    {
      id: 'ds1-file-1',
      name: 'gdp_quarterly_breakdown_2020_2026.csv',
      extension: 'CSV',
      sizeLabel: '4.2MB',
      sizeBytes: mb(4.2),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      path: 'data/economic-indicators',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
      // Representative mock counts for the "large dataset" Data preview demo —
      // intentionally larger than the 28 rows actually rendered by the mock
      // table (lib/chart-data.ts); see that file's WIDE_TABLE_* comment.
      rowCount: 12430,
      columnCount: 26,
    },
    {
      id: 'ds1-file-2',
      name: 'state_labor_force_census_data.xlsx',
      extension: 'XLSX',
      sizeLabel: '6.8MB',
      sizeBytes: mb(6.8),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      path: 'data/economic-indicators',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
    },
    {
      id: 'ds1-file-4',
      name: 'unemployment_rate_by_state.csv',
      extension: 'CSV',
      sizeLabel: '2.1MB',
      sizeBytes: mb(2.1),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      path: 'data/employment',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
    },
    {
      id: 'ds1-file-3',
      name: 'methodology_data_dictionary_v2.pdf',
      extension: 'PDF',
      sizeLabel: '0.9MB',
      sizeBytes: mb(0.9),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      path: 'documentation',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
    },
    {
      id: 'ds1-file-5',
      name: 'column_definitions.csv',
      extension: 'CSV',
      sizeLabel: '0.1MB',
      sizeBytes: mb(0.1),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      path: 'metadata',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
    },
    {
      id: 'ds1-file-6',
      name: 'README.md',
      extension: 'MD',
      sizeLabel: '0.01MB',
      sizeBytes: mb(0.01),
      uploadedAt: '05/08/2026 09:14:22',
      source: 'GitHub',
      importUrl: 'https://github.com/civicdatalab/national-economic-indicators',
    },
  ],
  resources: [],
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds2Form: DatasetFormState = {
  metadata: {
    name: 'District Health Infrastructure & Service Availability (2024)',
    description:
      'District-level information on public health infrastructure, healthcare facilities, service availability, and key capacity indicators across India. The dataset lists facilities by district together with the services they offer, so that gaps in coverage can be identified and compared between districts. A metadata dictionary explains each field, its unit and its source. It supports health planners, researchers, and civic groups assessing where facilities, staffing and services are concentrated, and where communities may have limited access to care. Where facility records are incomplete, the dataset flags the gap instead of estimating a value, so that users can distinguish a missing entry from a service that is genuinely unavailable. Because every record is tied to a district, the data can be mapped, joined with population or poverty indicators, and reused in dashboards that track whether public health investment is reaching the places that need it most.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds3Form: DatasetFormState = {
  metadata: {
    name: 'India District Financial Inclusion Index (2024)',
    description:
      'District-level financial inclusion indicators covering banking access, digital payment adoption, credit penetration, and savings account ownership. The dataset combines a district index with the underlying banking-access indicators, making it possible to compare how well different districts are served by formal financial services. Each indicator is reported on a consistent district basis for 2024. It is useful for researchers, development organisations, and local administrators studying who has access to banking and credit, and where digital payments are reaching communities. Because the indicators are measured consistently for every district, they can be mapped, ranked and combined with other development data such as population, literacy or income. Definitions for each measure are documented alongside the files, which makes it easier to compare results over time as new editions are released and to explain, in plain terms, what a rising or falling value actually represents for people in that district.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds4Form: DatasetFormState = {
  metadata: {
    name: 'State-wise Education Infrastructure & Enrollment Statistics (2023–24)',
    description:
      'State-level education infrastructure, school availability, student enrollment, and basic education indicators for the 2023–24 academic year. The dataset pairs infrastructure measures such as school availability and facilities with state-wise enrollment statistics, so that learning conditions can be read alongside participation. A methodology note describes how the figures were compiled and how each indicator is defined. It is intended for education researchers, planners, and civil society groups comparing states and tracking progress on access to schooling. The state-wise structure makes it straightforward to compare infrastructure against enrollment, and to see where facilities have kept pace with growing participation and where they have not. Definitions are documented alongside the files so that figures can be reused in reports and dashboards with confidence, combined with population or budget data, and updated as later academic years are added to the series.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds5Form: DatasetFormState = {
  metadata: {
    name: 'Urban Water Supply & Coverage Indicators (2024)',
    description:
      'Urban water supply indicators covering household access, service coverage, supply frequency, and infrastructure across selected Indian cities. The dataset reports coverage by city and brings together access, regularity of supply and the condition of supporting infrastructure, giving a rounded picture of how reliably households receive water. Figures are reported for 2024 on a consistent city basis. It helps urban planners, researchers, and community groups compare cities, understand service gaps, and make the case for investment where supply is weakest. Because the data is organised city by city, it can be mapped, ranked and joined with population or housing data to show which neighbourhoods and communities are served least reliably. Column definitions accompany the files so that figures can be reused in reports and dashboards, compared across years as new editions are published, and explained clearly to residents, officials and funders alike.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds6Form: DatasetFormState = {
  metadata: {
    name: 'State Climate Risk & Vulnerability Indicators (2025)',
    description:
      'State-level indicators covering climate exposure, vulnerability, environmental risk, and population affected by climate-related events. The dataset combines indicator values with a state vulnerability index, so that exposure to hazards can be compared with the capacity of communities to cope. Figures are reported for 2025 on a consistent state basis. It is designed for researchers, disaster-management teams, and policy makers who need to see which states face the greatest climate risk, and how many people are affected when extreme events occur. Presenting exposure and vulnerability side by side helps explain why similar events can have very different consequences from one state to another. The data can be mapped, combined with demographic or infrastructure indicators, and reused in planning tools, early-warning dashboards and public reports. Definitions for each indicator accompany the files so that results are easy to interpret, cite and update as new years of data are added.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds7Form: DatasetFormState = {
  metadata: {
    name: 'Municipal Expenditure & Budget Utilisation (2024–25)',
    description:
      'Municipal-level budget allocation, expenditure, and budget utilisation indicators for selected urban local bodies. The dataset sets what each municipality planned to spend against what it actually spent, so that under-utilised budgets and spending patterns can be identified across the 2024–25 financial year. Indicators are reported on a consistent municipal basis in a single workbook. It is intended for researchers, civic watchdogs, and city officials interested in how local governments use public funds and how closely spending follows plans. Comparing allocation, spending and utilisation in one place makes it easier to see which urban local bodies consistently use their budgets, which leave funds unspent, and how patterns shift from year to year. The figures can be combined with population or service-delivery data to ask whether spending is reaching the services residents rely on, and reused in civic dashboards, audits and public budget explainers.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
}

const ds8Form: DatasetFormState = {
  metadata: {
    name: 'Maternal Health Service Utilisation Indicators (2024)',
    description:
      'Indicators related to maternal healthcare service utilisation, antenatal care, institutional deliveries, and access to maternal health services. The dataset describes how widely these services are used, so that differences in care before, during and after childbirth can be compared across areas. Figures are reported for 2024 using consistent definitions for each indicator. It supports health officials, researchers, and community organisations working to understand where maternal care is reaching women, and where barriers to access remain. Looking at antenatal care, institutional deliveries and wider access indicators together helps show where each stage of care is being reached and where women are dropping out of the pathway. The data can be mapped, combined with facility or demographic information, and reused in planning tools, dashboards and public reports. Each indicator is defined in the accompanying documentation so that results are easy to interpret and compare.',
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
  datasetType: 'dataset',
  promptDatasetMetadata: emptyPromptDatasetMetadata,
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

const ds9Form: DatasetFormState = {
  datasetType: 'prompt_dataset',
  metadata: {
    name: 'Civic Grievance Redressal Instruction Prompts (2025)',
    description:
      'Instruction/response prompt pairs modelled on citizen grievance redressal conversations, for training and evaluating civic-service assistant models. Each instruction describes a grievance or request raised by a citizen, optionally with supporting context, and is paired with an expected redressal response. The collection is split into training and test files, with a README that explains the format and intended use. It is designed for teams building and testing assistants that help people raise, track and resolve everyday civic issues. The pairs cover a range of everyday grievances and the kinds of responses a helpful civic service might give, which makes them suitable for supervised fine-tuning as well as for building evaluation sets. Keeping the instruction, context and response in separate fields means the data can be reformatted for different training frameworks, filtered by topic, and extended with new examples as more real-world situations are documented.',
    sector: 'urban-development',
    geography: 'india',
    tags: ['Prompts', 'Governance', 'Instruction Tuning', 'Civic Assistant'],
    sourceWebsite: 'https://data.gov.in',
    createDate: '2026-08-20',
    accessType: 'open',
    license: 'cc-by-4.0',
  },
  promptDatasetMetadata: {
    taskType: 'conversational',
    domain: 'governance',
    targetLanguages: ['en', 'hi'],
    targetModelTypes: ['gpt', 'claude', 'indic-llm'],
  },
  // Imported from a Public Platform (Hugging Face) that preserved its
  // `train`/`test` folder structure — exercises DatasetFile.path with real
  // nesting, rather than every mock dataset being a flat, direct-upload list.
  files: [
    {
      id: 'ds9-file-1',
      name: 'grievance_instruction_pairs_train.csv',
      extension: 'CSV',
      sizeLabel: '1.6MB',
      sizeBytes: mb(1.6),
      uploadedAt: '20/08/2026 10:05:00',
      source: 'Hugging Face',
      path: 'train',
      importUrl: 'https://huggingface.co/datasets/civicdatalab/grievance-redressal-prompts',
      rowCount: 3200,
      columnCount: 3,
      promptFileMetadata: {
        promptFileName: 'Grievance Instruction Pairs — Train',
        promptFormat: 'instruction',
        hasSystemPrompt: true,
        hasExampleResponses: true,
        fields: [
          { name: 'instruction', description: 'The citizen grievance or request given to the model.' },
          { name: 'input', description: 'Additional context supplied with the grievance, when available.' },
          { name: 'output', description: 'The expected redressal response from the model.' },
        ],
      },
    },
    {
      id: 'ds9-file-2',
      name: 'grievance_responses_train.csv',
      extension: 'CSV',
      sizeLabel: '0.9MB',
      sizeBytes: mb(0.9),
      uploadedAt: '20/08/2026 10:05:00',
      source: 'Hugging Face',
      path: 'train',
      importUrl: 'https://huggingface.co/datasets/civicdatalab/grievance-redressal-prompts',
      rowCount: 3200,
      columnCount: 2,
      promptFileMetadata: {
        promptFileName: 'Grievance Responses — Train',
        promptFormat: 'instruction',
        hasSystemPrompt: false,
        hasExampleResponses: true,
        fields: [
          { name: 'instruction_id', description: 'Links a response back to its instruction row.' },
          { name: 'output', description: 'The expected redressal response from the model.' },
        ],
      },
    },
    {
      id: 'ds9-file-3',
      name: 'grievance_instruction_pairs_test.csv',
      extension: 'CSV',
      sizeLabel: '0.4MB',
      sizeBytes: mb(0.4),
      uploadedAt: '20/08/2026 10:05:00',
      source: 'Hugging Face',
      path: 'test',
      importUrl: 'https://huggingface.co/datasets/civicdatalab/grievance-redressal-prompts',
      rowCount: 800,
      columnCount: 3,
      promptFileMetadata: {
        promptFileName: 'Grievance Instruction Pairs — Test',
        promptFormat: 'instruction',
        hasSystemPrompt: true,
        hasExampleResponses: true,
        fields: [
          { name: 'instruction', description: 'The citizen grievance or request given to the model.' },
          { name: 'input', description: 'Additional context supplied with the grievance, when available.' },
          { name: 'output', description: 'The expected redressal response from the model.' },
        ],
      },
    },
    {
      id: 'ds9-file-4',
      name: 'README.md',
      extension: 'MD',
      sizeLabel: '0.01MB',
      sizeBytes: mb(0.01),
      uploadedAt: '20/08/2026 10:05:00',
      source: 'Hugging Face',
      importUrl: 'https://huggingface.co/datasets/civicdatalab/grievance-redressal-prompts',
    },
  ],
  resources: [],
}

export const MOCK_DATASETS: DatasetRecord[] = [
  { id: 'ds-1', status: 'published', updatedAt: '05/08/2026 09:14:22', downloadCount: 1284, form: ds1Form, publishedForm: ds1Form, organisationId: 'org-workspace-1', createdBy: 'John Doe' },
  { id: 'ds-2', status: 'published', updatedAt: '18/07/2026 14:02:10', downloadCount: 742, form: ds2Form, publishedForm: ds2Form },
  { id: 'ds-3', status: 'published', updatedAt: '03/05/2026 16:40:00', downloadCount: 356, form: ds3Form, publishedForm: ds3Form },
  { id: 'ds-4', status: 'published', updatedAt: '22/06/2026 11:15:30', downloadCount: 519, form: ds4Form, publishedForm: ds4Form },
  { id: 'ds-5', status: 'published', updatedAt: '12/07/2026 08:45:00', downloadCount: 208, form: ds5WorkingForm, publishedForm: ds5Form },
  { id: 'ds-6', status: 'draft', updatedAt: '10/08/2026 17:30:00', downloadCount: 0, form: ds6Form, publishedForm: null, organisationId: 'org-workspace-1', createdBy: 'Rahul Mehta' },
  { id: 'ds-7', status: 'draft', updatedAt: '09/08/2026 12:10:00', downloadCount: 0, form: ds7Form, publishedForm: null, organisationId: 'org-workspace-1', createdBy: 'Sana Khan' },
  { id: 'ds-8', status: 'draft', updatedAt: '08/08/2026 09:05:00', downloadCount: 0, form: ds8Form, publishedForm: null, organisationId: 'org-workspace-1', createdBy: 'John Doe' },
  { id: 'ds-9', status: 'published', updatedAt: '20/08/2026 10:05:00', downloadCount: 97, form: ds9Form, publishedForm: ds9Form },
]
