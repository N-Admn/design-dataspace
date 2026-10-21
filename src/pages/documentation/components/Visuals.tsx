import * as React from 'react'
import { ArrowDown, ArrowRight, Expand, ImageIcon, Video } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { DiagramSpec, MediaSpec, VisualSpec } from '@/pages/documentation/content/types'

/** The visual components every article uses. A `media` visual is a real screenshot or recording once it has a `src`, and a clearly labelled
 *  placeholder until then; a `diagram` is drawn from its nodes. Nothing here invents interface: a placeholder says what to capture. */

const FIGURE = 'overflow-hidden rounded-xl border border-border bg-card'

/** A short recording: controls shown, never autoplayed, and no sound is assumed. */
function Recording({ spec }: { spec: MediaSpec }) {
  return (
    <video controls preload="metadata" playsInline muted src={spec.src} aria-label={spec.alt} className="block w-full" style={{ aspectRatio: spec.aspect }}>
      {spec.alt}
    </video>
  )
}

/** The brief shown in place of a visual that has not been captured yet. */
function Placeholder({ spec }: { spec: MediaSpec }) {
  const Icon = spec.media === 'video' ? Video : ImageIcon
  return (
    <div
      role="img"
      aria-label={`${spec.media === 'video' ? 'Recording' : 'Screenshot'} still to be added: ${spec.alt}`}
      className="flex flex-col items-start justify-center gap-3 bg-secondary p-6 text-left"
      style={{ aspectRatio: spec.aspect }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border-strong/50 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-subdued">
        <Icon className="size-3.5" aria-hidden="true" />
        {spec.media === 'video' ? 'Recording needed' : 'Screenshot needed'}
      </span>
      <dl className="flex max-w-xl flex-col gap-2 text-sm">
        <div>
          <dt className="font-semibold text-foreground">Capture</dt>
          <dd className="text-text-subdued">{spec.capture ?? spec.alt}</dd>
        </div>
        {spec.annotate && (
          <div>
            <dt className="font-semibold text-foreground">Annotate</dt>
            <dd className="text-text-subdued">{spec.annotate}</dd>
          </div>
        )}
        {spec.aspect && (
          <div>
            <dt className="font-semibold text-foreground">Suggested crop</dt>
            <dd className="text-text-subdued">{spec.aspect.replace(' / ', ':')}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

/** A screenshot with numbered callouts; the numbers are explained in a list under it, so the meaning is never carried by position alone. */
function Screenshot({ spec, onEnlarge }: { spec: MediaSpec; onEnlarge: () => void }) {
  return (
    <div className="relative">
      <img src={spec.src} alt={spec.alt} className="block w-full" style={{ aspectRatio: spec.aspect }} />
      {spec.callouts?.map((c) => (
        <span
          key={c.n}
          aria-hidden="true"
          className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-accent text-xs font-bold text-accent-foreground shadow"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          {c.n}
        </span>
      ))}
      <button
        type="button"
        onClick={onEnlarge}
        aria-label={`Enlarge: ${spec.title}`}
        className="absolute bottom-2 right-2 inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/90 text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Expand className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function MediaFigure({ spec }: { spec: MediaSpec }) {
  const [open, setOpen] = React.useState(false)
  const hasAsset = Boolean(spec.src)
  return (
    <figure className="my-6">
      <div className={FIGURE}>
        {!hasAsset ? <Placeholder spec={spec} /> : spec.media === 'video' ? <Recording spec={spec} /> : <Screenshot spec={spec} onEnlarge={() => setOpen(true)} />}
      </div>
      {hasAsset && spec.callouts && spec.callouts.length > 0 && (
        <ol className="mt-3 flex flex-col gap-1 text-sm text-text-subdued">
          {spec.callouts.map((c) => (
            <li key={c.n} className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground" aria-hidden="true">
                {c.n}
              </span>
              <span>{c.label}</span>
            </li>
          ))}
        </ol>
      )}
      <figcaption className="mt-2 text-sm text-text-subdued">{spec.caption ?? spec.title}</figcaption>

      {hasAsset && spec.media !== 'video' && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent variant="center" className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{spec.title}</DialogTitle>
              <DialogDescription>{spec.alt}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-auto px-6 pb-6">
              <img src={spec.src} alt={spec.alt} className="block w-full" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </figure>
  )
}

const NODE = 'rounded-xl border border-border bg-background px-4 py-3 text-left'

function NodeCard({ label, caption, strong }: { label: string; caption?: string; strong?: boolean }) {
  return (
    <div className={cn(NODE, strong && 'border-primary/40 bg-primary/5')}>
      <p className={cn('text-sm font-semibold', strong ? 'text-primary' : 'text-foreground')}>{label}</p>
      {caption && <p className="mt-0.5 text-xs text-text-subdued">{caption}</p>}
    </div>
  )
}

/** A concept diagram. A flow reads left to right (top to bottom on a phone), with the relationship written on each arrow; a hub puts one
 *  node above the nodes it connects. */
function ConceptDiagram({ spec }: { spec: DiagramSpec }) {
  return (
    <figure className="my-6">
      <div role="group" aria-label={spec.title} className={cn(FIGURE, 'bg-secondary p-5')}>
        {spec.layout === 'flow' ? (
          <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            {spec.nodes.map((node, i) => (
              <React.Fragment key={node.label}>
                <li className="md:flex-1">
                  <NodeCard label={node.label} caption={node.caption} />
                </li>
                {i < spec.nodes.length - 1 && (
                  <li aria-hidden="true" className="flex shrink-0 items-center justify-center gap-1 text-text-subdued md:flex-col">
                    {node.next && <span className="text-xs font-medium">{node.next}</span>}
                    <ArrowRight className="hidden size-4 md:block" />
                    <ArrowDown className="size-4 md:hidden" />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        ) : (
          <div className="flex flex-col items-stretch gap-2">
            {spec.hub && (
              <div className="mx-auto w-full max-w-sm">
                <NodeCard label={spec.hub.label} caption={spec.hub.caption} strong />
              </div>
            )}
            <span aria-hidden="true" className="mx-auto flex flex-col items-center text-text-subdued">
              <span className="h-4 w-px bg-border-strong/60" />
              <ArrowDown className="size-4" />
            </span>
            <ul className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
              {spec.nodes.map((node) => (
                <li key={node.label}>
                  <NodeCard label={node.label} caption={node.caption} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {spec.caption && <figcaption className="mt-2 text-sm text-text-subdued">{spec.caption}</figcaption>}
    </figure>
  )
}

function Visual({ visual }: { visual: VisualSpec }) {
  return visual.kind === 'diagram' ? <ConceptDiagram spec={visual} /> : <MediaFigure spec={visual} />
}

export { ConceptDiagram, MediaFigure, Visual }
