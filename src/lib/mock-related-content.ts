export interface MockContentItem {
  id: string
  title: string
}

export const MOCK_USE_CASES: MockContentItem[] = [
  { id: 'uc-1', title: 'Maternal Health Monitoring' },
  { id: 'uc-2', title: 'Municipal Budget Transparency Tracker' },
  { id: 'uc-3', title: 'Flood Risk Early Warning' },
]

export const MOCK_COLLABORATIVES: MockContentItem[] = [
  { id: 'collab-1', title: 'FemHealth' },
  { id: 'collab-2', title: 'Open Cities Network' },
]

export const MOCK_AI_MODELS: MockContentItem[] = [
  { id: 'model-1', title: 'Responsible AI' },
  { id: 'model-2', title: 'Public Grievance Classifier' },
]
