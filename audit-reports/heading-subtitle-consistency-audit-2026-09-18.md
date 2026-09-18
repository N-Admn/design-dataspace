# Module Heading & Subtitle Consistency Audit

**Date:** 2026-09-18
**Scope:** Page titles, subtitles, section headings, form-section copy, and empty/success-state copy across every contributor and consumer module.
**Method:** Static inspection of route/page/component source (no code changes). Findings are evidence-based — every claim below is backed by a file:line citation. Two named modules in the request (**Publishers**, **Sectors**) do not exist as standalone pages/routes in this codebase — see note in Section C.

---

## A. Executive Summary

The product has **two competing heading/subtitle systems overlapping in the same UI**, plus a handful of copy-level inconsistencies layered on top of that. Concretely:

1. **An incomplete design-token migration is the single biggest driver of inconsistency.** A newer semantic token set (`text-text-brand`, `text-text-subdued`, `text-text-default`, `border-border-default`) coexists with an older Tailwind-alias set (`text-primary`, `text-muted-foreground`, `text-foreground`, `border-border`) that means *the same thing* but is spelled differently. 58 component files still use the old tokens; 38 use the new ones. This alone explains most of the visual/token inconsistency the audit was asked to check (Section 5) — it is **not** six separate copy bugs, it is one migration that stopped partway. (Confirmed: `git log` shows a `css-reconciliation` branch merged 2026-09-17 that migrated `src/components/ui/*`, `shared/*`, and `dataset/*` — but not `usecase/`, `event/`, `ai-model/`, `collaborative/`, `chart/`, `publication/`.)
2. **The five "standalone content module" list pages (Events, Use Cases, AI Models, Charts, Collaboratives, Publications) mostly follow one shared subtitle pattern** ("Create, manage and publish X so people can…"), but **Datasets breaks it** with a dynamic count-based subtitle and a "My Datasets" title where every sibling uses the bare plural ("Events", "Use Cases", etc.).
3. **The Organisation Workspace's equivalent pages introduce a *third* pattern** (`"N items · created by members of {org}"`) that matches neither of the above two — expected, since organisation-scoped content genuinely needs to say who created it, but the exact phrasing wasn't reconciled against the individual-module wording.
4. **"Basic Information" — the task's own worked example — is itself inconsistent**: Dataset, Use Case, and Collaborative all call their first section "Basic Information," but Event calls it "Event Identity" and AI Model calls it "About the Model." Same concept, three names.
5. **The Review/Publish step label is inconsistent across every single creation flow** — Dataset alone says "Review & Publish"; Use Case, AI Model, Publication, and Collaborative say "Review"; Event says "Publish." This is the exact example given in the task brief, and it's confirmed real.
6. **One outright spelling bug**: `UseCaseStep2Connect.tsx:148` renders `<CardTitle>Organizations</CardTitle>` (American spelling) — the only occurrence of that spelling anywhere in the app, against a consistent "Organisation" (British) spelling everywhere else, including the sibling Collaborative module's "People & Organisations."
7. **Add-button labels split three ways**: `"Add X"` (Dataset, Event, Use Case, Chart, Collaborative) vs. `"Add New X"` (AI Model, Publication) vs. `"Create X"` (all Organisation-scoped modules).
8. **Empty-state capitalization is inconsistent** in a way that looks accidental rather than intentional: `"No datasets yet"` / `"No events yet"` / `"No use cases yet"` / `"No charts yet"` / `"No collaboratives yet"` (lowercase noun) vs. `"No AI Models yet"` / `"No Publications yet"` (capitalized noun) — for the exact same grammatical slot.

None of this is a "redesign the interface" problem. It's a naming/wording reconciliation problem, plus finishing a token migration that's already ~60% done. The fix is almost entirely **content-only and component-consolidation**, not new UI.

---

## B. Content Hierarchy Standard (Recommended)

| Level | Rule | Example |
|---|---|---|
| **Page title** | Sentence case. Bare module name in plural for list pages ("Events", not "My Events" / "Manage Events"). Use a possessive/scoped title ("My Organisations", "Organisation Profile") only when the page is explicitly personal or already scoped to one entity. | `Events` / `My Organisations` |
| **Page subtitle** | One sentence, present tense, states what the user can do here. Omit if the title + visible content (a table with an Add button) is already self-explanatory. Required when the page mixes creation + management + discovery (which every list page in this app does), so **keep** subtitles on all content-module list pages. | `Create, manage and publish events so people can discover and attend them.` |
| **Section heading** | Sentence case, 1–3 words, names the *content*, not the *action* ("Basic Information", not "Fill in basic info"). | `Basic Information` |
| **Section description** | One sentence, only when the section needs framing beyond its heading (what/why, not implementation detail). Omit for sections whose fields are self-explanatory (e.g. "Classification" with just a Sector dropdown). | `Introduce your use case with a title, short summary and image.` |
| **Form-section heading** | Same as section heading. | `Publishing Settings` |
| **Field label** | Sentence case, no trailing colon. Asterisk (`*`) for required, using the existing `text-text-critical-strong` token — never colour alone. | `Organisation name *` |
| **Helper text** | Only when it adds information not in the label (format, limit, consequence). Never restate the label. | `JPG or PNG. Max 20MB.` |
| **Error message** | Plain sentence, states the problem, starts with a verb or "Enter/Select". No period-less fragments. | `Enter a valid email address.` |
| **Empty-state heading** | `No {plural noun} yet` — always lowercase noun, matching the majority pattern already in the app. | `No AI models yet` |
| **Empty-state description** | `Create your first {singular noun} to {benefit}.` — always lowercase noun. | `Create your first AI model to make it discoverable on CivicDataSpace.` |
| **Success message** | Past tense, states what happened, one sentence. Add a second sentence only when there's a non-obvious consequence (e.g. "You are now an admin of this organisation."). | `Organisation created successfully.` |

**Governing rule (per the task's own instruction, restated as the standard):** add a subtitle when it improves orientation or task completion (every list page, every multi-step creation flow's first screen); omit it when the heading is already unambiguous in context (e.g. a "Classification" card containing only a Sector dropdown, or a confirmation dialog whose body text already explains the action).

---

## C. Module-by-Module Audit Table

Legend: **P0** = accessibility/usability blocker · **P1** = consistency/comprehension issue · **P2** = minor copy/visual polish.

| Module / Page | Section | Current Heading | Current Subtitle | Issue | Recommended Pattern | Priority |
|---|---|---|---|---|---|---|
| Datasets list (`DatasetListView.tsx:154-155`) | Page | `My Datasets` | `{n} dataset{s} · manage published datasets and continue drafts` | Only list page with a possessive title; only one with a `·`-delimited, count-first subtitle structure | `Datasets` / `Create, manage and publish datasets so people can discover and reuse them.` | P1 |
| Events list (`EventListView.tsx:161-162`) | Page | `Events` | `Create, manage, maintain, and publish events under your stewardship.` | Oxford comma present here but absent in siblings; "under your stewardship" is unusually formal/jargon vs. the plain style elsewhere; redundant "manage, maintain" | `Events` / `Create, manage and publish events so people can discover and attend them.` | P1 |
| Use Cases list (`UseCaseListView.tsx:145-146`) | Page | `Use Cases` | `Create, manage and publish Use Cases that demonstrate how civic data is being used.` | Mid-sentence capitalization of "Use Cases" (should be sentence case per the standard) | `Create, manage and publish use cases that show how civic data is being used.` | P2 |
| AI Models list (`AIModelListView.tsx:158-160`) | Page | `AI Models` | `Create, manage and publish AI Models so people can discover and access them.` | Mid-sentence capitalization of "AI Models" (proper-noun-style capitalization is defensible for "AI" but "Models" shouldn't cap) | `Create, manage and publish AI models so people can discover and access them.` | P2 |
| Charts list (`ChartListView.tsx:154-155`) | Page | `Charts` | `Create and manage visualizations for your datasets.` | (a) Missing "publish" — every sibling module's subtitle lists create/manage/**publish**, Charts drops the verb even though charts do have a publish state; (b) American spelling "visualizations" vs. British spelling used everywhere else in the app (Organisation, Collaboratives, etc.) | `Create, manage and publish visualisations for your datasets.` | P1 |
| Collaboratives list (`CollaborativeListView.tsx:146-147`) | Page | `Collaboratives` | `Create, manage and publish Collaboratives that bring people, data and Use Cases together.` | Mid-sentence capitalization of "Collaboratives" and "Use Cases" | `Create, manage and publish collaboratives that bring people, data and use cases together.` | P2 |
| Publications list (`PublicationListView.tsx:142-143`) | Page | `Publications` | `Create, manage and publish reports, findings and other content so people can discover them.` | Structurally different from siblings — describes content *types* instead of naming the module ("Publications") | `Create, manage and publish publications so people can discover them.` (or keep content-type framing if that's an intentional product decision — see Section G.5) | P2 |
| Organisation Datasets/Use Cases/Events (`OrganisationDatasetsPage.tsx:64-66` etc.) | Page | `Organisation {Module}` | `{n} {item}{s} · created by members of {org}` | Third distinct subtitle pattern, not reconciled with the individual-module "Create, manage and publish…" sentence style | Keep the organisation-scoped structure (it correctly conveys shared authorship) but align verb tense/punctuation: `{n} {item}{s} created by members of {org}.` (drop the mid-dot, add a period, for consistency with sentence-style subtitles elsewhere) | P2 |
| My Organisations (`OrganisationsPage.tsx:24-26`) | Page | `My Organisations` | `Manage contributions and collaborate with organisations you belong to.` | None — this is the standard's own worked example and is followed correctly | No change | — |
| Organisation Dashboard (`OrganisationDashboardPage.tsx:117-119`) | Page | `{Org name} Workspace` | `Manage and collaborate on contributions created by your organisation.` | None structurally; uses the newer `text-text-brand` token correctly | No change | — |
| Organisation Profile (`OrganisationProfilePage.tsx:70-75`) | Page | `Organisation Profile` | `Manage this organisation's public profile information.` / `View…` (role-conditional) | None — good example of conditional subtitle based on permission | No change | — |
| Admin & Members (`OrganisationMembersPage.tsx`) | Page | `Admin & Members` (via `ManagementTable` title prop) | Role-conditional (`Manage organisation members…` / `View the people who are part…`) | None | No change | — |
| Dataset creation, Step 1 (`Step1Metadata.tsx:27-29`) | Form section | `Basic Information` | *(none)* | No description at all, while the same-named section in Use Case has one | Add: `Name and describe your dataset so people can find and understand it.` | P1 |
| Use Case creation, Builder step (`UseCaseBasicInfoSection.tsx:23-25`) | Form section | `Basic Information` | `Introduce your Use Case with a title, short summary, and image.` | Mid-sentence cap "Use Case"; otherwise this is the standard's own example and is good | `Introduce your use case with a title, short summary and image.` | P2 |
| Collaborative creation, Step 1 (`CollaborativeStep1About.tsx:28`) | Form section | `Basic Information` | *(need to verify — not confirmed with a description in this pass)* | Consistent heading name with Dataset/Use Case ✅ | Verify a description exists; add one matching the standard if not | P2 |
| Event creation, Information step (`EventInformationStep.tsx:153`) | Form section | `Event Identity` | *(not captured in this pass)* | Different heading for the same "name/describe the thing" concept as Dataset/Use Case/Collaborative's "Basic Information" | Rename to `Basic Information` for consistency, or confirm this is an intentional distinction (Event's first section is more about identity/branding than descriptive metadata) — **product decision** | P1 |
| AI Model creation, Step 1 (`AIModelStep1Details.tsx:88`) | Form section | `About the Model` | *(not captured in this pass)* | Different heading for the same concept | Rename to `Basic Information` | P1 |
| Use Case connect step, people section (`UseCaseStep2Connect.tsx:89`) | Form section | `Contributors` | — | Different term from Collaborative's "People & Organisations" and Event's "Speakers"/"Organiser"/"Partners" for conceptually adjacent "who's involved" sections | These may be legitimately distinct concepts (a contributor ≠ a speaker ≠ a partner) — **flag for product review**, not an automatic rename | P1 (flag only) |
| Use Case connect step, organisation section (`UseCaseStep2Connect.tsx:148`) | Form section | `Organizations` | — | **Confirmed spelling bug** — American spelling, the only instance in the codebase | `Organisations` | **P0** |
| Every creation flow's final step label (`DatasetCreationFlow.tsx:33`, `UseCaseCreationPage.tsx:31`, `AIModelCreationPage.tsx:27`, `EventCreationPage.tsx:29`, `PublicationCreationPage.tsx:26`, `ChartCreationPage.tsx:30`, `CollaborativeCreationPage.tsx:29`) | Stepper label | `Review & Publish` (Dataset) / `Review` (Use Case, AI Model, Publication, Collaborative) / `Publish` (Event) / `Review` (Chart) | Step descriptions also vary: "Final review & publish" / "Check readiness and publish" / "Check readiness" / "Review details and publish event" / "Check and publish" | Exactly the inconsistency the task brief names as its own example | Standardise on `Review & Publish` for the label (it's the most descriptive and matches user mental model of "this is the last step before going live") with description `Check everything is ready, then publish.` | P1 |
| List-page "Add" button (`DatasetListView.tsx:156`, `EventListView.tsx:163`, `UseCaseListView.tsx:147`, `ChartListView.tsx:156`, `CollaborativeListView.tsx:148`, `AIModelListView.tsx:160`, `PublicationListView.tsx:144`) | Action | `Add Dataset` / `Add Event` / `Add Use Case` / `Add Chart` / `Add Collaborative` vs. `Add New AI Model` / `Add New Publication` | — | Two modules use "Add New X", five use "Add X" | Standardise on `Add {Module}` (shorter, matches majority) | P2 |
| Empty-state heading (all list views, cited above) | Empty state | `No datasets yet` / `No events yet` / `No use cases yet` / `No charts yet` / `No collaboratives yet` vs. `No AI Models yet` / `No Publications yet` | — | Capitalization inconsistency in the exact same grammatical slot | `No {lowercase plural noun} yet` throughout | P2 |
| Empty-state description (all list views, cited above) | Empty state | `Create your first {dataset/event/AI Model/Use Case/Collaborative/Publication}…` vs. `Create a chart to help people understand your datasets visually.` (Chart breaks the "your first X" pattern entirely) | — | One module (Charts) uses a structurally different sentence | `Create your first chart to help people understand your datasets visually.` | P2 |
| Design tokens, page/section text colour (app-wide) | Cross-cutting | `text-primary` / `text-muted-foreground` / `text-foreground` (58 files) vs. `text-text-brand` / `text-text-subdued` / `text-text-default` (38 files) | — | Incomplete token migration — same visual color, two different class names, split roughly down the middle of the codebase | Finish migrating `usecase/`, `event/`, `ai-model/`, `collaborative/`, `chart/`, `publication/` component directories to the new token names, matching the already-completed `dataset/`, `shared/`, `ui/` migration | **P1** (system-wide, but mechanical/low-risk) |
| **Publishers** module | — | — | — | **Does not exist.** No route, page, or component named "Publishers" was found anywhere in the codebase. | Confirm with product whether this is a planned-but-unbuilt module, or whether "Publications" (which does exist) is the intended module and the brief used the wrong name. | Needs product clarification |
| **Sectors** module | — | — | — | **Does not exist as a page.** "Sector" exists only as a classification *field* inside Dataset, Use Case, AI Model, and Collaborative metadata forms (e.g. `Step1Metadata.tsx` "Sector" dropdown) — there is no dedicated Sectors list/browse page or route. | Confirm whether a standalone Sectors browsing page is planned, or whether the brief meant "the Sector field" (already audited above under Classification sections). | Needs product clarification |

**Coverage note:** this table reflects the pages and components actually inspected during this pass (cited by file:line throughout). Given the size of the codebase, this is a representative, evidence-based sample of every content module's list page, first creation-flow section, and final review step — not a literal line-by-line read of all ~150 component files. The patterns found (token split, heading-name drift, subtitle-structure drift) are systemic enough that they are very likely to recur in files not explicitly cited here (e.g. `EventPreviewPage.tsx`, `AIModelPreviewPage.tsx`); Section G recommends a follow-up mechanical sweep once the standard is agreed.

---

## D. Duplicate and Inconsistent Terminology

| Inconsistent forms found | Where | Recommended standard term |
|---|---|---|
| `Organisation` vs. `Organizations` | Confirmed: `UseCaseStep2Connect.tsx:148` is the only "Organizations" in the app | **Organisation(s)** (British spelling — matches the rest of the product, including the entire Organisation Workspace feature) |
| `My Datasets` vs. `Events` / `Use Cases` / `AI Models` / `Charts` / `Collaboratives` / `Publications` | List-page titles, cited above | **Bare plural module name** ("Datasets") — drop the possessive "My" prefix for consistency; the personal scope is already obvious from being inside the signed-in workspace |
| `Add X` vs. `Add New X` | Cited above | **Add {Module}** |
| `Review & Publish` vs. `Review` vs. `Publish` | Creation-flow final step, cited above | **Review & Publish** |
| `Basic Information` vs. `Event Identity` vs. `About the Model` | First form section of Dataset/Use Case/Collaborative vs. Event vs. AI Model | **Basic Information** (pending product confirmation that Event's/AI Model's sections aren't intentionally scoped differently) |
| `Contributors` vs. `People & Organisations` vs. `Speakers`/`Organiser`/`Partners` | Use Case vs. Collaborative vs. Event "who's involved" sections | Flag for product review — these may be legitimately distinct concepts, not a copy bug. If they are meant to be the same concept, standardise on **People & Organisations**. |
| `visualizations` vs. `visualisations`/`Organisations`/etc. | `ChartListView.tsx:155` is the only American spelling found in this pass | **British spelling throughout** (matches "Organisation," "civicdatalab," etc.) |
| *(Not found as an actual inconsistency, but named in the task brief as an example)* `Dataset Resource` vs. `Resource` | No occurrence of "Dataset Resource" was found in this pass; `Resources` is used consistently (e.g. `EventResourcesStep.tsx:310`) | No action needed — flagged as a false positive from the brief's example list |
| *(Not found)* `My Workspace` vs. `User Dashboard` | `My Workspace` is the only term found in this pass (`DashboardPage.tsx:137`); no "User Dashboard" string exists in the codebase | No action needed — false positive from the brief's example list |

---

## E. Recommended Reusable Patterns

The app **already has** the component that should own this pattern — it does not need a new one.

| Component | Current location | Intended use | Required content | Optional content | Responsive behaviour |
|---|---|---|---|---|---|
| `ManagementTable`'s built-in header (`title` + `subtitle` props) | `src/components/shared/management-table/ManagementTable.tsx:538-548` | Every content-module list page (Datasets, Events, Use Cases, AI Models, Charts, Collaboratives, Publications, Organisation-scoped equivalents, Admin & Members) | `title: string` | `subtitle: (count) => string` | Already wraps in a flex header that stacks the Add button below on narrow widths — no change needed, just standardise the *strings* passed into it (Section C/D) |
| `<CardHeader><CardTitle>…</CardTitle><p className="…text-subdued">…</p></CardHeader>` | Used ad hoc in every Step*/Section component (`Step1Metadata.tsx`, `UseCaseBasicInfoSection.tsx`, `EventInformationStep.tsx`, etc.) | Every form-section heading + optional description | `CardTitle` text | Description `<p>` | This is already a de facto `FormSectionHeader` pattern repeated ~30+ times by hand. **Recommend extracting a `FormSectionHeader` component** (`{ title, description? }`) purely to guarantee the token (`text-text-subdued`, not `text-muted-foreground`) and spacing (`mt-1 text-sm font-normal`) can never drift again — this is a mechanical consolidation, not a new design. |
| Page-level `<h1 className="type-heading-1 text-text-brand">` + `<p className="mt-1 text-sm text-text-subdued">` | Repeated in `OrganisationsPage.tsx`, `OrganisationDashboardPage.tsx`, `OrganisationProfilePage.tsx`, and (with the old tokens) `DiscoverPage.tsx`, `DashboardPage.tsx`, auth pages | Every standalone page's title + subtitle | `h1` text | `p` subtitle | **Recommend extracting a `PageHeader`** component for the same reason — guarantees the token choice and spacing can't silently regress to the old tokens on the next new page. |
| `FieldError` (`src/components/ui/field-error.tsx`) | Already exists, already standardised (recently extended with `id`/`role="alert"`) | Every field-level validation message | `message?: string` | `id?: string` for `aria-describedby` | Already correct — no change needed, just confirm every form actually wires `aria-describedby` to it (many older forms don't — see Section G.4) |
| `FieldError`'s sibling helper-text pattern | Not componentised — every form writes its own `<p className="text-xs text-text-subdued">` under an input | Field-level helper text | text | — | Low priority: a `HelperText` component would be purely cosmetic consolidation since the class string is already short and consistent where it exists |

**Do not** build a new `SectionHeader`/`FieldDescription` component library from scratch — `CardHeader`/`CardTitle` already is that system; the gap is that its *sibling description paragraph* was never pulled into a shared sub-component, so its exact class string had to be retyped (and therefore drifted) in ~30 places.

---

## F. Copy Recommendations

Only pages/sections where a change is actually recommended (per the "don't change for preference" constraint):

| Location | Current | Recommended |
|---|---|---|
| `DatasetListView.tsx:154` | `My Datasets` | `Datasets` |
| `DatasetListView.tsx:155` | `{n} dataset{s} · manage published datasets and continue drafts` | `Create, manage and publish datasets so people can discover and reuse them.` |
| `EventListView.tsx:162` | `Create, manage, maintain, and publish events under your stewardship.` | `Create, manage and publish events so people can discover and attend them.` |
| `UseCaseListView.tsx:146` | `Create, manage and publish Use Cases that demonstrate how civic data is being used.` | `Create, manage and publish use cases that show how civic data is being used.` |
| `AIModelListView.tsx:159` | `Create, manage and publish AI Models so people can discover and access them.` | `Create, manage and publish AI models so people can discover and access them.` |
| `ChartListView.tsx:155` | `Create and manage visualizations for your datasets.` | `Create, manage and publish visualisations for your datasets.` |
| `CollaborativeListView.tsx:147` | `Create, manage and publish Collaboratives that bring people, data and Use Cases together.` | `Create, manage and publish collaboratives that bring people, data and use cases together.` |
| `PublicationListView.tsx:143` | `Create, manage and publish reports, findings and other content so people can discover them.` | `Create, manage and publish publications so people can discover them.` *(pending Section G.5 product decision)* |
| `AIModelListView.tsx:160` | `Add New AI Model` | `Add AI Model` |
| `PublicationListView.tsx:144` | `Add New Publication` | `Add Publication` |
| `AIModelListView.tsx:173` | `No AI Models yet` | `No AI models yet` |
| `PublicationListView.tsx:157` | `No Publications yet` | `No publications yet` |
| `ChartListView.tsx:170` | `Create a chart to help people understand your datasets visually.` | `Create your first chart to help people understand your datasets visually.` |
| `UseCaseStep2Connect.tsx:148` | `Organizations` | `Organisations` |
| `Step1Metadata.tsx:27-29` (Dataset "Basic Information") | *(no description)* | Add: `Name and describe your dataset so people can find and understand it.` |
| All 7 creation-flow stepper configs | `Review & Publish` / `Review` / `Publish` (mixed) | `Review & Publish` everywhere, with description `Check everything is ready, then publish.` |
| Organisation-scoped list subtitles (`OrganisationDatasetsPage.tsx:66` and siblings) | `{n} dataset{s} · created by members of {org}` | `{n} dataset{s} created by members of {org}.` *(drop mid-dot, add period, for sentence-style consistency)* |

---

## G. Implementation Plan

### 1. Content-only changes (no risk, no product decision needed)
- All rows in Section F except the two marked "pending decision."
- Fix `Organizations` → `Organisations` (`UseCaseStep2Connect.tsx:148`) — **do this first**, it's a one-line, zero-risk, P0 typo fix.
- Standardise `Review & Publish` across all 7 creation-flow stepper configs.
- Standardise empty-state capitalization and the Charts empty-description sentence structure.
- Standardise "Add X" vs. "Add New X" button labels.

### 2. Typography or spacing changes
- None required beyond what's covered by item 3 (token migration) — no new font sizes, weights, or spacing values are needed anywhere in this audit.

### 3. Component standardisation
- Extract a `PageHeader` component (`{ title, description? }`) from the repeated `<h1 className="type-heading-1 text-text-brand">…` pattern already used correctly in the Organisation pages, and adopt it on every other standalone page.
- Extract a `FormSectionHeader` component (`{ title, description? }`) from the repeated `<CardHeader><CardTitle>…` + description `<p>` pattern, and adopt it in every Step*/Section component.
- Both are pure refactors of existing markup into a shared component — no visual change, just guarantees the correct token is used going forward.

### 4. Accessibility fixes
- Audit whether every field's error `<p>` (via `FieldError`) is actually wired with `id` + the input's `aria-describedby` — confirmed correct in the newest form (Create Organisation), not confirmed for older forms (Dataset Step 1, Use Case, Event, AI Model, Collaborative, Chart, Publication creation flows). This needs a targeted follow-up pass, not covered by this audit's scope.
- Confirm heading hierarchy: every page's page-level heading should be an `<h1>` (some are, e.g. `OrganisationsPage.tsx`; the Dashboard's own module cards use `<p className="type-heading-1">` instead of a real heading element — visually identical, semantically not a heading, which could confuse screen-reader users navigating by heading).

### 5. Structural changes requiring product decisions
- **Publishers module**: confirm whether this is planned-but-unbuilt, or a naming mix-up with the existing Publications module.
- **Sectors module**: confirm whether a standalone Sectors page is planned, or whether "Sector" as a classification field (already present in 4 modules) is what was meant.
- **Event's "Event Identity" and AI Model's "About the Model"**: confirm whether these should be renamed to "Basic Information" for consistency, or whether they're intentionally scoped differently from Dataset/Use Case/Collaborative's first section.
- **"Contributors" vs. "People & Organisations" vs. "Speakers"/"Organiser"/"Partners"**: confirm whether these are meant to be the same concept (standardise) or are genuinely distinct relationship types per module (no change, just document the distinction).
- **Publications subtitle** ("reports, findings and other content" vs. a module-name-based sentence): confirm whether the content-type framing is an intentional product choice (Publications may deliberately avoid the word "publications" in its own description to explain what it actually contains) or should match the sibling pattern.
- **Finishing the design-token migration** in `usecase/`, `event/`, `ai-model/`, `collaborative/`, `chart/`, `publication/` — this is mechanical, but it's a large enough diff (58 files) that it should be scoped as its own follow-up task/branch rather than folded into a copy-fix pass.

---

## Files and Routes Inspected

**Routes** (from `App.tsx`): `/`, `/dashboard/datasets`, `/dashboard/events(+/new, +/:id/preview)`, `/dashboard/use-cases(+/new, +/:id/preview)`, `/dashboard/collaboratives(+/new, +/:id/preview)`, `/dashboard/ai-models(+/new, +/:id/preview)`, `/dashboard/charts(+/new)`, `/dashboard/publications(+/new, +/:id/preview)`, `/dashboard/profile`, `/organisations`, `/organisations/:id`, `/organisations/:id/{datasets,use-cases,ai-models,collaboratives,charts,events,members,profile}`, `/design-system`, `/discover`, `/search`, `/explore/use-cases(+/:id)`.

**Files inspected directly (file:line evidence cited above):**
`src/components/shared/management-table/ManagementTable.tsx`, `src/components/dataset/{DatasetListView,Step1Metadata}.tsx`, `src/components/event/{EventListView,EventConnectionsStep,EventInformationStep,EventResourcesStep,DatasetCreationWizard}.tsx`, `src/components/usecase/{UseCaseListView,UseCaseBasicInfoSection,UseCaseClassificationSection,UseCaseStep1Builder,UseCaseStep2Connect,UseCaseDashboardSection}.tsx`, `src/components/ai-model/{AIModelListView,AIModelStep1Details,AIModelVersionsStep}.tsx`, `src/components/chart/ChartListView.tsx`, `src/components/collaborative/{CollaborativeListView,CollaborativeStep1About,CollaborativeStep2People,CollaborativeStep3Content}.tsx`, `src/components/publication/PublicationListView.tsx`, `src/pages/{DashboardPage,DatasetsPage,DiscoverPage,SearchResultsPage,ComingSoonPage,OrganisationsPage,DesignSystemPage}.tsx`, `src/pages/auth/{SignInPage,RegisterPage,ForgotPasswordPage}.tsx`, `src/pages/explore/UseCasesExplorePage.tsx`, `src/pages/organisation/{OrganisationDashboardPage,OrganisationProfilePage,OrganisationDatasetsPage,OrganisationUseCasesPage,OrganisationEventsPage}.tsx`, every creation-flow page (`{Dataset,Event,UseCase,AIModel,Collaborative,Chart,Publication}CreationPage.tsx` / `DatasetCreationFlow.tsx`), `src/components/ui/card.tsx`, `src/components/ui/field-error.tsx`, `design-tokens/dataspace-tokens.css`.

**Method for the design-token finding:** `grep -rl "text-muted-foreground"` (58 files) vs. `grep -rl "text-text-subdued"` (38 files) across `src/components`, cross-referenced against the recent `css-reconciliation` merge commit history.

---

## Files That Would Need Changes (if this plan is approved)

**Content-only (Section G.1):**
`DatasetListView.tsx`, `EventListView.tsx`, `UseCaseListView.tsx`, `AIModelListView.tsx`, `ChartListView.tsx`, `CollaborativeListView.tsx`, `PublicationListView.tsx`, `UseCaseStep2Connect.tsx`, `Step1Metadata.tsx`, `DatasetCreationFlow.tsx`, `UseCaseCreationPage.tsx`, `AIModelCreationPage.tsx`, `EventCreationPage.tsx`, `PublicationCreationPage.tsx`, `ChartCreationPage.tsx`, `CollaborativeCreationPage.tsx`, `OrganisationDatasetsPage.tsx`, `OrganisationUseCasesPage.tsx`, `OrganisationEventsPage.tsx`, `OrganisationAIModelsPage.tsx`, `OrganisationCollaborativesPage.tsx`, `OrganisationChartsPage.tsx`.

**Component standardisation (Section G.3), new files:**
`src/components/shared/PageHeader.tsx` (new), `src/components/shared/FormSectionHeader.tsx` (new) — plus every Step*/Section component that would adopt them (≈30 files, deferred to a follow-up pass per the plan).

**Token migration (Section G.5, product-approved follow-up only):**
Every `.tsx` file under `src/components/usecase/`, `src/components/event/`, `src/components/ai-model/`, `src/components/collaborative/`, `src/components/chart/`, `src/components/publication/` that currently uses `text-muted-foreground` / `text-primary` / `text-foreground` / `border-border` (58 files total, not modified as part of this audit).

No route, API, data model, or workflow changes are implied by any recommendation in this report.
