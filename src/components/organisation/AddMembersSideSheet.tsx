import * as React from 'react'
import { CheckCircle2, Copy, Mail, User, X } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { SearchInput, SearchResultList, SearchResultRow } from '@/components/shared/SearchResultList'
import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { FieldError } from '@/components/ui/field-error'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { isValidEmail } from '@/lib/auth-mock'
import { MOCK_PEOPLE } from '@/lib/mock-people'
import { EvaluationScopePicker } from '@/components/organisation/EvaluationScopePicker'
import {
  ORGANISATION_ROLE_OPTIONS,
  organisationRoleLabel,
  type EvaluationScopeItem,
  type OrganisationInviteLink,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

interface AddMembersSideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisation: OrganisationRecord
}

const TABS = [
  { key: 'people', label: 'Invite people' },
  { key: 'link', label: 'Invite via link' },
]

interface InviteRow {
  /** MockPerson id for an existing user, or the email itself for an email-only
   *  invitee — either way, stable and unique within the row list. */
  key: string
  personId?: string
  name: string
  email?: string
  role: OrganisationRole | ''
}

function AddMembersSideSheet({ open, onOpenChange, organisation }: AddMembersSideSheetProps) {
  const { inviteOrganisationMember, createInviteLink } = useAppData()
  const toast = useToast()

  const [tab, setTab] = React.useState<'people' | 'link'>('people')

  // "Invite people" tab state — entirely separate from the link tab's state,
  // per the requirement that the two invitation methods never share form state.
  const [query, setQuery] = React.useState('')
  const [rows, setRows] = React.useState<InviteRow[]>([])
  const [showErrors, setShowErrors] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [sentNames, setSentNames] = React.useState<string[] | null>(null)

  // "Invite via link" tab state.
  const [linkRole, setLinkRole] = React.useState<OrganisationRole | ''>('')
  // An Evaluator link carries the records the Evaluator will review, so it is generated as an invitation record before it can be copied.
  const [linkScope, setLinkScope] = React.useState<EvaluationScopeItem[]>([])
  const [generatedLink, setGeneratedLink] = React.useState<OrganisationInviteLink | null>(null)
  const [linkError, setLinkError] = React.useState<string | null>(null)
  // "Invite people": the records every Evaluator in the list will review.
  const [peopleScope, setPeopleScope] = React.useState<EvaluationScopeItem[]>([])

  React.useEffect(() => {
    if (open) {
      setTab('people')
      setQuery('')
      setRows([])
      setShowErrors(false)
      setSubmitting(false)
      setSubmitError(null)
      setSentNames(null)
      setLinkRole('')
      setLinkScope([])
      setGeneratedLink(null)
      setLinkError(null)
      setPeopleScope([])
    }
  }, [open])

  const existingPersonIds = new Set(organisation.members.map((m) => m.personId))
  const existingEmails = new Set(organisation.members.filter((m) => m.email).map((m) => m.email!.toLowerCase()))
  const pendingInvitations = organisation.invitations.filter((i) => i.status === 'pending')
  const pendingPersonIds = new Set(pendingInvitations.map((i) => i.personId).filter(Boolean) as string[])
  const pendingEmails = new Set(pendingInvitations.filter((i) => i.email).map((i) => i.email!.toLowerCase()))
  const addedPersonIds = new Set(rows.map((r) => r.personId).filter(Boolean) as string[])
  const addedEmails = new Set(rows.filter((r) => r.email).map((r) => r.email!.toLowerCase()))

  const q = query.trim()
  const qLower = q.toLowerCase()
  const peopleResults = MOCK_PEOPLE.filter(
    (p) => !existingPersonIds.has(p.id) && !pendingPersonIds.has(p.id) && !addedPersonIds.has(p.id),
  )
    .filter((p) => !q || p.name.toLowerCase().includes(qLower))
    .slice(0, 6)

  // A typed email that isn't already a member, pending invite, or already-added
  // row surfaces as its own "invite by email" result — the path for someone
  // with no existing CivicDataSpace account.
  const emailResult =
    isValidEmail(q) &&
    !existingEmails.has(qLower) &&
    !pendingEmails.has(qLower) &&
    !addedEmails.has(qLower) &&
    !peopleResults.some((p) => p.name.toLowerCase() === qLower)
      ? q
      : null

  const addPersonRow = (person: (typeof MOCK_PEOPLE)[number]) => {
    setRows((prev) => [...prev, { key: person.id, personId: person.id, name: person.name, role: '' }])
    setQuery('')
  }

  const addEmailRow = (email: string) => {
    setRows((prev) => [...prev, { key: email.toLowerCase(), email, name: email, role: '' }])
    setQuery('')
  }

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  const updateRowRole = (key: string, role: OrganisationRole) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, role } : r)))
  }

  const rowsMissingRole = rows.some((r) => !r.role)
  const hasEvaluatorRow = rows.some((r) => r.role === 'evaluator')
  const evaluatorScopeMissing = hasEvaluatorRow && peopleScope.length === 0

  const handleSendInvite = () => {
    if (rows.length === 0 || rowsMissingRole || evaluatorScopeMissing) {
      setShowErrors(true)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      for (const row of rows) {
        inviteOrganisationMember(organisation.id, {
          personId: row.personId,
          name: row.name,
          email: row.email,
          role: row.role as OrganisationRole,
          evaluationScope: row.role === 'evaluator' ? peopleScope : undefined,
        })
      }
      setSubmitting(false)
      setSentNames(rows.map((r) => r.name))
    } catch (error) {
      setSubmitting(false)
      setSubmitError(error instanceof Error && error.message ? error.message : 'We couldn’t send these invitations. Please try again.')
    }
  }

  const linkIsEvaluator = linkRole === 'evaluator'
  // The link points at this app's own invitation page. It names a token, not a person: the organisation, role and (for an Evaluator) records
  // are kept with the link, and nothing appears in the Invitations tab until someone opens it.
  const inviteLink = generatedLink ? `${window.location.origin}/invite/${generatedLink.token}` : ''

  // A link is generated, then copied. Generating it makes no invitation and sends no notification. An Evaluator link cannot be made
  // without at least one published record.
  const handleGenerateLink = () => {
    if (!linkRole) {
      setShowErrors(true)
      return
    }
    if (linkIsEvaluator && linkScope.length === 0) {
      setShowErrors(true)
      return
    }
    try {
      setGeneratedLink(createInviteLink(organisation.id, { role: linkRole, evaluationScope: linkIsEvaluator ? linkScope : undefined }))
      setLinkError(null)
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'We couldn’t generate this link. Please try again.')
    }
  }

  const handleCopyLink = async () => {
    if (!generatedLink) {
      handleGenerateLink()
      return
    }
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast({ title: 'Invite link copied', description: inviteLink, variant: 'success' })
    } catch {
      toast({ title: 'Invite link', description: inviteLink })
    }
  }

  if (sentNames) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent variant="right-drawer" className="gap-0 p-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>Add Members</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <CheckCircle2 className="size-10 text-text-success" />
            <p className="text-base font-semibold text-text-default">
              {sentNames.length === 1 ? 'Invitation sent' : 'Invitations sent'}
            </p>
            <p className="text-sm text-text-subdued">
              {sentNames.length === 1
                ? `An invitation has been sent to ${sentNames[0]}.`
                : `Invitations have been sent to ${sentNames.length} people.`}
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-end border-t border-border-default px-6 py-4">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>Invite people to {organisation.metadata.name} by email or with a shareable link.</DialogDescription>
        </DialogHeader>

        <ViewTabs
          items={TABS}
          value={tab}
          onChange={(key) => setTab(key as 'people' | 'link')}
          idPrefix="add-members"
          label="Invitation method"
          className="shrink-0 px-6"
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <ViewTabPanel id="people" idPrefix="add-members" active={tab === 'people'}>
            <div className="flex flex-col gap-5">
              {submitError && (
                <div className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                  <p className="text-sm font-medium text-text-critical-strong">{submitError}</p>
                </div>
              )}

              <div>
                <Label htmlFor="invite-search">
                  Add people <span className="text-text-critical-strong">*</span>
                </Label>
                <div className="mt-1.5">
                  <SearchInput
                    id="invite-search"
                    value={query}
                    onChange={setQuery}
                    placeholder="Search by name, or enter an email address"
                    className={showErrors && rows.length === 0 ? 'border-border-critical' : undefined}
                  />
                  {q && (
                    <SearchResultList
                      isEmpty={peopleResults.length === 0 && !emailResult}
                      emptyLabel="No matching people found."
                      className="mt-2 max-h-56 overflow-y-auto"
                    >
                      {peopleResults.map((person) => (
                        <SearchResultRow
                          key={person.id}
                          icon={User}
                          primary={person.name}
                          secondary={person.title}
                          onSelect={() => addPersonRow(person)}
                        />
                      ))}
                      {emailResult && (
                        <SearchResultRow
                          key={emailResult}
                          icon={Mail}
                          primary={`Invite ${emailResult}`}
                          secondary="No CivicDataSpace account yet — they'll be invited by email."
                          onSelect={() => addEmailRow(emailResult)}
                        />
                      )}
                    </SearchResultList>
                  )}
                </div>
                {showErrors && rows.length === 0 && <FieldError message="Add at least one person or email." />}
              </div>

              {rows.length > 0 && (
                <div className="flex flex-col gap-2">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center gap-3 rounded-md border border-border-input bg-surface-subdued/40 px-3 py-2.5"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-default text-text-subdued">
                        {row.personId ? <User className="size-4" /> : <Mail className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-default">{row.name}</p>
                        {row.personId === undefined && row.email && (
                          <p className="truncate text-xs text-text-subdued">Invite by email</p>
                        )}
                      </div>
                      <div className="w-36 shrink-0">
                        <SearchableSelect
                          id={`invite-role-${row.key}`}
                          options={ORGANISATION_ROLE_OPTIONS}
                          value={row.role}
                          onChange={(value) => updateRowRole(row.key, value as OrganisationRole)}
                          placeholder="Role..."
                          invalid={showErrors && !row.role}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${row.name}`}
                        onClick={() => removeRow(row.key)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {showErrors && rowsMissingRole && <FieldError message="Choose a role for everyone in the list." />}
                </div>
              )}

              {hasEvaluatorRow && (
                <EvaluationScopePicker
                  idPrefix="invite-people-scope"
                  organisationId={organisation.id}
                  value={peopleScope}
                  onChange={setPeopleScope}
                  error={showErrors && evaluatorScopeMissing ? 'Choose at least one published record for the Evaluators to review.' : null}
                />
              )}
            </div>
          </ViewTabPanel>

          <ViewTabPanel id="link" idPrefix="add-members" active={tab === 'link'}>
            <div className="flex flex-col gap-5">
              <div>
                <Label htmlFor="invite-link-role">
                  Role <span className="text-text-critical-strong">*</span>
                </Label>
                <div className="mt-1.5">
                  <SearchableSelect
                    id="invite-link-role"
                    options={ORGANISATION_ROLE_OPTIONS}
                    value={linkRole}
                    onChange={(value) => {
                      setLinkRole(value as OrganisationRole)
                      // A link made for one role is not reused for another.
                      setGeneratedLink(null)
                      setLinkError(null)
                    }}
                    placeholder="Select a role..."
                    invalid={showErrors && !linkRole}
                  />
                </div>
                {showErrors && !linkRole ? (
                  <FieldError message="Select a role to generate an invite link." />
                ) : (
                  <p className="mt-1.5 text-xs text-text-subdued">
                    {linkRole
                      ? `Each link works for one person: the first person to open it claims it and joins as ${organisationRoleLabel(linkRole)}.`
                      : 'Choose a role — the person who opens the link will join with that role.'}
                  </p>
                )}
              </div>

              {linkIsEvaluator && !generatedLink && (
                <EvaluationScopePicker
                  idPrefix="invite-link-scope"
                  organisationId={organisation.id}
                  value={linkScope}
                  onChange={setLinkScope}
                  error={showErrors && linkScope.length === 0 ? 'Choose at least one published record to generate an Evaluator link.' : null}
                />
              )}
              {linkError && <FieldError message={linkError} />}
              {generatedLink && (
                <p className="text-xs text-text-subdued">
                  {linkIsEvaluator
                    ? `This link gives evaluation access to ${generatedLink.evaluationScope?.length ?? 0} published record${(generatedLink.evaluationScope?.length ?? 0) === 1 ? '' : 's'}. Access starts only when the person accepts. `
                    : ''}
                  It appears in Invitations as soon as someone opens it, and cannot be used by anyone else after that.
                </p>
              )}

              {inviteLink && (
                <div className="rounded-lg border border-border-default bg-surface-subdued/30 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-subdued">Invitation link</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate font-mono text-sm text-text-default">{inviteLink}</p>
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleCopyLink}>
                      <Copy className="size-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ViewTabPanel>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          {tab === 'people' ? (
            <Button type="button" onClick={handleSendInvite} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Invite'}
            </Button>
          ) : (
            <Button type="button" onClick={handleCopyLink}>
              <Copy className="size-4" />
              {generatedLink ? 'Copy Link' : 'Generate Link'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddMembersSideSheet }
