# CDL DataSpace — Design System

Design tokens for the CDL DataSpace application, built on Tailwind CSS v4 and shadcn/ui conventions. Defined in `src/index.css` as CSS custom properties, exposed to Tailwind utilities via `@theme inline`.

## Typography

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `'Inter', system-ui, sans-serif` | Default body/UI font |
| `--font-mono` | `'JetBrains Mono', monospace` | Code, technical/data display |

Loaded via Google Fonts: Inter (weights 300–700), JetBrains Mono (weights 400–500).

## Color Tokens

### Brand

| Token | Value | Notes |
|---|---|---|
| `--primary` | `#0B3865` (deep navy) | Primary actions, ring, sidebar primary |
| `--primary-foreground` | `#FFFFFF` | Text/icons on primary |
| `--accent` | `#FDB557` (amber) | Accent highlights, sidebar accent |
| `--accent-foreground` | `#0B3865` (navy) | Text/icons on accent |
| `--ring` | `#0B3865` | Focus ring color |

### Neutral / Base

| Token | Value |
|---|---|
| `--background` | `oklch(1 0 0)` (white) |
| `--foreground` | `oklch(0.145 0 0)` (near-black) |
| `--card` / `--card-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` |
| `--popover` / `--popover-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` |
| `--secondary` | `oklch(0.967 0.001 286.375)` (light gray — default shadcn, **not yet remapped to amber**) |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)` |
| `--muted` | `oklch(0.97 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` |
| `--border` | `oklch(0.922 0 0)` |
| `--input` | `oklch(0.922 0 0)` |

### Status

| Token | Value | Foreground |
|---|---|---|
| `--destructive` | `oklch(0.577 0.245 27.325)` | — |
| `--success` | `#46A758` | `#FFFFFF` |
| `--warning` | `#FFC53D` | `#0B3865` |

### Charts

| Token | Value |
|---|---|
| `--chart-1` | `#FDB557` |
| `--chart-2` | `oklch(0.705 0.213 47.604)` |
| `--chart-3` | `oklch(0.646 0.222 41.116)` |
| `--chart-4` | `oklch(0.553 0.195 38.402)` |
| `--chart-5` | `oklch(0.47 0.157 37.304)` |

### Sidebar

| Token | Value |
|---|---|
| `--sidebar` | `oklch(0.985 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` |
| `--sidebar-primary` | `#0B3865` |
| `--sidebar-primary-foreground` | `#FFFFFF` |
| `--sidebar-accent` | `#FDB557` |
| `--sidebar-accent-foreground` | `#0B3865` |
| `--sidebar-border` | `oklch(0.922 0 0)` |
| `--sidebar-ring` | `#0B3865` |

## Radius

| Token | Value |
|---|---|
| `--radius` | `0.625rem` (base) |
| `--radius-sm` | `calc(var(--radius) - 2px)` |
| `--radius-md` | `var(--radius)` |
| `--radius-lg` | `calc(var(--radius) + 4px)` |
| `--radius-xl` | `calc(var(--radius) + 8px)` |

## Dark Mode

Not yet defined in `index.css` — no `.dark` block exists. Proposed values from earlier design work:

| Token | Proposed Dark Value |
|---|---|
| `--primary` (dark) | `#4A7BA6` (lightened navy, for contrast on dark backgrounds) |
| `--ring` (dark) | `#4A7BA6` |

## Open Items

- **`--secondary` vs `--accent` mismatch**: earlier token planning called for amber (`#FDB557`) on `--secondary`; the current file has amber on `--accent` instead, with `--secondary` left as the default shadcn gray. Needs a decision: remap `--secondary` to amber, or treat `--accent` as the canonical amber slot and update planning docs to match.
- **Dark mode block**: needs to be added to `index.css` as a `.dark { ... }` selector using the proposed lightened navy and any other adjusted tokens.
- **Figma source of truth**: token values here were extracted directly from CSS/exported files due to blocked Figma file access; should be reconciled against Figma once access is granted.
