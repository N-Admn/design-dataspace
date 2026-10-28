import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { UploadProposalDialog } from '@/pages/playground/publication-detail/UploadProposalDialog'
import { ViewTabPanel, ViewTabs } from '@/components/shared/ViewTabs'
import { PlaygroundHubLink } from '@/pages/playground/PlaygroundHubLink'
import { usePersistedState } from '@/pages/playground/use-persisted-state'
import { TypeLedVariant, type Layout } from '@/pages/playground/publication-detail/TypeLedVariant'
import { SAMPLE_PUBLICATIONS } from '@/pages/playground/publication-detail/publication-sample-data'
import { typeLabel } from '@/pages/playground/publication-detail/publication-shared'

/** Publication Detail Page: two versions of the consumer page of a single publication, as tabs. Both are built only from today's
 *  upload fields; a "Fields" switch adds the three optional fields from the upload-flow proposal (shown in the proposal dialog).
 *  B, "Shaped by type": the type changes the accent, the shape and the section order.
 *  B2, "File showcase": the same page, with the files and videos in the Dataset page's list + viewer layout and real viewers.
 *  Local sample data only; no production route, data model or flow is read or changed. */

const VARIANTS: { key: string; label: string; layout: Layout }[] = [
  { key: 'type-led', label: 'B · Shaped by type', layout: 'shaped' },
  { key: 'showcase', label: 'B2 · File showcase', layout: 'showcase' },
]
const VARIANT_KEYS = VARIANTS.map((v) => v.key)
const PUB_IDS = SAMPLE_PUBLICATIONS.map((p) => p.id)

function PublicationDetailPlayground() {
  const toast = useToast()
  const [variant, setVariant] = usePersistedState(
    'publication-detail:variant',
    'type-led',
    (v): v is string => typeof v === 'string' && VARIANT_KEYS.includes(v),
  )
  const [pubId, setPubId] = usePersistedState(
    'publication-detail:publication',
    PUB_IDS[0],
    (v): v is string => typeof v === 'string' && PUB_IDS.includes(v),
  )
  const pub = SAMPLE_PUBLICATIONS.find((p) => p.id === pubId) ?? SAMPLE_PUBLICATIONS[0]
  const [fields, setFields] = usePersistedState(
    'publication-detail:fields',
    'today',
    (v): v is string => v === 'today' || v === 'proposed',
  )
  const [proposalOpen, setProposalOpen] = React.useState(false)

  /** "Read next" switches the sample when the publication is one of them; otherwise it says it is not part of the playground. */
  const openPublication = (id: string) => {
    if (PUB_IDS.includes(id)) {
      setPubId(id)
      window.scrollTo({ top: 0 })
    } else {
      toast({ title: 'Prototype', description: 'That publication is not in the playground’s sample set.' })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <PlaygroundHubLink />
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-2 text-text-default">Publication Detail Page</h1>
        <p className="type-body text-text-subdued">
          Playground only: two versions of the consumer page of one publication, built from today’s upload fields, with a switch for
          the proposed optional ones. All content is sample data.
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <ViewTabs items={VARIANTS} value={variant} onChange={setVariant} idPrefix="publication-playground" label="Design direction" className="min-w-0 flex-1" />
        <label className="type-label flex items-center gap-2 pb-1.5 text-text-secondary">
          Sample
          <select
            value={pub.id}
            onChange={(e) => setPubId(e.target.value)}
            className="type-body h-9 max-w-[min(22rem,70vw)] rounded-md border border-border-input bg-surface-default px-2 text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {SAMPLE_PUBLICATIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {typeLabel(p)}: {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface-subdued px-4 py-3">
        <label className="type-label flex items-center gap-2 text-text-secondary">
          Fields
          <select
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            className="type-body h-9 rounded-md border border-border-input bg-surface-default px-2 text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <option value="today">Today’s upload fields only</option>
            <option value="proposed">With proposed optional fields</option>
          </select>
        </label>
        <p className="type-caption min-w-0 basis-full text-text-subdued sm:basis-0 sm:flex-1">
          {fields === 'today'
            ? 'Everything shown comes from the current upload flow, the uploaded file, or links other records make.'
            : 'Adds key highlights, a pull quote and a cover image: one optional card in the Details step.'}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setProposalOpen(true)}>
          See the upload proposal
        </Button>
      </div>

      {VARIANTS.map((v) => (
        <ViewTabPanel key={v.key} id={v.key} idPrefix="publication-playground" active={variant === v.key}>
          <div className="pt-4">
            {variant === v.key && (
              <TypeLedVariant key={pub.id} pub={pub} onOpenPublication={openPublication} proposed={fields === 'proposed'} layout={v.layout} />
            )}
          </div>
        </ViewTabPanel>
      ))}

      <UploadProposalDialog open={proposalOpen} onOpenChange={setProposalOpen} />
    </div>
  )
}

export { PublicationDetailPlayground }
