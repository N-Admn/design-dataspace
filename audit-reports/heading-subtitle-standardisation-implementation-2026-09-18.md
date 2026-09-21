# Page Title, Subtitle & Modal Content Standardisation — Implementation Summary

**Date:** 2026-09-18
**Builds on:** [`heading-subtitle-consistency-audit-2026-09-18.md`](heading-subtitle-consistency-audit-2026-09-18.md) (the read-only audit that identified these inconsistencies).
**Scope:** Content-only and component-consolidation changes. No routes, APIs, data models, or workflows were changed.

---

## 1. Components created

| Component | File | Purpose |
|---|---|---|
| `PageHeader` | `src/components/shared/PageHeader.tsx` | Standard `<h1>` + optional one-sentence description + optional trailing action, for standalone pages not already headed by `ManagementTable`. |
| `SectionHeader` | `src/components/shared/SectionHeader.tsx` | Standard section heading (`h2` or `h3`) + optional description — used for the new "Review & Publish" heading atop every creation flow's review step. |

**Reused, not duplicated:** `ManagementTable`'s built-in `title`/`subtitle` header (unchanged component, only the strings passed to it were standardised) and `CollapsibleFormSection` (existing, from the Create Organisation form work). One genuine duplicate was found and removed: `FormSectionHeader` (in `src/components/organisation/FormSection.tsx`) was functionally identical to the new `SectionHeader` — it was deleted and its one call site now uses `SectionHeader` directly.

---

## 2. Pages updated

### List pages (title/subtitle/add-label/empty-state, via `ManagementTable` props)
`DatasetListView.tsx`, `EventListView.tsx`, `UseCaseListView.tsx`, `AIModelListView.tsx`, `ChartListView.tsx`, `CollaborativeListView.tsx`, `PublicationListView.tsx`.

### Pages adopting the new `PageHeader` component
`OrganisationsPage.tsx`, `src/pages/organisation/OrganisationDashboardPage.tsx`, `src/pages/organisation/OrganisationProfilePage.tsx`.

### Creation-flow section headings renamed/standardised
`src/components/dataset/Step1Metadata.tsx` (Basic Information — added description; Classification — added description), `src/components/event/EventInformationStep.tsx` (**Event Identity → Basic Information**), `src/components/ai-model/AIModelStep1Details.tsx` (**About the Model → Basic Information**; Classification description standardised), `src/components/collaborative/CollaborativeStep1About.tsx` (Basic Information + Classification descriptions standardised), `src/components/usecase/UseCaseBasicInfoSection.tsx`, `src/components/usecase/UseCaseClassificationSection.tsx`, `src/components/usecase/UseCaseStep1Builder.tsx` (**Build Your Content → Content**), `src/components/usecase/UseCaseStep2Connect.tsx` (**Organizations → Organisations** — see §4), `src/components/usecase/UseCaseDashboardSection.tsx`, `src/components/event/EventResourcesStep.tsx`.

### Review & Publish step (heading added + stepper label standardised, all 7 flows)
`src/components/dataset/Step3Review.tsx` + `DatasetCreationFlow.tsx`, `src/components/usecase/UseCaseStep3Review.tsx` + `UseCaseCreationPage.tsx`, `src/components/ai-model/AIModelStep3Review.tsx` + `AIModelCreationPage.tsx`, `src/components/event/EventPublishReview.tsx` + `EventCreationPage.tsx`, `src/components/collaborative/CollaborativeStep4Review.tsx` + `CollaborativeCreationPage.tsx`, `src/components/chart/ChartStep3Review.tsx` + `ChartCreationPage.tsx`, `src/components/publication/PublicationStep3Review.tsx` + `PublicationCreationPage.tsx`.

---

## 3. Modals/dialogs updated

| Dialog | File(s) | Change |
|---|---|---|
| Delete confirmations (7 individual + 6 organisation-scoped pages) | `{Datasets,Events,UseCases,AIModels,Collaboratives,Charts,Publications}Page.tsx`, `src/pages/organisation/Organisation{Datasets,Events,UseCases,AIModels,Collaboratives,Charts}Page.tsx` | Title standardised to `Delete {Object}` (was a mix of `Delete dataset?` / `Delete AI Model?` etc. — inconsistent capitalization and question-mark usage). Descriptions were already consistent; one outlier (Charts) aligned to match its siblings. |
| Remove Member | `OrganisationMembersPage.tsx` | Title `Remove member?` → `Remove Member`; description reworded to match the spec's exact phrasing. |
| Edit Member | `EditMemberRoleSideSheet.tsx` | Title `Edit Member Role` → `Edit Member`; description reworded to the spec's exact copy. |
| Add Member | `AddMemberSideSheet.tsx` | Description reworded to the spec's exact copy ("Invite a person… and assign the access they need."). Title was already correct. |
| Discard Changes | `CreateOrganisationSideSheet.tsx` | Title `Discard organisation details?` → `Discard Changes?`; description replaced with the spec's exact copy. |
| Create Organisation | `CreateOrganisationSideSheet.tsx` | Title/description already matched the spec exactly — no change needed. Form **restructured** from 4 sections to the spec's 3: **Organisation identity** (logo + name + type, merged, logo first), **Organisation details** (description/homepage/email/location, collapsed), **Social profiles** (collapsed). |

---

## 4. Copy changes (terminology fixes)

- **Fixed the "Organizations" spelling bug** (P0 from the audit): `UseCaseStep2Connect.tsx` — both the section heading and its description now use "Organisations"/"organisations" (was the only American-spelling instance in the codebase).
- **Add-button labels standardised** to `Create {Object}` across all 7 individual list pages (was a mix of `Add X` / `Add New X`).
- **Empty-state capitalization standardised** to lowercase noun (`No AI models yet`, `No publications yet` — were capitalized inconsistently with their siblings).
- **List-page subtitles replaced** with the exact copy specified in this task (Section 4), superseding the previous audit's own recommendations where the two differed.

---

## 5. Files changed (full list)

**New:**
`src/components/shared/PageHeader.tsx`, `src/components/shared/SectionHeader.tsx`

**Modified — list pages:** `DatasetListView.tsx`, `EventListView.tsx`, `UseCaseListView.tsx`, `AIModelListView.tsx`, `ChartListView.tsx`, `CollaborativeListView.tsx`, `PublicationListView.tsx`

**Modified — delete/confirm copy:** `DatasetsPage.tsx`, `EventsPage.tsx`, `UseCasesPage.tsx`, `AIModelsPage.tsx`, `CollaborativesPage.tsx`, `ChartsPage.tsx`, `PublicationsPage.tsx`, `organisation/OrganisationDatasetsPage.tsx`, `organisation/OrganisationEventsPage.tsx`, `organisation/OrganisationUseCasesPage.tsx`, `organisation/OrganisationAIModelsPage.tsx`, `organisation/OrganisationCollaborativesPage.tsx`, `organisation/OrganisationChartsPage.tsx`, `organisation/OrganisationMembersPage.tsx`

**Modified — organisation dialogs/form:** `CreateOrganisationSideSheet.tsx`, `EditMemberRoleSideSheet.tsx`, `AddMemberSideSheet.tsx`, `organisation/FormSection.tsx` (removed duplicate `FormSectionHeader`)

**Modified — organisation pages (PageHeader adoption):** `OrganisationsPage.tsx`, `organisation/OrganisationDashboardPage.tsx`, `organisation/OrganisationProfilePage.tsx`

**Modified — section headings/descriptions:** `dataset/Step1Metadata.tsx`, `event/EventInformationStep.tsx`, `event/EventResourcesStep.tsx`, `ai-model/AIModelStep1Details.tsx`, `collaborative/CollaborativeStep1About.tsx`, `usecase/UseCaseBasicInfoSection.tsx`, `usecase/UseCaseClassificationSection.tsx`, `usecase/UseCaseStep1Builder.tsx`, `usecase/UseCaseStep2Connect.tsx`, `usecase/UseCaseDashboardSection.tsx`

**Modified — Review & Publish (heading + stepper label):** `dataset/Step3Review.tsx`, `dataset/DatasetCreationFlow.tsx`, `usecase/UseCaseStep3Review.tsx`, `UseCaseCreationPage.tsx`, `ai-model/AIModelStep3Review.tsx`, `AIModelCreationPage.tsx`, `event/EventPublishReview.tsx`, `EventCreationPage.tsx`, `collaborative/CollaborativeStep4Review.tsx`, `CollaborativeCreationPage.tsx`, `chart/ChartStep3Review.tsx`, `ChartCreationPage.tsx`, `publication/PublicationStep3Review.tsx`, `PublicationCreationPage.tsx`

No files from prior sessions' Organisation Workspace / Prompt Dataset work were touched beyond the specific copy edits listed above; no route, type, or API signature changed.

---

## 6. Validation results

| Check | Result |
|---|---|
| `npx tsc -b` (typecheck) | ✅ Pass, 0 errors |
| `npm run lint` (oxlint) | ✅ Pass, 0 findings |
| `npm run build` | ✅ Pass |
| Test suite | No test runner is configured in this repo (`package.json` has no `test` script) — not applicable |
| Scripted browser verification | 13/13 targeted checks pass (list-page copy, delete-dialog title, Review & Publish heading + stepper label, Create Organisation 3-section structure, logo-before-name ordering, no-asterisk-on-optional-fields) |
| Full-platform route regression sweep | 33/33 routes load with zero console/page errors |

---

## 7. Remaining inconsistencies (deliberately not changed — documented per the task's own instruction)

1. **"Publishers" module does not exist.** The task's standard list names `Publishers` as a page ("Explore organisations and contributors publishing civic data") — but the only existing module is **Publications** (a content-creation flow for reports/findings, structurally identical to Datasets/Charts). These are different concepts, not a naming variant of the same thing. Renaming "Publications" to "Publishers" would misrepresent what the module actually does. **Left as "Publications"** — flagging for a product decision on whether "Publishers" is a planned, separate, not-yet-built module (a directory of contributing organisations) or a naming correction that should apply to the existing Publications module.
2. **Publications' list-page subtitle** was left as "Create, manage and publish reports, findings and other content so people can discover them." rather than a Datasets-style "Discover, create and manage publications…" sentence, since the task gave no equivalent example for the actual "Publications" module (only for the non-existent "Publishers"). This is a judgement call, not a hard rule — happy to align it if a product decision resolves point 1.
3. **"My Workspace" has no standalone page.** It exists only as a card label on the Dashboard (`DashboardPage.tsx`) and as a breadcrumb segment — there is no dedicated `/my-workspace` route to apply a `PageHeader` to. No change made; flagging in case a dedicated workspace-landing page is planned.
4. **"Contributors" (Use Case) vs. "People & Organisations" (Collaborative) vs. "Speakers"/"Organiser"/"Partners" (Event)** were left as separate, distinctly-named sections. These may represent genuinely different relationship types per module (a contributor is not necessarily a speaker or a partner) rather than the same concept spelled three ways — this needs a product decision, not a unilateral content rename, so it was left untouched.
5. **Section descriptions using generic "this content" phrasing** (per the task's own worked examples for Classification/Contributors/Organisations/Resources/Embedded Dashboard) were applied verbatim in the sections that already carried that exact heading name. Two of the task's own example descriptions were **adapted rather than pasted verbatim** where they would have been factually wrong for the actual fields present: Dataset's and Event's "Basic Information" sections have no image field, so their description reads "Name and describe this content…" instead of the example's "…with a title, summary and image."
6. **The wider design-token migration** (old `text-muted-foreground`/`text-primary` vs. new `text-text-subdued`/`text-text-brand`, affecting ~58 files) identified in the prior audit was **not** addressed here — this task's scope was content hierarchy, and finishing that migration is a larger, separate, mechanical change already flagged as its own follow-up item in the earlier audit.
7. **`DesignSystemPage.tsx`'s internal demo copy** (`Delete this dataset?`) was left unchanged — it's an internal component showcase, not user-facing product content.
8. **Event's "Add Resource" drawer description** ("Create a new resource and connect it to this event.") was **not** replaced with the task's example copy ("Add a file, API or external link to this dataset.") because that example text is dataset-specific and would be factually inaccurate here — this drawer lets the user choose between a dataset or a publication resource type, not add a file/API/link directly.

---

## 8. Assumptions made

- Where the new task's exact copy differed from the prior audit's own recommendation for the same string (e.g. list-page subtitles), **this task's copy was treated as authoritative** since it was given explicitly and directly.
- "Review & Publish" was applied as both the stepper label (short) and the review step's own in-page heading (with the full description) — the task's example copy reads like a heading+description pair, and no review step previously had its own page-level heading at all, so this was a pure addition, not a structural change.
- The Create Organisation form's mandatory-field asterisk convention (`*` on Organisation name/type only, plus the required Organisation logo) was already correctly implemented from prior work and required no changes beyond the section regrouping.
