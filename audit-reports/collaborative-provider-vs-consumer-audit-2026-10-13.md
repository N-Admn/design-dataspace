# Audit: Collaborative provider flow vs consumer detail page (playground)

**Date:** 2026-10-13 · **Scope:** read-only. No code, UI, data or configuration was changed; this file is the only artefact written.
**Branch inspected:** `feat/data-dna-v10-test-scenarios` (working tree, including uncommitted playground work).

**How to read the evidence labels**
- **Confirmed** — read directly in the source (file named).
- **Inferred** — follows from the code but was not executed end to end.
- **Unresolved** — the implementation does not give enough evidence.

---

## A. Executive summary

**Overall: the consumer page and the provider flow are not connected at all, so alignment is by coincidence of naming, not by data flow.**

1. **The playground page is 100% static (Confirmed).** `src/pages/playground/collaborative-detail/*` imports nothing from `AppDataContext`, `@/types/collaborative`, `mock-collaboratives.ts` or the draft-snapshot storage. Every value (title, tags, counts, people, datasets, use cases, SDG goals, images) comes from `collaborative-sample-data.ts` or is typed into a component. Nothing a contributor enters in the provider flow can currently reach this page. That is expected for a prototype, but it means **every element below is "unverified" until wired**, and several are designed in ways the provider data cannot support.
2. **Four kinds of content on the page have no provider source and would be false if shown as fact:** the "Public Impact" statement in the ecosystem diagram, the two editorial intro sentences that describe who participates, three sentences added to the description during design, and the call-to-action card. (Findings E1–E4.)
3. **Several labels contradict the provider's own vocabulary:** the diagram calls people "contributors" and organisations "partners", but in the provider flow *Contributor / Partner / Supporter* are independent **relationships** that apply to people **and** organisations alike (F2).
4. **Collected information that the page drops:** external link, last-updated date, the Collaborative URL, and the sectors / geographies as separate facets (F5–F6). Conversely, the page shows free-text roles (e.g. "Technical advisor"), a topic and a year per resource, and SDG goals 11 and 6, none of which the data model holds (F1, F3, F4).
5. **SDG goals:** the provider offers all 17; only 5 goal images are bundled (3, 6, 11, 13, 17), so 12 selectable goals have no image on the consumer page (F4).
6. **A separate, pre-existing consumer-side problem:** published Collaboratives are linked from Search to the owner's *preview* route, which renders the **working copy** (`record.form`), not the published snapshot, and carries publish controls (F9). There is no public Collaborative page yet (`/collaboratives` is `ComingSoonPage`).
7. **What is sound:** the counting rules the page needs *can* be derived exactly from `CollaborativeConnections` (people vs organisations by `kind`; datasets and use cases by list length), the provider already restricts connections to **published** datasets/use cases, and `buildSearchIndex` already derives card metadata for published datasets and use cases from real records, which the playground cards should reuse (G).

Severity tally of the 16 confirmed issues F0–F15: **Critical 1 · High 7 · Medium 5 · Low 3** (section F; F5 is counted High for the external link and date, with the URL part Medium).

---

## B. Provider-flow inventory

Source: `src/components/collaborative/CollaborativeStep{1About,2People,3Content,4Review}.tsx`, `src/types/collaborative.ts`, `src/lib/collaborative-validation.ts`, `src/context/AppDataContext.tsx`.

### Step 1 — About (`CollaborativeMetadata`)

| Field (form label) | Property | Type | Required | Notes |
|---|---|---|---|---|
| Collaborative Image | `image` | `UploadedAsset \| null` | No | Extensions = supported image types + `svg`, size `MAX_IMAGE_BYTES`. No alt-text field. |
| Collaborative Name | `name` | string | **Yes** | Error "Enter a Collaborative name." |
| Collaborative URL | `slug` | string | **Yes** | `<slug>.collab.civicdataspace.in` (`COLLABORATIVE_URL_SUFFIX`). 3–63 chars, `SLUG_PATTERN`, unique across records (`takenCollaborativeSlugs`). Helper text says it is filled in from the name (the auto-fill code was not traced; `slugify` is used in `AppDataContext` for legacy records). |
| Description | `descriptionHtml` | rich-text HTML string | **Yes** | ≤ 10,000 visible characters (`COLLABORATIVE_DESCRIPTION_MAX_LENGTH`). |
| External Link | `externalUrl` | string (URL) | No | Validated with `new URL()` only (any scheme). |
| Sectors | `sectors` | string[] (`SECTOR_OPTIONS`) | No | |
| SDG Goals | `sdgGoals` | string[] (`sdg-1` … `sdg-17`) | No | |
| Tags | `tags` | string[] (free text) | No | |
| Geography | `geographies` | string[] (`GEOGRAPHY_OPTIONS`: India, Bangladesh, Nepal, Sri Lanka, Pakistan, Bhutan, Global) | No | No "Asia-Pacific" option. |

### Step 2 — People & Organisations (`CollaborativePerson[]` in `connections.people`)

| Field | Property | Type | Required | Notes |
|---|---|---|---|---|
| Person / organisation | `refId`, `kind` (`'person' \| 'organisation'`), `name` | string | — | Stored as **copies** (name is a snapshot). One array holds both kinds. |
| Context line | `context` | string | auto | Persons: `designation · organisation` (from Add Person form). Organisations: `"Registered organisation"` / `"New organisation"` (set by code, not entered). |
| Logo / photo | `logo` | `UploadedAsset?` | No | |
| Relationship | `relationship` | `'contributor' \| 'partner' \| 'supporter'` | Defaults to `contributor` | Applies to persons *and* organisations. |

No minimum: Step 2 is never a blocker (`getCollaborativeReadinessIssues` ignores it). Dedup: the search field excludes existing `refId`s; "Add New" person uses `person-new-${Date.now()}` with no name check.

### Step 3 — Content

| Field | Property | Type | Required |
|---|---|---|---|
| Datasets | `connections.datasets` | `{ id, title }[]` | **At least one dataset *or* use case** (`validateCollaborativeContent`) |
| Use Cases | `connections.useCases` | `{ id, title }[]` | (same rule) |

Only **published** datasets and use cases are offered (`DatasetConnectionsCard`, `CollaborativeStep3Content`). No other content types exist in the model. Titles are stored as snapshots.

### Step 4 — Review & Publish

Computed on screen (not stored): About/Content validity, counts of people by relationship (`peopleDetail`), `Datasets — N connected. Use Cases — N connected.`, and "URL: `<slug>.collab…`". Publication happens from `CollaborativePreviewPage` (`upsertCollaborative(id, 'published', form)`), which sets `status`, `updatedAt = formatTimestamp(new Date())` and snapshots `publishedForm` (`resolveLifecycle`).

### Record-level data (`CollaborativeRecord`)

`id`, `status` (`draft | published`), `updatedAt` (system timestamp), `form`, `publishedForm` (snapshot at last publish), `organisationId?`, `createdBy?`. Persisted in `localStorage` key `civicdataspace:collaboratives`; unsaved drafts also in `civicdataspace:collaborative-draft:<id>`.

---

## C. Consumer-page inventory (playground)

Files: `CollaborativeDetailPlayground.tsx`, `CollaborativeHero.tsx`, `EcosystemTimeline.tsx`, `PillTicker.tsx`, `ResourceExplorer.tsx`, `collaborative-sample-data.ts`. Playground chrome (back link, sample-data selector, "Playground prototype" banner, footer note, pause button) is excluded from the matrix.

**Hero:** H1 title · four topic tags (links) · "Want to be part of this collaborative?" + **Collaborate** button · stat "30 / People & organisations" · stat "34 / Datasets & use cases" · SDG card ("SDG Goals", four goal icons with title + one-line tooltip) · hero image (+ alt text; neutral fallback panel).
**About:** eyebrow "Description" · heading "About this collaborative." · description paragraph · ecosystem diagram (Datasets "28 connected", Use Cases "6 connected", People "18 contributors", Organisations "12 partners", Public Impact + statement; hub = Users icon, collaborative name for screen readers).
**Organisations:** eyebrow "Organisations · 12" · heading "Partners working together." · intro sentence · pill ticker (name, role subtitle, image or initials).
**People:** eyebrow "People · 18" · heading "A diverse network of contributors." · intro sentence · pill ticker (name, role subtitle, portrait or initials).
**Datasets:** eyebrow · heading "Evidence and data." · intro · "28 datasets" · sort · cards (title, one-line description, "Updated <Mon YYYY>", format, geography, "Dataset" badge) · Load more · preview dialog (description, topic, geography, format, last updated, tags, note).
**Use cases:** eyebrow · heading "Applications in practice." · intro · "6 use cases" · sort · cards (cover image, title, description, "N datasets", "N charts", geography, publisher avatars, "Use Case" badge) · View all · preview dialog (topic, geography, sector, year, tags).

---

## D. Field-level alignment matrix

Status key: **Aligned** · **Derived** (computable from stored data) · **Missing source** · **Mismatch** · **Unclear**.
"Data source today" is always the playground's static array unless stated.

| # | Consumer element | Location | Provider-flow source | Data source today | Status | Finding | Recommended action |
|---|---|---|---|---|---|---|---|
| 1 | Title "Climate and Health Data Collaborative" | Hero H1; hub sr-only name | Step 1 `name` | `COLLABORATIVE.title` (static) | Aligned (by value) | Same string as `mock-collaboratives` record 1; not read from it. | Bind to `metadata.name`; fall back to "Untitled Collaborative" like `CollaborativePreview`. |
| 2 | Hero image | Hero thumbnail | Step 1 `image` | `COLLABORATIVE.thumbnail` (Pexels 30313887) | Mismatch | Mock record uses a different image (76969). Provider image is optional; consumer fallback is a neutral panel, production preview shows nothing. | Bind to `image.dataUrl`; align fallback treatment across preview and page. |
| 3 | Image alt text | `<img alt>` | none | static sentence describing the photo | Missing source | Provider has no alt field; the static alt describes a specific photo and would be wrong for any uploaded image. | Use empty alt (as `CollaborativePreview` does) or derive "Image for <name>". Do **not** add a field unless alt text is a product requirement. |
| 4 | Tag chips: Health, Environment, Climate action, Asia-Pacific | Hero | Step 1 `tags` / `sectors` / `geographies` | `COLLABORATIVE.chips` (static) | Mismatch | Chips mix categories. Record 1 has sectors Health, Environment; geography India; tags Climate, Health, Disaster Resilience. "Climate action" is not a stored value; "Asia-Pacific" is not a geography option at all. Each chip links to `/search?type=collaboratives&tag=<chip>`, which filters on `tags` only. | Render `tags` as tags (clickable, tag search); render sectors/geographies as separate, non-tag facets or not at all. Never invent values. |
| 5 | SDG icons: goals 3, 13, 11, 6 | Hero SDG card | Step 1 `sdgGoals` | `COLLABORATIVE.sdgGoals` (static) | Mismatch | Record 1 stores `sdg-3`, `sdg-13` only; 11 and 6 are unsupported. | Bind to `sdgGoals`. |
| 6 | SDG tooltip title + description | Hero SDG card | none (UN reference text) | static strings | Derived / static | Titles match `SDG_GOAL_OPTIONS`; one-line descriptions are the UN's statements for 4 goals only. | Keep as reference content; add descriptions for all 17 or fall back to the title alone. |
| 7 | SDG goal images | Hero SDG card | `sdgGoals` | 4 bundled PNGs (`src/assets/sdg`: 3, 6, 11, 13, 17) | Missing source | 12 of 17 selectable goals have no image. | Bundle the remaining 12 or render a text fallback. See F4. |
| 8 | "30 — People & organisations" | Hero stat | Step 2 `connections.people` | `PEOPLE.length + ORGANISATIONS.length` (static 18 + 12) | Derived | Correct derivation is `connections.people.length` (one array, both kinds). Persons added via "Add New" are not de-duplicated by name (F11). | Bind to `people.length`; confirm duplicate policy. |
| 9 | "34 — Datasets & use cases" | Hero stat | Step 3 `connections.datasets` + `useCases` | `DATASETS.length + USE_CASES.length` (28 + 6) | Derived | Real record 1: 1 + 1 = 2. Must count only still-published records (a connected dataset can later be unpublished). | Bind to counts of connected **published** records. |
| 10 | "Want to be part of this collaborative?" | Hero CTA card | none | `COLLABORATIVE.cta.tagline` | Missing source (static) | Editorial copy, not specific to the initiative, but implies a join workflow that does not exist. | Keep as generic copy only if a destination exists; otherwise hide. |
| 11 | "Collaborate" button | Hero CTA card | none | toast placeholder | Missing source | No participation workflow in the provider model. | Decision needed (product): destination, or remove. |
| 12 | Description paragraph (4 sentences) | About | Step 1 `descriptionHtml` | `COLLABORATIVE.description` (static plain text) | Mismatch | Provider value is required rich-text HTML; the playground uses plain text and **three sentences added in design** (E3). Production preview renders HTML via `dangerouslySetInnerHTML` (sanitisation not verified, Unresolved). | Render `descriptionHtml` (sanitised); drop the authored sentences. |
| 13 | Heading "About this collaborative." / eyebrow "Description" | About | none | literal | Static (D) | Safe editorial labels. | Retain. |
| 14 | Diagram — Datasets "28 connected" | About diagram | Step 3 datasets | `datasets.length` | Derived | Same rule as #9. Consistent with hero only because both read the same static array. | Same as #9; use one shared count. |
| 15 | Diagram — Use Cases "6 connected" | About diagram | Step 3 use cases | `useCases.length` | Derived | As #14. | As #14. |
| 16 | Diagram — People "18 contributors" | About diagram | Step 2 persons | `people.length` | **Mismatch** | Counts persons, but labels them "contributors". *Contributor* is one of three **relationships**; a person may be a Partner or Supporter (Review step counts them separately). | Label "people" (or "N people"); if relationship counts are wanted, derive each from `relationship`. |
| 17 | Diagram — Organisations "12 partners" | About diagram | Step 2 organisations | `organisations.length` | **Mismatch** | Same problem: organisations can be Contributor / Supporter, not only Partner. | Label "organisations". |
| 18 | Diagram — "Public Impact" + "Shared solutions for healthier, more resilient communities" | About diagram | none | `COLLABORATIVE.impact` (static) | **Unsupported** | An outcome claim about this initiative with no field, calculation or related record. | Remove the node, or replace with a node that is derivable (e.g. SDG goals from `sdgGoals`). See E1. |
| 19 | Diagram hub (Users icon) | About diagram | `name` | static prop | Derived | Decorative; name only for screen readers. | Bind name. |
| 20 | Eyebrow "Organisations · 12" | Organisations | Step 2 `kind='organisation'` | `organisations.length` | Derived | Correct rule: `people.filter(kind==='organisation').length`. | Bind. |
| 21 | Heading "Partners working together." | Organisations | none | literal | Mismatch (wording) | "Partners" again conflicts with the relationship vocabulary; organisations may be Contributors or Supporters. | Neutral wording ("Organisations"). |
| 22 | Intro "Government, academia, civil society, philanthropy and companies are contributing to this initiative." | Organisations | none | literal | **Unsupported** | States which sectors participate; the model has no organisation type. See E2. | Remove or make generic. |
| 23 | Org pill name | Organisations ticker | `people[].name` | `ORGANISATIONS` | Aligned (type) | Stored snapshot of the name (can go stale). | Bind; consider live lookup by `refId` (F10). |
| 24 | Org pill subtitle ("Technical advisor", "Funding partner", …) | Organisations ticker | `relationship` / `context` | free-text `role` | **Mismatch** | Provider has only `Contributor / Partner / Supporter`; org `context` is "Registered organisation" / "New organisation". Free-text roles do not exist. | Show `relationship` label (as `CollaborativePreview` groups by it); do not show `context` for orgs. |
| 25 | Org pill image | Organisations ticker | `people[].logo` | Pexels placeholders for 10 of 12 | Mismatch | Stand-ins unrelated to the organisations. Optional in provider; initials fallback exists. | Use `logo` only; never ship stock placeholders. |
| 26 | Eyebrow "People · 18" | People | Step 2 `kind='person'` | `people.length` | Derived | As #20. | Bind. |
| 27 | Heading "A diverse network of contributors." | People | none | literal | Mismatch (wording) | "Contributors" ≠ relationship vocabulary; "diverse" is a claim. | Neutral wording. |
| 28 | Intro "Researchers, data stewards, analysts and practitioners who contribute to this collaborative and use its data." | People | none | literal | **Unsupported** | Asserts roles/professions the model does not hold. See E2. | Remove or make generic. |
| 29 | Person name / subtitle / portrait | People ticker | `name`, `context` (designation · organisation), `logo`, `relationship` | `PEOPLE` (free-text role, Pexels portraits) | Mismatch | Subtitle should be `relationship` and, for persons, optionally `context` (designation). Portraits are stock photos. | As #24/#25. |
| 30 | Datasets eyebrow/heading/intro | Datasets | none | literals | Static (D) | Generic. Intro implies "open any of them for a closer look". | Retain. |
| 31 | "28 datasets" result count | Datasets | Step 3 datasets | `items.length` | Derived | As #9. | Count published connected datasets. |
| 32 | Dataset card title | Datasets | `datasets[].title` | static | Aligned (type) | Snapshot title; live record title may differ. | Prefer live record name; fall back to snapshot. |
| 33 | Dataset description | Datasets | none stored on the connection | static (one record has none) | Derived | Available on the live dataset record (`form.metadata.description`). | Look up by `id`. |
| 34 | "Updated Aug 2026" | Datasets | none stored | static ISO date | Derived | Live dataset `updatedAt`; search already uses it. | Look up by `id`; omit if absent. |
| 35 | Format (CSV, API, GeoTIFF…) | Datasets | none stored | static string | Derived | Live dataset `files[].extension` (search derives `formats`). | Derive from files; "API" is not a file extension in the model, verify. |
| 36 | Geography | Datasets | none stored | static (values incl. "Asia-Pacific", "South Asia", "Southeast Asia") | **Mismatch** | Dataset geography options are the 7 in `GEOGRAPHY_OPTIONS`; the sample values are outside that set. | Use stored `metadata.geography` label only. |
| 37 | Dataset `topic`, `tags` (preview) | Datasets preview | none | static | **Unsupported** | Datasets have `tags` but no "topic"; sample `topic` has no source. | Drop `topic`; use real `tags`. |
| 38 | "Most relevant" sort | Datasets / Use cases | none | array order | Unclear | "Relevance" has no definition for a connected list; it is the curated insertion order. | Rename ("Default order") or define. |
| 39 | Use-case card title | Use cases | `useCases[].title` | static | Aligned (type) | Snapshot. | As #32. |
| 40 | Use-case description | Use cases | none stored | static (one has none) | Derived | Live use case `metadata.subtitle`. | Look up by `id`. |
| 41 | "N datasets", "N charts" | Use-case card | none stored | static counts | Derived | `connections.datasets.length`; charts = `blocks.filter(type==='chart').length` (as `buildSearchIndex`). Sample counts are arbitrary. | Reuse `cardMeta` from `buildSearchIndex`. |
| 42 | Geography on use-case card | Use cases | none stored | static | Mismatch / Derived | Real: first of `metadata.geographies` (search does this). Sample values include "South Asia", "Asia-Pacific". | Derive. |
| 43 | Cover image | Use-case card | none stored | Pexels | Derived | Real: `metadata.thumbnail`. Stock images shown are not the records' thumbnails. | Derive; omit when absent. |
| 44 | Publisher avatars | Use-case card | none stored | static | Derived | Real: connected organisations' logos, else first contributor (search logic). | Derive. |
| 45 | `year` (use-case sort + preview) | Use cases | none | static | **Unsupported** | No year/date field on a use case besides record `updatedAt`. Undated records sort last. | Replace with `updatedAt` or remove. |
| 46 | `sector`, `topic` (use-case preview) | Use cases preview | `sectors` (use case) | static | Mismatch | Sample sectors ("Public health", "Urban planning") ≠ `SECTOR_OPTIONS`. `topic` has no source. | Use stored sectors; drop topic. |
| 47 | Badges "Dataset" / "Use Case" | Cards | fixed by card type | literal | Aligned | Type label from `SEARCH_TYPE_LABEL`. | Retain. |
| 48 | External link | **not shown** | Step 1 `externalUrl` | — | Missing on consumer | Collected, validated, shown in production preview, absent here. | Show when present (F5). |
| 49 | Collaborative URL / slug | **not shown** | Step 1 `slug` | — | Missing on consumer | Required and unique, shown on Review; absent here. | Decide whether it appears (F5). |
| 50 | Last updated / publication date | **not shown** | `updatedAt` (system) | — | Missing on consumer | Production preview shows "Last updated"; no date here. | Show derived `updatedAt` (F5). |
| 51 | Sectors / geographies | **not shown as such** | Step 1 | — | Missing on consumer | Only appear (wrongly) blended into static chips (#4). | Render from fields (F6). |

---

## E. Additional-information findings

Categories: A explicit · B derived · C system-generated · D static/editorial · E unsupported · F missing/mismatched.

### E — Unsupported or potentially fabricated (not safe to retain as fact)

| ID | What | Where | Source verified? | Safe to keep? | Action |
|---|---|---|---|---|---|
| E1 | **"Public Impact — Shared solutions for healthier, more resilient communities"** | About ecosystem diagram, `COLLABORATIVE.impact` | No | **No** | Remove the node (no field, calculation or relation supports it). Do not add a provider field; the diagram stays factual without it. |
| E2 | **Intro sentences** "Government, academia, civil society, philanthropy and companies are contributing…" and "Researchers, data stewards, analysts and practitioners who contribute…" | Organisations / People section intros | No | **No** | Remove, or replace with neutral text ("Organisations connected to this Collaborative"). |
| E3 | **Three added description sentences** ("The collaborative links datasets on heat, air quality… Members share data, document how it was collected… Contributors are welcome to add…") | About description | No — written during design | **No** | Use the contributor's `descriptionHtml` only. They also describe datasets/use cases specific to the sample. |
| E4 | **"Want to be part of this collaborative?" / "Collaborate"** | Hero | No workflow | Conditional | Keep only if a participation destination is defined; otherwise remove. |
| E5 | **Free-text roles** ("Technical advisor", "Funding partner", "Climate scientist"…) | Org and People pills | No — no such field | **No** | Show the stored `relationship`; do not add a free-text role field unless the product needs one. |
| E6 | **Stock photos as org logos / portraits / use-case covers / hero** | Tickers, cards, hero | No | **No (published view)** | Only stored `logo`, `thumbnail`, `image`; initials/neutral fallbacks otherwise. |
| E7 | **Dataset/use-case `topic`, use-case `year`, geographies outside the allowed set** ("Asia-Pacific", "South Asia", "Southeast Asia") | Cards, previews, sort | No | **No** | Drop or replace with stored fields (#36, #37, #45, #46). |
| E8 | **Hero chip "Asia-Pacific" and "Climate action"** | Hero tags | No (neither stored) | **No** | Render only stored tags/sectors/geographies. |

### B — Derived values (calculation must be confirmed)

| Value | Correct rule (from the data model) | Today |
|---|---|---|
| People count | `connections.people.filter(p => p.kind==='person').length` | static array length |
| Organisation count | `…kind==='organisation'` | static array length |
| People & organisations total | `connections.people.length` (same array) | sum of two static lengths |
| Datasets / use cases | `connections.datasets.length` / `useCases.length`, **restricted to still-published records** | static array lengths |
| Datasets & use cases total | sum of the two published counts | static |
| Card metadata (updated, formats, geography, charts, counts, publishers, thumbnails) | `buildSearchIndex` (`src/lib/global-search.ts`) already derives these for published datasets and use cases | static sample values |
| Relationship counts (if shown) | `people.filter(relationship===…)`, as the Review step's `peopleDetail` | not shown (labels misuse them, F2) |

### C — System-generated

| Value | Source | Today |
|---|---|---|
| Last updated | `CollaborativeRecord.updatedAt` via `formatTimestamp` on each save/publish | not displayed (F5) |
| Publication status | `CollaborativeRecord.status` + `publishedForm` | not represented |
| Fallback imagery | `ImageOff` panel (hero), initials (tickers) | system fallback, acceptable |

### D — Static / editorial (acceptable if clearly generic)

Section eyebrows and headings ("Description", "About this collaborative.", "Evidence and data.", "Applications in practice.", the sort labels, "Load more datasets", "View all use cases", empty-state messages), "SDG Goals", the badges. The datasets and use-case intros are generic; "…this collaborative's data is used to generate insights and inform action" is a mild claim worth softening.

### A — Explicitly collected and **used correctly** by the page today

None. (Title and a few values coincide with the mock record, but by copy, not binding.)

### F — Collected but missing or mismatched on the page

External link; Collaborative URL; last-updated date; sectors and geographies as facets; SDG goals beyond the four bundled images; relationship (Contributor/Partner/Supporter) shown as free-text role; people's `context` (designation) not used.

---

## F. Issues and severity

Only issues confirmed in source are listed. Severity rationale follows each.

| ID | Issue | Severity | Rationale |
|---|---|---|---|
| F0 | **Public Impact node and statement is unsupported** (E1) | **Critical** | An outcome claim about the initiative is presented as fact with no source; on a published page it would misrepresent any Collaborative. |
| F1 | **Consumer page is not bound to provider data** — all content is static (`collaborative-sample-data.ts`) | High | Nothing contributors enter can appear; every figure is unverifiable until wired. (Expected for a prototype; blocking for release.) |
| F2 | **"contributors" / "partners" labels misuse relationship terms** (#16, #17, #21, #27) | High | Misstates who the people/organisations are relative to the Collaborative; conflicts with the Review step's own counts. |
| F3 | **Free-text roles shown where the model has only a 3-value relationship** (#24, #29, E5) | High | Invented participant information. |
| F4 | **SDG goals: page shows goals the record doesn't hold (11, 6) and only 5 of 17 goals have images** (#5, #7) | High | Misstates classification; most selectable goals would render nothing. |
| F5 | **Collected fields missing from the page:** external link, last-updated date, Collaborative URL (#48–#50) | High (external link, date) / Medium (URL) | The external link is the only route to the initiative's own site; the date is the only timeline (the preview itself says no start/end dates exist). |
| F6 | **Hero chips are static and blend categories; "Asia-Pacific" is not a geography option; tag links search tags that aren't stored** (#4, E8) | High | Misrepresents classification and produces dead searches. |
| F7 | **Resource metadata not sourced from records:** `topic`, `year`, geographies and sectors outside allowed sets, arbitrary chart/dataset counts, stock thumbnails/avatars (#33–#46, E7) | Medium | Wrong when real records are bound; derivation exists in `buildSearchIndex`. |
| F8 | **Description rendering mismatch** (plain text + authored sentences vs required rich-text HTML) (#12, E3) | Medium | Loses formatting; adds unsupported claims. Sanitisation of `descriptionHtml` is **Unresolved**. |
| F9 | **Search links published Collaboratives to the owner preview, which renders `record.form` (working copy) with publish controls** (`global-search.ts` `href`; `CollaborativePreviewPage`: `snapshot?.form ?? record?.form`) | High | Public discovery path can show unpublished edits and owner actions; contrast the use-case comment in the same file ("never the owner's publishing preview"). A public Collaborative page does not exist yet. |
| F10 | **Connection entries store copies** (`name`, `context`, `logo`, dataset/use-case `title`), so renames and later unpublishing don't propagate | Medium | Stale names/titles on the page; unpublished datasets remain in `connections` (the provider card flags them, the production preview links them regardless). |
| F11 | **Duplicate people possible** ("Add New" person `refId = person-new-${Date.now()}`, no name check; org dedupe only by id) | Medium | Can inflate the people count and the ticker. |
| F12 | **Search shows `contributorCount: people.length`** (persons + organisations labelled "contributors") (`global-search.ts`) | Medium | Same vocabulary problem on the existing Search card. |
| F13 | **"Most relevant" sort has no definition** (#38) | Low | Cosmetic; ordering is insertion order. |
| F14 | **Image alt text and fallback differ between preview and page** (#2, #3) | Low | Accessibility/traceability, no material misrepresentation. |
| F15 | **Collaborate CTA has no destination** (#10, #11, E4) | Low | Placeholder; no false data, but implies a workflow. |

Unverified, **not** assigned a severity: whether persons have a registry beyond the Add-Person form (Unresolved), HTML sanitisation of the rich-text description, and any server-side behaviour (none exists; all state is `localStorage`).

---

## G. Recommended action matrix

| ID | Problem | Affected component / field | Recommended action | Change type |
|---|---|---|---|---|
| F0 | Unsupported impact claim | `COLLABORATIVE.impact`, `EcosystemTimeline` node `impact` | Remove node and statement. Do not add a provider field. | Consumer-page change |
| F1 | Static page | all of `collaborative-detail/*` | Bind to `CollaborativeRecord.publishedForm` (published) via `useAppData`, with the record id from the route. | Consumer-page change |
| F2 | Misused vocabulary | diagram captions, section headings, hero "People & organisations" | Use "people" / "organisations"; derive Contributor/Partner/Supporter counts from `relationship` only if wanted. | Consumer-page change (+ clarification of terminology) |
| F3 | Free-text roles | `Organisation.role`, `Person.role`, `PillTicker` subtitle | Show `relationship` label (optionally persons' `context`). No new field. | Consumer-page change |
| F4 | SDG mismatch/images | `sdgGoals`, `src/assets/sdg` | Bind to stored goals; bundle remaining 12 icons or text fallback; descriptions for all goals or none. | Consumer-page change |
| F5 | Missing collected fields | hero / about | Show `externalUrl` (when set), derived "Last updated" from `updatedAt`; decide on slug display. | Consumer-page change; **clarification** on slug |
| F6 | Chips | `COLLABORATIVE.chips`, `CollaborativeHero` tags | Render `tags` (clickable), `sectors`, `geographies` from the record; remove static chips. | Consumer-page change |
| F7 | Resource metadata | `DATASETS`, `USE_CASES`, `ResourceExplorer` | Resolve each connection by `id` against published records; reuse `buildSearchIndex` `cardMeta`; drop `topic`/`year`. | Consumer-page change |
| F8 | Description | About `intro` | Render sanitised `descriptionHtml`; remove authored sentences; confirm sanitiser. | Consumer-page change + **clarification** (sanitisation) |
| F9 | Public route/preview | `global-search.ts` href; `CollaborativePreviewPage` | Add a public page that reads `publishedForm`; point Search at it; keep preview for owners. | Consumer-page change / **clarification** (route decision) |
| F10 | Stale copies | `CollaborativePerson`, connected datasets/use cases | Resolve live record by id at render; filter unpublished; keep stored title as fallback. | Consumer-page change (data-model change only if live refs are required) |
| F11 | Duplicate people | `CollaborativeStep2People` Add New | Decide a duplicate rule (name + designation) or accept; count by distinct `refId`. | Provider-flow change / **clarification** |
| F12 | Search label | `global-search.ts` `contributorCount` | Count people, label "people" (or relationship-specific). | Consumer-page change |
| F13 | Sort label | `ResourceExplorer` | Rename to "Default order" or define relevance. | Consumer-page change |
| F14 | Alt / fallback | hero | Use empty alt or derived text; align fallback with preview. | Consumer-page change |
| F15 | CTA | hero CTA card | Define destination or remove. | **Clarification** (product) |

No new provider fields are recommended: every missing consumer value in this audit is either derivable from existing data (counts, card metadata, dates, relationship labels) or should be removed.

---

## H. Final reconciliation checklist

| Check | Result |
|---|---|
| Every consumer-page element has an identifiable source | **No.** Rows with no source or an unsupported value include #3, #10, #11, #18, #22, #24, #28, #29, #37, #38, #45 and #46 (plus the E-list); the remaining rows are "derivable" but not bound. |
| Every derived value has a verified calculation | **No.** Rules are defined in D/B above and are sound, but none is implemented; counts are static array lengths. |
| Every connected resource is correctly associated | **Unresolved.** The page lists 28 datasets and 6 use cases that are not related to any record; the model's real record 1 has 1 dataset and 1 use case. Association by `id` is straightforward but not built. |
| No unsupported information is displayed as fact | **No.** E1–E8. |
| Optional fields are handled correctly | **Partly.** Missing description, date, role, image, tags are hidden or fall back cleanly in the components; but optional collected fields (external link, sectors/geographies, SDG beyond 4) are not rendered. |
| Provider flow and consumer page use consistent terminology | **No.** "Contributor / Partner / Supporter" (provider) vs "contributors" / "partners" (consumer), "Contribute"→"Collaborate", "Add New" vs none. |
| Draft preview and published page represent the same content | **No / Unresolved.** The preview renders `snapshot ?? record.form`, never `publishedForm`; there is no public page; the playground renders neither. |

**Bottom line:** before this page is bound to real data, remove the unsupported statements (F0, E1–E8), correct the relationship vocabulary (F2, F3), and render the collected fields that are currently dropped (F5, F6); counts and resource metadata should then be derived from the connected published records rather than typed in.

---

## Follow-up (2026-10-13): changes made after this audit

Scope agreed with the product owner: preserve the page, apply only terminology updates and SDG integration. Nothing else in the findings above was changed.

| Finding | Status |
|---|---|
| F0 / E1 — "Public Impact" node and statement | **Resolved.** Removed; the diagram's last node is now "SDG Goals · N goals", derived from the selected goals (no goals, no node). `COLLABORATIVE.impact` deleted. |
| F2 — "contributors" / "partners" labels | **Resolved** in the diagram captions ("N connected") and section headings ("Organisations working together.", "People working together."). |
| F3 / E5 — free-text roles | **Resolved.** Pill subtitles now show the provider vocabulary only (Contributor / Partner / Supporter, from `RELATIONSHIP_OPTIONS`). |
| F4 — SDG goals and images | **Resolved.** All 17 official UN icons bundled (`src/assets/sdg`, 256px); shared catalog `src/lib/sdg-goals.ts` (official title, UN statement, icon). The provider SDG dropdown shows every goal with its icon; the consumer SDG card renders whichever goals are selected (first four plus a "+N" square beyond five). The playground has an "SDG goals" selector to demonstrate this. |
| E2, E3, E4, E6, E7, E8, F1, F5–F15 | **Open**, deliberately out of scope for this pass. |

### Follow-up 2 (2026-10-13): public page added at `/explore/collaboratives/:id`

| Finding | Status |
|---|---|
| F1 — page not bound to provider data | **Resolved for the public page.** `src/lib/collaborative-detail-data.ts` builds the page from the record's `publishedForm`; the playground keeps its sample data and shares the same view (`CollaborativeDetailView`). |
| F5 — external link, last updated | **Resolved** (shown in About when present). Collaborative URL (slug) still not shown. |
| F6 — chips | **Resolved** on the public page: tags are the stored tags (links to tag search); sectors/geographies are not rendered. |
| F7, F10 — resource metadata, stale copies | **Resolved.** Connected datasets/use cases are resolved by id against **published** records (Search index); unpublished or deleted ones drop out of the page and counts; card metadata is `buildCardMetadata`, the Search card's own. |
| F8 — description | **Resolved** on the public page: record HTML rendered through `sanitizeHtml` (`src/lib/sanitize-html.ts`, allow-list). The existing owner preview still uses unsanitised `dangerouslySetInnerHTML`. |
| F9 — Search → owner preview | **Resolved.** Search results now link to the public page. Drafts return "Collaborative not found". |
| E2 — unsupported intro sentences | **Resolved** (neutral intros in the shared view). |
| F15 / E4 — CTA | **Decision applied:** the button links to the record's external site; without one the CTA card is omitted. |
| F11, F12, F13, F14, E3 (playground description), E6–E8 (playground samples) | Open / playground-only. |
