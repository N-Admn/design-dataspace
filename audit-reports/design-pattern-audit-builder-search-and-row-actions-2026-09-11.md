# Design Pattern Consistency Audit — Builder Search Dropdowns & Row Actions

**Date:** 2026-09-11
**Target:** CivicDataSpace prototype, `main` @ `6715c21` + working tree.
**Scope:** (1) entity-search/connect dropdowns across Event, Use Case, Collaborative, Chart, Dataset builders. (2) Edit/Remove row-action affordance on connected-item cards.
**Method:** Static component inspection + repo-wide grep sweeps for each pattern's markup signatures. Fixed one gap found during the sweep (see §1.4); everything else is reported, not changed.
**Build after fixes:** `tsc -b` ✓ · `oxlint` ✓ · dev-server HMR reload ✓.

---

## 1. Search / connect dropdowns

### 1.1 Canonical reference

The Resources search in the Event → Resources step (`ResourceSearchField.tsx`) is the source of truth: bordered search input → filter chips → bordered result list, each row `[size-9 rounded-md bg-muted icon] primary (text-sm font-medium) / secondary (text-xs text-muted-foreground)`, `border-b` between rows, `hover:bg-muted/50`.

Its anatomy is now extracted into a shared, presentational-only component: **`src/components/shared/SearchResultList.tsx`** — `SearchInput`, `SearchResultList`, `SearchResultRow`. No data, filtering, or selection logic lives there; every consumer keeps its own domain, query and `onSelect`.

### 1.2 On the shared component — consistent

| Component | Domain queried | Shell | Status |
|---|---|---|---|
| `ResourceSearchField` | datasets · use cases · collaboratives · AI models · publications | inline, always visible + type filter chips | ✅ canonical (source of truth) |
| `OrganisationSearchField` | organisations | popover | ✅ on shared component |
| `SpeakerSearchField` | contributors (org-affiliated only) | popover | ✅ on shared component |
| `PeopleOrgSearchField` (Collaborative → People) | contributors + organisations, combined | popover | ✅ **fixed in this pass** — was still on the pre-standardization markup (circle icon, `rounded-sm` rows, no row border, org logo thumbnails in the dropdown); now uses `SearchInput` / `SearchResultList` / `SearchResultRow` with `Building2`/`User` leading icons, matching every other picker. Logo thumbnails in results dropped to match how `OrganisationSearchField` already renders organisations (icon only; logos remain on the connected-item cards). No change to its people+org merged query — that merge is this widget's existing, intentional design, not something introduced here. |

All four now render the identical row anatomy and read as one interaction pattern, as intended.

### 1.3 Same icon-box/text anatomy, different container — sibling pattern, not an inconsistency

| Component | Where | Shape |
|---|---|---|
| `DatasetConnectionsCard` | Use Case / Event / Collaborative dataset connections | inline toggle panel; each result is its **own** bordered card (`gap-2` between cards) with an explicit **Connect** button / **Connected** badge per row |
| `CollaborativeStep3Content` (use-case picker) | Collaborative → Content | same shape as above, for use cases |

Both already use the canonical `size-9 rounded-md bg-muted` icon box and the same primary/secondary text hierarchy as the Resources pattern — that part lines up. They diverge in **container structure** (one card per result vs. one bordered list with row dividers) and **selection affordance** (explicit Connect/Connected button vs. click-the-row). That divergence tracks a real behavioral difference: these two let an already-connected item stay visible in the result set (dimmed, with a "Connected" badge you can't re-click), whereas Resources/Organisation/Speaker/PeopleOrg remove a selected item from the candidate pool entirely once picked. Forcing them onto the click-row shell would require changing that connected-item-visibility behavior — out of scope for a presentation-only pass, so left as-is and reported here rather than changed.

**Recommendation (not applied):** if you want these folded into the same shared component later, `SearchResultRow` would need an optional trailing slot (button vs. nothing) and `SearchResultList` would need a "cards with gaps" layout variant — worth a follow-up ticket, not a blocking inconsistency.

### 1.4 Different interaction shape — acceptable divergence

- **`ChartStep1Dataset`** (Chart → Dataset step): a required, single-pick "choose the one dataset for this chart" list, not an additive connect-search. Rows use the same icon box + text hierarchy but are individually bordered cards with `hover:border-primary/40 hover:bg-primary/5` rather than a single bordered list. This is a materially different interaction (mandatory single select, full-page list, no popover) — leaving it as its own shape is correct; forcing it into a small dropdown would be a regression.
- **Taxonomy pickers** (`SearchableSelect` — sector, domain, theme, geography, publication type, etc.): single-value combobox, a different UI class entirely (form select, not an entity-connect search). Not in scope.
- **`ManagementTable`** search: a keyword filter over a dashboard table, not an entity picker. Not in scope.

### 1.5 Regression check

- Resources: search, All/type filter chips, connecting, already-connected-hidden-from-search — unchanged (chip logic and candidate filtering untouched; only the presentational shell was extracted).
- Organisations: search, existing-org list, select-to-connect, Add New Organisation panel — unchanged.
- Speakers: search, org-affiliated-only filter (unchanged from the prior pass), name/org/role display, select-adds-as-speaker with `source: 'directory'` (non-editable), Add Speaker panel, newly-created speakers still editable — unchanged.
- Collaborative People/Org: search, combined people+org result set, select-to-connect, exclude-already-added — unchanged; only the row/list chrome changed.

---

## 2. Row action icons (Edit / Remove) — re-check

Re-verified against the standard set in the prior pass (icon-only `Pencil`/`Trash2`, `size="icon"`, `aria-label`, grouped in `flex items-center gap-1`, destructive hover on remove). No regressions found:

- No remaining text-labelled `Edit`/`Remove` buttons on connected-item cards.
- No remaining `X` icon used as a list-item "remove" affordance (dialog close, toast dismiss, chip/tag removal, and table clear-search still correctly use `X` — that's a different, correct usage: dismiss, not delete-from-list).

---

## 3. Summary

| Area | Result |
|---|---|
| Resources / Organisation / Contributor / Collaborative People search | ✅ one canonical component, one interaction pattern |
| Dataset-connect / Use-case-connect card pickers | Sibling pattern, consistent with each other and with the icon/text anatomy; container + selection affordance intentionally differ (connected items stay visible) |
| Chart dataset picker, taxonomy selects, table search | Different interaction classes by design — not inconsistencies |
| Edit/Remove row actions | ✅ consistent, no regressions |

**Files changed in this pass:** `src/components/collaborative/PeopleOrgSearchField.tsx` only (missed in the prior standardization; now on the shared component). No data, filtering, selection, or unrelated-flow changes.
