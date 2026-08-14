import type { UploadedAsset } from '@/lib/generic-upload'
import type { Organisation } from '@/types/event'

export type UseCaseStatus = 'draft' | 'pending' | 'published'

export type UseCaseRunningStatus = 'planned' | 'ongoing' | 'completed'

export const RUNNING_STATUS_OPTIONS: { value: UseCaseRunningStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

export const SDG_GOAL_OPTIONS = [
  { value: 'sdg-1', label: '1. No Poverty' },
  { value: 'sdg-2', label: '2. Zero Hunger' },
  { value: 'sdg-3', label: '3. Good Health and Well-being' },
  { value: 'sdg-4', label: '4. Quality Education' },
  { value: 'sdg-5', label: '5. Gender Equality' },
  { value: 'sdg-6', label: '6. Clean Water and Sanitation' },
  { value: 'sdg-7', label: '7. Affordable and Clean Energy' },
  { value: 'sdg-8', label: '8. Decent Work and Economic Growth' },
  { value: 'sdg-9', label: '9. Industry, Innovation and Infrastructure' },
  { value: 'sdg-10', label: '10. Reduced Inequalities' },
  { value: 'sdg-11', label: '11. Sustainable Cities and Communities' },
  { value: 'sdg-12', label: '12. Responsible Consumption and Production' },
  { value: 'sdg-13', label: '13. Climate Action' },
  { value: 'sdg-14', label: '14. Life Below Water' },
  { value: 'sdg-15', label: '15. Life on Land' },
  { value: 'sdg-16', label: '16. Peace, Justice and Strong Institutions' },
  { value: 'sdg-17', label: '17. Partnerships for the Goals' },
]

export interface UseCaseMetadata {
  title: string
  platformUrl: string
  runningStatus: UseCaseRunningStatus | ''
  startedOn: string
  completedOn: string
  sectors: string[]
  sdgGoals: string[]
  geographies: string[]
  tags: string[]
  logo: UploadedAsset | null
}

export interface UseCaseIntroduction {
  thumbnail: UploadedAsset | null
  subtitle: string
  descriptionHtml: string
}

export type UseCaseBlockType = 'heading' | 'paragraph' | 'image' | 'chart' | 'callout'
export type UseCaseHeadingLevel = 2 | 3

export interface UseCaseHeadingBlock {
  id: string
  type: 'heading'
  text: string
  level: UseCaseHeadingLevel
}

export interface UseCaseParagraphBlock {
  id: string
  type: 'paragraph'
  html: string
}

export interface UseCaseImageBlock {
  id: string
  type: 'image'
  asset: UploadedAsset | null
  caption: string
}

export interface UseCaseChartBlock {
  id: string
  type: 'chart'
  chartId: string | null
  chartTitle: string
  caption: string
}

export interface UseCaseCalloutBlock {
  id: string
  type: 'callout'
  highlight: string
  supportingText: string
}

export type UseCaseBlock =
  | UseCaseHeadingBlock
  | UseCaseParagraphBlock
  | UseCaseImageBlock
  | UseCaseChartBlock
  | UseCaseCalloutBlock

export interface UseCaseConnectedDataset {
  id: string
  title: string
}

export interface UseCaseConnectedChart {
  id: string
  chartId: string
  title: string
}

export interface UseCaseDashboardLink {
  id: string
  title: string
  url: string
}

export interface UseCaseContributor {
  id: string
  name: string
  role: string
}

export interface UseCaseConnections {
  datasets: UseCaseConnectedDataset[]
  charts: UseCaseConnectedChart[]
  dashboards: UseCaseDashboardLink[]
  contributors: UseCaseContributor[]
  supportedBy: Organisation[]
  partneredBy: Organisation[]
}

export interface UseCaseFormState {
  metadata: UseCaseMetadata
  introduction: UseCaseIntroduction
  blocks: UseCaseBlock[]
  connections: UseCaseConnections
}

export interface UseCaseRecord {
  id: string
  status: UseCaseStatus
  updatedAt: string
  form: UseCaseFormState
}

export const emptyUseCaseMetadata: UseCaseMetadata = {
  title: '',
  platformUrl: '',
  runningStatus: '',
  startedOn: '',
  completedOn: '',
  sectors: [],
  sdgGoals: [],
  geographies: [],
  tags: [],
  logo: null,
}

export const emptyUseCaseForm: UseCaseFormState = {
  metadata: emptyUseCaseMetadata,
  introduction: {
    thumbnail: null,
    subtitle: '',
    descriptionHtml: '',
  },
  blocks: [],
  connections: {
    datasets: [],
    charts: [],
    dashboards: [],
    contributors: [],
    supportedBy: [],
    partneredBy: [],
  },
}
