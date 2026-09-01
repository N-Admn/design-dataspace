<!-- GENERATED: token tables come from tokens.json via `npm run gen:tokens`.
     The narrative sections (Spacing, Component styles, Shared UI components,
     Responsive/layout, Proposed) describe the implementation and are maintained
     in scripts/generate-tokens.mjs. Do not hand-edit this file. -->

# CivicDataSpace Design Tokens

Canonical, machine-readable source of truth for CivicDataSpace design tokens. All values here were audited from the implemented tokens in src/index.css — nothing was invented, and no proposed/unimplemented values (dark mode, secondary→amber remap, etc.) are included. The Tailwind v4 theme in src/generated/tokens.css is GENERATED from this file via `npm run gen:tokens`; do not hand-edit that file. design-system.md is also generated from this file.

- **Canonical source of truth:** [`tokens.json`](tokens.json) (repository root)
- **Generated Tailwind layer:** `src/generated/tokens.css` — imported by `src/index.css`
- **Tailwind:** v4 — @theme inline lives in src/generated/tokens.css
- Everything under **Implemented tokens** is live in the running app. Everything under **Proposed** is not implemented and is not in `tokens.json`.

---

## Implemented tokens

### Colors — base, brand & semantic

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `color.background` | `--background` | `--color-background` | `oklch(1 0 0)` |
| `color.foreground` | `--foreground` | `--color-foreground` | `oklch(0.145 0 0)` |
| `color.card` | `--card` | `--color-card` | `oklch(1 0 0)` |
| `color.cardForeground` | `--card-foreground` | `--color-card-foreground` | `oklch(0.145 0 0)` |
| `color.popover` | `--popover` | `--color-popover` | `oklch(1 0 0)` |
| `color.popoverForeground` | `--popover-foreground` | `--color-popover-foreground` | `oklch(0.145 0 0)` |
| `color.primary` | `--primary` | `--color-primary` | `#0b3865` |
| `color.primaryForeground` | `--primary-foreground` | `--color-primary-foreground` | `#ffffff` |
| `color.secondary` | `--secondary` | `--color-secondary` | `oklch(0.967 0.001 286.375)` |
| `color.secondaryForeground` | `--secondary-foreground` | `--color-secondary-foreground` | `oklch(0.21 0.006 285.885)` |
| `color.muted` | `--muted` | `--color-muted` | `oklch(0.97 0 0)` |
| `color.mutedForeground` | `--muted-foreground` | `--color-muted-foreground` | `oklch(0.556 0 0)` |
| `color.accent` | `--accent` | `--color-accent` | `#fdb557` |
| `color.accentForeground` | `--accent-foreground` | `--color-accent-foreground` | `#0b3865` |
| `color.destructive` | `--destructive` | `--color-destructive` | `oklch(0.577 0.245 27.325)` |
| `color.destructiveForeground` | `--destructive-foreground` | `--color-destructive-foreground` | `#ffffff` |
| `color.success` | `--success` | `--color-success` | `#46a758` |
| `color.successForeground` | `--success-foreground` | `--color-success-foreground` | `#ffffff` |
| `color.warning` | `--warning` | `--color-warning` | `#ffc53d` |
| `color.warningForeground` | `--warning-foreground` | `--color-warning-foreground` | `#0b3865` |
| `color.border` | `--border` | `--color-border` | `oklch(0.922 0 0)` |
| `color.input` | `--input` | `--color-input` | `oklch(0.922 0 0)` |
| `color.ring` | `--ring` | `--color-ring` | `#0b3865` |

Semantic roles: `primary` (primary actions, focus ring, links), `destructive` (delete/irreversible), `success` (published / positive), `warning` (draft / attention / unsaved), `muted` (secondary text & fills), `border` / `input` (hairlines & field borders), `accent` (amber highlight).

### Chart palette

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `chart.1` | `--chart-1` | `--color-chart-1` | `#fdb557` |
| `chart.2` | `--chart-2` | `--color-chart-2` | `oklch(0.705 0.213 47.604)` |
| `chart.3` | `--chart-3` | `--color-chart-3` | `oklch(0.646 0.222 41.116)` |
| `chart.4` | `--chart-4` | `--color-chart-4` | `oklch(0.553 0.195 38.402)` |
| `chart.5` | `--chart-5` | `--color-chart-5` | `oklch(0.47 0.157 37.304)` |

Categorical series colors for data visualizations. `chart.1` is the amber accent; `chart.2`–`chart.5` step through warm oranges.

### Sidebar

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `sidebar.DEFAULT` | `--sidebar` | `--color-sidebar` | `oklch(0.985 0 0)` |
| `sidebar.foreground` | `--sidebar-foreground` | `--color-sidebar-foreground` | `oklch(0.145 0 0)` |
| `sidebar.primary` | `--sidebar-primary` | `--color-sidebar-primary` | `#0b3865` |
| `sidebar.primaryForeground` | `--sidebar-primary-foreground` | `--color-sidebar-primary-foreground` | `#ffffff` |
| `sidebar.accent` | `--sidebar-accent` | `--color-sidebar-accent` | `#fdb557` |
| `sidebar.accentForeground` | `--sidebar-accent-foreground` | `--color-sidebar-accent-foreground` | `#0b3865` |
| `sidebar.border` | `--sidebar-border` | `--color-sidebar-border` | `oklch(0.922 0 0)` |
| `sidebar.ring` | `--sidebar-ring` | `--color-sidebar-ring` | `#0b3865` |

### App-chrome surfaces

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `surface.pageBackground` | `--page-background` | `--color-page-background` | `#f3f5f8` |
| `surface.headerBackground` | `--header-background` | `--color-header-background` | `#0b2540` |
| `surface.breadcrumbBackground` | `--breadcrumb-background` | `--color-breadcrumb-background` | `#fdb557` |

`page-background` is the app canvas behind cards; `header-background` is the top nav bar; `breadcrumb-background` is the amber breadcrumb strip.

### Typography

| Token | CSS variable | Tailwind key | Value |
|---|---|---|---|
| `font.sans` | `--font-sans` | `--font-sans` | `'Inter', system-ui, sans-serif` |
| `font.mono` | `--font-mono` | `--font-mono` | `'JetBrains Mono', monospace` |

`Inter` (weights 300–700) and `JetBrains Mono` (400–500) are loaded from Google Fonts in `index.html`. Font **sizes / weights / line-heights** are Tailwind v4 defaults (`text-xs` … `text-5xl`) — not tokenized, not overridden.

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
| **Type scale** | Tailwind v4 default (`text-xs` … `text-5xl`). |
| **Shadows** | Tailwind v4 default (`shadow-sm`, `shadow-lg`). |
| **Breakpoints** | Tailwind v4 default (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536). Two JS reads mirror these literally in `ManagementTable.tsx` (`min-width: 768px`, `min-width: 1024px`). |
| **Z-index, transitions** | Tailwind defaults + ad-hoc arbitrary values. |

---

## Component styles

Component variants are defined with `class-variance-authority` in `src/components/ui/*` and reference **only** the tokens above (never raw color/radius values).

### Button — `src/components/ui/button.tsx`

- **Base:** `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium`, `disabled:opacity-50`, focus ring `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Variants:** `default` (`bg-primary text-primary-foreground`), `destructive` (`bg-destructive`), `outline` (`border border-input bg-background`), `secondary` (`bg-secondary`), `ghost` (`hover:bg-muted`), `link` (`text-primary underline-offset-4`), `successOutline` (`border-success text-success`).
- **Sizes:** `default` h-10 · `sm` h-9 · `lg` h-11 · `icon` size-9.

### Badge — `src/components/ui/badge.tsx`

`rounded-full border px-2.5 py-0.5 text-xs font-medium`. Variants: `default` `bg-primary`, `secondary` `bg-secondary`, `outline`, `accent` `bg-accent`, `success` `bg-success/10 text-success`, `warning` `bg-warning/20 text-warning-foreground`, `muted`.

### Input / control surfaces

Inputs, textareas and selects: `h-10 rounded-md border border-input bg-background`, focus `ring-2 ring-ring border-ring`, invalid `border-destructive ring-destructive/20` (driven by `aria-invalid`).

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
| Published | `success` / `success-foreground` | `StatusBadge`, dashboard resume rail |
| Draft | `warning` / `warning-foreground` | `StatusBadge` |
| Unsaved / unpublished edits | `warning` | `StatusBadge` "Unsaved changes" chip, `WorkspaceHeader` |
| Destructive / irreversible | `destructive` / `destructive-foreground` | delete actions, `confirm-dialog`, `FieldError` |
| Field error | `destructive` | `FieldError`, `aria-invalid` styling |
| Focus | `ring` | `focus-visible:ring-ring` on `Button`, `Input`; base layer `outline-ring/50` |

---

## Shared UI components

Located in `src/components/ui/` (design-system primitives) and `src/components/shared/` (cross-module composites). All consume the tokens above via Tailwind utilities.

**Primitives:** `button`, `badge`, `input`, `textarea`, `label`, `checkbox`, `radio-group`, `select` / `searchable-select` / `multi-select`, `popover`, `tooltip`, `dialog`, `card`, `stepper`, `toast`, `confirm-dialog`, `field-error`, `tag-input`, `rich-text-editor`.

**Shared composites:** `ManagementTable`, `StatusBadge`, `ResourcePreviewDialog`, `LeaveCreationDialog`, `ReviewSection`, `FileUploadField` / `DropzoneUploadField`, `TruncatedText`, `OrganisationSearchField`, `DatasetConnectionsCard`.

Dialogs use one platform pattern: Radix `Dialog` with `center` / `right-drawer` / `anchored` variants (`src/components/ui/dialog.tsx`).

---

## Responsive / layout conventions

- **Container:** main content is `max-w-[1760px]` centered with `px-10 py-8`; sidebar + main become a row at `md` (`src/App.tsx`).
- **Workspace height:** `src/lib/layout.ts` exports `WORKSPACE_HEIGHT_CLASS` (`md:h-[calc(100vh-188px)]`) and `WORKSPACE_MAX_HEIGHT_CLASS` — the 188px = 88 header + 36 breadcrumb + 32 + 32 page padding.
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
