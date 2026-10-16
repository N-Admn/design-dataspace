# Design system site

The visual design system at `/design-system`: a docs site with a grouped sidebar, one page per topic, an "On this page" list and
previous / next links. Everything on it renders from the real tokens (`src/generated/tokens.css`) and the real components, so it cannot
drift from the app.

## Adding or changing a page

1. Write the page as a component that returns `DocSection`s (the headings feed "On this page"). Use the helpers in `primitives.tsx`:
   - `ComponentPreview`: a live example with a Preview / Code tab. Pass the example's code as a string.
   - `PropsTable`, `ReferenceTable`: the API and reference tables.
   - `Callout`, `DoDont` / `Example`: guidance.
2. Export it from the file that groups its topic (`FoundationPages`, `ControlPages`, `OverlayPages`, `LayoutPages`, `CommunityPages`,
   `MiscPages`), or add a new file.
3. Register it in `registry.ts`: slug, title, group, one-sentence description, and the source files it documents. Registry order is the
   sidebar order and the previous / next order. Pages are loaded on demand.

When a component is added or its API changes, update its page in the same change. A new component needs a page before it is used in
more than one place.

`design-system.md` is generated from `tokens.json` by `npm run gen:tokens`; don't edit it by hand.
