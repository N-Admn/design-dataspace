// Shared fixed viewport-relative height for the sidebar and main workspace
// card, so both fill the screen below the header/breadcrumb and stay the
// same height regardless of how much content either one holds.
// 188px = 88px header + 36px breadcrumb + 32px top page padding + 32px bottom page padding.
export const WORKSPACE_HEIGHT_CLASS = 'md:h-[calc(100vh-188px)]'
