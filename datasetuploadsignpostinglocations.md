# Dataset Upload Flow — Signposting/Guidance Locations

> **Note:** This analysis was done on a forked repo (`design-dataspace-ar`), fully up to date as of today (2026-09-03). It needs to be reconciled once against the main repo's file references before implementing, in case paths or line numbers have shifted.

Two flows exist: the main 3-step wizard and a condensed mini-wizard used inside Events. Both are covered below.

---

## Main flow — `src/components/dataset/DatasetCreationFlow.tsx`

Orchestrates 3 steps (line 29-33), routed at lines 282-328.

### Step 1: File Upload — `Step2DataFiles.tsx`

Two upload paths, toggled by tab:
- **Direct upload** (line 317-343): `DropzoneUploadField` at 323-330, has a format hint already ("Maximum file size limit: X")
- **Public platform import** (line 345-426): platform select (Kaggle/GitHub/HuggingFace), URL input with helper text
- **Uploaded files list** (line 428-481): inline-editable file rows, badges for size/type

**Where to add guidance:**
- Above the dropzone: what file types work best for what use case (CSV for tabular data others can chart, PDF for documents, etc.)
- Next to the platform import: what happens during "extraction" — set expectations
- On each file row: a hint that clicking the file opens details where you can add a description

### File Details side-sheet — `FileDetailsSheet.tsx`

- Title field (100-112), Description field (114-127) — already has helper text "Starts from a system-generated summary — edit it to add context"
- Read-only inferred fields (129-178): file type, size, row/column count, source

**Where to add guidance:**
- This is the best spot for per-file metadata coaching — e.g. "A good description mentions time range, units, and any known data quality caveats." Right now it just nudges you to edit, not how.

### Step 2: Metadata — `Step1Metadata.tsx`

Four sections:
- **Basic Information** (27-63): name, description — description placeholder already asks for purpose/time range/context
- **Classification** (65-115): sector (required), geography (optional), tags — tags already has a hint ("improve discoverability")
- **Source Information** (117-144): source website, creation date
- **Publishing Settings** (146-224): access type (radio cards, self-explanatory), license — already has one contextual hint (CC BY 4.0 recommended)

**Where to add guidance:**
- Sector/Geography selects have no helper text at all — worth adding one-liners on why these matter (discoverability, filtering)
- No guidance anywhere on *why* metadata quality matters or what "good" looks like — could add a small info panel at the top of this step
- License field only gives a hint once a valid license is picked; someone picking blind gets nothing

### Step 3: Review & Publish — `Step3Review.tsx`

- Metadata review (154-188), Publishing settings review (190-207), Files review (209-250)
- `PublicVisibilityNotice` (line 256) already warns about visibility
- Publish button disabled-state message (274-278)

**Where to add guidance:**
- This is a natural checkpoint for a "completeness" or "quality score" nudge — e.g. flagging if geography/tags are empty, even though they're optional, since they help discoverability

---

## Validation/messaging — centralized files

- `src/lib/validation.ts` — required-field error messages for the main flow
- `src/lib/file-validation.ts` — file-level errors (dedupe, extension, size) and auto-generated descriptions per file type
- `src/lib/generic-upload.ts` — size/format constants and hint-string builder used everywhere

These are the right place to make error messages more instructive rather than just "select X" (e.g. explaining *why* a field is required, not just that it's missing).

---

## Secondary flow — Event's "Add Dataset" mini-wizard

`src/components/event/DatasetCreationWizard.tsx` and its three sub-components (`DatasetResource.tsx`, `DatasetBasicDetails.tsx`, `DatasetLicenseAccess.tsx`). Same kind of fields, much thinner — almost no helper text anywhere. Its own validation lives in `src/lib/mini-dataset-validation.ts`, separate from the main flow's validation file.

One thing worth flagging: this mini flow duplicates the main flow's field set and validation logic in a separate file. If you add guidance/copy to the main flow, you'll want to mirror it here too, or the two flows will drift further apart.
