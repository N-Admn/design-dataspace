import { Mic2 } from 'lucide-react'

import { SectionHeader } from '@/components/shared/SectionHeader'
import type { EventSpeaker } from '@/types/event'

function SpeakerAvatar({ speaker }: { speaker: EventSpeaker }) {
  if (speaker.image?.dataUrl) {
    return <img src={speaker.image.dataUrl} alt="" className="size-12 shrink-0 rounded-full border border-border-default object-cover" />
  }
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-subdued text-text-subdued">
      <Mic2 className="size-5" />
    </div>
  )
}

/** Horizontal card — avatar beside name/role, not stacked — sized so 1, 2 or
 *  3 fit a row at desktop width. A fixed width (rather than a stretching
 *  grid cell) is what lets the parent's `justify-center` center an
 *  under-full row instead of leaving it stranded on the left. Explicitly
 *  white (`bg-card`) so it stands off the section's page-background wash
 *  rather than blending into it. */
function SpeakerCard({ speaker }: { speaker: EventSpeaker }) {
  const secondary = [speaker.designation, speaker.organisation].filter(Boolean).join(' · ')
  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-border-default bg-card p-4 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
      <SpeakerAvatar speaker={speaker} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-default">{speaker.name}</p>
        {secondary && <p className="truncate text-xs text-text-subdued">{secondary}</p>}
      </div>
    </div>
  )
}

/** Rendered only when speakers exist — no "No speakers added yet" empty
 *  state, per the documentation's content-visibility rules. `justify-center`
 *  on a flex-wrap row (rather than a CSS grid) is what centers an
 *  under-full last row — a single speaker, or two of three — instead of
 *  leaving it flush left. The `page-background` wash (the same token the
 *  app's own `<body>` uses) wraps the whole section so it reads as a
 *  deliberate content block, not just a tint behind the heading. */
function EventSpeakers({ speakers }: { speakers: EventSpeaker[] }) {
  if (speakers.length === 0) return null
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-page-background px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeader
        as="h2"
        title="Speakers"
        description={`${speakers.length} speaker${speakers.length === 1 ? '' : 's'} confirmed`}
      />
      <div className="flex flex-wrap justify-center gap-4">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  )
}

export { EventSpeakers }
