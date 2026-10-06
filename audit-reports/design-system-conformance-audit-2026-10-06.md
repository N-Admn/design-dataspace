# CivicDataSpace — Design-system conformance audit (2026-10-06)

Audit only. No repository file was changed. Baseline: `design-system.md` / `tokens.json` (generated, source of truth).

**Method.** (1) Read `design-system.md` in full. (2) Static census of `src/` (196 TSX files): type roles vs raw utilities, colour namespaces, literals, radius, shadow, spacing, focus/hover/disabled/selected patterns, hand-rolled vs shared components. (3) Runtime pass with Playwright over 34 routes x 4 viewports (1440/1024/768/390 = 136 renders): document overflow, computed font sizes/weights/roles of every heading, text below 12px, font families, radii. (4) Screenshots of 4 representative screens.
**Limits.** Creation flows were rendered at step 1 only. Hover/active/disabled/focus were audited statically (class patterns), not by driving every state. Mock data only (no real loading/error paths). `audit-reports/typography-system-reference.md` pre-dates the `.type-*` roles and is stale; it was not used as a baseline.
Excluded from scoring: `DesignSystemPage`, `/playground/*` (experimental), and the recent uncommitted Dataset Details header work, except where called out as such.

## 1. Overall summary
The system is **well applied at the token level and unevenly applied at the pattern level.**
- Colour is the strongest area: no raw hex/rgb outside the SDG palette and the Google logo; no raw Tailwind palette colours; one font family (Inter); radius and shadow are almost entirely on-scale.
- Headings mostly resolve to `.type-*` roles (≈120 uses), but body/label/caption are mostly bypassed with raw `text-sm`/`text-xs` (437 / 288 uses vs 40 / 53 role uses), which yields different line-heights for visually identical text.
- The biggest real defects are responsive: the Stepper and the Dashboard module list overflow the page at 390px (and Event/Collaborative steppers at 768px), and a constant `px-10` page gutter squeezes mobile content.
- The biggest consistency gaps are repeated patterns built by hand instead of shared: inline alerts (≥10), input-like picker triggers (6), pills/chips (≥8), review-step cards (≥5), inline empty states (≥6).
- Typography needs **no new heading size**. Two non-heading roles are genuinely recurring (a 16px "lead" and a 12px uppercase "overline"); see §8.

## 2. Category compliance
| Category | Rating | Basis |
|---|---|---|
| Typography | Partial | Roles used for headings; raw size utilities for body/caption; 3 page-title levels; 5 sites <12px; 1 weight-700 override |
| Colour | Strong | No literals/palette colours; two alias namespaces mixed (same values); hand-rolled alert tints vary |
| Spacing | Partial | Mostly Tailwind scale; no responsive gutter; 5 container widths; header 32px vs content 40px edge |
| Components | Partial | Shared primitives well used (Button 229, Dialog 26, Badge 91, Card 78); many parallel hand-rolled patterns |
| Radius / shadow | Strong | One inverted-scale hazard (`rounded-2xl` = 16px < `rounded-xl` = 18px); sparse shadows |
| Interaction states | Partial | Focus/disabled mostly shared; hover and selected treatments vary; DS defines no "selected" |
| Layout | Partial | Consistent shell; content-width scale undefined |
| Responsive | Weak | 6 routes overflow at 390, 2 at 768; 0 at 1440/1024 |
| Cross-screen | Partial | See §4 |

## 3. Detailed findings
Types: A violation · B drift · C missing shared pattern · D DS gap · E intentional exception. Severity H/M/L.

| ID | Screen | Element | DS rule | Prototype | Type | Sev | Recommendation |
|---|---|---|---|---|---|---|---|
| R1 | Dashboard (390) | "My Workspace" module list `p.whitespace-nowrap` | No horizontal page overflow (responsive conventions) | 610px wide nowrap line → document 650px at 390 | A | H | Allow wrapping/truncate; no new rule |
| R2 | All 6 creation flows | `ui/stepper` | Responsive conventions; stepper rules define behaviour, not narrow layout | Page overflows at 390 (481–625px) in UseCase/Event/Collab/AIModel/Publication; Event & Collaborative also at 768 (881px). Chart flow does not overflow | A + D | H | Fix stepper wrap/scroll; document narrow-width behaviour in DS |
| R3 | Workspace + consumer shells | `main` `px-10` at every width | "main is max-w-1760 px-10 py-8" (no mobile variant defined) | 40px gutters at 390 → 310px content; drives long wrapping (e.g. 4-line dataset titles) | D | M | Define a responsive gutter in the DS, then apply |
| R4 | Workspace at 768 | Sidebar row at `md` | "sidebar + main become a row at md" | Main column ≈430px at 768 (stepper clipped inside card) | B | M | Re-check md breakpoint for workspace layout |
| T1 | Dialogs/modals | `DialogTitle` and ≥8 modal titles | "Every page and component heading resolves to a `.type-*` class" | `text-base font-semibold` (≈ heading-3 but line-height 1.5 vs 1.25): dialog.tsx:65, confirm-dialog:46, PublishSuccessModal:57, ChartPublishSuccessModal:22, LeaveCreationDialog:22, DeleteAccountDialog:41,63; `<p>` titles in DatasetCreationFlow:100,474, OrganisationsPage:42 | A | M | Use `type-heading-3` (one shared edit in DialogTitle covers most) |
| T2 | Collaboratives / Publishers / About / Contact | `ComingSoonPage` h1 | Page title = a role | `text-xl font-semibold` (raw 20px) — now primary-nav destinations | A | L | Use PageHeader/`type-heading-1` |
| T3 | Cross-screen | Page-title level | heading1 = "page/section title" | h1 24px (consumer lists, org dashboard/profile, previews); h1 20px/heading-2 (Profile, 6 editor flows); **no h1** and a 16px h3 card title (all 7 My-Workspace and ≥5 organisation list pages); Dashboard card titles are `<p class=type-heading-1>`; Dashboard/Discover/Use-case h1 = display 60px | B + D | M | Decide in the DS which role is the page title per page class; add h1 to list pages |
| T4 | Search results | Type intro `h2` | weight.bold "large display numerals only" | `type-heading-1 font-bold` (700) at SearchResultsPage:336 | A | L | Remove override |
| T5 | Use Case / Dashboard / Org dashboard | Heading roles on non-headings | Roles carry semantic purpose | `type-heading-3 font-normal` as subtitle (UseCasePreview:65); `type-heading-1 font-normal` pull-quote (UseCaseSections:254, Step1Builder:446,458); KPI numerals as `p.type-heading-2` | D | L | See §8 (lead role); pull-quote is prose-specific (E) |
| T6 | Event detail, Search results, Org members, ContentCard | Avatar initials | 12px floor | `text-[10px]` ×5 sites (runtime: 4 on Event detail, 1 on Search results) | A | L | Raise to caption/size the avatar |
| T7 | Everywhere | Body/label/caption | "usage is role-governed, not ad hoc" | `text-sm` 437 / `text-xs` 288 raw vs `.type-body` 40 / `.type-caption` 53. Raw `text-sm` = 1.43 line-height vs body 1.5 vs label 1.25 | B | M | Migrate gradually; at minimum for multi-line copy |
| T8 | Tables, sidebars, review sections, Discover | Uppercase eyebrow | `tracking.emphasis` 0.025em only, for short uppercase labels | `uppercase tracking-wide` ×51 (OK) but `tracking-wider` ×2 (0.05em) | A (2) / D (51) | L | Fix the 2; see §8 overline |
| T9 | Dataset Details (uncommitted) | Title | heading1 = 24px | Hard-coded `text-[26px] leading-tight` over `type-heading-1` | A | L | Revert to heading-1 or decide a role (§8) |
| T10 | Detail pages | Entity-detail title | one role per semantic | Dataset 26px override; Event/Collab/AI/Pub previews 24px; Use Case display 60px | B | M | Align to heading-1; Use Case may stay display (E) |
| C1 | App-wide | Token namespaces | Reconciliation "in progress, additive" | `text-muted-foreground` 410 vs `text-text-subdued` 205; `text-foreground` 202 vs `text-text-default` 85; `border-border` 170 vs `border-border-default` 90; `border-input` 11 vs `border-border-input` 19; `ring-ring` 31 vs `ring-border-focus` 27; `success-text` 23 vs `text-success` 12. Same values, no visual drift | B (documented) | L | Finish migration; no visual change |
| C2 | Previews, Review, Step3 | Inline alerts/banners | `warning`, `destructive-text` etc. defined; no alert pattern | ≥10 hand-rolled: warning `border-warning/40 bg-warning/10 px-4 py-2.5` (5 preview pages + EventPublishReview) vs chip `bg-surface-warning/20`; success `/30 /5 px-3 py-2`; destructive `/30` vs `/40` | B + C | M | Shared Alert/Banner pattern |
| C3 | App-wide | Hover fill | hover/active = `control-hover`/`control-active` | `hover:bg-muted` 23, `surface-subdued` 11, `surface-hovered` 6, `control-hover` 2, plus ad hoc `muted/30,/40,/50` ×8, `primary/5,/10` | B | L | Converge on `surface-hovered` |
| C4 | Tabs, filters, lists | Selected state | DS "Semantic states" has no Selected row | `bg-primary/10` 15, `bg-primary/5` 15, `bg-surface-accent` 14, `bg-muted` 33; ARIA via `aria-current` 11 / `aria-selected` 3 / `aria-pressed` 7 | D + B | M | Define selected state, then converge |
| C5 | SDG badges, Google button | Literals | Tokens only | Official SDG hex; Google logo SVG | E | – | None |
| S1 | Header / breadcrumb vs content / footer | Left edge | Container `px-10` | TopNav & breadcrumb `px-8` (32px) vs `main`/footer `px-10` (40px): logo/crumbs and content never align | B | M | Same gutter token for all chrome |
| S2 | Consumer pages | Container widths | "max-w-[1760px] px-10" | Wrappers 1400 (Dataset, Event, Search), 1100 (Discover), 6xl (Use Cases), 4xl (4 previews); content left edge 40px vs 144px (Use Cases list) | B + D | M | Define a small content-width scale |
| S3 | Pages | Section rhythm | Only title-to-body / paragraph defined | page gaps `gap-6/8/9/10/12` across Dataset/Event/Search/Dashboard/Use Case | B + D | L | Define page-section gap |
| S4 | Cards/dialogs | Padding | none for cards | Card `px-5`, Dialog `px-6`, review cards `p-5`, ContentCard `p-[18px]` (off-grid), EventSpeakers `p-4` | B | L | Align to Card |
| K1 | Tables | `ManagementTable` header | Table header = caption role | Non-sortable headers uppercase (GEOGRAPHY, STATUS, ACTIONS); sortable ones (Dataset, Dataset Type, Sector, Last Updated) normal case — `SortableHeader` button does not inherit `uppercase tracking-wide` | B | M | Make SortableHeader inherit the header style |
| K2 | Pickers | Input-like trigger buttons | Inputs: `h-10 rounded-md border-input bg-background` | 6 hand-rolled `<button class="h-10 w-full … border border-input|border-border-input … text-muted-foreground|text-text-subdued">` (CollaborativeStep3Content, PeopleOrgSearchField, OrganisationSearchField, DatasetConnectionsCard, SpeakerSearchField, ResourceSearchField) with mixed namespaces | B + C | M | Shared "picker trigger" |
| K3 | Pills/chips | Badge | Badge variants | 91 `<Badge>`, but ≥8 hand-rolled `rounded-full bg-muted|surface-subdued px-2.5 py-0.5|py-1 text-xs` (PromptFileSideSheet, DatasetCreationFlow:497, DatasetConnectionsCard, Collaborative/EventPreview meta chips, ManagementTable count, UseCaseDashboardSection, WorkspaceHeader "Unsaved" `px-3 py-1.5`), plus `Chip` filter pill | C | L | Badge variant for chip/count |
| K4 | Review/preview steps | Cards | Cards `rounded-xl`/`rounded-lg` | `Card` 78 uses vs ≥25 hand-rolled `rounded-xl border border-border bg-card (p-5)` (AI/Pub/Collab/Chart/UseCase Step reviews, previews, sidebar, PreviewActionBar); `border-border bg-card` vs Card `border-border-default bg-surface-default`; lg vs xl mixed | B + C | M | Use `Card`/`ReviewSection` |
| K5 | Lists | Empty states | `EmptyState` component | 20 `EmptyState` vs ≥6 inline `<p class="py-6 text-center text-sm text-muted-foreground">No … yet.</p>` | B + C | L | Use EmptyState |
| K6 | App | Loading | none defined | `Loader2 animate-spin` ×18 in sizes 4/6; 5 pulse/skeleton; no page/section loading pattern | D | L | Define spinner sizes + skeleton if needed |
| K7 | Button | Variants | `secondary`, `outline`, … | `secondary` variant used 0 times; "primary-coloured outline" is built by class override (2 sites + dataset header) | D | L | Decide if an outline-primary variant is needed |
| K8 | Footer | Links | Links carry no rest underline | Footer "About Us / Contact Us" are inert `<button>`s while nav now routes to About/Contact | B | L | Wire to same routes |
| R5 | OrganisationCard, DatasetDetailHeader | `rounded-2xl` | Radius scale md/lg/xl | Tailwind default `2xl` = 16px, smaller than DS `xl` = 18px (scale inverts) | A/D | L | Use `rounded-xl` or define 2xl |
| R6 | Dashboard, UseCase preview | Shadows | Tailwind defaults | `shadow-sm` 6, `md` 9, `lg` 3, one arbitrary full-bleed `shadow-[0_0_0_100vmax …]` | E | – | None |
| I1 | App-wide | Disabled | `disabled:opacity-50` | Button correct; ad hoc `opacity-50` ×9, `disabled:cursor-not-allowed` ×5 | B | L | Converge |
| E1 | Use-case prose | `h2/h3` | Roles | CSS comment maps prose H2 = heading-1, H3 = heading-2 | E | – | Document |

## 4. Cross-screen consistency
| Pattern | Treatments found |
|---|---|
| Page title | h1 24 · h1 20 · h3 16 card title (no h1) · p 24 (Dashboard) · display 60 |
| Content container / left edge | 40px (Dataset, Event, Search, workspaces) · 144px (Use Cases) · 1100 centred (Discover) · 4xl (previews) |
| Cards | `Card` (rounded-xl, border-default) · ContentCard (rounded-lg, p-[18px]) · hand-rolled review cards |
| Alerts | 3 padding/alpha families for the same warning/error meaning |
| Table header | uppercase vs normal case in one header row |
| Empty state | `EmptyState` vs inline `<p>` |
| Pills | `Badge` · hand-rolled pills · `Chip` |
| Chrome gutter | 32px (header/breadcrumb) vs 40px (content/footer) |

## 5. Design-system gaps (D)
1. Lead/subtitle copy at 16px regular (§8). 2. Overline/eyebrow label (§8). 3. Which role is the page title for public pages / workspace lists / editor flows. 4. Selected state. 5. Responsive page gutter and a content-width scale. 6. Alert/banner pattern. 7. Stepper narrow-viewport behaviour. 8. Hero-wash surface (`workspace-hero-*` now used by Dashboard, Use Case preview, Dataset header). 9. Loading patterns. 10. Radius scale vs Tailwind `2xl`. 11. Primary-outline button.

## 6. Intentional exceptions (E)
SDG palette; Google logo; chart KPI numerals (documented); rich-text/prose heading mapping; display 60px hero on Dashboard/Discover/Use Case story (one hero moment); compact 20px editor-toolbar titles (inline-editable "Untitled …" in creation flows); dark header chrome with `ring-on-dark`; Radix overlay `bg-black/40` (documented); Help FAB.

## 7. Top 10 to address first
1. R2 Stepper overflow (390; 768 Event/Collab). 2. R1 Dashboard module list overflow at 390. 3. R3 mobile gutter. 4. T3 page-title mapping + missing h1 on list pages. 5. T1 modal/dialog titles (fix `DialogTitle`). 6. K1 table header casing. 7. C2 shared alert pattern. 8. T9/T10 detail-page title treatment (revert 26px or decide). 9. T7 body/label line-height drift. 10. S1/S2 left-edge and container-width alignment.

## 8. Typography: new roles?
- **No new heading size is warranted.** The dataset title is a *page title*, and the system already has `heading1` (24px). The only evidence for "bigger than 24" is one hand-sized override on one screen; the other detail pages use 24px, and the Use Case story page uses display 60px as an intentional editorial hero. Choose one role for entity-detail titles; do not add 26px/28px for a single screen.
- **Candidate role 1 — lead (16px / 1.5 / 400).** Approximated today by raw `text-base` or by `type-heading-3 font-normal` at ≥7 sites on ≥5 screens: Discover intro, Search type intro, Event subtitle (×2), Publication description, Event About body, Use Case subtitle. This is a genuine recurring semantic role with no definition.
- **Candidate role 2 — overline (12px / 500 / uppercase / 0.025em).** ≥51 hand-assembled uses (table headers, sidebar groups, review sections, dataset metadata). Formalise as a named combination (caption variant), not a new size.
- **Not warranted:** KPI numeral role (one documented chart exception + one `p.type-heading-2`); pull-quote (prose-specific); page-title levels (a documentation decision, not a new role).

Overlaps with earlier reports: `audit-reports/heading-subtitle-consistency-audit-2026-09-18.md` (heading/subtitle) and `badge-tag-interactivity-audit-2026-09-30.md`.
