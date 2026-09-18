# Prompt Dataset Flow — Audit Report

**Date:** 2026-09-17
**Branch:** `dataset-module-prompt-dataset`
**Scope:** End-to-end verification of the Prompt Dataset feature added to the Dataset Module (type selection → metadata → file upload → prompt file side sheet → review/publish → dashboard listing), plus a regression check on the existing standard Dataset flow.

## Method

1. Static checks: `tsc -b` (typecheck), `oxlint` (lint), `vite build` (build).
2. Scripted browser verification (Playwright + the project's cached Chromium build) driving the real dev server at `localhost:5183` — not a re-read of the code, actual clicks/fills/uploads against the rendered app.
3. Visual inspection of the resulting screenshots for each step.

Two rounds were run: an initial round covering the primary Prompt Dataset creation path (Add Dataset → type dialog → upload → side sheet → metadata → review), and a follow-up round targeting parts the first pass didn't reach: standard-dataset non-regression, the upload-method-switch restriction, leaving with unsaved changes, the dashboard type column/badge, and editing an already-published Prompt Dataset (file replace).

## Result

**Static checks:** all pass — 0 typecheck errors, 0 lint findings, build succeeds.

**Functional checks:** 14 of 14 scenarios passed after one fix (see Finding 1). No console/page errors were observed in either browser session.

| # | Scenario | Result |
|---|---|---|
| 1 | Datasets dashboard loads | ✅ |
| 2 | "Add Dataset" opens type-selection dialog with a distinct Prompt Dataset option | ✅ |
| 3 | Selecting Prompt Dataset + Continue opens the creation flow | ✅ |
| 4 | Uploading a CSV auto-detects field names (`instruction`, `input`, `output`) and shows a "Metadata incomplete" badge | ✅ |
| 5 | Prompt File Details side sheet shows name, associated file, format, flags, and File Fields (names read-only, descriptions editable) | ✅ |
| 6 | Filling in Prompt Format flips the file's badge from Incomplete → Ready | ✅ |
| 7 | Prompt Dataset Metadata section (Task Type / Domain / Target Languages / Target Model Types) appears on the Metadata step, standard fields untouched | ✅ |
| 8 | Review step shows Prompt Dataset Metadata review, Prompt Files review, and a Publish Readiness checklist | ✅ |
| 9 | Readiness checklist and Publish button correctly **block** publish when a field description is still missing (verified via a deliberately incomplete test case) | ✅ |
| 10 | Standard Dataset flow shows no Prompt Dataset UI (Data Files step, Metadata step) | ✅ |
| 11 | Switching upload method (File Upload ↔ Public Platform) with existing files shows the "Change upload method?" confirmation with the correct directional message | ✅ |
| 12 | Cancelling the switch keeps the current method and files | ✅ |
| 13 | "Clear Files and Switch" clears files and switches method without discarding the draft | ✅ |
| 14 | Leaving the editor with unsaved changes prompts before discarding | ✅ |
| 15 | Dashboard list shows the "Dataset Type" column/badge for existing records | ✅ |
| 16 | Opening a **published** Prompt Dataset's file and replacing it updates File Fields to the new schema, preserves the description for a field whose name is unchanged, and warns which fields need re-review | ✅ (after fix) |

## Findings

### Finding 1 — Fixed: File Description went stale after "Change file" (medium severity)

**Symptom:** In `PromptFileSideSheet`, replacing a prompt file's underlying file (via "Change file") correctly updated the file row, the field list, and the toast — but the **File Description** textarea kept showing the *old* file's system-generated description (e.g. "CSV data file with 3,200 rows and 3 columns") instead of the new file's (e.g. "CSV data file with 1 rows and 4 columns"), until the side sheet was closed and reopened.

**Root cause:** The sheet's draft-sync `useEffect` re-ran only on `file?.id` changing:

```ts
}, [file?.id])
```

A file replace intentionally keeps the same `id` (so it stays "the same prompt file"), so the effect never re-ran and the description draft was never refreshed from the new file's system-generated text.

**Fix applied:** [`src/components/dataset/PromptFileSideSheet.tsx`](src/components/dataset/PromptFileSideSheet.tsx) — added `file?.name` to the effect's dependency array. `name` is the physical uploaded file's own name, which the type definition documents as "never edited by the contributor," so it only changes on a genuine replace, never on ordinary field/description edits — meaning this fix doesn't reintroduce the original hazard of the draft resetting mid-typing.

```ts
}, [file?.id, file?.name])
```

**Verified:** re-ran the same file-replace scenario after the fix — the description now correctly reads "1 rows and 4 columns" immediately, no reopen needed.

### Finding 2 — Fixed: Invalid `sector` value in the demo Prompt Dataset mock record (low severity)

**Symptom:** The seeded demo record ("Civic Grievance Redressal Instruction Prompts") rendered **Sector: —** on its Review page and in the dashboard, even though the mock data set a sector.

**Root cause:** [`src/lib/mock-datasets.ts`](src/lib/mock-datasets.ts) set `sector: 'governance'`, but `'governance'` is not one of the standard Dataset's `SECTOR_OPTIONS` values (`agriculture`, `education`, `energy`, `environment`, `finance`, `health`, `housing`, `transportation`, `urban-development`, `water-sanitation`). `governance` *is* a valid option in the separate `PROMPT_DOMAIN_OPTIONS` list (used correctly for `promptDatasetMetadata.domain`), which is likely how the two got conflated while writing the seed data.

**Fix applied:** changed the mock record's `sector` to `'urban-development'`, the closest existing standard-dataset sector, since the task explicitly says not to invent new Sector taxonomy values.

**Note:** this was a bug in newly-added demo/mock data, not in the feature's logic — but it's exactly the kind of thing worth flagging, since a mismatched enum value silently degrades to "—" instead of failing loudly, and the same mistake could occur in real contributor data entry if `sector` and `domain` option lists are ever presented inconsistently.

## Regression check

Standard Dataset creation, metadata, and file upload were re-verified against the modified `Step1Metadata` and `Step2DataFiles` components and show no Prompt-Dataset UI leakage; the upload-method-switch restriction and confirmation dialog behave identically for standard datasets (verified directly, since `Step2DataFiles` is shared between both types).

## Out of scope / not covered by this pass

- Automated accessibility testing (keyboard-only navigation, screen-reader announcements) — the scripted check used pointer clicks; a manual keyboard/screen-reader pass is still recommended before shipping (Section 19 of the original spec).
- Public-platform import path for Prompt Datasets was exercised only for the upload-method-switch confirmation, not for a full "extract → schema unavailable" walkthrough.
- No real backend exists in this repo, so no server-side validation was or could be verified.

## Conclusion

The Prompt Dataset flow works as specified end-to-end, including the trickier interactions (upload-method restriction with confirm-and-clear, publish gating on incomplete field descriptions, and file replacement against a published dataset). Two issues were found during this audit and both are now fixed in the working tree: the stale File Description after file-replace, and an invalid mock `sector` value. Typecheck, lint, and build all pass after the fixes.
