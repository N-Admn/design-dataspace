/** The records in My Workspace: the person's own, which are the ones that belong to no organisation. An organisation's content, whatever the
 *  person's role there, is managed in that organisation's workspace under that role's rules, so it never appears here and cannot be edited,
 *  unpublished or deleted from here. */
function useManageableRecords<T extends { organisationId?: string }>(records: T[]): T[] {
  return records.filter((r) => !r.organisationId)
}

export { useManageableRecords }
