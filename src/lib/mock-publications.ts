import type { UploadedAsset } from '@/lib/generic-upload'
import { sampleDocumentDataUrl, type SampleDocument } from '@/lib/simple-pdf'
import type { PublicationFormState, PublicationRecord } from '@/types/publication'

function fakeAsset(name: string, extension: string, sizeLabel: string, dataUrl?: string): UploadedAsset {
  return {
    id: `asset-${name}`,
    name,
    extension,
    sizeLabel,
    sizeBytes: 2_400_000,
    uploadedAt: '02/08/2026 11:00:00',
    dataUrl,
  }
}

/** A sample PDF built from a few sections of text, so the Publication page's viewer opens a genuine document. */
const pdf = (doc: Omit<SampleDocument, 'publisher'>) => sampleDocumentDataUrl({ publisher: 'CivicDataLab', ...doc })

const publication1Form: PublicationFormState = {
  metadata: {
    name: 'State of Open Water Data in South Asia',
    description:
      'A cross-country review of open water and sanitation datasets published by government bodies, covering coverage gaps, licensing practices, and recommendations for standardisation.',
    contributors: [
      { id: 'contributor-mock-1', name: 'Dr. Meera Krishnan', designation: 'Lead Researcher', organisation: 'CivicDataLab' },
      { id: 'contributor-mock-2', name: 'Farhan Ali', designation: 'Data Analyst', organisation: 'CivicDataLab' },
    ],
    date: '2026-07-15',
    sector: 'urban-development',
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
      asset: fakeAsset(
        'open-water-data-report.pdf',
        'PDF',
        '4.8 MB',
        pdf({
          title: 'State of Open Water Data in South Asia',
          kind: 'Research',
          year: 2026,
          sections: [
            {
              heading: 'Summary',
              paragraphs: [
                'We reviewed 412 water and sanitation datasets published by national and state bodies in six South Asian countries between 2020 and 2026.',
                'Fewer than a third are machine-readable, and only one in five carries an explicit open licence. Coverage is strongest for piped supply and weakest for groundwater quality.',
              ],
            },
            {
              heading: 'Coverage gaps',
              paragraphs: [
                'Rural groundwater quality is measured in most districts but published in fewer than 40 percent of them, usually as scanned annual reports.',
                'Sanitation data stops at the household toilet: faecal sludge treatment and reuse are almost never reported.',
              ],
            },
            {
              heading: 'Recommendations',
              paragraphs: [
                'Publish monitoring data at district level, in CSV, under an open licence, within a quarter of collection.',
                'Agree a shared regional schema for water-quality parameters so datasets can be compared across borders.',
              ],
            },
          ],
        }),
      ),
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
    contributors: [],
    date: '',
    sector: '',
    geography: '',
    usageRights: '',
    resourceType: 'field-note',
    externalLink: '',
  },
  blocks: [],
}

const policyBriefForm: PublicationFormState = {
  metadata: {
    name: 'Cooling the Classroom: Heat Action for Government Schools',
    description:
      'Heatwaves now close schools for days each summer. This brief sets out five low-cost measures state education departments can take before the next heat season, using district heat and school infrastructure data.',
    contributors: [
      { id: 'contributor-brief-1', name: 'Dr. Priya Raman', designation: 'Climate and Health Lead', organisation: 'CivicDataLab' },
      { id: 'contributor-brief-2', name: 'Arjun Mehta', designation: 'Policy Analyst', organisation: 'CivicDataLab' },
    ],
    date: '2026-09-18',
    sector: 'climate-action',
    geography: 'india',
    usageRights: 'cc-by-4.0',
    resourceType: 'policy-brief',
    externalLink: 'https://civicdatalab.in/briefs/cooling-the-classroom',
  },
  blocks: [
    {
      id: 'pub-brief-block-1',
      type: 'file',
      title: 'Cooling the Classroom — Policy Brief',
      asset: fakeAsset(
        'cooling-the-classroom-policy-brief.pdf',
        'PDF',
        '2.4 MB',
        pdf({
          title: 'Cooling the Classroom: Heat Action for Government Schools',
          kind: 'Policy Brief',
          year: 2026,
          sections: [
            {
              heading: 'The problem',
              paragraphs: [
                'One in four government schools sits in a district with more than 20 heatwave days a year. Most have tin or concrete roofs and no fans in classrooms.',
                'Closures are announced late and unevenly, so children lose learning days while teachers and parents scramble.',
              ],
            },
            {
              heading: 'Five measures before the next heat season',
              paragraphs: [
                '1. Cool roofs: white reflective coating on school roofs in the hottest districts.',
                '2. A heat calendar: shift timings and exams using district heat forecasts.',
                '3. Water and shade: drinking water points and shaded play areas in every school.',
                '4. Early warning: one message channel from the district to every head teacher.',
                '5. Track it: record heat closures in UDISE+ so the impact can be measured.',
              ],
            },
            {
              heading: 'What it costs',
              paragraphs: [
                'Cool roof coating costs roughly Rs 40 per square foot and can lower indoor temperatures by 2 to 5 degrees. The first four measures fit within existing school maintenance grants.',
              ],
            },
          ],
        }),
      ),
    },
  ],
}

const toolkitForm: PublicationFormState = {
  metadata: {
    name: 'Open Budget Data Toolkit for Municipal Teams',
    description:
      'A practical guide and set of templates for municipal finance teams publishing budget and spending data openly: what to publish, in what format, and how to keep it up to date.',
    contributors: [
      { id: 'contributor-toolkit-1', name: 'Kavya Iyer', designation: 'Public Finance Lead', organisation: 'CivicDataLab' },
      { id: 'contributor-toolkit-2', name: 'Rohan Das', designation: 'Data Engineer', organisation: 'CivicDataLab' },
    ],
    date: '2026-05-11',
    sector: 'public-finance',
    geography: 'india',
    usageRights: 'cc0-1.0',
    resourceType: 'toolkit-guide',
    externalLink: '',
  },
  blocks: [
    {
      id: 'pub-toolkit-block-1',
      type: 'file',
      title: 'Open Budget Data Toolkit',
      asset: fakeAsset(
        'open-budget-data-toolkit.pdf',
        'PDF',
        '5.1 MB',
        pdf({
          title: 'Open Budget Data Toolkit for Municipal Teams',
          kind: 'Toolkit / Guide',
          year: 2026,
          sections: [
            {
              heading: 'How to use this toolkit',
              paragraphs: [
                'Work through the four steps in order. Each step has a template in this publication you can copy and fill in.',
                'Most teams finish the first publication cycle in six to eight weeks.',
              ],
            },
            {
              heading: 'Step 1: Decide what to publish',
              paragraphs: [
                'Start with the approved budget, then actual spending by department and ward. Use the data inventory template to list every source table and its owner.',
              ],
            },
            {
              heading: 'Step 2: Publish and keep it current',
              paragraphs: [
                'Publish as CSV with a data dictionary, under an open licence. Use the publishing calendar template to set a monthly refresh, and name one owner for each dataset.',
              ],
            },
          ],
        }),
      ),
    },
    {
      id: 'pub-toolkit-block-2',
      type: 'file',
      title: 'Data inventory template',
      description: 'A sheet for listing each budget and spending table, its owner, format and refresh cycle.',
      asset: fakeAsset(
        'data-inventory-template.pdf',
        'PDF',
        '320 KB',
        pdf({
          title: 'Data inventory template',
          kind: 'Template',
          year: 2026,
          sections: [
            {
              heading: 'Data inventory',
              paragraphs: [
                'For each table, record: name, department, owner, format, last updated, refresh cycle, and whether it can be published as is.',
              ],
            },
          ],
        }),
      ),
    },
    {
      id: 'pub-toolkit-block-3',
      type: 'file',
      title: 'Publishing calendar',
      description: 'A twelve-month calendar for planning releases around the budget cycle.',
      asset: fakeAsset('publishing-calendar.docx', 'DOCX', '180 KB'),
    },
  ],
}

const caseStudyForm: PublicationFormState = {
  metadata: {
    name: 'How Assam Used Flood Data to Pre-position Relief',
    description:
      'How the Assam State Disaster Management Authority combined river gauge, rainfall and village boundary data to place relief stocks before the 2025 monsoon floods, and what other states can take from it.',
    contributors: [
      { id: 'contributor-case-1', name: 'Nandini Bora', designation: 'Disaster Risk Analyst', organisation: 'CivicDataLab' },
    ],
    date: '2026-03-20',
    sector: 'disaster-risk-reduction',
    geography: 'india',
    usageRights: 'odc-by',
    resourceType: 'case-study',
    externalLink: '',
  },
  blocks: [
    {
      id: 'pub-case-block-1',
      type: 'file',
      title: 'Assam flood relief case study',
      asset: fakeAsset(
        'assam-flood-relief-case-study.pdf',
        'PDF',
        '3.6 MB',
        pdf({
          title: 'How Assam Used Flood Data to Pre-position Relief',
          kind: 'Case Study',
          year: 2026,
          sections: [
            {
              heading: 'Context',
              paragraphs: [
                'Floods affect more than two million people in Assam in a typical year. Relief used to be moved after villages were cut off, often by boat.',
              ],
            },
            {
              heading: 'What changed',
              paragraphs: [
                'In 2025 the authority joined river gauge readings, rainfall forecasts and village boundaries into one map, and ranked revenue circles by expected exposure ten days ahead.',
                'Relief stocks were moved to the 40 highest-ranked circles before the first peak.',
              ],
            },
            {
              heading: 'Results and lessons',
              paragraphs: [
                'Average time to first relief fell from four days to under one. The key enabler was an agreement to share gauge data daily, not monthly.',
              ],
            },
          ],
        }),
      ),
    },
    {
      id: 'pub-case-block-2',
      type: 'video',
      title: 'Talk: pre-positioning relief with open data',
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    },
  ],
}

const fieldNoteForm: PublicationFormState = {
  metadata: {
    name: 'Notes from the Sundarbans: Mapping Water Points after Cyclone Remal',
    description:
      'Field notes from two weeks of mapping drinking water points with community volunteers on three islands after Cyclone Remal, with the survey form we used.',
    contributors: [
      { id: 'contributor-note-1', name: 'Rashid Chowdhury', designation: 'Field Coordinator', organisation: 'CivicDataLab' },
    ],
    date: '2026-06-04',
    sector: 'coastal',
    geography: 'bangladesh',
    usageRights: 'cc-by-4.0',
    resourceType: 'field-note',
    externalLink: '',
  },
  blocks: [
    {
      id: 'pub-note-block-1',
      type: 'file',
      title: 'Field note with survey form',
      asset: fakeAsset(
        'sundarbans-field-note.pdf',
        'PDF',
        '1.2 MB',
        pdf({
          title: 'Notes from the Sundarbans: Mapping Water Points after Cyclone Remal',
          kind: 'Field Note',
          year: 2026,
          sections: [
            {
              heading: 'Where we worked',
              paragraphs: [
                'Three islands in the Shyamnagar sub-district, with 14 volunteers from local youth groups. We mapped 212 water points in 12 days.',
              ],
            },
            {
              heading: 'What we found',
              paragraphs: [
                'Saltwater reached more than half of the shallow tube wells. Pond sand filters recovered fastest; deep tube wells were mostly intact but far from where people live.',
              ],
            },
          ],
        }),
      ),
    },
  ],
}

/** Published samples get stable, non-numeric ids so they never collide with records people create (`publication-<n>`). */
const published = (id: string, updatedAt: string, form: PublicationFormState): PublicationRecord => ({
  id,
  status: 'published',
  updatedAt,
  form,
  publishedForm: form,
  organisationId: 'org-workspace-1',
  createdBy: 'John Doe',
})

export const MOCK_PUBLICATION_RECORDS: PublicationRecord[] = [
  published('publication-1', '15/07/2026 09:30:00', publication1Form),
  {
    id: 'publication-2',
    status: 'draft',
    updatedAt: '20/08/2026 16:05:00',
    form: publication2Form,
    publishedForm: null,
    organisationId: 'org-workspace-1',
    createdBy: 'Sana Khan',
  },
  published('publication-sample-policy-brief', '18/09/2026 10:00:00', policyBriefForm),
  published('publication-sample-toolkit', '11/05/2026 14:20:00', toolkitForm),
  published('publication-sample-case-study', '20/03/2026 12:00:00', caseStudyForm),
  published('publication-sample-field-note', '04/06/2026 09:15:00', fieldNoteForm),
]
