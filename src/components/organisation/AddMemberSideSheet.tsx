import * as React from 'react'
import { User, X } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import { FieldError } from '@/components/ui/field-error'
import { useAppData } from '@/context/AppDataContext'
import { MOCK_PEOPLE } from '@/lib/mock-people'
import { ORGANISATION_ROLE_OPTIONS, type OrganisationRecord, type OrganisationRole } from '@/types/organisation-workspace'

interface AddMemberSideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisation: OrganisationRecord
}

function AddMemberSideSheet({ open, onOpenChange, organisation }: AddMemberSideSheetProps) {
  const { addOrganisationMember } = useAppData()
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState<{ id: string; name: string; email?: string } | null>(null)
  const [role, setRole] = React.useState<OrganisationRole | ''>('')
  const [showErrors, setShowErrors] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(null)
      setRole('')
      setShowErrors(false)
      setSubmitting(false)
      setSubmitError(null)
    }
  }, [open])

  const existingPersonIds = new Set(organisation.members.map((m) => m.personId))
  const q = query.trim().toLowerCase()
  const results = MOCK_PEOPLE.filter((p) => !existingPersonIds.has(p.id))
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .slice(0, 8)

  const handleSubmit = () => {
    if (!selected || !role) {
      setShowErrors(true)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      addOrganisationMember(organisation.id, { personId: selected.id, name: selected.name, email: selected.email, role })
      setSubmitting(false)
      onOpenChange(false)
    } catch {
      setSubmitting(false)
      setSubmitError('We couldn’t add this member. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Invite a person to {organisation.metadata.name} and assign the access they need.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {submitError && (
              <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                <p className="text-sm font-medium text-text-critical-strong">{submitError}</p>
              </div>
            )}

            <div>
              <Label htmlFor="member-search">
                Search for a person <span className="text-text-critical-strong">*</span>
              </Label>
              <div className="mt-1.5">
                {selected ? (
                  <div className="flex items-center justify-between rounded-md border border-border-input bg-surface-subdued/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-text-subdued" />
                      <span className="text-sm font-medium text-text-default">{selected.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Clear selected person"
                      onClick={() => setSelected(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <SearchInput
                      id="member-search"
                      value={query}
                      onChange={setQuery}
                      placeholder="Search for a person"
                      className={showErrors && !selected ? 'border-border-critical' : undefined}
                    />
                    <SearchResultList isEmpty={results.length === 0} emptyLabel="No matching people found." className="mt-2 max-h-56 overflow-y-auto">
                      {results.map((person) => (
                        <SearchResultRow
                          key={person.id}
                          icon={User}
                          primary={person.name}
                          secondary={person.title}
                          onSelect={() => {
                            setSelected({ id: person.id, name: person.name })
                            setQuery('')
                          }}
                        />
                      ))}
                    </SearchResultList>
                  </>
                )}
              </div>
              {showErrors && !selected && <FieldError message="Select a person to add." />}
            </div>

            <div>
              <Label htmlFor="member-role">
                Role <span className="text-text-critical-strong">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="member-role"
                  options={ORGANISATION_ROLE_OPTIONS}
                  value={role}
                  onChange={(value) => setRole(value as OrganisationRole)}
                  placeholder="Select a role..."
                  invalid={showErrors && !role}
                />
              </div>
              {showErrors && !role && <FieldError message="Select a role." />}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddMemberSideSheet }
