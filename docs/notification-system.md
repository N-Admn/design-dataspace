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

- **Persona switcher**: John Doe (personal workspace, Admin of CivicDataLab, Editor at another organisation), Anil Rao (second CivicDataLab admin), Rahul Mehta (CivicDataLab editor), Priya Nair (outsider), Marcus Bell (follower).
- **Simulate**: someone requests access, another admin decides, a follower digest, grant or revoke.
- **Reset** prototype data.

Seed data is authored as requests, so the same request reads the same way for every persona.

## Design and accessibility

- Reuse existing components and tokens; extend the toast with a button action (it only supported a link).
- Dialogs and side sheets follow the existing `Dialog` variants.
- Keyboard operable, focus managed, Escape closes, unread changes announced politely, status never conveyed by colour alone.
- Check WCAG contrast of the status chips.
- Record the new patterns (notification row, status chip, bell) in the design system page and `design-system.md`.

## Out of scope

Saved items, licence management, download tracking, notification preferences, and any dashboard redesign beyond one **Notifications** navigation entry.

## Implementation slices

1. **Access-request lifecycle (this slice):** dataset page lock, request dialog, toast, bell, page, history, personas.
2. Collaborative submissions (owner approval), partner and item-added events, follow and digest.
3. Visual-only email previews, accessibility pass, design-system documentation.
