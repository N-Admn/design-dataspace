# CivicDataSpace — Low-Structural-Impact UX Continuity Pass

**Date:** 2026-09-30
**Scope:** A UX consistency and continuity pass across the Consumer and Contributor experiences, per the fix brief that followed [`ia-navigation-audit-2026-09-30.md`](./ia-navigation-audit-2026-09-30.md). No IA redesign, no new navigation architecture, no new pages, no auth architecture — only fixes achievable within the existing routes, components, and layouts.
**Verification:** `npx tsc -b`, `npm run lint`, and `npm run build` all pass cleanly after every change. Key flows (Datasets listing, Chart deep-link, Collaborative related-content links) were additionally verified via Playwright screenshots.

---

## Changed

### Consumer-side

1. **Chart's "View on Dataset" now actually goes to the live public page.** It previously reopened the contributor's own Dataset editor (`/dashboard/datasets`). It now navigates to `/explore/datasets/:id?view=visualisations` — the dataset's real public page, deep-linked straight to the Visualisations tab where the chart actually appears. Verified: the chart renders correctly at that URL. (`ChartCreationPage.tsx`, `ChartPublishSuccessModal.tsx`, `DatasetDetailPage.tsx`)
2. **Collaborative's "Related datasets" / "Related use cases" lists are now real links.** They previously rendered a `"View →"` label as plain, non-interactive text. Each now links to the item's actual public page (`/explore/datasets/:id`, `/explore/use-cases/:id`) using data that was already being collected but never wired to navigation. Verified via Playwright. (`CollaborativePreview.tsx`)
3. **Dataset Detail and Event Detail no longer fall back to dead "Coming Soon" pages on back-navigation.** Both used `useGoBack` with a fallback to their own unbuilt Explore listing (`/explore/datasets`, `/explore/events`). Both now fall back to `/search?type=X`, matching the pattern Use Case Detail already used correctly. (`DatasetDetailPage.tsx`, `EventDetailPage.tsx`)
4. **Dataset Detail supports a `?view=` deep link** (`overview` / `data` / `visualisations`) so other parts of the app (and future links) can point straight at a specific tab instead of always landing on Overview. This is what makes fix #1 possible.

### Contributor-side

5. **"View X" after publishing now means what it says, wherever a real public page exists.** For Use Case and Event (the two other content types with a genuine `/explore/:id` page), the post-publish "View Use Case"/"View Event" button previously just scrolled the same preview tab back to the top — it never actually showed the live page. Both now navigate that same tab to the real public URL and are relabeled **"View live"**. For Dataset, the publish-success modal gained a new, explicit **"View live"** action (opens the real public page in a new tab) alongside the existing "Back to My Workspace" (renamed from "View in My Workspace" for consistency) and "Create Another Dataset". (`UseCasePreviewPage.tsx`, `EventPreviewPage.tsx`, `PublishSuccessModal.tsx`, `DatasetCreationFlow.tsx`)
6. **"View X" no longer overclaims for content types with no public page.** Collaborative, AI Model, and Publication have no standalone public route (confirmed in the audit). Their post-publish "View Collaborative"/"View AI Model"/"View Publication" buttons — which only ever scrolled the same preview tab — are now honestly labeled **"Preview"**, so they don't imply a live public page that doesn't exist. (`CollaborativePreviewPage.tsx`, `AIModelPreviewPage.tsx`, `PublicationPreviewPage.tsx`)
7. **"View live" added to the three listings that have a real public page.** Datasets, Use Cases, and Events now show a **"View live"** row action (external-link icon, opens the public page in a new tab) for published items only — drafts correctly don't get it. (`DatasetListView.tsx`, `UseCaseListView.tsx`, `EventListView.tsx`)
8. **Unified the "back to editor" label.** Event and Use Case said "Edit in Workspace"; Collaborative, AI Model, and Publication said "← Back to Editor" for the identical action. All five now say **"Edit in Workspace"**. (`CollaborativePreviewPage.tsx`, `AIModelPreviewPage.tsx`, `PublicationPreviewPage.tsx` — Event/Use Case were already correct)
9. **Unified the "return to listing" label** where it was needlessly different for no reason: Use Case's "Continue to Manage" → **"Back to Use Cases"**; Event's "Continue to Manage" → **"Back to Events"**; Collaborative's "Back to Dashboard" → **"Back to Collaboratives"** (matches its actual destination, `/dashboard/collaboratives`, instead of the more generic "Dashboard").
10. **"Dashboard" → "My Workspace" wherever the label refers to the contributor's personal content-management area** (not the `/` page's own on-page content, which is untouched): the sidebar's back-link (was "Dashboard", now "My Workspace"), the TopNav account menu's link (same change), and the breadcrumb's leading crumb for personal-workspace pages, which now reads **`Home › My Workspace › {item}`** instead of the redundant **`Home › Dashboard › My Workspace › {item}`**. Organisation Workspace breadcrumbs (`Home › Dashboard › My Organisations › {org}`) were deliberately left untouched, per the brief's instruction to preserve the existing organisation hierarchy. Verified via Playwright screenshot. (`ContributorSidebar.tsx`, `TopNav.tsx`, `BreadcrumbBar.tsx`)

---

## Not changed (left untouched — requires a structural/IA/auth decision)

These map directly to gaps identified in the prior audit that this brief explicitly said not to solve by inventing pages or auth architecture:

1. **Collaborative and AI Model still have no real public page**, and their "preview" page is still reachable by anyone with the link, with no publish-status gate (a draft is exactly as visible as a published record) and a live "Publish" button shown to every visitor regardless of who they are. Fixing the *label* (done, item 6 above) doesn't fix the *access model* — that requires either building the missing public pages or building an ownership/auth check, both explicitly out of scope for this pass. **This is the single highest-impact item to pick up next.**
2. **Publications (the standalone `/dashboard/publications` module) still have no consumer surface at all** — not even via Search, since only Event-nested publications are indexed. No fix within this scope changes that; "Preview" (item 6) is the honest label for what already exists.
3. **No route guard / real authentication exists**, and this pass did not add one. The "Log In / Sign Up" button in the TopNav still just flips local component state (`isLoggedIn`) rather than going through the real `/auth/sign-in` page — left exactly as-is. Rewiring it to genuinely navigate to Sign In would, without a shared session mechanism connecting SignIn's mock "success" back to the TopNav's display state, make the demo *harder* to use (you'd fill out a sign-in form and land back on a nav bar still showing "Log In / Sign Up"), and building that shared mechanism starts to look like auth architecture — explicitly out of scope. **Flagging per the brief's own instruction** rather than half-fixing it.
4. **No ownership/edit-access signal exists anywhere**, so no "Edit"/"Manage" affordance was added to any consumer-facing public page. The brief explicitly said to only show such an action "when the user has appropriate contributor access" — since the app cannot currently determine that for any visitor, adding it unconditionally would have made the Collaborative/AI Model exposure problem (item 1) worse, not better, so it was deliberately left out.
5. **Dataset Detail still has no outbound related-content section at all** (not merely non-clickable — the data relationship doesn't exist in the implementation). The brief said to fix relationships "where a relationship already exists" and not introduce new relationship types — since there's nothing existing to wire up here, this was left untouched.
6. **The "hasUnpublishedEdits" (published-but-drifted) state still has no listing-table representation** (no badge/column in any `*ListView`) — it only surfaces in the Dashboard's "Continue working" queue and in each creation flow's own header badge (which already clearly shows "Unsaved changes" — verified already correct, no fix needed there). Adding a listing-table column was judged a layout change beyond a label/wiring fix and left for a future pass.
7. **Search result destinations for Collaborative and AI Model** still point at the contributor preview route (no alternative exists without building a new page or removing the content type from Search results entirely — both out of scope).

---

## Routes affected

No route paths changed. Behavior/label changes only, on:

- `/explore/datasets/:id` — new `?view=` query param support; `useGoBack` fallback changed
- `/explore/events/:id` — `useGoBack` fallback changed
- `/dashboard/use-cases/:id/preview` — post-publish action relabeled and rewired
- `/dashboard/events/:id/preview` — post-publish action relabeled and rewired
- `/dashboard/collaboratives/:id/preview` — action labels unified
- `/dashboard/ai-models/:id/preview` — action labels unified
- `/dashboard/publications/:id/preview` — action labels unified
- `/dashboard/charts/new` (publish success) — destination fixed to the real public page
- `/dashboard/datasets`, `/dashboard/use-cases`, `/dashboard/events` (listings) — new row action
- Breadcrumb/sidebar/TopNav labels — no route changes, label-only

---

## Consumer → Contributor

No changes made in this direction this pass — see "Not changed" item 4. The brief's acceptance criterion ("a user with appropriate access can move from public content to its editor") could not be satisfied without either inventing an access-check mechanism or exposing edit controls to everyone; both were judged worse than the current state (nothing shown) and left for the structural follow-up.

## Contributor → Consumer

This is where nearly all of this pass's work landed, matching the brief's own "most important fix" framing:

- Dataset, Use Case, and Event: publish → **View live** now genuinely opens the real public page (items 1, 5, 7).
- Chart: publish → **View live** now opens the actual public page (its parent dataset's Visualisations tab), not the contributor's own editor (item 1).
- Collaborative, AI Model, Publication: publish → **Preview** now honestly describes what's shown, instead of implying a live page that doesn't exist (item 6).
- Every workspace listing for a type with a real public page now offers **View live** directly from the row, without needing to publish again or hunt for the URL (item 7).

---

## Remaining structural issues (for a future IA/navigation phase)

In priority order, carried over from the prior audit and confirmed still open after this pass:

1. **Decide whether Collaborative, AI Model, and Publication get real public pages**, or whether their contributor-preview-doubling-as-public-page pattern is intentional and instead needs an actual publish-status gate + ownership check retrofitted.
2. **Design a real authentication/session mechanism** if login is meant to gate anything — today it gates nothing, and the TopNav's mock toggle is disconnected from the real `/auth/*` pages.
3. **Decide the intended relationship between "Search result" and "consumer destination"** for Collaborative/AI Model specifically — Search cannot be fixed to "avoid exposing contributor routes" without one of #1 or a Search-specific carve-out for these two types.
4. **Consider a listing-table indicator for "published with unsaved edits"** — currently invisible outside the Dashboard's Continue Working queue and each item's own creation-flow header.
5. **Consider whether Dataset Detail should get an outbound related-content section**, matching Use Case's and Event's pattern, if that relationship is meant to exist for Datasets too.

*This report reflects the state of the codebase immediately after this UX pass, on 2026-09-30. All changes described above were verified to typecheck, lint, and build cleanly, and the highest-risk flows were spot-checked visually.*
