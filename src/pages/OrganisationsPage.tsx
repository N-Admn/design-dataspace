import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrganisationCard } from '@/components/organisation/OrganisationCard'
import { CreateOrganisationSideSheet } from '@/components/organisation/CreateOrganisationSideSheet'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { currentUserRole, isOrganisationMember } from '@/types/organisation-workspace'

function OrganisationsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { organisationWorkspaces } = useAppData()
  const [createOpen, setCreateOpen] = React.useState(false)

  const myOrganisations = organisationWorkspaces.filter(isOrganisationMember)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Organisations"
        description="Manage contributions and collaborate with organisations you belong to."
        action={
          myOrganisations.length > 0 && (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create Organisation
            </Button>
          )
        }
      />

      {myOrganisations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-default px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-subdued text-text-subdued">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-default">You are not part of an organisation yet</p>
            <p className="mt-1 max-w-md text-sm text-text-subdued">
              Create an organisation to manage shared contributions and collaborate with other members.
            </p>
          </div>
          <Button type="button" className="mt-2" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Organisation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myOrganisations.map((org) => {
            const role = currentUserRole(org)
            if (!role) return null
            return <OrganisationCard key={org.id} organisation={org} role={role} />
          })}
        </div>
      )}

      <CreateOrganisationSideSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(org) => {
          setCreateOpen(false)
          toast({
            title: 'Organisation created successfully.',
            description: 'You are now an admin of this organisation.',
            variant: 'success',
          })
          navigate(`/organisations/${org.id}`)
        }}
      />
    </div>
  )
}

export { OrganisationsPage }
