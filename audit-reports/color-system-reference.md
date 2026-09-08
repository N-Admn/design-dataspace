# CivicDataSpace — Colour System Reference

**Date:** 2026-09-03 · **Repo state:** `main` @ `d8f2f67` + working tree (post Stage 1 colour refinements)
**Companion to:** `design-system.md` (generated token tables), `accessibility-audit-A11Y-D01-color*.md` (contrast audits)

This document catalogues every colour token in the system: its value, where it lives, what consumes it, the foreground/background combinations it participates in, measured contrast, whether it is actively used, and known issues. It is descriptive — it does not prescribe changes.

---

## 0. How to read this

- **CSS var** — the `--custom-property` in `:root` (from `src/generated/tokens.css`).
- **Tailwind key** — the `--color-*` key in `@theme inline`; produces `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `outline-*`, `from-*`… utilities and their `/NN` opacity variants.
- **sRGB ≈** — hex approximation. Hex tokens are exact. `oklch()` tokens are computed (neutral greys via `Y ≈ L³`, the OKLab neutral identity); treat as **Derived** — confirm in DevTools for anything near a threshold.
- **WCAG Y** — relative luminance (0 = black, 1 = white), used for contrast maths.
- **Uses** — count of Tailwind utility occurrences across `src/` (`bg-|text-|border-|ring-|outline-|fill-|placeholder:…`, including `/NN` variants). `var(--token)` used directly in inline styles is noted separately.
- **Status** — Active / Low use / **Unused** (defined but zero consumers).

Contrast verdicts use WCAG 2.2 AA: normal text ≥ 4.5:1, large text ≥ 3:1, UI/graphics ≥ 3:1 (1.4.11).

---

## 1. Token architecture

```
tokens.json  (repo root — the ONLY hand-authored source)
   │  npm run gen:tokens   (runs on predev / prebuild)
   ▼
src/generated/tokens.css   :root { --token: value } + @theme inline { --color-token: var(--token) }
   │  @import in src/index.css
   ▼
Tailwind v4 utilities        bg-primary, text-muted-foreground, border-input/40, …
   │
   ▼
Components (src/components/ui/*, src/components/**)  — consume utilities only, never raw hex
```

- **4 token groups:** `color` (base/brand/semantic, 24), `chart` (5), `sidebar` (8), `surface` (3). Total **40 colour tokens**.
- **No dark mode.** No `.dark` block is generated; there is a single light palette.
- **Grey model.** Neutrals are `oklch(L 0 0)`; brand/semantic colours are hex. Two greys carry a faint cool tint (`secondary`, `secondary-foreground` have tiny chroma).
- **Base layer** (`src/index.css`): `* { @apply border-border outline-ring/50 }` — sets the default border colour and the default focus outline colour globally.

---

## 2. Master token table

### 2.1 `color` group — base, brand & semantic

| Token | CSS var | Tailwind key | Value | sRGB ≈ | WCAG Y | Role |
|---|---|---|---|---|---|---|
| background | `--background` | `--color-background` | `oklch(1 0 0)` | `#ffffff` | 1.000 | App/base background (rarely used directly) |
| foreground | `--foreground` | `--color-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` *(near-black)* | ~0.003 | **Primary body text**, headings, icons on light |
| card | `--card` | `--color-card` | `oklch(1 0 0)` | `#ffffff` | 1.000 | Card / panel / popover / dialog / toast surface |
| card-foreground | `--card-foreground` | `--color-card-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | ~0.003 | Text on cards (mostly `text-foreground` is used instead) |
| popover | `--popover` | `--color-popover` | `oklch(1 0 0)` | `#ffffff` | 1.000 | Popover surface |
| popover-foreground | `--popover-foreground` | `--color-popover-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | ~0.003 | Text in popovers |
| **primary** | `--primary` | `--color-primary` | `#0b3865` | `#0b3865` | 0.0384 | **Brand navy.** Primary buttons, links, active nav, headings/labels, focus ring |
| primary-foreground | `--primary-foreground` | `--color-primary-foreground` | `#ffffff` | 1.000 | Text/icons on navy; also nav text on the dark header |
| secondary | `--secondary` | `--color-secondary` | `oklch(0.967 0.001 286.375)` | `#f4f4f5` | ~0.904 | Neutral grey fill (secondary button/badge) |
| secondary-foreground | `--secondary-foreground` | `--color-secondary-foreground` | `oklch(0.21 0.006 285.885)` | `#1a1a1d` | ~0.009 | Text on secondary fill |
| muted | `--muted` | `--color-muted` | `oklch(0.97 0 0)` | `#f5f5f5` | ~0.913 | **Neutral fill / hover surface** (`bg-muted`, `hover:bg-muted`, `bg-muted/40` table headers) |
| **muted-foreground** | `--muted-foreground` | `--color-muted-foreground` | `#6b6b6b` ⬅ *Stage 1* | `#6b6b6b` | 0.1470 | **Secondary text**: helper, metadata, timestamps, placeholders, table headers, footer, chart labels |
| **accent** | `--accent` | `--color-accent` | `#fdb557` | `#fdb557` | 0.5461 | **Brand amber.** Breadcrumb bar, user avatar, accent badge/chips, chart-1 |
| accent-foreground | `--accent-foreground` | `--color-accent-foreground` | `#0b3865` | 0.0384 | Navy text on amber |
| **destructive** | `--destructive` | `--color-destructive` | `oklch(0.577 0.245 27.325)` | `#dc2626` ≈ | ~0.167 | **Red.** Delete/irreversible actions, error text, `aria-invalid`, required `*` |
| destructive-foreground | `--destructive-foreground` | `--color-destructive-foreground` | `#ffffff` | 1.000 | Text on solid red button |
| **success** | `--success` | `--color-success` | `#46a758` | `#46a758` | 0.2962 | **Green — fills & borders only.** `bg-success/5` tint, `border-success` |
| success-foreground | `--success-foreground` | `--color-success-foreground` | `#ffffff` | 1.000 | *(defined; **0 consumers**)* |
| **success-text** | `--success-text` | `--color-success-text` | `#34863a` ⬅ *Stage 1 (new)* | `#34863a` | 0.1809 | **Green — text & small icons.** Published/Ready badge text, success messages, checkmarks |
| **warning** | `--warning` | `--color-warning` | `#ffc53d` | `#ffc53d` | 0.6152 | **Amber-yellow.** Draft / unsaved / attention. Tints (`bg-warning/10`, `/20`), `border-warning/40` |
| warning-foreground | `--warning-foreground` | `--color-warning-foreground` | `#0b3865` | 0.0384 | Navy text on warning tint; also used standalone as "not-ready" review text |
| border | `--border` | `--color-border` | `oklch(0.922 0 0)` | `#e5e5e5` | ~0.784 | **Hairlines** — card/table/row dividers, section rules |
| input | `--input` | `--color-input` | `oklch(0.922 0 0)` | `#e5e5e5` | ~0.784 | **Form-control borders** — input/textarea/select/checkbox/radio |
| ring | `--ring` | `--color-ring` | `#0b3865` | 0.0384 | Focus indicator colour (= `--primary`) |

### 2.2 `chart` group — categorical data-viz palette

Consumed as `var(--chart-N)` in inline styles (`SERIES_COLORS` in `ChartPreviewCanvas.tsx`) — **not** via Tailwind utilities.

| Token | CSS var | Value | sRGB ≈ | WCAG Y | Notes |
|---|---|---|---|---|---|
| chart-1 | `--chart-1` | `#fdb557` | `#fdb557` | 0.5461 | = `--accent` (amber) |
| chart-2 | `--chart-2` | `oklch(0.705 0.213 47.604)` | `#e8710a` ≈ | ~0.28 | orange |
| chart-3 | `--chart-3` | `oklch(0.646 0.222 41.116)` | `#cf5a12` ≈ | ~0.20 | darker orange |
| chart-4 | `--chart-4` | `oklch(0.553 0.195 38.402)` | `#a8481b` ≈ | ~0.12 | brown-orange |
| chart-5 | `--chart-5` | `oklch(0.47 0.157 37.304)` | `#7e3717` ≈ | ~0.07 | dark brown |

**Character:** single hue (≈ 37–48°) descending in lightness — a *sequential ramp* used for *categorical* series. See A11Y-D01-F09.

### 2.3 `sidebar` group — scoped surface (⚠ all Unused)

| Token | Value | Status |
|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` (`#fbfbfb`) | **Unused** |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | **Unused** |
| `--sidebar-primary` | `#0b3865` | **Unused** |
| `--sidebar-primary-foreground` | `#ffffff` | **Unused** |
| `--sidebar-accent` | `#fdb557` | **Unused** |
| `--sidebar-accent-foreground` | `#0b3865` | **Unused** |
| `--sidebar-border` | `oklch(0.922 0 0)` | **Unused** |
| `--sidebar-ring` | `#0b3865` | **Unused** |

`ContributorSidebar.tsx` styles itself with the **base** tokens (`bg-card`, `bg-muted`, `bg-primary`, `bg-accent`, `border-border`, `text-primary`, `text-muted-foreground`). The `--sidebar-*` set is shadcn scaffolding that was never wired up — safe to remove, or keep as a reserved scope.

### 2.4 `surface` group — app-chrome surfaces

| Token | CSS var | Tailwind key | Value | WCAG Y | Where |
|---|---|---|---|---|---|
| page-background | `--page-background` | `--color-page-background` | `#f3f5f8` | 0.9114 | App canvas behind cards (`body` in `index.css`) |
| header-background | `--header-background` | `--color-header-background` | `#0b2540` | 0.0177 | Top nav bar (`TopNav.tsx`) |
| breadcrumb-background | `--breadcrumb-background` | `--color-breadcrumb-background` | `#fdb557` | 0.5461 | Amber breadcrumb strip (= `--accent`) |

---

## 3. Foreground / background combinations (as actually paired)

Contrast to 2 dp. **Bold** = fails its requirement. *(D)* = Derived (an `oklch()` or alpha-composite surface — confirm in browser).

### 3.1 Text on solid surfaces

| Foreground | Background | Contrast | Req | Verdict | Where |
|---|---|---:|---:|---|---|
| `foreground` `#0a0a0a` | white (`card`) | ~19.8:1 *(D)* | 4.5 | PASS (AAA) | all body text, table cells, card titles |
| `foreground` `#0a0a0a` | `page-background` `#f3f5f8` | ~18.9:1 *(D)* | 4.5 | PASS | text directly on the canvas |
| `primary` `#0b3865` | white | 11.88:1 | 4.5 | PASS (AAA) | headings, labels, links, active nav, `CardTitle`, `DialogTitle` |
| `primary` `#0b3865` | `page-background` | ~11.2:1 *(D)* | 4.5 | PASS | headings on the canvas |
| `primary` `#0b3865` | `accent`/`breadcrumb` `#fdb557` | 6.75:1 | 4.5 | PASS | breadcrumb crumb text |
| `primary` `#0b3865` | `warning` tint `bg-warning/20` | ~10.8:1 *(D)* | 4.5 | PASS | "Draft" badge, "unsaved" chip |
| `primary-foreground` white | `primary` `#0b3865` | 11.88:1 | 4.5 | PASS | primary button label, checkbox/radio glyph |
| `primary-foreground` white | `header-background` `#0b2540` | 15.52:1 | 4.5 | PASS | top-nav logo area |
| `primary-foreground`/80–90 | `header-background` | ~10–13:1 *(D)* | 4.5 | PASS | top-nav link text |
| `primary-foreground`/40 | `header-background` | ~3.5:1 *(D)* | 4.5 | **UNVERIFIED** | 2 uses on the header — purpose unconfirmed (F15) |
| `secondary-foreground` `#1a1a1d` | `secondary` `#f4f4f5` | ~17:1 *(D)* | 4.5 | PASS | secondary button/badge |
| **`muted-foreground` `#6b6b6b`** | white (`card`) | **5.33:1** | 4.5 | PASS | helper text, metadata on white cards |
| **`muted-foreground` `#6b6b6b`** | `page-background` `#f3f5f8` | **4.88:1** *(D)* | 4.5 | PASS ⬅ *was 4.34 (FAIL)* | footer text, canvas metadata |
| **`muted-foreground` `#6b6b6b`** | `muted` `#f5f5f5` | **4.89:1** *(D)* | 4.5 | PASS ⬅ *was 4.40 (FAIL)* | table column headers (`bg-muted/40`), hover rows |
| **`muted-foreground` `#6b6b6b`** | `secondary` `#f4f4f5` | ~4.84:1 *(D)* | 4.5 | PASS | secondary surfaces |
| `muted-foreground`/50 | white | ~2:1 *(D)* | 4.5 | **UNVERIFIED** | 1 use (placeholder) — purpose unconfirmed (F15) |
| `destructive` `#dc2626` | white | 4.83:1 *(D)* | 4.5 | PASS (no margin) | error text, `FieldError`, delete-action label, required `*` |
| **`destructive` `#dc2626`** | `bg-destructive/10` (`#faeaea`) | **~4.06:1** *(D)* | 4.5 | **FAIL** | page-level error banners (F07) |
| **`destructive` `#dc2626`** | `bg-destructive/5` (`#fdf4f4`) | **~4.31:1** *(D)* | 4.5 | **FAIL** | inline error blocks (F07) |
| `destructive-foreground` white | `destructive` `#dc2626` | 4.83:1 *(D)* | 4.5 | PASS (no margin) | solid destructive button |
| **`success` `#46a758`** *(pre-Stage 1)* | white | **3.03:1** | 4.5 | *superseded* | — replaced by `success-text` |
| **`success-text` `#34863a`** | white (`card`) | **4.55:1** | 4.5 | PASS (thin) ⬅ *was 3.03* | success message text, review "ready" text, `successOutline` label, password-rule met |
| **`success-text` `#34863a`** | `bg-success/5` (`#f6fbf7`) | **~4.33:1** *(D)* | 4.5 | **FAIL** by ~0.17 | Published/Ready badge text, success message boxes (F06 — under design review) |
| `warning-foreground` `#0b3865` | white | 11.88:1 | 4.5 | PASS | review "not ready" text (semantic naming is odd but contrast is fine) |
| `muted-foreground` `#6b6b6b` @ 10–11px | white | 5.33:1 | 4.5 | PASS (contrast); size < 12px flagged | chart axis/category labels (F11) |

### 3.2 Non-text (UI components, borders, icons, focus) — require ≥ 3:1

| Element | Colour | Adjacent | Contrast | Verdict | Where |
|---|---|---|---:|---|---|
| **Input / textarea / select border** | `input` `#e5e5e5` | white field fill | **~1.2:1** *(D)* | **FAIL** | `Input`, `Textarea`, `SearchableSelect`, `MultiSelectFilter`, table search (F01) |
| **Input border** | `input` `#e5e5e5` | `page-background` `#f3f5f8` | **~1.15:1** *(D)* | **FAIL** | forms on the canvas (F01) |
| **Unchecked checkbox / radio border** | `input` `#e5e5e5` | white | **~1.2:1** *(D)* | **FAIL** | `Checkbox`, `RadioGroup` (F01) |
| Checked checkbox / radio | `primary` `#0b3865` fill + white glyph | white | 11.88:1 | PASS | checked state |
| Card / table / row hairline | `border` `#e5e5e5` | white | ~1.2:1 *(D)* | N/A (decorative) | dividers, section rules — 1.4.11 exempt |
| **Base focus outline** | `ring` `#0b3865` @ **50% α** (`outline-ring/50`) | white | **~2.8:1** *(D)* | **FAIL** | every control without its own `focus-visible` rule (F02); outline-width unset |
| **Base focus outline** | `ring` `#0b3865` @ 50% α | `header-background` `#0b2540` | **~1.3:1** *(D)* | **FAIL** | top-nav controls (F03) |
| Explicit focus ring (`focus-visible:ring-2 ring-ring`) | `ring` `#0b3865` (100%) | white | 11.88:1 | PASS | `Button`, `Input`, `Checkbox`, selects (on light surfaces) |
| Explicit focus ring | `ring` `#0b3865` | `header-background` `#0b2540` | **1.31:1** | **FAIL** | user-menu avatar (mitigated by white `ring-offset-2`) (F03/F14) |
| Success icon | `success-text` `#34863a` | white (`bg-card`) | 4.55:1 | PASS ⬅ *was 3.03 (no margin)* | toast success, review checkmarks, upload "Ready" tick (F13) |
| Success icon | `success-text` `#34863a` | `bg-success/5` circle | ~4.33:1 *(D)* | PASS (≥3) | success modals, drawer success panel |
| Error icon | `destructive` `#dc2626` | white | 4.83:1 *(D)* | PASS | toast error (`AlertCircle`) |
| **Chart legend swatch** | `chart-1` `#fdb557` | white chart bg | **1.76:1** | **FAIL** | 8–10px pie/bar legend dots (F09) |
| Chart bar / line / point | `primary` `#0b3865` | white | 11.88:1 | PASS | line chart (single series), bar value labels |
| **Choropleth region border** | `border` `#e5e5e5` weight 1 | pale navy fills | **~1.2:1** *(D)* | **FAIL** | map region outlines at rest (F10) |
| **Breadcrumb `›` separator** | `primary` `#0b3865` @ **60% α** | `breadcrumb-background` `#fdb557` | **~3.0:1** *(D)* | borderline | `BreadcrumbBar.tsx` (F16) — arguably decorative |

### 3.3 Interaction-state deltas (perceptibility)

| State pair | Colour change | Δ contrast | Note |
|---|---|---:|---|
| default → hover (ghost/outline buttons, custom buttons) | white → `bg-muted` `#f5f5f5` | **~1.03:1** | barely perceptible (F12) |
| default → hover (table rows) | white → `bg-muted/30` | **~1.02:1** | barely perceptible (F12) |
| default → hover (primary button) | `#0b3865` → `bg-primary/90` | minimal | label stays ~10:1 either way |
| default → hover (dashboard cards) | border → `border-primary/40` | more perceptible (border, not fill) | acceptable |
| default → `:active` / pressed | — | **none** | state not defined anywhere (F12) |
| disabled | `disabled:opacity-50` (6 sites) + `opacity-60` (5) | — | WCAG contrast exception applies; documented, not scored |

---

## 4. Opacity-modified utilities actually in use

Tailwind `token/NN` → `color-mix(in oklab, var(--token) NN%, transparent)`, composited over the parent surface.

| Utility | Uses | Purpose / where |
|---|---:|---|
| `bg-muted/40` | 19 | table column-header strip (`ManagementTable`) |
| `bg-destructive/10` | 19 | error banners, destructive-action hover backgrounds |
| `border-primary/40` | 16 | dashboard workspace-card hover border |
| `bg-primary/5` | 16 | very subtle navy wash (info panels, selected rows) |
| `bg-primary/10` | 15 | navy chip / icon-tile background |
| `bg-success/5` | 11 | **success surface** (badge, message boxes, success-icon circles) ⬅ *was `/10`* |
| `bg-muted/30` | 8 | row hover, subtle fills |
| `text-primary/60` | 4 | breadcrumb separators (F16) |
| `ring-destructive/20` | 4 | `aria-invalid` field ring |
| `border-warning/40` | 4 | draft/attention callout border |
| `bg-warning/10` | 4 | warning callout background |
| `border-destructive/30`,`/40` | 6 | error-block borders |
| `bg-muted/50` | 3 | fills |
| `text-primary-foreground/80`,`/90` | 4 | top-nav link text |
| `text-primary-foreground/40` | 2 | header — purpose unconfirmed (F15) |
| `border-success/30` | 2 | success message-box border |
| `bg-warning/20` | 2 | "Draft" badge background |
| `bg-primary/90` | 2 | primary-button hover |
| `bg-muted/60` | 2 | dashboard "Continue Working" row background |
| `bg-destructive/5` | 2 | inline error block |
| `bg-accent/20` | 2 | amber highlight wash |
| `text-primary/70` | 1 | Big-Number chart unit (`text-lg` → large text, ~3.9:1, PASS) |
| `text-primary-foreground/70` | 1 | header |
| `border-primary/30` | 1 | callout |
| `bg-muted/20` | 1 | fill |
| `bg-destructive/90` | 1 | destructive-button hover |
| `text-muted-foreground/50` | 1 | placeholder — purpose unconfirmed (F15) |

---

## 5. Active-usage heatmap (Tailwind utility occurrences in `src/`)

| Token | Uses | | Token | Uses |
|---|---:|---|---|---:|
| `muted` (incl. `bg-muted*`, `hover:bg-muted`) | **549** | | `success` (fills/borders) | 42 |
| `muted-foreground` | **455** | | `card` | 33 |
| `primary` | **233** | | `warning` | 30 |
| `foreground` | **192** | | `success-text` ⬅ new | 28 |
| `border` | **190** | | `input` | 25 |
| `destructive` | **141** | | `ring` | 24 |
| `background` | 21 | | `background` (bg-) | 21 |
| `primary-foreground` | 20 | | `warning-foreground` | 20 |
| `accent` | 13 | | `accent-foreground` | 8 |
| `secondary` | 5 | | `header-background` | 3 |
| `popover` | 2 | | `secondary-foreground` | 2 |
| `card-foreground` | 1 | | `destructive-foreground` | 1 |
| `page-background` | 1 | | `breadcrumb-background` | 1 |
| `success-foreground` | **0** | | `sidebar-*` (all 8) | **0** |
| `chart-1…5` (as utility) | **0** | | `chart-1…5` (as `var()` inline) | Active |

**Workhorses:** `muted` (fills/hover), `muted-foreground` (secondary text), `primary` (brand), `foreground` (body text), `border` (hairlines), `destructive` (errors/delete).
**Minimal:** `card-foreground`, `destructive-foreground`, `popover*`, `secondary*` — the components mostly reach for `text-foreground` / `bg-card` directly.

---

## 6. Unused / dead tokens

| Token(s) | Why it exists | Recommendation |
|---|---|---|
| `--success-foreground` `#ffffff` | shadcn semantic pair; no solid-fill success surface with white text exists | remove or leave inert |
| `--sidebar` + 7 `--sidebar-*` | shadcn sidebar scope; sidebar uses base tokens instead | remove, or keep as a reserved scope |
| Button `link` variant (`text-primary underline-offset-4`) | defined in `button.tsx`; **0 uses** | adopt for real links (F08) or remove |
| `--chart-1` (as a distinct token) | duplicates `--accent` `#fdb557` exactly | fine as an alias; note the duplication |

*Not colour, but adjacent:* `WORKSPACE_MAX_HEIGHT_CLASS` in `lib/layout.ts` — removed earlier.

---

## 7. Chart palette detail

| Slot | Value | sRGB ≈ | On white (swatch, ≥3:1) | Role |
|---|---|---|---:|---|
| chart-1 | `#fdb557` (= accent) | `#fdb557` | **1.76:1 — FAIL** | series 1, pie slice 1, legend dot |
| chart-2 | `oklch(0.705 0.213 47.604)` | `#e8710a` | ~2.8:1 — **borderline/FAIL** *(D)* | series 2 |
| chart-3 | `oklch(0.646 0.222 41.116)` | `#cf5a12` | ~3.4:1 *(D)* | series 3 |
| chart-4 | `oklch(0.553 0.195 38.402)` | `#a8481b` | ~4.6:1 *(D)* | series 4 |
| chart-5 | `oklch(0.47 0.157 37.304)` | `#7e3717` | ~6.5:1 *(D)* | series 5 |

- **Adjacent-series separation** (2↔3, 3↔4, 4↔5): a close lightness ramp on one hue — likely < 3:1 between neighbours; **needs rendered + CVD measurement** (F09).
- **No non-colour encoding** — solid fills, conic-gradient pie, `size-2`/`size-2.5` legend dots, no pattern/marker/direct label.
- **Line chart** uses a single `var(--primary)` series (navy on white, 11.9:1 — fine).
- **Choropleth** (`MapChoroplethPreview.tsx`) uses `color-mix(in srgb, var(--primary) 12%…90%, var(--muted))` for a sequential navy ramp; "no data" = `var(--muted)` @ 0.45 opacity (near-indistinguishable from the lightest data step — F10).

---

## 8. Contrast quick-reference matrix

Foreground ↓ / Background → · values are contrast ratios · **bold** = below the relevant threshold · *(D)* Derived.

| | white | `#f3f5f8` page | `#f5f5f5` muted | `#0b2540` header | `#fdb557` accent |
|---|---:|---:|---:|---:|---:|
| `foreground` `#0a0a0a` | 19.8 *(D)* | 18.9 *(D)* | 17.9 *(D)* | — | 10.4 *(D)* |
| `primary` `#0b3865` | 11.88 | 11.2 *(D)* | 10.9 *(D)* | **1.31** | 6.75 |
| `primary-foreground` white | — | — | — | 15.52 | **1.76** |
| `muted-foreground` `#6b6b6b` | 5.33 | 4.88 *(D)* | 4.89 *(D)* | — | **2.9** *(D)* |
| `success-text` `#34863a` | 4.55 | ~4.4 *(D)* | ~4.4 *(D)* | — | **3.1** *(D)* |
| `success` `#46a758` | **3.03** | **2.9** *(D)* | **2.9** *(D)* | — | **2.0** *(D)* |
| `destructive` `#dc2626` *(D)* | 4.83 | **4.6** | **4.6** | — | **2.5** |
| `warning` `#ffc53d` | **1.6** | **1.5** | **1.5** | **7.5** *(vs header)* | **1.0** |
| `border`/`input` `#e5e5e5` *(D)* | **1.26** | **1.15** | — | — | — |

*(Warning-on-white is 1.6:1 — `--warning` is **never** used as a foreground on light; only navy-on-warning-tint, which passes. `--success` foreground uses were migrated to `--success-text` in Stage 1.)*

---

## 9. Change history

| Date | Change | Tokens | Rationale |
|---|---|---|---|
| — (baseline) | Canonical `tokens.json` established; `oklch()` neutrals + hex brand | 40 tokens | design-system consolidation |
| 2026-09-03 · Stage 1 | `--muted-foreground` `oklch(0.556 0 0)` → **`#6b6b6b`** | 1 changed | A11Y-D01 F04 — 4.34→4.88:1 on page bg |
| 2026-09-03 · Stage 1 | Added **`--success-text` `#34863a`**; migrated 28 `text-success` → `text-success-text` | 1 added | A11Y-D01 F05/F13 — 3.03→4.55:1 on white; keeps `--success` for fills |
| 2026-09-03 · Stage 1 | Success tint `bg-success/10` → **`bg-success/5`** (11 sites) | utility | A11Y-D01 F06 — 4.12→4.33:1 (still < 4.5, escalated) |

**Unchanged by Stage 1:** `--primary`, `--accent`, `--warning`, `--destructive`, `--success`, all `*-foreground`, `--border`, `--input`, `--ring`, chart palette, sidebar tokens.

---

## 10. Known colour issues (cross-ref A11Y-D01)

| ID | Issue | Priority | Status |
|---|---|---|---|
| F01 | `input`/`border` control boundary ≈ 1.2:1 (needs 3:1) | **P0** | open |
| F02 | Base focus `outline-ring/50` ≈ 2.8:1; width unset | **P0** | open |
| F03 | Focus ring on dark header ≈ 1.3:1 | P1 | open |
| F04 | `muted-foreground` on non-white | P1 | **resolved** (Stage 1) |
| F05 | `success` as text ≈ 3.0:1 | P1 | **resolved on white** (Stage 1) |
| F06 | `success-text` on success tint ≈ 4.33:1 | P1 | **improved, still < 4.5 — design review** |
| F07 | `destructive` text on its tint ≈ 4.06:1 | P1 | open |
| F08 | Footer/nav links — no persistent cue | P1 | **contrast resolved**, cue open |
| F09 | Chart palette single-hue ramp; swatch 1.76:1 | P1 | open |
| F10 | Choropleth "no data" ≈ low value; borders ≈ 1.2:1 | P2 | open |
| F11 | Chart labels 10–11px, borderline on tint | P2 | contrast improved (Stage 1); size open |
| F12 | Hover/active deltas ≈ 1.03:1 | P2 | open |
| F13 | Success icons at 3:1 threshold | P2 | **resolved** (Stage 1) |
| F14 | Focus ring merges with filled-control fill (no offset) | P2 | unverified |
| F15 | Low-alpha text colours of uncertain purpose (8) | P3 | unverified |
| F16 | Breadcrumb separator ≈ 3.0:1 | P3 | open |
| F17 | Focus obscured by sticky chrome | P2 | unverified |

---

## 11. Methodology & caveats

- **Contrast:** WCAG 2.2 relative-luminance formula. Hex tokens → exact. `oklch()` neutrals computed with `Y ≈ L³` (OKLab neutral identity); `oklch()` with chroma (`destructive`, `chart-2…5`, `secondary*`) approximated to the nearest common sRGB. All `oklch()`-derived and alpha-composite figures are **Derived** — verify in Chrome/Safari DevTools before acting on any value within ~±0.3 of a threshold. Earlier A11Y-D01 reports used a slightly different sRGB approximation for the greys (e.g. border cited as ~1.13:1 vs ~1.26:1 here); the difference does not change any pass/fail verdict.
- **Alpha tints:** `token/NN` = `color-mix(in oklab, var(--token) NN%, transparent)`. Because `transparent` contributes no colour, the composite over an opaque parent reduces to a standard sRGB alpha blend — so tint estimates here are reliable, modulo the base token's own `oklch()` approximation.
- **Usage counts:** ripgrep over `src/` for `(bg|text|border|ring|outline|fill|stroke|from|to|via|placeholder:text|decoration|ring-offset)-<token>(/NN)?`. Inline `var(--token)` (charts, choropleth) counted separately as "Active".
- **Scope:** colour only. Typography sizing, spacing, radii, motion, and non-colour a11y are out of scope for this document.
- This document is a **snapshot** at `d8f2f67` + working tree. Re-generate after any `tokens.json` change (`npm run gen:tokens`) and re-run the A11Y-D01 audit.
