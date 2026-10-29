# CivicDataSpace — Page, Component & Flow Map

**Date:** 2026-10-29 · **State of code:** `main` at `d8095ea` (after PR #122)
**Purpose:** one reference for how every page, its sections/components, its data and its outgoing links relate. Built to be turned into a mind map.
**Method:** read from `src/App.tsx`, each page's imports, the nav configs, `AppDataContext` and link builders. Nothing was run in a browser. Where a link's destination is built dynamically it is listed as the pattern.
**Update (same day):** the provider/consumer boundary change (branch `feat/provider-consumer-boundary`) added a session store and sign-in guard, public AI model and publication pages, and saved datasets, events, charts and the profile. The sections below describe the state *before* that change except where marked **[updated]**; see the status table in the report.
**Companion:** [Flow-break report](../audit-reports/platform-flow-breaks-2026-10-29.md) — every `⚠ F##` tag below points to a finding there.

---

## 0. How to use this for a mind map

- **Fastest route:** paste section 2 ("Mind-map outline") into any outline-based mind-map tool (Markmap, XMind, Miro "Mind map from outline", Whimsical). The nesting is already *Zone → Page → Section/Component → Data → Goes to*.
- **Suggested branches (level 1):** Shell · Consumer · Contributor (personal) · Organisation workspace · Auth · Internal (docs/design system/playground) · Data layer.
- **Suggested edge colours:** solid = normal navigation, dashed = a link that leaves its zone (consumer ↔ contributor), red = a break from the report.
- Section 3 is the reverse view (a shared component → every page that uses it) and section 4 is the page-to-page edge list; use those if you would rather draw a node-and-arrow diagram than a tree.

**Notation:** `→` goes to · `⇢` leaves its zone · `⚠ F##` has a finding · `[mem]` data lives in memory only · `[ls]` data persisted to localStorage and synced across tabs.

---

## 1. The shape of the platform

```
                 ┌────────────────────────── Shell (TopNav · Breadcrumb · Footer) ───────────────────────────┐
                 │                                                                                           │
   CONSUMER ZONE (white canvas)                                         CONTRIBUTOR ZONES (grey canvas, sidebar)
   /discover  /search  /community                                       Personal: /  /dashboard/*
   /explore/*  /publishers/:id  /about                                  Organisation: /organisations/:id/*
        │                                                                          │
        └──── content detail pages ◄──── publish ────────────────────────────────┘
                                     ▲
                    AppDataContext (one store, 7 content types + orgs + profile)
```

**Three layout "modes" are computed in `App.tsx` from the URL alone** (no user state is involved):

| Mode | URLs | Chrome |
|---|---|---|
| Consumer | `/discover` `/search` `/community` `/explore/*` `/publishers/*` `/about` `/forum` `/contact` `/documentation` `/playground*` | TopNav, breadcrumb (not on Discover, Search shows "Close search", playgrounds none), white background, no sidebar |
| Contributor – personal | `/` and `/dashboard/*` | TopNav, breadcrumb, **ContributorSidebar** (not on `/` and not on `*/preview`) |
| Contributor – organisation | `/organisations/:id/*` | TopNav, breadcrumb, **OrganisationSidebar**; `/organisations` (the selector) has none |
| Auth | `/auth/*` | No TopNav/footer at all, own `AuthLayout` |

**[updated] Boundary:** `/`, `/dashboard/*` and `/organisations/*` require a signed-in session (`context/AuthContext.tsx`). Signed-out visitors are sent to `/auth/sign-in` and returned afterwards; `/` goes to `/discover`.
| Chrome-less | `/playground/collaborative-detail`, `/playground/community-profile`, `/design-system/preview/*` | Nothing — each page draws its own header |

**[updated]** Unknown URLs fall through `path="*"` to `/discover`.

---

## 2. Mind-map outline

### CivicDataSpace

#### Shell (on every page except Auth and the chrome-less ones)
- **TopNav** — `components/layout/TopNav.tsx`, config in `global-nav-config.ts`
  - Logo → `/discover`
  - Menus: **Discover** (Knowledge: Datasets, Publications, AI Models · Stories: Use Cases, Collaboratives · Community: Events, People, Organisations) → every item is `/search?type=…` or `/community?tab=…`
  - **Collaboratives** menu → `/search?type=collaboratives`, plus 3 featured themes (`&sector=climate-action|gender|urban-development`) ⚠ F09
  - **Search** → `/search`
  - **More**: About Us → `/about` · Contact → opens ContactSupportSheet · Documentation → `/documentation` · Privacy & Policy, Help & FAQ, Accessibility → no destination ⚠ F17
  - **Language picker**
  - **AuthButton / UserMenu** — "Log In / Sign Up" flips a local flag; UserMenu → `/` (Dashboard), sign out → `/auth/sign-in` ⚠ F16
  - **Contribute** → `/` when "signed in", otherwise `/auth/sign-in`
  - Active state for Search/Discover/Collaboratives computed from the pathname ⚠ F12
- **BreadcrumbBar** — per-route trails for dataset, use case, collaborative, event, org, person, documentation, design system, `/organisations/*`, `/dashboard/*`; "Close search" on `/search` (`use-close-search.ts`); none on Discover, previews, playgrounds
- **ContributorSidebar** (`nav-config.ts`): Datasets, Use Cases, Collaboratives, AI Models, Publications, Charts, Events, Profile, Help & Support (no path → "coming soon")
- **OrganisationSidebar** (`organisation-nav-config.ts`): Dashboard, the same seven content modules, Admin & Members, Profile; "Switch organisation" → `/organisations`
- **Footer** — five items (About Us, Contact Us, Privacy, Terms, Legal), all buttons with no action ⚠ F17
- **HelpButton** — only on `/`
- **Providers** — Tooltip, Toast, Confirm, Help (page-context label for support)

#### Consumer zone
- **Discover** `/discover` — `DiscoverPage`
  - GlobalSearchField → `/search?q=…`
  - Chips, CivicDataEcosystem cards → `/search?type=dataset|use-case|collaborative|ai-model` and `/community`
  - CTA → `/` (contributor dashboard) ⚠ F18
- **Search** `/search` — `SearchResultsPage` (the single listing surface for every content type)
  - Components: GlobalSearchField, type pills (Chip), FilterRail / FilterSheet (mobile), AppliedFilters, SortMenu + ViewToggle (ResultsToolbar), SearchResultCard, DirectoryPagination, EmptyState, "Contribute <type>" button → `/dashboard/<type>/new`
  - Data: `buildSearchIndex()` over datasets, use cases, collaboratives, events, AI models, publications, charts, org workspaces (`lib/global-search.ts`)
  - URL carries: `q`, `type`, `tag`, filter keys. **Not** in URL: sort, page, view ⚠ F10
  - Result card → Dataset/Use case/Collaborative/Event detail ✔ · AI model ⇢ `/dashboard/ai-models/:id/preview` ⚠ F06 · Publication ⇢ `/dashboard/publications/:id/preview` ⚠ F06 · Event sub-publications → event detail
  - Tab filters: Datasets = Last updated + File type · Use cases / Collaboratives = Last updated + SDG goal · Publications = + Resource type · Events = + Event type · AI Models = + Sector ⚠ F09
- **Community** `/community?tab=people|organisations` — `CommunityPage`
  - GlobalSearchField, FilterRailView, SortMenu/ViewToggle, DirectoryCard, DirectoryPagination, NoResults
  - State fully in URL (`use-directory-params.ts`) ✔
  - Card → `/publishers/:id` or `/explore/organisations/:id`
- **Person profile** `/publishers/:personId` — `PublisherProfilePage` → `PublisherProfileView`
- **Organisation profile** `/explore/organisations/:organisationId` — `PublicOrganisationProfilePage` → `OrganisationProfileView`
  - Both profile views share (`ProfileParts.tsx`): BackLink, `ProfileBannerHero` (photo, name, designation, facts, description, `OneLineTags`, socials, counts), `ContributionSections` (tabs of content cards), `MemberCards`, `ProfileNotFound`
  - Content cards → detail pages · AI model card ⇢ contributor preview ⚠ F06
  - Data: `useCommunityDirectory`, `useContentCardItems`, `lib/community.ts` (only published content counts; standalone publications are not counted) ⚠ F19
- **Dataset detail** `/explore/datasets/:id` — `DatasetDetailPage` (reads `publishedForm`; draft or missing → "Dataset not found")
  - Back button (history), `DatasetActions`
  - `DatasetDataDNA` card (counts + links to connected use cases / collaboratives / events / visualisations) ⚠ F07
  - `ViewTabs`: **Data** (`DatasetDataExplorer`, `DataFileBrowser`, `DataFilePreview`, `ResourceDetailsSheet`) · **Visualisations** (`DatasetVisualisations`, `VisualisationDialog`) · **Metadata** (`DatasetOverview`: sector/geography/tag/licence/publisher links) · **Connected to** (`DatasetApplications`)
  - Tab is local state, `?view=` only read on load ⚠ F11
  - Publisher → external website only ⚠ F19
  - Badges → `/search?type=dataset&sector|geography=…` ⚠ F09
- **Use case detail** `/explore/use-cases/:id` — `UseCaseDetailPage` → `UseCasePreview` (the same component the contributor preview uses); dataset links → `/explore/datasets/:id`; tag links → search
- **Use case list** `/explore/use-cases` — `UseCasesExplorePage` (a second listing next to the Search tab, reachable only by URL) ⚠ F20
- **Collaborative detail** `/explore/collaboratives/:id` — `CollaborativeDetailPage` → `CollaborativeDetailView` + `CollaborativeActions` (these live in `pages/playground/collaborative-detail/`, shared with the playground)
- **Event detail** `/explore/events/:id` — `EventDetailPage`: EventIdentity, EventThumbnail, EventMetadataRail, EventAbout, EventSpeakers, EventRelatedContent (links come from the search index, so they inherit F06)
- **About** `/about`, **Forum** `/forum` and **Contact** `/contact` (the last two are "Coming soon" pages) ⚠ F17
- **Redirects:** `/explore/datasets|ai-models|publications|events`, `/collaboratives` → Search tab · `/publishers` → `/community?tab=people` · `/explore/organisations` → `/community?tab=organisations`

#### Contributor zone — personal
- **Dashboard** `/` — `DashboardPage`: module tiles (NAV_GROUPS), "Continue draft" cards → creation pages with the record id, organisations tile → `/organisations`, HelpButton
- **Profile** `/dashboard/profile` — `ProfilePage` → `ProfileEditForm` (bio 500 chars, avatar `FileUploadField`, socials); no link to the public profile at `/publishers/:id`
- **One module per content type** (same pattern ×7). Types: Dataset, Use case, Collaborative, AI model, Publication, Chart, Event.
  - **List** `/dashboard/<type>` — `<Type>ListView` on the shared `ManagementTable`; row actions: edit, preview, **View live** (dataset, use case, event only — opens a new tab), unpublish, delete
  - **Create/edit** `/dashboard/<type>/new` (router state carries `id`, `initialStep`, `organisationId`, `returnTo`)
    - Shell: `Card` → `WorkspaceHeader` (X, title, saved indicator) → `OrganisationContextBanner` → `Stepper` → step components → `WizardFooter` (Previous / Continue / Save draft) → `LeaveCreationDialog`
    - Steps: Dataset = in-page `DatasetCreationFlow` (Metadata, Data files, Review, `PublishSuccessModal`) · Use case = Builder, Connect, Review · Collaborative = About, Connections, Review · AI model = Versions, Details, Review · Publication = Details, Content, Review · Chart = Build, Review, `ChartPublishSuccessModal` · Event = Information, Connections, Resources, Review
    - Review step "Preview" → `window.open(/dashboard/<type>/:id/preview)` (new tab)
  - **Preview** `/dashboard/<type>/:id/preview` (no sidebar, no breadcrumb) — `PreviewActionBar` (Publish / Back to editor / Back to list) + `<Type>Preview`; reads a draft snapshot from localStorage; Publish → confirm → success state
  - Dataset has no preview route (review step only); Chart has no preview and no page of its own
- **My Organisations** `/organisations` — `OrganisationsPage`: `OrganisationCard`s, `CreateOrganisationSideSheet` (description 500 chars)

#### Contributor zone — organisation workspace (`/organisations/:organisationId/…`)
- **Dashboard** (`OrganisationDashboardPage`): module cards, "Continue draft" → personal `/dashboard/<type>/new` ⚠ F14
- **Datasets / Publications / Use cases / AI models / Collaboratives / Charts / Events** — `OrganisationContentTable` filtered by `organisationId`; Create → `/dashboard/<type>/new` with `{ organisationId, returnTo }` in router state (dataset opens `DatasetCreationFlow` in place)
- **Admin & Members** — `ManagementTable`, `AddMembersSideSheet`, `EditMemberRoleSideSheet`, permissions from `organisation-permissions.ts`
- **Profile** — `OrganisationProfilePage` (description 500 chars, logo `FileUploadField`)
- Unknown id → `OrganisationNotFound` → `/organisations`

#### Auth (separate layout)
- `/auth/sign-in` (`SignInPage`: email+password, `GoogleButton`, `GoogleAccountChooserDialog`) · `/auth/register` (`RegisterPage`, `PasswordRequirements`, `LegalDialog`) · `/auth/forgot-password`
- Success on sign-in or register → `/` — no session is created; `BackToHome` → `/` ⚠ F16 ⚠ F18

#### Internal
- `/documentation[/:slug]` — `DocumentationLayout` (content in `pages/documentation/content/*`)
- `/design-system[/:slug]` — `DocsLayout`, `DOC_PAGES` registry, `/design-system/preview/:component` chrome-less overlay previews
- `/playground` hub (`PlaygroundHubPage`) → dataset-header (also serves "data-dna" and "dataset-detail" tabs), collaborative-detail, community-profile, publication-detail, use-case-detail; `dataset-contribution` has no page (falls to the placeholder)

#### Data layer — `context/AppDataContext.tsx`
- See section 5.

---

## 3. Shared component → where it appears

| Component | Used by | Notes |
|---|---|---|
| `WorkspaceHeader`, `WizardFooter`, `Stepper`, `LeaveCreationDialog`, `OrganisationContextBanner` | all 7 creation flows | One pattern; the leave-guard only fires from the header X (F13) |
| `PreviewActionBar` | 5 preview pages (use case, collaborative, AI model, publication, event) | Same bar is what a consumer sees on an AI-model/publication link (F06) |
| `UseCasePreview` | contributor preview **and** consumer `/explore/use-cases/:id` | Single source — good |
| `CollaborativeDetailView` / `CollaborativeActions` | consumer collaborative page **and** the playground | Lives under `pages/playground/` |
| `ManagementTable` | every contributor list, org members | Row actions defined per list view |
| `OrganisationContentTable` | the 7 organisation module pages | |
| `SearchResultCard` / `ContentCard` | Search, Discover, profile content tabs, event related content, dataset Connected-to | Link target comes from `item.href` in `global-search.ts` / `lib/community.ts` |
| `FilterRail`, `FilterSheet`, `AppliedFilters`, `ResultsToolbar` | Search and Community | Search keeps sort/page/view in state; Community keeps them in the URL |
| `FilterBadge`, `SdgBadge`, `Tag` | detail pages, previews, profile hero | Build `/search?type=…&facet=…` links via `lib/search-links.ts` (F09) |
| `OneLineTags` | profile banner hero | New in PR #121 |
| `ProfileParts` (`ProfileBannerHero`, `BackLink`, `ProfileNotFound`, `ContributionSections`, `MemberCards`) | person and organisation profile pages, community playground, design-system docs | |
| `useGoBack` | dataset/event/use-case/collaborative detail, profile pages | History-based with a fallback route |
| `FileUploadField` / `DropzoneUploadField` | profile, organisation, creation steps | Standard upload fields |
| `EmptyState` | not-found states, empty lists | |
| `GlobalSearchField` | Discover, Search, Community | |

---

## 4. Page → page links (edge list)

| From | To | Via | Notes |
|---|---|---|---|
| Any consumer page | `/search?type=…` | TopNav Discover/Collaboratives/More menus | |
| Discover | `/search?q=`, `/search?type=…`, `/community` | search field, chips, ecosystem cards | |
| Discover CTA, UserMenu Dashboard, Auth "Back to Home", Contribute | `/` | | Contributor dashboard, not Home (F18) |
| Search card | dataset / use case / collaborative / event detail | `item.href` | |
| Search card | contributor preview | `item.href` | AI model, publication (F06) |
| Search "Contribute <type>" | `/dashboard/<type>/new` | | Consumer → contributor, intentional |
| Search / detail badge | `/search?type=X&facet=value` | `search-links.ts` | Some facets are dropped (F09) |
| Dataset detail | use case / collaborative / event / visualisations | Data DNA, Connected-to | Collaborative goes to preview (F07) |
| Dataset detail | `/search?type=dataset&sector|geography|tag=` | Metadata tab, header | F09 |
| Use case detail | `/explore/datasets/:id` | connected datasets | Dangling if the dataset is later removed (F04) |
| Event detail | related datasets / use cases / etc. | search-index hrefs | Inherits F06 |
| Community card | person / organisation profile | | |
| Profile | content detail pages | contribution cards | AI model → preview (F06) |
| Profile | `/community?tab=…&otype=` | badge | |
| Contributor list | preview / creation / `/explore/<type>/:id` (new tab) | row actions | View live: dataset, use case, event |
| Creation review | preview (new tab) | Preview button | |
| Preview | back to editor / list | `window.close()` then `navigate` | Edit-from-preview drops org context (F14) |
| Dataset publish modal | `/explore/datasets/:id` (new tab) | View live | F02 |
| Chart publish modal | `/explore/datasets/:id?view=visualisations` | same tab | |
| Organisation module | `/dashboard/<type>/new` | Create / Continue | State-carried context |
| Organisation dashboard | `/dashboard/<type>/new` | Continue draft | Loses context (F14) |
| Anything unknown | `/dashboard/datasets` | `path="*"` | F08 |

---

## 5. Data layer

One provider (`AppDataContext`) holds every record. Each content record has `status` (`draft`/`published`), a working-copy `form`, and a `publishedForm` (the live version). Consumer detail pages read `publishedForm`.

| Entity | Contributor store | Persisted? | Consumer page | Search index reads |
|---|---|---|---|---|
| Dataset | `datasets` | **[updated] [ls]** + sync | `/explore/datasets/:id` | `form` (working copy) ⚠ F05 |
| Event | `events` | **[updated] [ls]** + sync | `/explore/events/:id` | `form` ⚠ F05 |
| Chart | `charts` | **[updated] [ls]** + sync | none (inside dataset) | `form` |
| Use case | `useCases` | [ls] + cross-tab sync | `/explore/use-cases/:id` | `form` ⚠ F05 |
| Collaborative | `collaboratives` | [ls] + sync | `/explore/collaboratives/:id` | `form` ⚠ F05 |
| AI model | `aiModels` | [ls] + sync | **[updated]** `/explore/ai-models/:id` | `publishedForm` |
| Publication (standalone) | `publications` | [ls] + sync | **[updated]** `/explore/publications/:id` | `publishedForm` |
| Organisation workspace | `organisationWorkspaces` | [ls] + sync | `/explore/organisations/:id` | n/a |
| Legacy organisation list | `organisations` | **[mem]** | — | used for publisher resolution |
| Profile | `profile` | **[updated] [ls]** + sync | `/publishers/:id` (current user id) | n/a |

Other state stores: draft snapshots for previews (`lib/*-draft-storage.ts`, localStorage), "search origin" index (sessionStorage), help-context label (`HelpContext`).

Derived views: `buildSearchIndex` (Search, Discover, event related content, collaborative detail), `lib/community.ts` (directory + profile content), `use-data-dna.ts` (dataset connections).

---

## 6. Content-type lifecycle at a glance

| Type | Create route | Preview | View-live from list | Consumer page | Search card links to |
|---|---|---|---|---|---|
| Dataset | in-page flow on `/dashboard/datasets` | none | yes (new tab) | yes | detail |
| Use case | `/dashboard/use-cases/new` | yes | yes | yes | detail |
| Collaborative | `/dashboard/collaboratives/new` | yes | **[updated]** yes | yes | detail |
| AI model | `/dashboard/ai-models/new` | yes | **[updated]** yes | **[updated]** `/explore/ai-models/:id` | **[updated]** detail |
| Publication | `/dashboard/publications/new` | yes | **[updated]** yes | **[updated]** `/explore/publications/:id` | **[updated]** detail (event publications → event page) |
| Chart | `/dashboard/charts/new` | no | no | none by design | n/a |
| Event | `/dashboard/events/new` | yes | yes (new tab) | yes | detail |

*Change since the 2026-09-30 IA audit:* the Collaborative consumer page now exists, and "View live" row actions were added for dataset, use case and event. AI model and publication are still without a public page.
