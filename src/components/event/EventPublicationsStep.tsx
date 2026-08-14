import * as React from 'react'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicationForm } from '@/components/event/PublicationForm'
import { EventDatasetsSection } from '@/components/event/EventDatasetsSection'
import { RelatedContentPanel } from '@/components/event/RelatedContentPanel'
import { PUBLICATION_TYPE_OPTIONS, type EventFormState, type EventPublication } from '@/types/event'

interface EventPublicationsStepProps {
  form: EventFormState
  onChange: React.Dispatch<React.SetStateAction<EventFormState>>
}

function publicationTypeLabel(value: string): string {
  return PUBLICATION_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function EventPublicationsStep({ form, onChange }: EventPublicationsStepProps) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const editingPublication = form.publications.find((p) => p.id === editingId)

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const openAddForm = () => {
    setEditingId(null)
    setFormOpen(true)
  }

  const openEditForm = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const upsertPublication = (publication: EventPublication) => {
    onChange((prev) => {
      const exists = prev.publications.some((p) => p.id === publication.id)
      return {
        ...prev,
        publications: exists
          ? prev.publications.map((p) => (p.id === publication.id ? publication : p))
          : [...prev.publications, publication],
      }
    })
    closeForm()
  }

  const removePublication = (id: string) => {
    onChange((prev) => ({ ...prev, publications: prev.publications.filter((p) => p.id !== id) }))
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Publications</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Add reports, presentations, reading material or other supporting content.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {form.publications.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No publications added yet.</p>
          )}

          {form.publications.map((publication) => (
            <div key={publication.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{publication.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <Badge variant="secondary">{publicationTypeLabel(publication.publicationType)}</Badge>
                  <span>{publication.file.extension}</span>
                  <span>{publication.file.sizeLabel}</span>
                  <span>{publication.file.uploadedAt}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${publication.title}`}
                  onClick={() => openEditForm(publication.id)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${publication.title}`}
                  onClick={() => removePublication(publication.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" className="self-start" onClick={openAddForm}>
            <Plus className="size-4" />
            Add Publication
          </Button>
        </CardContent>
      </Card>

      <PublicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onAdd={upsertPublication}
        initial={
          editingPublication
            ? {
                id: editingPublication.id,
                title: editingPublication.title,
                description: editingPublication.description,
                publicationType: editingPublication.publicationType,
              }
            : undefined
        }
      />

      <EventDatasetsSection form={form} onChange={onChange} />

      <RelatedContentPanel form={form} onChange={onChange} />
    </div>
  )
}

export { EventPublicationsStep }
