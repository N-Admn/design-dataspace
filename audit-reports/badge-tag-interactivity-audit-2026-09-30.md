# CivicDataSpace — Badge/Tag/Chip Interactivity Audit

**Date:** 2026-09-30
**Scope:** Audit every badge, tag, chip, and metadata pill across listing pages, detail pages, cards, and search results for interactivity where it represents filterable/categorical content, then fix only what has a genuine, existing filter/route/data mechanism to reuse. No new filtering logic, routes, or backend functionality; no restyling.
**Verification:** `npx tsc -b`, `npm run lint`, and `npm run build` all pass cleanly after every change. The three fixed tag links were each verified end-to-end via Playwright: navigate to the detail page, confirm the link's `href`, click it, and confirm the destination Search page shows the correctly filtered, non-empty result.

---

## Audit method

Two parallel read-only passes covered the whole surface: (1) cards, search results, listing/management tables, and organisation pages; (2) all six content types' consumer detail pages (Dataset, Use Case, Event, Collaborative, AI Model, Publication).

## Existing pattern found

Dataset's detail page (`DatasetOverview.tsx`) already had a fully-working tag → search link:

```tsx
<Link
  to={`/search?type=dataset&tag=${encodeURIComponent(tag)}`}
  className={cn(badgeVariants({ variant: 'muted' }), /* hover/focus states */)}
>
  {tag}
</Link>
```

This relies on two pieces of existing infrastructure:
- `SearchResultsPage.tsx` already syncs the `tag` query param to the URL (along with `q` and `type`) and calls `filterByTag()` from `src/lib/global-search.ts`.
- `buildSearchIndex()` already populates a `tags` field per search-index item — but, until this fix, only for datasets (`tags: d.form.metadata.tags`). Use Case, Collaborative, and AI Model all have their own `metadata.tags` field in their form state, and all rendered it as a Tags section, but as plain non-interactive `<Badge>`s, and their search-index entries never carried a `tags` value at all — so even converting the badge to a link would have produced a link to an always-empty result.

No other badge type in the app has an equivalent working mechanism:

| Badge type | Where | Interactive today? | Why it can't be fixed within scope |
|---|---|---|---|
| Sector | Dataset header, Use Case, Collaborative, AI Model | No | `SearchResultsPage.tsx` never syncs `sector` to the URL; it's local `activeFilters` state only. Wiring it up is new routing/filtering logic. |
| Geography | Use Case, Collaborative, AI Model | No | No filter-rail group exists for geography at all (`FILTER_GROUPS_BY_TYPE` in `search-filters.ts` has no entry for it). |
| Event type / status, AI Model readiness, Dataset type | Various listing tables | No, or derived-status only | These are computed/derived state badges, not user-set categorical tags, and several already have a matching dropdown filter in the same table (no gap). |
| Role / membership status | Organisation Members, Invitations | Already correctly interactive or correctly informational | Confirmed via audit; no change needed. |
| Topic chips (Discover page), tag-clear chip | `Chip.tsx`, `DiscoverPage.tsx` | Already correctly interactive | Confirmed via audit; no change needed. |

Also flagged, not built (would be inventing new UI): there is no "active filter chip" affordance anywhere (e.g. a removable "Sector: Health ×" pill) — `FilterRail.tsx` only offers checkboxes/radios plus a bulk "Clear all" link.

---

## Fixed

1. **Use Case Tags** (`UseCaseSections.tsx`, `MetadataPanel`) — converted plain `<Badge>` to a `Link` to `/search?type=use-case&tag=...`, matching Dataset's exact styling and focus/hover states via `badgeVariants`.
2. **Collaborative Tags** (`CollaborativePreview.tsx`) — same conversion, targeting `/search?type=collaborative&tag=...`.
3. **AI Model Tags** (`AIModelPreview.tsx`) — same conversion, targeting `/search?type=ai-model&tag=...`.
4. **`buildSearchIndex()`** (`global-search.ts`) — added `tags: u.form.metadata.tags` / `tags: c.form.metadata.tags` / `tags: m.form.metadata.tags` to the Use Case, Collaborative, and AI Model index entries respectively, so the links above resolve to correct, non-empty, correctly-filtered results instead of an empty search. Event and Publication were left out — neither has a `metadata.tags` field to draw from.

Each fix was verified live: e.g. the Use Case "Rural" tag now links to `/search?type=use-case&tag=Rural`, and clicking it lands on Search with a "Clear tag: Rural" chip and exactly the one matching use case shown. Same pattern confirmed for the Collaborative "Climate" tag and the AI Model "Flood" tag.

## Not changed (left untouched — would require new filtering/routing infrastructure)

- Sector badges on any detail page (Dataset, Use Case, Collaborative, AI Model) — would require adding `sector` to `SearchResultsPage.tsx`'s URL-synced state.
- Geography badges on any detail page — no filter-rail group exists for geography yet.
- Event type/status and AI Model readiness badges — derived/status values, not user-set categorical tags; some already have an equivalent table dropdown filter.
- An "active filter chip" UI for the search/filter rail — no such component exists anywhere in the app today; would be new UI, not a wiring fix.

These are the same category of gap the prior [UX continuity pass](./ux-continuity-fixes-2026-09-30.md) flagged for other areas: real functionality gaps, but ones whose fix requires new engineering (new URL params, new filter groups) rather than reusing something that already exists — which this brief explicitly ruled out.
