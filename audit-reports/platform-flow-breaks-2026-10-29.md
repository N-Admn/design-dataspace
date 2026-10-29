# CivicDataSpace — Flow-Break Report

**Date:** 2026-10-29 · **Code state:** `main` at `d8095ea` (after PR #122)
**Scope:** every route in `App.tsx`, how the pages hand off to one another, and the shared components that carry those hand-offs.
**Companion:** [Page, component & flow map](../docs/platform-page-component-map.md) (finding IDs match its `⚠ F##` tags).
**Earlier work this builds on:** `ia-navigation-audit-2026-09-30.md` and `ux-continuity-fixes-2026-09-30.md`. Items from those that are fixed or still open are noted per finding.

---

## 1. Executive summary

The platform's pages are well connected on paper. Every hard-coded link in the code resolves to a real route (I checked every literal route string against the route table). The breaks are not missing pages; they are in **what happens at the hand-offs**:

1. **Data that is not saved.** Datasets, events, charts and the user profile live only in memory, while use cases, collaboratives, AI models, publications and organisations are saved to localStorage. Because "preview" and "View live" open **new tabs** (a fresh app load), event publishing is lost entirely and a just-published dataset opens as "not found" (F01, F02).
2. **Consumer links that land in contributor screens.** AI models and publications have no public page, so Search, profile pages and event pages send visitors to the contributor's preview page, with its Publish button and unpublished content (F06). The dataset page does the same for connected collaboratives (F07).
3. **Links that silently do nothing.** Badge and menu links that ask Search for a filter the target tab doesn't have are ignored with no message (F09). This includes the dataset "sector" badge, which **stopped working with the Datasets filter change in PR #121** (my change; see F09).
4. **Work that is lost without warning.** Only the X button in a creation flow asks before leaving; the sidebar, browser back, refresh and closing the tab all drop unsaved work (F13). Organisation context is dropped when you resume a draft from the organisation dashboard or edit from a preview (F14).
5. **Placeholder controls that look real.** The whole footer, three "More" menu items and the "Log In" button do nothing or do something misleading (F16, F17).

**Counts:** 21 findings: 2 critical, 9 high, 7 medium, 3 low.

**How this was checked (important):** by reading the code and tracing each hand-off, plus a script that checks link strings against the route table. **Nothing was run in a browser**, so each finding says what the code will do, not what I watched happen. Items I could not fully confirm are marked *needs a click-through*.

### Status update (same day): provider/consumer boundary change

A follow-up change on branch `feat/provider-consumer-boundary` resolved these findings. They are kept below as the record of what was found.

| Finding | Status | What changed |
|---|---|---|
| F01 Event publish lost | **Fixed** | Events are saved to localStorage and synced across tabs |
| F02 New dataset "View live" not found | **Fixed** | Datasets are saved the same way |
| F03 Inconsistent persistence | **Fixed** | Datasets, events, charts and the profile now persist like the other types (this also stops a new chart reusing the id `chart-1`) |
| F05 Search shows unpublished edits | **Fixed** | The search index reads the published version of every type |
| F06 AI model / publication open the contributor preview | **Fixed** | New public pages `/explore/ai-models/:id` and `/explore/publications/:id`; Search, profiles and events link there |
| F07 Dataset "Connected to" opens a preview | **Fixed** | Links to `/explore/collaboratives/:id` |
| F08 Unknown URLs land in the workspace | **Fixed (partly)** | Unknown URLs go to the home page. A real "not found" page is still open |
| F09 Filter links silently ignored | **Fixed for `sector`** | `sector` is a chip-only filter on every tab, so the dataset badge and the featured Collaboratives themes work again. Other facets are unchanged |
| F16 No real sign-in | **Fixed** | One session store; every provider page requires it (see below) |
| F18 "Home" ambiguity | **Partly** | Auth "Back to Home" goes to the home page |

Still open: F04, F10, F11, F12, F13, F14, F15, F17, F19 (profiles now count standalone publications; publisher links are still missing), F20, F21.

**The boundary now:** `/`, `/dashboard/*` and `/organisations/*` are provider pages. A signed-out visitor who opens one goes to the sign-in page and, after signing in or registering, to the page they asked for. The bare root `/` goes to the home page. Every consumer button that leads to the provider side (TopNav "Contribute", Discover call-to-action, Search "Contribute <type>", the Community call-to-actions) takes a signed-out visitor to sign-in first. "Log In / Sign Up" returns to the page you were on. Signing out from a provider page lands on the home page.

### Severity

| Level | Meaning |
|---|---|
| **Critical** | A core flow ends in lost data or a wrong result |
| **High** | A visitor or contributor reaches the wrong place, or silently loses something |
| **Medium** | Confusing or inconsistent, with a workaround |
| **Low** | Polish, or only reachable by typing a URL |

### Summary table

| ID | Finding | Severity | Zone |
|---|---|---|---|
| F01 | Event publish is lost (preview opens in a new tab with its own memory) | Critical | Contributor |
| F02 | "View live" for a new dataset opens "not found" | Critical | Contributor → Consumer |
| F03 | Persistence is inconsistent across content types | High | Data |
| F04 | Deleting or unpublishing leaves dangling links | High | Data |
| F05 | Search shows unpublished edits that the detail page doesn't | High | Consumer |
| F06 | AI model and publication links land on the contributor preview | High | Consumer ⇢ Contributor |
| F07 | Dataset "Connected to" opens a collaborative's contributor preview | High | Consumer ⇢ Contributor |
| F08 | Unknown public URLs land in the contributor workspace | Medium | Routing |
| F09 | Filter links the target tab doesn't support are silently ignored | High | Consumer |
| F10 | Search sort, page and view are not in the URL | Medium | Consumer |
| F11 | Dataset tabs aren't synced to the URL (and one link can do nothing) | Medium | Consumer |
| F12 | Top navigation highlights the wrong item or none | Low | Shell |
| F13 | No guard against losing unsaved work except the X button | High | Contributor |
| F14 | Organisation context is lost when resuming a draft or editing from a preview | High | Contributor |
| F15 | A preview can show a stale snapshot | Low | Contributor |
| F16 | There is no real sign-in; "Log In" is a local toggle | High | Auth |
| F17 | Dead controls: footer, menu items, auth footer, Help & Support | Medium | Shell |
| F18 | "Home" means different things in different places | Medium | Shell |
| F19 | Content pages don't link to who published them | Medium | Consumer |
| F20 | Two listing pages for use cases | Low | Consumer |
| F21 | Playground hub entry with no page | Medium | Internal |

*(F15 and F21 are the lowest-confidence items; see their notes.)*

---

## 2. Findings

### F01 · Event publish is lost — **Critical**

**Where:** `EventCreationPage.tsx:164` (opens the preview in a new tab), `EventPreviewPage.tsx:73` (publishes there), `AppDataContext.tsx:314` (events start from mock data in memory, no storage, no cross-tab sync).

**What happens:** The contributor clicks Preview, a new tab loads the app fresh, with only the mock events in memory. The preview reads the draft from a localStorage snapshot, so it looks right. Clicking Publish saves to *that tab's* memory. The first tab never hears about it, and closing the tab discards it. The event never appears in Search or at `/explore/events/:id`. Use cases, collaboratives, AI models and publications don't have this problem because they are saved and synced between tabs.

**Options**
1. **Persist events like use cases (recommended).** Add the same localStorage save and tab-sync that the other persisted types have. Smallest change; fixes F01 and part of F03.
2. **Preview in the same tab.** Open the preview as a normal route change instead of a new tab, and return to the editor on Back. Removes the new-tab data split for every type, but the editor state would need to survive the round trip (see F13).
3. **Move all content to one persisted store.** Replace the per-type save code with one storage layer behind `AppDataContext`. Biggest change; also solves F02, F03 and the cross-tab behaviour, and is the natural step before a real backend.

---

### F02 · "View live" for a new dataset opens "not found" — **Critical**

**Where:** `PublishSuccessModal.tsx` (View live, `target="_blank"`), `DatasetListView.tsx:182`; datasets in memory only (`AppDataContext.tsx:313`).

**What happens:** The new tab is a fresh app load, so it holds only the mock datasets. A dataset created in this session shows "Dataset not found". The same goes for datasets opened by pasting the link. Mock datasets work, which is probably why this hasn't shown up.

**Options**
1. **Persist datasets (recommended).** Same fix as F01, applied to datasets (and charts, which hang off them).
2. **Open "View live" in the same tab.** Works without persistence, but the contributor leaves the workspace, and a refresh still loses the dataset.
3. **Hide "View live" for non-persisted items** until persistence exists. Honest but removes a useful action.

---

### F03 · Persistence is inconsistent across content types — **High**

**Where:** `AppDataContext.tsx` (persisted: use cases, collaboratives, AI models, publications, organisation workspaces; in memory: datasets, events, charts, legacy organisations, profile).

**What happens:** Refresh the page and a new dataset, event, chart or profile edit is gone, while a new use case stays. People reasonably read this as random data loss. It also means a profile edit disappears from the public profile on reload.

**Options**
1. **Persist the remaining types the same way (recommended).** Consistent, small per type, and it matches what already exists.
2. **One generic persisted-collection helper** used by all types, replacing the five near-identical copies. Less code to maintain; slightly more work now.
3. **Say it plainly.** Keep memory-only for the prototype and add a "prototype data resets on reload" notice. Cheapest; only acceptable if you won't demo reload or new-tab flows.

---

### F04 · Deleting or unpublishing leaves dangling links — **High**

**Where:** `AppDataContext.tsx` (`deleteDataset`, `unpublishDataset` and the other seven pairs only change their own list).

**What happens:** Delete or unpublish a dataset and any use case, collaborative or chart that was connected to it still lists it. The connection links to `/explore/datasets/:id` (for example `UseCaseSections.tsx:295`) and ends on "Dataset not found". The Data DNA counts on the dataset page can also disagree with what is clickable.

**Options**
1. **Hide, don't remove (recommended).** When rendering connections, skip records that are missing or not published. No data changes, so no risk.
2. **Warn before deleting or unpublishing.** Show "N items use this" in the confirm dialog, then still allow it.
3. **Clean up on delete.** Remove the connection from every record that references it. Most thorough; most invasive and hard to undo.

---

### F05 · Search shows unpublished edits that the detail page doesn't — **High**

**Where:** `lib/global-search.ts` reads `d.form`, `u.form`, `c.form`, `e.form`, `m.form` for published items; detail pages read `publishedForm`. Saving over a published record keeps `status: 'published'` and updates only `form` (`lib/content-status.ts`).

**What happens:** Edit a live use case's title and save without publishing: Search shows the new title, the detail page shows the old one. Changing an AI model's access method does the same. Filters and counts can also reflect unpublished changes. The AI model preview (F06) shows the working copy as if it were live.

**Options**
1. **Index `publishedForm` (recommended).** One change in `buildSearchIndex`; search then always matches what the detail page shows.
2. **Index both and flag.** Keep the working copy for the contributor's own view and the published copy for consumers, with separate indexes.
3. **Block saving edits over a live record** until published. Changes the contributor workflow; not recommended.

---

### F06 · AI model and publication links land on the contributor preview — **High**

**Where:** `lib/global-search.ts:376` and `:409`, `lib/community.ts:158`, plus anything built from the search index (event related content, collaborative connections). Ungated page: `AIModelPreviewPage.tsx`, `PublicationPreviewPage.tsx`.

**What happens:** A visitor clicking an AI model in Search, on a profile or on an event page opens `/dashboard/ai-models/:id/preview`. They see the contributor chrome (no breadcrumb, the "Preview – this is what your AI Model will look like" bar), a **Publish** button, and the working copy rather than the live version. The page reads the draft snapshot first, then `record.form`. It has no `status === 'published'` check. *Status vs the 2026-09-30 audit: still open for these two types.*

**Options**
1. **Build the two public pages (recommended).** `/explore/ai-models/:id` and `/explore/publications/:id`, reusing the existing preview body components with `publishedForm`, a Back button and no action bar (as `UseCaseDetailPage` already does). Then point all links there.
2. **Reuse the preview page in a read-only "public" mode.** Same route, but when the viewer isn't the owner or the record is published, hide the action bar and show `publishedForm`. Faster, but keeps consumers on a `/dashboard` URL.
3. **Stop linking until pages exist.** Show AI models and publications in Search as non-clickable cards, or a "details coming soon" state. Honest; removes the dead end but also the content.

---

### F07 · Dataset "Connected to" opens a collaborative's contributor preview — **High**

**Where:** `components/dataset/consumer/data-dna/use-data-dna.ts:298`. The collaborative consumer page exists (`/explore/collaboratives/:id`) and every other link uses it.

**What happens:** Under a dataset's Connected-to / Data DNA card, a connected collaborative opens the contributor preview (with working copy and Publish button).

**Options**
1. **Change the link to `/explore/collaboratives/:id` (recommended).** One line.
2. **Route every consumer link through one helper** (`consumerHref(type, id)`) so no page builds its own path. Prevents F06 and F07 from recurring.
3. **Gate the preview routes** so a non-owner is redirected to the public page. Fixes it at the other end; needs F01-style ownership data that doesn't exist yet.

---

### F08 · Unknown public URLs land in the contributor workspace — **Medium**

**Where:** `App.tsx:278` (`path="*"` → `/dashboard/datasets`). Example: `/explore/ai-models/123` or `/explore/publications/9` match nothing and drop the visitor into "My Datasets".

**Options**
1. **Add a real "page not found"** with links to Search and Discover (recommended).
2. **Redirect by prefix:** `/explore/*` to Search, `/dashboard/*` to the workspace, everything else to Discover.
3. **Keep the redirect but show a toast** ("That page doesn't exist"). Lowest effort; still a surprising destination.

---

### F09 · Filter links the target tab doesn't support are silently ignored — **High**

**Where:** `lib/search-links.ts`, `lib/search-filters.ts` (`allowedFilterKeys`), `SearchResultsPage.tsx` (`readFilters` skips disallowed keys). Each tab only accepts its own rail filters plus `geography` and `modelType`:

| Tab | Accepts | Links that ask for something else |
|---|---|---|
| Datasets | Last updated, File type | `DatasetOverview.tsx:242`, `DatasetDetailHeader.tsx:138` → `sector` |
| Use cases | Last updated, SDG goal | `UseCaseSections.tsx:349` → `sector` |
| Collaboratives | Last updated, SDG goal | Featured themes `global-nav-config.ts:197,205,213` → `sector` |
| Events | Last updated, Event type | `EventIdentity.tsx:23` → `sector` |
| Publications | Last updated, Resource type | `PublicationPreview.tsx:70` → `sector` |

**What happens:** Clicking the sector badge (or "Climate Action Data" in the Collaboratives menu) opens the tab unfiltered. No chip is shown and no message is given, so it looks as if the filter matched everything.

**Regression note:** the **dataset** row is mine. Before PR #121, Datasets had a Sector filter and the badge worked; replacing it with File type left the badge links pointing at a filter that no longer exists. The other four rows predate this.

**Options**
1. **Make `sector` a chip-only filter on every tab (recommended).** Add it beside `geography` and `modelType` (the "extra facets" mechanism that already exists) so any link that asks for a sector still filters and shows a removable chip, even where there is no rail group.
2. **Add the missing groups to the rails.** Sector on Collaboratives, Events, Use cases, Publications, and (if you want it back) Datasets. Most visible to users but makes rails long; the file-type decision then needs revisiting.
3. **Stop linking.** Make those badges plain text where the tab can't filter. Removes the false promise but also the feature.

*Needs a click-through:* this is read from the code; confirm each row once in the browser.

---

### F10 · Search sort, page and view are not in the URL — **Medium**

**Where:** `SearchResultsPage.tsx:148-149, 250` (`useState` for view, sort and page). The Community directory keeps all of these in the URL (`use-directory-params.ts`).

**What happens:** Open result #25 from page 3, press Back: Search returns on page 1, default sort, list view. The query and filters survive. Sharing or reloading loses the rest.

**Options**
1. **Move sort, page and view into the URL (recommended).** Reuse the pattern from `use-directory-params.ts`.
2. **Restore from session storage** on return. Works for Back but not for sharing.
3. **Leave it and rely on filters** to narrow. Weakest, but zero work.

---

### F11 · Dataset tabs aren't synced to the URL (and one link can do nothing) — **Medium**

**Where:** `DatasetDetailPage.tsx:35-42` — `view` is local state, seeded from `?view=` on load and updated only when `?view=` *changes*.

**What happens:** (a) Switching tabs doesn't change the URL, so reload or a copied link returns to the Data tab. (b) If the URL already says `?view=visualisations` and the user manually switches to Metadata, clicking a Data DNA link back to `?view=visualisations` is the *same* URL, so the effect doesn't fire and the click appears to do nothing.

**Options**
1. **Make the URL the source of truth (recommended).** Tab click sets `?view=` (replace, not push), the page reads it directly. Fixes both.
2. **Keep local state and also listen to navigation events** (including same-URL clicks). Smaller change; the URL still doesn't track the tab.
3. **Leave the tabs as they are** and only fix (b) by having the DNA links set the tab directly.

---

### F12 · Top navigation highlights the wrong item or none — **Low**

**Where:** `TopNav.tsx:633-637` — `isCollaborativesActive` tests `pathname === '/collaboratives'`, a route that now only redirects; `isSearchActive` is only true on `/search` itself.

**What happens:** On a dataset, use case, event or collaborative detail page, nothing in the navigation is highlighted, and the Collaboratives item can never be highlighted. Not a navigation failure; it removes orientation.

**Options**
1. **Highlight "Search" for every detail and listing page** reached from Search, and highlight Collaboratives when the type is `collaborative` (recommended).
2. **Derive the highlight from the breadcrumb trail**, so both stay in step.
3. **Remove the highlight** and rely on the breadcrumb. Least effort.

---

### F13 · No guard against losing unsaved work except the X button — **High**

**Where:** all seven creation pages (for example `AIModelCreationPage.tsx:76-92`); no `useBlocker` or `beforeunload` anywhere in `src`. Form state is `useState`, and the current step is not in the URL.

**What happens:** The leave-confirmation fires only from the header X. A click on any sidebar link (the sidebar stays visible during creation), the TopNav, the browser Back button, a refresh or closing the tab drops the unsaved form without a prompt. A refresh also restarts at step 1.

**Options**
1. **Add a leave guard to the router and the tab (recommended).** `useBlocker` for in-app navigation (reusing `LeaveCreationDialog`) plus a `beforeunload` for reload/close, only when `hasUnsavedChanges`.
2. **Autosave drafts.** Save on a timer and on step change so there is little to lose; then the guard can be lighter. Fits the "saved" indicator already in the header. Needs F03 persistence for datasets and events.
3. **Hide the sidebar during creation** (as the preview pages do) so the only exit is the X. Cheap, but doesn't help Back, refresh or close.

---

### F14 · Organisation context is lost when resuming a draft or editing from a preview — **High**

**Where:** `OrganisationDashboardPage.tsx:127-169` (every "Continue draft" passes only the record id), `AIModelPreviewPage.tsx:38` and the other preview pages (edit passes only the id). Creation pages take `organisationId` and `returnTo` from router state (`AIModelCreationPage.tsx:44-47`). The organisation module pages (`OrganisationUseCasesPage.tsx:30`) do pass them correctly.

**What happens:** Resume an organisation's draft from the organisation dashboard (or press Edit in a preview): the organisation banner disappears, the sidebar switches from the organisation to the personal one, and closing returns to the *personal* list. The record keeps its organisation (the saved record is not reassigned), so the data is fine; the experience is not.

**Options**
1. **Derive the context from the record (recommended).** The creation page reads `record.organisationId` and builds `returnTo` itself, so no caller has to remember to pass it, and it also works when the router state is missing (new tab, shared link).
2. **Fix each caller** to pass `organisationId` and `returnTo`. Simple; easy to miss one of the 7 types × several entry points again.
3. **Move creation under the organisation URL** (`/organisations/:id/<type>/new`). Cleanest for context and the sidebar; largest routing change.

---

### F15 · A preview can show a stale snapshot — **Low** *(lowest confidence)*

**Where:** `lib/*-draft-storage.ts`, preview pages (`const [snapshot] = useState(() => load…Snapshot(id))`).

**What happens:** Preview reads the localStorage snapshot first and only falls back to the record. A snapshot is written each time Preview is clicked, so normally it is current; but reopening the preview URL later (bookmark, history) shows the last snapshot rather than the latest saved record. *Needs a click-through to confirm how often this happens.*

**Options**
1. **Clear the snapshot when the draft is saved** or published (recommended).
2. **Prefer the saved record unless the snapshot is newer** (compare timestamps).
3. **Leave it**; low impact.

---

### F16 · There is no real sign-in — **High**

**Where:** `TopNav.tsx:600` (`useState(false)` for `isLoggedIn`), `:629` (Contribute), `AuthButton` (calls `setIsLoggedIn(true)` directly), `SignInPage.tsx:74,109,120` and `RegisterPage.tsx:96` (navigate to `/`), `App.tsx` (auth routes render without TopNav, so the flag resets when you visit them).

**What happens:** "Log In / Sign Up" turns into a user menu without ever visiting the sign-in page. "Contribute" sends a signed-out visitor to the sign-in page, which, on success, goes to `/` — and the TopNav is then back to signed out. No route is protected: any `/dashboard/*` or `/organisations/*` URL opens directly. *Status vs the 2026-09-30 audit: still open.*

**Options**
1. **Add a small session store** (one context, backed by sessionStorage) that sign-in, register and sign-out set, that TopNav reads, and that a route wrapper uses to send signed-out visitors from contributor URLs to sign-in with a return path (recommended if auth demos matter).
2. **Make the entry points consistent without guarding routes.** "Log In" always goes to sign-in; sign-in success sets the flag and returns to the page you came from. Smaller; no protection.
3. **Leave as a declared prototype limit** and remove the misleading toggle (always show the user menu, or always show "Log in" → sign-in page).

---

### F17 · Dead controls: footer, menu items, auth footer, Help & Support — **Medium**

**Where:** `Footer.tsx` (five `<button>`s with no handler), `global-nav-config.ts` (Privacy & Policy, Help & FAQ, Accessibility have no destination), `AuthLayout.tsx:35-43` (three `href="#"`), `nav-config.ts:65` (Help & Support `path: null` → "coming soon"), `App.tsx` (`/forum` and `/contact` are "Coming soon" pages while Contact opens a drawer from the menu).

**Options**
1. **Mark unfinished ones consistently (recommended):** reuse the existing "Coming soon" treatment (disabled style + label) for every control without a destination, and point `/contact` at the same drawer.
2. **Build the minimal pages** (Privacy, Terms, Accessibility, Help) as static content, so every footer link works.
3. **Remove what isn't ready** from the footer and menus until it is.

---

### F18 · "Home" means different things in different places — **Medium**

**Where:** Logo and breadcrumb "Home" → `/discover` (`BreadcrumbBar.tsx:20`, `TopNav.tsx:652`); the Discover call-to-action (`DiscoverPage.tsx:155`), UserMenu "Dashboard", Auth "Back to Home" (`AuthLayout.tsx:8`) and both sign-in/register success paths → `/` (the contributor dashboard).

**What happens:** "Back to Home" on the sign-in page opens the contributor workspace, not the home page. Signing in and landing on the workspace is expected; "Home" meaning it is not.

**Options**
1. **Reserve "Home" for `/discover`, rename the other to "Dashboard"/"Workspace"** and fix the auth "Back to Home" target (recommended).
2. **Make `/` the single home** and show a workspace or a landing depending on sign-in state. Bigger change; depends on F16.
3. **Leave it** and document the two homes.

---

### F19 · Content pages don't link to who published them — **Medium**

**Where:** `DatasetOverview.tsx:437` (publisher links only to its external website), consumer dataset, use case and event components contain no link to `/explore/organisations/:id` or `/publishers/:id`. The profiles are reachable only through Community.

**What happens:** From a dataset a visitor can't go to its publisher's page; they have to leave, open Community and search for the organisation. The reverse direction (profile → content) works. Standalone publications are also not counted on profiles (`lib/community.ts` reads only event publications).

**Options**
1. **Link the publisher and contributor names to their profiles (recommended)** where a matching organisation workspace or person exists; plain text otherwise.
2. **Add a "Published by" card** on detail pages with the profile card (image, name, counts).
3. **Leave as is** until real attribution data exists (the sample data is mock).

---

### F20 · Two listing pages for use cases — **Low**

**Where:** `UseCasesExplorePage` at `/explore/use-cases` (its own grid) vs the Use Cases tab in Search. Nothing in the app links to the former any more; the breadcrumb still has a label for it.

**Options**
1. **Redirect `/explore/use-cases` to the Search tab** like the other types (recommended), and delete the page.
2. **Keep it** as a curated landing and link it from Discover.
3. **Leave it** reachable by URL only.

---

### F21 · Playground hub entry with no page — **Medium** *(internal only; lowest confidence)*

**Where:** `playground-registry.ts` lists `dataset-contribution` → `/playground/dataset-contribution`; `App.tsx` has no explicit route, so it falls into `/playground/:playgroundId` → `PlaygroundPlaceholderPage`. The two chrome-less playgrounds (`collaborative-detail`, `community-profile`) have their own back link to the hub.

**Options**
1. **Mark it "Planned" in the registry** so it doesn't look in-progress (recommended).
2. **Add a real placeholder with the playground's intent.**
3. **Remove the entry** until work starts.

---

## 3. What looked right (so you know what was checked)

- **Every literal route string** in the code resolves to a defined route (script check; only prefixes without an id were flagged, and they are fine).
- **Back buttons** on the consumer pages now go back through history with a fallback (PR #121).
- **Community directory and profiles:** state in the URL, back, tab and "Close search" logic hold up, and the search-origin tracking handles refinements correctly.
- **Preview "View live"** for use case, dataset and event row actions exist (a change since the September audit); the Collaborative public page exists.
- **Chart publish → dataset Visualisations tab** is a same-tab route change and works with in-memory data.
- **Organisation module pages** pass `organisationId` and `returnTo` correctly.

## 4. Not covered

- No browser run, device testing or accessibility check (see the existing accessibility reports).
- The contents of the documentation and design-system pages beyond their routing.
- Content correctness inside the creation steps (validation rules) and mock data quality.
- Anything needing a backend (real auth, ownership checks, real attribution).

## 5. Suggested order of work

1. **Quick, high value (hours):** F07 (one link), F09 option 1 (restores the dataset sector badge), F05 (index `publishedForm`), F08 (not-found page).
2. **Data foundation (one piece of work):** F01 + F02 + F03 together, by persisting datasets, events, charts and profile the same way as the rest. F04 (hide dangling) fits here.
3. **Public pages for AI models and publications (F06),** which also settles the preview-as-public-page problem.
4. **Contributor safety (F13, F14),** guard first, then derive organisation context from the record.
5. **Auth and shell clean-up (F16, F17, F18)** as one pass, since they share the "what does signed in mean" decision.
6. **Polish:** F10, F11, F12, F19, F20, F21, F15.
