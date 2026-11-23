import * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { EvaluationScopePicker } from '@/components/organisation/EvaluationScopePicker'
import { useAppData } from '@/context/AppDataContext'
import { EVALUATION_PICKER_MODULES } from '@/lib/evaluation-assignments'
import { isLastAdmin } from '@/lib/organisation-permissions'
import {
  ORGANISATION_ROLE_OPTIONS,
  organisationRoleLabel,
  type EvaluationScopeItem,
  type OrganisationMember,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

interface EditMemberRoleSideSheetProps {
  organisation: OrganisationRecord
  member: OrganisationMember | null
  onOpenChange: (open: boolean) => void
}

/** The records an Evaluator is assigned right now, among the kinds this drawer manages. */
function activeScopeOf(organisation: OrganisationRecord, member: OrganisationMember): EvaluationScopeItem[] {
  return (organisation.assignments ?? [])
    .filter((a) => a.status === 'active' && a.evaluatorPersonId === member.personId && EVALUATION_PICKER_MODULES.includes(a.module))
    .map((a) => ({ module: a.module, recordId: a.recordId }))
}

function EditMemberRoleSideSheet({ organisation, member, onOpenChange }: EditMemberRoleSideSheetProps) {
  const { updateOrganisationMemberRole, setEvaluatorAssignments, revokeEvaluatorAccess } = useAppData()
  const confirm = useConfirm()
  const toast = useToast()
  const [role, setRole] = React.useState<OrganisationRole | ''>('')
  const [scope, setScope] = React.useState<EvaluationScopeItem[]>([])
  // Bumped when the scope is reset from outside the picker (revoking access), so the picker starts again from the new value.
  const [pickerKey, setPickerKey] = React.useState(0)
  const [showErrors, setShowErrors] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (member) {
      setRole(member.role)
      setScope(activeScopeOf(organisation, member))
      setPickerKey((k) => k + 1)
      setShowErrors(false)
      setSaveError(null)
    }
    // Reset only when a different member is opened, not on every change to the organisation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id])

  if (!member) return <Dialog open={false} onOpenChange={onOpenChange} />

  const wouldRemoveLastAdmin = role !== 'admin' && isLastAdmin(organisation, member)
  const isEvaluatorMember = member.role === 'evaluator'
  const needsScope = role === 'evaluator'
  const scopeMissing = needsScope && scope.length === 0
  const hasActiveAssignments = (organisation.assignments ?? []).some((a) => a.status === 'active' && a.evaluatorPersonId === member.personId)

  const handleSave = () => {
    if (!role || wouldRemoveLastAdmin) return
    if (scopeMissing) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (role === 'evaluator' && isEvaluatorMember) {
        // Already an Evaluator: only the assigned records change.
        const result = setEvaluatorAssignments(organisation.id, member.personId, scope)
        if (!result.ok) throw new Error(result.message)
      } else if (role !== member.role) {
        updateOrganisationMemberRole(organisation.id, member.id, role, role === 'evaluator' ? scope : undefined)
      }
      onOpenChange(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We couldn’t save these changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Ends all evaluation access at once but leaves the person in the organisation; removing them stays a separate action.
  const handleRevokeAccess = async () => {
    const ok = await confirm({
      title: 'Revoke evaluation access',
      description: `${member.name} will no longer be able to open any of the content assigned to them. They stay a member of ${organisation.metadata.name}, and you can assign content to them again later.`,
      confirmLabel: 'Revoke access',
      variant: 'destructive',
    })
    if (!ok) return
    const result = revokeEvaluatorAccess(organisation.id, member.personId)
    if (!result.ok) {
      setSaveError(result.message)
      return
    }
    setScope([])
    setPickerKey((k) => k + 1)
    toast({ title: 'Evaluation access revoked.', variant: 'success' })
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
            {saveError && (
              <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                <p className="text-sm font-medium text-text-critical-strong">{saveError}</p>
              </div>
            )}

            <div>
              <p className="type-eyebrow text-text-subdued">Member</p>
              <p className="mt-1 text-sm font-semibold text-text-default">{member.name}</p>
            </div>

            <div>
              <p className="type-eyebrow text-text-subdued">Current role</p>
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
              {isEvaluatorMember && role !== 'evaluator' && role !== '' && (
                <p className="mt-1.5 text-xs text-text-subdued">Changing the role ends this member's evaluation access.</p>
              )}
            </div>

            {needsScope && (
              <EvaluationScopePicker
                key={pickerKey}
                idPrefix="edit-member-scope"
                organisationId={organisation.id}
                value={scope}
                onChange={setScope}
                error={
                  showErrors && scopeMissing
                    ? isEvaluatorMember
                      ? 'Choose at least one published record, or revoke evaluation access.'
                      : 'Choose at least one published record for this Evaluator to review.'
                    : null
                }
              />
            )}

            {isEvaluatorMember && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border-default px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-default">Revoke evaluation access</p>
                  <p className="text-xs text-text-subdued">Removes access to all assigned content. {member.name} stays in the organisation.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleRevokeAccess} disabled={!hasActiveAssignments}>
                  Revoke access
                </Button>
              </div>
            )}
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
