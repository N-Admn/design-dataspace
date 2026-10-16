import type * as React from 'react'

/** Every page of the design system site: where it sits in the sidebar, what it says about itself, and how to load it. Order here is
 *  the order in the sidebar and the previous / next links. A page is loaded only when it is opened. */

export type DocGroupId = 'start' | 'foundations' | 'responsive' | 'components' | 'patterns' | 'reference'

export const DOC_GROUPS: { id: DocGroupId; label: string }[] = [
  { id: 'start', label: 'Getting started' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'responsive', label: 'Responsive' },
  { id: 'components', label: 'Components' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'reference', label: 'Reference' },
]

export interface DocPageDef {
  slug: string
  title: string
  group: DocGroupId
  description: string
  /** Where the code lives, shown under the title. */
  source?: string[]
  load: () => Promise<{ default: React.ComponentType }>
}

const page = <K extends string>(
  slug: string,
  title: string,
  group: DocGroupId,
  description: string,
  load: () => Promise<Record<K, React.ComponentType>>,
  name: K,
  source?: string[],
): DocPageDef => ({ slug, title, group, description, source, load: () => load().then((m) => ({ default: m[name] })) })

const foundations = () => import('@/pages/design-system/docs/FoundationPages')
const controls = () => import('@/pages/design-system/docs/ControlPages')
const overlays = () => import('@/pages/design-system/docs/OverlayPages')
const layout = () => import('@/pages/design-system/docs/LayoutPages')
const community = () => import('@/pages/design-system/docs/CommunityPages')
const misc = () => import('@/pages/design-system/docs/MiscPages')

export const DOC_PAGES: DocPageDef[] = [
  page('introduction', 'Introduction', 'start', 'A live reference for the values, components and patterns CivicDataSpace is built from.', foundations, 'IntroductionPage'),

  page('colors', 'Colors', 'foundations', 'Semantic colour pairs, neutrals, the chart palette and the app-chrome surfaces, read live from the tokens.', foundations, 'ColorsPage', ['src/generated/tokens.css']),
  page('typography', 'Typography', 'foundations', 'Named type roles and the two font families.', foundations, 'TypographyPage', ['src/index.css']),
  page('border-radius', 'Border radius', 'foundations', 'A proportional radius scale derived from one base value.', foundations, 'BorderRadiusPage'),
  page('shadows', 'Shadows', 'foundations', 'Three elevation steps and where each is used.', foundations, 'ShadowsPage'),
  page('spacing', 'Spacing', 'foundations', 'The Tailwind spacing scale on a 4px base.', foundations, 'SpacingPage'),
  page('icons', 'Icons', 'foundations', 'lucide-react is the only icon set.', foundations, 'IconsPage'),
  page('semantic-states', 'Semantic states', 'foundations', 'The token each application state resolves to, and where it shows.', foundations, 'SemanticStatesPage'),
  page('breakpoints', 'Breakpoints', 'foundations', 'The five Tailwind breakpoints and what changes at each.', foundations, 'BreakpointsPage', ['src/hooks/use-breakpoint.ts']),

  page('responsive-behaviour', 'Responsive behaviour', 'responsive', 'How components adapt across breakpoints, shown with the real prototype.', misc, 'ResponsiveBehaviourPage'),
  page('responsive-playground', 'Responsive playground', 'responsive', 'Compare live components and pages at different viewport widths.', misc, 'ResponsivePlaygroundPage'),

  page('badge', 'Badge', 'components', 'A non-interactive label for a status or type, plus the shared StatusBadge.', controls, 'BadgePage', ['src/components/ui/badge.tsx', 'src/components/shared/StatusBadge.tsx']),
  page('button', 'Button', 'components', 'Triggers an action. Seven variants and four sizes, all token-driven.', controls, 'ButtonPage', ['src/components/ui/button.tsx']),
  page('card', 'Card', 'components', 'A bordered container with header, content and footer slots.', layout, 'CardPage', ['src/components/ui/card.tsx']),
  page('circle-arrow', 'Circle arrow', 'components', 'The decorative arrow affordance on dashboard cards.', layout, 'CircleArrowPage', ['src/components/shared/CircleArrow.tsx']),
  page('confirm-dialog', 'Confirm dialog', 'components', 'One promise-based gate for every confirmation.', overlays, 'ConfirmDialogPage', ['src/components/ui/confirm-dialog.tsx']),
  page('content-card', 'Content card', 'components', 'The single card for every content type: grid and list layouts and every state.', layout, 'ContentCardPage', ['src/components/discover/ContentCard.tsx', 'src/components/discover/SearchResultCard.tsx', 'src/lib/content-card.ts']),
  page('dialog', 'Dialog', 'components', 'One Radix dialog pattern with three placements.', overlays, 'DialogPage', ['src/components/ui/dialog.tsx']),
  page('empty-state', 'Empty state', 'components', 'The “nothing here yet” block.', layout, 'EmptyStatePage', ['src/components/shared/EmptyState.tsx']),
  page('form-controls', 'Form controls', 'components', 'Input, textarea, checkbox, radio group and field error.', controls, 'FormControlsPage', ['src/components/ui/input.tsx', 'src/components/ui/textarea.tsx', 'src/components/ui/checkbox.tsx']),
  page('leave-dialog', 'Leave dialog', 'components', 'The unsaved-changes gate for creation and edit flows.', overlays, 'LeaveDialogPage', ['src/components/shared/LeaveCreationDialog.tsx']),
  page('popover', 'Popover', 'components', 'A small floating panel anchored to its trigger.', overlays, 'PopoverPage', ['src/components/ui/popover.tsx']),
  page('preview-action-bar', 'Preview action bar', 'components', 'The sticky bar at the top of every full-preview page.', layout, 'PreviewActionBarPage', ['src/components/shared/PreviewActionBar.tsx']),
  page('review-publish-panel', 'Review publish panel', 'components', 'The call-to-action panel that ends the review step.', layout, 'ReviewPublishPanelPage', ['src/components/shared/ReviewPublishPanel.tsx']),
  page('review-section', 'Review section', 'components', 'A collapsible section for the review step.', layout, 'ReviewSectionPage', ['src/components/shared/ReviewSection.tsx']),
  page('rich-text-editor', 'Rich text editor', 'components', 'A contentEditable field with a fixed toolbar.', controls, 'RichTextEditorPage', ['src/components/ui/rich-text-editor.tsx']),
  page('selects', 'Selects and pickers', 'components', 'SearchableSelect, MultiSelect and MultiSelectFilter share one dropdown pattern.', controls, 'SelectsPage', ['src/components/ui/searchable-select.tsx', 'src/components/ui/multi-select.tsx', 'src/components/ui/multi-select-filter.tsx']),
  page('stepper', 'Stepper', 'components', 'Progress through a multi-step flow, then navigation once review is reached.', layout, 'StepperPage', ['src/components/ui/stepper.tsx']),
  page('tag', 'Tag', 'components', 'A clickable pill, the interactive counterpart of Badge.', controls, 'TagPage', ['src/components/ui/tag.tsx']),
  page('tag-input', 'Tag input', 'components', 'Free-text tokens committed with Enter.', controls, 'TagInputPage', ['src/components/ui/tag-input.tsx']),
  page('toast', 'Toast', 'components', 'A short, auto-dismissing message.', overlays, 'ToastPage', ['src/components/ui/toast.tsx']),
  page('tooltip', 'Tooltip', 'components', 'A short label on hover or focus.', overlays, 'TooltipPage', ['src/components/ui/tooltip.tsx']),
  page('truncated-text', 'Truncated text', 'components', 'A single-line clip that explains itself only when cut off.', layout, 'TruncatedTextPage', ['src/components/shared/TruncatedText.tsx']),
  page('upload-fields', 'Upload fields', 'components', 'The one standard dropzone for every file upload.', controls, 'UploadFieldsPage', ['src/components/shared/DropzoneUploadField.tsx', 'src/components/shared/FileUploadField.tsx']),

  page('directory-card', 'Directory card', 'patterns', 'The Search-style card for organisations and individual publishers, in grid and list layouts.', community, 'DirectoryCardPage', ['src/components/community/DirectoryParts.tsx']),
  page('directory-controls', 'Directory filters and toolbar', 'patterns', 'The filter rail, sort and view controls, pagination and empty state of the Community page.', community, 'DirectoryControlsPage', ['src/components/community/DirectoryParts.tsx', 'src/hooks/use-directory-params.ts']),
  page('profile-parts', 'Profile page parts', 'patterns', 'The identity block and contribution list shared by organisation and individual profiles.', community, 'ProfilePartsPage', ['src/components/community/ProfileParts.tsx', 'src/lib/community.ts']),

  page('reference-only', 'Components needing app data', 'reference', 'Components that read live app data and are not mounted here.', misc, 'ReferenceOnlyPage'),
]

export const DOCS_HOME = 'introduction'
export const docPath = (slug: string) => `/design-system/${slug}`
