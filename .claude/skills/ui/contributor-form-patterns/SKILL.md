---
name: contributor-form-patterns
description: The standardised UI patterns for contributor flows (dataset, use case, event, publication, organisation… creation and edit forms and their side sheets). Use whenever you add or change anything in a contributor form — especially an "add another / add new item" action, a list inside a form card, a file upload, or a right-hand drawer — and when the user says something should be standardised, so the rule is recorded here instead of being re-explained.
---

# Contributor form patterns

The rules below are decisions the product owner has already made. Apply them without being asked, and do not offer alternatives. If a request seems to conflict with one, follow the rule and say so in one line.

## Purpose

Keep every contributor flow looking and behaving the same, so a pattern settled once is never reinvented (inline repeatable fields, button-only uploads, centred modals for adding items, and so on).

## When to use

- Adding or changing a form section, card, step or side sheet in any contributor flow.
- Adding any "add / create / connect another …" action, or a list of items inside a form.
- Adding any place a user selects or uploads a file.
- The user standardises something ("always do it this way", "make this consistent everywhere") — record it under **Standards log** below in the same change.

## When not to use

- Consumer-facing pages (Dataset Detail, Search, Discover), unless the user says the pattern applies there too.
- One-off visual tuning that is not a repeatable pattern.

## Pattern 1 — Adding an item: right drawer, button top-right of the title

Anything a contributor can add more than one of (sources, contributors, speakers, organisations, resources, publications, connected content…) follows this shape. Never put the repeatable input fields inline in the form card.

**The card**
- `Card` whose `CardHeader` is `className="flex-row items-center justify-between"`.
- Left: the section title (`CardTitle`) and, when useful, one muted description line.
- Right, on the same row as the title: an outline, small button with a `Plus` icon and the label **Add <Thing>** (`<Button type="button" variant="outline" size="sm"><Plus className="size-4" />Add Source</Button>`). Always top-right of the title, never below the list, never at the bottom of the card.
- Body: the added items as compact rows (`rounded-lg border border-border-default px-3 py-2.5`), each with an **Edit** (pencil) and **Remove** (trash) icon button on the right. Remove acts immediately unless losing it would be costly.
- Empty state: a dashed-border muted line such as "No sources added yet." — not a blank card and not a pre-opened empty entry.

**The drawer (clicking the button)**
- The shared `Dialog` with `DialogContent variant="right-drawer" className="gap-0 p-0"`. Not a centred modal, not an inline expansion, never a drawer opened from inside another drawer.
- Header: `DialogHeader` with `DialogTitle` ("Add Source" / "Edit Source") and a one-line `DialogDescription`.
- Body: `min-h-0 flex-1 overflow-y-auto px-6 py-5` with the fields in a `flex flex-col gap-5` — it scrolls on its own while header and footer stay fixed.
- Footer: `flex shrink-0 items-center justify-between border-t border-border px-6 py-4` with **Cancel** (ghost) on the left and the primary action (**Add Source** / **Save Changes**) on the right.
- Add and Edit use the same drawer; Edit pre-fills it.
- Closing with unsaved input (Cancel, X, overlay, Escape) asks the standard `useConfirm` "Discard changes?" first.
- Validation: required fields marked with the red `*`, inline `FieldError` messages; optional fields are only validated when filled; an item with nothing in it cannot be saved.
- Items carry a stable `id` so editing or removing one never touches another; empty items are never stored.

**Canonical examples** — copy their structure: `src/components/usecase/UseCaseStep2Connect.tsx` (Contributors card) with `AddContributorForm.tsx`; `src/components/dataset/Step1Metadata.tsx` (Source & Provenance card) with `SourceSheet.tsx`; `src/components/event/EventConnectionsStep.tsx` with `SpeakerForm.tsx`.

## Pattern 2 — File uploads: one dropzone

Every upload — in forms, side sheets, modals, dialogs, inline editors — is the standard dropzone: cloud-upload icon · "Drag and drop a file here, or click to browse." · "Supported file types:" with a badge per extension · outline **Browse File** button · "Maximum file size limit: 500MB".

- Single-asset field: `FileUploadField` (label, helper text, error, then the dropzone; a chosen file becomes a preview row with Replace / Remove). Multi-file surface: `DropzoneUploadField`. Both live in `src/components/shared/`.
- Only the instruction wording (`dropzoneTitle` / `title`) may vary ("…a logo…", "…a photo…", "…files…").
- Never add a bare "Upload" button, a compact variant, a custom icon or button label, or a bespoke dashed box. Extensions and the size limit come from the field's own validation constants.
- A hidden `<input type="file">` is allowed only to power a Replace action on an item already uploaded.
- Spec: "Upload fields" in the design system page and `design-system.md`.

## Pattern 3 — Smaller rules that go with the above

- **Drawers over modals for contributor actions:** a form that collects input opens as the right drawer (Contact Support, Add Source, Add Contributor…). Centred dialogs are for short confirmations only.
- **Unsaved changes:** always `useConfirm` ("Discard changes?" / "Unsaved message"), never a silent close.
- **Optional links:** URL fields accept only `http://` or `https://` and are checked only when something was typed; empty never blocks a draft.
- **Review step:** anything a contributor can enter appears in Review & Publish, with a pencil back to the step that edits it.

## Workflow

1. Before building a form section, read the pattern that applies and copy a canonical example.
2. Build with the shared components (`Card`, `Dialog`, `Button`, `Input`, `Label`, `FieldError`, `FileUploadField`, `useConfirm`); do not restyle them.
3. Check the result against this file: button placement, drawer type, footer order, empty state, upload look.
4. If the user standardises something new, add it to the **Standards log** and, if it is a visual rule, to the design system page / generator prose too.

## Standards log

Newest last. One line each: the rule, then why/where.

- Add actions are a right drawer, button top-right of the card title — set when Source & Provenance was first built inline and had to be redone.
- One standard dropzone for all uploads (Browse File, type badges, size limit line) — set after uploads varied between compact buttons and dropzones.
- Contact Support (global nav) is a right drawer with a sticky Cancel / Send footer — set when Contact was built.

## Output

When you apply or change a pattern, say in one line which pattern you followed. When you add a standard, state the new log line you recorded.
