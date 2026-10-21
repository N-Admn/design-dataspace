import type { UploadedAsset } from '@/lib/generic-upload'
import { logoDevAsset } from '@/lib/org-logo'
import { mockPortraitId } from '@/lib/mock-portraits'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import { MOCK_PEOPLE } from '@/lib/mock-people'
import type { CollaborativeFormState, CollaborativePerson, CollaborativeRecord, CollaborativeRelationship } from '@/types/collaborative'

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

/** A connected organisation, read from the mock organisation directory (name and logo included). */
function org(id: string, relationship: CollaborativeRelationship): CollaborativePerson {
  const o = MOCK_ORGANISATIONS.find((x) => x.id === id)
  if (!o) throw new Error(`Unknown mock organisation ${id}`)
  return { refId: o.id, kind: 'organisation', name: o.name, context: o.isRegistered ? 'Registered organisation' : 'New organisation', logo: o.logo, relationship }
}

/** A connected person, read from the mock people directory; `photoId` is an optional free-licence Pexels portrait. */
function person(id: string, relationship: CollaborativeRelationship, photoId?: number): CollaborativePerson {
  const p = MOCK_PEOPLE.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown mock person ${id}`)
  return {
    refId: p.id,
    kind: 'person',
    name: p.name,
    context: p.title,
    relationship,
    logo: fakeAsset(`https://images.pexels.com/photos/${photoId ?? mockPortraitId(p.name)}/pexels-photo-${photoId ?? mockPortraitId(p.name)}.jpeg?auto=compress&cs=tinysrgb&w=300`, `${p.id}.jpg`),
  }
}

const photo = (id: number) => fakeAsset(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=300`, `photo-${id}.jpg`)

/** Real organisations used as sample data, each with the website its logo is looked up from (see `lib/org-logo.ts`). */
const REAL_ORGS: Record<string, { name: string; domain: string }> = {
  'metro-air': { name: 'World Meteorological Organization', domain: 'wmo.int' },
  'coastal-climate': { name: 'UN Environment Programme', domain: 'unep.org' },
  'riverside-sph': { name: 'London School of Hygiene & Tropical Medicine', domain: 'lshtm.ac.uk' },
  'community-clinics': { name: 'Médecins Sans Frontières', domain: 'msf.org' },
  'green-commons': { name: 'Wellcome Trust', domain: 'wellcome.org' },
  'open-cities': { name: 'Open Government Partnership', domain: 'opengovpartnership.org' },
  'urban-mobility': { name: 'Institute for Transportation and Development Policy', domain: 'itdp.org' },
  'national-stats': { name: 'Open Data Institute', domain: 'theodi.org' },
  'rural-livelihoods': { name: 'International Fund for Agricultural Development', domain: 'ifad.org' },
  'agri-research': { name: 'CGIAR', domain: 'cgiar.org' },
  'food-observatory': { name: 'World Food Programme', domain: 'wfp.org' },
  'basin-authority': { name: 'International Water Management Institute', domain: 'iwmi.org' },
  'farmers-alliance': { name: 'Food and Agriculture Organization of the United Nations', domain: 'fao.org' },
  'water-utilities': { name: 'WaterAid', domain: 'wateraid.org' },
  'sanitation-hub': { name: 'UNICEF', domain: 'unicef.org' },
  'local-government': { name: 'UN-Habitat', domain: 'unhabitat.org' },
}

function realOrg(slug: string, relationship: CollaborativeRelationship): CollaborativePerson {
  const { name, domain } = REAL_ORGS[slug]
  return { refId: `org-sample-${slug}`, kind: 'organisation', name, context: 'Registered organisation', relationship, logo: logoDevAsset(domain, slug) ?? undefined }
}

/** An invented person (sample data only); `photoId` is an optional free-licence Pexels portrait. */
function samplePerson(slug: string, name: string, designation: string, relationship: CollaborativeRelationship, photoId?: number): CollaborativePerson {
  return { refId: `person-sample-${slug}`, kind: 'person', name, context: designation, relationship, logo: photo(photoId ?? mockPortraitId(name)) }
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
    sdgGoals: ['sdg-3', 'sdg-6', 'sdg-13'],
    tags: ['Climate', 'Health', 'Disaster Resilience'],
    geographies: ['india'],
  },
  connections: {
    people: [
      org('org-1', 'partner'),
      org('org-2', 'supporter'),
      org('org-3', 'contributor'),
      realOrg('metro-air', 'partner'),
      realOrg('coastal-climate', 'partner'),
      realOrg('riverside-sph', 'contributor'),
      realOrg('community-clinics', 'contributor'),
      realOrg('green-commons', 'supporter'),
      person('person-1', 'contributor', 7580822),
      person('person-3', 'partner', 30004323),
      person('person-6', 'supporter'),
      samplePerson('farah-siddiqui', 'Dr. Farah Siddiqui', 'Epidemiologist', 'contributor', 21792045),
      samplePerson('vikram-rao', 'Dr. Vikram Rao', 'Emergency Medicine Physician', 'partner', 38889914),
      samplePerson('arvind-pillai', 'Arvind Pillai', 'GIS Specialist', 'contributor', 33261949),
      samplePerson('anita-joshi', 'Anita Joshi', 'Public Health Officer', 'contributor'),
      samplePerson('kavya-reddy', 'Kavya Reddy', 'Policy Analyst', 'supporter', 30161439),
      samplePerson('sameer-joshi', 'Sameer Joshi', 'Data Engineer', 'contributor', 26872232),
    ],
    datasets: [
      { id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' },
      { id: 'ds-5', title: 'Urban Water Supply & Coverage Indicators (2024)' },
      { id: 'ds-10', title: 'Ambient Air Quality Monitoring Stations (2025)' },
      { id: 'ds-11', title: 'Hospital Admissions for Respiratory Illness (2024)' },
      { id: 'ds-12', title: 'Urban Green Cover and Heat Islands (2025)' },
      { id: 'ds-16', title: 'Child Nutrition Survey Indicators (2024)' },
      { id: 'ds-17', title: 'Flood Extent and Affected Habitations (2024)' },
      { id: 'ds-20', title: 'Primary Health Centre Staffing (2025)' },
    ],
    useCases: [
      { id: 'usecase-1', title: 'Maternal Health Monitoring in Rural Districts' },
      { id: 'usecase-3', title: 'Air Quality Alerts for Urban Schools' },
      { id: 'usecase-4', title: 'Early Warning for Heat-Related Illness' },
      { id: 'usecase-7', title: 'Flood Risk Mapping for Health Facilities' },
    ],
    publications: [
      { id: 'evt-1-evt1-pub-1', title: 'Event Summary Report' },
      { id: 'evt-1-evt1-pub-2', title: 'Speaker Presentation Deck' },
      { id: 'evt-2-evt2-pub-4', title: 'Post-Event Policy Brief' },
    ],
    events: [
      { id: 'evt-1', title: 'Open Data Summit 2026' },
      { id: 'evt-2', title: 'AI for Public Good Workshop' },
    ],
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

const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`

/** Municipal finance: datasets and people, no use case yet. */
const collaborative3Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(pexels(8190805), 'hero.jpg'),
    name: 'Municipal Finance and Budget Transparency Network',
    slug: 'municipal-finance-transparency',
    descriptionHtml:
      '<p>A network of city finance officers, researchers and civic groups working to make municipal budgets easier to read, compare and question.</p><p>Members publish budget and expenditure data in open formats and agree common definitions, so that a rupee spent in one city can be compared with a rupee spent in another.</p><ul><li>Open budget and expenditure datasets</li><li>Shared definitions and a common data dictionary</li><li>Periodic review of data quality</li></ul>',
    externalUrl: 'https://example.org/municipal-finance',
    sectors: ['finance', 'urban-development'],
    sdgGoals: ['sdg-8', 'sdg-11', 'sdg-16'],
    tags: ['Municipal Finance', 'Budgets', 'Transparency'],
    geographies: ['india'],
  },
  connections: {
    people: [
      org('org-1', 'partner'),
      org('org-2', 'supporter'),
      person('person-2', 'contributor', 11357069),
      person('person-4', 'contributor', 26834972),
      person('person-5', 'supporter'),
    ],
    datasets: [
      { id: 'ds-1', title: 'National Economic Indicators & GDP Growth Projections (2020–2026)' },
      { id: 'ds-3', title: 'India District Financial Inclusion Index (2024)' },
    ],
    useCases: [],
  },
}

/** Gender and education equity: one dataset, an external link left out, so the page has no call-to-action card. */
const collaborative4Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(pexels(4865519), 'hero.jpg'),
    name: 'Gender and Education Equity Data Collaborative',
    slug: 'gender-education-equity',
    descriptionHtml:
      '<p>Bringing education and gender data together to see where girls and young women are, and are not, completing school.</p><p>The collaborative links enrolment and infrastructure data with partners who work on the ground.</p>',
    externalUrl: '',
    sectors: ['education'],
    sdgGoals: ['sdg-4', 'sdg-5', 'sdg-10'],
    tags: ['Education', 'Gender'],
    geographies: ['india'],
  },
  connections: {
    people: [org('org-3', 'partner'), org('org-1', 'contributor'), person('person-3', 'partner', 30004323), person('person-1', 'contributor')],
    datasets: [{ id: 'ds-4', title: 'State-wise Education Infrastructure & Enrollment Statistics (2023–24)' }],
    useCases: [],
  },
}

/** The sparsest publishable Collaborative: required fields only. No image, tags, SDG goals, link or people. */
const collaborative5Form: CollaborativeFormState = {
  metadata: {
    image: null,
    name: 'Safe Water Access Data Network',
    slug: 'safe-water-access',
    descriptionHtml: '<p>Sharing data on urban water supply and coverage.</p>',
    externalUrl: '',
    sectors: ['water-sanitation'],
    sdgGoals: [],
    tags: [],
    geographies: [],
  },
  connections: {
    people: [],
    datasets: [{ id: 'ds-5', title: 'Urban Water Supply & Coverage Indicators (2024)' }],
    useCases: [],
  },
}

const DESCRIPTION_LIST = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`

/** Fully filled: every field, every section, more than one screenful of datasets and use cases, five SDG goals. */
const collaborative6Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(pexels(12415346), 'hero.jpg'),
    name: 'Clean Air and Urban Health Data Collaborative',
    slug: 'clean-air-urban-health',
    descriptionHtml:
      '<p>Air pollution is one of the largest and most preventable risks to health in Indian cities, yet the evidence that links what people breathe to who falls ill sits in separate systems. This collaborative brings monitoring, hospital, transport and land-use data together in one place.</p><p>Researchers, city agencies and clinicians use the shared datasets to test where pollution drives illness, which neighbourhoods are most exposed, and whether interventions are working.</p>' +
      DESCRIPTION_LIST(['Open air-quality and admissions datasets with documented methods', 'Shared definitions so cities can be compared fairly', 'Use cases that turn the data into alerts, plans and evaluations']),
    externalUrl: 'https://example.org/clean-air-urban-health',
    sectors: ['health', 'environment', 'urban-development'],
    sdgGoals: ['sdg-3', 'sdg-7', 'sdg-11', 'sdg-13', 'sdg-17'],
    tags: ['Air Quality', 'Urban Health', 'Pollution', 'Cities'],
    geographies: ['india'],
  },
  connections: {
    people: [
      org('org-1', 'partner'),
      org('org-3', 'supporter'),
      realOrg('metro-air', 'partner'),
      realOrg('riverside-sph', 'contributor'),
      realOrg('community-clinics', 'contributor'),
      realOrg('open-cities', 'contributor'),
      realOrg('urban-mobility', 'supporter'),
      realOrg('green-commons', 'supporter'),
      realOrg('coastal-climate', 'partner'),
      realOrg('national-stats', 'contributor'),
      samplePerson('meera-kapoor', 'Dr. Meera Kapoor', 'Air Quality Scientist', 'contributor', 29811345),
      samplePerson('vikram-rao', 'Dr. Vikram Rao', 'Emergency Medicine Physician', 'partner', 38889914),
      samplePerson('anita-joshi', 'Anita Joshi', 'Public Health Officer', 'contributor'),
      samplePerson('rahul-desai', 'Rahul Desai', 'Urban Planner', 'contributor', 26834972),
      samplePerson('kavya-reddy', 'Kavya Reddy', 'Policy Analyst', 'supporter', 30161439),
      samplePerson('farah-siddiqui', 'Dr. Farah Siddiqui', 'Epidemiologist', 'contributor', 21792045),
      samplePerson('arvind-pillai', 'Arvind Pillai', 'GIS Specialist', 'contributor', 33261949),
      samplePerson('neha-gupta', 'Neha Gupta', 'Programme Manager', 'partner', 7580821),
      samplePerson('sameer-joshi', 'Sameer Joshi', 'Data Engineer', 'contributor', 26872232),
      samplePerson('lakshmi-iyer', 'Lakshmi Iyer', 'Transport Researcher', 'contributor', 4584064),
      samplePerson('ananya-bose', 'Dr. Ananya Bose', 'Health Economist', 'supporter', 7580837),
      samplePerson('karan-chawla', 'Karan Chawla', 'Open Data Lead', 'contributor', 32721690),
      samplePerson('priya-raman', 'Priya Raman', 'Community Health Lead', 'partner', 27896377),
      samplePerson('thomas-george', 'Thomas George', 'Science Journalist', 'supporter', 17164780),
    ],
    datasets: [
      { id: 'ds-10', title: 'Ambient Air Quality Monitoring Stations (2025)' },
      { id: 'ds-11', title: 'Hospital Admissions for Respiratory Illness (2024)' },
      { id: 'ds-12', title: 'Urban Green Cover and Heat Islands (2025)' },
      { id: 'ds-21', title: 'Urban Transport Emissions Inventory (2024)' },
      { id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' },
      { id: 'ds-20', title: 'Primary Health Centre Staffing (2025)' },
      { id: 'ds-16', title: 'Child Nutrition Survey Indicators (2024)' },
      { id: 'ds-18', title: 'Groundwater Levels and Quality (2025)' },
    ],
    useCases: [
      { id: 'usecase-3', title: 'Air Quality Alerts for Urban Schools' },
      { id: 'usecase-4', title: 'Early Warning for Heat-Related Illness' },
      { id: 'usecase-7', title: 'Flood Risk Mapping for Health Facilities' },
      { id: 'usecase-1', title: 'Maternal Health Monitoring in Rural Districts' },
    ],
  },
}

/** Fully filled, with six SDG goals (the card shows four and a "+2" square). */
const collaborative7Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(pexels(12413177), 'hero.jpg'),
    name: 'Food Security and Climate Resilience Data Collaborative',
    slug: 'food-security-climate-resilience',
    descriptionHtml:
      '<p>Harvests, prices and nutrition are all shaped by weather that is becoming harder to predict. This collaborative connects rainfall, soil, crop, market and nutrition data so that planners can see food-security risks building before they become crises.</p><p>Members include agricultural researchers, market monitors and district officials who share data openly and agree how it should be used.</p>' +
      DESCRIPTION_LIST(['Ten seasons of district crop and rainfall data', 'Weekly food prices from district markets', 'Nutrition indicators alongside climate risk']),
    externalUrl: 'https://example.org/food-security-climate-resilience',
    sectors: ['agriculture', 'environment', 'health'],
    sdgGoals: ['sdg-2', 'sdg-1', 'sdg-12', 'sdg-13', 'sdg-15', 'sdg-17'],
    tags: ['Food Security', 'Climate Resilience', 'Agriculture', 'Nutrition'],
    geographies: ['india', 'global'],
  },
  connections: {
    people: [
      org('org-1', 'partner'),
      org('org-2', 'supporter'),
      realOrg('rural-livelihoods', 'partner'),
      realOrg('agri-research', 'partner'),
      realOrg('food-observatory', 'contributor'),
      realOrg('basin-authority', 'contributor'),
      realOrg('national-stats', 'contributor'),
      realOrg('farmers-alliance', 'supporter'),
      realOrg('coastal-climate', 'partner'),
      samplePerson('kavita-menon', 'Kavita Menon', 'Agronomist', 'contributor', 21792037),
      samplePerson('sunil-varma', 'Sunil Varma', 'Market Analyst', 'contributor'),
      samplePerson('harish-naidu', 'Dr. Harish Naidu', 'Soil Scientist', 'partner', 12775205),
      samplePerson('divya-menon', 'Divya Menon', 'Food Policy Researcher', 'contributor', 18788182),
      samplePerson('aisha-verma', 'Dr. Aisha Verma', 'Public Health Researcher', 'contributor', 7580822),
      samplePerson('rohan-mehta', 'Rohan Mehta', 'Data Analyst', 'contributor', 11357069),
      samplePerson('priya-nair', 'Priya Nair', 'Programme Manager', 'partner', 30004323),
      samplePerson('imran-sheikh', 'Imran Sheikh', 'District Agriculture Officer', 'supporter'),
      samplePerson('geeta-rao', 'Geeta Rao', 'Extension Specialist', 'contributor'),
      samplePerson('tarun-bhatt', 'Tarun Bhatt', 'Remote Sensing Analyst', 'contributor'),
      samplePerson('nisha-pandey', 'Nisha Pandey', 'Nutrition Researcher', 'partner'),
      samplePerson('omar-farouk', 'Omar Farouk', 'Economist', 'supporter'),
    ],
    datasets: [
      { id: 'ds-13', title: 'Crop Yield and Rainfall by District (2015–2025)' },
      { id: 'ds-14', title: 'Soil Moisture and Drought Index (2025)' },
      { id: 'ds-15', title: 'Food Price Monitoring (Weekly, 2025)' },
      { id: 'ds-16', title: 'Child Nutrition Survey Indicators (2024)' },
      { id: 'ds-17', title: 'Flood Extent and Affected Habitations (2024)' },
      { id: 'ds-1', title: 'National Economic Indicators & GDP Growth Projections (2020–2026)' },
      { id: 'ds-18', title: 'Groundwater Levels and Quality (2025)' },
      { id: 'ds-5', title: 'Urban Water Supply & Coverage Indicators (2024)' },
    ],
    useCases: [
      { id: 'usecase-5', title: 'Crop Advisory from Rainfall and Soil Data' },
      { id: 'usecase-6', title: 'Food Price Spike Early Detection' },
      { id: 'usecase-7', title: 'Flood Risk Mapping for Health Facilities' },
      { id: 'usecase-4', title: 'Early Warning for Heat-Related Illness' },
    ],
  },
}

/** Fully filled, with four SDG goals. */
const collaborative8Form: CollaborativeFormState = {
  metadata: {
    image: fakeAsset(pexels(17609960), 'hero.jpg'),
    name: 'Water, Sanitation and Public Health Collaborative',
    slug: 'water-sanitation-public-health',
    descriptionHtml:
      '<p>Safe water and working sanitation are the first line of public health, but the data that shows where services fail is scattered across utilities, municipalities and clinics. This collaborative gathers it in one place.</p><p>Utility managers, public health teams and civic groups use it to find the wards and districts where gaps in water and sanitation are most likely to cause illness.</p>' +
      DESCRIPTION_LIST(['Groundwater, supply and sanitation coverage data', 'Facility staffing and disease reporting for the same areas', 'Ward-level analyses that guide investment']),
    externalUrl: 'https://example.org/water-sanitation-public-health',
    sectors: ['water-sanitation', 'health', 'urban-development'],
    sdgGoals: ['sdg-6', 'sdg-3', 'sdg-11', 'sdg-13'],
    tags: ['Water', 'Sanitation', 'Public Health', 'Wards'],
    geographies: ['india'],
  },
  connections: {
    people: [
      org('org-1', 'partner'),
      org('org-3', 'contributor'),
      realOrg('water-utilities', 'partner'),
      realOrg('sanitation-hub', 'partner'),
      realOrg('basin-authority', 'contributor'),
      realOrg('community-clinics', 'contributor'),
      realOrg('open-cities', 'contributor'),
      realOrg('local-government', 'supporter'),
      realOrg('riverside-sph', 'contributor'),
      samplePerson('priya-nair', 'Priya Nair', 'Programme Manager', 'partner', 30004323),
      samplePerson('aisha-verma', 'Dr. Aisha Verma', 'Public Health Researcher', 'contributor', 7580822),
      samplePerson('rahul-desai', 'Rahul Desai', 'Urban Planner', 'contributor', 26834972),
      samplePerson('lakshmi-iyer', 'Lakshmi Iyer', 'Utilities Engineer', 'contributor', 4584064),
      samplePerson('ananya-bose', 'Dr. Ananya Bose', 'Health Economist', 'supporter', 7580837),
      samplePerson('priya-raman', 'Priya Raman', 'Community Health Lead', 'partner', 27896377),
      samplePerson('karan-chawla', 'Karan Chawla', 'Open Data Lead', 'contributor', 32721690),
      samplePerson('deepa-krishnan', 'Deepa Krishnan', 'Sanitation Specialist', 'contributor'),
      samplePerson('manoj-tiwari', 'Manoj Tiwari', 'Ward Officer', 'supporter'),
      samplePerson('salma-begum', 'Salma Begum', 'Hydrogeologist', 'contributor'),
      samplePerson('george-thomas', 'George Thomas', 'Data Journalist', 'supporter', 17164780),
      samplePerson('ritu-saxena', 'Ritu Saxena', 'Programme Officer', 'partner'),
    ],
    datasets: [
      { id: 'ds-5', title: 'Urban Water Supply & Coverage Indicators (2024)' },
      { id: 'ds-18', title: 'Groundwater Levels and Quality (2025)' },
      { id: 'ds-19', title: 'Sanitation Coverage by Ward (2024)' },
      { id: 'ds-17', title: 'Flood Extent and Affected Habitations (2024)' },
      { id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)' },
      { id: 'ds-16', title: 'Child Nutrition Survey Indicators (2024)' },
      { id: 'ds-11', title: 'Hospital Admissions for Respiratory Illness (2024)' },
      { id: 'ds-20', title: 'Primary Health Centre Staffing (2025)' },
    ],
    useCases: [
      { id: 'usecase-8', title: 'Ward-level Sanitation Gap Analysis' },
      { id: 'usecase-7', title: 'Flood Risk Mapping for Health Facilities' },
      { id: 'usecase-1', title: 'Maternal Health Monitoring in Rural Districts' },
      { id: 'usecase-4', title: 'Early Warning for Heat-Related Illness' },
    ],
  },
}

export const MOCK_COLLABORATIVE_RECORDS: CollaborativeRecord[] = [
  {
    id: 'collaborative-1',
    status: 'published',
    updatedAt: '10/08/2026 09:15:00',
    form: collaborative1Form,
    publishedForm: collaborative1Form,
    organisationId: 'org-workspace-1',
    createdBy: 'Rahul Mehta',
  },
  {
    id: 'collaborative-2',
    status: 'draft',
    updatedAt: '15/08/2026 14:05:00',
    form: collaborative2Form,
    publishedForm: null,
    organisationId: 'org-workspace-1',
    createdBy: 'John Doe',
  },
  {
    id: 'collaborative-3',
    status: 'published',
    updatedAt: '12/08/2026 11:30:00',
    form: collaborative3Form,
    publishedForm: collaborative3Form,
    organisationId: 'org-workspace-1',
    createdBy: 'Sana Khan',
  },
  {
    id: 'collaborative-4',
    status: 'published',
    updatedAt: '17/08/2026 16:45:00',
    form: collaborative4Form,
    publishedForm: collaborative4Form,
  },
  {
    id: 'collaborative-5',
    status: 'published',
    updatedAt: '19/08/2026 09:10:00',
    form: collaborative5Form,
    publishedForm: collaborative5Form,
  },
  {
    id: 'collaborative-6',
    status: 'published',
    updatedAt: '20/08/2026 10:00:00',
    form: collaborative6Form,
    publishedForm: collaborative6Form,
    organisationId: 'org-workspace-1',
    createdBy: 'Rahul Mehta',
  },
  {
    id: 'collaborative-7',
    status: 'published',
    updatedAt: '21/08/2026 15:20:00',
    form: collaborative7Form,
    publishedForm: collaborative7Form,
  },
  {
    id: 'collaborative-8',
    status: 'published',
    updatedAt: '22/08/2026 09:40:00',
    form: collaborative8Form,
    publishedForm: collaborative8Form,
    organisationId: 'org-workspace-1',
    createdBy: 'John Doe',
  },
]
