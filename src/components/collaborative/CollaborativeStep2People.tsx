import * as React from 'react'
import { Building2, Plus, Trash2, User, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useToast } from '@/components/ui/toast'
import { PeopleOrgSearchField, type PeopleOrgSearchResult } from '@/components/collaborative/PeopleOrgSearchField'
import { AddContributorForm } from '@/components/usecase/AddContributorForm'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { ChoiceDialog, type ChoiceOption } from '@/components/shared/ChoiceDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppData } from '@/context/AppDataContext'
import { RELATIONSHIP_OPTIONS } from '@/types/collaborative'
import type { CollaborativeConnections, CollaborativePerson, CollaborativeRelationship } from '@/types/collaborative'

type NewEntryKind = CollaborativePerson['kind']

const NEW_ENTRY_OPTIONS: ChoiceOption<NewEntryKind>[] = [
  {
    value: 'person',
    label: 'Person',
    description: 'Add an individual who is contributing to, partnering on or supporting this Collaborative.',
    icon: User,
  },
  {
    value: 'organisation',
    label: 'Organisation',
    description: 'Add an organisation that isn’t on CivicDataSpace yet. It becomes available to connect elsewhere too.',
    icon: Building2,
  },
]

interface CollaborativeStep2PeopleProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
}

function CollaborativeStep2People({ connections, onChange }: CollaborativeStep2PeopleProps) {
  const { organisations, addOrganisation } = useAppData()
  const toast = useToast()
  const [showChooser, setShowChooser] = React.useState(false)
  const [newEntry, setNewEntry] = React.useState<NewEntryKind | null>(null)

  const excludeIds = connections.people.map((p) => p.refId)

  /** Everyone starts as a Contributor; the row's picker changes it. */
  const addPerson = (entry: Omit<CollaborativePerson, 'relationship'>) => {
    onChange({ ...connections, people: [...connections.people, { ...entry, relationship: 'contributor' }] })
  }

  const handleSelect = (result: PeopleOrgSearchResult) => addPerson(result)

  const updateRelationship = (refId: string, relationship: CollaborativeRelationship) => {
    onChange({
      ...connections,
      people: connections.people.map((p) => (p.refId === refId ? { ...p, relationship } : p)),
    })
  }

  const removePerson = (refId: string) => {
    onChange({ ...connections, people: connections.people.filter((p) => p.refId !== refId) })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>People & Organisations</CardTitle>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add the people and organisations involved in this Collaborative.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowChooser(true)}>
            <Plus className="size-4" />
            Add New
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <PeopleOrgSearchField
            organisations={organisations}
            excludeIds={excludeIds}
            placeholder="Search people or organisations..."
            onSelect={handleSelect}
          />

          {connections.people.length === 0 ? (
            <EmptyState
              icon={Users}
              title="People and organisations will appear here."
              description="Search CivicDataSpace, or use Add New for someone who isn’t listed yet."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {connections.people.map((person) => (
                <div key={person.refId} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {person.logo?.dataUrl ? (
                    <img src={person.logo.dataUrl} alt="" className="size-9 shrink-0 rounded-full border border-border object-cover" />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {person.kind === 'person' ? <User className="size-4" /> : <Building2 className="size-4" />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{person.context}</p>
                  </div>
                  <div className="w-36 shrink-0">
                    <SearchableSelect
                      options={RELATIONSHIP_OPTIONS}
                      value={person.relationship}
                      onChange={(value) => updateRelationship(person.refId, value as CollaborativeRelationship)}
                      placeholder="Relationship..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => removePerson(person.refId)}
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChoiceDialog
        open={showChooser}
        onOpenChange={setShowChooser}
        title="Add New"
        description="Choose whether you’re adding a person or an organisation."
        groupLabel="Add a person or an organisation"
        options={NEW_ENTRY_OPTIONS}
        onContinue={(kind) => {
          setShowChooser(false)
          setNewEntry(kind)
        }}
      />

      <AddContributorForm
        open={newEntry === 'person'}
        onOpenChange={(open) => !open && setNewEntry(null)}
        title="Add Person"
        description="Add a person involved in this Collaborative. You can set whether they’re a Contributor, Partner or Supporter after adding them."
        submitLabel="Add Person"
        onAdd={(person) => {
          addPerson({
            refId: `person-new-${Date.now()}`,
            kind: 'person',
            name: person.name,
            context: [person.designation, person.organisation].filter(Boolean).join(' · '),
            logo: person.image ?? undefined,
          })
          setNewEntry(null)
          toast({ title: 'Person added', description: `"${person.name}" added to this Collaborative.`, variant: 'success' })
        }}
      />

      <AddOrganisationForm
        open={newEntry === 'organisation'}
        onOpenChange={(open) => !open && setNewEntry(null)}
        onCreate={(org) => {
          const newOrg = addOrganisation(org)
          addPerson({
            refId: newOrg.id,
            kind: 'organisation',
            name: newOrg.name,
            context: newOrg.isRegistered ? 'Registered organisation' : 'New organisation',
            logo: newOrg.logo,
          })
          setNewEntry(null)
          toast({ title: 'Organisation created', description: `"${newOrg.name}" created and connected.`, variant: 'success' })
        }}
      />
    </div>
  )
}

export { CollaborativeStep2People }
