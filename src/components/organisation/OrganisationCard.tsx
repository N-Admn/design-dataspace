import { Link } from 'react-router-dom'
import { ArrowRight, Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn, initialsFor } from '@/lib/utils'
import {
  ORGANISATION_TYPE_OPTIONS,
  organisationRoleLabel,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

const VISIBLE_MEMBER_AVATARS = 3

function typeLabel(type: string): string | null {
  return ORGANISATION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? null
}

interface OrganisationCardProps {
  organisation: OrganisationRecord
  role: OrganisationRole
}

/** The entire card is a single keyboard-accessible link (Section 5: "Clicking the
 * card opens the selected organisation workspace") — no nested interactive
 * elements, so it works correctly with Tab/Enter and screen readers. */
function OrganisationCard({ organisation, role }: OrganisationCardProps) {
  const { metadata, members } = organisation
  const resolvedType = typeLabel(metadata.type)
  const visibleMembers = members.slice(0, VISIBLE_MEMBER_AVATARS)
  const overflowCount = members.length - visibleMembers.length

  return (
    <Link
      to={`/organisations/${organisation.id}`}
      className="group flex flex-col items-center gap-5 rounded-2xl border border-border-default bg-surface-default p-8 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
    >
      <div className="relative">
        {metadata.logo?.dataUrl ? (
          <img
            src={metadata.logo.dataUrl}
            alt=""
            className="size-24 rounded-full border border-border-default object-cover"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full bg-surface-accent text-text-on-accent">
            <Building2 className="size-10" />
          </div>
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-0.5 right-0.5 size-4 rounded-full border-2 border-surface-default bg-surface-success"
        />
      </div>

      <div>
        <p className="type-heading-2 text-text-brand">{metadata.name}</p>
        {resolvedType && <p className="mt-1 text-sm text-text-subdued">{resolvedType}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant={role === 'admin' ? 'accent' : 'secondary'}>Your role: {organisationRoleLabel(role)}</Badge>
        <span className="text-sm text-text-subdued">
          {members.length} member{members.length === 1 ? '' : 's'}
        </span>
      </div>

      {members.length > 0 && (
        <div className="flex items-center -space-x-2" aria-hidden="true">
          {visibleMembers.map((member) => (
            <div
              key={member.id}
              className="flex size-9 items-center justify-center rounded-full border-2 border-surface-default bg-surface-subdued text-xs font-semibold text-text-subdued"
            >
              {initialsFor(member.name)}
            </div>
          ))}
          {overflowCount > 0 && (
            <div className="flex size-9 items-center justify-center rounded-full border-2 border-surface-default bg-surface-subdued text-xs font-semibold text-text-subdued">
              +{overflowCount}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-lg bg-action-primary-default/5 px-4 py-3 text-sm font-semibold text-text-brand transition-colors',
          'group-hover:bg-action-primary-default/10',
        )}
      >
        View organisation
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

export { OrganisationCard }
