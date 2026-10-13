# Dataset creation flow — full context

How a contributor creates, edits and publishes a dataset in CivicDataSpace, and how that data reaches the public Dataset Detail page. Written from the current code on `main`; file paths are links into the repo.

## 1. What it is

A three-step wizard in the contributor module (**My Workspace → Datasets**, and **Organisation Workspace → Datasets**):

| Step | Label | Purpose |
|---|---|---|
| 1 | **Data Files** | Add the files that make up the dataset |
| 2 | **Metadata** | Describe it: name, classification, source & provenance, access and licence |
| 3 | **Review & Publish** | Check readiness, edit anything, publish |

One component owns the whole flow: [DatasetCreationFlow.tsx](../src/components/dataset/DatasetCreationFlow.tsx). It holds the working form state, the step, the save/publish logic and the leave-without-saving gate. The steps are plain presentational components that receive state and callbacks.

| Piece | File |
|---|---|
| Step 1 — Data Files | [Step2DataFiles.tsx](../src/components/dataset/Step2DataFiles.tsx) *(file name is historical)* |
| Step 2 — Metadata | [Step1Metadata.tsx](../src/components/dataset/Step1Metadata.tsx) *(file name is historical)* |
| Step 3 — Review & Publish | [Step3Review.tsx](../src/components/dataset/Step3Review.tsx) |
| Footer (Previous / Continue / Save) | [WizardFooter.tsx](../src/components/dataset/WizardFooter.tsx) |
| List of a contributor's datasets | [DatasetListView.tsx](../src/components/dataset/DatasetListView.tsx) |
| "Add New Dataset" type chooser | [DatasetTypeDialog.tsx](../src/components/dataset/DatasetTypeDialog.tsx) |
| Add / edit a source (drawer) | [SourceSheet.tsx](../src/components/dataset/SourceSheet.tsx) |
| Per-file details drawer | [FileDetailsSheet.tsx](../src/components/dataset/FileDetailsSheet.tsx) |
| Prompt-file details drawer | [PromptFileSideSheet.tsx](../src/components/dataset/PromptFileSideSheet.tsx) |
| Success modal after first publish | [PublishSuccessModal.tsx](../src/components/dataset/PublishSuccessModal.tsx) |

## 2. Entry points and routes

| Where | Route / host | Notes |
|---|---|---|
| My Workspace | `/dashboard/datasets` → [DatasetsPage.tsx](../src/pages/DatasetsPage.tsx) | Toggles between the list view and the creation flow (`variant="page"`) |
| Organisation Workspace | [OrganisationDatasetsPage.tsx](../src/pages/organisation/OrganisationDatasetsPage.tsx) | Same flow; passes `organisationId`, `organisationName` and `canCreateContent` |
| Public result | `/explore/datasets/:id` → [DatasetDetailPage.tsx](../src/pages/explore/DatasetDetailPage.tsx) | What consumers see |

How the page opens the flow ([DatasetsPage.tsx](../src/pages/DatasetsPage.tsx)):

- **Create Dataset** → opens the **type dialog** first; the flow starts at step 1 with the chosen type.
- The **Edit / Continue editing** action always opens at step 1. Clicking a row opens a draft at step 1 and a published dataset at step 3 (Review).
- Arriving with `location.state.datasetId` (for example after "View Dataset") opens that dataset directly.

`DatasetCreationFlow` also supports `variant="drawer"` (a right-side slide-over with a context label, a success panel and an `onCreated` callback) so other modules can create a dataset in place. **No screen currently mounts the drawer variant**; both live uses are the `page` variant.

## 3. Dataset types

Chosen once in the type dialog and **fixed after the draft exists** ("You can't change this after the draft is created"):

- **Dataset** — a standard dataset of structured or unstructured data.
- **Prompt Dataset** — prompts and prompt-response examples for AI training and evaluation. It adds a *Prompt Dataset Metadata* card in step 2, per-file prompt metadata in step 1, and extra publish checks. The type lives in `form.datasetType`; its taxonomies (task type, domain, target languages, target model types) are in [prompt-dataset.ts](../src/types/prompt-dataset.ts) and are deliberately separate from the standard Sector / Geography / Tags.

## 4. Data model

Defined in [dataset.ts](../src/types/dataset.ts).

```text
DatasetRecord                      what is stored per dataset
├── id, status ('draft'|'published'), updatedAt, downloadCount
├── form: DatasetFormState         the working copy (what the contributor edits)
├── publishedForm                  snapshot of the last published version (null if never published)
└── organisationId?, createdBy?    only for Organisation Workspace content

DatasetFormState
├── datasetType                    'dataset' | 'prompt_dataset'
├── metadata: DatasetMetadata
├── promptDatasetMetadata          always present; ignored unless the type is prompt_dataset
├── files: DatasetFile[]
└── resources: []                  vestigial — always [] for anything created today

DatasetMetadata
├── name, description              required
├── sector                         required
├── geography, tags                optional
├── sources?: DatasetSource[]      repeatable { id, name, websiteUrl }
├── sourceWebsite                  deprecated — see "Source & Provenance" below
├── createDate                     "Dataset creation date" (when the data was originally created)
├── accessType                     required: 'open' | 'restricted'
└── license                        required
```

`DatasetFile` carries the uploaded file's name, extension, size, an editable `title` and `description`, inferred `rowCount` / `columnCount` for CSV/TSV, the entry `source` (direct upload or an import platform) and, for prompt datasets, `promptFileMetadata`.

## 5. Step 1 — Data Files

Two ways to add files, switched by a segmented control in [Step2DataFiles.tsx](../src/components/dataset/Step2DataFiles.tsx):

1. **File Upload** — the standard dropzone ("Upload Dataset File"). Accepts `pdf, csv, xls, xlsx, txt` up to **500 MB** per file (`SUPPORTED_FILE_EXTENSIONS`, `MAX_FILE_SIZE_BYTES`). Files are validated in [file-validation.ts](../src/lib/file-validation.ts); rejected files list their reason under the dropzone. CSV/TSV files under 5 MB get row and column counts inferred in the browser; nothing is invented for other types.
2. **Public Platform** — pick Kaggle, GitHub or Hugging Face, paste the dataset URL (validated against the platform's host), then **Extract Dataset** to pull in its file list. In the prototype, extraction is a mock: `extractDatasetFromPlatform` in [platform-import.ts](../src/lib/platform-import.ts) simulates a delay and returns canned file listings. It is the single seam to replace with the real import service.

After upload, files appear in a list where the contributor can edit each file's **title** and **description**, replace it, remove it or preview it ([FileDetailsSheet.tsx](../src/components/dataset/FileDetailsSheet.tsx)). Titles default from the filename (`deriveDefaultResourceTitle`); descriptions default to a system sentence (`deriveFileDescription`). The **first file added to an unnamed dataset suggests the dataset name**.

For a **Prompt Dataset**, each file also needs prompt metadata (file name, prompt format, and for tabular files a description per field) configured in [PromptFileSideSheet.tsx](../src/components/dataset/PromptFileSideSheet.tsx). Each prompt file shows a status badge: *Ready*, *Metadata incomplete* or *Error*.

## 6. Step 2 — Metadata

Cards, in order ([Step1Metadata.tsx](../src/components/dataset/Step1Metadata.tsx)):

1. **Basic Information** — dataset name\*, description\*.
2. **Classification** — sector\*, geography, tags (press Enter to add).
3. **Prompt Dataset Metadata** — *Prompt Datasets only*: task type\*, domain\*, target languages\*, target model types\*.
4. **Source & Provenance** — repeatable sources plus the dataset creation date (below).
5. **Publishing Settings** — access type\* (Open / Restricted) and **licence\*** (the only place the licence is chosen; CC BY 4.0 is recommended for open government data).

\* required to publish.

### Source & Provenance

- The card header is the standard add-item pattern: title and description on the left, an outline **+ Add Source** button at the top right of the title. The button opens a right-hand drawer ([SourceSheet.tsx](../src/components/dataset/SourceSheet.tsx)) with **Source name** and **Source website URL**.
- Added sources are listed as compact rows with Edit and Remove icons; with none, the card shows "No sources added yet."
- Each field is optional on its own, but a source with **neither** a name nor a website cannot be saved. A website that is typed must be a valid `http(s)` URL; an empty one is never an error and never blocks a draft.
- Each source has a stable `id`. When a dataset is stored, `normaliseSources` ([dataset-sources.ts](../src/lib/dataset-sources.ts)) drops empty entries and trims values.
- The **Dataset creation date** field stays in this card (below the list). It is *when the data was originally created* and is unrelated to the **Created** date CivicDataSpace records automatically.
- The **licence** is not duplicated here. It is shown on Review and in the Dataset information grid of the public page.
- **Compatibility:** datasets saved before repeatable sources hold a single `sourceWebsite`; `getDatasetSources` turns it into one source entry on read. `sources`, once present, always wins. Dataset record URLs (the old `sourceRecordUrls`, and the `recordUrl` some saved entries still carry) are no longer part of a source: they are ignored on read and dropped the next time the dataset is saved.

## 7. Step 3 — Review & Publish

[Step3Review.tsx](../src/components/dataset/Step3Review.tsx) shows, each with a pencil that jumps back to the step that edits it:

- **Dataset type** badge.
- **Metadata** — name, description, sector, geography, tags.
- **Source & Provenance** — each source as a card (name, then its Website link), the licence and the dataset creation date.
- **Publishing Settings** — access type.
- **Uploaded Files** (or **Prompt files** for prompt datasets) with preview.
- For prompt datasets, the **Prompt Dataset metadata** card.
- Connected content when the dataset is already used elsewhere: charts and "Used in" items.
- A **Publish Readiness** checklist. Items: required dataset metadata complete; for prompt datasets also required prompt metadata complete, at least one prompt file added, and every prompt file's metadata ready. Each failing item has a **Fix** button that jumps to the right step.
- The publish button, with a notice when the dataset is already public ("changes you publish will replace the current public version immediately").

The stepper is a plain progress indicator until the contributor reaches Review with everything valid; from then on it stays clickable so completed steps can be revisited.

## 8. Saving, drafts and publishing

### Status vs edit state

- **Status** has exactly two values everywhere: `draft` (never published, not public) and `published` (public). See [content-status.ts](../src/lib/content-status.ts).
- **Edit state** ("Unsaved changes") is separate: the working copy differs from the last saved copy (`hasUnsavedEdits` compares JSON). It is an indicator, never a status.

### What each action does

| Action | Result |
|---|---|
| **Save as Draft** (never published) | Stores the working copy; status stays `draft`. Toast: "Dataset saved as Draft". |
| **Save Changes** (already published) | Stores the working copy; status stays `published` and the **live version is untouched**. Toast: "Your edits aren't published yet." |
| **Publish Dataset / Publish Changes** | Validates, asks for confirmation, then sets `published` and replaces `publishedForm` with the working copy — the **only** path that changes what the public sees. |
| Leave with unsaved changes | The shared leave dialog offers **Save**, **Discard** or **Cancel**. |
| **Unpublish** (list view) | Confirmation, then status returns to `draft`; the dataset leaves public view and can be re-published. |
| **Delete** (list view) | Confirmation (it names any connected events), then the record is removed. |

`resolveLifecycle` implements this: it never turns `published` into `draft` on a save and never auto-publishes.

### Validation

[validation.ts](../src/lib/validation.ts):

- Required to publish: name, description, sector, access type, licence — plus, for prompt datasets, the prompt metadata and every prompt file ready.
- Source links must be valid `http(s)` URLs **when provided**.
- Required-field errors only appear after the first failed publish attempt (which also jumps to step 2). Source link errors appear when the field is left.
- **Drafts are never blocked by validation.**

### "Autosave"

There is no background persistence. The header ([WorkspaceHeader.tsx](../src/components/dataset/WorkspaceHeader.tsx)) shows a brief "saving" state after each edit and, for an already-published dataset, an **Unsaved changes** indicator while the working copy differs from the last save. A dataset is stored only when the contributor presses Save or Publish (or chooses Save in the leave dialog).

### After publishing

First publish shows [PublishSuccessModal.tsx](../src/components/dataset/PublishSuccessModal.tsx) (create another / view workspace). Its DOI and API endpoint are **mock values** in the prototype. Republishing an already-live dataset only shows a toast.

## 9. Organisation Workspace

When launched from an Organisation Workspace, every save and publish stamps the record with `organisationId` (and `createdBy`). `canCreateContent` is false for roles that cannot create or edit (for example Auditor); the flow then shows a permission notice instead of the wizard.

## 10. Where the data goes

### Storage

`upsertDataset` in [AppDataContext.tsx](../src/context/AppDataContext.tsx) is the single write path: it normalises sources, runs `resolveLifecycle` and updates the `datasets` array.

> **Datasets are held in React state, seeded from `MOCK_DATASETS`, and are not persisted** — a page reload returns to the mock data. (Use cases, collaboratives, AI models, publications and organisation workspaces are persisted to `localStorage`; datasets are not.)

### The public Dataset Detail page

[DatasetDetailPage.tsx](../src/pages/explore/DatasetDetailPage.tsx) shows only `publishedForm` of a `published` record; otherwise "Dataset not found". Layout: Back and the dataset actions, the **Data DNA** summary card, then three tabs — **Data**, **Visualisations**, **Metadata** (the Metadata tab is the former Overview; its URL key is still `overview`).

Mapping from the form:

| Form field | Public location |
|---|---|
| name | Page title (Data DNA card) |
| description | "About this dataset" (Metadata tab); first sentence in the Data DNA story card |
| sector, geography, publisher, created / updated dates, access | **Dataset information** card |
| `sources` (or the migrated legacy fields) | **Source & Provenance** → Source(s): each source's name with its links; more than two collapse behind "View all N sources"; a dash when none |
| licence | **Source & Provenance** → Licence (linked to the licence terms for the standard licences) |
| tags | **Tags** row, linking to search |
| files | **Data** tab and Data DNA counts (files, formats, records, size) |
| prompt metadata | "Prompt Dataset details" card (prompt datasets only) |

[DatasetOverview.tsx](../src/components/dataset/consumer/DatasetOverview.tsx) renders the Metadata tab; [DatasetDataDNA.tsx](../src/components/dataset/consumer/DatasetDataDNA.tsx) renders the summary card from the model in [use-data-dna.ts](../src/components/dataset/consumer/data-dna/use-data-dna.ts).

## 11. UI conventions this flow follows

- **Adding an item** is a right-hand drawer opened by an outline `+ Add <Thing>` button at the top right of the card title, never inline fields (see the `ui/contributor-form-patterns` skill).
- **File uploads** use the single standard dropzone (`FileUploadField` / `DropzoneUploadField`).
- Closing any drawer with unsaved input asks for confirmation.
- Spec for both: the design system page and [design-system.md](../design-system.md).

## 12. Known gaps and prototype shortcuts

- Datasets are not persisted across reloads (section 10).
- Platform import (Kaggle / GitHub / Hugging Face) is mocked; so are the DOI and API endpoint in the publish success modal.
- No background autosave; only the indicator.
- `form.resources` and `DatasetResource` are vestigial; the Data Files step only produces `files`.
- A dataset's type cannot be changed after creation.
- The `drawer` variant of the flow is built but not mounted anywhere.
- Source Record is shown as a dash on the public page when a dataset has no sources, rather than hiding the field.
- The two step files keep swapped historical names (`Step2DataFiles` is step 1, `Step1Metadata` is step 2).
