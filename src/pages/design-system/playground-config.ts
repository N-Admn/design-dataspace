/** Content for the Responsive Playground — data only. Every `src` is an existing app route (or a design-system preview
 *  host for the two components that need an open overlay); nothing here is a placeholder. Responsive rules are not
 *  restated: `matrixRow` / `uses` point into `MATRIX` in ResponsiveBehaviourSection.tsx, the single source of truth. */

export const PLAYGROUND_VIEWPORTS = [
  { key: 'compact', label: 'Compact', width: 390 },
  { key: 'intermediate', label: 'Intermediate', width: 768 },
  { key: 'expanded', label: 'Expanded', width: 1280 },
] as const
export type PlaygroundViewport = (typeof PLAYGROUND_VIEWPORTS)[number]

export interface PlaygroundItem {
  id: string
  label: string
  description: string
  src: string
  /** Frame height in the compare-all layout (the single-viewport view adds extra height). */
  height: number
  /** Component mode: the `MATRIX` row that documents this component. */
  matrixRow?: string
  /** Page mode: `MATRIX` rows for the components this page is built from. */
  uses?: string[]
  /** Page mode: composition facts specific to this page that `MATRIX` does not cover. */
  notes?: { label: string; text: string }[]
}

/** Real routes that show each component in its real surroundings, or the preview host for open overlays. */
export const PLAYGROUND_COMPONENTS: PlaygroundItem[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'The global header: desktop dropdown navigation, and below 1024px the menu button and drawer.',
    src: '/search',
    height: 460,
    matrixRow: 'Navigation',
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    description: 'The contributor workspace sidebar beside the page content.',
    src: '/dashboard/profile',
    height: 560,
    matrixRow: 'Sidebar',
  },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Content cards in the search results list, from the shared ContentCard.',
    src: '/search?type=datasets',
    height: 640,
    matrixRow: 'Cards',
  },
  {
    id: 'forms',
    label: 'Forms',
    description: 'A real creation form (Event information) with its field grid.',
    src: '/dashboard/events/new',
    height: 640,
    matrixRow: 'Forms',
  },
  {
    id: 'stepper',
    label: 'Stepper',
    description: 'The creation flow’s progress stepper.',
    src: '/dashboard/events/new',
    height: 360,
    matrixRow: 'Stepper',
  },
  {
    id: 'tables',
    label: 'Tables',
    description: 'The management table with its toolbar and pagination.',
    src: '/dashboard/datasets',
    height: 640,
    matrixRow: 'Tables',
  },
  {
    id: 'dialogs',
    label: 'Dialogs',
    description: 'The shared centre Dialog, opened.',
    src: '/design-system/preview/dialog',
    height: 420,
    matrixRow: 'Dialogs',
  },
  {
    id: 'side-sheets',
    label: 'Side sheets',
    description: 'The shared right-drawer Dialog, opened.',
    src: '/design-system/preview/side-sheet',
    height: 520,
    matrixRow: 'Side sheets',
  },
  {
    id: 'filters',
    label: 'Filters',
    description: 'The results filter rail beside the listing.',
    src: '/search?type=datasets',
    height: 720,
    matrixRow: 'Filters',
  },
  {
    id: 'tabs',
    label: 'Tabs',
    description: 'The Overview / Data / Visualisations tab strip on a dataset page.',
    src: '/explore/datasets/ds-1',
    height: 560,
    matrixRow: 'Tabs',
  },
  {
    id: 'search',
    label: 'Search',
    description: 'The search field and content-type pills.',
    src: '/search?q=flood',
    height: 460,
    matrixRow: 'Search',
  },
]

/** Pages that exist as routes. Suggested pages without a route of their own are omitted (see the report):
 *  Dataset contribution (no route — the flow lives inside /dashboard/datasets). */
export const PLAYGROUND_PAGES: PlaygroundItem[] = [
  {
    id: 'landing',
    label: 'Landing page',
    description: 'The consumer landing page: search hero and the ecosystem cards.',
    src: '/discover',
    height: 760,
    uses: ['Navigation', 'Page layout', 'Search'],
    notes: [
      { label: 'Cards', text: 'One column below 768px, two columns from 768px, a 12-column bento from 1024px.' },
      {
        label: 'First viewport',
        text: 'From 1024px the hero and all five cards fit the first screen; below that the page scrolls.',
      },
    ],
  },
  {
    id: 'search',
    label: 'Search / Results',
    description: 'The unified Search page with results.',
    src: '/search?q=flood',
    height: 760,
    uses: ['Navigation', 'Page layout', 'Search', 'Filters', 'Cards'],
  },
  {
    id: 'dataset-listing',
    label: 'Dataset listing',
    description: 'Datasets are listed on the Search page’s Datasets tab.',
    src: '/search?type=datasets',
    height: 760,
    uses: ['Navigation', 'Page layout', 'Search', 'Filters', 'Cards'],
  },
  {
    id: 'dataset-detail',
    label: 'Dataset detail',
    description: 'A published dataset: header, tabs and overview.',
    src: '/explore/datasets/ds-1',
    height: 820,
    uses: ['Navigation', 'Page layout', 'Tabs'],
    notes: [
      { label: 'Header layout', text: 'Title and actions stack below 1024px and sit side by side from 1024px.' },
      {
        label: 'Metadata arrangement',
        text: 'Four metadata cards: one column below 640px, two columns from 640px, a single row from 1024px.',
      },
      {
        label: 'Overview content',
        text: 'The information grid is one column, then two (640px), three (1024px) and four (1280px).',
      },
      {
        label: 'Data table behaviour',
        text: 'The data preview scrolls inside its own bounded box; the page never scrolls sideways.',
      },
    ],
  },
  {
    id: 'collaboratives',
    label: 'Collaboratives',
    description: 'Collaboratives are listed on the Search page’s Collaboratives tab.',
    src: '/search?type=collaboratives',
    height: 760,
    uses: ['Navigation', 'Page layout', 'Search', 'Filters', 'Cards'],
  },
  {
    id: 'ai-models',
    label: 'AI Models',
    description: 'AI models are listed on the Search page’s AI Models tab.',
    src: '/search?type=ai-models',
    height: 760,
    uses: ['Navigation', 'Page layout', 'Search', 'Filters', 'Cards'],
  },
  {
    id: 'contributor-dashboard',
    label: 'Contributor dashboard',
    description: 'The signed-in contributor’s home.',
    src: '/',
    height: 760,
    uses: ['Navigation', 'Page layout'],
  },
  {
    id: 'use-case-contribution',
    label: 'Use Case contribution',
    description: 'The use case creation flow.',
    src: '/dashboard/use-cases/new',
    height: 760,
    uses: ['Navigation', 'Sidebar', 'Page layout', 'Stepper'],
  },
  {
    id: 'organisation-dashboard',
    label: 'Organisation dashboard',
    description: 'An organisation workspace dashboard.',
    src: '/organisations/org-workspace-1',
    height: 760,
    uses: ['Navigation', 'Sidebar', 'Page layout'],
  },
]
