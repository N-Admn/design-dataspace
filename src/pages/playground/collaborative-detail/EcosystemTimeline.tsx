import type * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** A collaborative's ecosystem as a horizontal timeline: a line runs left to right through a row of nodes (icon on one side of
 *  the line, name and figure on the other, alternating) and ends in a large circle for the collaborative itself, ringed by
 *  thin orbits. Below `md` the same content becomes a vertical, connected list. It is driven entirely by `nodes` and `hub`, so
 *  another collaborative only has to pass different names, figures and descriptions.
 *
 *  Every node is real text in an ordered list; icons, stems, dots and rings are decorative. */

export interface EcosystemNode {
  key: string
  label: string
  /** The figure or sentence under the label, e.g. "28 connected". */
  caption: string
  icon: LucideIcon
  /** Which side of the line the icon sits on (the label takes the other). Defaults to alternating, starting above. */
  iconSide?: 'above' | 'below'
}
export interface EcosystemHub {
  /** The collaborative's name. It is not drawn in the circle (only the icon is), but it names the circle for screen readers. */
  title: string
  icon: LucideIcon
}

const LINE = 'bg-border-strong/60'
const DOT = 'size-3 rounded-full bg-primary'

function IconCircle({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full border border-border-default bg-background text-primary', className)}>
      <Icon className="size-[42%]" strokeWidth={1.75} />
    </span>
  )
}

/** The collaborative's own circle with its two thin orbits and a few small markers on them. */
function Hub({ hub, className }: { hub: EcosystemHub; className?: string }) {
  const Icon = hub.icon
  // Marker positions on the outer orbit, as angles in degrees (0 = right, counter-clockwise).
  const markers = [
    { angle: 128, className: 'size-2.5 bg-border-strong/60' },
    { angle: -52, className: 'size-3.5 bg-primary' },
    { angle: 205, className: 'size-1.5 bg-border-strong/60' },
  ]
  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <span aria-hidden="true" className="absolute -inset-3 rounded-full border border-border-strong/50" />
      <span aria-hidden="true" className="absolute -inset-7 rounded-full border border-border-default" />
      {markers.map((m) => (
        <span
          key={m.angle}
          aria-hidden="true"
          className={cn('absolute -translate-x-1/2 -translate-y-1/2 rounded-full', m.className)}
          style={{
            left: `${50 + 62 * Math.cos((m.angle * Math.PI) / 180)}%`,
            top: `${50 - 62 * Math.sin((m.angle * Math.PI) / 180)}%`,
          }}
        />
      ))}
      <div className="relative flex size-full items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icon className="size-[34%]" strokeWidth={1.5} aria-hidden="true" />
        <span className="sr-only">{hub.title}</span>
      </div>
    </div>
  )
}

function Label({ node, align = 'center' }: { node: EcosystemNode; align?: 'center' | 'start' }) {
  return (
    <span className={cn('block min-w-0 px-1 md:px-0 lg:px-1', align === 'center' ? 'text-center' : 'text-left')}>
      <span className="block text-sm font-semibold leading-tight text-text-brand md:text-[13px] lg:text-base">{node.label}</span>
      <span className="mt-1 block text-xs leading-snug text-text-subdued lg:text-sm">{node.caption}</span>
    </span>
  )
}

function EcosystemTimeline({ nodes, hub, label }: { nodes: EcosystemNode[]; hub: EcosystemHub; label: string }) {
  return (
    <>
      {/* md and up: the horizontal timeline. The line runs through the middle row of every column, so the columns' own
          segments join up into one line, and the hub column ends it at the circle's edge. */}
      <ol
        aria-label={label}
        // One column per node, then a wider one for the hub (wider still on tablet, where the columns are narrow).
        className="hidden md:grid md:[grid-template-columns:repeat(var(--nodes),minmax(0,1fr))_minmax(0,2.2fr)] lg:[grid-template-columns:repeat(var(--nodes),minmax(0,1fr))_minmax(0,1.75fr)]"
        style={{ '--nodes': nodes.length } as React.CSSProperties}
      >
        {nodes.map((node, i) => {
          // Alternate by default: even nodes have their icon above the line and their label below; odd ones the reverse.
          const iconAbove = node.iconSide ? node.iconSide === 'above' : i % 2 === 0
          return (
            <li key={node.key} className="grid grid-rows-[9.5rem_0.75rem_9.5rem] lg:grid-rows-[10rem_0.75rem_10rem]">
              <div className="flex flex-col items-center justify-end">
                {iconAbove ? (
                  <>
                    <IconCircle icon={node.icon} className="size-14 lg:size-16" />
                    <span aria-hidden="true" className={cn('w-px flex-1', LINE)} />
                  </>
                ) : (
                  <div className="pb-4">
                    <Label node={node} />
                  </div>
                )}
              </div>
              <div className="relative flex items-center justify-center">
                <span aria-hidden="true" className={cn('absolute inset-x-0 top-1/2 h-px', LINE)} />
                <span aria-hidden="true" className={cn('relative', DOT)} />
              </div>
              <div className="flex flex-col items-center justify-start">
                {iconAbove ? (
                  <div className="pt-4">
                    <Label node={node} />
                  </div>
                ) : (
                  <>
                    <span aria-hidden="true" className={cn('w-px flex-1', LINE)} />
                    <IconCircle icon={node.icon} className="size-14 lg:size-16" />
                  </>
                )}
              </div>
            </li>
          )
        })}
        <li className="flex items-center">
          <span aria-hidden="true" className={cn('h-px w-7 shrink-0', LINE)} />
          <span aria-hidden="true" className="-ml-px size-3 shrink-0 rounded-full bg-border-strong/60" />
          <div className="min-w-0 flex-1 px-6 py-7 lg:px-7">
            <Hub hub={hub} />
          </div>
        </li>
      </ol>

      {/* Below md: the same nodes in the same order as a vertical, connected list, ending in the circle. */}
      <ol aria-label={label} className="flex flex-col md:hidden">
        {nodes.map((node, i) => (
          <li key={node.key} className="relative flex items-center gap-4 py-4 pl-7">
            <span aria-hidden="true" className={cn('absolute left-[5px] w-px', LINE, i === 0 ? 'bottom-0 top-1/2' : 'inset-y-0')} />
            <span aria-hidden="true" className={cn('absolute left-0 top-1/2 -translate-y-1/2', DOT)} />
            <IconCircle icon={node.icon} className="size-12" />
            <Label node={node} align="start" />
          </li>
        ))}
        <li className="relative flex flex-col items-center pl-7 pt-2">
          <span aria-hidden="true" className={cn('absolute left-[5px] top-0 h-12 w-px', LINE)} />
          <span aria-hidden="true" className="absolute left-0 top-12 size-3 -translate-y-1/2 rounded-full bg-border-strong/60" />
          <div className="w-full max-w-[15rem] px-6 py-10">
            <Hub hub={hub} />
          </div>
        </li>
      </ol>
    </>
  )
}

export { EcosystemTimeline }
