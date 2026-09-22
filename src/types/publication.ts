import { MAX_DOCUMENT_BYTES, type UploadedAsset } from '@/lib/generic-upload'
import { MOCK_PROFILE } from '@/types/profile'

export type PublicationStatus = 'draft' | 'published'

export const RESOURCE_TYPE_OPTIONS = [
  { value: 'report', label: 'Report' },
  { value: 'article', label: 'Article' },
  { value: 'field-note', label: 'Field Note' },
  { value: 'research', label: 'Research' },
  { value: 'white-paper', label: 'White Paper' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'policy-brief', label: 'Policy Brief' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'toolkit-guide', label: 'Toolkit / Guide' },
  { value: 'other', label: 'Other' },
]

export const PUBLICATION_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx']
/** Publication content files share the platform-wide 500 MB document ceiling. */
export const MAX_PUBLICATION_FILE_BYTES = MAX_DOCUMENT_BYTES

export interface PublicationContributor {
  id: string
  name: string
  /** Their contribution to this content, e.g. Author, Editor, Director. */
  role: string
  /** Their job title, e.g. Program Manager — distinct from `role`. */
  designation?: string
  /** Organisation the contributor is affiliated with, when known. */
  organisation?: string
  /** Profile photo, when uploaded. */
  image?: UploadedAsset | null
}

export interface PublicationMetadata {
  name: string
  description: string
  /** People and organisations involved in creating this content — may differ
   *  from the account/org that owns the Publication. */
  contributors: PublicationContributor[]
  date: string
  sector: string
  geography: string
  /** Reuses the platform's license taxonomy (see `LICENSE_OPTIONS` in `types/dataset`). */
  usageRights: string
  resourceType: string
  externalLink: string
}

export interface PublicationFileBlock {
  id: string
  type: 'file'
  asset: UploadedAsset | null
  title: string
  /** Contributor-editable description. Falls back to a system-generated one
   *  (see getPublicationFileDescription) when absent. */
  description?: string
}

export interface PublicationVideoBlock {
  id: string
  type: 'video'
  url: string
  title: string
}

export type PublicationBlockType = 'file' | 'video'
export type PublicationBlock = PublicationFileBlock | PublicationVideoBlock

export interface PublicationFormState {
  metadata: PublicationMetadata
  blocks: PublicationBlock[]
}

export interface PublicationRecord {
  id: string
  status: PublicationStatus
  updatedAt: string
  form: PublicationFormState
  /** Snapshot of `form` from the moment this record was last published — untouched
   * while a working copy has unpublished edits, so Discard can restore the live version. */
  publishedForm: PublicationFormState | null
}

/** The account creating a new Publication is automatically its first
 *  contributor — they can edit or remove this entry like any other. */
export const emptyPublicationMetadata: PublicationMetadata = {
  name: '',
  description: '',
  contributors: [
    { id: 'contributor-uploader', name: `${MOCK_PROFILE.firstName} ${MOCK_PROFILE.lastName}`, role: 'Uploader' },
  ],
  date: '',
  sector: '',
  geography: '',
  usageRights: '',
  resourceType: '',
  externalLink: '',
}

export const emptyPublicationForm: PublicationFormState = {
  metadata: emptyPublicationMetadata,
  blocks: [],
}
