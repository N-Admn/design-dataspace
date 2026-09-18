import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useAppData } from '@/context/AppDataContext'
import { isLastAdmin } from '@/lib/organisation-permissions'
import {
  ORGANISATION_ROLE_OPTIONS,
  organisationRoleLabel,
  type OrganisationMember,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

interface EditMemberRoleSideSheetProps {
  organisation: OrganisationRecord
  member: OrganisationMember | null
  onOpenChange: (open: boolean) => void
}

function EditMemberRoleSideSheet({ organisation, member, onOpenChange }: EditMemberRoleSideSheetProps) {
  const { updateOrganisationMemberRole } = useAppData()
  const [role, setRole] = React.useState<OrganisationRole | ''>('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (member) setRole(member.role)
  }, [member?.id])

  if (!member) return <Dialog open={false} onOpenChange={onOpenChange} />

  const wouldRemoveLastAdmin = role !== 'admin' && isLastAdmin(organisation, member)

  const handleSave = () => {
    if (!role || wouldRemoveLastAdmin) return
    setSaving(true)
    updateOrganisationMemberRole(organisation.id, member.id, role)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update this member's role and access within {organisation.metadata.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">Member</p>
              <p className="mt-1 text-sm font-semibold text-text-default">{member.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-subdued">Current role</p>
              <p className="mt-1 text-sm text-text-default">{organisationRoleLabel(member.role)}</p>
            </div>

            <div>
              <Label htmlFor="edit-member-role">New role</Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="edit-member-role"
                  options={ORGANISATION_ROLE_OPTIONS}
                  value={role}
                  onChange={(value) => setRole(value as OrganisationRole)}
                  placeholder="Select a role..."
                />
              </div>
              {wouldRemoveLastAdmin && (
                <p className="mt-1.5 text-xs font-medium text-text-critical-strong">
                  This is the only Admin in {organisation.metadata.name} — assign another Admin before changing this
                  role.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !role || wouldRemoveLastAdmin}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { EditMemberRoleSideSheet }
