# Token Reconciliation — Working Notes

**Status as of 2026-09-18: in progress, on branch `css-reconciliation` (already merged into `main` up through the commits below — check `git log` for the latest state before resuming).**

## Goal

Reconcile this app's Tailwind color/typography tokens with the naming convention used by [DataSpaceFrontend](https://github.com/CivicDataLab/DataSpaceFrontend), so developers moving between the two codebases don't have to relearn a different vocabulary for the same concepts. This is a **pure rename** exercise — no color, size, or weight value has been changed anywhere. Every new token is a `var()` alias pointing at an existing value.

## Key files

| File | Purpose |
|---|---|
| [`tokens.json`](tokens.json) | **The only hand-authored source.** Edit this to add/change any token. |
| [`scripts/generate-tokens.mjs`](scripts/generate-tokens.mjs) | Generates the two files below from `tokens.json`. Run `npm run gen:tokens` (also runs automatically via `predev`/`prebuild`). |
| [`src/generated/tokens.css`](src/generated/tokens.css) | Generated. The actual `:root` + `@theme inline` Tailwind layer. Never hand-edit. |
| [`design-system.md`](design-system.md) | Generated. Human-readable token reference — every group has a table. Look here first. |
| [`design-tokens/dataspace-tokens.css`](design-tokens/dataspace-tokens.css) | Standalone reference file modeling the *target* DataSpaceFrontend naming convention. Not imported anywhere in this app — it's what `tokens.json`'s new groups were designed to match. |
| [`src/index.css`](src/index.css) | Has the seven `.type-*` role classes (typography) and the `@theme` import. |

## How the naming works

Every color/typography concept now has **two layers**:

1. **Base ramp** (`base` group in `tokens.json`) — root-only CSS vars (`--base-navy-solid-9`, `--base-gray-solid-1`…`11`, etc.), never exposed as a Tailwind utility. These are `var()` aliases onto the original shadcn-style vars (`--primary`, `--background`, etc.) — the base ramp doesn't hold a duplicate literal hex, it just re-points to the existing one.
2. **Semantic layer** (`text`, `border`, `uiSurface`/`surface`, `action` groups) — these *are* exposed as Tailwind utilities, and are what components actually use in `className`. E.g. `text.default` → `--color-text-default` → usable as `text-text-default`.

### Full old → new class mapping

| Old class | New class |
|---|---|
| `bg-background` / `bg-card` / `bg-popover` | `bg-surface-default` |
| `text-foreground` / `text-card-foreground` / `text-popover-foreground` | `text-text-default` |
| `bg-muted` | `bg-surface-subdued` |
| `text-muted-foreground` | `text-text-subdued` |
| `bg-secondary` | `bg-surface-secondary` |
| `text-secondary-foreground` | `text-text-secondary` |
| `bg-accent` | `bg-surface-accent` |
| `text-accent-foreground` | `text-text-on-accent` |
| `bg-destructive` | `bg-surface-critical` |
| `text-destructive-foreground` | `text-text-on-brand` |
| `text-destructive-text` (the accessible-contrast destructive color) | `text-text-critical` |
| `text-destructive` **bare** (the vivid, non-accessible-checked destructive color — icons, required-field asterisks, hover states) | `text-text-critical-strong` |
| `bg-success` | `bg-surface-success` |
| `text-success-text` | `text-text-success` |
| `bg-warning` | `bg-surface-warning` |
| `text-warning-foreground` | `text-text-warning` |
| `border-border` | `border-border-default` |
| `border-input` | `border-border-input` |
| `border-destructive` / `ring-destructive` (invalid-state) | `border-border-critical` / `ring-border-critical` |
| `ring-ring` | `ring-border-focus` |
| `bg-control-hover` / `bg-control-active` | `bg-surface-hovered` / `bg-surface-pressed` |
| `bg-primary` (button/badge fills) | `bg-action-primary-default` |
| `text-primary-foreground` | `text-action-primary-text` |
| `bg-secondary` (as a *button* fill specifically) | `bg-action-secondary-default` |
| `border-success` / `hover:bg-success` (Button's `successOutline` variant specifically) | `border-action-success-outline-border` / `bg-action-success-outline-border` |
| `text-primary` / `border-primary` / `ring-primary` (generic non-button navy — links, headings, selected-card borders, brand accents) | `text-text-brand` / `border-border-brand` (⚠️ **not** `action-primary-*` — that's reserved for actual buttons/badges) |

**The doubled-word classes (`text-text-default`, `border-border-default`) are intentional, not a bug.** Tailwind generates a utility by concatenating `{utility-prefix}-{theme-key-name}` — since the token's own name starts with "text"/"border" (matching Tailwind's own `text-`/`border-` utility prefixes), the name doubles. This already existed in this codebase before the reconciliation (`border-border`, `ring-ring` were already real classes) — the new tokens are just consistent with that precedent. `bg-surface-*` and `bg-action-*` don't double because Tailwind's background prefix is `bg-`, not `surface-`/`action-`.

## Typography

Different shape of problem from colors. The seven `.type-*` classes (`type-display`, `type-heading-1/2/3`, `type-body`, `type-label`, `type-caption`) in `src/index.css` are **hand-written CSS bundling three properties** (font-size + line-height + font-weight) into one class — Tailwind's `@theme` can't hold a bundled value, and the team deliberately doesn't allow ad hoc `text-lg font-semibold`-style triplets in components.

So reconciling typography did **not** mean giving components new classes to adopt. Components still use `.type-heading-2` etc. exactly as before — **zero component files were touched**. Instead, the *values inside* those seven CSS rules now come from named `--font-size-*` / `--type-font-weight-*` / `--line-height-*` variables (root-only, never exposed as Tailwind utilities, so nothing invites picking an ad hoc size/weight outside the seven roles).

⚠️ **Important gotcha discovered here**: font-weight tokens are named `--type-font-weight-*`, **not** `--font-weight-*`. That exact namespace is reserved by Tailwind's own theme (`font-medium`/`font-semibold`/`font-bold` utilities). An unlayered `:root` declaration always wins over Tailwind's layered `@theme`, so naming these `--font-weight-semibold` etc. would have silently overridden Tailwind's own utility classes **app-wide**, the moment this token's value ever diverged from Tailwind's default (invisible today only by coincidence, since both happen to be 600). If extending this pattern elsewhere, always check whether a chosen variable name collides with a Tailwind-reserved theme namespace before shipping — do this by fetching the dev server's actual compiled CSS (`http://localhost:5173/src/index.css` while `npm run dev` is running) and grepping for duplicate `--property-name:` declarations, not by inspection alone.

## Verification method used for every commit

1. `npx tsc --noEmit -p tsconfig.app.json` — catches nothing about className strings, but confirms no TS breakage.
2. A precise word-boundary regex sweep for old class names (PowerShell `[regex]::Matches` with `(?<![\w-])...(?![\w-])`, NOT ripgrep — ripgrep doesn't support lookaround, and naive matching produces false positives against the intentionally-doubled new names).
3. Dev server HMR log checked for transform errors after every file edit.
4. **Fetched the dev server's actual compiled CSS output** (`Invoke-WebRequest http://localhost:5173/src/index.css`) and confirmed: (a) every renamed class generates a real rule, (b) it resolves through the correct `var()` chain to the identical original hex/value, including `color-mix()` opacity-modifier behavior (e.g. `bg-surface-success/5` produces the same output as the old `bg-success/5`), and (c) no duplicate/colliding property declarations exist anywhere in the compiled output.

This last step is what caught both real bugs in this exercise (see below) — reasoning about the CSS chain on paper wasn't enough; the compiled output had to be inspected directly.

## Two real bugs caught (and fixed) during this work

1. **`border-strong` circular reference.** A new `border.strong` token was initially planned to alias `base-gray-solid-8`, producing `--border-strong` — but that exact variable name already existed (from the original `color.borderStrong`, `#727272`). Declaring it twice in `:root` created a circular reference (`--border-strong` → `--base-gray-solid-8` → `--border-strong`). Fixed by reusing the existing variable and giving it a Tailwind key (`border-border-strong`) instead of duplicating it.
2. **`--font-weight-*` Tailwind namespace collision** (described above under Typography).

Both were only caught by inspecting the actual compiled CSS, not by reasoning about the token chain in the abstract.

## Progress

**Done:**
- Token layer (`tokens.json` + generator + `src/generated/tokens.css`) — colors and typography.
- `src/components/ui/*` (20 files — every design-system primitive).
- `src/components/shared/*` (12 files — cross-module composites).
- `src/components/dataset/*` (9 files with color usage).
- `design-tokens/dataspace-tokens.css` reference file added.

**Not started** (still on old class names — which still work fine, since old and new classes coexist by design):
- `src/components/usecase/*`
- `src/components/ai-model/*`
- `src/components/collaborative/*`
- `src/components/event/*`
- `src/components/chart/*`
- `src/components/publication/*`
- `src/components/discover/*`
- `src/components/layout/*`
- Top-level `src/pages/*.tsx`

## How to continue migrating a module

1. `git checkout css-reconciliation && git pull` (or recreate the branch from `main` if it's been merged and deleted — check `git log --oneline main` for the reconciliation commits to confirm what's already there).
2. Glob the module's files, then run a precise PowerShell regex sweep (see Verification method above) to find every old-class occurrence with line numbers.
3. Go file by file: read enough surrounding context to make each `Edit` `old_string` unique, apply the mapping table above. For ambiguous cases (is this navy usage a button, a link, or a selection border?), use judgment per the mapping table's brand/action distinction.
4. Re-run the precise regex sweep on the finished module — must return zero matches.
5. `tsc --noEmit`, check dev server HMR log, spot-check the compiled CSS for anything new/unusual.
6. Commit per module (not one giant commit), push to `css-reconciliation`.
7. Visual spot-check in the browser before considering the module done — since a typo'd class name produces no error anywhere, only silently-unstyled UI.
