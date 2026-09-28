import { SectionHeader } from '@/components/shared/SectionHeader'

/** Plain reading content, not a card — per the Event Details documentation,
 *  this is the only section deliberately kept out of the card-heavy treatment
 *  used elsewhere on the page. */
function EventAbout({ overview }: { overview: string }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader as="h2" title="About the event" />
      <p className="whitespace-pre-line text-base text-text-default">{overview}</p>
    </section>
  )
}

export { EventAbout }
