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

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

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
    add('font', k, v, `--font-${k}`, `--font-${k}`)
  }
  for (const [k, v] of Object.entries(tokens.radius ?? {})) {
    if (k.startsWith('$')) continue
    if (k === 'DEFAULT') add('radius', k, v, '--radius', null)
    else add('radius', k, v, `--radius-${k}`, `--radius-${k}`)
  }
  for (const [k, v] of Object.entries(tokens.color ?? {})) {
    if (k.startsWith('$')) continue
    add('color', k, v, `--${kebab(k)}`, `--color-${kebab(k)}`)
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
  chart: 'Chart palette',
  sidebar: 'Sidebar',
  surface: 'App-chrome surfaces',
}
const groupOrder = ['font', 'radius', 'color', 'chart', 'sidebar', 'surface']

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

Semantic roles: \`primary\` (primary actions, focus ring, links), \`destructive\` (delete/irreversible), \`success\` (published / positive), \`warning\` (draft / attention / unsaved), \`muted\` (secondary text & fills), \`border\` / \`input\` (hairlines & field borders), \`accent\` (amber highlight).

### Chart palette

${mdTable(rowsFor('chart'))}

Categorical series colors for data visualizations. \`chart.1\` is the amber accent; \`chart.2\`–\`chart.5\` step through warm oranges.

### Sidebar

${mdTable(rowsFor('sidebar'))}

### App-chrome surfaces

${mdTable(rowsFor('surface'))}

\`page-background\` is the app canvas behind cards; \`header-background\` is the top nav bar; \`breadcrumb-background\` is the amber breadcrumb strip.

### Typography

${mdTable(rowsFor('font'))}

\`Inter\` (weights 300–700) and \`JetBrains Mono\` (400–500) are loaded from Google Fonts in \`index.html\`. Font **sizes / weights / line-heights** are Tailwind v4 defaults (\`text-xs\` … \`text-5xl\`) — not tokenized, not overridden.

### Border radius

${mdTable(rowsFor('radius'))}

\`radius.DEFAULT\` (\`--radius\`) is the base; \`sm\`/\`md\`/\`lg\`/\`xl\` are derived from it with \`calc()\` so the scale stays proportional. \`--radius-md\` backs \`rounded-md\` (the default control radius); cards use \`rounded-xl\`.

---

## Not tokenized (Tailwind v4 defaults)

These are intentionally **not** in \`tokens.json\` — the project uses Tailwind's defaults unmodified, so there is nothing project-specific to capture.

| Concern | Source |
|---|---|
| **Spacing scale** | Tailwind v4 default, \`0.25rem\` base unit (\`gap-2\`, \`p-4\`, \`px-6\` …). No \`@theme\` spacing overrides. |
| **Type scale** | Tailwind v4 default (\`text-xs\` … \`text-5xl\`). |
| **Shadows** | Tailwind v4 default (\`shadow-sm\`, \`shadow-lg\`). |
| **Breakpoints** | Tailwind v4 default (\`sm\` 640 / \`md\` 768 / \`lg\` 1024 / \`xl\` 1280 / \`2xl\` 1536). Two JS reads mirror these literally in \`ManagementTable.tsx\` (\`min-width: 768px\`, \`min-width: 1024px\`). |
| **Z-index, transitions** | Tailwind defaults + ad-hoc arbitrary values. |

---

## Component styles

Component variants are defined with \`class-variance-authority\` in \`src/components/ui/*\` and reference **only** the tokens above (never raw color/radius values).

### Button — \`src/components/ui/button.tsx\`

- **Base:** \`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium\`, \`disabled:opacity-50\`, focus ring \`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2\`.
- **Variants:** \`default\` (\`bg-primary text-primary-foreground\`), \`destructive\` (\`bg-destructive\`), \`outline\` (\`border border-input bg-background\`), \`secondary\` (\`bg-secondary\`), \`ghost\` (\`hover:bg-muted\`), \`link\` (\`text-primary underline-offset-4\`), \`successOutline\` (\`border-success text-success\`).
- **Sizes:** \`default\` h-10 · \`sm\` h-9 · \`lg\` h-11 · \`icon\` size-9.

### Badge — \`src/components/ui/badge.tsx\`

\`rounded-full border px-2.5 py-0.5 text-xs font-medium\`. Variants: \`default\` \`bg-primary\`, \`secondary\` \`bg-secondary\`, \`outline\`, \`accent\` \`bg-accent\`, \`success\` \`bg-success/10 text-success\`, \`warning\` \`bg-warning/20 text-warning-foreground\`, \`muted\`.

### Input / control surfaces

Inputs, textareas and selects: \`h-10 rounded-md border border-input bg-background\`, focus \`ring-2 ring-ring border-ring\`, invalid \`border-destructive ring-destructive/20\` (driven by \`aria-invalid\`).

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
| Published | \`success\` / \`success-foreground\` | \`StatusBadge\`, dashboard resume rail |
| Draft | \`warning\` / \`warning-foreground\` | \`StatusBadge\` |
| Unsaved / unpublished edits | \`warning\` | \`StatusBadge\` "Unsaved changes" chip, \`WorkspaceHeader\` |
| Destructive / irreversible | \`destructive\` / \`destructive-foreground\` | delete actions, \`confirm-dialog\`, \`FieldError\` |
| Field error | \`destructive\` | \`FieldError\`, \`aria-invalid\` styling |
| Focus | \`ring\` | \`focus-visible:ring-ring\` on \`Button\`, \`Input\`; base layer \`outline-ring/50\` |

---

## Shared UI components

Located in \`src/components/ui/\` (design-system primitives) and \`src/components/shared/\` (cross-module composites). All consume the tokens above via Tailwind utilities.

**Primitives:** \`button\`, \`badge\`, \`input\`, \`textarea\`, \`label\`, \`checkbox\`, \`radio-group\`, \`select\` / \`searchable-select\` / \`multi-select\`, \`popover\`, \`tooltip\`, \`dialog\`, \`card\`, \`stepper\`, \`toast\`, \`confirm-dialog\`, \`field-error\`, \`tag-input\`, \`rich-text-editor\`.

**Shared composites:** \`ManagementTable\`, \`StatusBadge\`, \`ResourcePreviewDialog\`, \`LeaveCreationDialog\`, \`ReviewSection\`, \`FileUploadField\` / \`DropzoneUploadField\`, \`TruncatedText\`, \`OrganisationSearchField\`, \`DatasetConnectionsCard\`.

Dialogs use one platform pattern: Radix \`Dialog\` with \`center\` / \`right-drawer\` / \`anchored\` variants (\`src/components/ui/dialog.tsx\`).

---

## Responsive / layout conventions

- **Container:** main content is \`max-w-[1760px]\` centered with \`px-10 py-8\`; sidebar + main become a row at \`md\` (\`src/App.tsx\`).
- **Workspace height:** \`src/lib/layout.ts\` exports \`WORKSPACE_HEIGHT_CLASS\` (\`md:h-[calc(100vh-188px)]\`) and \`WORKSPACE_MAX_HEIGHT_CLASS\` — the 188px = 88 header + 36 breadcrumb + 32 + 32 page padding.
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
