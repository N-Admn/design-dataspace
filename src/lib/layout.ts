// Shared fixed viewport-relative height for the sidebar and main workspace
// card, so both fill the screen below the header/breadcrumb and stay the
// same height regardless of how much content either one holds.
// 188px = 88px header + 36px breadcrumb + 32px top page padding + 32px bottom page padding.
export const WORKSPACE_HEIGHT_CLASS = 'md:h-[calc(100vh-188px)]'

// Same viewport-relative cap as WORKSPACE_HEIGHT_CLASS, but as a max-height
// instead of a fixed height — used by ManagementTable so a table with fewer
// rows than fit on screen isn't stretched to fill leftover space, while a
// table with more rows than fit still caps at this height and scrolls its
// row group internally rather than overflowing on short screens.
export const WORKSPACE_MAX_HEIGHT_CLASS = 'md:max-h-[calc(100vh-188px)]'
