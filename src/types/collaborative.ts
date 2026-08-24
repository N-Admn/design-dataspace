import type { UploadedAsset } from '@/lib/generic-upload'

export type CollaborativeStatus = 'draft' | 'pending' | 'published'

export type CollaborativeRelationship = 'contributor' | 'partner' | 'supporter'

export const RELATIONSHIP_OPTIONS: { value: CollaborativeRelationship; label: string }[] = [
  { value: 'contributor', label: 'Contributor' },
  { value: 'partner', label: 'Partner' },
  { value: 'supporter', label: 'Supporter' },
]

export interface CollaborativeMetadata {
  image: UploadedAsset | null
  name: string
  descriptionHtml: string
  externalUrl: string
  sectors: string[]
  sdgGoals: string[]
  tags: string[]
  geographies: string[]
}

export interface CollaborativePerson {
  /** The underlying person or organisation id, e.g. "person-1" or "org-1". */
  refId: string
  kind: 'person' | 'organisation'
  name: string
  context: string
  logo?: UploadedAsset
  relationship: CollaborativeRelationship
}

export interface CollaborativeConnectedDataset {
  id: string
  title: string
}

export interface CollaborativeConnectedUseCase {
  id: string
  title: string
}

export interface CollaborativeConnections {
  people: CollaborativePerson[]
  datasets: CollaborativeConnectedDataset[]
  useCases: CollaborativeConnectedUseCase[]
}

export interface CollaborativeFormState {
  metadata: CollaborativeMetadata
  connections: CollaborativeConnections
}

export interface CollaborativeRecord {
  id: string
  status: CollaborativeStatus
  updatedAt: string
  form: CollaborativeFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while edits are Pending, so Discard has the live version to revert to. */
  publishedForm: CollaborativeFormState | null
}

export const emptyCollaborativeMetadata: CollaborativeMetadata = {
  image: null,
  name: '',
  descriptionHtml: '',
  externalUrl: '',
  sectors: [],
  sdgGoals: [],
  tags: [],
  geographies: [],
}

export const emptyCollaborativeForm: CollaborativeFormState = {
  metadata: emptyCollaborativeMetadata,
  connections: {
    people: [],
    datasets: [],
    useCases: [],
  },
}
