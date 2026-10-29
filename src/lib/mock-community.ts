/**
 * ILLUSTRATIVE SAMPLE DATA for the public Community pages (organisation and publisher profiles). Nothing here is real, and nothing
 * here is stored on the content records themselves.
 *
 * Why it exists: the prototype's records say which organisation workspace a record was created in (`organisationId`), but not who
 * the people credited on it are, which organisations those people publicly belong to, or any record's public authorship. Until the
 * data model has those, this file stands in for them so every profile can be seen with real-looking content:
 *
 *  - `MOCK_PUBLIC_PEOPLE`: the people with a public profile, and the organisations they publicly belong to.
 *  - `MOCK_PERSON_CREDITS`: the published records each person is credited on (as author, contributor, speaker or member).
 *  - `MOCK_ORGANISATION_CONTENT`: which organisation published each sample record that has no real organisation. A record's own
 *    `organisationId`, where it has one, always wins.
 *
 * `lib/community.ts` is the only reader; replace this file with real attribution and nothing else needs to change.
 */

export type MockContributionType = 'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event' | 'ai-model'

export interface MockPublicPerson {
  /** `me` is the signed-in prototype user (profile from `MOCK_PROFILE`); the others are the sample directory. */
  id: string
  name: string
  /** Role or area, shown under the name. */
  headline: string
  bio: string
  location: string
  imageUrl: string | null
  expertise: string[]
  social: { linkedin: string; github: string; x: string }
  /** Organisation workspace ids this person publicly belongs to. A person with none is an independent publisher. */
  organisationIds: string[]
}

const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400`
const none = { linkedin: '', github: '', x: '' }

export const MOCK_PUBLIC_PEOPLE: MockPublicPerson[] = [
  {
    id: 'person-1',
    name: 'Dr. Aisha Verma',
    headline: 'Public health researcher',
    bio: 'Studies how heat, air quality and water access shape health outcomes in Indian cities, and works with district teams to turn those findings into early-warning tools.',
    location: 'New Delhi, India',
    imageUrl: pexels(7580822),
    expertise: ['Public health', 'Climate and health', 'Early warning'],
    social: { linkedin: 'https://linkedin.com/in/aisha-verma-sample', github: '', x: '' },
    organisationIds: ['org-workspace-2', 'org-workspace-5'],
  },
  {
    id: 'person-2',
    name: 'Rahul Mehta',
    headline: 'Data engineer',
    bio: 'Builds the pipelines and open APIs that move public datasets from government portals into usable, documented formats.',
    location: 'Bengaluru, India',
    imageUrl: pexels(220453),
    expertise: ['Data engineering', 'Open APIs', 'Data quality'],
    social: { linkedin: '', github: 'https://github.com/rahul-mehta-sample', x: '' },
    organisationIds: ['org-workspace-1'],
  },
  {
    id: 'person-3',
    name: 'Priya Nair',
    headline: 'Programme manager',
    bio: 'Coordinates multi-partner data programmes on maternal health and nutrition, from the first data-sharing agreement to the published dashboards.',
    location: 'Bhubaneswar, India',
    imageUrl: pexels(30004323),
    expertise: ['Programme management', 'Maternal health', 'Partnerships'],
    social: { linkedin: 'https://linkedin.com/in/priya-nair-sample', github: '', x: '' },
    organisationIds: ['org-workspace-5'],
  },
  {
    id: 'person-4',
    name: 'Jordan Rivera',
    headline: 'Policy analyst',
    bio: 'Analyses municipal budgets and public finance data, and writes plain-language briefs for city officials.',
    location: 'New Delhi, India',
    imageUrl: pexels(26834972),
    expertise: ['Public finance', 'Policy analysis', 'Budget data'],
    social: none,
    organisationIds: ['org-workspace-2'],
  },
  {
    id: 'person-5',
    name: 'Sana Khan',
    headline: 'Community and events lead',
    bio: 'Runs workshops and convenings that bring community groups, researchers and officials around shared datasets.',
    location: 'Bengaluru, India',
    imageUrl: pexels(1858175),
    expertise: ['Community building', 'Events', 'Open knowledge'],
    social: { linkedin: '', github: '', x: 'https://x.com/sana-khan-sample' },
    organisationIds: ['org-workspace-1'],
  },
  {
    id: 'person-6',
    name: 'Marcus Bell',
    headline: 'Independent data journalist',
    bio: 'Reports on public services using open data, and publishes the datasets behind each story so readers can check the work.',
    location: 'Mumbai, India',
    imageUrl: pexels(21792037),
    expertise: ['Data journalism', 'Public services', 'Open data'],
    social: { linkedin: '', github: 'https://github.com/marcus-bell-sample', x: 'https://x.com/marcus-bell-sample' },
    organisationIds: [],
  },
  {
    id: 'person-7',
    name: 'Dr. Vikram Rao',
    headline: 'Statistician and emergency physician',
    bio: 'Teaches survey methods and applies them to emergency-department data to measure the health cost of extreme weather.',
    location: 'Hyderabad, India',
    imageUrl: pexels(38889914),
    expertise: ['Biostatistics', 'Emergency medicine', 'Survey methods'],
    social: none,
    organisationIds: ['org-workspace-7'],
  },
  {
    id: 'person-8',
    name: 'Anita Joshi',
    headline: 'Public health officer',
    bio: 'Works with neighbourhood groups across Pune and nearby districts to map clinics, water points, anganwadis and shared public spaces, and keeps those maps current as services open, move or close. Spends most weeks in community meetings, turning residents’ local knowledge into open datasets that ward officers and health workers can use. Also trains volunteers in basic data collection and verification, and helps partner organisations publish their findings in plain language.',
    location: 'Pune, India',
    imageUrl: pexels(17164780),
    expertise: ['Community mapping', 'Public health', 'Urban services', 'Public finance', 'Child rights', 'Urban development', 'Law and justice', 'Climate action', 'Disaster risk reduction'],
    social: none,
    organisationIds: ['org-workspace-3'],
  },
  {
    id: 'person-9',
    name: 'Meera Kapoor',
    headline: 'Budget analyst',
    bio: 'Turns published budget documents into open, comparable tables, and explains what changed from one year to the next.',
    location: 'Bengaluru, India',
    imageUrl: pexels(29811345),
    expertise: ['Public budgets', 'Open data', 'Civic technology'],
    social: { linkedin: 'https://linkedin.com/in/meera-kapoor-sample', github: '', x: '' },
    organisationIds: ['org-workspace-6'],
  },
  {
    id: 'person-10',
    name: 'Kavita Menon',
    headline: 'Open data lead, state government',
    bio: 'Helps departments release datasets under an open licence, with documentation people can use.',
    location: 'Thiruvananthapuram, India',
    imageUrl: pexels(30161439),
    expertise: ['Open government data', 'Data governance', 'Licensing'],
    social: none,
    organisationIds: ['org-workspace-4'],
  },
  {
    id: 'person-11',
    name: 'Sunil Varma',
    headline: 'Hydrologist',
    bio: 'Maintains national groundwater and river-flow records and works on making them easier to reuse.',
    location: 'New Delhi, India',
    imageUrl: pexels(7580821),
    expertise: ['Hydrology', 'Groundwater', 'Environmental data'],
    social: none,
    organisationIds: ['org-workspace-8'],
  },
  {
    id: 'person-12',
    name: 'Rahul Desai',
    headline: 'Product designer',
    bio: 'Designs accessible dashboards and reporting tools for local governments.',
    location: 'Kochi, India',
    imageUrl: pexels(32721690),
    expertise: ['Data visualisation', 'Accessibility', 'Dashboards'],
    social: { linkedin: '', github: 'https://github.com/rahul-desai-sample', x: '' },
    organisationIds: ['org-workspace-9'],
  },
  {
    id: 'person-13',
    name: 'Dr. Ananya Bose',
    headline: 'Governance researcher',
    bio: 'Researches participatory budgeting and how transparency reforms change what citizens can ask of their governments.',
    location: 'Guwahati, India',
    imageUrl: pexels(33261949),
    expertise: ['Governance', 'Participatory budgeting', 'Transparency'],
    social: none,
    organisationIds: ['org-workspace-11'],
  },
  {
    id: 'person-14',
    name: 'Lakshmi Iyer',
    headline: 'Farmer network coordinator',
    bio: 'Coordinates field-level weather and price observations across a cooperative of farming households.',
    location: 'Ludhiana, India',
    imageUrl: pexels(26872232),
    expertise: ['Agriculture', 'Field data', 'Cooperatives'],
    social: none,
    organisationIds: ['org-workspace-10'],
  },
  {
    id: 'person-15',
    name: 'Dr. Farah Siddiqui',
    headline: 'Epidemiologist',
    bio: 'Links clinic and community health data to find where services are failing, then shares the methods so others can repeat them.',
    location: 'Bhubaneswar, India',
    imageUrl: pexels(21792045),
    expertise: ['Epidemiology', 'Health services', 'Reproducible methods'],
    social: { linkedin: 'https://linkedin.com/in/farah-siddiqui-sample', github: '', x: '' },
    organisationIds: ['org-workspace-5'],
  },
]

/** The signed-in prototype user's public organisation: John Doe belongs to CivicDataLab. */
export const MOCK_ME_ORGANISATION_IDS = ['org-workspace-1']

type Ref = `${MockContributionType}:${string}`

/** The published records each person is credited on. A record can be credited to several people, and also to its organisation. */
export const MOCK_PERSON_CREDITS: Record<string, Ref[]> = {
  me: ['dataset:ds-1', 'dataset:ds-21', 'use-case:usecase-1', 'use-case:usecase-8', 'collaborative:collaborative-1', 'event:evt-1', 'publication:publication-sample-policy-brief'],
  'person-1': ['use-case:usecase-1', 'use-case:usecase-7', 'collaborative:collaborative-1', 'collaborative:collaborative-4', 'dataset:ds-2', 'dataset:ds-11', 'event:evt-1', 'publication:publication-sample-toolkit'],
  'person-2': ['dataset:ds-1', 'dataset:ds-10', 'collaborative:collaborative-3', 'event:evt-6', 'ai-model:ai-model-1', 'use-case:usecase-1'],
  'person-3': ['use-case:usecase-8', 'collaborative:collaborative-1', 'collaborative:collaborative-4', 'collaborative:collaborative-8', 'event:evt-5', 'dataset:ds-16'],
  'person-4': ['collaborative:collaborative-3', 'dataset:ds-3', 'dataset:ds-15', 'use-case:usecase-3', 'event:evt-2', 'publication:publication-sample-case-study'],
  'person-5': ['collaborative:collaborative-3', 'event:evt-6', 'dataset:ds-1', 'publication:publication-1', 'publication:publication-sample-field-note'],
  'person-6': ['use-case:usecase-6', 'collaborative:collaborative-1', 'collaborative:collaborative-7', 'event:evt-3', 'dataset:ds-19', 'publication:publication-sample-toolkit'],
  'person-7': ['use-case:usecase-4', 'use-case:usecase-7', 'collaborative:collaborative-1', 'collaborative:collaborative-6', 'dataset:ds-4', 'dataset:ds-9'],
  'person-8': ['use-case:usecase-4', 'collaborative:collaborative-1', 'collaborative:collaborative-6', 'dataset:ds-5', 'dataset:ds-12', 'event:evt-3'],
  'person-9': ['collaborative:collaborative-6', 'dataset:ds-3', 'dataset:ds-15', 'use-case:usecase-6', 'event:evt-5', 'publication:publication-sample-case-study'],
  'person-10': ['use-case:usecase-5', 'collaborative:collaborative-7', 'dataset:ds-10', 'dataset:ds-11', 'event:evt-4', 'publication:publication-1'],
  'person-11': ['use-case:usecase-6', 'collaborative:collaborative-7', 'dataset:ds-17', 'dataset:ds-18', 'dataset:ds-19'],
  'person-12': ['collaborative:collaborative-6', 'collaborative:collaborative-8', 'dataset:ds-9', 'ai-model:ai-model-1', 'event:evt-2'],
  'person-13': ['collaborative:collaborative-8', 'collaborative:collaborative-5', 'event:evt-8', 'dataset:ds-13', 'publication:publication-sample-field-note', 'publication:publication-sample-policy-brief'],
  'person-14': ['collaborative:collaborative-8', 'event:evt-8', 'event:evt-7', 'dataset:ds-13', 'dataset:ds-14'],
  'person-15': ['collaborative:collaborative-1', 'collaborative:collaborative-6', 'dataset:ds-16', 'dataset:ds-20', 'use-case:usecase-5', 'event:evt-5'],
}

/** Which organisation published each sample record that has no real organisation of its own. */
export const MOCK_ORGANISATION_CONTENT: Record<string, Ref[]> = {
  'org-workspace-2': ['dataset:ds-2', 'use-case:usecase-3', 'collaborative:collaborative-7', 'event:evt-2'],
  'org-workspace-3': ['dataset:ds-5', 'dataset:ds-12', 'use-case:usecase-4', 'event:evt-3'],
  'org-workspace-4': ['dataset:ds-10', 'dataset:ds-11', 'event:evt-4'],
  'org-workspace-5': ['dataset:ds-16', 'dataset:ds-20', 'use-case:usecase-5', 'collaborative:collaborative-4', 'event:evt-5'],
  'org-workspace-6': ['dataset:ds-3', 'dataset:ds-15', 'use-case:usecase-6'],
  'org-workspace-7': ['dataset:ds-4', 'use-case:usecase-7'],
  'org-workspace-8': ['dataset:ds-17', 'dataset:ds-18', 'dataset:ds-19'],
  'org-workspace-9': ['dataset:ds-9'],
  'org-workspace-10': ['dataset:ds-13', 'dataset:ds-14', 'event:evt-7'],
  'org-workspace-11': ['event:evt-8', 'collaborative:collaborative-5'],
}
