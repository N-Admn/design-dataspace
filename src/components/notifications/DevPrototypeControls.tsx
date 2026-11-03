import * as React from 'react'
import { FlaskConical, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationsContext'
import { collaborativeRole, itemInCollaborative, latestRequestBy, managersOf, ownerOfDataset, requestKindOf } from '@/lib/notification-model'
import { PERSONAS, getPerson } from '@/lib/notification-personas'
import { cn } from '@/lib/utils'

const SIMULATED_REASONS = [
  'Need it for a district-level study.',
  'For an explainer on public data.',
  'Course material for a policy class.',
  'Benchmarking an open-source tool.',
]
const COLLABORATIVES_FOR_DEMO = [
  { id: 'collaborative-1', label: 'CivicDataLab’s collaborative (collaborative-1)' },
  { id: 'collaborative-4', label: 'John’s personal collaborative (collaborative-4)' },
]
const RESTRICTED_FOR_DEMO = [
  { id: 'ds-1', label: 'CivicDataLab dataset (ds-1)' },
  { id: 'ds-9', label: 'John’s personal dataset (ds-9)' },
]

/** DEV only. Switches who the prototype is signed in as and pushes simulated events through the same store the real actions use, so
 *  the badge, panel, page and dataset page all react the way they would for real. Never part of a production build. */
function DevPrototypeControls() {
  const toast = useToast()
  const { datasets } = useAppData()
  const { persona, setPersonaId, state, requestAccess, decide, revoke, grant, addDigest, reset, submitItem, addItem, addPartner, sendDigests, collaborativeInfo } = useNotifications()
  const [open, setOpen] = React.useState(false)
  const [datasetId, setDatasetId] = React.useState(RESTRICTED_FOR_DEMO[0].id)
  const [collabId, setCollabId] = React.useState(COLLABORATIVES_FOR_DEMO[0].id)

  const owner = ownerOfDataset(datasets.find((d) => d.id === datasetId))
  const managers = owner ? managersOf(owner) : []
  const requesters = ['priya', 'marcus', 'sasha', 'dev'].filter((id) => {
    const last = latestRequestBy(state.requests, id, datasetId)
    return !last || (last.status !== 'waiting' && last.status !== 'approved')
  })
  const waiting = state.requests.filter((r) => requestKindOf(r) === 'access' && r.itemId === datasetId && r.status === 'waiting')
  const approved = state.requests.filter((r) => requestKindOf(r) === 'access' && r.itemId === datasetId && r.status === 'approved' && !r.direct)
  const firstManager = managers[0]
  const otherManager = (id: string) => managers.find((m) => m !== id) ?? firstManager

  const say = (title: string, description?: string) => toast({ title: `Simulated: ${title}`, description })

  const simulateRequest = () => {
    const who = requesters[0]
    if (!who) return say('nobody left to request', 'Everyone has a request open for this dataset.')
    requestAccess(who, datasetId, SIMULATED_REASONS[state.requests.length % SIMULATED_REASONS.length])
    say(`${getPerson(who).name} requested access`)
  }
  const simulateDecision = (decision: 'approved' | 'declined') => {
    const target = waiting[0]
    if (!target) return say('no waiting request on this dataset')
    const actor = otherManager(persona.id)
    decide(actor, target.id, decision, decision === 'declined' ? 'Please share more about your use.' : undefined)
    say(`${getPerson(actor).name} ${decision === 'approved' ? 'approved' : 'declined'} ${getPerson(target.requesterId).name}`)
  }
  const simulateRevoke = () => {
    const target = approved[0]
    if (!target) return say('no approved request to revoke on this dataset')
    revoke(firstManager, target.id)
    say(`${getPerson(firstManager).name} revoked ${getPerson(target.requesterId).name}`)
  }
  const simulateGrant = () => {
    const who = requesters[0]
    if (!who || !firstManager) return say('nobody to give access to')
    grant(firstManager, datasetId, who)
    say(`${getPerson(firstManager).name} gave ${getPerson(who).name} access`)
  }
  const simulateDigest = () => {
    addDigest([persona.id], 'Public Health Data Collaborative', `${2 + (state.events.length % 3)} new items were added`)
    say('collaborative update', 'Added to the current person’s Updates tab.')
  }

  // Collaborative simulations.
  const collab = collaborativeInfo(collabId)
  const collabManagers = managersOf(collab.access.owner)
  const waitingSubmissions = state.requests.filter((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collabId && r.status === 'waiting')
  const publishedDatasets = datasets.filter((d) => d.status === 'published')
  const freeDataset = (skip?: (id: string) => boolean) =>
    publishedDatasets.find((d) => !itemInCollaborative(state.collabItems, collabId, d.id, 'dataset') && !state.requests.some((r) => requestKindOf(r) === 'submission' && r.collaborativeId === collabId && r.itemId === d.id && r.status === 'waiting') && !skip?.(d.id))
  const partnerPersona = ['meera', 'john'].find((id) => collaborativeRole(id, collab.access, collab.published) === 'partner')

  const simulateSubmission = () => {
    const submitter = ['priya', 'marcus', 'dev', 'sasha'].find((id) => collaborativeRole(id, collab.access, collab.published) === 'none')
    const dataset = freeDataset()
    if (!submitter || !dataset) return say('nothing left to submit on this collaborative')
    submitItem(submitter, collabId, 'dataset', dataset.id)
    say(`${getPerson(submitter).name} submitted an item`, dataset.form.metadata.name)
  }
  const simulateSubmissionDecision = (decision: 'approved' | 'declined') => {
    const target = waitingSubmissions[0]
    if (!target) return say('no waiting submission on this collaborative')
    const actor = collabManagers.find((m) => m !== persona.id) ?? collabManagers[0]
    decide(actor, target.id, decision, decision === 'declined' ? 'Outside the focus of this collaborative.' : undefined)
    say(`${getPerson(actor).name} ${decision === 'approved' ? 'approved' : 'declined'} ${getPerson(target.requesterId).name}’s submission`)
  }
  const simulatePartnerAdds = () => {
    const dataset = freeDataset()
    if (!partnerPersona || !dataset) return say('no partner can add an item here', 'Add a partner organisation first, or the collaborative has everything.')
    addItem(partnerPersona, collabId, 'dataset', dataset.id)
    say(`${getPerson(partnerPersona).name} (partner) added an item`, dataset.form.metadata.name)
  }
  const simulateAddPartner = () => {
    const owner = collabManagers[0]
    const result = addPartner(owner, collabId, 'org-external-unwomen')
    say(result.ok ? 'UN Women added as a partner' : 'UN Women is already a partner here', result.ok ? 'Its admin, Meera Joshi, is notified.' : undefined)
  }
  const simulateDigests = () => {
    const sent = sendDigests()
    say(sent > 0 ? `daily digest sent for ${sent} collaborative${sent === 1 ? '' : 's'}` : 'nothing changed since the last digest')
  }

  const buttonClass = 'justify-start'

  return (
    <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 print:hidden">
      {open && (
        <div role="dialog" aria-label="Prototype controls" className="flex max-h-[80dvh] w-80 flex-col gap-4 overflow-y-auto rounded-xl border border-border-default bg-surface-default p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-brand">Prototype controls</h2>
            <button type="button" aria-label="Close prototype controls" onClick={() => setOpen(false)} className="rounded-md p-1 text-text-subdued hover:bg-surface-subdued">
              <X className="size-4" />
            </button>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="type-label mb-1 text-text-subdued">Signed in as</legend>
            {PERSONAS.map((p) => (
              <label
                key={p.id}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                  p.id === persona.id ? 'border-border-focus bg-surface-subdued' : 'border-border-default hover:bg-surface-subdued',
                )}
              >
                <input type="radio" name="persona" className="mt-1" checked={p.id === persona.id} onChange={() => setPersonaId(p.id)} />
                <span>
                  <span className="block font-medium text-text-default">{p.name}</span>
                  <span className="block text-xs text-text-subdued">{p.blurb}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="dev-dataset" className="type-label text-text-subdued">
              Simulate on
            </label>
            <select
              id="dev-dataset"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              className="h-9 rounded-md border border-border-input bg-surface-default px-2 text-sm text-text-default"
            >
              {RESTRICTED_FOR_DEMO.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateRequest}>
              Someone requests access
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={() => simulateDecision('approved')} disabled={waiting.length === 0}>
              Another admin approves the oldest waiting request
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={() => simulateDecision('declined')} disabled={waiting.length === 0}>
              Another admin declines the oldest waiting request
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateRevoke} disabled={approved.length === 0}>
              Owner revokes an approved request
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateGrant}>
              Owner gives someone access directly
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateDigest}>
              Collaborative update for me
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dev-collab" className="type-label text-text-subdued">
              Simulate on a collaborative
            </label>
            <select
              id="dev-collab"
              value={collabId}
              onChange={(e) => setCollabId(e.target.value)}
              className="h-9 rounded-md border border-border-input bg-surface-default px-2 text-sm text-text-default"
            >
              {COLLABORATIVES_FOR_DEMO.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateSubmission}>
              Someone submits an item
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={() => simulateSubmissionDecision('approved')} disabled={waitingSubmissions.length === 0}>
              Owner approves the oldest submission
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={() => simulateSubmissionDecision('declined')} disabled={waitingSubmissions.length === 0}>
              Owner declines the oldest submission
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulatePartnerAdds}>
              A partner adds an item (no approval)
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateAddPartner}>
              Owner adds UN Women as a partner
            </Button>
            <Button type="button" variant="outline" size="sm" className={buttonClass} onClick={simulateDigests}>
              Send the daily follower digest now
            </Button>
          </div>

          <Button type="button" variant="ghost" size="sm" className="justify-start text-text-critical" onClick={() => { reset(); say('reset', 'Seed data restored.') }}>
            Reset prototype data
          </Button>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border-default bg-surface-default px-3 py-2 text-xs font-medium text-text-default shadow-md hover:bg-surface-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <FlaskConical className="size-4" aria-hidden="true" />
        DEV · {persona.name}
      </button>
    </div>
  )
}

export { DevPrototypeControls }
