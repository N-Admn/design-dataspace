# A11Y-D01 — Color Accessibility Audit (Re-audit, post Stage 1)

**Date:** 2026-09-03
**Supersedes:** `accessibility-audit-A11Y-D01-color.md` (initial audit) for current-state status.
**Target:** CivicDataSpace prototype, `main` @ `d8f2f67` + working tree with **Stage 1 colour refinements applied**.
**Scope:** WCAG 2.2 Level AA — colour only.
**Method:** Static token + component inspection; contrast via WCAG relative-luminance. Tint composites (`color-mix`/alpha) are **Derived** and flagged for in-browser confirmation.
**Audit only — this re-audit did not change code.**

**Stage 1 changes under review (approved + implemented separately):**

| Change | Detail |
|---|---|
| `--muted-foreground` | `oklch(0.556 0 0)` → **`#6b6b6b`** |
| `--success-text` (new token) | **`#34863a`** — `text-success` → `text-success-text` at all 28 foreground call-sites |
| Success tint | `bg-success/10` → **`bg-success/5`** at all 11 success-surface call-sites |
| Unchanged | `--success` `#46a758`, `--primary`, `--accent`, `--warning`, `--destructive`, all `*-foreground`, `border-success` |

Build after Stage 1: `tsc` ✓ · `oxlint` ✓ · `vite build` ✓.

---

## 1. Executive Summary

**Overall result:** Stage 1 targeted two of the eight systemic root causes. **Muted secondary text is now fully resolved** — every real-surface pairing passes ≥ 4.5:1. **Success text passes on white** (4.55:1) and **success icons now pass with margin**. The one residual is **success text on the success tint** (~4.34:1): improved from 2.74:1 but still short, and structurally capped because `#34863a` cannot exceed 4.55:1 on any background. All other findings are unchanged and queued for later stages.

**Findings by status — before → after Stage 1 (17 findings):**

| Status | Initial | Now |
|---|---:|---:|
| PASS | 0 | **2** |
| PARTIAL | 7 | **8** |
| FAIL | 6 | **4** |
| UNVERIFIED | 4 | **3** |

**Findings by priority (unchanged — Stage 1 did not target P0s):**

| Priority | Count |
|---|---:|
| P0 | 2 (F01 control border, F02 base focus) |
| P1 | 7 |
| P2 | 6 |
| P3 | 2 |

**Systemic root causes — status:**

| Root cause | Initial | Now |
|---|---|---|
| `--muted-foreground` fails on non-white | P1 open | **RESOLVED** |
| `--success` not text-safe | P1 open | **PARTIAL** — text-safe on white via `--success-text`; on the success tint still ~4.34:1 |
| `--input` / control boundary ≈ 1.1:1 | P0 open | open (out of scope for Stage 1) |
| Base focus indicator `outline-ring/50` | P0 open | open |
| `--destructive` no margin on tint | P1 open | open |
| No persistent link affordance | P1 open | **PARTIAL** — link-text contrast now passes; persistent cue still missing |
| Chart palette single-hue ramp | P1 open | open |
| Interaction-state colour deltas | P2 open | open |

**Overall assessment:** Still not WCAG 2.2 AA compliant for colour. Two systemic issues improved (one resolved, one partial). No regressions to the passing patterns. Remaining work is the previously-catalogued findings, unchanged.

---

## 2. Accessibility Scorecard

| Category | Pass | Partial | Fail | Unverified | Δ vs initial |
|---|---:|---:|---:|---:|---|
| Text contrast | 10 | 3 | 2 | 1 | muted pairings FAIL→PASS; success/white FAIL→PASS |
| Large text | 3 | 1 | 0 | 0 | — |
| UI / non-text contrast | 2 | 1 | 2 | 1 | — |
| Meaningful graphics | 2 | 2 | 0 | 1 | success icon PARTIAL→PASS |
| Colour independence | 6 | 3 | 0 | 0 | links FAIL→PARTIAL (contrast half resolved) |
| Focus appearance | 1 | 0 | 2 | 2 | — |
| Interaction states | 4 | 2 | 0 | 1 | — |
| Charts / data visualization | 0 | 3 | 0 | 1 | chart-label contrast improved (still PARTIAL) |

---

## 3. Findings — status changes

### A11Y-D01-F04 — `--muted-foreground` on non-white surfaces — **RESOLVED**

- **Category:** Text contrast · **Priority:** P1 · **Status:** PARTIAL → **PASS** · **WCAG:** 1.4.3
- **Change:** token `oklch(0.556 0 0)` → `#6b6b6b`. No component edits — 455 `text-muted-foreground` sites inherit.
- **Measurements (Derived where surface is a composite):**

| Pairing | Before | After | Req | Result |
|---|---:|---:|---:|---|
| `#6b6b6b` on white (`#fff`) | 4.74:1 | **5.33:1** | 4.5:1 | PASS |
| on page background `#f3f5f8` | 4.34:1 | **4.88:1** | 4.5:1 | PASS |
| on `bg-muted` `#f7f7f7` | 4.40:1 | **4.97:1** | 4.5:1 | PASS |
| on `bg-muted/40` table header (≈ `#fcfcfc`) | ~4.4:1 | **~5.14:1** | 4.5:1 | PASS |
| on `bg-secondary` (≈ `#f6f6f7`) | ~4.4:1 | **~4.94:1** | 4.5:1 | PASS |
| on tinted surfaces (`bg-primary/5`, `bg-success/5`, `bg-warning/10`, `bg-destructive/5`, `bg-muted/60`) | ~4.3–4.5:1 | **~4.8–5.1:1** | 4.5:1 | PASS |

- **Notes:** darkest realistic surface for this token is the page background (`#f3f5f8`) at 4.88:1. No `text-muted-foreground` usage sits on a surface darker than that (header/breadcrumb text uses other tokens). **All pairings pass.**
- **Recommended ACTION TYPE:** none — resolved. Confirm the composite rows in-browser as routine.

### A11Y-D01-F05 — `--success` used as text / control label — **PARTIAL**

- **Category:** Text contrast · **Priority:** P1 · **Status:** FAIL → **PARTIAL** · **WCAG:** 1.4.3
- **Change:** new `--success-text` `#34863a`; `text-success` → `text-success-text` at 28 sites.
- **Measurements:**

| Pairing | Before | After | Req | Result |
|---|---:|---:|---:|---|
| `#34863a` on white (`successOutline` label, review text, password rules, extraction confirmation) | 3.03:1 | **4.55:1** | 4.5:1 | **PASS** (thin margin) |
| `#34863a` on `bg-success/5` (success message boxes, badge) | 2.74:1 | **~4.34:1** | 4.5:1 | **FAIL** — see F06 |

- **Notes:** the on-white uses (the majority) now pass. The on-tint uses share the F06 residual.
- **Recommended ACTION TYPE:** none for on-white; on-tint tracked under F06.

### A11Y-D01-F06 — Success text on the success tint (Published badge, "Ready" chip, message boxes) — **FAIL (improved)**

- **Category:** Text contrast · **Priority:** P1 · **Status:** FAIL → **FAIL** (2.74:1 → ~4.34:1) · **WCAG:** 1.4.3
- **Change:** badge `success` variant text → `#34863a`; tint `bg-success/10` → `bg-success/5`.
- **Measurement (Derived — tint is `color-mix(in oklab, var(--success) 5%, transparent)` ≈ `#f6fbf7` composited on white):**
  - Foreground `#34863a` (L ≈ 0.1809) on `bg-success/5` (L ≈ 0.9514): **4.338:1**
  - Required 4.5:1 (12–14px normal text) → **FAIL** by ~0.16
  - Same colours as a non-text pair (icon): **4.34:1 ≥ 3:1 → PASS**
- **Structural cap:** `#34863a` on **pure white** = **4.548:1** — the maximum achievable for this foreground on any background. No perceptible green tint can reach 4.5:1 while `#34863a` is fixed.
- **Affected:** `ui/badge.tsx` `success` variant (Published / Draft-adjacent "Ready" chip), `collaborative/CollaborativeStep3Content.tsx`, `shared/DatasetConnectionsCard.tsx` success message boxes.
- **Recommended ACTION TYPE:** Background/foreground pairing adjustment — **design review required**. The tint-reduction path is exhausted. Options for the team: (a) drop the tint for success *text* surfaces (white → 4.55:1, but no green surface); (b) revisit `#34863a`; (c) a non-tint success treatment (border + white). Verify the ~4.34:1 render in DevTools before deciding.

### A11Y-D01-F08 — Footer / top-nav "links" — **PARTIAL** (contrast half-resolved)

- **Category:** Colour independence / Link distinction · **Priority:** P1 · **Status:** FAIL → **PARTIAL** · **WCAG:** 1.4.1
- **Change (incidental):** footer link text is `text-muted-foreground` → now `#6b6b6b`.
  - Footer link text on `#f3f5f8`: 4.34:1 → **4.88:1** — contrast now **PASS**.
- **Still open:** no persistent non-colour cue (no underline; hover-only colour change); top-nav items likewise. `1.4.1` link-distinction requirement **unmet**.
- **Recommended ACTION TYPE:** Link distinction adjustment (persistent cue). Out of scope for Stage 1.

### A11Y-D01-F11 — Chart / map internal labels — **PARTIAL** (contrast improved)

- **Category:** Text contrast (chart labels) · **Priority:** P2 · **Status:** PARTIAL → **PARTIAL** · **WCAG:** 1.4.3
- **Change (incidental):** chart labels using `text-muted-foreground` → `#6b6b6b`.
  - `#6b6b6b` at 10–11px on white: 4.74:1 → **5.33:1** — contrast now comfortably **PASS** on white; still ~4.9:1 on chart tints.
- **Still open:** size (10–11px arbitrary values) below the CDS 12px floor for meaningful data labels. Typography, not colour — flagged, not a Stage 1 colour item.
- **Recommended ACTION TYPE:** none for colour; size handled in a typography stage.

### A11Y-D01-F13 — Success / meaningful icons at the 3:1 threshold — **RESOLVED**

- **Category:** Meaningful graphics · **Priority:** P2 · **Status:** PARTIAL → **PASS** · **WCAG:** 1.4.11
- **Change:** success icons now `text-success-text` `#34863a`.
- **Measurements:**

| Pairing | Before | After | Req | Result |
|---|---:|---:|---:|---|
| success icon on white (`bg-card`) | 3.03:1 (no margin) | **4.55:1** | 3:1 | PASS |
| success icon on `bg-success/5` circle | 2.74:1 | **~4.34:1** | 3:1 | PASS |

- **Recommended ACTION TYPE:** none — resolved.

---

## 4. Findings unchanged since the initial audit

No Stage 1 change touched these; measurements and statuses carry forward from `accessibility-audit-A11Y-D01-color.md`.

| ID | Title | Priority | Status | Key measurement |
|---|---|---|---|---|
| F01 | Form-control / unchecked-checkbox borders (`--input`) | **P0** | FAIL | `#e3e3e3` on white = 1.13:1 (req 3:1) |
| F02 | Base focus indicator `outline-ring/50` | **P0** | FAIL (colour) / UNVERIFIED (width) | navy@50% on white ≈ 2.84:1 (req 3:1); width unset |
| F03 | Focus indicator on the dark header | P1 | FAIL | `#0b3865` vs `#0b2540` = 1.31:1 (req 3:1) |
| F07 | Error text on destructive tint | P1 | PARTIAL | `text-destructive` on `bg-destructive/10` ≈ 4.06:1 (req 4.5:1) |
| F09 | Chart categorical palette (single-hue ramp) | P1 | PARTIAL / UNVERIFIED | `--chart-1` swatch on white = 1.76:1; adjacent-series separation unverified |
| F10 | Choropleth "no data" vs low value; region borders | P2 | PARTIAL | low-value fill ≈ no-data fill; border ≈ 1.1:1 |
| F12 | Hover / pressed state deltas | P2 | PARTIAL | `hover:bg-muted` ≈ 1.03:1; no `:active` |
| F14 | Focus ring merges with fill on filled controls | P2 | UNVERIFIED | ring colour == checked-checkbox fill; no offset |
| F15 | Low-alpha text colours of uncertain purpose | P3 | UNVERIFIED | `text-primary-foreground/40` ≈ 3.5:1; `text-muted-foreground/50` ≈ 2:1 |
| F16 | Breadcrumb separator glyph | P3 | PARTIAL | `#0b3865/60` on `#fdb557` ≈ 3.0:1 |
| F17 | Focus not obscured by sticky chrome | P2 | UNVERIFIED | scroll-position dependent |

---

## 5. Systemic Issues (updated)

| Root cause | Affected components | Occurrences | Priority | Status |
|---|---|---:|---:|---|
| `--muted-foreground` fails on non-white surfaces | table headers, footer, stepper, toast, helper text, chart labels, `*Step*`/`*Review` panels, dashboard | `text-muted-foreground` ×455 | P1 | **RESOLVED** (`#6b6b6b`) |
| `--success` pairing not text-safe | badge `success` variant, `successOutline` label, review steps, message boxes, success icons | `text-success-text` ×28, `bg-success/5` ×11 | P1 | **PARTIAL** — resolved on white & for icons; ~4.34:1 on the tint |
| `--input` / control-boundary token ≈ 1.1:1 | Input, Textarea, Checkbox/Radio (unchecked), all selects, table search | `border-input` ×25 | **P0** | Open — later stage |
| Base focus indicator `outline-ring/50` | every focusable control without an explicit rule | 1 base rule | **P0** | Open — later stage |
| `--destructive` no margin on tint | preview-page error banners, step-panel error blocks | `bg-destructive/10` ×19 | P1 | Open — later stage |
| No persistent link affordance | Footer, TopNav | ~9 controls | P1 | **PARTIAL** — link-text contrast now passes; cue still missing |
| Chart categorical palette single-hue ramp | `--chart-1…5`, ChartPreviewCanvas, MapChoroplethPreview | 5 tokens + 1 renderer | P1 | Open — later stage |
| Interaction-state colour deltas below threshold | Button `ghost`/`outline`, table rows, custom buttons | widespread | P2 | Open — later stage |

---

## 6. Passing Patterns (preserved — re-verified)

| Pattern | Measurement | Result |
|---|---|---|
| Primary text `#0b3865` on white | 11.9:1 | PASS |
| Body text `oklch(0.145)` ≈ `#252525` on white | ≈ 15.3:1 | PASS |
| **Muted secondary text `#6b6b6b` on all real surfaces** | **4.88–5.33:1** | **PASS (newly)** |
| **Success text `#34863a` on white** | **4.55:1** | **PASS (newly)** |
| **Success icon `#34863a` on white / `bg-success/5`** | **4.55 / 4.34:1** | **PASS (newly, ≥3:1)** |
| Default / primary button — white on `#0b3865` | 11.9:1 | PASS |
| `destructive` button — white on `#dc2626` | ≈ 4.9:1 | PASS (borderline; monitor) |
| `accent` badge — `#0b3865` on `#fdb557` | 6.75:1 | PASS |
| `warning` badge / "Draft" — `#0b3865` on `bg-warning/20` | ≈ 10.8:1 | PASS |
| Header nav text — white 80–90% on `#0b2540` | ≈ 10–13:1 | PASS |
| Tooltip — `text-foreground` on `bg-card` | ≈ 15:1 | PASS |
| Toast / table-error state — icon + colour + text | — | PASS (1.4.1) |
| `StatusBadge` — always renders the status **word** | — | PASS (1.4.1) |
| Checked checkbox / radio — `bg-primary` fill + white glyph | 11.9:1 | PASS |
| Status tabs — active = 2px underline + colour | — | PASS (1.4.1) |
| `MultiSelectFilter` selected — checkmark, no bg highlight | — | PASS (1.4.1) |

**Regression check:** `--success` still `#46a758`; `--primary`, `--accent`, `--warning`, `--destructive`, all `*-foreground` unchanged. `border-success` / `border-success/30` unchanged. Draft badge, primary/secondary/destructive buttons, accent surfaces, status hierarchy — visually unaffected. No regressions.

---

## 7. Needs Runtime Validation

Unchanged from the initial audit, plus:

| Item | Why | Related |
|---|---|---|
| Rendered contrast of `#34863a` on `bg-success/5` (`color-mix` tint) | Confirm the ~4.34:1 Derived estimate before the F06 design decision | F06 |
| Rendered contrast of `#6b6b6b` on the `color-mix` / alpha tinted surfaces | Confirm the ~4.8–5.1:1 Derived estimates (all comfortably above 4.5, low risk) | F04 |
| Base focus outline actual rendered width (`outline-width` unset) | Static inspection cannot tell if it paints | F02 |
| Focus visibility on dark header / `bg-primary` / checked checkbox | Compositing must be seen | F03, F14 |
| Chart series separation under CVD simulation | `--chart-2…5` all `oklch()` | F09 |
| Choropleth low-value vs no-data at rest | rendered `color-mix` output | F10 |
| 2.4.11 focus obstruction by sticky chrome | scroll-position dependent | F17 |
| Purpose of the 8 low-alpha text colours | requires seeing what renders | F15 |

---

## 8. Final Design Review Checklist

- [x] Secondary/muted text meets ≥ 4.5:1 on its actual background — **F04 resolved**
- [~] Success text meets ≥ 4.5:1 — **on white yes (4.55:1); on the success tint ~4.34:1 — F06 open, design review**
- [x] Success/meaningful icons meet ≥ 3:1 — **F13 resolved**
- [ ] Form-control boundaries meet ≥ 3:1 — **F01 open (P0)**
- [ ] Focus treatment distinguishable on every surface — **F02 / F03 open (P0 / P1)**
- [~] Links visually distinguishable — **contrast now passes; persistent cue still missing (F08)**
- [ ] Error text on tinted backgrounds meets ≥ 4.5:1 — **F07 open**
- [ ] Charts do not rely on colour alone; categories distinguishable — **F09 / F10 open**
- [ ] Interaction states distinguishable — **F12 open**
- [x] Systemic colour-token issues identified — **§5**
- [x] Runtime-only findings clearly separated — **§7**

---

## WHAT THE DESIGN TEAM NEEDS TO REVIEW

Only the item Stage 1 could not close:

1. **Success text on the success surface (F06).** `#34863a` on `bg-success/5` renders ~4.34:1 — the tint-reduction path is exhausted (`#34863a` caps at 4.55:1 on pure white). Decide one of: (a) success-text surfaces become plain white (reaches 4.55:1, loses the green surface); (b) adjust `#34863a` slightly darker; (c) a non-tint success treatment (border + white). Confirm the ~4.34:1 figure in DevTools first.

Everything else on this list (F01, F02, F03, F07, F08-cue, F09, F10, F12, and the unverified items) is unchanged and belongs to later accessibility stages, not Stage 1.

---

*Re-audit only — no code changed by this document. Stage 1 refinements were implemented and validated separately. This does not establish WCAG compliance; it records current colour-pairing status against A11Y-D01.*
