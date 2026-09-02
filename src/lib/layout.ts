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
