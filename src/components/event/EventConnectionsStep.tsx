import * as React from 'react'
import { Building2, Mic2, Pencil, Trash2, X } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AddOrganisationForm } from '@/components/event/AddOrganisationForm'
import { SpeakerForm } from '@/components/event/SpeakerForm'
import { OrganisationSearchField } from '@/components/shared/OrganisationSearchField'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import type { EventFormState, EventSpeaker, Organisation } from '@/types/event'

interface EventConnectionsStepProps {
  form: EventFormState
  onChange: React.Dispatch<React.SetStateAction<EventFormState>>
}

function OrganisationCard({ org, onRemove }: { org: Organisation; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      {org.logo?.dataUrl ? (
        <img src={org.logo.dataUrl} alt="" className="size-9 shrink-0 rounded-md border border-border object-cover" />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Building2 className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
        <p className="text-xs text-muted-foreground">
          {org.isRegistered ? 'Registered organisation' : 'New organisation'}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${org.name}`}
        onClick={onRemove}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

function SpeakerCard({ speaker, onEdit, onRemove }: { speaker: EventSpeaker; onEdit: () => void; onRemove: () => void }) {
  const secondary = [speaker.designation, speaker.organisation].filter(Boolean).join(' · ')
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      {speaker.image?.dataUrl ? (
        <img src={speaker.image.dataUrl} alt="" className="size-9 shrink-0 rounded-full border border-border object-cover" />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Mic2 className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{speaker.name}</p>
        <p className="truncate text-xs text-muted-foreground">{secondary || 'Speaker'}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${speaker.name}`} onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${speaker.name}`}
          onClick={onRemove}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function EventConnectionsStep({ form, onChange }: EventConnectionsStepProps) {
  const { organisations, addOrganisation } = useAppData()
  const [addOrgTarget, setAddOrgTarget] = React.useState<'organiser' | 'partner' | null>(null)
  const [speakerFormOpen, setSpeakerFormOpen] = React.useState(false)
  const [editingSpeakerId, setEditingSpeakerId] = React.useState<string | null>(null)
  const toast = useToast()

  const editingSpeaker = form.speakers.find((s) => s.id === editingSpeakerId)

  const openAddSpeaker = () => {
    setEditingSpeakerId(null)
    setSpeakerFormOpen(true)
  }

  const openEditSpeaker = (id: string) => {
    setEditingSpeakerId(id)
    setSpeakerFormOpen(true)
  }

  const closeSpeakerForm = () => {
    setSpeakerFormOpen(false)
    setEditingSpeakerId(null)
  }

  const upsertSpeaker = (speaker: EventSpeaker) => {
    let wasNew = false
    onChange((prev) => {
      const exists = prev.speakers.some((s) => s.id === speaker.id)
      wasNew = !exists
      return {
        ...prev,
        speakers: exists
          ? prev.speakers.map((s) => (s.id === speaker.id ? speaker : s))
          : [...prev.speakers, speaker],
      }
    })
    closeSpeakerForm()
    toast({
      title: wasNew ? 'Speaker added' : 'Speaker updated',
      description: wasNew ? `"${speaker.name}" added to this event.` : `"${speaker.name}" updated.`,
      variant: 'success',
    })
  }

  const removeSpeaker = (id: string) => {
    onChange((prev) => ({ ...prev, speakers: prev.speakers.filter((s) => s.id !== id) }))
  }

  const organiserIds = form.organisers.map((o) => o.id)
  const partnerIds = form.partners.map((o) => o.id)

  const handleCreateOrg = (org: Omit<Organisation, 'id'>) => {
    const newOrg = addOrganisation(org)
    if (addOrgTarget === 'organiser') {
      onChange((prev) => ({ ...prev, organisers: [newOrg] }))
      toast({ title: 'Organisation created', description: `"${newOrg.name}" created and set as organiser.`, variant: 'success' })
    } else {
      onChange((prev) => ({ ...prev, partners: [...prev.partners, newOrg] }))
      toast({ title: 'Organisation created', description: `"${newOrg.name}" created and added as a partner.`, variant: 'success' })
    }
    setAddOrgTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Organiser</CardTitle>
          <button
            type="button"
            onClick={() => setAddOrgTarget('organiser')}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add New Organisation
          </button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label>Search Organisations</Label>
          <OrganisationSearchField
            organisations={organisations}
            excludeIds={organiserIds}
            placeholder="Search organisations..."
            onSelect={(org) => onChange((prev) => ({ ...prev, organisers: [org] }))}
          />
          {form.organisers.map((org) => (
            <OrganisationCard
              key={org.id}
              org={org}
              onRemove={() => onChange((prev) => ({ ...prev, organisers: [] }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Partners</CardTitle>
          <button
            type="button"
            onClick={() => setAddOrgTarget('partner')}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add New Organisation
          </button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label>Search Organisations</Label>
          <OrganisationSearchField
            organisations={organisations}
            excludeIds={partnerIds}
            placeholder="Search organisations..."
            onSelect={(org) =>
              onChange((prev) => ({ ...prev, partners: [...prev.partners, org] }))
            }
          />
          {form.partners.map((org) => (
            <OrganisationCard
              key={org.id}
              org={org}
              onRemove={() =>
                onChange((prev) => ({ ...prev, partners: prev.partners.filter((p) => p.id !== org.id) }))
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Speakers</CardTitle>
          <button
            type="button"
            onClick={openAddSpeaker}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add Speaker
          </button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {form.speakers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No speakers added yet.</p>
          ) : (
            form.speakers.map((speaker) => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onEdit={() => openEditSpeaker(speaker.id)}
                onRemove={() => removeSpeaker(speaker.id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <AddOrganisationForm
        open={addOrgTarget !== null}
        onOpenChange={(open) => !open && setAddOrgTarget(null)}
        onCreate={handleCreateOrg}
      />

      <SpeakerForm
        open={speakerFormOpen}
        onOpenChange={(open) => (open ? setSpeakerFormOpen(true) : closeSpeakerForm())}
        onSave={upsertSpeaker}
        initial={editingSpeaker}
      />
    </div>
  )
}

export { EventConnectionsStep }
