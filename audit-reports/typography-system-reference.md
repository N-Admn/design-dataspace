# CivicDataSpace — Typography System Reference

**Date:** 2026-09-07 · **Repo state:** `main` @ `d8f2f67` + working tree
**Companion to:** `color-system-reference.md`, `design-system.md`, `accessibility-audit-v1.2.md` (ACC-FONT / A11Y-TYPE findings)

Catalogues every typographic decision in the app: font stack, loading, the size scale, weight, line-height, letter-spacing, transforms, decoration, truncation, per-component treatment, paragraph/block rhythm, and known issues. Descriptive — does not prescribe changes.

---

## 0. How to read this

- **Token** — a value defined in `tokens.json`. Only the two font *stacks* are tokenised; **sizes, weights, line-heights and spacing are Tailwind v4 defaults, unmodified** (there is no `@theme` typography or spacing override anywhere).
- **Uses** — count of Tailwind utility occurrences across `src/`.
- **px** — assuming the browser default 16px root; the app sets no root font-size.
- **A11Y-TYPE** cross-refs point at findings in `accessibility-audit-v1.2.md`.

---

## 1. Font stack & loading

### 1.1 Tokens (`tokens.json` → `--font-*`)

| Token | CSS var | Tailwind key | Value | Uses |
|---|---|---|---|---|
| `font.sans` | `--font-sans` | `--font-sans` | `'Inter', system-ui, sans-serif` | `font-sans` ×1 (on `body`) — the app default |
| `font.mono` | `--font-mono` | `--font-mono` | `'JetBrains Mono', monospace` | `font-mono` ×4 (code/data contexts) |

No serif token. No third face.

### 1.2 Loading (`index.html`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- **Inter** weights fetched: **300, 400, 500, 600, 700**.
- **JetBrains Mono** weights fetched: **400, 500**.
- `display=swap` — fallback text shows immediately, no FOIT (invisible-text flash). ✅ (A11Y-TYPE, resilient).
- `preconnect` to both Google Fonts hosts — reduces connection latency.
- **Fallback stacks are real:** `system-ui, sans-serif` / `monospace`. If Google Fonts is blocked/offline the UI stays readable. ✅
- **Weight 300 is fetched but never used** — see §4. Dead payload (~1 woff2 subset).

### 1.3 Application

- `src/index.css` `@layer base`: `body { @apply … font-sans antialiased }` — Inter + `-webkit-font-smoothing: antialiased` globally.
- No `font-optical-sizing`, no `font-feature-settings`, no `text-rendering` override.
- `font-mono` applied per-element only (4 sites): version notes, diagnostics block, copied-value display, an API-config helper line.

---

## 2. Type scale (Tailwind v4 defaults — not tokenised)

All font sizes come from Tailwind's built-in scale. **No custom sizes, no `@theme --text-*`.** Line-height is Tailwind's per-size default unless a `leading-*` utility overrides it (§5).

| Utility | rem | px | Default line-height | Ratio | Uses | Where |
|---|---|---:|---|---:|---:|---|
| `text-xs` | 0.75 | **12** | 1rem / 16px | 1.33 | **211** | badges, `FieldError`, helper/metadata, timestamps, table sub-text, breadcrumb, toast description, uppercase eyebrows, tooltip |
| `text-sm` | 0.875 | **14** | 1.25rem / 20px | 1.43 | **334** | body copy, form labels, buttons, inputs/textarea, table cells, list rows, dialog description, most descriptive text |
| `text-base` | 1 | **16** | 1.5rem / 24px | 1.50 | 18 | `CardTitle`, `DialogTitle`, a few standalone lead paragraphs |
| `text-lg` | 1.125 | **18** | 1.75rem / 28px | 1.56 | 25 | user-authored H3 blocks, big-number chart unit, section leads |
| `text-xl` | 1.25 | **20** | 1.75rem / 28px | 1.40 | 3 | user-authored H2 blocks (`UseCaseStep2Builder` / previews) |
| `text-2xl` | 1.5 | **24** | 2rem / 32px | 1.33 | **19** | **the standard section/page heading** — auth `<h1>`, preview-page `<h1>`, dashboard card titles ("My Workspace", "Continue Working") |
| `text-3xl` | 1.875 | **30** | 2.25rem / 36px | 1.20 | 1 | big-number chart currency symbol only |
| `text-5xl` | 3 | **48** | 1 (48px) | 1.00 | 2 | dashboard hero `<h1>`, big-number chart value |
| `text-6xl` | 3.75 | **60** | 1 (60px) | 1.00 | 1 | dashboard hero `<h1>` at `md:` |

**Not used:** `text-4xl`, `text-7xl`+.

### 2.1 Arbitrary sizes (below the scale)

| Utility | px | Uses | Where | Note |
|---|---:|---:|---|---|
| `text-[11px]` | 11 | 6 | chart axis / category labels (`ChartPreviewCanvas`), AI-model version notes | below the 12px floor for meaningful data labels (A11Y-TYPE FND-09/F11) |
| `text-[10px]` | 10 | 3 | map choropleth scale values (`MapChoroplethPreview`), a chip in `ChartStep2Create` | scale values are quantitative data at 10px |

### 2.2 Effective size distribution

`text-sm` (14px) + `text-xs` (12px) = **545 of ~623** font-size utilities (≈ 87%). The product runs almost entirely at 12–14px; 16px+ is reserved for card/dialog titles and page headings. The CivicDataSpace readability baseline (`design-system.md` / v1.2) recommends ≥ 14px for helper text, labels, table text and buttons and 12px only for genuinely secondary captions — a large share of the 211 `text-xs` uses carry primary-task or error content (A11Y-TYPE FND-08/F19).

---

## 3. Font weight

Numeric map: `font-normal` 400 · `font-medium` 500 · `font-semibold` 600 · `font-bold` 700 · `font-light` 300 (loaded, unused).

| Utility | Weight | Uses | Where |
|---|---:|---:|---|
| `font-medium` | 500 | **163** | buttons, labels, badges, nav, chips, "field-label" eyebrows, table headers, most emphasised inline text |
| `font-semibold` | 600 | **129** | `CardTitle`, `DialogTitle`, page/section headings (`text-2xl font-semibold`), stepper numerals, review "ready" text, dashboard titles |
| `font-normal` | 400 | 23 | explicitly-normal labels (e.g. a checkbox label that would otherwise inherit `font-medium` from `Label`), long-form copy |
| `font-bold` | 700 | **1** | big-number chart value only (`text-5xl font-bold`) |
| `font-light` | 300 | **0** | — fetched from Google Fonts, never applied |

- **Body default weight = 400** (Inter Regular via `font-sans` on `body`, no explicit weight; individual utilities raise it).
- **Hierarchy is carried by weight + size, never by weight alone** for structure — headings are `font-semibold` *and* larger *and* `text-primary` (navy). But several visually-primary section titles are `<p className="…font-semibold">` rather than semantic headings (A11Y-TYPE FND-17/FND-30).
- No thin/light weights on essential text. ✅ (A11Y-TYPE FND-27, IMPLEMENTED).

---

## 4. Line height

### 4.1 Defaults (no global override)

- Tailwind v4 Preflight sets `html { line-height: 1.5 }`; unclassed body text = **16px / 1.5**.
- Every `text-*` utility ships its own line-height (see §2 table) — e.g. `text-sm` → 1.43, `text-xs` → 1.33. These apply unless a `leading-*` utility is present.

### 4.2 Explicit `leading-*` overrides (all 8 occurrences)

| Utility | Ratio | Uses | Where | Note |
|---|---:|---:|---|---|
| `leading-none` | 1.00 | 3 | `ui/card.tsx` `CardTitle` (`text-base font-semibold leading-none`), `ui/label.tsx` `Label` (`text-sm font-medium leading-none`), `ChartPreviewCanvas` big-number value | **`CardTitle` & `Label` are wrap-capable** — a wrapped title/label collides; also fails the WCAG 1.4.12 line-height-1.5 override tolerance (A11Y-TYPE FND-10/FND-21). Big-number value is single-line, size-guaranteed → OK. |
| `leading-tight` | 1.25 | 2 | `ChartPreviewCanvas` axis labels (`text-[11px] leading-tight`) | dense chart chrome |
| `leading-relaxed` | ~1.625 | 2 | `LegalDialog` body copy, `RegisterPage` terms-checkbox label | long-form / multi-line text — appropriate |
| `leading-[1.05]` | 1.05 | 1 | `DashboardPage` hero `<h1>` (`text-5xl md:text-6xl`) | tight display heading — acceptable at that size |

### 4.3 Gaps

- Multi-line `text-xs` / `text-sm` blocks (helper text, empty-state copy, descriptions) inherit the bundled ~1.33 / ~1.43 ratio — below the 1.5× guidance for running text (A11Y-TYPE FND-25). Only two blocks opt into `leading-relaxed`.

---

## 5. Letter spacing (tracking)

| Utility | Value | Uses | Where |
|---|---|---:|---|
| `tracking-wide` | 0.025em | **22** | **exactly one pattern:** `text-xs font-medium uppercase tracking-wide text-muted-foreground` — the "eyebrow / field-group label" (review sections, preview metadata labels, `Step3Review` field labels, `PublishSuccessModal`). Sometimes `font-semibold` instead of `font-medium`. |

No `tracking-tight`, `tracking-tighter`, `tracking-wider`, `tracking-widest`, or arbitrary tracking anywhere. Body and heading text use Inter's native spacing (`tracking-normal`, 0).

---

## 6. Font variation, numerics & features

| Feature | Status |
|---|---|
| `font-variant-numeric` (`tabular-nums`, `slashed-zero`, `lining-nums`, `oldstyle-nums`, `proportional-nums`) | **NONE** — 0 occurrences |
| `font-feature-settings` / `@font-feature-values` | **NONE** |
| `font-variation-settings` (variable-font axes) | **NONE** — static weight instances are loaded, not a variable font |
| `font-optical-sizing` | not set (Inter static has no `opsz` axis anyway) |
| `font-stretch` / width | **NONE** |
| `italic` | **1** occurrence (`not-italic` 0). Effectively unused; Inter italic is **not fetched**, so `italic` would render a synthesised oblique. |

**Gap:** the product is data-table-heavy (dataset rows, row/column counts, file sizes, IDs, chart values, version strings) but sets **no `tabular-nums`** (columns of figures don't align) and **no slashed-zero / character-disambiguation** features. Inter's default `0`/`O` and `1`/`l`/`I` are only weakly distinguished. (A11Y-TYPE FND-12/FND-28.)

---

## 7. Text transform, decoration & wrapping

### 7.1 Transform

| Utility | Uses | Where |
|---|---:|---|
| `uppercase` | 23 | the eyebrow label pattern (§5); a few table-header contexts |
| `capitalize` | 2 | mobile-nav link labels (rendering a SCREAMING constant as Title Case) |
| `lowercase` | 1 | one nav label normalisation |
| `normal-case` | 0 | — |

### 7.2 Decoration

| Utility | Uses | Where |
|---|---:|---|
| `underline` | 31 | almost all are `hover:underline` on inline `text-primary` links (external-URL links in reviews/previews, "add / manage" affordances) **or** `[&_a]:underline` inside rich-text/preview prose blocks |
| `underline-offset-4` | (with `link` button variant) | `button.tsx` `link` variant — **0 usages** of the variant |
| `no-underline` / `line-through` | 0 | — |

**No standalone text link has a persistent (non-hover) underline.** Footer / top-nav "links" are `text-*` `<button>`s with only a hover colour/underline change (A11Y-D01 F08, A11Y-TYPE FND-15).

### 7.3 Wrapping, truncation, clamping

| Utility | Uses | Where | Note |
|---|---:|---|---|
| `truncate` | **61** | table primary column (via `TruncatedText`), file-row names, chart labels, user name/email, breadcrumb-adjacent | `TruncatedText` (list views) exposes the full value + becomes focusable when clipped ✅; the other ~55 raw `truncate` sites offer only a `title=` tooltip or nothing (A11Y-TYPE FND-24) |
| `whitespace-nowrap` | 5 | **baked into `buttonVariants` & `badgeVariants` base**, plus `ManagementTable` | button/badge labels can't wrap → overflow/clip at 200% text or in narrow cells (A11Y-TYPE FND-11/FND-22) |
| `whitespace-normal` | 1 | tooltip content (`TruncatedText` full-text tooltip) |
| `whitespace-pre-line` | 1 | one multi-line description render |
| `line-clamp-*` | **0** | not used anywhere |
| `text-balance` / `text-pretty` | 0 | headings do not use `text-wrap: balance` |

---

## 8. Per-component typography (design-system primitives)

`src/components/ui/*` — every text-bearing primitive. `leading` blank = inherits the size default.

| Component | Element | Size | Weight | Line-height | Transform / other |
|---|---|---|---|---|---|
| `Button` | label | `text-sm` (14) · `lg` → `text-base` (16) | `font-medium` (500) | default | `whitespace-nowrap` (base) |
| `Badge` | label | `text-xs` (12) | `font-medium` (500) | default | `whitespace-nowrap` (base) |
| `Card` → `CardTitle` | `<h3>` | `text-base` (16) | `font-semibold` (600) | **`leading-none`** | `text-primary` |
| `Card` → `CardHeader` `<p>` | subtitle | `text-sm` (14) | `font-normal` | default | `text-muted-foreground` |
| `Label` | `<label>` | `text-sm` (14) | `font-medium` (500) | **`leading-none`** | `text-foreground` |
| `Input` / `Textarea` | field text + placeholder | `text-sm` (14) | 400 | default | `placeholder:text-muted-foreground` |
| `Dialog` → `DialogTitle` | title | `text-base` (16) | `font-semibold` (600) | default | `text-primary` |
| `Dialog` → `DialogDescription` | body | `text-sm` (14) | 400 | default | `text-muted-foreground` |
| `Dialog` close | `sr-only` "Close" | — | — | — | screen-reader only |
| `Tooltip` content | — | `text-xs` (12) | `font-medium` (500) | default | `text-foreground` on `bg-card` |
| `Toast` | title | `text-sm` (14) | `font-medium` (500) | default | `text-foreground` |
| `Toast` | description | `text-xs` (12) | 400 | default | `text-muted-foreground` |
| `FieldError` | `<p>` | `text-xs` (12) | `font-medium` (500) | default | `text-destructive` — **not** `aria-describedby`-linked |
| `Stepper` | step numeral | `text-xs` (12) | `font-semibold` (600) | default | in a `size-6` circle |
| `Stepper` | step label | `text-xs` (12) | `font-medium` (500) | default | `text-primary` active / `text-muted-foreground` inactive |
| `RadioGroup` / `Checkbox` | (no own text) | — | — | — | consumers supply the `Label` |
| `SearchableSelect` / `MultiSelect(Filter)` | trigger + options | `text-sm` (14) | 400 | default | — |
| `TagInput` | chips + input | `text-sm` / `text-xs` | 400–500 | default | — |
| `rich-text-editor` | editable region | `text-sm` (14) | 400 | default | `prose-sm` **(no-op — `@tailwindcss/typography` is not installed)**; lists/links styled via `[&_ol] [&_ul] [&_a]` arbitrary selectors |

---

## 9. Heading & title system

There is **one dominant heading recipe** and a small set of variants — no `<h1>`–`<h6>` size tokens, no heading component beyond `CardTitle` / `DialogTitle`.

| Level | Recipe | Semantic element | Where |
|---|---|---|---|
| Hero (dashboard only) | `text-5xl md:text-6xl font-semibold leading-[1.05] text-primary` | `<h1>` | `DashboardPage` "Welcome to CivicDataSpace" |
| Page / section title | **`text-2xl font-semibold text-primary`** | `<h1>` on auth & preview pages; **`<p>`** on the dashboard cards | 19 sites — the workhorse heading |
| Card title | `text-base font-semibold leading-none text-primary` | `<h3>` (via `CardTitle`) | every `Card` |
| Dialog title | `text-base font-semibold text-primary` | Radix title (`<h2>` role) | every `Dialog` |
| User-authored H2 / H3 (use-case builder, previews) | `text-xl` / `text-lg font-semibold` (`text-primary` / `text-foreground`) | `<h2>` / `<h3>` | rich content blocks |
| Eyebrow / field-group label | `text-xs font-medium uppercase tracking-wide text-muted-foreground` | `<p>` | review/preview metadata labels |
| Review sub-section head | `text-sm` / `text-base font-semibold` **`<p>`** | non-heading | `*Step3/4Review`, `FileDetailsSheet`, dashboard "Continue Working" |

**Observations**
- Consistent visual scale (`text-2xl font-semibold text-primary` everywhere) — good uniformity.
- **Semantic gap:** several visually-primary titles are `<p className="font-semibold">`, not `<h*>`; heading *order* per rendered view is unverified (`<h1>` literal appears 19×, `<h2>` 20× across the tree). A11Y-TYPE FND-17/FND-30.
- Headings do not use `text-wrap: balance`.

---

## 10. Paragraph & block rhythm

- **Preflight resets** all default margins (`h1…h6`, `p`, `ul`, `blockquote` → `margin: 0`). Nothing relies on UA paragraph margins.
- **Vertical rhythm is explicit and local:** `gap-*` inside flex/grid containers, or `mt-1` / `mt-1.5` / `mt-2` / `mt-3` between a title and its supporting line. `space-y-*` is rarely used.
- **No paragraph-spacing token / scale.** No `prose` typographic rhythm (the plugin isn't installed — `prose-sm` classes are inert).
- Typical patterns:
  - Title + subtitle: `mt-1` (4px) or `mt-1.5` (6px).
  - Field: `Label` then `Input` with `mt-1.5`; `FieldError` with `mt-1.5`.
  - Card body stacks: `flex flex-col gap-5` (20px) — the standard form-field rhythm.
  - Section stacks: `gap-6` (24px).
- **WCAG 1.4.12 exposure:** user-applied paragraph-spacing (2× font-size) and line-height (1.5×) overrides are not explicitly accommodated; `leading-none` on shared `CardTitle`/`Label` and several fixed-height text containers are the risk points (A11Y-TYPE FND-21/FND-26).

---

## 11. Spacing / gap scale (context — not typography, but asked)

- **Tailwind v4 default spacing**, base unit `0.25rem` (4px). **No `@theme` spacing overrides** — `design-system.md` §"Not tokenized" confirms this is intentional.
- Common values in use: `gap-1`…`gap-6` (4–24px) for component internals, `gap-6`/`gap-10` for page sections, **`gap-15`** (60px) on the dashboard bento grid, `gap-2.5` in toasts.
- Container: `max-w-[1760px]` centred, `px-10 py-8` (`src/App.tsx`).
- Card padding: `CardHeader` `px-5 py-4`, `CardContent` `px-5 py-5` (often overridden to `p-0` for tables).
- Dialog padding: `DialogHeader` `px-6 py-4`; body regions `px-6 py-5`.
- One layout magic number: `--layout-chrome-offset: 188px` (`index.css`) = 88 header + 36 breadcrumb + 64 page padding — feeds the workspace/table heights (A11Y-TYPE FND-14/FND-23).

---

## 12. Body & global defaults

| Property | Value | Set where |
|---|---|---|
| font-family | `'Inter', system-ui, sans-serif` | `body { @apply font-sans }` |
| font-size (unclassed) | 16px | browser default (no root override) |
| line-height (unclassed) | 1.5 | Tailwind Preflight `html` |
| font-weight (unclassed) | 400 | Inter Regular |
| colour | `--foreground` (`oklch(0.145 0 0)`, near-black) | `body { @apply text-foreground }` |
| smoothing | `-webkit-font-smoothing: antialiased` | `body { @apply antialiased }` |
| `text-rendering` | UA default | — |
| letter-spacing | 0 (Inter native) | — |

No `@media (prefers-reduced-motion)` and no user-font-size / zoom-specific typography handling.

---

## 13. Mono (`JetBrains Mono`) usage

`font-mono` — 4 sites, all data/code contexts:

| File | Context | Size |
|---|---|---|
| `ai-model/AIModelVersionsStep.tsx:469` | version-tag input | `text-xs` |
| `ai-model/AIModelVersionsStep.tsx:1117` | diagnostics output block | `text-[11px]` |
| `dataset/PublishSuccessModal.tsx:37` | copied share-URL display | `text-sm` |
| `usecase/UseCaseStep2Builder.tsx:527` | API/config helper line | `text-xs` |

Mono is **not** used for dataset tables, IDs, file sizes, or chart values — those render in Inter with proportional figures (§6 gap).

---

## 14. Known typography issues (cross-ref `accessibility-audit-v1.2.md`)

| ID | Issue | Priority | Status |
|---|---|---|---|
| FND-08 | 12px (`text-xs`) carries essential content in ~211 places | P2 | open |
| FND-09 | `text-[11px]` ×6, `text-[10px]` ×3 — below the 12px floor | P2 | open |
| FND-10 / FND-21 | `leading-none` on shared `CardTitle` / `Label` — breaks 1.4.12 line-height override; collides on wrap | P2 | open |
| FND-11 / FND-22 | `whitespace-nowrap` baked into `buttonVariants` / `badgeVariants` — clips at 200% / narrow | P1 / P2 | open |
| FND-12 / FND-28 | No `tabular-nums` / slashed-zero for a data-heavy product | P2 | open |
| FND-14 / FND-23 | Reflow rests on hard-coded `--layout-chrome-offset: 188px` | P1 | open |
| FND-15 / FND-24 | `truncate` (×61) — good pattern (`TruncatedText`) not universal; its focusable node has no visible focus | P2 | open |
| FND-17 / FND-25 | Small-text line-height inherits ~1.33–1.43, below 1.5× for running copy | P3 | open |
| FND-17 / FND-30 | Section headings as `<p class="font-semibold">`, not `<h*>`; heading order unverified | P3 | open |
| FND-26 | 200% resize / 400% reflow / 1.4.12 text-spacing — untested | P2 | needs runtime |
| FND-27 | Font loading resilient (`display=swap`, real fallback, no thin weights used) | — | **IMPLEMENTED** |
| FND-29 | Images of text — only the logo (permitted exception) | — | **IMPLEMENTED** |
| — | Inter weight 300 fetched, never applied; `prose-sm` classes inert (`@tailwindcss/typography` not installed); `italic` used once without an italic face loaded | — | hygiene |

---

## 15. Summary characterisation

- **One family (Inter), one scale (Tailwind default), three weights in practice** (400/500/600; 700 once). Coherent and minimal.
- **The product lives at 12–14px** — 87% of font-size utilities. 16px+ is titles only.
- **Weight + size + navy colour** carry hierarchy; semantic heading markup is inconsistent behind that.
- **Zero OpenType feature usage** — no tabular figures, no disambiguation, on a data platform.
- **Two shared primitives (`CardTitle`, `Label`) hard-set `leading-none`**, and two (`Button`, `Badge`) hard-set `whitespace-nowrap` — the main typography-a11y pressure points.
- **Loading is solid** — swap, preconnect, real fallbacks; the only waste is the unused 300 weight.

---

## 16. Methodology

- Utility counts via ripgrep over `src/` for `text-*`, `font-*`, `leading-*`, `tracking-*`, `uppercase|lowercase|capitalize`, `underline|italic`, `truncate|whitespace-*|line-clamp-*`, `font-variant*|font-feature*|tabular-nums|slashed-zero`.
- Type-scale px/line-height values are Tailwind v4 defaults (no `@theme` typography block exists in `src/generated/tokens.css` or `src/index.css`).
- Snapshot at `d8f2f67` + working tree. Re-check after any `index.html` font-URL change, `tokens.json` `font.*` change, or introduction of `@theme --text-*` / a typography plugin.
