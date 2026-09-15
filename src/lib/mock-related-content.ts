export interface MockContentItem {
  id: string
  title: string
  /** Organisation / contributor behind the resource, where known. */
  organisation?: string
}

export interface MockPublicationItem extends MockContentItem {
  publicationType: string
}

export const MOCK_USE_CASES: MockContentItem[] = [
  { id: 'uc-1', title: 'Maternal Health Monitoring', organisation: 'Ministry of Health' },
  { id: 'uc-2', title: 'Municipal Budget Transparency Tracker', organisation: 'Open Cities Network' },
  { id: 'uc-3', title: 'Flood Risk Early Warning', organisation: 'CivicDataLab' },
]

export const MOCK_COLLABORATIVES: MockContentItem[] = [
  { id: 'collab-1', title: 'FemHealth', organisation: 'CivicDataLab' },
  { id: 'collab-2', title: 'Open Cities Network', organisation: 'Open Knowledge Foundation' },
]

export const MOCK_AI_MODELS: MockContentItem[] = [
  { id: 'model-1', title: 'Responsible AI', organisation: 'CivicDataLab' },
  { id: 'model-2', title: 'Public Grievance Classifier', organisation: 'Ministry of Electronics & IT' },
]

export const MOCK_PUBLICATIONS: MockPublicationItem[] = [
  { id: 'pub-ref-1', title: 'State of Open Data 2026', organisation: 'Open Knowledge Foundation', publicationType: 'report' },
  { id: 'pub-ref-2', title: 'Maternal Health Data Playbook', organisation: 'Ministry of Health', publicationType: 'reading-material' },
  { id: 'pub-ref-3', title: 'Civic Data Standards Overview', organisation: 'CivicDataLab', publicationType: 'presentation' },
]
