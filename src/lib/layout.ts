// Shared fixed viewport-relative height for the sidebar and main workspace
// card, so both fill the screen below the header/breadcrumb and stay the
// same height regardless of how much content either one holds.
// 188px = 88px header + 36px breadcrumb + 32px top page padding + 32px bottom page padding.
export const WORKSPACE_HEIGHT_CLASS = 'md:h-[calc(100vh-188px)]'

// Same viewport-relative cap as WORKSPACE_HEIGHT_CLASS, but as a max-height
// instead of a fixed height — for cards whose content shouldn't be stretched
// to fill leftover space (e.g. a table with fewer rows than fit on screen),
// while still scrolling internally rather than overflowing on short screens.
export const WORKSPACE_MAX_HEIGHT_CLASS = 'md:max-h-[calc(100vh-188px)]'

// Same viewport-relative measurement again, but as a minimum height — for cards
// whose content has its own fixed, non-scrolling size requirement (e.g. a table
// that must show a fixed number of complete rows) and should still visually
// reach the same bottom edge as the sidebar when that content is shorter than
// the available space, without ever shrinking below what the content needs.
export const WORKSPACE_MIN_HEIGHT_CLASS = 'md:min-h-[calc(100vh-188px)]'

// Standard row height (px) for every data-management table across the app
// (Datasets, Events, and any future module list), so rows read as the same
// size everywhere regardless of how many rows a given table happens to show.
export const TABLE_ROW_HEIGHT_PX = 61
