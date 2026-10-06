/** Vertical space consumed by fixed app chrome above the workspace area:
 *  88px TopNav (`h-[88px]`) + 36px breadcrumb + 64px page padding (`py-8` ×2).
 *
 *  The px value is defined once as `--layout-chrome-offset` in src/index.css.
 *  The sidebar, the management table and the dashboard all reference that single
 *  variable here instead of repeating a `calc(100vh-188px)` magic number.
 *  Written as full literal class strings (no interpolation) so Tailwind's
 *  content scanner still generates each utility. */

// Fixed height for the sidebar and the management-table card so both fill the
// screen below the header/breadcrumb and stay aligned top-to-bottom regardless of
// content — including empty / filtered-empty / search-empty tables. A taller table
// still caps here and scrolls its rows internally.
export const WORKSPACE_HEIGHT_CLASS = 'md:h-[calc(100vh-var(--layout-chrome-offset))]'

// Same budget as a min-height — used by the dashboard so short viewports let the
// page grow taller (and scroll) instead of compressing the workspace cards.
export const DASHBOARD_MIN_HEIGHT_CLASS = 'md:min-h-[calc(100vh-var(--layout-chrome-offset))]'

// Horizontal page gutter shared by every full-width band of the shell (header, breadcrumb strip, main, footer) so
// their left/right edges always line up: 16px <768, 24px 768–1023, 32px 1024–1279, 40px ≥1280.
export const PAGE_GUTTER_X = 'px-4 md:px-6 lg:px-8 xl:px-10'

// Form field grids: single column below 1200px, two columns from 1200px (Responsive Behaviour → Forms). 1200px is a
// documented form threshold written with Tailwind's arbitrary `min-[1200px]` variant — not a new named breakpoint.
export const FORM_TWO_COL_GRID = 'grid grid-cols-1 min-[1200px]:grid-cols-2'
export const FORM_COL_SPAN_2 = 'min-[1200px]:col-span-2'
