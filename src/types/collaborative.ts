import type { UploadedAsset } from '@/lib/generic-upload'

export type CollaborativeStatus = 'draft' | 'published'

export type CollaborativeRelationship = 'contributor' | 'partner' | 'supporter'

export const RELATIONSHIP_OPTIONS: { value: CollaborativeRelationship; label: string }[] = [
  { value: 'contributor', label: 'Contributor' },
  { value: 'partner', label: 'Partner' },
  { value: 'supporter', label: 'Supporter' },
]

/** Every Collaborative gets its own subdomain: `<slug>${COLLABORATIVE_URL_SUFFIX}`. */
export const COLLABORATIVE_URL_SUFFIX = '.collab.civicdataspace.in'

/** Plain-text length limit for the description (matches the current Collaboratives editor). */
export const COLLABORATIVE_DESCRIPTION_MAX_LENGTH = 10000

export interface CollaborativeMetadata {
  image: UploadedAsset | null
  name: string
  /** Subdomain label for the Collaborative URL — lowercase letters, digits, hyphens. */
  slug: string
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
   * while a working copy has unpublished edits, so Discard can restore the live version. */
  publishedForm: CollaborativeFormState | null
  /** Present only for content created within an Organisation Workspace — absent
   *  (undefined) means it belongs to the individual's My Workspace. */
  organisationId?: string
  /** Display name of the member who created this record. */
  createdBy?: string
}

export const emptyCollaborativeMetadata: CollaborativeMetadata = {
  image: null,
  name: '',
  slug: '',
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
