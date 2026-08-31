# Accessibility Report — CivicDataSpace

**Date:** 2026-08-31
**Scope:** `src/` React application (164 files). Static code audit against WCAG 2.1 AA. No automated axe/screen-reader runtime pass — findings are from source review.

---

## Summary

The app leans on Radix primitives (dialog, select, checkbox, radio, popover, tooltip) and a shared `Button`/`Input` layer, so keyboard support, focus trapping, and many ARIA basics come for free. Icon-only buttons are labelled consistently (`aria-label` used 54×) and `aria-invalid` is wired on ~65 fields.

The gaps are concentrated in a few shared components that are used everywhere, so fixing them has broad reach:

| # | Severity | Issue | WCAG |
|---|----------|-------|------|
| 1 | High | Field errors not programmatically linked to inputs | 3.3.1, 1.3.1, 4.1.3 |
| 2 | High | 5 dialogs render without an accessible name (`DialogTitle`) | 4.1.2, 2.4.6 |
| 3 | High | Rich text editor is an unlabeled `contentEditable` region | 1.3.1, 4.1.2, 3.3.2 |
| 4 | High | `muted-foreground` body text fails AA contrast (~3.9:1) | 1.4.3 |
| 5 | Medium | Main content pages have no `<h1>`; hierarchy starts at `<h3>` | 1.3.1, 2.4.6 |
| 6 | Medium | No "skip to content" link | 2.4.1 |
| 7 | Medium | Tabs pattern incomplete (roles without panel/keyboard model) | 4.1.2, 2.1.1 |
| 8 | Medium | ARIA-role table instead of native `<table>` | 1.3.1 |
| 9 | Medium | Error toasts use `role="status"` (polite), not `alert` | 4.1.3, 2.2.1 |
| 10 | Medium | Editor toggle buttons don't expose `aria-pressed` | 4.1.2 |
| 11 | Medium | Placeholder links / no-op nav buttons are focusable | 2.4.4, 4.1.2 |
| 12 | Low | Breadcrumb is a `<p>`, not a nav landmark | 1.3.1 |
| 13 | Low | Inconsistent `focus-visible` styling on hand-rolled buttons | 2.4.7 |
| 14 | Low | Redundant `alt` text on guide images | 1.1.1 |
| 15 | Low | 63 `<button>` without explicit `type` (submit hazard in forms) | 3.2.2 |
| 16 | Low | No `prefers-reduced-motion` handling | 2.3.3 |
| 17 | Low | Choropleth map: keyboard + color-only encoding | 1.4.1, 2.1.1 |

---

## High severity

### 1. Form errors are not associated with their fields

[`src/components/ui/field-error.tsx`](src/components/ui/field-error.tsx) renders a bare `<p>` with no `id`. Inputs across the wizards and auth forms set `aria-invalid={Boolean(errors.x)}` but there is **no `aria-describedby`** anywhere in the codebase (0 occurrences), so the error text is never linked to the control.

A screen reader user tabbing into an invalid field hears "invalid entry" with no reason. Sighted keyboard users who rely on magnification may never see the message below the field.

Representative call sites: [`Step1Metadata.tsx:41-60`](src/components/dataset/Step1Metadata.tsx#L41-L60), every `*Step*` component, all three files under [`src/pages/auth/`](src/pages/auth/).

**Fix:** give `FieldError` a stable `id`, render it with `role="alert"` (or `aria-live="polite"`), and point the field at it:

```tsx
<Input id="ds-name" aria-invalid={!!errors.name}
       aria-describedby={errors.name ? 'ds-name-error' : undefined} />
<FieldError id="ds-name-error" message={errors.name} />
```

### 2. Dialogs without an accessible name

Radix `Dialog` requires a `Dialog.Title` (or an explicit `aria-labelledby`) for the dialog to be announced on open; it also logs a dev-console warning. These five render `DialogContent` with no `DialogTitle`:

- [`src/components/ui/confirm-dialog.tsx`](src/components/ui/confirm-dialog.tsx) — uses a plain `<h2>` instead of `DialogTitle`; **this is the app-wide delete/publish confirmation**, so the impact is large.
- [`src/components/dataset/PublishSuccessModal.tsx`](src/components/dataset/PublishSuccessModal.tsx)
- [`src/components/shared/LeaveCreationDialog.tsx`](src/components/shared/LeaveCreationDialog.tsx)
- [`src/components/profile/DeleteAccountDialog.tsx`](src/components/profile/DeleteAccountDialog.tsx)
- [`src/components/chart/ChartPublishSuccessModal.tsx`](src/components/chart/ChartPublishSuccessModal.tsx)

**Fix:** use `DialogTitle` (visually styled as needed) and `DialogDescription` for the body text. If a title must be visually hidden, wrap it in `sr-only` rather than omitting it.

### 3. Rich text editor is an unlabeled editable region

[`src/components/ui/rich-text-editor.tsx:72-83`](src/components/ui/rich-text-editor.tsx#L72-L83): the `contentEditable` `<div>` has no `role="textbox"`, no `aria-multiline="true"`, and no `aria-label`/`aria-labelledby`. It accepts an `id`, but a `<label htmlFor>` only binds to native form controls, so the visible field label is **not** connected to this element. The placeholder is a visual-only `<p>` with no `aria-placeholder` link.

Screen readers announce it as a generic editable area with no name.

**Fix:** add `role="textbox"`, `aria-multiline="true"`, `aria-labelledby={labelId}` (have callers pass the label's id), and either `aria-describedby` the placeholder node or drop the visual placeholder in favor of `aria-placeholder`. Also note `document.execCommand` is deprecated — not an a11y issue, but relevant for the same rewrite.

### 4. `muted-foreground` text fails AA contrast

[`src/index.css:33`](src/index.css#L33): `--muted-foreground: oklch(0.556 0 0)` ≈ `#8a8a8a`. On `--background`/`--card` (white) that is ≈ **3.9:1**, below the 4.5:1 required for normal-size text (WCAG 1.4.3 AA).

This token is the default for helper text, field hints, descriptions, timestamps, secondary table columns, the breadcrumb text, and input placeholders — it is one of the most-used colors in the UI. Placeholders in particular inherit it via [`input.tsx`](src/components/ui/input.tsx) (`placeholder:text-muted-foreground`).

**Fix:** darken to roughly `oklch(0.50 0 0)` (~#767676, 4.6:1) or darker. Verify against `--muted` and `--card` backgrounds too. Keep a separate lighter token only for non-text decoration (disabled glyphs, 3:1 UI components) if needed.

---

## Medium severity

### 5. No `<h1>` on main content pages

The list views (Datasets, Events, Use Cases, Collaboratives, AI Models, Charts) render through [`ManagementTable.tsx:518`](src/components/shared/management-table/ManagementTable.tsx#L518), whose title is `CardTitle` — an `<h3>` ([`card.tsx:25`](src/components/ui/card.tsx#L25)). There is no `<h1>` for the view, so the heading outline on these pages starts at `h3`. `<h1>` is otherwise used well on preview and auth pages.

**Fix:** render the page/section title as `<h1>` (or pass a heading-level prop to `ManagementTable`), and keep the outline contiguous (`h1 → h2 → h3`).

### 6. No skip link

[`App.tsx:59`](src/App.tsx#L59) has a `<main>` landmark but no "Skip to main content" link. On every route a keyboard user tabs through the entire `TopNav` (search button, EXPLORE, category links, user menu) and, on list/wizard routes, the `ContributorSidebar`, before reaching page content.

**Fix:** add a visually-hidden-until-focused anchor as the first focusable element that targets `<main id="main">`.

### 7. Incomplete tabs pattern

[`ManagementTable.tsx:401-410`](src/components/shared/management-table/ManagementTable.tsx#L401-L410): status filters use `role="tablist"` / `role="tab"` / `aria-selected` on `<button>`s, but there is no `role="tabpanel"`, no `aria-controls`/`id` linkage, and each tab is its own tab stop — the ARIA tabs pattern expects a single tab stop with arrow-key navigation between tabs. [`QuickGuideModal.tsx:69`](src/components/layout/QuickGuideModal.tsx#L69) applies `role="tablist"` to purely decorative slide dots.

**Fix:** either implement the full pattern (roving `tabindex`, arrow keys, `aria-controls` → `tabpanel`) or remove the tab roles and treat them as a filter `group` of toggle buttons with `aria-pressed`.

### 8. ARIA-role table instead of `<table>`

[`ManagementTable.tsx:254-383`](src/components/shared/management-table/ManagementTable.tsx#L254-L383) reconstructs table semantics on `<div>`s (`role="table" | "rowgroup" | "row" | "columnheader" | "cell"`, plus `aria-sort` — good). Risks: intermediate flex wrappers between `role="table"` and `role="row"` can break the accessibility tree in some AT, and there is no `aria-rowcount`/`aria-colcount` for the paginated result set. `SortableHeader` ([line 84](src/components/shared/management-table/ManagementTable.tsx#L84)) is a button inside the `columnheader` with a descriptive `aria-label` — that part is fine.

**Fix:** prefer a native `<table>`/`<thead>`/`<tbody>`/`<th scope="col">`. If the div grid must stay for layout, ensure role elements are direct DOM parents/children and add `aria-rowcount`/`aria-colcount`.

### 9. Error toasts announced politely

[`toast.tsx:47`](src/components/ui/toast.tsx#L47): every toast, including `variant="error"`, uses `role="status"` (implicit `aria-live="polite"`). Errors should be `role="alert"` / `aria-live="assertive"`. The toast container is also mounted/unmounted per toast rather than being a persistent live region, which can cause missed announcements. Auto-dismiss is a fixed 4s ([`TOAST_DURATION_MS`](src/components/ui/toast.tsx#L18)) with no hover/focus persist — borderline against WCAG 2.2.1 for longer messages.

**Fix:** keep an always-rendered live-region wrapper; set `role="alert"` for errors, `role="status"` for success; pause the dismiss timer on hover/focus.

### 10. Editor toggle buttons don't expose state

[`rich-text-editor.tsx:54-65`](src/components/ui/rich-text-editor.tsx#L54-L65): Bold / Italic / Underline / list buttons never set `aria-pressed`, so their active state is invisible to AT (and there is no visual active state either).

**Fix:** track selection state (`document.queryCommandState`) and set `aria-pressed` + a visual `data-active` style.

### 11. Placeholder links and no-op nav controls

- [`AuthLayout.tsx:35-43`](src/components/auth/AuthLayout.tsx#L35-L43): Privacy / Terms / Contact are `<a href="#">` — focusable, announced as links, go nowhere.
- [`TopNav.tsx:108-134`](src/components/layout/TopNav.tsx#L108-L134): the search button, "EXPLORE", and the category `<button>`s have no `onClick` — focusable controls that do nothing.

**Fix:** wire real destinations, or remove/disable until implemented. If intentionally deferred, at minimum `aria-disabled` + no tab stop.

---

## Low severity / polish

### 12. Breadcrumb is not a landmark
[`BreadcrumbBar.tsx`](src/components/layout/BreadcrumbBar.tsx) is a single `<p>` with literal `›` characters (read aloud by some AT) and no links. Use `<nav aria-label="Breadcrumb">` + an ordered list; mark separators `aria-hidden`. Make crumbs actual links where a target exists.

### 13. Inconsistent focus-visible styling
`Button` ([`button.tsx:8`](src/components/ui/button.tsx#L8)) and `Input` have solid `focus-visible:ring-2`. Hand-rolled `<button>`s do not, e.g. [`ManagementTable.tsx` SortableHeader / clear-search](src/components/shared/management-table/ManagementTable.tsx#L84), [`ReviewSection.tsx:26`](src/components/shared/ReviewSection.tsx#L26), [`ChartListView.tsx:62`](src/components/chart/ChartListView.tsx#L62), [`EventListView.tsx:48`](src/components/event/EventListView.tsx#L48), the `DialogClose` in [`dialog.tsx:42`](src/components/ui/dialog.tsx#L42), and the toast dismiss. The base layer ([`index.css:120`](src/index.css#L120)) sets `outline-ring/50` (color only, no `outline-style`/width), so these rely on the UA default and are easy to suppress accidentally.

**Fix:** add a shared `focus-visible` ring utility to all interactive elements, or a base-layer rule for `a, button, [role="button"], [tabindex]`.

### 14. Redundant image alt text
[`QuickGuideModal.tsx:58`](src/components/layout/QuickGuideModal.tsx#L58) and [`HelpSupportPanel.tsx:214`](src/components/layout/HelpSupportPanel.tsx#L214) use `alt={slide.title}`, which duplicates the adjacent visible `<p>` heading (double announcement). If the image carries instructional content, give it a real description; otherwise `alt=""`. Decorative images elsewhere correctly use `alt=""` — good.

### 15. `<button>` without explicit `type`
63 `<button>` elements omit `type`. Inside the many `<form>`-wrapped wizard steps, a `type`-less button defaults to `submit` and can trigger unintended form submission on Enter/click. Audit and set `type="button"` on all non-submit buttons.

### 16. No reduced-motion support
Dialog/toast/stepper animations (`animate-in`, `slide-in-*`, `zoom-*`, `tw-animate-css`) and Leaflet transitions have no `@media (prefers-reduced-motion: reduce)` override.

**Fix:** add a global reduced-motion rule that neutralizes non-essential transitions/animations.

### 17. Choropleth map
[`MapChoroplethPreview.tsx`](src/components/chart/MapChoroplethPreview.tsx) / react-leaflet: interactive maps are typically not keyboard operable, and a choropleth conveys value through color alone. Provide a data-table/text alternative and a non-color encoding (labels, patterns, or a value tooltip reachable by keyboard). WCAG 1.4.1, 2.1.1.

---

## What's already good

- `<html lang="en">` set; `<title>` present; viewport meta allows zoom.
- Semantic `<header>` / `<nav>` / `<main>` / `<footer>` in the layout.
- Radix primitives provide focus trap, `Esc` to close, and keyboard nav for select / combobox / checkbox / radio / popover / tooltip.
- Icon-only buttons consistently carry `aria-label` (54 uses); `sr-only` text on the dialog close button.
- `aria-current="page"` on the active sidebar link ([`ContributorSidebar.tsx:49`](src/components/layout/ContributorSidebar.tsx#L49)).
- `aria-invalid` wired on ~65 fields (just needs `aria-describedby` to finish the job — finding 1).
- `aria-sort` on sortable column headers.

---

## Suggested order of work

1. **Finding 1** (`aria-describedby` on `FieldError`) — one shared component, unblocks every form.
2. **Finding 2** (`DialogTitle` in 5 dialogs) — small, removes a class of "unnamed dialog" failures.
3. **Finding 4** (contrast token) — one CSS value, site-wide.
4. **Finding 3** (`contentEditable` roles) — one component.
5. **Findings 5–6** (`h1` + skip link) — small layout changes.
6. Remaining medium/low items as normal backlog.
