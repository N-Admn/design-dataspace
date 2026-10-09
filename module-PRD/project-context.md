# CivicDataSpace — Project Context (single-file source of truth)

> **What this is.** One file that pulls together the technical, UI, UX, tech-stack and PRD context of the CivicDataSpace
> prototype, so a person or an AI assistant can get oriented without opening twenty files.
>
> **How to use it.** This is a *map plus the rules that matter most*. It links to the detailed sources instead of copying
> them. **Where this file and the code disagree, the code wins** — then fix this file.
>
> **Snapshot.** Written against `main` at `1ab9623` (Merge PR #63), 2026-10-08. It is hand-maintained (not generated).
>
> **Detailed sources this file points to**
>
> | Topic | File |
> |---|---|
> | Design tokens, type roles, components, responsive rules (generated) | [`design-system.md`](../design-system.md), [`tokens.json`](../tokens.json) |
> | Live design-system reference page | `/design-system` (`src/pages/DesignSystemPage.tsx`) |
> | Datasets module PRD | [`module-PRD/dataset-module.md`](dataset-module.md) |
> | Audits and reference reports | [`audit-reports/`](../audit-reports/) |
> | AI skills layout | [`docs/ai/skills-architecture.md`](../docs/ai/skills-architecture.md), `.claude/skills/` |
> | Claude Code project instructions | [`CLAUDE.md`](../CLAUDE.md) |

---

## 1. Product in one page

**CivicDataSpace** (also "CDL DataSpace", by CivicDataLab) is a platform for publishing and discovering **civic data and
the work built on it**. This repository is a **front-end prototype** of it.

Two audiences share one app:

| Audience | What they do | Where |
|---|---|---|
| **Consumers** (anyone) | Search and browse datasets, use cases, publications, collaboratives, events, AI models; open detail pages | `/discover`, `/search`, `/explore/*` |
| **Contributors** (signed-in, individual or in an organisation) | Create, edit, publish and manage their own content; manage organisation workspaces and members | `/` (dashboard), `/dashboard/*`, `/organisations/*` |

**Content types** (each has a creation flow, a preview/detail page and a place in search): **Datasets, Use Cases,
Publications, Collaboratives, Events, AI Models**, plus **Charts/Visualisations** (built from a dataset and shown on the
dataset page). **Organisations** and **people** are the contributors behind them.

**Prototype boundaries (important).** There is **no backend**. Data is React state seeded from mock fixtures in
`src/lib/mock-*.ts`; some modules additionally persist to `localStorage`. Integrations are simulated (marked **[MOCK]** in
the module PRD): platform import, DOI/API endpoints, downloads (a "coming soon" toast), AI-model access tests, etc.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Language / UI | **TypeScript ~6.0**, **React 19.2** |
| Build | **Vite 8** (`@vitejs/plugin-react`), `tsc -b` before `vite build` |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` (`@theme` in generated tokens), `tw-animate-css`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Components | **Radix UI** primitives (dialog, popover, tooltip, select, checkbox, radio-group, label, progress, slot) wrapped in `src/components/ui/*` ("shadcn/ui-style") |
| Icons | **lucide-react** (the only icon set) |
| Routing | **react-router-dom 7** |
| Maps | **leaflet** + **react-leaflet** (choropleth charts; boundaries in `src/lib/geo-boundaries.ts`, `chart-geo.ts`) |
| Fonts | **Inter** 400–700 and **JetBrains Mono** 400–500 (Google Fonts, loaded in `index.html`) |
| Lint | **oxlint** |
| Tests | None configured. Verification is typecheck + lint + build + browser checks. |

**Scripts** (`package.json`)

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (http://localhost:5173). `predev` regenerates tokens. |
| `npm run build` | `tsc -b && vite build`. `prebuild` regenerates tokens. |
| `npm run lint` | `oxlint` |
| `npm run gen:tokens` | `node scripts/generate-tokens.mjs` — regenerates `src/generated/tokens.css` and `design-system.md` from `tokens.json` |

**Code style.** Single quotes, no semicolons. Imports use the `@/` alias for `src/`. Prettier's default 80-column wrap
reformats older files heavily — prefer small, targeted edits (or `--print-width 120`) on files you aren't otherwise changing.

---

## 3. Repository map

```text
src/
  App.tsx                 shell: routes, AppLayout (TopNav, BreadcrumbBar, sidebar, main, Footer), providers
  index.css               base layer, .type-* role classes, focus rules, animations
  generated/tokens.css    GENERATED Tailwind @theme — never hand-edit
  context/
    AppDataContext.tsx    all content records + mutations + persistence
    HelpContext.tsx       in-app help/support panel state
  types/                  one file per module: dataset, usecase, collaborative, event, ai-model, publication, chart,
                          organisation-workspace, profile, prompt-dataset
  lib/                    layout.ts (gutters, form grid), content-status.ts (lifecycle), global-search.ts (search index),
                          *-validation.ts, *-draft-storage.ts, mock-*.ts fixtures, format.ts, utils.ts (cn) …
  hooks/                  use-breakpoint, use-media-query, use-prefers-reduced-motion, use-go-back, use-close-search,
                          use-landing-entrance, use-organisation
  components/
    ui/                   design-system primitives (button, badge, input, dialog, card, stepper, toast, …)
    shared/               cross-module composites (ManagementTable, StatusBadge, ViewTabs, ReviewSection, …)
    layout/               TopNav, BreadcrumbBar, ContributorSidebar, Footer, LanguagePicker, global-nav-config
    discover/             GlobalSearchField, Chip, ContentCard, SearchResultCard, FilterRail
    civic-data-ecosystem/ the landing page's five-card composition
    dataset/ usecase/ collaborative/ event/ ai-model/ publication/ chart/ organisation/ profile/ auth/   per-module UI
  pages/                  route components (one per screen); explore/ (consumer detail pages), organisation/, auth/,
                          design-system/ (docs sections + playground), playground/ (prototypes)
scripts/generate-tokens.mjs   token + design-system.md generator (also holds the doc narrative)
tokens.json                   canonical design tokens
module-PRD/                   module PRDs and this file
audit-reports/                audits and reference reports
docs/ai/  .claude/skills/     AI-assistant skills layout (mostly placeholders)
public/ visuals/              static assets; visuals/landing = source illustrations (copies live in src/assets/landing)
```

---

## 4. Routes

All routes are defined in `src/App.tsx`. `AppLayout` decides the chrome per route (sidebar, breadcrumb, white vs grey
background). Unknown paths redirect to `/dashboard/datasets`.

### Consumer (white canvas, global nav, no sidebar)

| Route | Screen | Notes |
|---|---|---|
| `/discover` | Landing page | Search hero + "What's inside CivicDataSpace?" cards + topic chips; has an entrance animation (see §7) |
| `/search` | **Unified Search** — the listing surface for every content type | `?q=` keyword, `?type=` content type (see §6), `?tag=` |
| `/explore/datasets/:id` | Dataset details | Header, Overview / Data / Visualisations tabs; `?view=` deep-links a tab |
| `/explore/use-cases`, `/explore/use-cases/:id` | Use case explore page, detail | |
| `/explore/events/:id` | Event details | |
| `/explore/datasets`, `/explore/ai-models`, `/explore/publications`, `/explore/events`, `/collaboratives`, `/publishers`, `/forum`, `/about`, `/contact` | **"Coming soon" placeholders** (`ComingSoonPage`) | Do not link primary navigation to these; use Search tabs instead |
| `/dashboard/{collaboratives,ai-models,publications}/:id/preview` | Public-style detail/preview pages for those types | The only detail pages that exist for them |

### Contributor workspace (grey canvas, `ContributorSidebar`)

`/` (dashboard, "Continue Working" queue) · `/dashboard/{datasets,events,use-cases,collaboratives,ai-models,charts,publications}`
(management tables) · `…/new` (creation flows: events, use-cases, collaboratives, ai-models, charts, publications — **datasets
are created inside `/dashboard/datasets`**, there is no `/new` route) · `…/:id/preview` (preview before/after publish) ·
`/dashboard/profile`.

### Organisation workspaces (`OrganisationSidebar`)

`/organisations` (selector) · `/organisations/:organisationId` and `/datasets`, `/publications`, `/use-cases`, `/ai-models`,
`/collaboratives`, `/charts`, `/events`, `/members`, `/profile`.

### Other

| Route | Purpose |
|---|---|
| `/auth/sign-in`, `/auth/register`, `/auth/forgot-password` | Auth screens (mock) |
| `/design-system` | Live design-system reference + Responsive Behaviour + Responsive Playground |
| `/design-system/preview/:component` | Chrome-less host for open Dialog / side-sheet / Data DNA previews inside playground frames |
| `/playground/dataset-header` | Dataset playground: header comparison + **Data DNA** prototype |

---

## 5. Data model, lifecycle and state

### 5.1 Records and the store

`AppDataContext` holds an array per content type — `datasets, events, useCases, collaboratives, aiModels, charts,
publications, organisationWorkspaces` — plus create/update/delete/publish/unpublish operations. Every record follows the same
shape:

```text
Record { id, status: 'draft' | 'published', updatedAt, form, publishedForm | null, organisationId?, createdBy? }
```

- `form` = the **working copy** the contributor edits.
- `publishedForm` = a **snapshot taken at the last publish**; what the public sees. `null` until first publish.
- `organisationId` present ⇒ the item belongs to an organisation workspace; absent ⇒ "My Workspace".

Consumers only ever see `status === 'published'` records, rendered from `publishedForm`.

### 5.2 Lifecycle (platform-wide, `src/lib/content-status.ts`)

- **Status has exactly two values:** `draft` and `published`. It is the **only** thing shown in a status badge/column.
- **Edit state is separate:** *Saved* vs *Unsaved changes* (`hasUnsavedEdits`) — an editing indicator, never a status badge.
- **Unpublished edits** (`hasUnpublishedEdits`): a `published` record whose `form` differs from `publishedForm`. Drives the dashboard
  "Continue Working" queue; never rendered as a badge; resolved only inside the creation flow (publish, or discard on the leave gate).
- **Rules:** editing never flips `published → draft`; nothing auto-publishes; `published → draft` happens only via explicit **Unpublish**.
- Copy for lifecycle toasts lives in `src/lib/dataset-lifecycle-messages.ts` (the Datasets PRD §13 lists it).

### 5.3 Persistence (prototype)

| Data | Where it lives |
|---|---|
| Datasets, events, charts | In-memory React state seeded from mock fixtures (reset on reload) |
| Use cases, collaboratives, AI models, publications, organisation workspaces | `localStorage` (`civicdataspace:usecases`, `:collaboratives`, `:ai-models`, `:publications`, `:organisation-workspaces`), synced across tabs |
| Creation-flow drafts | `*-draft-storage.ts` helpers (event, use case, collaborative, AI model, publication) |
| UI preferences | Sidebar collapse state (`ContributorSidebar`), search-origin history index (`use-close-search`, `sessionStorage`) |

### 5.4 Organisations and roles

Three roles (`src/lib/organisation-permissions.ts` — the single place for permission checks; never compare `role === 'admin'`
inline): **Admin** (manage org and members + full content authority), **Editor** (manage the org's content, no membership
powers), **Evaluator** (AI-model evaluation via Parakh only; no access to datasets/use cases/etc.).

### 5.5 Cross-module relationships

| Consumer content | Link field | Meaning |
|---|---|---|
| Event | `form.relatedContent.{datasets,useCases,collaboratives,aiModels}` | content connected to an event |
| Use Case | `form.connections.datasets` | datasets a use case is built on |
| Collaborative | `form.connections.{datasets,useCases,people}` | datasets, use cases, people |
| Chart | `form.datasetId` | the dataset a visualisation is built from |

Publications and AI models have **no** dataset connection field today. Deleting a dataset does not rewrite its consumers
(it warns on connected events). The Data DNA playground reads these links to show "Where this data is used".

### 5.6 Global search model (`src/lib/global-search.ts`)

`buildSearchIndex` flattens published datasets, use cases, publications, collaboratives, events and AI models into
`SearchResultItem`s (`type`, `title`, `description`, facets, `cardMeta`, `href`, publishers). `SearchResultsPage` filters by
`q`, `type` and `tag`, renders each item through the shared **`ContentCard`**, and offers per-type facet filters
(`search-filters.ts`, `FilterRail`).

---

## 6. UX / information architecture

### 6.1 Primary navigation (desktop ≥1024px; below that a right slide-in drawer with accordions)

```text
Search  |  Discover ▾  |  Collaboratives ▾  |  More ▾          [Language]  [Log In / Sign Up | avatar menu]
```

| Item | Behaviour |
|---|---|
| **Search** | The existing `/search` page. Navigation label only — not a separate feature from the Search page. |
| **Discover** | Categories (left) + tiles (right). **Knowledge** (default): Datasets, Publications, AI Models. **Stories**: Use Cases, Collaboratives. **Community**: Publishers, Organisations. Footer: Contribute CTA. |
| **Collaboratives** | Three featured collaboratives (Asia-Pacific Climate and Health Data Collaborative → its detail page; the other two → the Collaboratives tab of Search) + "Explore more collaboratives". |
| **More** | **About** (default): About Us, Contact, Privacy & Policy. **Resources**: Documentation, Help & FAQ, Accessibility (all "Coming soon"). |

IA rules that must not be blurred: **Search** = the primary discovery action · **Discover** = browsing categories · **Knowledge /
Stories / Community** = Discover's groups · **Resources lives only under More** (never a Discover category).

Dropdown interaction (shared controller in `TopNav`): hover opens, click toggles/pins, hovering or clicking a category swaps the
right side, moving from trigger into the panel keeps it open, Escape and outside click close, Enter/Space activate the trigger.
The three desktop menus share one frame (`min(56rem, 100vw − 2rem)` wide, fixed 383px min height, `shadow-lg`).

### 6.2 The listing/detail rule

> **Category or listing click → the unified Search page with that content type's tab active. Specific item click → its detail
> page. There are no separate listing pages per content type.**

- Navigation links use plural names: `/search?type=datasets | publications | ai-models | use-cases | collaboratives | events`
  (helper `searchRoute()` in `global-nav-config.ts`). `SearchResultsPage` also accepts the singular canonical values
  (`dataset`, `use-case`, …) used internally, so old links keep working.
- **Gap:** Publishers and Organisations are not search content types yet, so they keep their own routes (`/publishers` is a
  placeholder; `/organisations` is the organisation selector).
- The Search page: a content-type chip row (All, Datasets, Use Cases, Publications, Collaboratives, Events, AI Models), a filter
  rail, list/grid toggle, and an orange context bar with **Close search** that returns to wherever the visitor came from
  (history-based; falls back to `/discover`).

### 6.3 Landing page (`/discover`)

Order: navbar → "What are you looking for?" + supporting line → search bar → "Explore by topic" chips (stretched to the search
width) → the **ecosystem cards** (Datasets, Use Cases, Collaboratives, AI Models, Community — one sentence + illustration each,
asymmetric 12-column bento, linked to the matching Search tab / `/organisations`) → a "Have data… Contribute" line.

- From `lg` the hero and **all five cards fit the first viewport** (block height = viewport − 88px nav − main padding); below
  that it scrolls. Hero and cards share the `max-w-[1400px]` content cap used by dataset/event detail pages.
- **Entrance** (`use-landing-entrance.ts`): search fades in centred → after 1s rises into place → cards slide in (left / bottom /
  right) → topic chips pop in last. `transform`/`opacity` only; reduced motion and repeat in-app visits show the final layout.
- The search placeholder types out example queries (pauses on focus/typed text; static under reduced motion).

### 6.4 Dataset details (`/explore/datasets/:id`)

Back → **header card** (title, Share, Download, download count; Publisher / Sector / Geography / Last updated) → tabs
**Overview / Data / Visualisations** → panel. From `md` the Back + header + tabs group is one screen tall and the header card
grows to fill it (title/actions top, metadata bottom); below `md` it is content-driven. The consumer download is a "coming soon" toast.

### 6.4a Data DNA (prototype, not production)

A visual dataset profile explored in `/playground/dataset-header` → "Data DNA": **Story → Facts → Connections → Trust**, a
fixed-height bento card system (standard card 160px, feature 336px, gap 16px; 12 / 6 / 1 columns), expressive tinted cards for the
story and the relationships, quiet white cards for facts and provenance. Values are read or counted from mock data only; fields
the model lacks (coverage, language, methodology) are named in one quiet caption line. Constants live in
`src/pages/playground/data-dna/data-dna-constants.ts`. It does **not** replace the production page.

### 6.5 Contributor patterns

- **Management tables** (`ManagementTable`): status tabs, search, filters, 10 records/page, 56px rows, 48px header, 560px body,
  fixed pagination, one-line truncated cells (tooltip), row actions (view/edit/delete/unpublish).
- **Creation flows**: stepper wizard (e.g. Datasets: Data Files → Metadata → Review & Publish), inline validation, save draft /
  publish, a **leave-with-unsaved-changes gate** (`LeaveCreationDialog`: save / discard / cancel), review sections
  (`ReviewSection`), publish panel, success modal. Stepper is progress-only until Review with all steps valid.
- **Dialogs** (one Radix `Dialog` with variants `center`, `right-drawer`, `anchored`) and **side sheets** for detail editing.
- **Dashboard** "Continue Working" aggregates unpublished edits and drafts across My Workspace and organisation workspaces.
- **Confirmations** for destructive actions (`confirm-dialog`); toasts for outcomes (copy in the module PRD).

### 6.6 Accessibility conventions

WCAG 2.2 AA is the target (audits in `audit-reports/`). Visible focus everywhere (2px ring; white ring on dark chrome);
`scroll-margin` keeps focused targets clear of sticky chrome; truncated text is keyboard-focusable with a tooltip; status is
never colour-only; `prefers-reduced-motion` is respected by all new animation; decorative images have empty alt text; semantic
landmarks and `aria-current` on active nav items.

---

## 7. UI / design system (summary — details in `design-system.md`)

**Single source of truth:** `tokens.json` → `scripts/generate-tokens.mjs` → `src/generated/tokens.css` **and** `design-system.md`.
Never hand-edit the two generated files; change `tokens.json` or the generator (which also holds the narrative sections), then
`npm run gen:tokens` (runs automatically before dev/build). Use **semantic tokens and Tailwind utilities, never raw hex**.

### 7.1 Colour (selected)

| Token | Value | Use |
|---|---|---|
| `primary` | `#0b3865` (navy) | primary actions, focus ring, links, brand headings (`text-text-brand`) |
| `accent` | `#fdb557` (amber) | highlights, Log In button, context bar; `accent-foreground` is navy |
| `background` / `card` | `#ffffff` | consumer canvas / cards. Workspace pages sit on `--page-background` (`#f3f5f8`). |
| `muted` / `secondary` | `#f5f5f5` / `#f4f4f5` | subdued surfaces |
| `border` / `input` / `border-strong` | `#e5e5e5` / `#8c8c8c` / `#727272` | hairlines / control boundaries (3:1) / strong icons and chart outlines |
| `success` · `warning` · `destructive` | `#46a758` · `#ffc53d` · `#e7000b` | states; `*-text` variants for text on tints |
| chart palette | `chart-1…8` | charts; also the **soft tints** used on cards (e.g. `bg-chart-3/15`) |

Tints are expressed as low-opacity use of existing tokens (landing cards, Data DNA relationship cards) — no new colour tokens.

### 7.2 Typography — eight roles, nothing ad hoc

| Role | Class | Size / line-height / weight |
|---|---|---|
| Display | `.type-display` | 48–60px (capped at 9vw on narrow phones) / 1.1 / 600 — one hero moment per screen |
| Display 2 | `.type-display-2` | 26px (28px from `md`) / 1.1 / 600 — prominent feature titles |
| Heading 1 | `.type-heading-1` | 24px / 1.25 / 600 |
| Heading 2 | `.type-heading-2` | 20px / 1.3 / 600 |
| Heading 3 | `.type-heading-3` | 16px / 1.25 / 600 (backs `CardTitle`) |
| Body | `.type-body` | 14px / 1.5 / 400 |
| Label | `.type-label` | 14px / 1.25 / 500 (backs `Label`, buttons) |
| Caption | `.type-caption` | 12px / 1.33 / 400–500 — system-wide floor, single line only |

Fonts: Inter (sans) and JetBrains Mono. Tabular numerals on table/chart values. Do not introduce new sizes or hardcode 26–28px.

### 7.3 Shape and components

- **Radius:** base `--radius` 0.625rem; `rounded-md` for buttons/inputs, `rounded-xl`/`rounded-lg` for cards/dialogs, `rounded-full` for
  badges/pills/chips/avatars.
- **Button** (`default | destructive | outline | secondary | ghost | link | successOutline`; sizes `default h-10`, `sm h-9`, `lg h-11`,
  `icon`). **Badge** variants incl. `success/warning/destructive/muted`. Inputs `h-10 border-input`. Links carry no rest underline
  (except inside body copy).
- **Chips** (`components/discover/Chip`): pill filters; compact (12px, 30px tall) below `lg`, 14px / 38px from `lg`.
- **Primitives** in `components/ui`; **composites** in `components/shared` (ManagementTable, StatusBadge, ViewTabs, ReviewSection,
  FileUploadField, TruncatedText, DatasetConnectionsCard, …).
- Shadows are Tailwind defaults (not tokenised); dropdowns/menus use `shadow-lg`.

### 7.4 Responsive behaviour (the system)

**Responsive behaviour, not separate mobile/tablet/desktop designs.** Existing Tailwind breakpoints only — `sm 640 · md 768 ·
lg 1024 · xl 1280 · 2xl 1536` (no `xs`, no `3xl`); JS reads go through `useBreakpointUp()` (`src/hooks/use-breakpoint.ts`).
Use the fewest breakpoint transitions that keep usability and hierarchy.

| Concern | Rule |
|---|---|
| Page gutter | `PAGE_GUTTER_X` = 16 / 24 / 32 / 40px at <768 / 768 / 1024 / 1280; shared by header, breadcrumb, main, footer; main max `1760px` |
| Navigation | <1024px compact (drawer); ≥1024px desktop dropdowns |
| Sidebar | <768 drawer from a trigger · 768–1023 collapsed rail · ≥1024 expanded |
| Forms | single column; two columns from **1200px** (`FORM_TWO_COL_GRID`, `min-[1200px]`, a documented threshold — not a new breakpoint) |
| Tables | ≥1024 full; scroll inside the card below `md` (list/card pattern is a known gap) |
| Dialogs / sheets | constrained width; near/full width on small screens |
| Stepper | labelled ≥768; numbered markers + "Step n of N" below |
| Cards/grids | 1 column → 2 → 2–4 by space |

The `/design-system` page has an interactive **Responsive Behaviour** section and a **Responsive Playground** (live, unscaled iframes at
390 / 768 / 1280 of real components and pages with their active breakpoint). `/design-system` itself uses a docs layout: a
full-height left sidebar with accordion categories and 40px content padding.

### 7.5 Other layout facts

- `--layout-chrome-offset` (measured in `App.tsx`: nav + breadcrumb + 64px main padding) drives viewport-height layouts.
- Consumer pages sit on white; workspace pages on grey. Page max widths: dataset/event detail `1400px`, use case detail `6xl`.
- Footer: three-part row from `md`; centred two-row stack on phones.

---

## 8. PRDs and reference documents

### 8.1 Module PRDs

| PRD | Covers |
|---|---|
| [`module-PRD/dataset-module.md`](dataset-module.md) | **Datasets (contributor)**: purpose, vocabulary, data model (`DatasetRecord` / `DatasetFormState` / `DatasetMetadata` / `DatasetFile`), My Datasets table (columns, tabs, search, filters, pagination, row actions, delete/unpublish), the 3-step creation/edit wizard (Data Files → Metadata → Review & Publish), file upload and platform import **[MOCK]**, File Details side sheet, leave gate, save/publish behaviour, lifecycle state machine, the contextual "Add Dataset" mini-wizard, option lists, cross-module relationships, copy, prototype boundaries, file map |

**Only the Datasets module has a PRD in this folder.** The other modules (use cases, collaboratives, AI models, publications,
events, charts, organisations) are documented only by their code and the audits below. Consumer Dataset Details, the landing
page, navigation and Data DNA are described in §6 of this file, not in a PRD.

### 8.2 Audits and reference reports (`audit-reports/`)

`design-system-conformance-audit-2026-10-06.md` · `ia-navigation-audit-2026-09-30.md` · `ux-continuity-fixes-2026-09-30.md` ·
`badge-tag-interactivity-audit-2026-09-30.md` · `platform-health-audit-2026-09-17.md` · `prompt-dataset-flow-audit-2026-09-17.md` ·
`heading-subtitle-*-2026-09-18.md` · `design-pattern-audit-builder-search-and-row-actions-2026-09-11.md` · accessibility audits
(`accessibility-audit-*`, `accessibility-report.md`) · `color-system-reference.md` · `typography-system-reference.md` ·
`design-system-v2-update-plan.md`.

### 8.3 Datasets PRD — the rules most worth remembering

- Two lifecycle axes: **status** (`draft`/`published`) and **edit state** (saved/unsaved). Unpublished edits are not a status.
- `publishedForm` is the public version; `form` is the working copy; "discard" restores `publishedForm`.
- A dataset holds `files` (`DatasetFile[]`: name, extension, `sizeLabel`/`sizeBytes`, `rowCount?`, `columnCount?`, `source?`, `path?`);
  `resources` is vestigial (only the mini-wizard writes it).
- Metadata fields: `name`, `description`, `sector`, `geography`, `tags`, `sourceWebsite`, `createDate`, `accessType`
  (`open | restricted`), `license`. Option lists are in `src/types/dataset.ts` (sectors, geographies, licences).
- Prompt datasets (`datasetType: 'prompt_dataset'`) add `promptDatasetMetadata` and per-file prompt metadata.

---

## 9. Tooling and working conventions

- **Do not commit unless asked.** Changes are normally left in the working tree; branches/PRs are made on request (the team opens
  PRs from pushed branches). Keep PRs themed and independent where possible.
- **Verify every change:** `npx tsc -b`, `npx oxlint`, `npm run build`, and a real browser check at the widths that matter
  (390 / 640 / 768 / 1024 / 1280 / 1440). No test runner exists.
- **Reuse before inventing:** existing components, tokens, type roles and routes first. Do not add colours, type sizes, breakpoints
  or placeholder routes.
- **Generated files** (`src/generated/tokens.css`, `design-system.md`) are outputs of `npm run gen:tokens`.
- **Playgrounds are prototypes:** `/playground/*` and the Data DNA tab never change production pages.
- **AI skills:** project skills live in `.claude/skills/` (`SKILL.md` entry points grouped by `ui/`, `ux/`, `documentation/`,
  `github/`; `_shared/` is context, not skills); most are placeholders — see `docs/ai/skills-architecture.md`.
- **Audit reports are saved as Markdown in `audit-reports/`**, not as artifacts.

---

## 10. Known gaps and open items

- **No backend.** Persistence is in-memory or `localStorage`; downloads, DOI/API endpoints and platform import are simulated.
- **Search coverage:** Publishers and Organisations are not Search content types; `/publishers`, `/explore/datasets`,
  `/explore/ai-models`, `/explore/publications`, `/explore/events`, `/collaboratives`, `/about`, `/contact`, `/forum` are
  "Coming soon". Privacy & Policy, Documentation, Help & FAQ and Accessibility have no pages.
- **Collaboratives:** only `collaborative-1` has a record; the other two featured collaboratives in the nav have none.
- **Responsive design-system gaps:** no small-screen table pattern (list/card); no shared filter drawer; `Display` has one documented
  fluid exception.
- **Dataset model gaps** (visible in Data DNA): no coverage, language or methodology/documentation fields; record counts exist only on
  files that report `rowCount`; publications and AI models do not reference datasets.
- **Data DNA** is a prototype: no illustration asset (uses lucide's `Dna`), prototype download buttons, long single-column mobile layout.
- **Consumer dataset download** is a toast; contributor flows have no real file storage.
- Several audit findings remain open — see `audit-reports/` for the specific lists.
