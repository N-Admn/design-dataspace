import { Hammer } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { PlaygroundHubLink } from '@/pages/playground/PlaygroundHubLink'
import { PLAYGROUNDS, PLAYGROUND_STATUSES, categoryLabel } from '@/pages/playground/playground-registry'

/** `/playground/:playgroundId` for a hub entry whose prototype does not exist yet: it says so plainly, instead of showing
 *  anything that looks finished. An entry that does have a prototype just forwards to it, so every hub entry has a stable
 *  `/playground/<id>` address. */
function PlaygroundPlaceholderPage() {
  const { playgroundId } = useParams<{ playgroundId: string }>()
  const entry = PLAYGROUNDS.find((p) => p.id === playgroundId)

  if (entry?.built) return <Navigate to={entry.href} replace />

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <PlaygroundHubLink />
      {entry ? (
        <section className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border-default bg-card p-8">
          <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-lg bg-surface-subdued text-text-subdued">
            <Hammer className="size-6" strokeWidth={1.75} />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={PLAYGROUND_STATUSES[entry.status].variant}>{PLAYGROUND_STATUSES[entry.status].label}</Badge>
            <span className="type-eyebrow text-text-subdued">{categoryLabel(entry.category)}</span>
          </div>
          <h1 className="type-heading-1 text-text-brand">{entry.name}</h1>
          <p className="max-w-2xl text-sm text-text-default">{entry.description}</p>
          <p className="max-w-2xl text-sm text-text-subdued">
            This playground has a place in the hub, but its prototype has not been built yet. Nothing here is a finished
            design.
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-border-default bg-card p-8">
          <h1 className="type-heading-1 text-text-brand">Playground not found</h1>
          <p className="mt-2 text-sm text-text-subdued">There is no playground at this address. Pick one from the hub.</p>
        </section>
      )}
    </div>
  )
}

export { PlaygroundPlaceholderPage }
