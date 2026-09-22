import type { DatasetRecord } from '@/types/dataset'
import type { OrganisationRecord } from '@/types/organisation-workspace'
import { MOCK_PROFILE } from '@/types/profile'

export interface DatasetPublisher {
  name: string
  description?: string
  website?: string
  location?: string
  /** True when the dataset has no Organisation Workspace and is attributed to the
   *  individual creator instead — mirrors how the rest of the app already treats
   *  ungrouped content as "My Workspace" personal content (see `createdBy` in
   *  AppDataContext). */
  isIndividual: boolean
  /** The org's logo or the individual's avatar, when one has actually been set —
   *  `null` (not a placeholder image) when there isn't one, so callers fall back
   *  to an initials avatar instead of an invented picture. */
  avatarUrl: string | null
}

/** Resolves who published a dataset, for the consumer-facing Dataset Details page.
 *  Reuses the existing `organisationId` → Organisation Workspace link rather than
 *  introducing a new "publisher" field on `DatasetMetadata`. */
export function resolveDatasetPublisher(
  dataset: DatasetRecord,
  organisationWorkspaces: OrganisationRecord[],
): DatasetPublisher {
  const org = dataset.organisationId
    ? organisationWorkspaces.find((o) => o.id === dataset.organisationId)
    : undefined

  if (org) {
    return {
      name: org.metadata.name,
      description: org.metadata.description,
      website: org.metadata.website,
      location: org.metadata.location,
      isIndividual: false,
      avatarUrl: org.metadata.logo?.dataUrl ?? null,
    }
  }

  return {
    name: dataset.createdBy || `${MOCK_PROFILE.firstName} ${MOCK_PROFILE.lastName}`,
    description: MOCK_PROFILE.bio,
    location: MOCK_PROFILE.location,
    isIndividual: true,
    avatarUrl: MOCK_PROFILE.avatarDataUrl,
  }
}
