import * as React from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Copy,
  Database,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { RESOURCE_TYPE_OPTIONS } from '@/types/publication'
import {
  TREATMENT_BY_TYPE,
  type Connection,
  type SamplePublication,
  type Treatment,
} from '@/pages/playground/publication-detail/publication-sample-data'

/** Pieces the Publication Detail page uses: labels, the type illustrations, the citation and the connections.
 *  Playground-only; nothing here is used by a production page. */

const optionLabel = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value

export const typeLabel = (p: SamplePublication) => optionLabel(RESOURCE_TYPE_OPTIONS, p.resourceType)
export const sectorLabel = (p: SamplePublication) => optionLabel(SECTOR_OPTIONS, p.sector)
export const geographyLabel = (p: SamplePublication) => optionLabel(GEOGRAPHY_OPTIONS, p.geography)
export const licenceLabel = (p: SamplePublication) => optionLabel(LICENSE_OPTIONS, p.usageRights)
export const treatmentOf = (p: SamplePublication): Treatment => TREATMENT_BY_TYPE[p.resourceType]

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })


/** A prototype action: says what would happen instead of going anywhere. */
export function usePrototypeAction() {
  const toast = useToast()
  return React.useCallback(
    (what: string) => toast({ title: 'Prototype', description: `${what} is not wired up in this playground.` }),
    [toast],
  )
}

export function citationFor(pub: SamplePublication) {
  const names = pub.contributors.map((c) => c.name).join(', ')
  return `${names} (${new Date(pub.date).getUTCFullYear()}). ${pub.title} [${typeLabel(pub)}]. ${pub.publisher}. CivicDataSpace.`
}

/** "Cite this": the citation as text and a copy button. */
export function CiteBlock({ pub }: { pub: SamplePublication }) {
  const toast = useToast()
  const citation = citationFor(pub)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      toast({ title: 'Citation copied' })
    } catch {
      toast({ title: 'Could not copy', description: 'Select the citation and copy it yourself.' })
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="type-body select-all rounded-lg bg-surface-subdued p-3 text-text-secondary">{citation}</p>
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={copy}>
        <Copy className="size-4" />
        Copy citation
      </Button>
    </div>
  )
}

const CONNECTION_GROUPS: { key: 'datasets' | 'useCases' | 'collaboratives'; label: string; one: string; verb: string; icon: LucideIcon }[] = [
  { key: 'datasets', label: 'Datasets', one: 'dataset', verb: 'draws on', icon: Database },
  { key: 'useCases', label: 'Use cases', one: 'use case', verb: 'informs', icon: BriefcaseBusiness },
  { key: 'collaboratives', label: 'Collaboratives', one: 'collaborative', verb: 'is part of', icon: Users },
]

/** One sentence that says how the publication connects, built from the counts so it can never disagree with the lists. */
export function connectionSentence(pub: SamplePublication) {
  const typeWord = typeLabel(pub).toLowerCase()
  const parts = CONNECTION_GROUPS.map((g) => {
    const n = pub.connections[g.key].length
    return n ? `${g.verb} ${n} ${n === 1 ? g.one : `${g.one}s`}` : null
  }).filter(Boolean) as string[]
  if (parts.length === 0) return null
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]
  return `This ${typeWord} ${list}.`
}

function ConnectionRow({ item, icon: Icon, onOpen }: { item: Connection; icon: LucideIcon; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-text-brand" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="type-label block text-text-default group-hover:text-text-brand">{item.title}</span>
          <span className="type-caption mt-0.5 block text-text-subdued">{item.meta}</span>
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-text-subdued" aria-hidden="true" />
      </button>
    </li>
  )
}

/** Where the publication sits in CivicDataSpace: datasets it draws on, use cases it informs, collaboratives it belongs to. Empty
 *  groups are left out; with nothing connected the section says so in one line. */
export function ConnectionsSection({
  pub,
  headingId,
  headingClassName = 'type-heading-1 text-text-default',
  filled = false,
}: {
  pub: SamplePublication
  headingId?: string
  /** The heading's type role and colour, so a variant can match its own section headings. */
  headingClassName?: string
  /** Borderless soft tiles instead of outlined cards. */
  filled?: boolean
}) {
  const prototype = usePrototypeAction()
  const groups = CONNECTION_GROUPS.filter((g) => pub.connections[g.key].length > 0)
  const sentence = connectionSentence(pub)
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className={headingClassName}>
          Connected on CivicDataSpace
        </h2>
        <p className="type-body text-text-subdued">{sentence ?? 'This publication is not connected to other records yet.'}</p>
      </div>
      {groups.length > 0 && (
        <div className={cn('grid gap-4', groups.length > 1 && 'md:grid-cols-2', groups.length > 2 && 'lg:grid-cols-3')}>
          {groups.map((g) => (
            <div
              key={g.key}
              className={cn('flex flex-col gap-1 p-3', filled ? 'rounded-2xl bg-secondary' : 'rounded-xl border border-border-default bg-card')}
            >
              <h3 className="type-caption flex items-center justify-between px-2.5 pt-1 font-medium uppercase tracking-[0.025em] text-text-subdued">
                {g.label}
                <span className="tabular-nums">{pub.connections[g.key].length}</span>
              </h3>
              <ul className="flex flex-col">
                {pub.connections[g.key].map((item) => (
                  <ConnectionRow key={item.id} item={item} icon={g.icon} onOpen={() => prototype(`Opening “${item.title}”`)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** Other publications to read next. Left out when there are none. */
export function ReadNext({ pub, onOpen, filled = false }: { pub: SamplePublication; onOpen: (id: string) => void; filled?: boolean }) {
  const items = pub.connections.publications
  if (items.length === 0) return null
  return (
    <section aria-label="Read next" className="flex flex-col gap-3">
      <h2 className="type-heading-2 text-text-default">Read next</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className={cn(
                'flex w-full items-center gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                filled ? 'rounded-2xl bg-secondary hover:bg-surface-hovered' : 'rounded-xl border border-border-default bg-card hover:bg-surface-hovered',
              )}
            >
              <BookOpen className="size-5 shrink-0 text-text-brand" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="type-label block text-text-default">{item.title}</span>
                <span className="type-caption block text-text-subdued">{item.meta}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
