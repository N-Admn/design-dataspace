import type { UploadedAsset } from '@/lib/generic-upload'
import type { Organisation } from '@/types/event'

export type UseCaseStatus = 'draft' | 'pending' | 'published'

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
  thumbnail: UploadedAsset | null
  title: string
  subtitle: string
  tags: string[]
  sdgGoals: string[]
  sectors: string[]
  geographies: string[]
}

export type UseCaseHeadingLevel = 2 | 3

export interface UseCaseHeadingBlock {
  id: string
  type: 'heading'
  text: string
  level: UseCaseHeadingLevel
}

export interface UseCaseTextBlock {
  id: string
  type: 'text'
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

export interface UseCaseHighlightBlock {
  id: string
  type: 'highlight'
  highlight: string
  supportingText: string
}

export interface UseCaseLinkBlock {
  id: string
  type: 'link'
  url: string
  label: string
  description: string
}

export type UseCaseBlockType = 'heading' | 'text' | 'image' | 'chart' | 'highlight' | 'link'

export type UseCaseBlock =
  | UseCaseHeadingBlock
  | UseCaseTextBlock
  | UseCaseImageBlock
  | UseCaseChartBlock
  | UseCaseHighlightBlock
  | UseCaseLinkBlock

export interface UseCaseConnectedDataset {
  id: string
  title: string
}

export interface UseCaseContributor {
  id: string
  name: string
  role: string
}

export interface UseCaseConnections {
  datasets: UseCaseConnectedDataset[]
  contributors: UseCaseContributor[]
  organizations: Organisation[]
}

export interface UseCaseFormState {
  metadata: UseCaseMetadata
  blocks: UseCaseBlock[]
  connections: UseCaseConnections
}

export interface UseCaseRecord {
  id: string
  status: UseCaseStatus
  updatedAt: string
  form: UseCaseFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while edits are Pending, so Discard has the live version to revert to. */
  publishedForm: UseCaseFormState | null
}

export const emptyUseCaseMetadata: UseCaseMetadata = {
  thumbnail: null,
  title: '',
  subtitle: '',
  tags: [],
  sdgGoals: [],
  sectors: [],
  geographies: [],
}

export const emptyUseCaseForm: UseCaseFormState = {
  metadata: emptyUseCaseMetadata,
  blocks: [],
  connections: {
    datasets: [],
    contributors: [],
    organizations: [],
  },
}
