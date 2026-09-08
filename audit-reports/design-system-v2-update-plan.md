# Design System v2 — Update Plan

**Date:** 2026-09-07 · **Repo:** `main` @ `d8f2f67` + working tree
**Input:** `civicdataspace-design-tokens-v2.md` (proposed revision, 2026-09-07)
**Purpose:** enumerate exactly what changes, in what order, at what risk — and every decision / flag that must be resolved before or during implementation.

Nothing below is implemented. This is the plan.

---

## 1. Inventory — everything v2 proposes

| # | Change | Kind | Files | Risk | Blocked on |
|---|---|---|---|---|---|
| 1 | `--success-text` `#34863a` → `#317f37` | token value | `tokens.json` | Low | — |
| 2 | `--input` split from `--border`; `oklch(0.922)` → `#8c8c8c` | token value + role split | `tokens.json` | **Med (visual)** | — |
| 3 | `--chart-1…5` recolour; `chart-1` un-alias from `accent` | 5 token values | `tokens.json` | **Med (visual)** | — |
| 4 | New `--destructive-text` `#d12222` | new token + remap | `tokens.json`, ~4–6 components | Low–Med | D1 |
| 5 | New `--ring-on-dark` `#ffffff` | new token + wiring | `tokens.json`, `TopNav.tsx` | Low | D6 (naming) |
| 6 | New `--control-hover` `#e4e4e6`, `--control-active` `#d8d8db` | 2 new tokens + wiring | `tokens.json`, `button.tsx`, `ManagementTable.tsx`, dropdown option rows | **Med (scope)** | D2 |
| 7 | New `--border-strong` `#727272` | new token + wiring | `tokens.json`, `MapChoroplethPreview.tsx` | Low | D6 (naming) |
| 8 | Base focus outline: drop `/50`, full-opacity `--ring` | `index.css` base layer | `src/index.css` | Med | D3 (width/style) |
| 9 | `CardTitle` `leading-none` → `leading-tight` | class | `ui/card.tsx` | Low | — |
| 10 | `Label` `leading-none` → `leading-tight` | class | `ui/label.tsx` | Low | — |
| 11 | Remove `whitespace-nowrap` from `buttonVariants` + `badgeVariants` base | class | `ui/button.tsx`, `ui/badge.tsx` | **Med (layout)** | — |
| 12 | Drop weight `300` from the Inter font URL | markup | `index.html` | Low | — |
| 13 | 7 named **type roles** (`display`, `heading1–3`, `body`, `label`, `caption`) | **new system** | tokens?/generator?/components | **High** | **D4 (mechanism)** |
| 14 | Weight roles + letter-spacing role formalised | doc convention | — | Low | D4 |
| 15 | `type.caption` = hard 12px floor; raise `text-[10px]`/`[11px]` chart labels | class | `ChartPreviewCanvas.tsx`, `MapChoroplethPreview.tsx`, `ChartStep2Create.tsx` | Low | — |
| 16 | `type.body` line-height 1.5× on multi-line copy | **convention, no single hook** | many | **Med–High** | D4 |
| 17 | Persistent-underline `Link` primitive; adopt in footer / nav / inline links | variant edit + adoption | `ui/button.tsx` (`link` variant), `Footer.tsx`, `TopNav.tsx`, inline links | **Med (scope)** | D5 |
| 18 | Migrate ~55 raw `truncate` sites to `TruncatedText` | **systemic** | ~15+ files | **High** | D7 |
| 19 | `tabular-nums` on table/chart numerics; `font-mono` for identifiers | class + discovery | tables, charts, ID/version/URL renders | **Med (discovery)** | D8 |
| 20 | Section headings `<p className="font-semibold">` → real `<h2>/<h3>` | markup | `*Step3/4Review`, `FileDetailsSheet`, `DashboardPage`, others | **Med (per-view judgement)** | D9 |
| 21 | `--layout-chrome-offset: 188px` → measured / `min-height` fallback | layout refactor | `index.css`, `lib/layout.ts`, `App.tsx`, `ManagementTable.tsx`, `ContributorSidebar.tsx` | **High (behavioral)** | D10 |
| 22 | Named `space.title-to-body` / `space.paragraph` rhythm | **new system** | tokens?/convention | Med | D4 |
| 23 | Regenerate `tokens.css` + `design-system.md`; re-run both audits | process | `npm run gen:tokens` | Low | — |

**Unchanged and carried over:** `primary`, `accent`, `warning`, `destructive` (solid), `success` (fills), `border` (decorative), all neutrals, both font families, radius, breakpoints, spacing base, sidebar tokens (still unused), z-index/shadows/transitions.

---

## 2. Phased plan

### Phase A — Colour token values (mechanical, low risk)

**Edit `tokens.json` `color` group:**

```jsonc
"mutedForeground": "#6b6b6b",          // (already done in Stage 1 — no change)
"destructive":     "oklch(0.577 0.245 27.325)",   // unchanged
"destructiveText": "#d12222",          // NEW
"success":         "#46a758",          // unchanged
"successText":     "#317f37",          // CHANGED (was #34863a)
"input":           "#8c8c8c",          // CHANGED (was oklch(0.922 0 0); now distinct from --border)
"ring":            "#0b3865",          // unchanged
"ringOnDark":      "#ffffff",          // NEW   — see D6
"controlHover":    "#e4e4e6",          // NEW
"controlActive":   "#d8d8db",          // NEW
"borderStrong":    "#727272",          // NEW   — see D6
```

**Edit `tokens.json` `chart` group:**
```jsonc
"1": "#d27802", "2": "#b46702", "3": "#a05b02", "4": "#8b5002", "5": "#7c4701"
```

Then `npm run gen:tokens` → regenerates `src/generated/tokens.css` (each new `color` key → `--<kebab>` + `--color-<kebab>` + Tailwind utilities) and `design-system.md`.

**Verified maths** (WCAG relative-luminance, hex → exact):
- `#317f37` on white = **4.98:1** ✓ · on `bg-success/5` = **4.74:1** ✓ · on `bg-success/10` = **4.51:1** ✓ (resolves F06)
- `#8c8c8c` vs white field = **3.36:1** ✓ · vs `page-background #f3f5f8` = **3.08:1** ✓ (just clears; see R2)
- `#d12222` on white ≈ 5.9:1 · on `bg-destructive/10` ≈ ~5.0:1 · on `/5` ≈ ~5.3:1 ✓ (resolves F07) — *(D)* destructive base is oklch; confirm composited
- chart-1…5 on white: 3.27 / 4.30 / 5.26 / 6.47 / 7.61 — all ≥ 3:1 ✓ (v2's figures reproduce)
- `#ffffff` (ring-on-dark) on `header-background #0b2540` = **15.5:1** ✓
- `#e4e4e6` hover vs white ≈ 1.10:1 (Δ over the current ~1.03:1 — marginal improvement; see R4)
- `#727272` (border-strong) vs pale choropleth fills → ≥ 3:1 ✓

**No `border-input/NN` alpha variants exist** (25 plain uses) — the value swap is clean.

### Phase B — Wire the new colour tokens

| Token | Where to apply | Notes |
|---|---|---|
| `--success-text` `#317f37` | already consumed by 28 `text-success-text` sites | value change only, propagates via token |
| `--input` `#8c8c8c` | already consumed by 25 `border-input` sites | value change only; **no control uses `border-border` for its outer boundary** (the 4 `border-border` hits in selects are internal dividers — leave them) |
| `--destructive-text` | error **boxes/banners**: `Step2DataFiles.tsx:417`, `CollaborativePreviewPage.tsx:143`, `AIModelPreviewPage.tsx:156`; error-icon circle `HelpSupportPanel.tsx:289`; `FieldError` component; `LeaveCreationDialog` destructive-outline label | **D1** — decide whether the ~15 *transient hover-only* `hover:text-destructive` states also switch |
| `--ring-on-dark` | `TopNav.tsx` focusable controls (Search, EXPLORE, nav buttons, mobile menu, user-menu avatar) — `focus-visible` outline/ring colour override | not automatic; explicit per-control |
| `--control-hover` | `button.tsx` `ghost` + `outline` `hover:bg-muted` → `hover:bg-control-hover`; `ManagementTable` row hover; dropdown option rows in `searchable-select` / `multi-select` / `multi-select-filter` | **D2** — 31 `hover:bg-muted` total; scope which are "controls" |
| `--control-active` | add `active:bg-control-active` to `button.tsx` (`ghost`/`outline`/`default`?), `ManagementTable` rows | **net-new state class** everywhere it goes |
| `--border-strong` | `MapChoroplethPreview.tsx` — `stroke: var(--border)` → `var(--border-strong)` (2 spots: base region style + legend) | small |

### Phase C — Typography quick wins (low risk)

| # | Change | File |
|---|---|---|
| 9 | `CardTitle`: `leading-none` → `leading-tight` | `ui/card.tsx` |
| 10 | `Label`: `leading-none` → `leading-tight` | `ui/label.tsx` |
| 11 | Remove `whitespace-nowrap` from `buttonVariants` + `badgeVariants` base string | `ui/button.tsx`, `ui/badge.tsx` |
| 12 | `index.html`: `Inter:wght@300;400;500;600;700` → `400;500;600;700` | `index.html` |
| 15 | `text-[11px]` / `text-[10px]` → `text-xs` (12px) in the 3 chart/map files | `chart/*` |
| 8 | `index.css` base: `outline-ring/50` → full-opacity focus treatment | `src/index.css` — **D3** |

### Phase D — Type-role system (needs a mechanism first — **D4**)

v2 defines 7 type roles (size + line-height + weight bundles), weight roles, a letter-spacing role, and 2 spacing-rhythm roles. **The current pipeline cannot express any of these:**

- `scripts/generate-tokens.mjs` only handles `font` / `radius` / `color` / `chart` / `sidebar` / `surface` groups → CSS custom properties + `@theme` *colour* keys. No size/line-height/weight bundling, no spacing group.
- `src/generated/tokens.css` and `src/index.css` contain **no `@theme --text-*`** block — the type scale is 100% raw Tailwind default today.

Options (pick one in D4):
- **D4-a** Extend `generate-tokens.mjs` to emit a `type` group as Tailwind v4 `@utility` classes (`.type-heading1 { font-size:…; line-height:…; font-weight:… }`) or as `@theme --text-*` with paired line-heights. Then components apply `type-*` classes.
- **D4-b** Skip the token pipeline; add a hand-authored `@layer components { .type-* {…} }` block in `index.css` and a short "type roles" section in a hand-maintained doc; components apply `type-*`.
- **D4-c** Keep roles as *documentation only* (a mapping table) and enforce via review + the `leading-*` fixes in Phase C; do not introduce `type-*` classes.

Whichever is chosen, the concrete component moves are:
- `CardTitle` → `type.heading3` (Phase C covers the line-height; add the class if D4-a/b).
- `Label` → `type.label` (ditto).
- Multi-line body copy (`text-sm` descriptions, empty states, helper text) → `type.body` at **1.5× line-height**. **There is no single "body text" component** — this is ad-hoc `text-sm` in dozens of files. Under D4-c this can only be a review rule; under D4-a/b it needs a `.type-body` class applied deliberately at each site (**item 16, Med–High effort**).
- `space.title-to-body` / `space.paragraph` (item 22) — same mechanism problem; today it's ad-hoc `mt-1`/`mt-1.5`/`gap-*`.

### Phase E — Systemic / behavioural (highest risk, stage separately)

| # | Change | Approach | Risk |
|---|---|---|---|
| 17 | Persistent link underline | (a) change `button.tsx` `link` variant `hover:underline` → `underline` (it is currently hover-only, **not** what v2's prose implies is already there); (b) adopt it in `Footer.tsx` `FooterLink`, `TopNav.tsx` nav items, and inline `text-primary hover:underline` links. **D5:** do the ~4 no-op TopNav items ("COLLABORATIVES"/"ABOUT US" have no destination) get underlines now or wait for real routes? | Med |
| 18 | `TruncatedText` everywhere | **not a find/replace.** `TruncatedText` takes `children: string`, wraps in a measuring `<span>`, adds `tabIndex` when clipped. Each of ~55 sites (FileRow names, chart labels, TopNav user name/email, breadcrumb, dashboard) needs: string content? layout tolerant of the wrapper? Also fix `TruncatedText`'s own `outline-none` (no visible focus — v1.2 FND-24) as part of this. **Stage in batches by area.** | High |
| 19 | `tabular-nums` + `font-mono` for identifiers | `tabular-nums`: safe — a base rule on `table`/`.type-caption` or a utility on numeric cells. `font-mono` for IDs/versions/hashes/URLs: **discovery needed** — enumerate every identifier render; JetBrains Mono at `text-sm` is wider → may reflow `ManagementTable` columns (**D8**). | Med |
| 20 | Heading semantics | Convert `<p className="…font-semibold">` section heads to `<h2>`/`<h3>` at the **correct level per rendered view** — needs a per-page heading-order pass (no heading-level component exists; `CardTitle` is hard-wired `<h3>`, so a card under an `<h3>` section would nest `<h3>`→`<h3>`). **D9.** | Med |
| 21 | Chrome-offset | `--layout-chrome-offset: 188px` → measure header+breadcrumb via `ResizeObserver` and write a CSS var, **or** switch the workspace/table from fixed `h-[calc(100vh - offset)]` to `min-h-…` so enlarged/wrapped chrome can't clip. Touches `layout.ts`, `App.tsx`, `ManagementTable.tsx` (its card is currently *fixed* height — see the earlier "workspace table height" task), `ContributorSidebar.tsx`. **D10** + mandatory 200%/reflow test. | High |
| 23 | Regenerate + re-audit | `npm run gen:tokens`; then re-run `color-system-reference.md` + `typography-system-reference.md` methodology against the regenerated CSS. | Low |

---

## 3. FLAGS — decisions required

| ID | Decision | Options / recommendation |
|---|---|---|
| **D1** | Does `--destructive-text` also replace the ~15 *transient* `hover:text-destructive` states, or only persistent error banners/boxes (~4) + the icon circle + `FieldError`? | Recommend: persistent surfaces only. Hover-only red-on-tint is transient and was not the F07 concern. Doing all 15 is consistency-nice but wider blast radius. |
| **D2** | Scope of `--control-hover` / `--control-active`. 31 `hover:bg-muted` sites — which are "controls"? | Recommend: `button.tsx` `ghost`/`outline`, `ManagementTable` rows, dropdown option rows. Leave content/decorative hovers on `bg-muted`. `:active` is net-new — decide if it goes on the `default` (primary) button too or only ghost/outline. |
| **D3** | Base focus outline: v2 says "drop `/50`, full opacity" but the audit also found **`outline-width`/`outline-style` unset**. What is the base rule? | Recommend: `*:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }` and a `.on-dark *:focus-visible { outline-color: var(--ring-on-dark) }` (or per-control in `TopNav`). Confirm components that set `focus-visible:outline-none` + their own ring still render. |
| **D4** | **Mechanism for type roles / spacing roles** (item 13, 16, 22). | Big one. D4-a (extend generator → `@utility`), D4-b (hand-authored `@layer components`), or D4-c (docs + review only). Recommend D4-b for speed + real enforcement without generator work; revisit D4-a later. |
| **D5** | TopNav nav items ("COLLABORATIVES", "ABOUT US"…) have no destinations. Give them persistent underlines now? | Recommend: no — an underlined link that does nothing is worse. Underline the footer + real inline links now; leave dead nav items until they route (or make them non-interactive text). |
| **D6** | Token naming for `ringOnDark` / `borderStrong` / `controlHover` / `controlActive`. Generator makes utilities `ring-ring-on-dark`, `border-border-strong` (clunky). | Options: accept the clunky utility names; OR consume these only via `var(--…)` in explicit CSS rules (not as Tailwind utilities); OR rename (`focusDark`, `boundary`, `hoverFill`, `pressFill`). Decide before regen. |
| **D7** | `TruncatedText` rollout — all ~55 at once, or staged by module? And fix its `outline-none` focus bug in the same pass? | Recommend: staged (tables → file rows → chrome → charts), fix the focus bug first. |
| **D8** | `font-mono` for identifiers — which fields count, and accept table-column reflow from the wider face? | Needs an identifier inventory (dataset IDs, version strings, hashes, share URLs, API keys). Confirm `ManagementTable` column widths survive. |
| **D9** | Heading levels for the `<p>`→`<h*>` conversions — needs a per-view heading-order decision; and what to do about `CardTitle` hard-wired to `<h3>`. | Recommend: make `CardTitle` accept an `as` prop (`h2`–`h4`) so nesting is correct; do the section-head conversions per page with a quick outline check. |
| **D10** | Chrome-offset fix: `ResizeObserver`-measured var, or flow-sized (`min-h`) layout? Note this interacts with the earlier decision that the `ManagementTable` card is *fixed* height to stay aligned with the sidebar. | Recommend: measure into the CSS var (keeps the fixed-height alignment intent) rather than switching to `min-h` (which reopens the empty-table alignment issue). |
| **D11** | Keep `bg-success/5` (Stage 1) or revert to `bg-success/10`? With `#317f37`, both pass (4.74 vs 4.51). v2 is silent. | Recommend: revert to `bg-success/10` for the original green intensity — the text colour now carries the contrast, so the fainter `/5` is no longer needed. Or keep `/5` for margin. Team call. |
| **D12** | Where does the v2 narrative live? `design-system.md` is generated; its narrative comes from `generate-tokens.mjs`. | Options: fold the type-role / principles narrative into `generate-tokens.mjs`; OR keep `civicdataspace-design-tokens-v2.md` as the hand-authored companion and have `design-system.md` link to it. |

---

## 4. FLAGS — regression risks to watch

| ID | Risk | Mitigation |
|---|---|---|
| **R1** | `--input` `#8c8c8c` is a **visibly darker, "outlined" field border** everywhere — a real shift from today's near-invisible `#e5e5e5` hairline. Whole-form aesthetic change. | Design review of every form + the filter popovers before merge. |
| **R2** | `#8c8c8c` clears 3:1 only by a **thin margin** (3.08:1 vs `page-background`; would be ~3.05:1 on `bg-muted`). Any surface tint could push it under. | Confirm in DevTools on the actual field surfaces; consider a touch darker if margin is wanted. |
| **R3** | Chart palette: `chart-1` was the **brand amber** `#fdb557`; it becomes `#d27802` (dark orange). Every existing chart preview / review changes appearance. | Visual pass of bar / pie / big-number / map across all modules. |
| **R4** | `--control-hover` `#e4e4e6` is only ~1.10:1 over white — **still barely a perceptual step**. The audit's F12 ("hover ~1.03:1, too subtle") is only marginally improved. | Consider a stronger hover value, or add a border/shadow cue, not just fill. This may not close F12. |
| **R5** | Removing `whitespace-nowrap` from `Button`/`Badge` base: short labels are fine, but **anything relying on a badge/button never wrapping** (fixed-width table cells, tight toolbars) could now wrap and change row heights. Recall the earlier "Status column badge overlap" bug — this is the same area. | Re-check `ManagementTable` status column, dashboard chips, wizard footers at narrow widths + 200%. |
| **R6** | `leading-tight` on `CardTitle` / `Label`: single-line titles get slightly taller line-boxes → minor vertical shift in every card header and form label. | Cosmetic; eyeball a few dense screens. |
| **R7** | `TruncatedText` wrapper `<span>` at ~55 sites can alter flex/grid sizing (it's `block` + `min-w-0` dependent). | Stage + visually check each batch. |
| **R8** | `font-mono` (JetBrains Mono) is **wider** than Inter at the same px — identifier columns/inline chips may reflow or overflow. | Check `ManagementTable`, file-detail sheets, version lists. |
| **R9** | Chrome-offset refactor changes how the workspace/table area is sized — interacts with the fixed-height `ManagementTable` card and sidebar alignment. Regression potential on empty/filtered tables and at zoom. | Full table matrix (populated / filtered-empty / empty) at 100/200/400%. |
| **R10** | `text-destructive-text` `#d12222` vs the `aria-invalid` ring `ring-destructive/20` and border `border-destructive` — mixing `--destructive` (border/ring) and `--destructive-text` (message) is intentional per v2 but check the field + message read as one unit. | Visual. |
| **R11** | New tokens with **no consumers yet** (`ring-on-dark`, `control-active`, `border-strong` until wired) — dead CSS vars until Phase B lands. Don't merge tokens without wiring, or the audit will flag them like `--success-foreground`. | Land token + wiring together. |

---

## 5. FLAGS — runtime validation required (cannot sign off statically)

Per v2's own closing note and both audits' "needs runtime" sections:

- [ ] **Composited contrast** of every changed pairing in Chrome **and** Safari: `#317f37` on `bg-success/5` and `/10`; `#d12222` on `bg-destructive/5` and `/10` (destructive base is `oklch()`); `#8c8c8c` border on white / `page-background` / `bg-muted`.
- [ ] **Base focus outline** actually renders (width/style now set) and is visible on: white cards, the dark header (`--ring-on-dark`), `bg-primary` buttons, checked checkboxes, the `TruncatedText` span.
- [ ] **Chart palette** under protan / deutan / tritan simulation — adjacent-step separation; confirm the palette still needs the (out-of-scope) markers/labels for 1.4.1.
- [ ] **Choropleth** — `--border-strong` region outlines visible at rest; "low value" vs "no data" still indistinguishable (v2 does not fix this — R/out-of-scope).
- [ ] **200% text resize / 320px reflow / 1.4.12 spacing override** on: a management table (populated + empty), a creation wizard step with errors, the FileDetails drawer, the dashboard, a chart — after items 9–11 and 21.
- [ ] **`--control-hover` / `--control-active`** — are the states actually perceptible in-browser (R4)?
- [ ] **Font subset** — after dropping weight 300, confirm nothing renders a synthetic light (it doesn't today) and layout is unchanged on the Google-Fonts-blocked fallback path.

---

## 6. FLAGS — still out of scope / open after v2 lands

v2 explicitly does **not** resolve these; they remain open findings:

| Finding | Why still open |
|---|---|
| **A11Y-D01 F09 — chart categorical encoding (1.4.1)** | v2 recolours the ramp for contrast only. Direct labels / markers / patterns are called out as *still needed* and are not scoped. Charts still fail Use-of-Color. |
| **A11Y-D01 F10 — choropleth "no data" vs low value** | Only the region *border* (`--border-strong`) is addressed. The near-identical low-value / no-data fills and the hover-only "No data" label are untouched. |
| **A11Y-D01 F15 — 8 low-alpha text colours of uncertain purpose** | Not mentioned in v2. Still `UNVERIFIED`. |
| **A11Y-D01 F16 — breadcrumb `›` separator ≈ 3.0:1** | Not mentioned. Borderline, still open. |
| **A11Y-D01 F17 / A11Y-TYPE FND-26 — focus-not-obscured, 200%/reflow/1.4.12** | v2 adds a *review gate* principle but no code fix; still needs the runtime pass. |
| **Sidebar tokens (8) unused; `--success-foreground` unused; `link` variant at 0 uses; `prose-*` classes inert (`@tailwindcss/typography` not installed); `italic` used once with no italic face** | v2 keeps sidebar tokens explicitly out of scope; the others are hygiene items not addressed. |
| **`type.body` 1.5× enforcement across ad-hoc `text-sm`** | Only achievable as a review rule unless D4-a/b builds a `.type-body` hook and every site adopts it. |
| **`--layout-chrome-offset` — `min-h` vs measured** interacts with the fixed-height `ManagementTable` card decision from the earlier layout task. | Needs D10 + regression testing; not a token change. |

---

## 7. Recommended sequencing

1. **D6, D11, D12** decided first (naming, tint choice, doc home) — they gate the token file.
2. **Phase A** — edit `tokens.json`, `npm run gen:tokens`, `tsc`/`oxlint`/`build`. (Tokens only; new ones dead until Phase B — land A+B together or in one PR.)
3. **Phase B** — wire `destructive-text`, `ring-on-dark`, `control-hover/active`, `border-strong`. Resolve **D1, D2, D3**.
4. **Phase C** — the 6 low-risk typography/focus edits. One PR.
5. **Design review checkpoint** — R1, R3, R5, R6 (form borders, chart look, badge wrapping, title spacing) before going further.
6. **Runtime contrast + CVD + 200%/reflow pass** (§5) on Phases A–C.
7. **D4** decided → Phase D (type-role mechanism + `CardTitle`/`Label`/body/caption).
8. **Phase E** items, each its own PR, in this order: 15 (chart label size) → 17 (links, D5) → 20 (headings, D9) → 19 (tabular/mono, D8) → 18 (truncation rollout, D7, staged) → 21 (chrome offset, D10, with mandatory reflow test).
9. **Re-run both reference audits** against regenerated CSS; update the change logs.

**Rough effort:** Phase A+B ≈ 0.5–1 day. Phase C ≈ 0.5 day. Phase D ≈ 1–2 days (mechanism-dependent). Phase E ≈ 3–5 days (truncation rollout and chrome-offset dominate). Plus a runtime/AT validation session.
