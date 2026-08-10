# CDL DataSpace — Contributor "Create New Dataset" Flow

A functional prototype of the CivicDataSpace contributor-side dataset creation flow, built with React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui-style components on top of the tokens defined in [design-system.md](design-system.md).

## Features

- **My Datasets** list — table of published/draft datasets with status tabs (All / Published / Draft), pagination, and view/edit/delete row actions
- **3-step wizard** — Metadata → Data Files → Review & Publish, with inline validation, drag-and-drop file upload (type/size/duplicate checks), tag input, searchable dropdowns, and a read-only review/publish step
- Draft saving, autosave indicator, and state persistence across steps

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
```
