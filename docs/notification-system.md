# Notification system (prototype spec)

Prototype only: no APIs, auth, email delivery or queues. Everything runs on mock data and simulated interactions, and every action must update the toast, bell, panel, page and every persona consistently. Business rules live in [restricted-access-and-approvals.md](restricted-access-and-approvals.md); email rules in [email-notifications.md](email-notifications.md).

## Surfaces

| Surface | Job | Lifetime |
|---|---|---|
| Toast | Confirms my own action. | A few seconds |
| Bell panel | Quick look and quick action: unread count (capped at 9+), **Requests** / **Updates** tabs (Requests counts what waits for your decision, Updates counts unread), six recent rows per tab, **See all**. Bell rows are minimal: a request shows its sentence, date, status and the actions you can take; an update shows its title, detail and date. Reasons, context and decision attribution live on the page and in the history. | Until read |
| Notifications & Requests page | `/notifications`, a standalone page opened from the bell or the main dashboard (not part of any workspace; `/dashboard/notifications` redirects). A workspace row (**All**, **Personal**, one per organisation you belong to, extras under **More**) and category tabs with counts (**All**, **Pending**, **Updates**, **Approved**, **Closed**) that combine, plus an **Unread only** toggle, date grouping, request history. | Permanent |

## One inbox per account

One page across personal and organisation contexts. Every row shows a **context chip**: `Personal`, or `<Organisation> · <Role>`.

## Tabs and membership rules

| Tab | What lands here |
|---|---|
| **Pending** | A request whose status is Waiting, whether I can decide it or I sent it |
| **Updates** | Events that need no decision and aren't a request (collaborative updates, digests, items added, partner added) |
| **Approved** | A request whose status is Approved, including direct grants |
| **Closed** | Declined, Withdrawn or Revoked. Each keeps its own status chip |

A request moves tabs as its status changes (Waiting → Approved → Revoked). The requester's "access approved" row is the same request, so it sits in Approved, not Updates.

## Permissions

- Access requests: the item's owner, or the owning organisation's **admins**.
- Collaborative submissions: the **collaborative owner only**. Partners add directly and never approve.
- The person who performs an action gets no notification about it.
- **Shared decision state:** one decision updates the request for every authorised admin. **Read / unread is individual** to each recipient.

## Interactions

| Action | Who | Confirmation | Result |
|---|---|---|---|
| Request access | Signed-in non-member | Dialog with optional reason | Request becomes Waiting; button reads **Request sent** |
| Withdraw | Requester, while Waiting | None | Closed (Withdrawn) |
| Approve | Authorised admin | None, **no Undo** | Approved; the requester gets access |
| Decline | Authorised admin | Confirm dialog, optional reason | Closed (Declined) |
| Revoke | Authorised admin | Confirm dialog (destructive) | Closed (Revoked); access ends |
| Re-request | Requester, after Declined / Withdrawn / Revoked | Dialog | A new request; the old one stays in history |
| Follow | Signed-in user | None | Slice 2 |

If someone else decided first, the row shows who decided and the buttons disappear. Acting on a stale row shows a toast ("Already decided").

## History

**View history** opens a side sheet: the request's timeline with actor, action, reason and timestamp.

## Data model

Requests and events are the source of truth. **Notifications are derived per recipient** and are never stored.

- **Request**: dataset, owner context, requester, reason, status, history.
- **Event**: type, actor, request, time. Recipients are resolved by a pure function (`resolveRecipients`), which drops the actor.
- **Read state**: stored per person and event.
- **Item** (what a persona sees in the bell and on the page): one per request, built from the latest event addressed to that persona.

Persisted in `localStorage` and kept in sync across open tabs with the `storage` event.

## Signed-in person and seed data

The prototype is always John Doe (personal workspace, Admin of CivicDataLab, Editor at the World Health Organization); there is no persona switcher and no on-screen simulator. The other seeded people stay as data: Anil Rao (second CivicDataLab admin), Rahul Mehta (CivicDataLab editor), Priya Nair (outsider), Meera Joshi (admin of UN Women, a partner on a collaborative) and Marcus Bell (follower) appear as requesters, approvers, partners and followers in the seeded history.

Seed data is authored as requests, so each request reads the same way for everyone it is addressed to. The store still exposes the actions the removed DEV panel used (acting as another person, the follower digests, reset), so a simulator can be added back without changing the store.

## Collaborative events (slice 2)

A submission is the same record as an access request (`kind: 'submission'`), so it shares the store, rows, tabs, history sheet, confirmation rules and shared decision state. What differs:

| Event | Who is notified | Where it shows |
|---|---|---|
| Item submitted | The collaborative owner, or the owning organisation's admins. **Not partners.** | Pending, with Approve / Decline |
| Submission approved / declined | The submitter | Approved / Closed, with **Submit again** after a decline |
| Submission withdrawn | The owner side | Closed |
| Item added (by an owner, a partner, or an approved submission) | The item's owner, unless they added it, or approved it themselves | Updates |
| Organisation made a partner | That organisation's admins | Updates |
| Daily follower digest | Followers | Updates, one row per collaborative |

- Owners (admins and editors of the owning organisation) and partners (admins and editors of a partner organisation, once published) **add directly**, with no approval. Everyone else submits.
- The public collaborative page keeps only **Follow / Following**, one **Contribute** button and Share in its existing actions row. Contribute reads **Add item** for owners and partners, **Submit an item** for everyone else (signed-out readers go to sign in). Management lives in the dashboard (see below).
- Only published datasets and use cases can be picked. Items already in the collaborative or already waiting are left out. Only one submission per item can be pending at a time, whoever sends it: the picker lists such items as disabled with "Already under review", and submitting one anyway shows an "Already under review" toast. If an owner or partner adds the item directly while a submission for it is still waiting, approving that submission later changes nothing.
- Follower digests are summaries: they list changes since the last digest, only when something changed, and show restricted items with a count. Prototype triggers it from the DEV controls; in production it is a daily job.
- Partner rights and the People step are untouched: this work only adds the notification lifecycle.
- **Follow-up:** the shared collaborative view still has a placeholder **Contribute** button. It should be connected to this same submission flow (open the item picker in submit mode, or Add item for owners and partners) rather than become a second experience.

## Managing collaboratives in the dashboard

One state, three views, no second submission flow.

| Where | Who | What |
|---|---|---|
| **Items** view of a collaborative (`/dashboard/collaboratives/:id/items`, from a row's **Manage items** action in the personal and organisation lists, or from the Managing card on the dashboard) | Owners (admins and editors of the owning organisation) and partners. Everyone else is told it is not theirs to manage | Every item with **Added by** and how it got there; **+ Add Item** (right drawer); **Remove** (owner: any item; partner: items they added); items the owner connected in the editor are listed read-only; submissions **waiting for approval** (Approve and Decline for the owner's admins only; partners and editors see who it is waiting for); the owner, partners, who can submit and the follower count |
| **My Workspace dashboard** (`/dashboard`, Overview > Dashboard in the sidebar) | Everyone signed in | The counts of the person's content (each opens its list), and below them **Following & access**: four equal cards, each with its count, a one-line description, a small cue for anything waiting and an Open button. Choosing one replaces the dashboard with that section's card, the way the creation flows open, with a close button at the top left; the close button, Escape or the browser Back button returns to the dashboard, and the open card is in the URL (`?panel=following`, `contributions`, `managing` or `access`). **Following**: collaboratives followed, last change, Unfollow. **My Contributions**: one list, one card per item the person put forward, newest first, each with a clear state (Waiting with Withdraw, Declined or Withdrawn with Submit again, or In the collaborative) and View history; an approved submission shows once, as the item now in the collaborative (no Remove: only owners and partners remove published items). **Managing**, shown only to owners and partners: the collaboratives the person runs, each with Manage items. **Access**: restricted datasets the person can open now (their own, their organisation's, approved or given directly), with a link to requests still waiting. The old `/dashboard/following` and its `?tab=` links redirect to the matching card |
| **Public page** | Everyone | Item cards say **Added by** (the person who added it, or the collaborative's owner for what they connected in the editor), and the Organisations and People lists include a self-filling **Contributor** entry for the owner of every item. Items added through the platform are listed first |

The item picker is one right-hand drawer (contributor-form-patterns, Pattern 1) opened from the public Contribute button, the Items view and the My Contributions card. Closing it with something chosen asks "Discard changes?". Items already in the collaborative, whichever way they got there, are not offered; items under review are shown disabled.

## Design and accessibility

- Reuse existing components and tokens; extend the toast with a button action (it only supported a link).
- Dialogs and side sheets follow the existing `Dialog` variants.
- Keyboard operable, focus managed, Escape closes, unread changes announced politely, status never conveyed by colour alone.
- Check WCAG contrast of the status chips.
- Record the new patterns (notification row, status chip, bell) in the design system page and `design-system.md`.

## Emails (visual only)

[Notification emails](/design-system/notification-emails) in the design system shows one email per event, at desktop and phone widths, from the typed templates in `src/lib/notification-emails.ts`. The copy uses the same terms as the rows, and the recipients follow the same rules (never the actor; submissions only to the collaborative owner). Nothing is sent.

## Accessibility checks

Keyboard (bell open, tabs, Escape and focus return), focus kept on the list after Approve or Decline, focus return from dialogs opened from code, polite announcements, status shown as icon plus word, mobile down to 320 px, 24 px minimum targets and reduced motion are covered in the Notifications page of the design system. Text below 4.5:1 on other pages (23 styles) and the global header's overflow at 200% text size are existing and documented there, not changed.

## Out of scope

Saved items, licence management, download tracking, notification preferences, and any dashboard redesign beyond one **Notifications** navigation entry.

## Implementation slices

1. **Access-request lifecycle (done, tag `notifications-slice-1`):** dataset page lock, request dialog, toast, bell, page, history, personas.
2. **Collaborative submissions (done, tag `notifications-slice-2`):** submit, owner approval, partner contributions, partner-added and item-added events, follow and digest.
3. Design-system entries, WCAG contrast checks, visual-only email previews and the remaining accessibility work.
