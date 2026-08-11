import * as React from 'react'
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WORKSPACE_HEIGHT_CLASS } from '@/lib/layout'
import { formatEventDateRange, getRegistrationStatus } from '@/lib/event-status'
import { ACCESS_TYPE_LABELS, EVENT_TYPE_OPTIONS, type EventRecord } from '@/types/event'

interface EventListViewProps {
  events: EventRecord[]
  onAddEvent: () => void
  onViewEvent: (id: string) => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
}

const PAGE_SIZE = 12

function eventTypeLabel(value: string): string {
  return EVENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

function EventListView({ events, onAddEvent, onViewEvent, onEditEvent, onDeleteEvent }: EventListViewProps) {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageEvents = events.slice(pageStart, pageStart + PAGE_SIZE)

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <Card className={cn('flex flex-col', WORKSPACE_HEIGHT_CLASS)}>
      <CardHeader className="flex-row shrink-0 items-center justify-between">
        <div>
          <CardTitle>Events</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Create, manage, maintain, and publish events under your stewardship.
          </p>
        </div>
        <Button type="button" onClick={onAddEvent}>
          <Plus className="size-4" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No events yet. Click "Add Event" to create your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[6%]" />
                <col className="w-[22%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[17%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="truncate px-2 py-3 font-medium">Event Name &amp; Description</th>
                  <th className="truncate px-2 py-3 font-medium">Event Type</th>
                  <th className="truncate px-2 py-3 font-medium">Date</th>
                  <th className="truncate px-2 py-3 font-medium">Access</th>
                  <th className="truncate px-2 py-3 font-medium">Status</th>
                  <th className="truncate px-2 py-3 font-medium">Registration</th>
                  <th className="truncate px-2 py-3 font-medium">Updated</th>
                  <th className="truncate px-2 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageEvents.map((event) => {
                  const registration = getRegistrationStatus(event.form.metadata)
                  return (
                    <tr key={event.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                      <td className="px-2 py-4">
                        <p className="truncate font-medium text-foreground">
                          {event.form.metadata.title || 'Untitled event'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {event.form.metadata.subtitle || '—'}
                        </p>
                      </td>
                      <td className="truncate px-2 py-4 text-muted-foreground">
                        {event.form.metadata.eventType ? eventTypeLabel(event.form.metadata.eventType) : '—'}
                      </td>
                      <td className="truncate px-2 py-4 text-muted-foreground">
                        {formatEventDateRange(event.form.metadata)}
                      </td>
                      <td className="truncate px-2 py-4">
                        {event.form.metadata.accessType ? (
                          <Badge variant="outline">{ACCESS_TYPE_LABELS[event.form.metadata.accessType]}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="truncate px-2 py-4">
                        {event.status === 'published' ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge className="border-transparent bg-warning/20 text-warning-foreground">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="truncate px-2 py-4">
                        {registration === 'open' && <Badge variant="success">Open</Badge>}
                        {registration === 'closed' && <Badge variant="muted">Closed</Badge>}
                        {registration === 'not-required' && <Badge variant="muted">Not Required</Badge>}
                      </td>
                      <td className="truncate px-2 py-4 text-muted-foreground">{event.updatedAt}</td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`View ${event.form.metadata.title || 'event'}`}
                            onClick={() => onViewEvent(event.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Edit ${event.form.metadata.title || 'event'}`}
                            onClick={() => onEditEvent(event.id)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${event.form.metadata.title || 'event'}`}
                            onClick={() => onDeleteEvent(event.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {events.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, events.length)} of {events.length}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <p className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export { EventListView }
