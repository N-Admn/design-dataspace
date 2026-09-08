<!-- GENERATED: token tables come from tokens.json via `npm run gen:tokens`.
     The narrative sections (Spacing, Component styles, Shared UI components,
     Responsive/layout, Proposed) describe the implementation and are maintained
     in scripts/generate-tokens.mjs. Do not hand-edit this file. -->

# CivicDataSpace Design Tokens

Canonical, machine-readable source of truth for CivicDataSpace design tokens. Values reflect the WCAG 2.2 AA color and typography remediation (accessibility audit, 2026-09-07) merged on top of the CSS-audited baseline. All colors are solid hex — where the baseline used oklch(), the hex is the exact OKLab→sRGB conversion. The Tailwind v4 theme in src/generated/tokens.css is GENERATED from this file via `npm run gen:tokens`; do not hand-edit that file. design-system.md is also generated from this file.

- **Canonical source of truth:** [`tokens.json`](tokens.json) (repository root)
- **Generated Tailwind layer:** `src/generated/tokens.css` — imported by `src/index.css`
- **Tailwind:** v4 — @theme inline lives in src/generated/tokens.css
- Everything under **Implemented tokens** is live in the running app. Everything under **Proposed** is not implemented and is not in `tokens.json`.

---

## Implemented tokens

### Colors — base, brand & semantic

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `color.background` | `--background` | `--color-background` | `#ffffff` |
| `color.foreground` | `--foreground` | `--color-foreground` | `#0a0a0a` |
| `color.card` | `--card` | `--color-card` | `#ffffff` |
| `color.cardForeground` | `--card-foreground` | `--color-card-foreground` | `#0a0a0a` |
| `color.popover` | `--popover` | `--color-popover` | `#ffffff` |
| `color.popoverForeground` | `--popover-foreground` | `--color-popover-foreground` | `#0a0a0a` |
| `color.primary` | `--primary` | `--color-primary` | `#0b3865` |
| `color.primaryForeground` | `--primary-foreground` | `--color-primary-foreground` | `#ffffff` |
| `color.secondary` | `--secondary` | `--color-secondary` | `#f4f4f5` |
| `color.secondaryForeground` | `--secondary-foreground` | `--color-secondary-foreground` | `#18181b` |
| `color.muted` | `--muted` | `--color-muted` | `#f5f5f5` |
| `color.mutedForeground` | `--muted-foreground` | `--color-muted-foreground` | `#6b6b6b` |
| `color.accent` | `--accent` | `--color-accent` | `#fdb557` |
| `color.accentForeground` | `--accent-foreground` | `--color-accent-foreground` | `#0b3865` |
| `color.destructive` | `--destructive` | `--color-destructive` | `#e7000b` |
| `color.destructiveText` | `--destructive-text` | `--color-destructive-text` | `#d12222` |
| `color.destructiveForeground` | `--destructive-foreground` | `--color-destructive-foreground` | `#ffffff` |
| `color.success` | `--success` | `--color-success` | `#46a758` |
| `color.successForeground` | `--success-foreground` | `--color-success-foreground` | `#ffffff` |
| `color.successText` | `--success-text` | `--color-success-text` | `#317f37` |
| `color.warning` | `--warning` | `--color-warning` | `#ffc53d` |
| `color.warningForeground` | `--warning-foreground` | `--color-warning-foreground` | `#0b3865` |
| `color.border` | `--border` | `--color-border` | `#e5e5e5` |
| `color.input` | `--input` | `--color-input` | `#8c8c8c` |
| `color.ring` | `--ring` | `--color-ring` | `#0b3865` |
| `color.ringOnDark` | `--ring-on-dark` | — | `#ffffff` |
| `color.controlHover` | `--control-hover` | `--color-control-hover` | `#e4e4e6` |
| `color.controlActive` | `--control-active` | `--color-control-active` | `#d8d8db` |
| `color.borderStrong` | `--border-strong` | — | `#727272` |

Semantic roles: `primary` (primary actions, focus ring, links), `destructive` (delete/irreversible — solid fills/icons only), `destructiveText` (destructive text on tinted backgrounds), `success` (fills/borders only), `successText` (published / positive text), `warning` (draft / attention / unsaved), `muted` (secondary text & fills), `border` (decorative hairlines), `input` (meaningful control boundaries — distinct from `border`, satisfies 3:1 non-text contrast), `accent` (amber highlight), `ringOnDark` (focus indicator on dark surfaces), `controlHover` / `controlActive` (interaction states), `borderStrong` (boundaries against tinted/colored fills, e.g. choropleth outlines). `ringOnDark` and `borderStrong` are :root vars only (no Tailwind color key) — consume via `var()`.

### Chart palette

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `chart.1` | `--chart-1` | `--color-chart-1` | `#d27802` |
| `chart.2` | `--chart-2` | `--color-chart-2` | `#b46702` |
| `chart.3` | `--chart-3` | `--color-chart-3` | `#a05b02` |
| `chart.4` | `--chart-4` | `--color-chart-4` | `#8b5002` |
| `chart.5` | `--chart-5` | `--color-chart-5` | `#7c4701` |

Categorical series colors for data visualizations — an amber-to-brown ramp calibrated so every stop independently clears 3:1 against white (3.27 / 4.30 / 5.26 / 6.47 / 7.61). `chart.1` no longer aliases `accent`; the brand amber stays unchanged elsewhere. Contrast alone does not satisfy WCAG 1.4.1 for categorical series — pair with direct labels, markers, or patterns.

### Sidebar

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `sidebar.DEFAULT` | `--sidebar` | `--color-sidebar` | `#fafafa` |
| `sidebar.foreground` | `--sidebar-foreground` | `--color-sidebar-foreground` | `#0a0a0a` |
| `sidebar.primary` | `--sidebar-primary` | `--color-sidebar-primary` | `#0b3865` |
| `sidebar.primaryForeground` | `--sidebar-primary-foreground` | `--color-sidebar-primary-foreground` | `#ffffff` |
| `sidebar.accent` | `--sidebar-accent` | `--color-sidebar-accent` | `#fdb557` |
| `sidebar.accentForeground` | `--sidebar-accent-foreground` | `--color-sidebar-accent-foreground` | `#0b3865` |
| `sidebar.border` | `--sidebar-border` | `--color-sidebar-border` | `#e5e5e5` |
| `sidebar.ring` | `--sidebar-ring` | `--color-sidebar-ring` | `#0b3865` |

### App-chrome surfaces

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `surface.pageBackground` | `--page-background` | `--color-page-background` | `#f3f5f8` |
| `surface.headerBackground` | `--header-background` | `--color-header-background` | `#0b2540` |
| `surface.breadcrumbBackground` | `--breadcrumb-background` | `--color-breadcrumb-background` | `#fdb557` |
| `surface.workspaceHeroFrom` | `--workspace-hero-from` | `--color-workspace-hero-from` | `#f4f5f8` |
| `surface.workspaceHeroTo` | `--workspace-hero-to` | `--color-workspace-hero-to` | `#d3e9ff` |

`page-background` is the app canvas behind cards; `header-background` is the top nav bar; `breadcrumb-background` is the amber breadcrumb strip. `workspace-hero-from` / `workspace-hero-to` are the two stops of the Dashboard "My Workspace" panel wash — composed inline as `linear-gradient(252deg, var(--workspace-hero-from) 0%, var(--workspace-hero-to) 97.53%)`, the only place a raw gradient literal used to live.

### Typography

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `font.sans` | `--font-sans` | `--font-sans` | `'Inter', system-ui, sans-serif` |
| `font.mono` | `--font-mono` | `--font-mono` | `'JetBrains Mono', monospace` |

`Inter` (weights 400–700 — 300 dropped, previously fetched but never applied) and `JetBrains Mono` (400–500) are loaded from Google Fonts in `index.html`.

**Type roles** — named size + line-height + weight bundles, implemented as an `@layer components` block (`.type-*`) in `src/index.css` since `@theme` can't hold a bundled value. Raw sizes still come from Tailwind; usage is role-governed, not ad hoc. Every page and component heading resolves to one of these classes — there are no free-standing `text-lg/xl/2xl` + `font-semibold` heading triplets left in `src/` (chart KPI numerals under **Data typography** are the deliberate exception). The scale has no 18px step: former `text-lg` section headers map up to `.type-heading-2` (20px), former `text-lg` local/error headers map to `.type-heading-3` (16px).

| Role | Class | Size | Line-height | Weight | Purpose |
|---|---|---|---|---|---|
| display | `.type-display` | 48–60px | 1.1× | 600 | one hero moment per screen |
| heading1 | `.type-heading-1` | 24px | 1.25× | 600 | page/section title |
| heading2 | `.type-heading-2` | 20px | 1.3× | 600 | sub-section title |
| heading3 | `.type-heading-3` | 16px | 1.25× | 600 | card/dialog/local title (backs `CardTitle`) |
| body | `.type-body` | 14px | 1.5× | 400 | multi-line reading copy, helper text |
| label | `.type-label` | 14px | 1.25× | 500 | form labels, buttons (backs `Label`) |
| caption | `.type-caption` | 12px | 1.33× | 400/500 | metadata, timestamps, table headers — single-line only |

12px (`.type-caption`) is the system-wide floor — nothing renders essential content smaller (the former 10–11px chart/map data labels are raised to it).

**Weight roles:** `weight.regular` 400 (body) · `weight.medium` 500 (labels/buttons/emphasis) · `weight.semibold` 600 (headings) · `weight.bold` 700 (large display numerals only). Nothing lighter than regular on essential text.

**Letter-spacing:** `tracking.emphasis` 0.025em, reserved for short uppercase field-group labels; everything else native.

### Border radius

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `radius.DEFAULT` | `--radius` | — | `0.625rem` |
| `radius.sm` | `--radius-sm` | `--radius-sm` | `calc(var(--radius) - 2px)` |
| `radius.md` | `--radius-md` | `--radius-md` | `var(--radius)` |
| `radius.lg` | `--radius-lg` | `--radius-lg` | `calc(var(--radius) + 4px)` |
| `radius.xl` | `--radius-xl` | `--radius-xl` | `calc(var(--radius) + 8px)` |

`radius.DEFAULT` (`--radius`) is the base; `sm`/`md`/`lg`/`xl` are derived from it with `calc()` so the scale stays proportional. `--radius-md` backs `rounded-md` (the default control radius); cards use `rounded-xl`.

---

## Not tokenized (Tailwind v4 defaults)

These are intentionally **not** in `tokens.json` — the project uses Tailwind's defaults unmodified, so there is nothing project-specific to capture.

| Concern | Source |
|---|---|
| **Spacing scale** | Tailwind v4 default, `0.25rem` base unit (`gap-2`, `p-4`, `px-6` …). No `@theme` spacing overrides. |
| **Type scale** | Raw sizes are Tailwind v4 defaults, but usage is governed by the named type roles above (`.type-*` in `src/index.css`), not picked ad hoc per component. |
| **Vertical rhythm** | `space.title-to-body` (small fixed gap) and `space.paragraph` (≥2× the paragraph's font size) replace ad hoc per-component margins. |
| **Shadows** | Tailwind v4 default (`shadow-sm`, `shadow-lg`). |
| **Breakpoints** | Tailwind v4 default (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536). Two JS reads mirror these literally in `ManagementTable.tsx` (`min-width: 768px`, `min-width: 1024px`). |
| **Z-index, transitions** | Tailwind defaults + ad-hoc arbitrary values. |

---

## Component styles

Component variants are defined with `class-variance-authority` in `src/components/ui/*` and reference **only** the tokens above (never raw color/radius values).

### Focus behavior — `src/index.css` base layer

- Base indicator: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }` — full-opacity, explicit width/style (replaces the former diluted `outline-ring/50` with nothing set). Applies to every focusable element that doesn't set its own focus style.
- Dark chrome: `[data-chrome="dark"] :focus-visible { outline-color: var(--ring-on-dark) }` — `TopNav`'s `<header>` carries `data-chrome="dark"`, so header controls get a white outline (navy-on-navy would be invisible).
- `:focus-visible { scroll-margin-top: 7.5rem; scroll-margin-bottom: 2rem }` keeps focused targets clear of the sticky header + breadcrumb (WCAG 2.4.11).

### Button — `src/components/ui/button.tsx`

- **Base:** `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium`, `disabled:opacity-50`, focus ring `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (full opacity). **No default `whitespace-nowrap`** — wrapping is allowed unless a specific instance is provably short.
- **Variants:** `default` (`bg-primary … active:bg-primary`), `destructive` (`bg-destructive`), `outline` (`border border-input bg-background hover:bg-control-hover active:bg-control-active`), `secondary` (`bg-secondary`), `ghost` (`hover:bg-control-hover active:bg-control-active`), `link` (`underline underline-offset-4 text-primary` — persistent, not hover-only), `successOutline` (`border-success text-success-text`).
- **Sizes:** `default` h-10 · `sm` h-9 · `lg` h-11 · `icon` size-9.

### Badge — `src/components/ui/badge.tsx`

`rounded-full border px-2.5 py-0.5 text-xs font-medium`, **no default `whitespace-nowrap`** (retained via `className` only where needed — e.g. `StatusBadge` in fixed-width table cells). Variants: `default` `bg-primary`, `secondary` `bg-secondary`, `outline`, `accent` `bg-accent`, `success` `bg-success/5 text-success-text`, `warning` `bg-warning/20 text-warning-foreground`, `destructive` `bg-destructive/5 text-destructive-text`, `muted`.

### Input / control surfaces

Inputs, textareas and selects: `h-10 rounded-md border border-input bg-background` — `border-input` (`#8c8c8c`) is now distinct from `border` so control boundaries meet 3:1 non-text contrast. Focus `ring-2 ring-ring border-ring`; invalid `border-destructive ring-destructive/20` (driven by `aria-invalid`), error text in `text-destructive-text`. Unchecked checkbox/radio borders draw from `--input`, not `--border`.

### CardTitle / Label

`CardTitle` = `.type-heading-3` (16px / 1.25× / 600) — line-height raised from the former `leading-none`. `Label` = `.type-label` (14px / 1.25× / 500) — same.

### Links

Standalone text links (footer, nav, external-URL references) use a persistent underline (`underline underline-offset-4`), not a hover-only treatment.

### Truncation

Truncated text goes through `TruncatedText`: full value exposed via tooltip, keyboard-focusable with a visible focus ring when clipped.

### Data typography

Table rows, chart values, and pie percentages apply `tabular-nums`. Chart / map data labels are ≥ 12px (`.type-caption` floor). Choropleth region outlines use `--border-strong`.

### Radius conventions

| Element | Radius |
|---|---|
| Buttons, inputs, small controls | `rounded-md` (`--radius-md`) |
| Cards, dialogs, list rows | `rounded-xl` / `rounded-lg` |
| Badges, pills, avatars | `rounded-full` |

---

## Semantic states

| State | Token(s) | Where it shows |
|---|---|---|
| Published | `success-text` (on `bg-success/5`) | `StatusBadge`, dashboard resume rail |
| Draft | `warning` / `warning-foreground` | `StatusBadge` |
| Unsaved / unpublished edits | `warning` | `StatusBadge` "Unsaved changes" chip, `WorkspaceHeader` |
| Destructive / irreversible (solid) | `destructive` / `destructive-foreground` | delete actions, `confirm-dialog` |
| Destructive text on tint | `destructive-text` | `FieldError`, error banners, inline error blocks |
| Focus (light) | `ring` (full opacity, explicit width/style) | `focus-visible:ring-ring` on `Button`/`Input`; base `:focus-visible` outline |
| Focus (dark chrome) | `ring-on-dark` | `TopNav` controls (via `[data-chrome="dark"]`) |
| Hover / active | `control-hover` / `control-active` | buttons, table rows, dropdown option rows |
| Link | persistent underline | footer/nav links, external-URL references |
| Title / heading | `.type-heading-1/2/3` | page, section, card, dialog titles |

---

## Shared UI components

Located in `src/components/ui/` (design-system primitives) and `src/components/shared/` (cross-module composites). All consume the tokens above via Tailwind utilities.

**Primitives:** `button`, `badge`, `input`, `textarea`, `label`, `checkbox`, `radio-group`, `select` / `searchable-select` / `multi-select`, `popover`, `tooltip`, `dialog`, `card`, `stepper`, `toast`, `confirm-dialog`, `field-error`, `tag-input`, `rich-text-editor`.

**Shared composites:** `ManagementTable`, `StatusBadge`, `ResourcePreviewDialog`, `LeaveCreationDialog`, `ReviewSection`, `FileUploadField` / `DropzoneUploadField`, `TruncatedText`, `OrganisationSearchField`, `DatasetConnectionsCard`.

Dialogs use one platform pattern: Radix `Dialog` with `center` / `right-drawer` / `anchored` variants (`src/components/ui/dialog.tsx`).

---

## Responsive / layout conventions

- **Container:** main content is `max-w-[1760px]` centered with `px-10 py-8`; sidebar + main become a row at `md` (`src/App.tsx`).
- **Workspace height:** `src/lib/layout.ts` builds height classes from `var(--layout-chrome-offset)`. That var is measured at runtime (`ResizeObserver` on the top nav + breadcrumb + 64px main padding, in `App.tsx`) rather than the former hardcoded `188px`, so it stays correct if chrome height changes under text-resize / at narrow widths. A `188px` static fallback remains in `index.css`.
- **Sticky chrome:** focusable targets carry `scroll-margin-top` (`:focus-visible` base rule) so keyboard focus is never fully hidden behind the sticky header/breadcrumb (WCAG 2.4.11).
- **Tables:** `ManagementTable` computes column fit in JS via `useMediaQuery('(min-width: 768px)')` / `'(min-width: 1024px)'` and scrolls horizontally below the combined min width.
- **Dialogs:** responsive widths (`w-[calc(100%-2rem)] max-w-*`), capped height (`max-h-[calc(100vh-4rem)]`), internal scroll regions.
- **Stepper:** progress-only until Review is reached with all steps valid, then the whole stepper unlocks as clickable navigation.

---

## Proposed (NOT implemented — not in `tokens.json`)

Carried forward from earlier design planning. These are **not** live and must not be treated as tokens until implemented in `tokens.json`.

| Item | Proposed value / note |
|---|---|
| Dark mode | No `.dark` block exists in the generated CSS. Earlier planning proposed `--primary` / `--ring` ≈ `#4A7BA6` (lightened navy) for dark surfaces. |
| `secondary` → amber | Earlier planning wanted amber (`#FDB557`) on `--secondary`; the implemented system puts amber on `--accent` and leaves `--secondary` as the shadcn gray. Needs a decision before either changes. |
| Figma reconciliation | Implemented values were extracted from CSS, not Figma. Reconcile once Figma access is granted. |

---

_This file is generated. Edit [`tokens.json`](tokens.json) for token values, or `scripts/generate-tokens.mjs` for the narrative sections, then run `npm run gen:tokens`._
