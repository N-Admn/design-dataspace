/** Local, clearly illustrative sample data for the Publication Detail Page playground. Nothing here is read from, or written to,
 *  the CivicDataSpace data models: the publications, people, organisations and figures are invented for layout testing.
 *
 *  The first block of fields mirrors today's `PublicationMetadata` (name, description, contributors, date, sector, geography,
 *  usage rights, resource type, external link) and its file/video blocks. Everything after `PROPOSED` is a field the data model
 *  does not have yet (key findings, document pages, connections, type-specific content); the playground uses them to show what a
 *  richer consumer page could do, and the toolbar says so. */

export type ResourceType =
  | 'report'
  | 'article'
  | 'field-note'
  | 'research'
  | 'white-paper'
  | 'case-study'
  | 'policy-brief'
  | 'presentation'
  | 'toolkit-guide'
  | 'other'

/** Variant B gives each family of resource types its own layout. Report, research and white paper read the same way (long-form,
 *  chaptered); article and other fall back to a light editorial page. */
export type Treatment = 'brief' | 'report' | 'toolkit' | 'field-note' | 'case-study' | 'deck' | 'article'

export const TREATMENT_BY_TYPE: Record<ResourceType, Treatment> = {
  'policy-brief': 'brief',
  report: 'report',
  research: 'report',
  'white-paper': 'report',
  'toolkit-guide': 'toolkit',
  'field-note': 'field-note',
  'case-study': 'case-study',
  presentation: 'deck',
  article: 'article',
  other: 'article',
}

export interface SampleContributor {
  name: string
  designation?: string
  organisation?: string
}

/** One page of the document as the inline reader shows it. A stand-in for a rendered PDF page. */
export interface DocPage {
  heading: string
  paragraphs: string[]
  /** A simple bar figure drawn on the page, values in the same unit. */
  figure?: { caption: string; unit: string; bars: { label: string; value: number }[] }
}

export interface Connection {
  id: string
  title: string
  meta: string
}

export interface SamplePublication {
  id: string
  // ── Today's data model ──────────────────────────────────────────────────────────────────────────────────────────────────────
  resourceType: ResourceType
  title: string
  description: string
  contributors: SampleContributor[]
  /** ISO date. */
  date: string
  sector: string
  geography: string
  usageRights: string
  externalLink?: string
  file: { title: string; extension: 'PDF' | 'PPTX' | 'DOCX'; sizeLabel: string }
  /** Further file blocks after the main one, as the Content step allows (each with its own title and description). */
  extraFiles?: { title: string; description?: string; extension: 'PDF' | 'PPTX' | 'DOCX'; sizeLabel: string }[]
  video?: { title: string; url: string }
  /** The account or organisation that published it on CivicDataSpace. */
  publisher: string

  // ── PROPOSED: fields the data model does not have yet ───────────────────────────────────────────────────────────────────────
  readingMinutes: number
  keyFindings: string[]
  pullQuote?: { text: string; attribution: string }
  /** Proposed optional cover image; without it the page draws a generated cover in the type's colour. */
  coverImageUrl?: string
  pages: DocPage[]
  connections: { datasets: Connection[]; useCases: Connection[]; collaboratives: Connection[]; publications: Connection[] }

  /** Policy brief: the problem in one paragraph and the asks, each with who has to act. */
  brief?: { problem: string; recommendations: { title: string; detail: string; actor: string }[] }
  /** Report: headline figures for the summary band. */
  stats?: { value: string; label: string }[]
  /** Toolkit: the steps a team works through, with the template each one uses. */
  steps?: { title: string; detail: string; duration: string; template?: string }[]
  /** Field note: where and when it was written, and the points mapped on the visit (x/y are 0–100 on a stylised map). */
  field?: {
    location: string
    dateline: string
    quote: { text: string; attribution: string }
    points: { x: number; y: number; status: 'working' | 'damaged' | 'contaminated'; label: string }[]
  }
  /** Case study: the arc, and the outcomes measured afterwards. */
  caseStudy?: { challenge: string; approach: string[]; outcomes: { value: string; label: string }[] }
  /** Presentation: the slides' titles and bullet points. */
  slides?: { title: string; points: string[] }[]
}

const policyBrief: SamplePublication = {
  id: 'pub-heat-schools',
  resourceType: 'policy-brief',
  title: 'Cooling the Classroom: Heat Action for Government Schools',
  description:
    'Extreme heat now cuts into more than three weeks of the school year in parts of India. This brief sets out four steps state education departments can take before next summer, using data they already hold.',
  contributors: [
    { name: 'Dr. Priya Raman', designation: 'Lead Researcher', organisation: 'Regional Health Research Institute (sample)' },
    { name: 'Rahul Menon', designation: 'Policy Analyst', organisation: 'CivicDataLab' },
  ],
  date: '2026-09-18',
  sector: 'education',
  geography: 'india',
  usageRights: 'cc-by-4.0',
  externalLink: 'https://example.org/heat-schools-brief',
  file: { title: 'Cooling the Classroom — Policy Brief', extension: 'PDF', sizeLabel: '2.4 MB' },
  coverImageUrl: 'https://picsum.photos/seed/cds-heat-classroom/900/1200',
  publisher: 'CivicDataLab',
  readingMinutes: 6,
  keyFindings: [
    '1 in 4 government schools in the sample sits in a district with more than 20 heatwave days a year.',
    'Classrooms with tin roofs ran 4–6 °C hotter than those with concrete roofs at 2 pm.',
    'Only 3 of 12 state heat action plans mention schools at all.',
  ],
  pullQuote: {
    text: 'Children are losing school days to heat, and the data to prevent it is already sitting in three different departments.',
    attribution: 'Dr. Priya Raman',
  },
  brief: {
    problem:
      'Heatwaves are longer and earlier than a decade ago. Schools close in an ad hoc way, children in hot classrooms learn less, and no department owns the problem. School infrastructure data, district heat forecasts and attendance records are never put side by side.',
    recommendations: [
      {
        title: 'Name schools in every heat action plan',
        detail: 'Add a school section to state and city plans, with clear triggers for timing changes and closures.',
        actor: 'State Disaster Management Authorities',
      },
      {
        title: 'Map the hottest classrooms first',
        detail: 'Join UDISE+ roof-type records with district heat exposure to rank schools for cool-roof retrofits.',
        actor: 'State Education Departments',
      },
      {
        title: 'Shift the timetable before closing',
        detail: 'Move to morning shifts when forecasts cross the trigger, so learning continues on most heat days.',
        actor: 'District Education Officers',
      },
      {
        title: 'Publish attendance alongside heat',
        detail: 'Release monthly attendance with heat days so the effect of each measure can be checked.',
        actor: 'Ministry of Education',
      },
    ],
  },
  pages: [
    {
      heading: 'Summary',
      paragraphs: [
        'Extreme heat now cuts into more than three weeks of the school year in parts of India. Closures are announced late, differ between neighbouring districts, and are rarely followed by catch-up plans.',
        'This brief joins school infrastructure records with district heat exposure to show where the risk is highest and sets out four steps that can be taken before next summer.',
      ],
    },
    {
      heading: 'Where the risk is highest',
      paragraphs: [
        'Schools in districts with frequent heatwaves are also more likely to have tin or asbestos roofs and no fans, compounding exposure.',
      ],
      figure: {
        caption: 'Share of schools with tin or asbestos roofs, by district heat band',
        unit: '%',
        bars: [
          { label: 'Fewer than 5 heat days', value: 12 },
          { label: '5–10 heat days', value: 19 },
          { label: '10–20 heat days', value: 27 },
          { label: 'More than 20 heat days', value: 34 },
        ],
      },
    },
    {
      heading: 'What states can do',
      paragraphs: [
        'Each recommendation uses data the state already collects. None needs new surveys; all need departments to share what they hold.',
        'We suggest piloting in two districts per state in the coming summer and publishing the results.',
      ],
    },
  ],
  connections: {
    datasets: [
      { id: 'ds-7', title: 'Heatwave Days by District', meta: 'CSV · India' },
      { id: 'ds-22', title: 'Heat Action Plan Registry', meta: 'JSON · India' },
      { id: 'ds-30', title: 'UDISE+ School Infrastructure 2025', meta: 'XLSX · India' },
    ],
    useCases: [{ id: 'uc-2', title: 'Early Warning for Heat-Related Illness', meta: 'Disaster management · 2025' }],
    collaboratives: [{ id: 'co-1', title: 'Climate and Health Data Collaborative', meta: '28 datasets · 12 organisations' }],
    publications: [
      { id: 'pub-air-report', title: 'State of Urban Air Quality Data in South Asia', meta: 'Report · 2026' },
    ],
  },
}

const report: SamplePublication = {
  id: 'pub-air-report',
  resourceType: 'report',
  title: 'State of Urban Air Quality Data in South Asia 2026',
  description:
    'An audit of 214 cities: who monitors the air, how often the data is published, and whether anyone outside government can use it. Coverage has doubled since 2021, but almost half of the readings never become open data.',
  contributors: [
    { name: 'Amara Okafor', designation: 'Data Lead', organisation: 'Open Climate Alliance (sample)' },
    { name: 'Lukas Hoffmann', designation: 'Research Fellow', organisation: 'University of Oxford' },
    { name: 'Mei-Ling Tan', designation: 'Editor' },
  ],
  date: '2026-07-02',
  sector: 'environment',
  geography: 'global',
  usageRights: 'cc-by-sa-4.0',
  file: { title: 'State of Urban Air Quality Data 2026 — Full Report', extension: 'PDF', sizeLabel: '11.8 MB' },
  // Deliberately not a YouTube link: shows what the page does with a video link it cannot embed.
  video: { title: 'Launch webinar recording', url: 'https://example.org/sample-video' },
  publisher: 'Open Climate Alliance (sample)',
  readingMinutes: 38,
  keyFindings: [
    'Monitoring stations across the region rose from 612 to 1,340 since 2021.',
    '46% of hourly readings collected are never published as open data.',
    'Only 1 in 5 cities publishes data in a machine-readable format within a day.',
  ],
  pullQuote: {
    text: 'We are measuring more air than ever and sharing less of it than we could.',
    attribution: 'Amara Okafor',
  },
  stats: [
    { value: '214', label: 'cities audited' },
    { value: '1,340', label: 'monitoring stations' },
    { value: '46%', label: 'readings never published' },
    { value: '5', label: 'countries' },
  ],
  pages: [
    {
      heading: 'Executive summary',
      paragraphs: [
        'Air quality monitoring in South Asian cities has expanded quickly. The question this report asks is what happens to the data afterwards: is it published, how quickly, and in a form others can use?',
        'We audited 214 cities across five countries against six openness criteria and spoke with 38 officials, researchers and civic groups.',
      ],
    },
    {
      heading: '1. Introduction',
      paragraphs: [
        'Clean air policy depends on trusted, timely data. Researchers, journalists and city officials all told us the same thing: the readings exist, but finding them is a project in itself.',
        'This is the second edition of the audit; the first was published in 2021.',
      ],
    },
    {
      heading: '2. What the data shows',
      paragraphs: ['Station numbers have grown everywhere, but openness has not kept pace.'],
      figure: {
        caption: 'Monitoring stations by country, 2021 vs 2026',
        unit: 'stations',
        bars: [
          { label: 'India', value: 980 },
          { label: 'Bangladesh', value: 142 },
          { label: 'Pakistan', value: 118 },
          { label: 'Nepal', value: 61 },
          { label: 'Sri Lanka', value: 39 },
        ],
      },
    },
    {
      heading: '3. Gaps in openness',
      paragraphs: [
        'The largest gap is timeliness: most cities publish monthly summaries rather than hourly readings, which rules out use in alerts.',
        'Licensing is the second gap. Only 31 cities state any licence; without one, reuse is legally uncertain.',
      ],
    },
    {
      heading: '4. Recommendations',
      paragraphs: [
        'Publish hourly readings through an open API with a stated open licence.',
        'Adopt a shared station metadata standard across the region so readings can be compared.',
      ],
    },
  ],
  connections: {
    datasets: [
      { id: 'ds-2', title: 'Asia-Pacific Air Quality and Health Dataset', meta: 'CSV · Asia-Pacific' },
      { id: 'ds-14', title: 'Air Pollution Monitoring Stations', meta: 'CSV · India' },
      { id: 'ds-20', title: 'Wildfire Smoke Days and Asthma Visits', meta: 'CSV · Asia-Pacific' },
    ],
    useCases: [
      { id: 'uc-4', title: 'Air Quality Alerts for Urban Schools', meta: 'Education · 2025' },
    ],
    collaboratives: [{ id: 'co-1', title: 'Climate and Health Data Collaborative', meta: '28 datasets · 12 organisations' }],
    publications: [
      { id: 'pub-heat-schools', title: 'Cooling the Classroom', meta: 'Policy brief · 2026' },
      { id: 'pub-collab-101', title: 'Data Collaboratives 101', meta: 'Presentation · 2026' },
    ],
  },
}

const toolkit: SamplePublication = {
  id: 'pub-budget-toolkit',
  resourceType: 'toolkit-guide',
  title: 'Open Budget Data Toolkit for Municipal Teams',
  description:
    'A step-by-step guide for city finance teams who want to publish their budget as open data. Five steps, each with a ready-made template, take a team from a scanned PDF to a dataset citizens can explore.',
  contributors: [
    { name: 'Sofia Alvarez', designation: 'Programme Manager', organisation: 'CivicDataLab' },
    { name: 'Rashid Chowdhury', designation: 'Municipal Finance Advisor' },
  ],
  date: '2026-05-11',
  sector: 'finance',
  geography: 'india',
  usageRights: 'cc0-1.0',
  file: { title: 'Open Budget Data Toolkit', extension: 'PDF', sizeLabel: '5.1 MB' },
  extraFiles: [
    { title: 'Budget document inventory', description: 'Template for listing every budget document the city releases today.', extension: 'DOCX', sizeLabel: '240 KB' },
    { title: 'Classification crosswalk', description: 'Maps local account codes to the national budget classification.', extension: 'DOCX', sizeLabel: '310 KB' },
    { title: 'Pre-publication checklist', description: 'Totals check and legal review before anything goes live.', extension: 'PDF', sizeLabel: '180 KB' },
    { title: 'Plain-language guide template', description: 'A one-page explainer for residents.', extension: 'DOCX', sizeLabel: '150 KB' },
  ],
  publisher: 'CivicDataLab',
  readingMinutes: 20,
  keyFindings: [
    'Teams that followed all five steps published their first dataset in 6 weeks on average.',
    'The classification template cut the time to tag budget heads by roughly two thirds.',
    'Cities that published a plain-language guide saw three times more downloads.',
  ],
  steps: [
    {
      title: 'Find what you already publish',
      detail: 'List every budget document the city releases today, its format and where it lives.',
      duration: '1 week',
      template: 'Budget document inventory (XLSX)',
    },
    {
      title: 'Agree on the budget heads',
      detail: 'Map local account codes to the national classification so the data can be compared across cities.',
      duration: '2 weeks',
      template: 'Classification crosswalk (XLSX)',
    },
    {
      title: 'Turn tables into data',
      detail: 'Extract tables from PDFs into a clean, one-row-per-line-item spreadsheet.',
      duration: '1–2 weeks',
      template: 'Line-item data schema (CSV)',
    },
    {
      title: 'Check before you publish',
      detail: 'Run the totals check against the printed budget and review sensitive heads with the legal team.',
      duration: '3 days',
      template: 'Pre-publication checklist (DOCX)',
    },
    {
      title: 'Publish and explain',
      detail: 'Release the dataset with an open licence and a one-page plain-language guide for residents.',
      duration: '1 week',
      template: 'Plain-language guide (DOCX)',
    },
  ],
  pages: [
    {
      heading: 'Who this toolkit is for',
      paragraphs: [
        'Finance and IT staff in urban local bodies who have been asked to make the budget open, and the civic groups working with them.',
        'No programming is needed. Every step can be done with a spreadsheet.',
      ],
    },
    {
      heading: 'How to use it',
      paragraphs: [
        'Work through the five steps in order. Each step ends with a template you can fill in and a short check to know you are done.',
      ],
    },
    {
      heading: 'Step 2: Agree on the budget heads',
      paragraphs: [
        'Local account codes differ between cities. Mapping them once to the national classification makes every later comparison possible.',
      ],
      figure: {
        caption: 'Average time to classify a budget, with and without the template',
        unit: 'days',
        bars: [
          { label: 'Without template', value: 18 },
          { label: 'With template', value: 6 },
        ],
      },
    },
  ],
  connections: {
    datasets: [
      { id: 'ds-40', title: 'Municipal Budgets of Assam ULBs 2024–25', meta: 'CSV · India' },
      { id: 'ds-41', title: 'National Municipal Accounts Classification', meta: 'XLSX · India' },
    ],
    useCases: [
      { id: 'uc-12', title: 'Open Budgets for Guwahati', meta: 'Finance · 2025' },
      { id: 'uc-13', title: 'Tracking Ward-level Spending', meta: 'Urban development · 2026' },
    ],
    collaboratives: [],
    publications: [],
  },
}

const fieldNote: SamplePublication = {
  id: 'pub-sundarbans-note',
  resourceType: 'field-note',
  title: 'Notes from the Sundarbans: Mapping Water Points after Cyclone Remal',
  description:
    'Four days with a community team in Khulna, walking from one tubewell to the next and recording which still gave safe water. What we learned about collecting data when the roads are gone.',
  contributors: [{ name: 'Rashid Chowdhury', designation: 'Field Coordinator', organisation: 'Community Health Network (sample)' }],
  date: '2026-06-04',
  sector: 'water-sanitation',
  geography: 'bangladesh',
  usageRights: 'cc-by-4.0',
  file: { title: 'Field note with survey form', extension: 'PDF', sizeLabel: '1.2 MB' },
  coverImageUrl: 'https://picsum.photos/seed/cds-sundarbans/900/1200',
  publisher: 'Community Health Network (sample)',
  readingMinutes: 8,
  keyFindings: [
    'Of the 12 tubewells on our route, 7 were working, 2 were damaged and 3 tested saline.',
    'Paper forms were faster than the app once the phone network went down on day two.',
    'Villagers already knew which wells were bad: the survey confirmed rather than discovered.',
  ],
  field: {
    location: 'Koyra Upazila, Khulna, Bangladesh',
    dateline: '29 May – 1 June 2026',
    quote: {
      text: 'We did not need the test kit to know. The water tastes of the sea.',
      attribution: 'A resident of Dakshin Bedkashi',
    },
    points: [
      { x: 18, y: 22, status: 'working', label: 'Well 04' },
      { x: 26, y: 35, status: 'working', label: 'Well 07' },
      { x: 34, y: 18, status: 'contaminated', label: 'Well 11' },
      { x: 41, y: 44, status: 'damaged', label: 'Well 15' },
      { x: 52, y: 30, status: 'working', label: 'Well 18' },
      { x: 58, y: 56, status: 'contaminated', label: 'Well 23' },
      { x: 63, y: 40, status: 'working', label: 'Well 26' },
      { x: 70, y: 66, status: 'contaminated', label: 'Well 31' },
      { x: 76, y: 50, status: 'working', label: 'Well 34' },
      { x: 30, y: 62, status: 'damaged', label: 'Well 38' },
      { x: 46, y: 72, status: 'working', label: 'Well 42' },
      { x: 84, y: 28, status: 'working', label: 'Well 47' },
    ],
  },
  pages: [
    {
      heading: 'Day one: Koyra',
      paragraphs: [
        'We arrived by boat because the embankment road had washed out in two places. The team split into pairs, each with a paper form, a salinity meter and a phone.',
        'By evening we had visited 19 wells. Most people met us at the well before we found it.',
      ],
    },
    {
      heading: 'Day two: when the network went',
      paragraphs: [
        'The mobile network failed at midday. The app kept records offline but would not let us edit a submitted form, so we switched to paper and typed the forms up at night.',
      ],
    },
    {
      heading: 'What we would do differently',
      paragraphs: [
        'Start with what villagers already know. A ten-minute conversation at the tea stall would have told us where to go first.',
        'Carry paper from the start, and budget an evening each day for data entry.',
      ],
    },
  ],
  connections: {
    datasets: [
      { id: 'ds-10', title: 'Water Quality and Diarrhoeal Disease', meta: 'CSV · Bangladesh' },
      { id: 'ds-24', title: 'Groundwater Depth and Arsenic Screening', meta: 'CSV · Bangladesh' },
    ],
    useCases: [{ id: 'uc-5', title: 'Cholera Outbreak Risk Mapping after Floods', meta: 'Public health · 2024' }],
    collaboratives: [{ id: 'co-1', title: 'Climate and Health Data Collaborative', meta: '28 datasets · 12 organisations' }],
    publications: [],
  },
}

const caseStudy: SamplePublication = {
  id: 'pub-assam-flood',
  resourceType: 'case-study',
  title: 'How Assam Used Flood Data to Pre-position Relief',
  description:
    'In the 2025 monsoon, the Assam State Disaster Management Authority used open flood and road data to move relief stocks before the water rose. This case study follows the decision from data to warehouse.',
  contributors: [
    { name: 'Dr. Ananya Krishnamurthy-Subramaniam Venkataraghavan', designation: 'Senior Fellow', organisation: 'Urban Resilience Lab (sample)' },
    { name: 'Lukas Hoffmann', designation: 'Research Fellow', organisation: 'University of Oxford' },
  ],
  date: '2026-03-20',
  sector: 'environment',
  geography: 'india',
  usageRights: 'odc-by',
  file: { title: 'Assam flood relief case study', extension: 'PDF', sizeLabel: '3.6 MB' },
  publisher: 'Urban Resilience Lab (sample)',
  readingMinutes: 12,
  keyFindings: [
    'Relief reached cut-off villages 2.5 days sooner than in the 2022 floods.',
    'Combining flood forecasts with the road network showed which depots would be cut off first.',
    'The model used only open data; the hard part was agreeing who would act on it.',
  ],
  pullQuote: {
    text: 'The map did not tell us anything new about the river. It told us which trucks to send first.',
    attribution: 'District relief officer, Dhemaji (paraphrased)',
  },
  caseStudy: {
    challenge:
      'Every monsoon, roads to the most flood-prone revenue circles close within hours, and relief arrives days after it is needed. Stocks sat in district warehouses that were themselves cut off.',
    approach: [
      'Overlay three-day flood forecasts on the state road network to predict which roads would close.',
      'Rank depots by how many vulnerable households they could still reach after the forecast closures.',
      'Agree a trigger with district officers: when a circle is forecast to be cut off, stock moves 48 hours before.',
    ],
    outcomes: [
      { value: '2.5 days', label: 'faster relief to cut-off villages' },
      { value: '312', label: 'villages reached before roads closed' },
      { value: '7', label: 'districts now using the trigger' },
    ],
  },
  pages: [
    {
      heading: 'The challenge',
      paragraphs: [
        'Every monsoon, roads to the most flood-prone revenue circles close within hours, and relief arrives days after it is needed.',
      ],
    },
    {
      heading: 'What changed in 2025',
      paragraphs: [
        'For the first time, flood forecasts and the road network were combined into one daily map shared with district officers on WhatsApp.',
      ],
      figure: {
        caption: 'Average days for relief to reach cut-off villages',
        unit: 'days',
        bars: [
          { label: '2022 floods', value: 4.1 },
          { label: '2023 floods', value: 3.8 },
          { label: '2025 floods', value: 1.6 },
        ],
      },
    },
    {
      heading: 'Lessons for other states',
      paragraphs: [
        'The data and the model are the easy part. What made the difference was a written trigger that every district officer agreed to before the season.',
      ],
    },
  ],
  connections: {
    datasets: [
      { id: 'ds-6', title: 'Monsoon Rainfall and Flood Extent', meta: 'GeoTIFF · South Asia' },
      { id: 'ds-50', title: 'Assam Road Network (OpenStreetMap extract)', meta: 'Shapefile · India' },
      { id: 'ds-51', title: 'Revenue Circle Boundaries, Assam', meta: 'GeoJSON · India' },
    ],
    useCases: [
      { id: 'uc-3', title: 'Climate Resilient Health Facilities', meta: 'Infrastructure · 2026' },
      { id: 'uc-20', title: 'Assam Flood Response Dashboard', meta: 'Disaster management · 2025' },
    ],
    collaboratives: [],
    publications: [{ id: 'pub-sundarbans-note', title: 'Notes from the Sundarbans', meta: 'Field note · 2026' }],
  },
}

const deck: SamplePublication = {
  id: 'pub-collab-101',
  resourceType: 'presentation',
  title: 'Data Collaboratives 101',
  description:
    'The slides from our introductory session for organisations joining a data collaborative: what one is, how data is shared safely, and what members commit to.',
  contributors: [{ name: 'Mei-Ling Tan', designation: 'Partnerships Lead', organisation: 'CivicDataLab' }],
  date: '2026-08-27',
  sector: 'urban-development',
  geography: 'global',
  usageRights: 'cc-by-4.0',
  file: { title: 'Data Collaboratives 101 — slides', extension: 'PPTX', sizeLabel: '8.3 MB' },
  coverImageUrl: 'https://picsum.photos/seed/cds-collab-session/1200/750',
  // A real, openly licensed YouTube video (Blender Foundation's Big Buck Bunny) standing in for the session recording.
  video: { title: 'Session recording', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
  publisher: 'CivicDataLab',
  readingMinutes: 10,
  keyFindings: [
    'A collaborative is an agreement first and a platform second.',
    'Most members start by sharing one dataset; the median after a year is four.',
    'Clear exit terms make organisations more willing to join, not less.',
  ],
  slides: [
    { title: 'Data Collaboratives 101', points: ['An introduction for new members', 'CivicDataLab · August 2026'] },
    { title: 'What is a data collaborative?', points: ['Organisations that agree to share data for a public purpose', 'A shared set of rules, not a shared database', 'Each member keeps control of what it shares'] },
    { title: 'How sharing works', points: ['Publish to CivicDataSpace with a licence you choose', 'Restricted data goes through an access request', 'Every use is logged and visible to the owner'] },
    { title: 'What members commit to', points: ['Share at least one dataset in the first year', 'Document how each dataset was collected', 'Take part in one joint use case'] },
    { title: 'Leaving a collaborative', points: ['Give 60 days notice', 'Your data stays yours', 'Published use cases keep their citations'] },
    { title: 'Questions?', points: ['partnerships@example.org', 'civicdataspace.in/collaboratives'] },
  ],
  pages: [],
  connections: {
    datasets: [],
    useCases: [{ id: 'uc-1', title: 'Maternal Health Monitoring in Rural Districts', meta: 'Public health · 2026' }],
    collaboratives: [
      { id: 'co-1', title: 'Climate and Health Data Collaborative', meta: '28 datasets · 12 organisations' },
      { id: 'co-2', title: 'Open Budgets Collaborative', meta: '9 datasets · 5 organisations' },
    ],
    publications: [{ id: 'pub-budget-toolkit', title: 'Open Budget Data Toolkit', meta: 'Toolkit · 2026' }],
  },
}
// The deck reads as its own slides in the reader.
deck.pages = deck.slides!.map((s) => ({ heading: s.title, paragraphs: s.points }))

export const SAMPLE_PUBLICATIONS: SamplePublication[] = [policyBrief, report, toolkit, fieldNote, caseStudy, deck]
