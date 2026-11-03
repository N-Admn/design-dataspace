# Notification system (prototype spec)

Prototype only: no APIs, auth, email delivery or queues. Everything runs on mock data and simulated interactions, and every action must update the toast, bell, panel, page and every persona consistently. Business rules live in [restricted-access-and-approvals.md](restricted-access-and-approvals.md); email rules in [email-notifications.md](email-notifications.md).

## Surfaces

| Surface | Job | Lifetime |
|---|---|---|
| Toast | Confirms my own action. | A few seconds |
| Bell panel | Quick look and quick action: unread count (capped at 9+), **All** / **Needs action** tabs, six recent rows, **See all**. | Until read |
| Notifications & Requests page | `/dashboard/notifications`. Filters, date grouping, request history. | Permanent |

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

## Prototype controls (DEV only)

Gated by `import.meta.env.DEV`, so they never ship.

- **Persona switcher**: John Doe (personal workspace, Admin of CivicDataLab, Editor at another organisation), Anil Rao (second CivicDataLab admin), Rahul Mehta (CivicDataLab editor), Priya Nair (outsider), Meera Joshi (admin of UN Women, a partner on a collaborative), Marcus Bell (follower).
- **Simulate**: someone requests access, another admin decides, grant or revoke; on a collaborative, someone submits, the owner decides, a partner adds an item, the owner adds a partner, and the daily follower digest.
- **Reset** prototype data.

Seed data is authored as requests, so the same request reads the same way for every persona.

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
- The collaborative page has a **Take part** bar: Follow / Following, Add item or Submit an item, the person's own submissions with their status, and the items added so far with **Added by** and **Remove**. Only the person who added an item, or the collaborative owner, can remove it.
- Only published datasets and use cases can be picked. Items already in the collaborative or already waiting are left out. If two people submit the same item, approving the first leaves the second as a harmless duplicate.
- Follower digests are summaries: they list changes since the last digest, only when something changed, and show restricted items with a count. Prototype triggers it from the DEV controls; in production it is a daily job.
- Partner rights, the **Contribute** button in the shared collaborative view and the People step are untouched: this work only adds the notification lifecycle.

## Design and accessibility

- Reuse existing components and tokens; extend the toast with a button action (it only supported a link).
- Dialogs and side sheets follow the existing `Dialog` variants.
- Keyboard operable, focus managed, Escape closes, unread changes announced politely, status never conveyed by colour alone.
- Check WCAG contrast of the status chips.
- Record the new patterns (notification row, status chip, bell) in the design system page and `design-system.md`.

## Out of scope

Saved items, licence management, download tracking, notification preferences, and any dashboard redesign beyond one **Notifications** navigation entry.

## Implementation slices

1. **Access-request lifecycle (done, tag `notifications-slice-1`):** dataset page lock, request dialog, toast, bell, page, history, personas.
2. **Collaborative submissions (done, tag `notifications-slice-2`):** submit, owner approval, partner contributions, partner-added and item-added events, follow and digest.
3. Design-system entries, WCAG contrast checks, visual-only email previews and the remaining accessibility work.
