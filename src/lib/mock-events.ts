import type { EventFormState, EventRecord, EventSpeaker } from '@/types/event'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'

let mockSpeakerId = 0
function mkSpeaker(name: string, designation = '', organisation = ''): EventSpeaker {
  mockSpeakerId += 1
  return { id: `mock-speaker-${mockSpeakerId}`, name, designation, organisation, bio: '', image: null }
}

const evt1Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/summit-2026',
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
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1], MOCK_ORGANISATIONS[2]],
  speakers: [
    mkSpeaker('Dr. Anjali Rao', 'Chief Economist', 'National Statistics Office'),
    mkSpeaker('Vikram Mehta', 'Senior Fellow', 'Centre for Policy Research'),
    mkSpeaker('Sunita Nair', 'Lead Data Analyst', 'CivicDataLab'),
  ],
  publications: [],
  relatedContent: {
    datasets: [
      { id: 'ds-1', title: 'National Economic Indicators & GDP Growth Projections (2020–2026)', type: 'dataset' },
    ],
    useCases: [],
    collaboratives: [],
    aiModels: [],
  },
}

const evt2Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/ai-workshop',
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
    venueName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Rahul Desai', 'Program Director', 'Open Data Institute'),
    mkSpeaker('Meera Krishnan', 'Researcher', 'IIT Delhi'),
  ],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt3Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/meetup',
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
    venueName: 'CivicDataLab Office',
    address: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Arjun Pillai', 'GIS Specialist', 'Bhuvan'),
    mkSpeaker('Fatima Sheikh', 'Urban Planner', 'Janaagraha'),
  ],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt4Form: EventFormState = {
  metadata: {
    registrationRequired: false,
    registrationUrl: '',
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
    venueName: 'Delhi Policy Group',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt5Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/licensing-101',
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
    venueName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [],
  speakers: [
    mkSpeaker('Kavya Reddy', 'Data Scientist', 'CivicDataLab'),
    mkSpeaker('Thomas George', 'Facilitator', 'DataMeet'),
  ],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt6Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/dataviz-bootcamp',
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
    venueName: 'CivicDataLab Office',
    address: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1]],
  speakers: [
    mkSpeaker('Neha Gupta', 'Visualization Lead', 'How India Lives'),
    mkSpeaker('Sameer Joshi', 'Dashboard Engineer', 'Gramener'),
    mkSpeaker('Priya Raman', 'Trainer', 'CivicDataLab'),
  ],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt7Form: EventFormState = {
  metadata: {
    registrationRequired: false,
    registrationUrl: '',
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
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[2]],
  speakers: [],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
}

const evt8Form: EventFormState = {
  metadata: {
    registrationRequired: true,
    registrationUrl: 'https://events.civicdataspace.in/state-of-civic-tech',
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
    venueName: 'India Habitat Centre',
    address: 'Lodhi Road',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coverImage: null,
  },
  organisers: [MOCK_ORGANISATIONS[0]],
  partners: [MOCK_ORGANISATIONS[1], MOCK_ORGANISATIONS[2]],
  speakers: [
    mkSpeaker('Dr. Ananya Bose', 'Keynote Speaker', 'World Resources Institute'),
    mkSpeaker('Rohan Malhotra', 'Panel Moderator', 'Ashoka University'),
    mkSpeaker('Lakshmi Iyer', 'Community Lead', 'DataKind Bangalore'),
  ],
  publications: [],
  relatedContent: { datasets: [], useCases: [], collaboratives: [], aiModels: [] },
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
  { id: 'evt-4', status: 'draft', createdAt: '28/06/2026 09:00:00', updatedAt: '05/07/2026 16:05:00', form: evt4Form, publishedForm: null },
  { id: 'evt-5', status: 'published', createdAt: '18/06/2026 09:00:00', updatedAt: '22/06/2026 12:30:00', form: evt5Form, publishedForm: evt5Form },
  { id: 'evt-6', status: 'published', createdAt: '02/06/2026 09:00:00', updatedAt: '09/06/2026 17:45:00', form: evt6WorkingForm, publishedForm: evt6Form },
  { id: 'evt-7', status: 'draft', createdAt: '20/05/2026 09:00:00', updatedAt: '25/05/2026 10:10:00', form: evt7Form, publishedForm: null },
  { id: 'evt-8', status: 'published', createdAt: '28/04/2026 09:00:00', updatedAt: '05/05/2026 14:20:00', form: evt8Form, publishedForm: evt8Form },
]
