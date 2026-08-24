import { Building2, User, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { PeopleOrgSearchField, type PeopleOrgSearchResult } from '@/components/collaborative/PeopleOrgSearchField'
import { useAppData } from '@/context/AppDataContext'
import { RELATIONSHIP_OPTIONS } from '@/types/collaborative'
import type { CollaborativeConnections, CollaborativeRelationship } from '@/types/collaborative'

interface CollaborativeStep2PeopleProps {
  connections: CollaborativeConnections
  onChange: (connections: CollaborativeConnections) => void
}

function CollaborativeStep2People({ connections, onChange }: CollaborativeStep2PeopleProps) {
  const { organisations } = useAppData()

  const excludeIds = connections.people.map((p) => p.refId)

  const handleSelect = (result: PeopleOrgSearchResult) => {
    onChange({
      ...connections,
      people: [...connections.people, { ...result, relationship: 'contributor' }],
    })
  }

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
      <div>
        <h2 className="text-lg font-semibold text-primary">People</h2>
        <p className="mt-1 text-sm text-muted-foreground">Who is involved in this Collaborative?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People & Organisations</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Add the people and organisations involved in this Collaborative.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <PeopleOrgSearchField
            organisations={organisations}
            excludeIds={excludeIds}
            placeholder="+ Add People or Organisation"
            onSelect={handleSelect}
          />

          {connections.people.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border py-8 text-center">
              <Users className="size-5 text-muted-foreground" />
              <p className="mt-1 text-sm font-medium text-foreground">People and organisations will appear here.</p>
              <p className="text-xs text-muted-foreground">
                Search CivicDataSpace to add contributors, partners or supporters.
              </p>
            </div>
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
                    size="sm"
                    onClick={() => removePerson(person.refId)}
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { CollaborativeStep2People }
