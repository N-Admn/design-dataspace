# CivicDataSpace — Accessibility Audit against Design Accessibility Standard v1.2

**Date:** 2026-09-03
**Repo state:** `main` @ `d8f2f67`
**Standard:** WCAG 2.2 Level AA (Layer 1) + CivicDataSpace design requirements (Layers 2–3), per `CivicDataSpace_Design_Accessibility_Standard_v1.2.md`
**Method:** Static source, design-token and accessibility-tree inspection. **No runtime or assistive-technology session was performed** — requirements that depend on rendered behaviour are marked *Needs Runtime Testing* and listed in §5.
**Contrast:** Ratios from hex tokens are computed and **High** confidence. Ratios that depend on an `oklch()` → sRGB browser conversion or alpha compositing are **Medium** and re-listed in §5.

Status vocabulary (§4): `Implemented` · `Partial` · `Not Implemented` · `Needs Runtime Testing` · `Not Applicable`
Confidence (§5): `High` · `Medium` · `Low`
Priority (§6): `P0` impairs access · `P1` significant · `P2` important · `P3` enhancement

---

## 1. Executive summary

CivicDataSpace has a solid foundation — a single canonical token source (`tokens.json` → `src/generated/tokens.css`), Radix primitives under most dialogs / menus / form controls, real landmarks (`header` / `nav` / `main` / `footer`), and status that is never colour-only. The gaps cluster in three areas:

1. **Token contrast values that fail on the surfaces they are actually used on** (not in isolation).
2. **The non-visual layer** — page titles, skip link, error association, live regions, chart alternatives.
3. **Anything not provided for free by Radix** — the focus indicator, the DIV-grid table, custom widgets, reduced motion.

Because so much is centralised, most P0/P1 items are one- or two-file fixes.

### Findings by priority

| P0 | P1 | P2 | P3 |
|---:|---:|---:|---:|
| 3 | 12 | 11 | 5 |

### Findings by status

| Not Implemented | Partial | Needs Runtime | Implemented |
|---:|---:|---:|---:|
| 5 | 13 | 10 | 3 |

### The three P0s

- **FND-13 — Focus indicator below 3:1, invisible on the dark header.** The base rule `outline-ring/50` is the brand navy at 50% alpha ≈ **2.84:1** on white and ≈ **1.31:1** on `--header-background`; several controls (TopNav buttons, footer links, dialog close) have *no* focus style of their own, and the base outline's width is unset. A keyboard user cannot reliably tell where focus is. *A11Y-FOCUS-01 · 2.4.7 / 1.4.11*
- **FND-24 — Charts have no accessible representation.** Bar and line SVGs carry no role, name or text alternative; the pie is `aria-label="Pie chart"` only; the 5-colour series palette (`--chart-1…5`) is a single orange lightness ramp; there is no data-table view. On a civic *data* platform this blocks a core task for non-visual and colour-vision-deficient users. *A11Y-DATA-01 · 1.4.1 / 1.1.1*
- **FND-05 — Form-control & unchecked-checkbox borders ≈ 1.1:1.** `--input` / `--border` (`oklch(0.922)` ≈ `#e3e3e3`) is ~1.13:1 vs the white field fill and ~1.09:1 vs the page background — the control boundary is not identifiable. §9 names input borders and checkboxes explicitly. *A11Y-COLOR-02 · 1.4.11*

### Confirmed strengths

- Canonical `tokens.json`; Tailwind `@theme` generated from it.
- Radix Dialog / Popover / Tooltip / Checkbox / RadioGroup / Label give keyboard operation, focus trap/return, `aria-modal` and title/description wiring for free.
- 56 `aria-label`s on icon-only controls; `sr-only` "Close" on dialogs; `aria-current` on the active nav item; `aria-invalid` on 66 fields; `aria-sort` on sortable headers.
- Status is never colour-only (badges + toasts carry text and usually an icon).
- `TruncatedText` exposes clipped content and becomes focusable when clipped.
- Font loading is resilient (`display=swap`, real system fallback stack); no thin weights used in `src/`.

---

## 2. Parameter coverage

`L1` = WCAG-derived · `L2` = CDS design requirement (per §39, not represented as a WCAG SC).

| Parameter | WCAG | Status | Confidence | Priority | Evidence in brief |
|---|---|---|---|---|---|
| **A11Y-COLOR-01** Text contrast (L1) | 1.4.3 | Partial | High/Med | P1 | Core ink/primary pass; `--success` text ≈ 3.0:1, `--muted-foreground` fails on tints, error-on-tint ≈ 4.0:1 (FND-01/03/04) |
| **A11Y-COLOR-02** Non-text contrast (L1) | 1.4.11 | Not Implemented | High | **P0** | Input/checkbox borders ≈ 1.1:1; focus ring ≈ 2.8:1; chart swatch 1.8:1 (FND-05/13/25) |
| **A11Y-COLOR-03** Colour independence (L1) | 1.4.1 | Implemented | Med | P2 | Badges/toasts/errors carry text + icon. Gap: charts (FND-24) |
| **A11Y-COLOR-04** Link distinction (L1) | 1.4.1 | Not Implemented | High | P1 | Footer/TopNav "links" = `<button>`, same colour as body, no underline (FND-06) |
| **A11Y-TYPE-01** Readable typography (L1+L2) | 1.4.4/.10/.12 | Partial | Med | P2 | 211 `text-xs` incl. essential text; 10–11px in charts (FND-08/09) |
| **A11Y-TYPE-02** Glyph legibility (L2) | — | Partial | Med | P2 | Inter with no `tabular-nums` / slashed-zero in a data-table product (FND-12) |
| **A11Y-TYPE-03** Font weight (L2) | — | Implemented | High | P3 | No `font-light`/`thin` in `src/`; weight 300 loaded but unused (FND-27) |
| **A11Y-TYPE-04** Typographic hierarchy (L1) | 1.3.1/2.4.6 | Partial | Med | P3 | Shared `CardTitle`→`h3` ok; ad-hoc `<p class="font-semibold">` section heads (FND-17) |
| **A11Y-TYPE-05** Text resize 200% (L1) | 1.4.4 | Needs Runtime | Med | P1 | Predictors: `leading-none`, `nowrap`, fixed `h-[88px]`, 188px offset (FND-10/11/14) |
| **A11Y-TYPE-06** Reflow 400% (L1) | 1.4.10 | Needs Runtime | Med | P1 | Dialogs scroll internally (good); fixed chrome offset + fixed-height table card are the risk (FND-14) |
| **A11Y-TYPE-07** Text spacing (L1) | 1.4.12 | Not Implemented | Med | P2 | `leading-none` on shared `CardTitle`/`Label` contradicts the 1.5× override (FND-10) |
| **A11Y-CONTENT-01** Truncation (L2) | 1.4.4/.10 | Partial | High | P2 | `TruncatedText` is correct but only wired in list primary columns; ~61 raw `truncate` elsewhere (FND-15) |
| **Images of text** (L1) | 1.4.5 | Implemented | High | — | Only the logo, with `alt` (FND-28) |
| **A11Y-DATA-01** Data-viz a11y (L1) | 1.4.1 / 1.4.11 / 1.1.1 | Not Implemented | High | **P0** | Single-hue ramp palette; no role/name on SVG charts; no data-table alt (FND-24/25/26) |
| **A11Y-FOCUS-01** Focus appearance (L1) | 2.4.7 / 2.4.11 | Not Implemented | High/Med | **P0** | Base `outline-ring/50` ≈ 2.8:1 white / 1.3:1 dark; some controls no focus style (FND-13) |
| **A11Y-STATE-01** State distinction (L1) | 1.4.1 / 1.4.11 | Partial | Med | P2 | Many hover states ≈ 1.03:1 bg shift; `:active` largely absent (FND-16) |
| **A11Y-KEYBOARD-01** Keyboard (L1) | 2.1.1 / 2.1.2 / 2.4.3 | Needs Runtime | Med | P2 | Radix covers dialogs/menus/controls; custom `TagInput`, DIV-grid table, `TruncatedText` focus need a keyboard pass (FND-22) |
| **A11Y-NAME-01** Accessible names (L1) | 4.1.2 / 2.5.3 | Implemented | Med | P2 | Icon-only buttons labelled; gaps: 2 unlabelled `<nav>`, generic "Pie chart" (FND-23) |
| **A11Y-FORM-01** Forms (L1) | 1.3.1 / 3.3.1–3 | Partial | High | P1 | Labels + `aria-invalid` ok; no `aria-describedby` for errors, no `aria-required`, errors not in a live region (FND-19) |
| **A11Y-DYNAMIC-01** Dynamic feedback (L1) | 4.1.3 | Not Implemented | High | P1 | Only toast has `role="status"` (error toasts should be `alert`); filter/empty/validation/extraction results silent (FND-20) |
| **A11Y-SEMANTIC-01** Structure & landmarks (L1) | 1.3.1 / 2.4.1 / 2.4.2 | Partial | High | P1 | Landmarks present; `<title>` never updates; no skip link; unlabelled navs (FND-18) |
| **A11Y-MODAL-01** Modals & overlays (L1) | 2.4.3 / 4.1.2 / 2.4.11 | Needs Runtime | Med | P2 | Radix Dialog: role, `aria-modal`, trap/return, title/desc wired. Confirm return-focus + not-obscured (FND-29) |
| **A11Y-TABLE-01** Tables (L1) | 1.3.1 | Partial | Med | P2 | ARIA-role DIV grid (not native `<table>`); `aria-sort` ok; no table name; page-change & empty states not announced (FND-30) |
| **A11Y-NON-TEXT-01** Non-text content (L1) | 1.1.1 | Partial | Med | P2 | Logo `alt` ok; only 2 `aria-hidden` in the codebase → decorative SVGs may add noise; charts (FND-31) |
| **A11Y-MOTION-01** Pause/Stop/Hide (L1) | 2.2.2 | Needs Runtime | Low | P3 | 15× `animate-spin`, 1× `animate-pulse`; likely within WCAG exceptions, no pause (FND-32) |
| **A11Y-MOTION-02** Reduced motion (L2) | — | Not Implemented | High | P2 | `prefers-reduced-motion` honoured **0** times; `animate-in/out/spin/pulse` + `tw-animate-css` used widely (FND-32) |

---

## 3. Detailed findings

### Colour & visual distinction

#### FND-01 — `--success` (#46a758) used as text / control label — ≈ 3.0:1

- **Status:** Partial · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-COLOR-01 (L1) · **WCAG:** 1.4.3
- **Where:** `ui/button.tsx:19` (`successOutline` label), `auth/PasswordRequirements.tsx:23`, `*Step3/4Review.tsx`, `dataset/Step2DataFiles.tsx:432` — ~15 sites.
- **Measured:** `#46a758` on `#ffffff` = **3.03:1**; on `bg-success/10` lower. Required 4.5:1.
- **Fix:** Add `--success-text` ≈ `#166534` (7.1:1 on white); keep `#46a758` for ≥3:1 fills / borders / icons. Remap `text-success` and the `successOutline` label.
- **Systemic (§36):** One token, ~15 call-sites — fix at source.

#### FND-02 — "Published" status badge — `bg-success/10 text-success` ≈ 2.7:1

- **Status:** Partial · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-COLOR-01 (L1) · **WCAG:** 1.4.3
- **Where:** `ui/badge.tsx:17` · `shared/StatusBadge.tsx` — the primary status signal in all six management tables.
- **Measured:** `#46a758` on `#ecf6ee` = **2.74:1**, text is 12px. "Draft" badge (navy on pale yellow) ≈ 10.8:1 — inconsistent treatment.
- **Fix:** Recolour the `success` badge variant to `bg-success/15 text-success-text` (FND-01 token). Raise badge text to 13–14px (FND-08).

#### FND-03 — `--muted-foreground` passes only on pure white

- **Status:** Partial · **Confidence:** Medium (`oklch()` render) · **Priority:** P1 · **Standard:** A11Y-COLOR-01 (L1) · **WCAG:** 1.4.3
- **Token:** `oklch(0.556 0 0)` ≈ `#737373`.
- **Measured:** on `#ffffff` ≈ 4.74:1 (pass) · on page bg `#f3f5f8` ≈ **4.34:1** · on `bg-muted` / `bg-muted/40` table headers ≈ **4.4:1** — fail.
- **Reach:** helper text, metadata, timestamps, placeholders, table column headers, Footer, toast description, chart labels.
- **Fix:** Darken to ≈ `oklch(0.50 0 0)` / `#6b6b6b` (≈ 5.3:1 on white, ≈ 4.9:1 on the tints). Runtime-measure on Chromium + WebKit.
- **Systemic (§36):** The most-used non-primary text token.

#### FND-04 — Error text on destructive tint ≈ 4.0–4.3:1

- **Status:** Partial · **Confidence:** Medium · **Priority:** P1 · **Standard:** A11Y-COLOR-01 (L1) · **WCAG:** 1.4.3
- **Where:** `CollaborativePreviewPage:143`, `AIModelPreviewPage:156` (page error banners), `Step2DataFiles:417`, `FieldError` component.
- **Measured:** `text-destructive` on `bg-destructive/10` ≈ **4.06:1** · on `/5` ≈ **4.31:1** · on white ≈ 4.9:1 (no margin).
- **Fix:** Add `--destructive-text` ≈ `#b3261e` (6.5:1 white / 5.5:1 on the /10 tint) for error copy; keep `--destructive` for fills/borders.

#### FND-05 — Form-control & unchecked-checkbox borders ≈ 1.1:1  *(P0)*

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P0 · **Standard:** A11Y-COLOR-02 (L1) · **WCAG:** 1.4.11
- **Token:** `--input` / `--border` = `oklch(0.922)` ≈ `#e3e3e3`.
- **Measured:** border vs white fill = **1.13:1**; white fill vs page bg = **1.09:1**. Required 3:1.
- **Where:** `ui/input`, `ui/textarea`, `ui/checkbox` (unchecked), `ui/searchable-select`, `ui/multi-select-filter`; ManagementTable search field.
- **Finding:** §9 names checkboxes and input borders explicitly. Because the field fill is itself ~1.1:1 against the page, the border *is* the boundary and it is far under 3:1 — the unchecked checkbox and empty text fields are not identifiable. (Checked checkbox `bg-primary` is fine at 11.9:1.)
- **Fix:** Split the token: an interactive `--border-interactive` ≈ `#767d89` (≈ 4.2:1 vs white, 3.8:1 vs page bg) for controls; decorative `--border` hairlines stay as-is.
- **Systemic (§36):** One token behind every form control.

#### FND-06 — Footer & TopNav "links" indistinguishable from body text

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-COLOR-04 (L1) · **WCAG:** 1.4.1
- **Where:** `layout/Footer.tsx` — `FooterLink` = `<button>`, `text-muted-foreground`, no underline; `layout/TopNav.tsx` nav `<button>`s. Button `link` variant exists but is used **0** times.
- **Finding:** "About Us / Privacy / Terms" render in the same colour as the adjacent `·` and `©` text, with only a hover colour change — nothing persistent marks them interactive, and they should be `<a>`.
- **Fix:** Give the `link` variant a persistent underline and adopt it (or real `<a>` elements) in the footer / nav; ensure link colour meets 4.5:1.

#### FND-07 — Success icons sit exactly on the 3:1 non-text threshold

- **Status:** Needs Runtime · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-COLOR-02 (L1) · **WCAG:** 1.4.11
- **Where:** `ui/toast.tsx:54`, `Step3Review.tsx:219`, review checklists.
- **Measured:** `#46a758` on white = **3.03:1** — passes by 0.03; fails on any tinted card.
- **Fix:** Resolved for free by the FND-01 darker-green token; confirm on the actual card surfaces.

### Typography, resize & reflow

#### FND-08 — 12px (`text-xs`) carries essential content in ~211 places

- **Status:** Partial · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-TYPE-01 (L2) · **WCAG:** — (CDS recommendation)
- **Count:** 211 `text-xs` across 65 files.
- **Essential uses:** validation messages (`FieldError`), badge labels, "Original: filename", table metadata, helper text, toast description.
- **Finding:** §13's CDS recommendation puts helper text, labels, table text and button text at ≥14px and reserves 12px for "genuinely secondary" captions. Much of this 12px is primary-task or error content.
- **Fix:** Add a 14px "support" step; move validation, helper, badge and key table metadata to it; keep 12px for timestamps / tertiary chrome.

#### FND-09 — Sub-12px type: `text-[11px]` ×6, `text-[10px]` ×3

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-TYPE-01 (L2)
- **Where:** `ChartPreviewCanvas.tsx` (11px axis/category), `MapChoroplethPreview.tsx:125,133` (10px scale *values*), `ChartStep2Create.tsx:158`, `AIModelVersionsStep.tsx`.
- **Fix:** Raise all arbitrary `text-[10/11px]` to ≥12px; treat chart internals as first-class type.

#### FND-10 — `leading-none` on shared `CardTitle` & `Label` breaks the text-spacing override

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-TYPE-07 (L1) · **WCAG:** 1.4.12
- **Where:** `ui/card.tsx` (`CardTitle: text-base font-semibold leading-none`), `ui/label.tsx` (`leading-none`) — every card header, table title, review-section head, form label.
- **Finding:** §19 requires content to survive a forced line-height of 1.5×. `line-height:1` is the opposite; any title/label that wraps (long name, narrow column, 200% text) collides.
- **Fix:** `leading-tight` (~1.25) minimum on any wrap-capable element; reserve `leading-none` for single-line, size-guaranteed display text.
- **Systemic (§36):** Two primitives, hundreds of instances.

#### FND-11 — `whitespace-nowrap` baked into `buttonVariants` & `badgeVariants`

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-TYPE-05 (L1) · **WCAG:** 1.4.4
- **Where:** `ui/button.tsx:8`, `ui/badge.tsx:6`.
- **Finding:** At 200% text or in a narrow container, button labels overflow / clip and badge labels push out of fixed-width table cells — this is the mechanism behind the "Published / Unsaved" Status-column overlap already seen in this project, which recurs at zoom.
- **Fix:** Remove `whitespace-nowrap` from the base variants; let specific short-label call-sites opt in.
- **Systemic (§36):** Two of the most-used primitives.

#### FND-12 — No numeric / glyph-disambiguation type features for a data-heavy product

- **Status:** Partial · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-TYPE-02 (L2)
- **Observed:** no `font-variant-numeric` and no `font-feature-settings` anywhere in `src/`; Inter's default `1/l/I`, `0/O` are weakly distinguished.
- **Finding:** The platform renders dataset tables, row/column counts, file sizes, IDs, chart values and version strings — exactly §14's "data-heavy interface" case. Columns of digits also don't align (proportional figures).
- **Fix:** Base `font-variant-numeric: tabular-nums` on tables/chart values; enable Inter slashed-zero + disambiguation (`"cv08" "zero"`), or use the mono token in data contexts.

#### FND-14 — Reflow / resize depends on a hard-coded `--layout-chrome-offset: 188px`

- **Status:** Needs Runtime · **Confidence:** Medium · **Priority:** P1 · **Standard:** A11Y-TYPE-05/06 (L1) · **WCAG:** 1.4.4 / 1.4.10
- **Where:** `src/index.css` (`--layout-chrome-offset:188px`), `lib/layout.ts`, `ManagementTable.tsx:515` (fixed-height card), `ContributorSidebar.tsx:91`, `TopNav.tsx` (`h-[88px]`).
- **Finding:** 188px is the sum of a fixed 88px header + 36px breadcrumb + 64px padding. The sidebar and the (now fixed-height) table card are sized to `100vh − 188px`. Under 200% text / 400% zoom the chrome grows but the constant doesn't → the workspace box is mis-sized and internal scroll regions can clip rows / headers / pagination; the `h-[88px]` header can clip its own 28px nav text.
- **Fix:** Measure chrome height at runtime (`ResizeObserver` → CSS var) or flow-size the layout (`min-h`, not fixed `h`; `min-h-[88px]` header). Then run the zoom matrix in §5.
- **Systemic (§36):** One constant feeds the sidebar, all six tables and the dashboard.

#### FND-15 — Truncation: good pattern isn't universal, and its focusable node has no visible focus

- **Status:** Partial · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-CONTENT-01 (L2)
- **Good:** `shared/TruncatedText.tsx` — measures overflow, tooltip only when clipped, `tabIndex=0` when clipped. Used in the 6 list views' primary column.
- **Gaps:** ~61 raw `truncate` without it (TopNav name/email, `FileRow` filenames, chart labels via `title=` only); the `TruncatedText` span sets `outline-none` with no `focus-visible` replacement.
- **Fix:** Add a `focus-visible` ring to `TruncatedText`; extend it to identifier fields (filenames); confirm tooltip content doesn't itself clip at 200%.

### Focus, state & keyboard

#### FND-13 — Focus indicator below 3:1, and invisible on the dark header  *(P0)*

- **Status:** Not Implemented · **Confidence:** High (colour) / Medium (rendered width) · **Priority:** P0 · **Standard:** A11Y-FOCUS-01 (L1) · **WCAG:** 2.4.7 / 1.4.11
- **Where:** base layer `src/index.css` `* { … outline-ring/50 }`; controls without their own `focus-visible:ring-*`: TopNav Search / EXPLORE / `NAV_LINKS` buttons (no focus style at all), Footer links, `dialog.tsx` close.
- **Measured:** `--ring #0b3865` @ 50% alpha over white ≈ **2.84:1**; `--ring` vs `--header-background #0b2540` = **1.31:1**. Outline *width* is not set → rendered visibility unknown.
- **Finding:** §22 says explicitly: do not assume a single global focus token has sufficient contrast on every surface. Here the token equals `--primary` and nearly equals the header, and the base fallback is a half-opacity outline of unset width. A keyboard user tabbing the top nav gets no perceptible focus cue.
- **Fix:** Replace the base rule with a full-opacity, explicit indicator: `*:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`, plus a light-outline variant (`outline-[color:var(--primary-foreground)]`) for the dark header, and add it to the currently-unstyled TopNav buttons. Consider a dual-tone (dark + light) ring token so it survives any surface.
- **Systemic (§36):** One base rule governs focus for the whole app.

#### FND-16 — Hover / pressed states are often a ~1.03:1 background shift only

- **Status:** Partial · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-STATE-01 (L1)
- **Pattern:** many custom `<button>`s: `hover:bg-muted` (≈ 1.03:1 vs white) or `hover:text-foreground` only; `:active` largely absent.
- **Good:** status tabs use a 2px underline + colour; MultiSelectFilter marks selection with a checkmark (non-colour cues ✓).
- **Fix:** Stronger shared hover token (≥ 1.1–1.2:1 shift) + a distinct `:active`; audit any place where `bg-muted` alone means "selected".

#### FND-22 — Custom widgets need a keyboard pass Radix doesn't cover

- **Status:** Needs Runtime · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-KEYBOARD-01 (L1) · **WCAG:** 2.1.1
- **Covered:** Dialog, Popover, Tooltip, Checkbox, RadioGroup, Label — Radix primitives (keyboard, focus order, no trap).
- **Check:** `ui/tag-input.tsx` (custom — add/remove tags, chip `<button>`s), `ManagementTable` DIV-grid (no grid nav; operable via its buttons), `MultiSelectFilter` option list, `TruncatedText` focusable span (no visible focus — FND-15), TopNav nav `<button>`s that have no handler.
- **Fix:** Keyboard-test TagInput (Enter to add, Backspace/Delete to remove, arrow between chips), the filter list, and the table's action buttons. Give TopNav nav items real destinations or make them non-focusable placeholders.

### Structure, names, forms & dynamic feedback

#### FND-18 — No dynamic page title and no skip link

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-SEMANTIC-01 (L1) · **WCAG:** 2.4.2 / 2.4.1
- **Where:** `index.html` `<title>CivicDataSpace</title>` — no `document.title` update anywhere; `App.tsx` has `<main>` but no skip link and no `id` target.
- **Finding:** *2.4.2* — every route (Datasets, a wizard step, a preview, Profile) shows the same tab/title, so a screen-reader or multi-tab user cannot tell pages apart. *2.4.1* — there is no way to bypass the TopNav + sidebar to reach content by keyboard. Landmarks themselves are fine (`header / nav / main / footer`) but the two `<nav>`s (topnav + sidebar) are unlabelled.
- **Fix:** Set `document.title` per route (e.g. a small `useDocumentTitle(pageName)` in each page or a route-config map → `"Datasets · CivicDataSpace"`). Add a visually-hidden-until-focus "Skip to main content" link as the first focusable element, targeting `<main id="main">`. Add `aria-label` to each `<nav>` ("Primary", "Workspace").
- **Systemic (§36):** App-shell behaviour — one place each.

#### FND-19 — Form errors are not programmatically associated with their fields

- **Status:** Partial · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-FORM-01 (L1) · **WCAG:** 3.3.1 / 1.3.1 / 3.3.2
- **Good:** `<Label htmlFor>` ↔ input `id` everywhere; `aria-invalid` on 66 fields.
- **Gap:** `aria-describedby` used **0** times — `ui/field-error.tsx` renders a bare `<p>` with no `id`, not linked to the field and not in a live region. No `aria-required` / `required`; required = a visual `*` only.
- **Finding:** A screen-reader user who focuses an invalid field hears "invalid" but not *why*; on submit, nothing announces which fields failed (ties to FND-20). Required status is invisible to AT.
- **Fix:** Give `FieldError` a stable `id`; wire `aria-describedby={errorId}` on the control when invalid (and to helper text otherwise). Add `aria-required` / native `required`. On submit, move focus to the first invalid field and/or render an error summary with `role="alert"`.
- **Systemic (§36):** Shared `FieldError` + `Input`/`Textarea` — fix the primitives.

#### FND-20 — Dynamic results are not announced (no live regions)

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P1 · **Standard:** A11Y-DYNAMIC-01 (L1) · **WCAG:** 4.1.3
- **Present:** `ui/toast.tsx` — the only `role="status"` in the codebase.
- **Missing:** filter/search result counts ("No datasets match your filters"), table empty states, on-submit validation, platform-extraction success/failure, the "Extract Dataset" loading→result transition, save confirmations beyond the toast.
- **Bug:** error toasts use `role="status"` (polite) — should be `role="alert"` / `aria-live="assertive"`.
- **Fix:** Add a polite live region for result counts / empty states (announce "12 datasets" / "No results" on filter change). Make error toasts assertive. Announce extraction loading + outcome. §27 lists these surfaces explicitly.

#### FND-17 — Some section headings are `<p class="font-semibold">`, not semantic headings

- **Status:** Partial · **Confidence:** Medium · **Priority:** P3 · **Standard:** A11Y-TYPE-04 (L1) · **WCAG:** 1.3.1 / 2.4.6
- **Good:** `CardTitle`→`h3`, `Label`, `DialogTitle` semantic.
- **Gaps:** ad-hoc bold `<p>` heads (Dashboard "Continue Working", review sub-sections, FileDetailsSheet captions); `<h1>` literal appears 19× / `<h2>` 20× across the tree — order per rendered view unverified.
- **Fix:** Promote visual section titles to `h2`/`h3`; verify one `h1` per view and no skipped levels (runtime).

### Modals, tables, non-text & motion

#### FND-29 — Dialogs are built on Radix — role, modality, focus trap/return, title/desc wired

- **Status:** Needs Runtime · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-MODAL-01 (L1) · **WCAG:** 2.4.3 / 4.1.2
- **Where:** `ui/dialog.tsx` — `@radix-ui/react-dialog`: `role="dialog"`, `aria-modal`, Esc, scroll-lock, `aria-labelledby`←`DialogTitle`, `aria-describedby`←`DialogDescription`, `sr-only` "Close".
- **Finding:** Structurally sound. Confirm at runtime: focus lands inside on open, returns to the trigger on close, and the sticky header (FND-13) / drawer doesn't obscure the focused control (2.4.11). Right-drawer uses `h-screen` — check mobile URL-bar clipping.
- **Fix:** No code change expected; add to the AT test pass.

#### FND-30 — Management table is an ARIA-role DIV grid with no accessible name; state changes unannounced

- **Status:** Partial · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-TABLE-01 (L1) · **WCAG:** 1.3.1
- **Where:** `shared/management-table/ManagementTable.tsx` — `role="table/row/columnheader/cell/rowgroup"` on `<div>`s; `aria-sort` on active sortable headers.
- **Gaps:** no `aria-label` / `<caption>` naming the table; ARIA grid on divs is more fragile across SR/browser pairs than native `<table>`; pagination "Page X of Y" and filtered-empty states are visible text but not announced on change.
- **Finding:** Header↔cell relationships are role-mapped (acceptable), but the table has no name, and moving pages / clearing filters produces no non-visual feedback (ties to FND-20).
- **Fix:** Prefer a native `<table>` with `<caption>` / `scope`; if the div-grid stays, add `aria-label` and a polite live region for row-count / page changes. Ensure every sortable header exposes `aria-sort` (not only the active one).
- **Systemic (§36):** One shared component renders all six module tables.

#### FND-24 — Charts: single-hue ramp palette, no role/name on SVGs, no data-table alternative  *(P0)*

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P0 · **Standard:** A11Y-DATA-01 (L1) · **WCAG:** 1.4.1 / 1.1.1
- **Where:** `chart/ChartPreviewCanvas.tsx`, `MapChoroplethPreview.tsx`.
- **Palette:** `--chart-1…5` = `#fdb557` + four `oklch()` steps, all hue ≈ 40–48, decreasing lightness — a sequential ramp used for *categorical* series.
- **Semantics:** bar/line render as bare `<svg>` with no `role`/`aria-label`/`<title>`; pie is `role="img" aria-label="Pie chart"`; no toggle to the underlying data.
- **Finding:** §21 requires that a visualisation communicate its information to non-visual users and that colour not be the sole categorical encoding. Adjacent ramp colours are likely <3:1 from each other; the pie/legend rely entirely on colour to map swatch→label; and there is no textual or tabular equivalent. On a civic-*data* platform this blocks the core task.
- **Fix:** (1) Replace `--chart-2…5` with distinct categorical hues (each ≥3:1 vs white and vs its neighbour; CVD-tested). (2) Add non-colour encoding: direct value labels, optional pattern fills, a "view as table" toggle. (3) Give each chart a real `role="img"` + descriptive `aria-label` summarising the data, or an adjacent visually-hidden data table.
- **Systemic (§36):** Five tokens + one renderer drive every chart.

#### FND-25 — Legend swatches 8–10px; `--chart-1` = 1.8:1 on white; choropleth "no data" ≈ "low value"

- **Status:** Partial · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-DATA-01 (L1) · **WCAG:** 1.4.11
- **Where:** `ChartPreviewCanvas` `size-2 / size-2.5` dots; `MapChoroplethPreview` — low value `color-mix(--primary 12%, --muted)` vs no-data `--muted @ 0.45`; region borders `--border` weight 1 (≈ 1.1:1).
- **Fix:** Border + enlarge swatches to ≥14px; give "no data" a distinct hatch/neutral + a visible legend entry; raise the resting region border to ≥3:1; provide "no data" other than via hover tooltip.

#### FND-31 — Decorative icons largely lack `aria-hidden`; two navs unlabelled

- **Status:** Partial · **Confidence:** Medium · **Priority:** P2 · **Standard:** A11Y-NON-TEXT-01 / A11Y-NAME-01 (L1) · **WCAG:** 1.1.1
- **Observed:** only **2** `aria-hidden` in the whole codebase; lucide renders `<svg>` without `role` so most are ignored by AT — but not guaranteed. Logo has `alt` ✓. Pie `aria-label="Pie chart"` is not descriptive.
- **Fix:** Add `aria-hidden="true"` (or `focusable="false"`) to purely decorative icons via a shared Icon wrapper; label the two `<nav>`s; make chart `aria-label`s describe the data (FND-24).

#### FND-32 — No `prefers-reduced-motion` handling anywhere

- **Status:** Not Implemented · **Confidence:** High · **Priority:** P2 · **Standard:** A11Y-MOTION-02 (L2) · **WCAG:** 2.2.2 (related)
- **Observed:** `prefers-reduced-motion` / `motion-reduce:` — **0** occurrences; in use: `animate-in/out` (dialogs, toasts, popovers), `animate-spin` ×15, `animate-pulse` ×1 (skeleton), `tw-animate-css`.
- **Finding:** §32 (Layer 2) requires respecting the reduced-motion preference. Nothing does. The infinite `animate-spin` / `animate-pulse` also have no pause affordance (2.2.2 — likely within the loading-indicator exception, needs runtime).
- **Fix:** Add a global `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: .01ms !important; transition-duration: .01ms !important } }` and let essential loading states degrade to a static indicator.

### Confirmed as compliant

#### FND-23 — Icon-only controls have accessible names

- **Status:** Implemented · **Confidence:** Medium (needs SR runtime) · **Standard:** A11Y-NAME-01 (L1) · **WCAG:** 4.1.2
- 56 `aria-label`s: FileRow view / edit / delete, `RowActionButton`, TopNav Search, toast Dismiss, sort headers; `DialogClose` has `<span class="sr-only">Close</span>`. `CircleArrow` correctly `aria-hidden`. Minor: chart `aria-label` too generic (FND-24), two navs unlabelled (FND-18).

#### FND-27 — Font loading & weight

- **Status:** Implemented · **Confidence:** High · **Standard:** A11Y-TYPE-03 (L2)
- `display=swap` (no FOIT); real system fallback stack; `font-light`/`font-thin` = **0** in `src/`. Drop the unused 300 weight from the font URL.

#### FND-28 — Images of text

- **Status:** Implemented · **Confidence:** High · **WCAG:** 1.4.5
- Only the logo (`<img … alt="CivicDataSpace">`) — a permitted exception, with a text alternative. All other UI text is real text. Consider an SVG logo for zoom crispness.

---

## 4. Systemic issues & shared-source fixes

Per §36, fix the shared source once rather than patching screens. Ordered by reach.

| Shared source | Issue | Findings | Root fix |
|---|---|---|---|
| `index.css` `@layer base` | Focus indicator `outline-ring/50` ≈ 2.8:1 (1.3:1 on dark), width unset | FND-13 | Full-opacity explicit `:focus-visible` outline + light variant for dark surfaces; also add the reduced-motion media block (FND-32) |
| `tokens.json` | `--success`, `--destructive` not text-safe; `--muted-foreground` fails on tints; `--input` border 1.1:1; `--chart-*` single-hue ramp | FND-01/02/03/04/05/24 | Add `--success-text`, `--destructive-text`, `--border-interactive`; darken `--muted-foreground`; new categorical chart palette |
| `App.tsx` (app shell) | Static `<title>`; no skip link; unlabelled navs | FND-18 | Per-route `document.title`; skip link → `<main id>`; `aria-label` on navs |
| `ui/field-error.tsx` + `input`/`textarea` | Errors not linked (`aria-describedby`=0), no `aria-required`, not announced | FND-19 | `id` on error; wire `aria-describedby` + `aria-required`; on-submit focus / error summary |
| `ui/toast.tsx` + a shared live region | Only polite toast; error toasts polite; filter/empty/validation silent | FND-20 | Assertive error toasts; app-level polite live region for result counts & state changes |
| `ui/button.tsx` · `badge.tsx` | `whitespace-nowrap` in base; `successOutline` label 3.0:1; `link` variant unused / hover-only underline | FND-06/11 | Drop base `nowrap`; fix label token; persistent-underline `link` variant, adopt it |
| `ui/card.tsx` · `label.tsx` | `leading-none` on wrap-capable text | FND-10 | `leading-tight` minimum |
| `ManagementTable.tsx` | DIV-grid, unnamed; fixed-height card (FND-14); state changes unannounced; header contrast (FND-03) | FND-30/14 | Native `<table>`+`caption` or add name + live region; flow height |
| `ChartPreviewCanvas` · `MapChoroplethPreview` | Ramp palette, no role/name/alt, no data-table, 8–11px labels | FND-24/25/09 | Categorical palette + role/label + table alt + ≥12px |
| `shared/TruncatedText.tsx` | `outline-none` on the focusable clipped span | FND-15 | Add `focus-visible` ring; widen adoption |
| a shared Icon wrapper | Decorative icons not `aria-hidden` | FND-31 | Default `aria-hidden`; opt-in label for meaningful icons |

---

## 5. Runtime & assistive-technology validation required

Per §34, a design/code review cannot establish conformance for runtime behaviour. Check on Chromium **and** WebKit; screen-reader pass on NVDA + VoiceOver.

- **Rendered contrast of every `oklch()` token** — `--muted-foreground` (FND-03), `--destructive` on tint (FND-04), `--secondary-foreground`. Sample actual pixels.
- **Focus appearance** — is the base outline even painted (no width set)? Visibility on white cards, the dark header (FND-13), primary buttons, checked checkboxes, the `TruncatedText` span, dialog close.
- **200% text / 400% zoom / 320px** — management table (populated + filtered-empty + empty), a wizard step with validation errors, the FileDetails drawer, the dashboard, a bar + pie + map chart. Watch: title/label overlap (FND-10), button/badge clipping (FND-11), chrome mis-size (FND-14), no 2-D scroll for reading content.
- **WCAG 1.4.12 text-spacing** bookmarklet — 1.5× / 2× / .12× / .16×; no clipping or overlap, especially at `leading-none` and fixed-height spots.
- **Keyboard** — full tab pass of TopNav, sidebar, a wizard, the table (sort, filter popover, row actions, pagination), `TagInput`, `MultiSelectFilter`, all dialogs (open focus, trap, Esc, return focus — FND-29), `RadioGroup`, tabs. No traps; focus order matches visual order.
- **Screen reader** — page title per route (FND-18); skip link; form: label + required + error read on focus and on submit (FND-19); dynamic announcements for filter results, empty states, extraction, save (FND-20); table name + header association + sort state + page changes (FND-30); chart alternative (FND-24); decorative-icon noise (FND-31); dialog name/role.
- **2.4.11 Focus not obscured** — sticky 88px header + sticky sidebar + drawers; scroll a long table with the keyboard and confirm the focused row/control is never fully covered.
- **Chart palette under CVD** — protan/deutan/tritan simulation on multi-series bar, pie, legend; measure adjacent `--chart-n` pairs (FND-24).
- **Choropleth** — can "low value" be told from "no data" without hovering (FND-25)? Region borders visible at rest?
- **Reduced motion** — set the OS preference; confirm `animate-in/spin/pulse` are suppressed or reduced (FND-32).
- **Font fallback** — block `fonts.googleapis.com`; `system-ui` metrics must not clip `h-[88px]` / `h-9` / badges.
- **Browser-specific** — Safari `oklch` + `color-mix` (choropleth), `backdrop-filter`, focus-ring painting; Firefox `:focus-visible` heuristics.

**Cannot be established from the repository at all (Low confidence):** real 2.4.11 obstruction; whether Radix tooltips meet 1.4.13 hoverable/persistent; exact sRGB of every oklch grey per browser; whether the 3 ultra-low-alpha text colours style essential text.

---

## 6. Prioritised remediation plan

### P0 — impairs access, do first (3 findings, ~4 changes)

1. **Focus indicator** (FND-13) — full-opacity dual-tone `:focus-visible` in the base layer; add it to the unstyled TopNav buttons; verify on dark header + primary buttons.
2. **Form-control borders** (FND-05) — `--border-interactive` ≥ 3:1 for inputs, selects, unchecked checkbox.
3. **Chart accessibility** (FND-24) — categorical palette + per-chart `role`/`aria-label` + a "view as table" toggle; adjacent-hue and CVD check.

### P1 — significant (12 findings)

1. App shell (FND-18) — per-route `document.title`; "Skip to main" link; label the navs.
2. Form semantics (FND-19) — `aria-describedby` error linkage in `Input`/`Textarea`/`FieldError`; `aria-required`; on-submit focus / error summary.
3. Live regions (FND-20) — assertive error toasts; polite region for filter counts / empty states / extraction / save.
4. Success + destructive text tokens (FND-01, FND-02, FND-04) — add `--success-text` / `--destructive-text`; remap.
5. Darken `--muted-foreground` (FND-03).
6. Link affordance (FND-06) — persistent-underline `link` variant; adopt in footer / nav; use `<a>`.
7. Reflow constant (FND-14) — remove the 188px magic number; flow-size workspace & table; then run the zoom matrix.
8. `nowrap` / `leading-none` in base primitives (FND-11, FND-10).

### P2 — important (11 findings)

1. 14px "support" type step; move validation / helper / badge / key metadata off 12px (FND-08); raise all `text-[10/11px]` (FND-09).
2. Table semantics (FND-30) — native `<table>`+`caption` or name + live region; `aria-sort` on all sortable headers.
3. Reduced motion (FND-32) — global media query.
4. Decorative-icon `aria-hidden` via a shared Icon wrapper (FND-31).
5. Chart internals (FND-25) — bordered ≥14px swatches, ≥12px labels, "no data" treatment + legend + resting border.
6. `TruncatedText` focus ring + wider adoption (FND-15).
7. Stronger hover / distinct `:active` tokens (FND-16).
8. Numeric type features — `tabular-nums` + slashed-zero (FND-12).
9. Keyboard pass of custom widgets (FND-22); modal AT pass (FND-29).
10. Toast success-icon contrast (FND-07) — resolved by FND-01; confirm.

### P3 — enhancement (5 findings)

1. Promote ad-hoc `<p>` section headers to real headings; verify order (FND-17).
2. 2.2.2 pause affordance for infinite spin/pulse where not covered by the loading exception (FND-32).
3. Drop unused Inter weight 300 from the font URL (FND-27).
4. SVG logo (FND-28).
5. TopNav nav buttons — real destinations or non-focusable placeholders (FND-22).

---

## 7. Top 10 actions — by user impact & systemic reach

Ordered so each step clears the most failing surfaces per unit of work. Seven are single-file changes in the app shell, base CSS, or `tokens.json`.

1. **Rebuild the focus indicator as a full-opacity, surface-independent token.** Every keyboard user, every screen. Base `outline-ring/50` is ~2.8:1 on white, ~1.3:1 on the dark header, and several controls have no focus style at all. One rule in `index.css`. — *FND-13 · A11Y-FOCUS-01 · 2.4.7 / 1.4.11 · P0*
2. **Give the SPA a per-route page title and a skip link.** Screen-reader and multi-tab users currently cannot tell any two pages apart or bypass the nav. Two small additions in the app shell. — *FND-18 · A11Y-SEMANTIC-01 · 2.4.2 / 2.4.1 · P1*
3. **Wire form errors to their fields and announce validation.** `aria-describedby` is used nowhere; a screen-reader user can't tell why a field is invalid or what failed on submit. Fix in `Input`/`Textarea`/`FieldError` + one submit pattern. — *FND-19 · A11Y-FORM-01 · 3.3.1 / 1.3.1 · P1*
4. **Make charts perceivable without colour or sight.** Single-hue ramp palette, no role/name on SVGs, no data-table view — blocks a core task on a data platform. New palette + `role`/`aria-label` + table toggle in one renderer. — *FND-24/25 · A11Y-DATA-01 · 1.4.1 / 1.1.1 · P0*
5. **Give form controls a ≥ 3:1 border token.** Inputs, selects, textareas, unchecked checkboxes across the product have a ~1.1:1 boundary. One interactive-border token in `tokens.json`. — *FND-05 · A11Y-COLOR-02 · 1.4.11 · P0*
6. **Add a polite live region + assertive error toasts.** Filtering, empty states, extraction and save produce no non-visual feedback today. One app-level region + a role change. — *FND-20 · A11Y-DYNAMIC-01 · 4.1.3 · P1*
7. **Add `--success-text` / `--destructive-text`; darken `--muted-foreground`.** Three token edits clear the "Published" badge (2.7:1), ~15 green-text spots, page-level error banners (4.0:1) and all secondary text on tinted surfaces. — *FND-01/02/03/04 · A11Y-COLOR-01 · 1.4.3 · P1*
8. **Kill the 188px chrome constant; flow-size the workspace and tables.** 200% resize and 400% reflow currently rest on fixed header/breadcrumb heights. Affects the sidebar, all six tables, the dashboard. — *FND-14 · A11Y-TYPE-05/06 · 1.4.4 / 1.4.10 · P1*
9. **Remove `whitespace-nowrap` from button/badge base; relax `leading-none`; add reduced-motion.** Three lines across four shared files: fixes label clipping / badge overflow at zoom, title-label overlap under the 1.4.12 override, and the total absence of `prefers-reduced-motion`. — *FND-10/11/32 · A11Y-TYPE-05/07, A11Y-MOTION-02 · P1/P2*
10. **Establish one "text link" affordance; give the table a name; icons `aria-hidden`.** Footer/nav links are invisible as links; the management table has no accessible name; decorative SVGs aren't hidden. Small shared-component changes. — *FND-06/30/31 · A11Y-COLOR-04, A11Y-TABLE-01, A11Y-NON-TEXT-01 · P1/P2*

---

## Suggested replacement token values (for reference)

Computed against the WCAG relative-luminance formula.

| New / changed token | Value | Contrast |
|---|---|---|
| `--success-text` (new) | `#166534` | 7.1:1 on white · 6.5:1 on `bg-success/10` |
| `--destructive-text` (new) | `#b3261e` | 6.5:1 on white · 5.5:1 on `bg-destructive/10` |
| `--border-interactive` (new) | `#767d89` | 4.2:1 vs white field · 3.8:1 vs page bg |
| `--muted-foreground` (darken) | `oklch(0.50 0 0)` ≈ `#6b6b6b` | 5.3:1 white · 4.9:1 page bg · 4.95:1 `bg-muted` |
| `--chart-1…5` (recolour) | distinct categorical hues, e.g. `#1f6feb` `#e8710a` `#1c7a41` `#8250df` `#b3261e` | each ≥ 3:1 vs white; verify adjacent pairs + CVD |

---

*Audit scope excludes items outside Standard v1.2's parameter set. CDS Layer-2 requirements are labelled `L2` and are not represented as WCAG Success Criteria (§39). Static analysis only — see §5 for what must still be checked at runtime.*
