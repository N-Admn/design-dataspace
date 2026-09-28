import type { UploadedAsset } from '@/lib/generic-upload'
import type { EventFormState, EventPublication, EventRecord, EventRelatedContent, EventSpeaker } from '@/types/event'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'

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

let mockSpeakerId = 0
/** `photoId` is a Pexels photo id for a portrait headshot — these speakers
 *  are entirely fictional mock personas, so a stock photo stands in for a
 *  real headshot the same way the rest of this file's mock data is invented. */
function mkSpeaker(name: string, designation = '', organisation = '', photoId?: string): EventSpeaker {
  mockSpeakerId += 1
  return {
    id: `mock-speaker-${mockSpeakerId}`,
    name,
    designation,
    organisation,
    bio: '',
    image: photoId ? fakeAsset(`https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=300`, 'headshot.jpg') : null,
  }
}

/** One relevant-looking cover photo per event, matched to its type/theme —
 *  reuses the same "external URL as mock dataUrl" pattern already used by
 *  Use Cases and Collaboratives rather than storing binaries in the repo. */
function eventCover(photoId: string, name: string): UploadedAsset {
  return fakeAsset(`https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200`, name)
}

/** Every published dataset/use case/collaborative/AI model connected to
 *  every mock event, for now — so the Event Details page's Related Content
 *  carousels can be reviewed fully populated rather than mostly empty. */
const FULL_RELATED_CONTENT: EventRelatedContent = {
  datasets: [
    { id: 'ds-1', title: 'National Economic Indicators & GDP Growth Projections (2020–2026)', type: 'dataset' },
    { id: 'ds-2', title: 'District Health Infrastructure & Service Availability (2024)', type: 'dataset' },
    { id: 'ds-3', title: 'India District Financial Inclusion Index (2024)', type: 'dataset' },
    { id: 'ds-4', title: 'State-wise Education Infrastructure & Enrollment Statistics (2023–24)', type: 'dataset' },
    { id: 'ds-5', title: 'Urban Water Supply & Coverage Indicators (2024)', type: 'dataset' },
    { id: 'ds-9', title: 'Civic Grievance Redressal Instruction Prompts (2025)', type: 'dataset' },
  ],
  useCases: [
    { id: 'usecase-1', title: 'Maternal Health Monitoring in Rural Districts', type: 'use-case' },
    { id: 'usecase-2', title: 'Urban Water Access Gap Analysis', type: 'use-case' },
  ],
  collaboratives: [
    { id: 'collaborative-1', title: 'Climate and Health Data Collaborative', type: 'collaborative' },
    { id: 'collaborative-2', title: 'Urban Water Resilience Network', type: 'collaborative' },
  ],
  aiModels: [
    { id: 'ai-model-1', title: 'Flood Risk Forecaster', type: 'ai-model' },
    { id: 'ai-model-2', title: 'Policy Document Summarizer', type: 'ai-model' },
  ],
}

/** Four representative publications per event — enough to exercise the
 *  Publications carousel (>2 items) on every event page. */
function mkPublications(prefix: string): EventPublication[] {
  return [
    {
      id: `${prefix}-pub-1`,
      title: 'Event Summary Report',
      description: 'A detailed recap of sessions, key takeaways and outcomes from the event.',
      publicationType: 'report',
      organisation: 'CivicDataLab',
    },
    {
      id: `${prefix}-pub-2`,
      title: 'Speaker Presentation Deck',
      description: 'Slides shared by the speakers during their sessions.',
      publicationType: 'presentation',
      organisation: 'CivicDataLab',
    },
    {
      id: `${prefix}-pub-3`,
      title: 'Background Reading List',
      description: 'Curated readings distributed to attendees ahead of the event.',
      publicationType: 'reading-material',
    },
    {
      id: `${prefix}-pub-4`,
      title: 'Post-Event Policy Brief',
      description: 'A short brief summarizing policy implications discussed at the event.',
      publicationType: 'other',
      organisation: 'CivicDataLab',
    },
  ]
}

const evt1Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/summit-2026',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-09-10',
    registrationEndTime: '23:59',
    title: 'Open Data Summit 2026',
    subtitle: 'Building Trusted Public Data Ecosystems for Better Governance',
    eventType: 'conference',
    theme: 'urban-development',
    overview:
      'A two-day summit bringing together civic technologists, government data officers, and researchers to discuss trusted, interoperable public data ecosystems.',
    startDate: '2026-09-18',
    startTime: '09:00',
    endDate: '2026-09-19',
    endTime: '17:00',
    accessType: 'hybrid',
    onlineUrl: 'https://meet.civicdataspace.in/summit-2026',
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: eventCover('15325468', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1], MOCK_ORGANISATIONS[2]],
  speakers: [
    mkSpeaker('Dr. Anjali Rao', 'Chief Economist', 'National Statistics Office', '30004323'),
    mkSpeaker('Vikram Mehta', 'Senior Fellow', 'Centre for Policy Research', '38889914'),
    mkSpeaker('Sunita Nair', 'Lead Data Analyst', 'CivicDataLab', '29811345'),
  ],
  publications: mkPublications('evt1'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt2Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/ai-workshop',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-08-11',
    registrationEndTime: '18:00',
    title: 'AI for Public Good Workshop',
    subtitle: 'Practical approaches to responsible AI in public services',
    eventType: 'workshop',
    theme: 'health',
    overview:
      'A hands-on workshop covering practical, responsible approaches to deploying AI in public service delivery, with case studies and open discussion.',
    startDate: '2026-08-12',
    startTime: '10:00',
    endDate: '2026-08-12',
    endTime: '13:00',
    accessType: 'online',
    onlineUrl: 'https://meet.civicdataspace.in/ai-workshop',
    venueName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    coverImage: eventCover('7245808', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Rahul Desai', 'Program Director', 'Open Data Institute', '26834972'),
    mkSpeaker('Meera Krishnan', 'Researcher', 'IIT Delhi', '7580822'),
  ],
  publications: mkPublications('evt2'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt3Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/meetup',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-07-25',
    registrationEndTime: '18:00',
    title: 'Civic Data Community Meetup',
    subtitle: 'Connecting practitioners working with public data',
    eventType: 'meetup',
    theme: 'urban-development',
    overview:
      'An informal meetup for practitioners across government, civil society, and research to share what they are building with public data.',
    startDate: '2026-07-30',
    startTime: '17:30',
    endDate: '2026-07-30',
    endTime: '20:00',
    accessType: 'in-person',
    onlineUrl: '',
    venueName: 'CivicDataLab Office',
    address: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coverImage: eventCover('4865519', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Arjun Pillai', 'GIS Specialist', 'Bhuvan', '33261949'),
    mkSpeaker('Fatima Sheikh', 'Urban Planner', 'Janaagraha', '21792045'),
  ],
  publications: mkPublications('evt3'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt4Form: EventFormState = {
  metadata: {
    registrationRequired: false,
    registrationUrl: '',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '',
    registrationEndTime: '',
    title: 'Data Governance Roundtable',
    subtitle: 'A closed discussion on responsible public data governance',
    eventType: 'roundtable',
    theme: 'urban-development',
    overview:
      'A closed-door roundtable with policy makers and data stewards to discuss responsible governance frameworks for shared public data.',
    startDate: '2026-07-05',
    startTime: '11:00',
    endDate: '2026-07-05',
    endTime: '13:00',
    accessType: 'in-person',
    onlineUrl: '',
    venueName: 'Delhi Policy Group',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: eventCover('1181406', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1]],
  speakers: [
    mkSpeaker('Ravi Kumar', 'Policy Advisor', 'Ministry of Electronics & IT', '11357069'),
    mkSpeaker('Divya Menon', 'Governance Researcher', 'TISS', '21792037'),
  ],
  publications: mkPublications('evt4'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt5Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/licensing-101',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-06-29',
    registrationEndTime: '18:00',
    title: 'Open Data Licensing 101',
    subtitle: 'A practical primer on choosing and applying open data licenses',
    eventType: 'webinar',
    theme: 'open-data',
    overview:
      'An introductory webinar covering the fundamentals of open data licensing, common pitfalls, and how to choose the right license for public datasets.',
    startDate: '2026-06-30',
    startTime: '15:00',
    endDate: '2026-06-30',
    endTime: '16:00',
    accessType: 'online',
    onlineUrl: 'https://meet.civicdataspace.in/licensing-101',
    venueName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    coverImage: eventCover('5486096', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Kavya Reddy', 'Data Scientist', 'CivicDataLab', '30161439'),
    mkSpeaker('Thomas George', 'Facilitator', 'DataMeet', '17164780'),
  ],
  publications: mkPublications('evt5'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt6Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/dataviz-bootcamp',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-06-15',
    registrationEndTime: '18:00',
    title: 'Data Visualization Bootcamp for Civic Teams',
    subtitle: 'Hands-on training for building public-facing data dashboards',
    eventType: 'training',
    theme: 'capacity-building',
    overview:
      'A two-day, hands-on bootcamp for government and civil-society teams to learn practical data visualization techniques for public dashboards.',
    startDate: '2026-06-17',
    startTime: '09:30',
    endDate: '2026-06-18',
    endTime: '16:30',
    accessType: 'in-person',
    onlineUrl: '',
    venueName: 'CivicDataLab Office',
    address: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coverImage: eventCover('18999470', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1]],
  speakers: [
    mkSpeaker('Neha Gupta', 'Visualization Lead', 'How India Lives', '7580821'),
    mkSpeaker('Sameer Joshi', 'Dashboard Engineer', 'Gramener', '26872232'),
    mkSpeaker('Priya Raman', 'Trainer', 'CivicDataLab', '27896377'),
  ],
  publications: mkPublications('evt6'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt7Form: EventFormState = {
  metadata: {
    registrationRequired: false,
    registrationUrl: '',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '',
    registrationEndTime: '',
    title: 'Financial Inclusion Data Roundtable',
    subtitle: 'Reviewing district-level indicators with sector experts',
    eventType: 'roundtable',
    theme: 'finance',
    overview:
      'A closed-door roundtable to review the latest district financial inclusion indicators with researchers, regulators, and civil-society partners.',
    startDate: '2026-06-02',
    startTime: '11:00',
    endDate: '2026-06-02',
    endTime: '13:30',
    accessType: 'in-person',
    onlineUrl: '',
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: eventCover('8190805', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[2]],
  speakers: [
    mkSpeaker('Karan Chawla', 'Economist', 'RBI Research', '32721690'),
    mkSpeaker('Ananya Desai', 'Financial Inclusion Lead', 'MicroSave', '18788182'),
  ],
  publications: mkPublications('evt7'),
  relatedContent: FULL_RELATED_CONTENT,
}

const evt8Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/state-of-civic-tech',
    registrationStartDate: '',
    registrationStartTime: '',
    registrationEndDate: '2026-05-18',
    registrationEndTime: '23:59',
    title: 'State of Civic Tech India 2026',
    subtitle: 'An annual look at civic technology and open governance trends',
    eventType: 'conference',
    theme: 'governance',
    overview:
      'A national conference bringing together civic technologists, policymakers, and researchers to review the state of open governance and civic tech in India.',
    startDate: '2026-05-20',
    startTime: '09:00',
    endDate: '2026-05-21',
    endTime: '17:30',
    accessType: 'hybrid',
    onlineUrl: 'https://meet.civicdataspace.in/state-of-civic-tech',
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: eventCover('8761336', 'cover.jpg'),
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1], MOCK_ORGANISATIONS[2]],
  speakers: [
    mkSpeaker('Dr. Ananya Bose', 'Keynote Speaker', 'World Resources Institute', '7580837'),
    mkSpeaker('Rohan Malhotra', 'Panel Moderator', 'Ashoka University', '12775205'),
    mkSpeaker('Lakshmi Iyer', 'Community Lead', 'DataKind Bangalore', '4584064'),
  ],
  publications: mkPublications('evt8'),
  relatedContent: FULL_RELATED_CONTENT,
}

// evt-6 is published and live, but has a saved working copy with unpublished
// edits — surfaces as "Published · Unsaved changes".
const evt6WorkingForm: EventFormState = {
  ...evt6Form,
  metadata: {
    ...evt6Form.metadata,
    subtitle: 'Hands-on training for building public-facing data dashboards (agenda being revised)',
  },
}

export const MOCK_EVENTS: EventRecord[] = [
  { id: 'evt-1', status: 'published', createdAt: '20/07/2026 09:00:00', updatedAt: '02/08/2026 10:15:00', form: evt1Form, publishedForm: evt1Form },
  { id: 'evt-2', status: 'published', createdAt: '10/07/2026 09:00:00', updatedAt: '28/07/2026 14:40:00', form: evt2Form, publishedForm: evt2Form },
  { id: 'evt-3', status: 'published', createdAt: '01/07/2026 09:00:00', updatedAt: '15/07/2026 11:20:00', form: evt3Form, publishedForm: evt3Form },
  { id: 'evt-4', status: 'published', createdAt: '28/06/2026 09:00:00', updatedAt: '05/07/2026 16:05:00', form: evt4Form, publishedForm: evt4Form },
  { id: 'evt-5', status: 'published', createdAt: '18/06/2026 09:00:00', updatedAt: '22/06/2026 12:30:00', form: evt5Form, publishedForm: evt5Form },
  { id: 'evt-6', status: 'published', createdAt: '02/06/2026 09:00:00', updatedAt: '09/06/2026 17:45:00', form: evt6WorkingForm, publishedForm: evt6Form },
  { id: 'evt-7', status: 'published', createdAt: '20/05/2026 09:00:00', updatedAt: '25/05/2026 10:10:00', form: evt7Form, publishedForm: evt7Form },
  { id: 'evt-8', status: 'published', createdAt: '28/04/2026 09:00:00', updatedAt: '05/05/2026 14:20:00', form: evt8Form, publishedForm: evt8Form },
]
