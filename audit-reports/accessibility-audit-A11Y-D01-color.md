# A11Y-D01 — Color Accessibility Audit

**Scope:** WCAG 2.2 Level AA — colour only (contrast, non-text contrast, colour independence, focus appearance, interaction states, charts).
**Target:** CivicDataSpace prototype, `main` @ `d8f2f67` + uncommitted working tree (dashboard / filter / file-details work).
**Method:** Static inspection of `tokens.json`, `src/generated/tokens.css`, `src/index.css`, shared UI components, layout, charts. Contrast computed with the WCAG relative-luminance formula.
**Audit only — no files were modified. No specific replacement colours are prescribed.**

**Confidence key:**

- **Measured** — both colours are hex literals; ratio computed directly. High confidence.
- **Derived** — one colour is `oklch()` or an alpha composite; ratio computed from a standard sRGB approximation. Medium confidence — flagged for rendered validation in §7.
- **Unverified** — cannot be established from static inspection.

This audit does **not** establish WCAG compliance. It establishes a list of measurable colour issues for the design team to review.

---

## 1. Executive Summary

**Overall result:** The prototype has a coherent, centralised token system, which is good news — nearly every colour issue traces to a small number of shared tokens and component variants, so remediation is systemic rather than per-screen. However, several of those shared decisions fail WCAG 2.2 AA on the surfaces where they are actually used.

**Findings by status (17 findings):**

| Status | Count |
|---|---:|
| PASS | 0 findings (passing patterns catalogued in §6) |
| PARTIAL | 7 |
| FAIL | 6 |
| UNVERIFIED | 4 |

**Findings by priority:**

| Priority | Count |
|---|---:|
| P0 | 2 |
| P1 | 7 |
| P2 | 6 |
| P3 | 2 |

**Major systemic issues:**

1. **`--input` / control-boundary token ≈ 1.1:1** — form fields, unchecked checkboxes and unchecked radios have no perceptible boundary. (F01)
2. **Base focus indicator `outline-ring/50` ≈ 2.8:1 on white, ≈ 1.3:1 on the dark header** — the app-wide default focus treatment is below 3:1, and its outline width is not even set. (F02, F03)
3. **`--muted-foreground` clears 4.5:1 only on pure white** — it fails on the page background, `bg-muted`, tinted surfaces and table headers, where a large share of its 455 uses actually sit. (F04)
4. **`--success` used as text / label colour ≈ 3.0:1** — including the "Published" status badge (≈ 2.7:1), which is the primary status signal in every management table. (F05, F06)
5. **Error text on destructive-tinted backgrounds ≈ 4.0:1** — page-level error banners. (F07)
6. **Footer / top-nav "links" have no persistent non-colour cue** and also fail text contrast. (F08)
7. **Chart categorical palette is a single-hue orange ramp** with no measured separation between adjacent series and no non-colour encoding. (F09)

**Overall assessment:** Not compliant with WCAG 2.2 AA for colour as currently implemented. The failures are concentrated in ~6 shared tokens/components; fixing those tokens and variants would clear the majority of findings at once. Passing patterns (primary text, most button variants, the Draft badge, checked controls, toast state treatment) are solid and should be preserved.

---

## 2. Accessibility Scorecard

Counts are of **distinct evaluated pairings / patterns**, not raw occurrences.

| Category | Pass | Partial | Fail | Unverified |
|---|---:|---:|---:|---:|
| Text contrast | 8 | 3 | 3 | 1 |
| Large text | 3 | 1 | 0 | 0 |
| UI / non-text contrast | 2 | 1 | 2 | 1 |
| Meaningful graphics | 1 | 2 | 0 | 1 |
| Colour independence | 6 | 2 | 1 | 0 |
| Focus appearance | 1 | 0 | 2 | 2 |
| Interaction states | 4 | 2 | 0 | 1 |
| Charts / data visualization | 0 | 3 | 0 | 1 |

---

## 3. Critical Findings

Priority: **P0** critical blocker · **P1** high · **P2** medium · **P3** low.

---

### A11Y-D01-F01

**Title:** Form-control boundary contrast — `--input` / `--border` ≈ 1.1:1

**Category:** UI / non-text contrast

**Priority:** P0

**Status:** FAIL

**WCAG:** 1.4.11 Non-text Contrast (AA)

**Current implementation:** Text inputs, textareas, unchecked checkboxes, unchecked radios and select-style triggers draw their boundary with `border border-input` (or `border-border`). `--input` and `--border` both resolve to `oklch(0.922 0 0)`. The field fill is `bg-background` (white); the surrounding page is `--page-background` `#f3f5f8`.

**Actual measurement:**
- Foreground (border): `oklch(0.922 0 0)` ≈ `#e3e3e3`
- Background (field fill): `#ffffff`
- Contrast: **1.13:1** — *Derived*
- Background (page): `#f3f5f8`; white field on page ≈ **1.09:1** — *Derived*
- Required: 3:1
- Result: **FAIL**
- Checked/selected state (`data-[state=checked]:bg-primary` / `border-primary`): `#0b3865` on white ≈ **11.9:1** — PASS

**Affected components:** `ui/input.tsx`, `ui/textarea.tsx`, `ui/checkbox.tsx` (unchecked), `ui/radio-group.tsx` (unchecked), `ui/searchable-select.tsx`, `ui/multi-select-filter.tsx`, `ui/multi-select.tsx`, `ui/tag-input.tsx`, the search field in `shared/management-table/ManagementTable.tsx`.

**Affected screens/locations:** Every form in the product — dataset/event/use-case/AI-model/chart/collaborative creation wizards, auth pages, profile, all filter popovers, all management-table search bars.

**Occurrences:** `border-input` — 25 occurrences; `border-border` — 185 occurrences (a large subset of which are decorative card/table hairlines that are out of scope for 1.4.11; the control-boundary subset is the concern).

**Why it matters:** 1.4.11 explicitly covers "the visual information required to identify … form controls and their states" and names checkboxes. Because the white field fill is itself only ~1.1:1 against the page background, the border *is* the only boundary — and it is far below 3:1. Low-vision users cannot reliably locate empty fields or tell a checked box from an unchecked one at a glance.

**Recommended ACTION TYPE:** Colour token adjustment (an interactive-boundary value distinct from the decorative hairline value) + component variant review for checkbox/radio unchecked states.

---

### A11Y-D01-F02

**Title:** App-wide default focus indicator is below 3:1 (`outline-ring/50`)

**Category:** Focus

**Priority:** P0

**Status:** FAIL (colour) / UNVERIFIED (rendered width)

**WCAG:** 2.4.7 Focus Visible (AA), 1.4.11 Non-text Contrast (AA)

**Current implementation:** `src/index.css`, `@layer base`:
`* { @apply border-border outline-ring/50; }` — the global default focus outline is `--ring` at 50% alpha. `--ring` = `#0b3865` (identical to `--primary`). No `outline-width` or `outline-style` is set anywhere in the base layer, so the rendered outline relies on the user-agent default width. 14 components override this with their own `focus-visible:ring-2 ring-ring`; everything else uses the base treatment.

**Actual measurement:**
- Foreground (outline): `#0b3865` at 50% alpha over white ≈ `#859cb2`
- Background: `#ffffff`
- Contrast: **2.84:1** — *Derived*
- Required: 3:1
- Result: **FAIL** on the colour value; **UNVERIFIED** whether the outline renders at a usable width at all (width/style unset).

**Affected components:** All focusable elements without an explicit `focus-visible` rule — `layout/TopNav.tsx` (Search, EXPLORE, nav-link buttons, mobile-menu trigger), `layout/Footer.tsx` (`FooterLink`), `ui/dialog.tsx` close button, `shared/TruncatedText.tsx` focusable span, numerous hand-rolled `<button>`s across step panels and cards.

**Affected screens/locations:** Global.

**Occurrences:** One base rule; `focus-visible:ring-ring` overrides exist in 14 places (so the fallback governs a large majority of controls).

**Why it matters:** The single global focus colour is used on every surface. At 50% alpha it does not reach 3:1 even on white, and the missing outline width makes the rendered result unpredictable.

**Recommended ACTION TYPE:** Focus treatment adjustment (opacity/width of the base indicator) + runtime validation of rendered focus.

---

### A11Y-D01-F03

**Title:** Focus indicator not distinguishable on the dark header surface

**Category:** Focus

**Priority:** P1

**Status:** FAIL

**WCAG:** 2.4.7 Focus Visible (AA), 1.4.11 Non-text Contrast (AA)

**Current implementation:** `--ring` (`#0b3865`) is the focus colour on every surface. The top navigation bar is `--header-background` `#0b2540`. Focusable controls in the header either have no `focus-visible` rule (Search, EXPLORE, nav links) or use `focus-visible:ring-2 ring-ring` (the user-menu avatar, which additionally sets `ring-offset-2` with a light offset that partially rescues it).

**Actual measurement:**
- Foreground (ring): `#0b3865`
- Background (header): `#0b2540`
- Contrast: **1.31:1** — *Measured*
- Required: 3:1
- Result: **FAIL**
- Same ring on white (where overridden): `#0b3865` on `#ffffff` ≈ **11.9:1** — PASS

**Affected components:** `layout/TopNav.tsx` (all focusable controls).

**Affected screens/locations:** Global header.

**Occurrences:** ~5 focusable controls in the header.

**Why it matters:** §22 of the CDS standard and WCAG both require the focus indicator to work against every surface it can appear on. Navy-on-navy is effectively invisible.

**Recommended ACTION TYPE:** Focus treatment adjustment (surface-aware focus indicator).

---

### A11Y-D01-F04

**Title:** `--muted-foreground` fails 4.5:1 on every non-white surface it is used on

**Category:** Text contrast

**Priority:** P1

**Status:** PARTIAL

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** `--muted-foreground` = `oklch(0.556 0 0)` is the standard colour for secondary text: helper text, metadata, timestamps, table column headers, placeholder text, footer text, toast descriptions, chart labels, empty-state copy, "Original: <filename>", the stepper's inactive labels, breadcrumb-adjacent text. The app body sits on `--page-background` `#f3f5f8`; many sub-surfaces are `bg-muted` (`oklch(0.97)`), `bg-muted/40` (table headers), `bg-secondary` or tinted cards.

**Actual measurement:**
- Foreground: `oklch(0.556 0 0)` ≈ `#737373`
- On `#ffffff`: **4.74:1** — PASS (no margin) — *Derived*
- On `#f3f5f8` (page background): **4.34:1** — **FAIL** — *Derived*
- On `#f7f7f7` (`bg-muted`): **4.40:1** — **FAIL** — *Derived*
- On `bg-muted/40` over white (≈ `#fafafa`): **≈ 4.4:1** — **FAIL** — *Derived*
- Required: 4.5:1
- Result: **PARTIAL** (passes only on pure-white cards)

**Affected components:** ~85 files. Core carriers: `shared/management-table/ManagementTable.tsx` (column headers on `bg-muted/40`), `ui/field-error.tsx` context, `ui/stepper.tsx`, `layout/Footer.tsx`, `ui/toast.tsx`, `components/chart/*`, all `*Review` and `*Step*` panels, `DashboardPage.tsx`.

**Affected screens/locations:** Nearly every screen.

**Occurrences:** `text-muted-foreground` — **455 occurrences across 85 files**. `placeholder:text-muted-foreground` — 15.

**Why it matters:** This is the single most-used secondary-text token. Much of its content is meaningful for operating the interface (table headers, form helper text, file metadata, filter result context), so the reduced-contrast exemption reasoning does not apply. The exact ratio depends on the browser's `oklch()` rendering — hence PARTIAL / Derived, not FAIL — but the direction is consistent across every off-white surface.

**Recommended ACTION TYPE:** Colour token adjustment (evaluate the token against the actual surfaces, not `#fff`) + rendered validation (§7).

---

### A11Y-D01-F05

**Title:** `--success` used as text / control-label colour ≈ 3.0:1

**Category:** Text contrast

**Priority:** P1

**Status:** FAIL

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** `--success` = `#46a758`. It is used directly as `text-success` for: the `successOutline` button variant's label (`ui/button.tsx`), password-rule "met" state (`auth/PasswordRequirements.tsx`), review-readiness text (`*Step3Review` / `*Step4Review`), the "extracted" confirmation line in `dataset/Step2DataFiles.tsx`, and success message blocks in step panels.

**Actual measurement:**
- Foreground: `#46a758`
- Background: `#ffffff`
- Contrast: **3.03:1** — *Measured*
- On `bg-success/10` (≈ `#ecf6ee`): **2.74:1** — *Derived*
- Required: 4.5:1 (normal text) / 3:1 (large text)
- Result: **FAIL** for normal text; the `successOutline` label and most usages are 14px or smaller.

**Affected components:** `ui/button.tsx` (`successOutline` variant), `auth/PasswordRequirements.tsx`, `chart/ChartStep3Review.tsx`, `ai-model/AIModelStep3Review.tsx`, `collaborative/CollaborativeStep3Content.tsx` + Step4, `usecase/UseCaseStep4Review.tsx`, `dataset/Step2DataFiles.tsx`, `layout/HelpSupportPanel.tsx`, `ai-model/AIModelVersionsStep.tsx`.

**Affected screens/locations:** Registration, all six creation-flow review steps, dataset data-files step, AI-model versions.

**Occurrences:** `text-success` — 28 occurrences (mix of text and icons; ~15 are text).

**Why it matters:** Success confirmations and a control label ("Add"/"Publish"-style `successOutline` button) render below the text-contrast minimum. Where an icon accompanies the text, the *meaning* is not colour-only (§C is satisfied), but the text itself is still sub-threshold.

**Recommended ACTION TYPE:** Background/foreground pairing adjustment (a text-weight success value, separate from the ≥3:1 fill/icon/border value) — team decides the value.

---

### A11Y-D01-F06

**Title:** "Published" status badge — `bg-success/10` + `text-success` ≈ 2.7:1

**Category:** Text contrast

**Priority:** P1

**Status:** FAIL

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** `ui/badge.tsx` `success` variant = `border-transparent bg-success/10 text-success`. `shared/StatusBadge.tsx` renders `Published` with this variant and `Draft` with the `warning` variant (`bg-warning/20 text-warning-foreground`). Badge text is `text-xs` (12px).

**Actual measurement:**
- Foreground: `#46a758`
- Background: `#46a758` at 10% over white ≈ `#ecf6ee`
- Contrast: **2.74:1** — *Derived*
- Required: 4.5:1 (12px normal text)
- Result: **FAIL**
- "Draft" badge for comparison: `#0b3865` on `#fff3d8` (`bg-warning/20`) ≈ **10.8:1** — PASS

**Affected components:** `ui/badge.tsx` (`success` variant), `shared/StatusBadge.tsx`.

**Affected screens/locations:** All six management tables (Datasets, Events, Use Cases, AI Models, Charts, Collaboratives) status column; anywhere `StatusBadge` renders "Published".

**Occurrences:** `bg-success/10` — 11 occurrences; the badge variant is the highest-visibility one.

**Why it matters:** This is the primary at-a-glance lifecycle signal across the product, and one of its two states is unreadable-grade while the other passes comfortably — an inconsistent, failing pairing. The word "Published" is present, so 1.4.1 (colour independence) is satisfied; the contrast is the issue.

**Recommended ACTION TYPE:** Component variant adjustment (the `success` badge tint/text pairing).

---

### A11Y-D01-F07

**Title:** Error text on destructive-tinted backgrounds ≈ 4.0:1

**Category:** Text contrast

**Priority:** P1

**Status:** PARTIAL

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** Page-level and inline error banners use `text-destructive` text on `bg-destructive/10` or `bg-destructive/5` fills with a `border-destructive/30–40` border. `--destructive` = `oklch(0.577 0.245 27.325)`.

**Actual measurement:**
- Foreground: `oklch(0.577 0.245 27.325)` ≈ `#d72d2f`
- On `bg-destructive/10` (≈ `#faeaea`): **≈ 4.06:1** — **FAIL** — *Derived*
- On `bg-destructive/5` (≈ `#fdf4f4`): **≈ 4.31:1** — **FAIL** — *Derived*
- On `#ffffff`: **≈ 4.9:1** — PASS but no margin — *Derived*
- Required: 4.5:1
- Result: **PARTIAL** (passes on plain white with no headroom; fails on the tint)

**Affected components:** `pages/CollaborativePreviewPage.tsx:143`, `pages/AIModelPreviewPage.tsx:156`, `dataset/Step2DataFiles.tsx:417`, `collaborative/CollaborativeStep3Content.tsx`, `ui/field-error.tsx` when rendered inside a tinted container.

**Affected screens/locations:** Collaborative preview, AI-model preview, dataset data-files extraction errors, step-panel error blocks.

**Occurrences:** `bg-destructive/10` — 19; `bg-destructive/5` — 2. Not all carry `text-destructive` copy (many are hover states); the text-on-tint pattern appears in ~4–6 banner locations.

**Why it matters:** Error copy is essential content. On the tinted background the ratio drops below 4.5:1, and even the plain-white case has zero margin against `oklch()` rendering variance.

**Recommended ACTION TYPE:** Background/foreground pairing adjustment (error text vs tint) + rendered validation (§7).

---

### A11Y-D01-F08

**Title:** Footer and top-nav "links" are not visually distinguishable as links

**Category:** Colour independence / Link distinction

**Priority:** P1

**Status:** FAIL

**WCAG:** 1.4.1 Use of Color (A)

**Current implementation:** `layout/Footer.tsx` `FooterLink` is a `<button>` styled `text-muted-foreground transition-colors hover:text-foreground` — no underline, no distinct colour, no border. It sits inline with `·` separators and `© …` text rendered in the same `text-muted-foreground`. `layout/TopNav.tsx` renders the primary nav items ("EXPLORE", "COLLABORATIVES", "CONTRIBUTORS", "ABOUT US") as `<button>`s with only a hover colour change. `ui/button.tsx` has a `link` variant (`text-primary underline-offset-4 hover:underline`) but it is used **0 times**.

**Actual measurement:**
- Link vs surrounding text: **no persistent difference** (same colour, no underline) — the only distinction is a hover-time colour change, which is not perceivable without pointing at each item.
- Footer link text contrast also inherits F04: `#737373` on the footer surface (`#f3f5f8`) ≈ **4.34:1** — FAIL.

**Affected components:** `layout/Footer.tsx`, `layout/TopNav.tsx`. Also note: the unused `link` button variant's underline is hover-only, so adopting it as-is would not fully resolve this.

**Affected screens/locations:** Global footer (About Us / Contact Us / Privacy / Terms / Legal), global header nav.

**Occurrences:** ~5 footer links + ~4 header nav items.

**Why it matters:** A user cannot tell these are interactive. 1.4.1 requires a persistent non-colour (or sufficiently distinct colour) cue for links in text.

**Recommended ACTION TYPE:** Link distinction adjustment (persistent cue) + colour pairing adjustment (link text contrast).

---

### A11Y-D01-F09

**Title:** Chart categorical palette is a single-hue lightness ramp; series depend on colour alone

**Category:** Charts / data visualization

**Priority:** P1

**Status:** PARTIAL / UNVERIFIED

**WCAG:** 1.4.1 Use of Color (A), 1.4.11 Non-text Contrast (AA)

**Current implementation:** `--chart-1…5` = `#fdb557`, `oklch(0.705 0.213 47.604)`, `oklch(0.646 0.222 41.116)`, `oklch(0.553 0.195 38.402)`, `oklch(0.47 0.157 37.304)` — all hue ≈ 40–48, monotonically decreasing lightness (a sequential ramp). `components/chart/ChartPreviewCanvas.tsx` maps series to `SERIES_COLORS = [var(--chart-1) … var(--chart-5)]` for bar fills, pie slices and legend swatches (`size-2` / `size-2.5` dots). Bar categories are also labelled on the x-axis; pie slices are not directly labelled; the line chart uses a single `var(--primary)` series.

**Actual measurement:**
- `--chart-1` swatch `#fdb557` on chart background `#ffffff`: **1.76:1** — **FAIL** for a meaningful graphical object (1.4.11, where applicable) — *Measured*
- Adjacent series separation (`--chart-2` vs `--chart-3`, `--chart-3` vs `--chart-4`, `--chart-4` vs `--chart-5`): **Unverified** — all `oklch()`; visually a close lightness ramp, likely < 3:1 between neighbours, requires rendered measurement + CVD simulation.
- Pie/legend: mapping a swatch to its label is **colour-only** (legend text exists, but slice→label matching relies on distinguishing the colours).

**Affected components:** `components/chart/ChartPreviewCanvas.tsx`, `components/chart/ChartListView.tsx` (type icons aside), tokens `--chart-1…5`.

**Affected screens/locations:** Chart creation preview (bar / pie), chart review step, any embedded chart preview.

**Occurrences:** 5 tokens + 1 shared renderer.

**Why it matters:** Categorical data encoded on one hue at graded lightness is hard to separate for low-vision and colour-vision-deficient users, and there is no supplementary cue (pattern, direct label, shape). The amber swatch also fails non-text contrast on white.

**Recommended ACTION TYPE:** Chart palette adjustment + additional non-colour cue required + rendered/CVD validation (§7).

---

### A11Y-D01-F10

**Title:** Choropleth — "no data" not distinguishable from a low-value category; region borders ≈ 1.1:1

**Category:** Charts / data visualization / Colour independence

**Priority:** P2

**Status:** PARTIAL

**WCAG:** 1.4.1 Use of Color (A), 1.4.11 Non-text Contrast (AA)

**Current implementation:** `components/chart/MapChoroplethPreview.tsx` — regions with data are filled `color-mix(in srgb, var(--primary) 12%…90%, var(--muted))` (a light-to-dark navy ramp); "no data" regions are filled `var(--muted)` at `fillOpacity: 0.45`. Region outlines are `var(--border)` at `weight: 1`. On hover the outline becomes `var(--primary)` at `weight: 2.5` and a tooltip shows the value or "No data available".

**Actual measurement:**
- Lowest data fill (`--primary` 12% over `--muted`) vs "no data" fill (`--muted` @ 45%): **near-identical** — both resolve to a very pale near-white; difference is essentially opacity. — *Derived*
- Resting region border `var(--border)` (`#e3e3e3`) vs adjacent pale fills: **≈ 1.1:1** — *Derived* — FAIL for a boundary that carries meaning (which region is which).
- "No data" as text: only in the hover tooltip (pointer-dependent).

**Affected components:** `components/chart/MapChoroplethPreview.tsx`.

**Affected screens/locations:** Map chart preview / review.

**Occurrences:** 1 component.

**Why it matters:** A genuine low value reads as missing data; region boundaries are barely visible at rest; the only "no data" label is hover-only.

**Recommended ACTION TYPE:** Chart palette adjustment (distinct no-data treatment) + non-colour cue for no-data + boundary contrast review.

---

### A11Y-D01-F11

**Title:** Chart / map internal labels — small size and borderline contrast

**Category:** Text contrast (chart labels)

**Priority:** P2

**Status:** PARTIAL

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** `components/chart/ChartPreviewCanvas.tsx` axis and category labels use `text-[11px] text-muted-foreground`; `components/chart/MapChoroplethPreview.tsx` scale-value labels use `text-[10px]` (some `text-foreground`, some `text-muted-foreground`). Category labels are also `truncate`d with a `title=` attribute as the only full-text affordance.

**Actual measurement:**
- `text-muted-foreground` at 10–11px on `#ffffff`: **≈ 4.74:1** — *Derived* — borderline PASS on white, FAIL on any chart tint (inherits F04).
- `text-foreground` scale values on white: **≈ 15:1** — PASS (contrast); size is the concern.
- Size 10–11px is below the CDS 12px floor for meaningful data labels (informational, not a WCAG minimum).

**Affected components:** `components/chart/ChartPreviewCanvas.tsx`, `components/chart/MapChoroplethPreview.tsx`, `components/chart/ChartStep2Create.tsx` (10px chip).

**Affected screens/locations:** Chart / map previews.

**Occurrences:** `text-[11px]` — 6; `text-[10px]` — 3.

**Why it matters:** Quantitative labels (scale values, category names) at 10–11px in borderline-contrast grey, recoverable only by mouse hover when truncated.

**Recommended ACTION TYPE:** Background/foreground pairing adjustment (chart label colour) — size is a typography concern outside this parameter but noted.

---

### A11Y-D01-F12

**Title:** Hover / pressed interaction states rely on a ~1.03:1 background shift

**Category:** Interaction states

**Priority:** P2

**Status:** PARTIAL

**WCAG:** 1.4.11 Non-text Contrast (AA) — where the state is meaningful; 1.4.1 where the state is the only "current/selected" cue

**Current implementation:** Many hand-rolled `<button>`s and the ghost/outline button variants use `hover:bg-muted` as the only hover cue. Management-table rows use `hover:bg-muted/30`. The button primary variant uses `hover:bg-primary/90`. `:active` / pressed states are not defined anywhere. Disabled uses `disabled:opacity-50`.

**Actual measurement:**
- `hover:bg-muted` (`#f7f7f7`) vs `bg-background` (`#ffffff`): **≈ 1.03:1** — *Derived* — barely perceptible.
- `hover:bg-muted/30` on white: **≈ 1.02:1** — *Derived*.
- `hover:bg-primary/90` vs `bg-primary`: navy → marginally lighter navy; white label stays ≈ 10:1 either way. Perceptible change is minimal.
- `:active` — no measurable value (state absent).
- `disabled:opacity-50` — disabled has a WCAG contrast exception; noted, not scored as FAIL.

**Affected components:** `ui/button.tsx` (`ghost`, `outline`), `shared/management-table/ManagementTable.tsx` (row hover), numerous custom buttons in step panels, `DashboardPage.tsx` cards (`hover:border-primary/40` — a border shift, more perceptible).

**Affected screens/locations:** Global.

**Occurrences:** Not precisely determinable; `hover:bg-muted` and `hover:bg-muted/*` appear widely.

**Why it matters:** A ~1.03:1 change is at the threshold of perceptibility. Where the same class is also the only "selected/current" indication, it edges into 1.4.1.

**Recommended ACTION TYPE:** State treatment adjustment (stronger hover delta, define `:active`) + review any place where `bg-muted` alone signals "selected".

---

### A11Y-D01-F13

**Title:** Success / meaningful icons sit exactly on the 3:1 non-text threshold

**Category:** Meaningful graphics

**Priority:** P2

**Status:** PARTIAL

**WCAG:** 1.4.11 Non-text Contrast (AA)

**Current implementation:** `text-success` (`#46a758`) is used for meaningful icons: `CheckCircle2` in `ui/toast.tsx` (success variant), `dataset/Step3Review.tsx` uploaded-file rows, review checklists across modules.

**Actual measurement:**
- Foreground: `#46a758`
- Background: `#ffffff` (`bg-card`)
- Contrast: **3.03:1** — *Measured*
- Required: 3:1
- Result: **PARTIAL** — passes by 0.03; drops below 3:1 on any non-white card surface.

**Affected components:** `ui/toast.tsx`, `dataset/Step3Review.tsx`, `*Step3/4Review.tsx`.

**Affected screens/locations:** Toasts, all review steps.

**Occurrences:** ~13 (the icon subset of the 28 `text-success` uses).

**Why it matters:** Zero margin; any surface tint or `oklch()` rendering variance pushes it under 3:1.

**Recommended ACTION TYPE:** Colour token adjustment (same review as F05 — a success value with margin at ≥3:1).

---

### A11Y-D01-F14

**Title:** Focus ring merges with fill on filled controls (no offset)

**Category:** Focus

**Priority:** P2

**Status:** UNVERIFIED

**WCAG:** 2.4.7 Focus Visible (AA)

**Current implementation:** `ui/checkbox.tsx`, `ui/input.tsx`, `ui/searchable-select.tsx`, `ui/multi-select-filter.tsx` use `focus-visible:ring-2 ring-ring` with **no `ring-offset`**. When a checkbox is checked its fill becomes `bg-primary` (`#0b3865`) — the same colour as `ring-ring`. `ui/button.tsx` does set `focus-visible:ring-offset-2` (default white offset), which mitigates this for buttons.

**Actual measurement:**
- Ring `#0b3865` against checked-checkbox fill `#0b3865`: **1:1** — the ring is indistinguishable from the control it surrounds if it overlaps the fill.
- Against the white page immediately outside the control: **≈ 11.9:1** — PASS.
- Net rendered visibility: **UNVERIFIED** — depends on whether the 2px ring sits entirely outside the 16px control (needs rendered inspection).

**Affected components:** `ui/checkbox.tsx`, `ui/input.tsx`, `ui/searchable-select.tsx`, `ui/multi-select-filter.tsx`.

**Affected screens/locations:** All forms and filters.

**Occurrences:** 4 components; `focus-visible:ring-ring` appears 14 times total.

**Why it matters:** On a checked (navy) checkbox the focus ring may be imperceptible where it overlaps the fill.

**Recommended ACTION TYPE:** Focus treatment adjustment (offset/contrast on filled controls) + runtime validation.

---

### A11Y-D01-F15

**Title:** Low-alpha text colours of uncertain purpose

**Category:** Text contrast

**Priority:** P3

**Status:** UNVERIFIED

**WCAG:** 1.4.3 Contrast (Minimum) (AA)

**Current implementation:** `text-primary/70` (1 use — the Big-Number chart unit), `text-primary/60` (4 uses — breadcrumb separators), `text-primary-foreground/40` (2 uses — on the dark header), `text-muted-foreground/50` (1 use). Whether each styles essential text vs a decorative glyph/placeholder was not fully resolved from source.

**Actual measurement:**
- `text-primary/70` (navy @70%) on white ≈ **3.9:1** — *Derived* — the Big-Number unit is `text-lg` (18px) = large text → **3:1 PASS**.
- `text-primary/60` on white ≈ **3.0:1** — *Derived* — breadcrumb `›` separators (see F16).
- `text-primary-foreground/40` (white @40%) on `#0b2540` ≈ **3.5:1** — *Derived* — **FAIL** if this styles readable text.
- `text-muted-foreground/50` on white ≈ **~2:1** — *Derived* — **FAIL** if text.

**Affected components:** `chart/ChartPreviewCanvas.tsx`, `layout/BreadcrumbBar.tsx`, `layout/TopNav.tsx`.

**Occurrences:** 8 total.

**Why it matters:** If any of these carry meaningful text they fail 4.5:1; classification needs a rendered check.

**Recommended ACTION TYPE:** Runtime validation required (classify each usage), then colour pairing adjustment where the content is meaningful text.

---

### A11Y-D01-F16

**Title:** Breadcrumb separator glyph — `text-primary/60` on amber ≈ 3.0:1

**Category:** Meaningful graphics / non-text contrast

**Priority:** P3

**Status:** PARTIAL

**WCAG:** 1.4.11 Non-text Contrast (AA)

**Current implementation:** `layout/BreadcrumbBar.tsx` — the `›` separators between crumbs are `text-primary/60` on `--breadcrumb-background` `#fdb557`. The crumb text itself is `text-primary` (solid) on the same amber.

**Actual measurement:**
- Separator: `#0b3865` @ 60% over `#fdb557` ≈ **3.0:1** — *Derived* — borderline.
- Crumb text: `#0b3865` on `#fdb557` = **6.75:1** — *Measured* — PASS.
- Required: 3:1 if the separator is treated as a meaningful graphic; crumb order also conveys structure, so it is arguably decorative.

**Affected components:** `layout/BreadcrumbBar.tsx`.

**Occurrences:** 4 separator instances per breadcrumb render.

**Why it matters:** Marginal; the separator is the only visual delimiter between crumbs but its meaning is redundant with word order.

**Recommended ACTION TYPE:** Colour pairing adjustment (separator opacity) — low priority.

---

### A11Y-D01-F17

**Title:** Focus may be obscured by sticky chrome

**Category:** Focus

**Priority:** P2

**Status:** UNVERIFIED

**WCAG:** 2.4.11 Focus Not Obscured (Minimum) (AA)

**Current implementation:** `layout/TopNav.tsx` is a fixed `h-[88px]` header; `layout/ContributorSidebar.tsx` is `md:sticky md:top-6`; dialogs use fixed/drawer positioning. Management-table bodies scroll internally.

**Actual measurement:** Cannot be established statically — depends on scroll position and rendered layout.

**Affected components:** `layout/TopNav.tsx`, `layout/ContributorSidebar.tsx`, `ui/dialog.tsx`, `shared/management-table/ManagementTable.tsx`.

**Why it matters:** A focused row/control scrolled under the sticky header would violate 2.4.11.

**Recommended ACTION TYPE:** Runtime validation required.

---

## 4. Systemic Issues

Grouped by root cause. **Prefer one systemic fix over many screen fixes.**

| Root cause | Affected components | Occurrences | Priority | Findings |
|---|---|---:|---:|---|
| `--input` / control-boundary token ≈ 1.1:1 | Input, Textarea, Checkbox (unchecked), RadioGroup (unchecked), SearchableSelect, MultiSelectFilter, MultiSelect, TagInput, ManagementTable search | `border-input` ×25 (+ control subset of `border-border` ×185) | P0 | F01 |
| Base focus indicator `outline-ring/50` — 50% alpha, width unset | Every focusable control without an explicit `focus-visible` rule (14 have overrides) | 1 base rule; global reach | P0 | F02, F03, F14 |
| `--muted-foreground` (`oklch 0.556`) fails on non-white surfaces | ManagementTable headers, Stepper, Footer, Toast, FieldError context, all chart labels, all `*Step*`/`*Review` panels, Dashboard | `text-muted-foreground` ×455 / 85 files | P1 | F04, F08 (link text), F11 |
| `--success` pairing not text-safe | Badge `success` variant, `successOutline` button, PasswordRequirements, all review steps, Step2DataFiles, toast icon | `text-success` ×28, `bg-success/10` ×11 | P1 | F05, F06, F13 |
| `--destructive` pairing has no margin on tint | Preview-page error banners, Step2DataFiles error box, step-panel error blocks, FieldError on tint | `bg-destructive/10` ×19, `/5` ×2 (text-on-tint subset ~6) | P1 | F07 |
| No persistent link affordance (unused `link` variant; hover-only cue) | Footer, TopNav | ~9 link-like controls | P1 | F08 |
| Chart categorical palette is a single-hue ramp; no non-colour cue | `--chart-1…5`, ChartPreviewCanvas, MapChoroplethPreview | 5 tokens + 1 renderer | P1 | F09, F10 |
| Interaction-state colour deltas below perceptible threshold | Button `ghost`/`outline`, ManagementTable rows, custom buttons | widespread | P2 | F12 |

---

## 5. Color Adjustment Action List

Team remediation checklist. **No replacement values prescribed** — the "type of adjustment" column says what to review.

| Priority | What needs review | Current measurement | Affected area | Type of adjustment |
|---|---|---|---|---|
| P0 | Form-control boundary contrast | ≈ 1.13:1 (border on white field); ≈ 1.09:1 (field on page) → required 3:1 | Inputs, textareas, unchecked checkbox/radio, all select-style triggers, table search | Colour token adjustment (interactive boundary separate from decorative hairline) + component variant review |
| P0 | Base focus indicator | `outline-ring/50` ≈ 2.84:1 on white; width unset → required 3:1 | Global — every control without its own focus rule | Focus treatment adjustment (opacity/width) + runtime validation |
| P1 | Focus indicator on dark header | `#0b3865` vs `#0b2540` = 1.31:1 → required 3:1 | Top navigation | Focus treatment adjustment (surface-aware) |
| P1 | Secondary text on non-white surfaces | `#737373` on `#f3f5f8` = 4.34:1; on `bg-muted` = 4.40:1 → required 4.5:1 | Table headers, footer, stepper, toasts, helper text, chart labels (455 uses) | Colour token adjustment + rendered validation |
| P1 | Success text / control label | `#46a758` on `#fff` = 3.03:1; on `bg-success/10` = 2.74:1 → required 4.5:1 | Review steps, `successOutline` button, password rules, Step2 confirmation | Background/foreground pairing adjustment (text-weight success value) |
| P1 | "Published" status badge | `#46a758` on `#ecf6ee` = 2.74:1 → required 4.5:1 | Badge `success` variant, StatusBadge, all 6 tables | Component variant adjustment |
| P1 | Error text on tinted background | `#d72d2f` on `bg-destructive/10` ≈ 4.06:1; on white ≈ 4.9:1 (no margin) → required 4.5:1 | Preview-page & step-panel error banners | Background/foreground pairing adjustment + rendered validation |
| P1 | Link distinction (footer / nav) | No persistent non-colour cue; link text also ≈ 4.34:1 | Global footer, global header nav | Link distinction adjustment + colour pairing adjustment |
| P1 | Chart categorical palette | `--chart-1` swatch on white = 1.76:1; adjacent series separation unverified | Bar / pie preview, legends | Chart palette adjustment + additional non-colour cue + CVD validation |
| P2 | Choropleth no-data vs low-value; region borders | Low-value fill ≈ no-data fill; border ≈ 1.1:1 | Map chart preview | Chart palette adjustment + non-colour cue + boundary contrast review |
| P2 | Chart/map label colour | `text-muted-foreground` 10–11px, borderline on white, FAIL on tint | Chart / map internals | Background/foreground pairing adjustment |
| P2 | Hover / active state deltas | `hover:bg-muted` ≈ 1.03:1; no `:active` | Ghost/outline buttons, table rows, custom buttons | State treatment adjustment |
| P2 | Success/meaningful icon contrast | `#46a758` on white = 3.03:1 (no margin) | Toasts, review checklists | Colour token adjustment (same review as success text) |
| P2 | Focus ring on filled controls | Ring colour == checked-checkbox fill; no offset | Checkbox, input, select triggers | Focus treatment adjustment + runtime validation |
| P2 | Focus not obscured by sticky chrome | Unverifiable statically | Header, sidebar, dialogs, tables | Runtime validation required |
| P3 | Low-alpha text colours | `text-primary-foreground/40` ≈ 3.5:1; `text-muted-foreground/50` ≈ 2:1 (purpose unconfirmed) | Header, breadcrumb, Big-Number chart | Runtime validation, then colour pairing adjustment if meaningful text |
| P3 | Breadcrumb separator glyph | `#0b3865/60` on `#fdb557` ≈ 3.0:1 | Breadcrumb bar | Colour pairing adjustment (opacity) |

---

## 6. Passing Patterns (preserve these)

| Pattern | Measurement | Result |
|---|---|---|
| Primary text `--primary` `#0b3865` on white | **11.9:1** — *Measured* | PASS (also AAA ≥7:1) |
| Primary text on page background `#f3f5f8` | **≈ 11.2:1** — *Derived* | PASS |
| Body text `--foreground` `oklch(0.145)` ≈ `#252525` on white | **≈ 15.3:1** — *Derived* | PASS (AAA) |
| Default / primary button — white on `#0b3865` | **11.9:1** — *Measured* | PASS |
| `destructive` button — white on `#d72d2f` | **≈ 4.9:1** — *Derived* | PASS (borderline; monitor) |
| `secondary` badge/button — `oklch(0.21)` on `oklch(0.967)` | **≈ 12:1** — *Derived* | PASS |
| `accent` badge — `#0b3865` on `#fdb557` | **6.75:1** — *Measured* | PASS |
| `warning` badge / "Draft" — `#0b3865` on `bg-warning/20` (`#fff3d8`) | **≈ 10.8:1** — *Derived* | PASS |
| Breadcrumb crumb text — `#0b3865` on `#fdb557` | **6.75:1** — *Measured* | PASS |
| Header nav text — white at 80–90% on `#0b2540` | **≈ 10–13:1** — *Derived* | PASS |
| Tooltip — `text-foreground` on `bg-card` white, `border-border` | **≈ 15:1** text — *Derived* | PASS (12px size noted) |
| Toast state treatment — icon (`CheckCircle2`/`AlertCircle`) + colour + text | — | PASS **1.4.1** (colour not the sole cue) |
| `ManagementTable` load-error — `AlertTriangle` icon + text | — | PASS **1.4.1** |
| `StatusBadge` — always renders the status **word** ("Published"/"Draft") | — | PASS **1.4.1** (contrast still fails, see F06) |
| Checked checkbox / radio — `bg-primary` fill + white check / dot | white on `#0b3865` = **11.9:1** | PASS (fill + glyph, not colour alone) |
| Status tabs (`ManagementTable`) — active = 2px underline **+** colour | — | PASS **1.4.1** |
| `MultiSelectFilter` selected option — checkmark (no background highlight) | — | PASS **1.4.1** |
| Required-field marker — `*` glyph accompanies the label | — | PASS **1.4.1** (weak but non-colour) |
| `aria-invalid` field — red border **+** visible `FieldError` text | — | PASS **1.4.1** (text present; border contrast is F01/F07) |
| Focus ring where explicitly overridden, on white surfaces — `ring-2 ring-ring` | `#0b3865` on white ≈ **11.9:1** — *Measured* | PASS (on white only; see F03/F14) |
| Dashboard workspace cards — hover = `border-primary/40` shift (border, not fill) | more perceptible than `bg-muted` hover | Acceptable |

---

## 7. Needs Runtime Validation

Not scored as FAIL — requires rendered/browser inspection to confirm.

| Item | Why static inspection is insufficient | Related findings |
|---|---|---|
| Exact rendered contrast of every `oklch()` token — `--muted-foreground`, `--destructive`, `--secondary-foreground`, `--chart-2…5` | sRGB approximations of `oklch()` vary by browser colour pipeline; several results are within ±0.3 of threshold | F04, F07, F09, F11 |
| Whether the base focus outline renders at a usable width at all | `outline-width` / `outline-style` are not set in the base layer; result depends on UA defaults | F02 |
| Focus visibility on the dark header, on `bg-primary` buttons, on checked checkboxes | Compositing of ring + offset + fill needs to be seen | F03, F14 |
| Focus visibility of the `TruncatedText` focusable span (`outline-none`, no replacement) | Whether any indicator paints | F02 |
| Chart series separation under normal vision and protan/deutan/tritan simulation | `--chart-2…5` all `oklch()`; adjacent-pair contrast must be measured on the rendered canvas | F09 |
| Choropleth: can "low value" be told from "no data" without hovering; are resting region borders visible | Depends on rendered `color-mix` output and map zoom | F10 |
| 2.4.11 — whether a focused element is ever fully hidden by the sticky header / sidebar / drawer | Scroll-position dependent | F17 |
| Classification of the 8 low-alpha text colours as meaningful text vs decoration | Requires seeing what each renders | F15 |
| `disabled:opacity-50` controls — whether any disabled control still needs to convey essential info | Disabled has a WCAG exception; case-by-case | F12 |
| Safari-specific `oklch()` + `color-mix()` rendering (choropleth fills), `backdrop-filter` on the sticky bar | Browser-specific | F09, F10 |

**Statements that cannot be verified at all from the repository:** real 2.4.11 obstruction; the true sRGB of each `oklch()` grey on each target browser; whether tooltip/popover hover content meets 1.4.13. Recorded as UNVERIFIED, not FAIL.

---

## 8. Final Design Review Checklist

- [ ] All normal-text pairings meet ≥ 4.5:1 **on their actual background** — *currently fails: `--muted-foreground` on non-white (F04), `--success` text (F05), "Published" badge (F06), error-on-tint (F07), footer link text (F08)*
- [ ] Large-text pairings meet ≥ 3:1 — *`text-primary/70` Big-Number unit passes as large text; no large-text failures found*
- [ ] Applicable UI / non-text elements meet ≥ 3:1 — *currently fails: `--input` control boundary (F01), base focus indicator (F02/F03), `--chart-1` swatch (F09), choropleth region border (F10)*
- [ ] Meaning is not communicated through colour alone — *mostly satisfied (badges carry words, toasts carry icon + text, tabs carry underline); gaps: footer/nav links (F08), pie/legend swatch→label mapping and choropleth "no data" (F09/F10)*
- [ ] Links are visually distinguishable — *currently fails (F08)*
- [ ] Focus treatment is visually distinguishable on every surface — *currently fails on white (F02) and dark header (F03); filled-control case unverified (F14)*
- [ ] Interaction states are distinguishable — *partial: hover deltas ≈ 1.03:1, no `:active` (F12)*
- [ ] Error / success / warning states have non-colour cues — *satisfied (icons + text); the contrast of the success/error text itself is the open item (F05/F06/F07)*
- [ ] Charts do not rely on colour alone — *currently partial (F09) — single-hue ramp, no pattern/label/shape cue*
- [ ] Map / data categories remain distinguishable, and "no data" ≠ low value — *currently partial (F10)*
- [ ] All systemic colour-token issues identified — *yes — §4 lists 8 root causes*
- [ ] Runtime-only findings clearly separated — *yes — §7*

---

## WHAT THE DESIGN TEAM NEEDS TO REVIEW

Practical decisions to make after reading this report. Ordered by leverage (systemic first).

1. **Control-boundary colour (P0).** Decide on an interactive-boundary treatment for inputs, textareas, unchecked checkboxes and radios that reaches ≥ 3:1 against both the white field fill and the page background. Keep the decorative card/table hairline as a separate decision if it should stay lighter.

2. **Focus indicator (P0).** Decide the base focus treatment: opacity (currently 50%), a defined outline width/style (currently unset), and how it behaves on the dark header and on filled navy controls. One base decision covers the whole app.

3. **Secondary-text colour (`--muted-foreground`) (P1).** Review this token against the surfaces it is actually used on — page background, `bg-muted`, `bg-muted/40` table headers, tinted cards — not against pure white. It is the most-used secondary-text token (455 uses).

4. **Success colour used as text (P1).** Decide whether `--success` needs a separate text-weight value. It currently serves fills, borders, icons and text from one value; the text and small-icon uses (including the "Published" badge) are below threshold.

5. **"Published" badge variant (P1).** The `success` badge tint + text pairing fails while the `Draft`/`warning` badge passes comfortably. Decide how to bring the two badges to parity.

6. **Error text on tinted backgrounds (P1).** Decide whether error copy keeps its tinted background, and whether the destructive colour needs a text-weight value — the current pairing is ≈ 4.0:1 on the tint and ≈ 4.9:1 on white (no margin).

7. **Link affordance (P1).** Decide on a persistent cue (not hover-only) for footer and top-nav links, and confirm link text colour meets 4.5:1. Note the existing unused `link` button variant uses a hover-only underline.

8. **Chart palette (P1).** Decide whether the categorical series palette should move off a single hue, and whether a non-colour cue (direct labels, pattern, shape) is added. Separately, decide the "no data" treatment on the map so it cannot be confused with a low value.

9. **Interaction-state deltas (P2).** Decide whether hover (currently ≈ 1.03:1) needs a stronger change and whether a pressed/`:active` state should exist.

10. **Runtime validation pass (all priorities).** Before finalising any of the above, run the §7 list in-browser (Chromium + WebKit, plus a CVD simulator for charts) to confirm the `oklch()`-derived measurements and the focus-rendering questions.

**After the team implements its chosen changes, re-run this audit (A11Y-D01) to verify each finding moves to PASS.**
