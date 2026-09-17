#!/usr/bin/env node
/**
 * Generates, from the canonical tokens.json:
 *   1. src/generated/tokens.css  — the Tailwind v4 :root + @theme inline layer
 *   2. design-system.md          — the human reference, token tables generated from JSON
 *
 * tokens.json is the ONLY hand-authored source. Never edit the outputs directly.
 *   Run: npm run gen:tokens   (also runs automatically via predev / prebuild)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tokens = JSON.parse(readFileSync(resolve(root, 'tokens.json'), 'utf8'))

const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()

/**
 * Flatten tokens.json into an ordered list of:
 *   { group, name, value, cssVar, themeVar | null }
 * cssVar  → the --custom-property emitted in :root
 * themeVar → the key emitted in @theme inline (null = not exposed as a Tailwind key)
 */
function flatten() {
  const out = []
  const add = (group, name, value, cssVar, themeVar) => out.push({ group, name, value, cssVar, themeVar })

  for (const [k, v] of Object.entries(tokens.font ?? {})) {
    if (k.startsWith('$')) continue
    // cssVar carries the new DataSpace-reconciled name; themeVar stays --font-K so the
    // live font-sans/font-mono Tailwind utility classes are unaffected.
    add('font', k, v, `--font-family-${k}`, `--font-${k}`)
  }
  for (const [k, v] of Object.entries(tokens.fontSize ?? {})) {
    if (k.startsWith('$')) continue
    add('fontSize', k, v, `--font-size-${kebab(k)}`, null)
  }
  for (const [k, v] of Object.entries(tokens.fontWeight ?? {})) {
    if (k.startsWith('$')) continue
    // NOT --font-weight-<k>: that exact namespace is reserved by Tailwind's own theme
    // (font-medium/font-semibold/font-bold) -- colliding would silently override those
    // utilities app-wide. See tokens.json's fontWeight.$description.
    add('fontWeight', k, v, `--type-font-weight-${kebab(k)}`, null)
  }
  for (const [k, v] of Object.entries(tokens.lineHeight ?? {})) {
    if (k.startsWith('$')) continue
    add('lineHeight', k, v, `--line-height-${kebab(k)}`, null)
  }
  for (const [k, v] of Object.entries(tokens.radius ?? {})) {
    if (k.startsWith('$')) continue
    if (k === 'DEFAULT') add('radius', k, v, '--radius', null)
    else add('radius', k, v, `--radius-${k}`, `--radius-${k}`)
  }
  // Emitted as a :root var but NOT as a Tailwind @theme color key — consumed via
  // var() in arbitrary-value utilities, to avoid a doubled utility name
  // (ring-ring-on-dark). borderStrong now DOES get a theme key (border-border-strong)
  // as part of the DataSpace token reconciliation — see tokens.json's `border` group.
  const COLOR_ROOT_ONLY = new Set(['ringOnDark'])
  for (const [k, v] of Object.entries(tokens.color ?? {})) {
    if (k.startsWith('$')) continue
    add('color', k, v, `--${kebab(k)}`, COLOR_ROOT_ONLY.has(k) ? null : `--color-${kebab(k)}`)
  }
  // Base color ramps — root-only by design (see tokens.json's `base.$description`):
  // components consume the semantic layer below, never these directly.
  for (const [k, v] of Object.entries(tokens.base ?? {})) {
    if (k.startsWith('$')) continue
    add('base', k, v, `--base-${kebab(k)}`, null)
  }
  for (const [k, v] of Object.entries(tokens.text ?? {})) {
    if (k.startsWith('$')) continue
    add('text', k, v, `--text-${kebab(k)}`, `--color-text-${kebab(k)}`)
  }
  for (const [k, v] of Object.entries(tokens.border ?? {})) {
    if (k.startsWith('$')) continue
    add('border', k, v, `--border-${kebab(k)}`, `--color-border-${kebab(k)}`)
  }
  for (const [k, v] of Object.entries(tokens.uiSurface ?? {})) {
    if (k.startsWith('$')) continue
    add('uiSurface', k, v, `--surface-${kebab(k)}`, `--color-surface-${kebab(k)}`)
  }
  for (const [k, v] of Object.entries(tokens.action ?? {})) {
    if (k.startsWith('$')) continue
    add('action', k, v, `--action-${kebab(k)}`, `--color-action-${kebab(k)}`)
  }
  for (const [k, v] of Object.entries(tokens.chart ?? {})) {
    if (k.startsWith('$')) continue
    add('chart', k, v, `--chart-${k}`, `--color-chart-${k}`)
  }
  for (const [k, v] of Object.entries(tokens.sidebar ?? {})) {
    if (k.startsWith('$')) continue
    const suffix = k === 'DEFAULT' ? '' : `-${kebab(k)}`
    add('sidebar', k, v, `--sidebar${suffix}`, `--color-sidebar${suffix}`)
  }
  for (const [k, v] of Object.entries(tokens.surface ?? {})) {
    if (k.startsWith('$')) continue
    add('surface', k, v, `--${kebab(k)}`, `--color-${kebab(k)}`)
  }
  return out
}

const all = flatten()
const groupTitles = {
  font: 'Typography',
  radius: 'Border radius',
  color: 'Base, brand & semantic colors',
  base: 'DataSpace token reconciliation — base color ramps (internal, no Tailwind utility)',
  text: 'DataSpace token reconciliation — text colors',
  border: 'DataSpace token reconciliation — border colors',
  action: 'DataSpace token reconciliation — action colors',
  fontSize: 'DataSpace token reconciliation — font sizes (internal, backs .type-*)',
  fontWeight: 'DataSpace token reconciliation — font weights (internal, backs .type-*)',
  lineHeight: 'DataSpace token reconciliation — line heights (internal, backs .type-*)',
  chart: 'Chart palette',
  sidebar: 'Sidebar',
  surface: 'App-chrome surfaces',
  uiSurface: 'DataSpace token reconciliation — UI surfaces',
}
const groupOrder = [
  'font',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'radius',
  'color',
  'base',
  'text',
  'border',
  'uiSurface',
  'action',
  'chart',
  'sidebar',
  'surface',
]

/* ------------------------------------------------------------------ CSS ---- */
function buildCss() {
  const rootLines = []
  const themeLines = []
  for (const g of groupOrder) {
    const items = all.filter((t) => t.group === g)
    if (!items.length) continue
    rootLines.push(`  /* ${groupTitles[g]} */`)
    for (const t of items) rootLines.push(`  ${t.cssVar}: ${t.value};`)
    rootLines.push('')
    const themed = items.filter((t) => t.themeVar)
    if (themed.length) {
      themeLines.push(`  /* ${groupTitles[g]} */`)
      for (const t of themed) themeLines.push(`  ${t.themeVar}: var(${t.cssVar});`)
      themeLines.push('')
    }
  }
  return `/* GENERATED FROM tokens.json — DO NOT EDIT.
 * Regenerate with: npm run gen:tokens
 * Canonical source of truth: ../../tokens.json
 */

:root {
${rootLines.join('\n').replace(/\n+$/, '')}
}

@theme inline {
${themeLines.join('\n').replace(/\n+$/, '')}
}
`
}

/* ------------------------------------------------------------------ MD ----- */
function mdTable(rows) {
  return ['| Token | CSS variable | Tailwind key | Value |', '|---|---|---|---|', ...rows].join('\n')
}
function rowsFor(group) {
  return all
    .filter((t) => t.group === group)
    .map((t) => `| \`${group}.${t.name}\` | \`${t.cssVar}\` | ${t.themeVar ? `\`${t.themeVar}\`` : '—'} | \`${t.value}\` |`)
}

function buildMd() {
  const meta = tokens.$meta ?? {}
  return `<!-- GENERATED: token tables come from tokens.json via \`npm run gen:tokens\`.
     The narrative sections (Spacing, Component styles, Shared UI components,
     Responsive/layout, Proposed) describe the implementation and are maintained
     in scripts/generate-tokens.mjs. Do not hand-edit this file. -->

# ${meta.name ?? 'Design System'}

${meta.description ?? ''}

- **Canonical source of truth:** [\`tokens.json\`](tokens.json) (repository root)
- **Generated Tailwind layer:** \`src/generated/tokens.css\` — imported by \`src/index.css\`
- **Tailwind:** ${meta.tailwind ?? 'v4'}
- Everything under **Implemented tokens** is live in the running app. Everything under **Proposed** is not implemented and is not in \`tokens.json\`.

---

## Implemented tokens

### Colors — base, brand & semantic

${mdTable(rowsFor('color'))}

Semantic roles: \`primary\` (primary actions, focus ring, links), \`destructive\` (delete/irreversible — solid fills/icons only), \`destructiveText\` (destructive text on tinted backgrounds), \`success\` (fills/borders only), \`successText\` (published / positive text), \`warning\` (draft / attention / unsaved), \`muted\` (secondary text & fills), \`border\` (decorative hairlines), \`input\` (meaningful control boundaries — distinct from \`border\`, satisfies 3:1 non-text contrast), \`accent\` (amber highlight), \`ringOnDark\` (focus indicator on dark surfaces), \`controlHover\` / \`controlActive\` (interaction states), \`borderStrong\` (boundaries against tinted/colored fills, e.g. choropleth outlines). \`ringOnDark\` and \`borderStrong\` are :root vars only (no Tailwind color key) — consume via \`var()\`.

### DataSpace token reconciliation (in progress)

A parallel semantic naming layer, reconciling this app's tokens with the naming convention used by [DataSpaceFrontend](https://github.com/CivicDataLab/DataSpaceFrontend). Every value below is a \`var()\` alias back to the tokens in the section above — no color value is duplicated or changed. This layer is additive: existing classes (\`bg-primary\`, \`text-muted-foreground\`, etc.) still work unchanged while components migrate to the new names module by module.

**Base ramps** (root-only — never a Tailwind utility; components consume the semantic tables below instead):

${mdTable(rowsFor('base'))}

**Text colors** — usable as e.g. \`text-text-default\`. The doubled "text" is an accepted consequence of Tailwind's \`text-\` utility prefix matching this family's own name (the existing \`border-border\` / \`ring-ring\` tokens already do the same thing):

${mdTable(rowsFor('text'))}

**Border colors** — usable as e.g. \`border-border-default\`:

${mdTable(rowsFor('border'))}

**UI surfaces** — usable as e.g. \`bg-surface-default\` (distinct from the app-chrome \`surface\` group further down, which covers page/header/breadcrumb/hero-gradient/sidebar):

${mdTable(rowsFor('uiSurface'))}

**Action colors** — composite tokens for Button/Badge, usable as e.g. \`bg-action-primary-default\`:

${mdTable(rowsFor('action'))}

### Chart palette

${mdTable(rowsFor('chart'))}

Categorical series colors for data visualizations — an amber-to-brown ramp calibrated so every stop independently clears 3:1 against white (3.27 / 4.30 / 5.26 / 6.47 / 7.61). \`chart.1\` no longer aliases \`accent\`; the brand amber stays unchanged elsewhere. Contrast alone does not satisfy WCAG 1.4.1 for categorical series — pair with direct labels, markers, or patterns.

### Sidebar

${mdTable(rowsFor('sidebar'))}

### App-chrome surfaces

${mdTable(rowsFor('surface'))}

\`page-background\` is the app canvas behind cards; \`header-background\` is the top nav bar; \`breadcrumb-background\` is the amber breadcrumb strip. \`workspace-hero-from\` / \`workspace-hero-to\` are the two stops of the Dashboard "My Workspace" panel wash — composed inline as \`linear-gradient(252deg, var(--workspace-hero-from) 0%, var(--workspace-hero-to) 97.53%)\`, the only place a raw gradient literal used to live.

### Typography

${mdTable(rowsFor('font'))}

\`Inter\` (weights 400–700 — 300 dropped, previously fetched but never applied) and \`JetBrains Mono\` (400–500) are loaded from Google Fonts in \`index.html\`.

**Type roles** — named size + line-height + weight bundles, implemented as an \`@layer components\` block (\`.type-*\`) in \`src/index.css\` since \`@theme\` can't hold a bundled value. Raw sizes still come from Tailwind; usage is role-governed, not ad hoc. Every page and component heading resolves to one of these classes — there are no free-standing \`text-lg/xl/2xl\` + \`font-semibold\` heading triplets left in \`src/\` (chart KPI numerals under **Data typography** are the deliberate exception). The scale has no 18px step: former \`text-lg\` section headers map up to \`.type-heading-2\` (20px), former \`text-lg\` local/error headers map to \`.type-heading-3\` (16px).

| Role | Class | Size | Line-height | Weight | Purpose |
|---|---|---|---|---|---|
| display | \`.type-display\` | 48–60px | 1.1× | 600 | one hero moment per screen |
| heading1 | \`.type-heading-1\` | 24px | 1.25× | 600 | page/section title |
| heading2 | \`.type-heading-2\` | 20px | 1.3× | 600 | sub-section title |
| heading3 | \`.type-heading-3\` | 16px | 1.25× | 600 | card/dialog/local title (backs \`CardTitle\`) |
| body | \`.type-body\` | 14px | 1.5× | 400 | multi-line reading copy, helper text |
| label | \`.type-label\` | 14px | 1.25× | 500 | form labels, buttons (backs \`Label\`) |
| caption | \`.type-caption\` | 12px | 1.33× | 400/500 | metadata, timestamps, table headers — single-line only |

12px (\`.type-caption\`) is the system-wide floor — nothing renders essential content smaller (the former 10–11px chart/map data labels are raised to it).

**Weight roles:** \`weight.regular\` 400 (body) · \`weight.medium\` 500 (labels/buttons/emphasis) · \`weight.semibold\` 600 (headings) · \`weight.bold\` 700 (large display numerals only). Nothing lighter than regular on essential text.

**Letter-spacing:** \`tracking.emphasis\` 0.025em, reserved for short uppercase field-group labels; everything else native.

### DataSpace token reconciliation — typography (in progress)

The seven \`.type-*\` role classes above are hand-written CSS in \`src/index.css\` (Tailwind's \`@theme\` can't hold a bundled size+line-height+weight value), so reconciling their naming doesn't mean new classes for components to adopt — components keep using \`.type-heading-2\` etc. exactly as before. Instead, the values *inside* those seven rules now come from named, DataSpace-reconciled variables, root-only (never exposed as a Tailwind utility, so nothing invites picking an ad hoc size/weight/line-height outside the seven roles):

${mdTable(rowsFor('fontSize'))}

${mdTable(rowsFor('fontWeight'))}

${mdTable(rowsFor('lineHeight'))}

\`font.sans\`/\`font.mono\` now also produce \`--font-family-sans\`/\`--font-family-mono\` alongside the unchanged \`--font-sans\`/\`--font-mono\` Tailwind keys, so the live \`font-sans\` utility class is unaffected.

Note the font-weight variables are named \`--type-font-weight-*\`, not \`--font-weight-*\` — that exact namespace is reserved by Tailwind's own theme for its \`font-medium\`/\`font-semibold\`/\`font-bold\` utilities, and colliding with it would silently override those utilities app-wide.

### Border radius

${mdTable(rowsFor('radius'))}

\`radius.DEFAULT\` (\`--radius\`) is the base; \`sm\`/\`md\`/\`lg\`/\`xl\` are derived from it with \`calc()\` so the scale stays proportional. \`--radius-md\` backs \`rounded-md\` (the default control radius); cards use \`rounded-xl\`.

---

## Not tokenized (Tailwind v4 defaults)

These are intentionally **not** in \`tokens.json\` — the project uses Tailwind's defaults unmodified, so there is nothing project-specific to capture.

| Concern | Source |
|---|---|
| **Spacing scale** | Tailwind v4 default, \`0.25rem\` base unit (\`gap-2\`, \`p-4\`, \`px-6\` …). No \`@theme\` spacing overrides. |
| **Type scale** | Raw sizes are Tailwind v4 defaults, but usage is governed by the named type roles above (\`.type-*\` in \`src/index.css\`), not picked ad hoc per component. |
| **Vertical rhythm** | \`space.title-to-body\` (small fixed gap) and \`space.paragraph\` (≥2× the paragraph's font size) replace ad hoc per-component margins. |
| **Shadows** | Tailwind v4 default (\`shadow-sm\`, \`shadow-lg\`). |
| **Breakpoints** | Tailwind v4 default (\`sm\` 640 / \`md\` 768 / \`lg\` 1024 / \`xl\` 1280 / \`2xl\` 1536). Two JS reads mirror these literally in \`ManagementTable.tsx\` (\`min-width: 768px\`, \`min-width: 1024px\`). |
| **Z-index, transitions** | Tailwind defaults + ad-hoc arbitrary values. |

---

## Component styles

Component variants are defined with \`class-variance-authority\` in \`src/components/ui/*\` and reference **only** the tokens above (never raw color/radius values).

### Focus behavior — \`src/index.css\` base layer

- Base indicator: \`:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }\` — full-opacity, explicit width/style (replaces the former diluted \`outline-ring/50\` with nothing set). Applies to every focusable element that doesn't set its own focus style.
- Dark chrome: \`[data-chrome="dark"] :focus-visible { outline-color: var(--ring-on-dark) }\` — \`TopNav\`'s \`<header>\` carries \`data-chrome="dark"\`, so header controls get a white outline (navy-on-navy would be invisible).
- \`:focus-visible { scroll-margin-top: 7.5rem; scroll-margin-bottom: 2rem }\` keeps focused targets clear of the sticky header + breadcrumb (WCAG 2.4.11).

### Button — \`src/components/ui/button.tsx\`

- **Base:** \`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium\`, \`disabled:opacity-50\`, focus ring \`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2\` (full opacity). **No default \`whitespace-nowrap\`** — wrapping is allowed unless a specific instance is provably short.
- **Variants:** \`default\` (\`bg-primary … active:bg-primary\`), \`destructive\` (\`bg-destructive\`), \`outline\` (\`border border-input bg-background hover:bg-control-hover active:bg-control-active\`), \`secondary\` (\`bg-secondary\`), \`ghost\` (\`hover:bg-control-hover active:bg-control-active\`), \`link\` (\`text-primary underline-offset-4 hover:underline focus-visible:underline\` — no rest-state underline; it appears on hover and keyboard focus), \`successOutline\` (\`border-success text-success-text\`).
- **Sizes:** \`default\` h-10 · \`sm\` h-9 · \`lg\` h-11 · \`icon\` size-9.

### Badge — \`src/components/ui/badge.tsx\`

\`rounded-full border px-2.5 py-0.5 text-xs font-medium\`, **no default \`whitespace-nowrap\`** (retained via \`className\` only where needed — e.g. \`StatusBadge\` in fixed-width table cells). Variants: \`default\` \`bg-primary\`, \`secondary\` \`bg-secondary\`, \`outline\`, \`accent\` \`bg-accent\`, \`success\` \`bg-success/5 text-success-text\`, \`warning\` \`bg-warning/20 text-warning-foreground\`, \`destructive\` \`bg-destructive/5 text-destructive-text\`, \`muted\`.

### Input / control surfaces

Inputs, textareas and selects: \`h-10 rounded-md border border-input bg-background\` — \`border-input\` (\`#8c8c8c\`) is now distinct from \`border\` so control boundaries meet 3:1 non-text contrast. Focus \`ring-2 ring-ring border-ring\`; invalid \`border-destructive ring-destructive/20\` (driven by \`aria-invalid\`), error text in \`text-destructive-text\`. Unchecked checkbox/radio borders draw from \`--input\`, not \`--border\`.

### CardTitle / Label

\`CardTitle\` = \`.type-heading-3\` (16px / 1.25× / 600) — line-height raised from the former \`leading-none\`. \`Label\` = \`.type-label\` (14px / 1.25× / 500) — same.

### Links

Standalone text links (footer, nav, external-URL references, the \`link\` button variant) carry **no rest-state underline** — colour (\`text-primary\`, or \`text-muted-foreground\` in the footer) is the only resting affordance, and the underline appears on \`hover\` and \`focus-visible\`. Links **inside body copy** (rich-text / \`prose\` blocks, \`[&_a]:underline\`) keep a persistent underline, since there they must be distinguishable from surrounding text without relying on colour (WCAG 1.4.1).

### Truncation

Truncated text goes through \`TruncatedText\`: full value exposed via tooltip, keyboard-focusable with a visible focus ring when clipped.

### Data typography

Table rows, chart values, and pie percentages apply \`tabular-nums\`. Chart / map data labels are ≥ 12px (\`.type-caption\` floor). Choropleth region outlines use \`--border-strong\`.

### Radius conventions

| Element | Radius |
|---|---|
| Buttons, inputs, small controls | \`rounded-md\` (\`--radius-md\`) |
| Cards, dialogs, list rows | \`rounded-xl\` / \`rounded-lg\` |
| Badges, pills, avatars | \`rounded-full\` |

---

## Semantic states

| State | Token(s) | Where it shows |
|---|---|---|
| Published | \`success-text\` (on \`bg-success/5\`) | \`StatusBadge\`, dashboard resume rail |
| Draft | \`warning\` / \`warning-foreground\` | \`StatusBadge\` |
| Unsaved / unpublished edits | \`warning\` | \`StatusBadge\` "Unsaved changes" chip, \`WorkspaceHeader\` |
| Destructive / irreversible (solid) | \`destructive\` / \`destructive-foreground\` | delete actions, \`confirm-dialog\` |
| Destructive text on tint | \`destructive-text\` | \`FieldError\`, error banners, inline error blocks |
| Focus (light) | \`ring\` (full opacity, explicit width/style) | \`focus-visible:ring-ring\` on \`Button\`/\`Input\`; base \`:focus-visible\` outline |
| Focus (dark chrome) | \`ring-on-dark\` | \`TopNav\` controls (via \`[data-chrome="dark"]\`) |
| Hover / active | \`control-hover\` / \`control-active\` | buttons, table rows, dropdown option rows |
| Link | \`text-primary\`; underline on \`hover\` / \`focus-visible\` only (persistent underline kept only for links inside body copy) | footer/nav links, external-URL references, \`link\` button variant |
| Title / heading | \`.type-heading-1/2/3\` | page, section, card, dialog titles |

---

## Shared UI components

Located in \`src/components/ui/\` (design-system primitives) and \`src/components/shared/\` (cross-module composites). All consume the tokens above via Tailwind utilities.

**Primitives:** \`button\`, \`badge\`, \`input\`, \`textarea\`, \`label\`, \`checkbox\`, \`radio-group\`, \`select\` / \`searchable-select\` / \`multi-select\`, \`popover\`, \`tooltip\`, \`dialog\`, \`card\`, \`stepper\`, \`toast\`, \`confirm-dialog\`, \`field-error\`, \`tag-input\`, \`rich-text-editor\`.

**Shared composites:** \`ManagementTable\`, \`StatusBadge\`, \`ResourcePreviewDialog\`, \`LeaveCreationDialog\`, \`ReviewSection\`, \`FileUploadField\` / \`DropzoneUploadField\`, \`TruncatedText\`, \`OrganisationSearchField\`, \`DatasetConnectionsCard\`.

Dialogs use one platform pattern: Radix \`Dialog\` with \`center\` / \`right-drawer\` / \`anchored\` variants (\`src/components/ui/dialog.tsx\`).

---

## Responsive / layout conventions

- **Container:** main content is \`max-w-[1760px]\` centered with \`px-10 py-8\`; sidebar + main become a row at \`md\` (\`src/App.tsx\`).
- **Workspace height:** \`src/lib/layout.ts\` builds height classes from \`var(--layout-chrome-offset)\`. That var is measured at runtime (\`ResizeObserver\` on the top nav + breadcrumb + 64px main padding, in \`App.tsx\`) rather than the former hardcoded \`188px\`, so it stays correct if chrome height changes under text-resize / at narrow widths. A \`188px\` static fallback remains in \`index.css\`.
- **Sticky chrome:** focusable targets carry \`scroll-margin-top\` (\`:focus-visible\` base rule) so keyboard focus is never fully hidden behind the sticky header/breadcrumb (WCAG 2.4.11).
- **Tables:** \`ManagementTable\` computes column fit in JS via \`useMediaQuery('(min-width: 768px)')\` / \`'(min-width: 1024px)'\` and scrolls horizontally below the combined min width.
- **Dialogs:** responsive widths (\`w-[calc(100%-2rem)] max-w-*\`), capped height (\`max-h-[calc(100vh-4rem)]\`), internal scroll regions.
- **Stepper:** progress-only until Review is reached with all steps valid, then the whole stepper unlocks as clickable navigation.

---

## Proposed (NOT implemented — not in \`tokens.json\`)

Carried forward from earlier design planning. These are **not** live and must not be treated as tokens until implemented in \`tokens.json\`.

| Item | Proposed value / note |
|---|---|
| Dark mode | No \`.dark\` block exists in the generated CSS. Earlier planning proposed \`--primary\` / \`--ring\` ≈ \`#4A7BA6\` (lightened navy) for dark surfaces. |
| \`secondary\` → amber | Earlier planning wanted amber (\`#FDB557\`) on \`--secondary\`; the implemented system puts amber on \`--accent\` and leaves \`--secondary\` as the shadcn gray. Needs a decision before either changes. |
| Figma reconciliation | Implemented values were extracted from CSS, not Figma. Reconcile once Figma access is granted. |

---

_This file is generated. Edit [\`tokens.json\`](tokens.json) for token values, or \`scripts/generate-tokens.mjs\` for the narrative sections, then run \`npm run gen:tokens\`._
`
}

/* ---------------------------------------------------------------- write ---- */
mkdirSync(resolve(root, 'src/generated'), { recursive: true })
writeFileSync(resolve(root, 'src/generated/tokens.css'), buildCss())
writeFileSync(resolve(root, 'design-system.md'), buildMd())

const themedCount = all.filter((t) => t.themeVar).length
console.log(
  `[gen:tokens] ${all.length} tokens → src/generated/tokens.css (${all.length} :root vars, ${themedCount} @theme keys) + design-system.md`,
)
