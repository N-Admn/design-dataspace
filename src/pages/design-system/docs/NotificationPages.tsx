import * as React from 'react'
import { Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmailPreview } from '@/components/notifications/EmailPreview'
import { StatusChip } from '@/components/notifications/StatusChip'
import { EMAIL_ORDER, EMAIL_SENDER, EMAIL_TEMPLATES } from '@/lib/notification-emails'
import { cn } from '@/lib/utils'
import { Callout, Code, ComponentPreview, DocSection, PropsTable, ReferenceTable, SubHeading } from '@/pages/design-system/docs/primitives'
import type { RequestStatus } from '@/types/notifications'

const STATUSES: RequestStatus[] = ['waiting', 'approved', 'declined', 'withdrawn', 'revoked']

/** A row at rest, drawn from the same atoms the real one uses. The real row reads the live request store, so it is not mounted here. */
function RowSpecimen({ unread, children, actions }: { unread?: boolean; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <ul className="w-full max-w-xl overflow-hidden rounded-xl border border-border-default bg-surface-default">
      <li className={`relative flex gap-3 px-4 py-3 ${unread ? 'bg-surface-subdued/60' : ''}`}>
        <span className={`absolute left-1.5 top-[1.4rem] size-2 rounded-full ${unread ? 'bg-action-primary-default' : ''}`} aria-hidden="true" />
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground" aria-hidden="true">
          PN
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-subdued">{children}</p>
          <p className="mt-1 text-xs italic text-text-subdued">“Need it for a district-level study.”</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-subdued">
            <Badge variant="outline">CivicDataLab · Admin</Badge>
            <StatusChip status="waiting" />
            <span>2h ago</span>
          </div>
          {actions && <div className="mt-2 flex gap-2">{actions}</div>}
        </div>
      </li>
    </ul>
  )
}

export function NotificationSystemPage() {
  return (
    <>
      <DocSection
        id="surfaces"
        title="Three surfaces"
        description="One event reaches a person in up to three places. They share one data source, so a change made in one shows in all of them at once."
      >
        <ReferenceTable
          columns={['Surface', 'Job', 'Lifetime', 'Code']}
          rows={[
            ['Toast', 'Confirms the person’s own action.', 'A few seconds', <Code key="t">useToast()</Code>],
            ['Bell panel', 'Quick look and quick action: unread count, Requests / Updates tabs, six recent rows each, See all. Requests show the sentence, date, status and only the actions the person can take; updates show title, detail and date.', 'Until read', <Code key="b">NotificationBell</Code>],
            ['Notifications & Requests page', 'Everything, in two levels: a workspace row (All, Personal, then each organisation, with extra organisations under More) and category tabs with counts (All, Pending, Updates, Approved, Closed), plus an Unread only toggle, date groups and request history.', 'Permanent', <Code key="p">NotificationsPage</Code>],
          ]}
        />
        <Callout title="One inbox per account">
          The inbox covers the personal workspace and every organisation the person belongs to. Every row carries a context chip, such as{' '}
          <Code>Personal</Code> or <Code>CivicDataLab · Admin</Code>, so a merged inbox stays readable.
        </Callout>
      </DocSection>

      <DocSection id="status-chip" title="Status chip" description="A request’s status as an icon and a word, never colour alone. Declined and withdrawn share a calm neutral look because nobody did anything wrong; revoked is the only one that reads as a loss.">
        <ComponentPreview title="Status chip" code={`<StatusChip status="waiting" />   // waiting | approved | declined | withdrawn | revoked`}>
          {STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </ComponentPreview>
        <PropsTable rows={[{ name: 'status', type: "'waiting' | 'approved' | 'declined' | 'withdrawn' | 'revoked'", description: 'Which chip to draw. Waiting is amber, approved green, declined and withdrawn neutral, revoked red.' }]} />
      </DocSection>

      <DocSection id="row" title="Notification row" description="The one row used by the bell and the page. Its sentence is derived from the request’s current status, so every person sees the same outcome, worded from their side.">
        <ComponentPreview
          title="Row anatomy"
          code={`unread dot · avatar · one sentence (titles link to the public page, in a new tab)
optional quote of the reason · context chip · status chip · time · View history
inline actions on rows that need one`}
        >
          <div className="flex w-full flex-col gap-4">
            <RowSpecimen
              unread
              actions={
                <>
                  <Button type="button" size="sm">
                    Approve
                  </Button>
                  <Button type="button" size="sm" variant="outline">
                    Decline
                  </Button>
                </>
              }
            >
              <span className="font-medium text-text-default">Priya Nair</span> requested access to{' '}
              <span className="font-medium text-text-default underline decoration-border-default underline-offset-2">Ward-level health data</span>
            </RowSpecimen>
          </div>
        </ComponentPreview>
        <SubHeading>Which tab a row lives in</SubHeading>
        <ReferenceTable
          columns={['Tab', 'What lands here']}
          rows={[
            [<Code key="1">Pending</Code>, 'A request whose status is Waiting, whether the person can decide it or sent it.'],
            [<Code key="2">Updates</Code>, 'Events that need no decision: partner added, item added, content published, membership changes.'],
            [<Code key="3">Approved</Code>, 'A request whose status is Approved, including direct grants.'],
            [<Code key="4">Closed</Code>, 'Declined, withdrawn or revoked, each with its own chip.'],
          ]}
        />
        <p className="text-sm text-text-subdued">A request moves tab when its status changes. Decisions are shared by everyone who may decide; read and unread belong to each person.</p>
      </DocSection>

      <DocSection id="actions" title="Actions and confirmation" description="Every action answers at once with a toast and an updated row, badge and chip.">
        <ReferenceTable
          columns={['Action', 'Confirmation', 'Result']}
          rows={[
            ['Request access, Submit an item', 'A dialog with an optional reason, or the item picker', 'Waiting. The button reads Request sent.'],
            ['Approve', 'None, and no Undo', 'Approved. The requester gets access, or the item joins the collaborative.'],
            ['Decline', 'Confirm dialog with an optional reason', 'Closed (Declined). The person can ask again.'],
            ['Revoke access', 'Confirm dialog (destructive)', 'Closed (Revoked). Access ends at once.'],
            ['Withdraw', 'None', 'Closed (Withdrawn).'],
            ['Request again, Submit again', 'The same dialog as the first time', 'A new request. The old one stays in history.'],
          ]}
        />
        <Callout title="First decision counts" tone="note">
          If someone else decided first, the row shows <Code>Approved by Anil Rao</Code> in place of the buttons, and acting on a stale row shows an error toast naming who decided.
        </Callout>
      </DocSection>

      <DocSection id="bell" title="Bell" description="Sits in the top bar for signed-in people. The count is capped at 9+, and the number uses the 12px caption floor.">
        <PropsTable
          rows={[
            { name: 'Count', type: 'unread rows', description: 'Rows with at least one unread event addressed to the person. Capped at “9+”.' },
            { name: 'Tabs', type: 'Requests | Updates', description: 'Requests lists request rows and counts those waiting for this person to decide; Updates lists informational events and counts the unread ones.' },
            { name: 'Rows', type: '6 most recent', description: 'The compact row has a View details link; See all opens the page.' },
            { name: 'Live region', type: 'polite', description: 'New items are announced once and flash briefly in the open panel.' },
          ]}
        />
      </DocSection>

      <DocSection id="locked" title="Restricted items and taking part" description="The dataset bar and the collaborative actions read the same store as the bell, so a decision made anywhere shows on the page at once.">
        <ReferenceTable
          columns={['Control', 'Where', 'States']}
          rows={[
            [
              <span key="r" className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5" aria-hidden="true" /> RestrictedAccessBar
              </span>,
              'Dataset page, above the Data DNA card',
              'Request access, Request sent with Withdraw, Declined with the reason, Revoked, You have access, owner.',
            ],
            [
              <Code key="c">Follow and Contribute</Code>,
              'Collaborative page, in the existing actions row beside Share',
              'Follow / Following, and one Contribute button that reads Add item (owners and partners) or Submit an item (everyone else); signed-out readers are sent to sign in.',
            ],
          ]}
        />
        <p className="text-sm text-text-subdued">
          Locked data shows the file names with locks and nothing that can be opened or downloaded. Owners and partners add items directly; everyone else submits, and the owner approves.
          Managing happens in the dashboard, not on the public page: a collaborative’s <Code>Items</Code> view for owners and partners, and <Code>Following &amp; Access</Code> for everyone. Every entry point opens the same right-hand item-picker drawer.
        </p>
      </DocSection>

      <DocSection id="accessibility" title="Accessibility and contrast" description="Measured on the rendered pages (bell, page, history, dialogs and both bars) in Chromium, against WCAG 2.1 AA.">
        <ReferenceTable
          columns={['Element', 'Measured', 'Needs', 'Result']}
          rows={[
            ['Approved chip text', '4.75 : 1', '4.5 : 1', 'Pass'],
            ['Revoked and Declined chip text', '4.85 : 1 and 4.89 : 1', '4.5 : 1', 'Pass'],
            ['Row sentence, time and quote on white or on an unread row', '5.06 : 1', '4.5 : 1', 'Pass'],
            ['Tab labels', '5.33 : 1', '4.5 : 1', 'Pass'],
            ['Bell number on its badge', '6.74 : 1', '4.5 : 1', 'Pass'],
            ['Bell badge against the header', '8.81 : 1', '3 : 1', 'Pass'],
            ['Unread dot against its row', '11.3 : 1', '3 : 1', 'Pass'],
            ['Outline button and filter chip borders', '3.2 : 1 and 3.4 : 1', '3 : 1', 'Pass'],
            ['Focus ring', '11.9 : 1', '3 : 1', 'Pass'],
          ]}
        />
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-subdued">
          <li>Status is always an icon and a word. Unread rows add a screen-reader “Unread:” prefix as well as the dot.</li>
          <li>Titles that open a page in a new tab say so to screen readers.</li>
          <li>The bell opens with Enter or Space, moves focus into its named panel, and Escape closes it and returns focus to the bell. Its Requests / Updates tabs use arrow keys, Home and End, with one tab stop.</li>
          <li>Dialogs and the history sheet opened from code return focus to what opened them. If that row has moved (Approve takes it out of Pending), focus goes to the list instead of the page body.</li>
          <li>Approving or declining keeps keyboard focus on the list, in the page and in the bell, so a keyboard user continues from the same place.</li>
          <li>Toasts are announced politely from one persistent live region (errors as alerts). The bell announces new notifications once, and its flash is skipped under reduced motion.</li>
          <li>Every control on the page and in the bell is at least 24 px tall, down to a 320 px screen; titles inside a sentence are inline links and exempt. “Unread only” is a toggle chip, not a 16 px checkbox.</li>
          <li>Context and status chips are labels, not controls, so their pale borders do not need 3 : 1.</li>
        </ul>
        <Callout title="Outside this component" tone="note">
          The same check found text on other pages below 4.5 : 1: small grey captions on the dataset Data DNA card (4.16 : 1) and on the collaborative view’s meta lines (4.3 : 1). They predate this work and are not changed here. At 200% text size the global header (outside the page content) overflows the window by about 50 px on every page, the Datasets list included; the notification components themselves do not overflow.
        </Callout>
      </DocSection>
    </>
  )
}


/** The one email the product sends (a welcome email at registration), for review. Every notification is in-app only. Visual only: nothing is sent. */
export function NotificationEmailsPage() {
  const [selected, setSelected] = React.useState(EMAIL_ORDER[0])
  const [narrow, setNarrow] = React.useState(false)
  const template = EMAIL_TEMPLATES[selected]
  const toggle = (pressed: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus',
      pressed ? 'border-transparent bg-action-primary-default text-action-primary-text' : 'border-border-input bg-surface-default text-text-subdued hover:text-text-default',
    )
  return (
    <>
      <DocSection
        id="previews"
        title="Email previews"
        description={`The only email CivicDataSpace sends, from “${EMAIL_SENDER.name}” <${EMAIL_SENDER.address}>: a single welcome email when an account is registered. Notifications are never emailed. Nothing is sent from this prototype.`}
      >
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Preview width">
          <button type="button" aria-pressed={!narrow} onClick={() => setNarrow(false)} className={toggle(!narrow)}>
            Desktop (600px)
          </button>
          <button type="button" aria-pressed={narrow} onClick={() => setNarrow(true)} className={toggle(narrow)}>
            Phone (375px)
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav aria-label="Emails">
            <ul className="flex flex-col gap-1">
              {EMAIL_ORDER.map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    aria-pressed={selected === type}
                    onClick={() => setSelected(type)}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                      selected === type ? 'bg-surface-subdued font-medium text-text-brand' : 'text-text-subdued hover:bg-surface-subdued hover:text-text-default',
                    )}
                  >
                    {EMAIL_TEMPLATES[type].label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div aria-live="polite">
            <EmailPreview template={template} narrow={narrow} />
          </div>
        </div>
      </DocSection>
      <DocSection id="rules" title="Email policy">
        <ul className="list-disc space-y-1 pl-5 text-sm text-text-subdued">
          <li>Every notification is in-app. Email is disabled for all notification events.</li>
          <li>The only email is one welcome email when an account is first registered.</li>
          <li>No email for invitations, membership, roles, access, Evaluator assignments, content activity, approvals, collaboratives or routine platform updates.</li>
        </ul>
      </DocSection>
    </>
  )
}
