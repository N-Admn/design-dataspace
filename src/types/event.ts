import type { UploadedAsset } from '@/lib/generic-upload'

export type EventStatus = 'draft' | 'published'
export type EventAccessType = 'online' | 'hybrid' | 'in-person'
export type RegistrationStatus = 'not-required' | 'open' | 'closed'
export type RelatedContentType = 'dataset' | 'use-case' | 'collaborative' | 'ai-model'

export interface Organisation {
  id: string
  name: string
  url: string
  sectorType: string
  logo?: UploadedAsset
  isRegistered: boolean
}

export interface EventPublication {
  id: string
  title: string
  description: string
  publicationType: string
  file: UploadedAsset
}

export interface RelatedContentItem {
  id: string
  title: string
  type: RelatedContentType
}

export interface EventMetadata {
  registrationRequired: boolean
  registrationUrl: string
  registrationEndDate: string
  registrationEndTime: string

  title: string
  subtitle: string
  eventType: string
  theme: string
  overview: string

  startDate: string
  startTime: string
  endDate: string
  endTime: string

  accessType: EventAccessType | ''

  venueName: string
  address: string
  city: string
  state: string
  country: string

  coverImage: UploadedAsset | null
}

export interface EventRelatedContent {
  datasets: RelatedContentItem[]
  useCases: RelatedContentItem[]
  collaboratives: RelatedContentItem[]
  aiModels: RelatedContentItem[]
}

export interface EventFormState {
  metadata: EventMetadata
  organisers: Organisation[]
  partners: Organisation[]
  speakerCount: string
  publications: EventPublication[]
  relatedContent: EventRelatedContent
}

export interface EventRecord {
  id: string
  status: EventStatus
  createdAt: string
  updatedAt: string
  form: EventFormState
}

export const emptyEventMetadata: EventMetadata = {
  registrationRequired: false,
  registrationUrl: '',
  registrationEndDate: '',
  registrationEndTime: '',

  title: '',
  subtitle: '',
  eventType: '',
  theme: '',
  overview: '',

  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',

  accessType: '',

  venueName: '',
  address: '',
  city: '',
  state: '',
  country: '',

  coverImage: null,
}

export const emptyEventForm: EventFormState = {
  metadata: emptyEventMetadata,
  organisers: [],
  partners: [],
  speakerCount: '',
  publications: [],
  relatedContent: {
    datasets: [],
    useCases: [],
    collaboratives: [],
    aiModels: [],
  },
}

export const EVENT_TYPE_OPTIONS = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'roundtable', label: 'Roundtable' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'training', label: 'Training' },
]

export const PUBLICATION_TYPE_OPTIONS = [
  { value: 'report', label: 'Report' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'reading-material', label: 'Reading Material' },
  { value: 'other', label: 'Other' },
]

export const LICENSE_LABEL_TO_MINI_OPTIONS = [
  { value: 'odc-by', label: 'Open Data Commons Open Database License' },
  { value: 'cc-by', label: 'Creative Commons Attribution' },
  { value: 'cc-by-sa', label: 'Creative Commons Attribution-ShareAlike' },
  { value: 'other', label: 'Other' },
]

export const ORG_SECTOR_OPTIONS = [
  { value: 'government', label: 'Government' },
  { value: 'non-profit', label: 'Non-Profit / NGO' },
  { value: 'multilateral', label: 'Multilateral Organisation' },
  { value: 'academia', label: 'Academia / Research' },
  { value: 'private-sector', label: 'Private Sector' },
  { value: 'technology', label: 'Technology' },
  { value: 'civil-society', label: 'Civil Society' },
  { value: 'other', label: 'Other' },
]

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export const SUPPORTED_PUBLICATION_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx']
export const MAX_PUBLICATION_BYTES = 10 * 1024 * 1024

export const RELATED_CONTENT_TYPE_LABELS: Record<RelatedContentType, string> = {
  dataset: 'Dataset',
  'use-case': 'Use Case',
  collaborative: 'Collaborative',
  'ai-model': 'AI Model',
}

export const ACCESS_TYPE_LABELS: Record<EventAccessType, string> = {
  online: 'Online',
  hybrid: 'Hybrid',
  'in-person': 'In-Person',
}
