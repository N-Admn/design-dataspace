# Documentation

The platform documentation at `/documentation`: a guide and a reference, one route per article (`/documentation/:slug`), with a left
navigation, search, and an "On this page" list. It is separate from the design system site at `/design-system`.

## Where things live

- `content/`: the articles, as plain data (`types.ts` describes the shape). `getting-started.ts`, `platform-reference.ts` and
  `contributing.ts` hold the three groups; `index.ts` lists them in sidebar order and builds the search.
- `components/`: `Visuals.tsx` (screenshots, recordings, placeholders and concept diagrams), `ArticleBlocks.tsx` (renders content blocks
  and the step-by-step walkthrough), `DocSearch.tsx`, `Navigation.tsx` (sidebar, table of contents, related and previous / next).
- `DocumentationLayout.tsx`: the page layout for the home and every article.

## Adding or changing an article

Edit its data in `content/`. Add a new article to the group file and it appears in the sidebar, search, breadcrumbs and previous / next
automatically; give it a line in `HOME_SUMMARY` in `content/index.ts` for the home page.

## Screenshots and recordings

Every picture is a `media` visual. Without a `src` it renders a labelled placeholder that says what to capture and what to annotate.
To replace one, put the file under `src/assets/documentation/`, import it, and set `src` (and `callouts`, as numbered points in percent of
the image) on that visual: the layout does not change. Recordings use `media: 'video'` and need a caption and a text alternative in `alt`.
Do not add a picture that is not a real capture of the interface.

## Accuracy

Wording describes what the prototype does today (for example, editing a published record keeps the live version and holds the edits as a
working copy; it does not require unpublishing first). When the product changes, change the article in the same change.
