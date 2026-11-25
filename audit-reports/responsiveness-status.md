# Responsiveness status — CivicDataSpace prototype

Date: 2026-11-25 · Branch: `feat/notification-playground` (uncommitted work included) · Method: automated sweep, Chromium (headless) against the Vite dev server.

## Summary

The prototype is **broadly responsive**. Across 52 routes and 6 viewport widths (312 page loads) there were **no crashes, no page errors and no "not found" pages**. Real layout defects are few and small: the Admin & Members tab row is cut off on phones, and the "Add" button overflows by 8px on a 320px phone on the dashboard list pages. Remaining risk is mostly **untested surface** (see Coverage gaps), not known breakage.

| Viewport | Device class | Routes | Pages with horizontal overflow | Real defects |
|---|---|---|---|---|
| 320 × 568 | small phone | 52 | 9 | 2 (dashboard lists +8px, members tabs +89px); `/discover` is an animation artefact |
| 375 × 812 | phone | 52 | 2 | 1 (members tabs +34px); `/discover` artefact |
| 768 × 1024 | tablet portrait | 52 | 1 | none (`/discover` artefact) |
| 1024 × 768 | small laptop / tablet landscape | 52 | 1 | none (`/discover` artefact) |
| 1280 × 800 | laptop | 52 | 1 | none (`/discover` artefact) |
| 1536 × 900 | desktop | 52 | 1 | none (`/discover` artefact) |

## How responsiveness is built

- Viewport meta present; Tailwind default breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280; no `2xl` use).
- Breakpoint classes used in 111 of 307 TSX files: `sm:` 319, `md:` 87, `lg:` 430, `xl:` 40. Design leans **mobile-first with `lg` as the main layout switch** (sidebar/columns appear at 1024).
- JS-driven responsiveness (`useMediaQuery`/`matchMedia`) in Discover, Search results, Notifications, Community and profile parts.
- Page content is capped at `max-w-[1400px]` (main shell `max-w-[1760px]`), so wide screens stay readable.
- Wide data tables use `min-w-[720px]` inside scroll containers (file preview, resource preview) — intentional horizontal scroll.
- The design system has a Responsive Behaviour section and playground (`src/pages/design-system/ResponsiveBehaviourSection.tsx`).

## Findings

1. **Admin & Members tab row clipped on phones** — `/organisations/org-workspace-1/members`. At 375px the last tab overflows by 34px, at 320px by 89px (All / Admin / Editor / Evaluator with counts do not fit and the row does not scroll). Shared `ManagementTable` status-tab row; likely affects any table with several tabs (check Datasets/Use Cases pages at 320). **Severity: medium.**
2. **Header action button overflows 8px at 320px** — `/dashboard/{datasets,use-cases,events,charts,collaboratives}`, `/organisations/…/{datasets,ai-models}`. The title/action row (`flex items-center gap-3`) pushes the button to 328px on a 320px screen. Only the smallest phones. **Severity: low.**
3. **`/discover` reports 312–834px "overflow" at every width — not a real defect.** The page clips horizontal overflow on `<html>`, and the measured card was an entrance animation still sliding in when measured. Worth a manual look on a slow device, but no visible breakage found.
4. **Small touch targets.** Elements under 24px (interactive links/buttons/inputs): ~460 per sweep on phones (e.g. dataset detail ≈ 35–37 elements, dashboard list pages 17–19). Counts are unfiltered (include dense table icons, tabs, chips) so treat as a lead, not a verdict. **Severity: medium for touch devices;** needs triage against the 44px (WCAG target-size) guidance in `ui` skills.

## Coverage

Tested (all 6 viewports): home, about, contact, discover, search, explore lists and details (dataset, AI model, publication, event, collaborative, organisation), community, forum, publishers, documentation, design system, auth pages, notifications, dashboard and all dashboard lists, "new" forms (AI model, use case, publication, event, chart, collaborative), organisation overview/members/datasets/profile/AI models, playground hub.

## Coverage gaps (not tested — status unknown)

- **Interactive states**: right-hand drawers (Edit Member, Invitation Details, Add Member), dialogs, dropdown/menus, date pickers and the mobile navigation menu were not opened at small widths.
- **Use case detail** page: no link was found from the list in the sweep, so it was not loaded. Also not covered: publisher detail, preview routes (`/dashboard/*/preview`), collaborative items, playground sub-pages.
- **Browsers/devices**: Chromium only. No Safari/iOS (notably `100dvh`, sticky elements, input zoom), Firefox, or real devices.
- **Orientation, zoom and text scaling**: phone landscape, 200% zoom and large system fonts not tested.
- **Visual quality**: the sweep detects horizontal overflow and small targets, not cramped layouts, truncated text, or awkward wrapping. Screenshots were not reviewed per page.

## Suggested next steps

1. Make the `ManagementTable` tab row scroll horizontally (or wrap) on narrow screens — fixes finding 1.
2. Let the title/action row shrink or wrap below 360px — fixes finding 2.
3. Manually/automatically open every drawer and the mobile nav at 320/375/768 and extend the sweep.
4. Triage the small-target list and enlarge hit areas on touch breakpoints.
5. Run the same sweep in WebKit (iOS Safari) before treating the status as complete.

## Update — fixes and re-test (2026-11-25)

- **Finding 1 fixed:** the `ManagementTable` status/role tab row now scrolls horizontally and its tabs no longer shrink or wrap (`ManagementTable.tsx`).
- **Finding 2 fixed:** the overflow was the table's pagination footer, not a header button. Below 640px the "Showing 1–10 of N" text is hidden and Previous / Page x of y / Next spread across the full width.
- **Gaps closed (320, 375, 768):** Edit Member, Invitation Details (Sana Khan, Dev Malhotra) and Add Member drawers fit the screen with all buttons visible; the mobile navigation menu opens without overflow; use-case detail, publisher detail, dashboard preview routes and collaborative items have no overflow; the Evaluator tab is reachable on the members page.
- Re-test: 66 of 66 checks pass; type-check clean.
- Still open: touch-target triage (finding 4), Safari/WebKit and real devices, landscape and zoom.
