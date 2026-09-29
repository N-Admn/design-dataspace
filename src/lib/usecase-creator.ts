import { resolvePublisherByOrganisation } from '@/lib/dataset-publisher'
import type { OrganisationRecord } from '@/types/organisation-workspace'
import type { UseCaseRecord } from '@/types/usecase'

/** The single entity a use case is attributed to: its Organisation Workspace when
 *  it has one, otherwise the individual who created it. Same `organisationId` →
 *  workspace lookup as datasets; organisations carry an "Organisation" label so
 *  they render in the same avatar/name/detail pattern as people. */
export function resolveUseCaseCreator(
  record: Pick<UseCaseRecord, 'organisationId' | 'createdBy'> | undefined,
  organisationWorkspaces: OrganisationRecord[],
): { name: string; avatarUrl: string | null; detail?: string } {
  const publisher = resolvePublisherByOrganisation(record?.organisationId, record?.createdBy, organisationWorkspaces)
  const isOrganisation = Boolean(record?.organisationId && organisationWorkspaces.some((o) => o.id === record.organisationId))
  return { ...publisher, detail: isOrganisation ? 'Organisation' : undefined }
}
