interface RoutePattern {
  test: RegExp
  label: string
}

const ROUTE_LABELS: RoutePattern[] = [
  { test: /^\/$/, label: 'Dashboard' },
  { test: /^\/dashboard\/datasets$/, label: 'Datasets' },
  { test: /^\/dashboard\/datasets\/[^/]+\/preview$/, label: 'Datasets → Preview' },
  { test: /^\/dashboard\/use-cases$/, label: 'Use Cases' },
  { test: /^\/dashboard\/use-cases\/new/, label: 'Use Cases → Metadata' },
  { test: /^\/dashboard\/use-cases\/[^/]+\/preview$/, label: 'Use Cases → Preview' },
  { test: /^\/dashboard\/events$/, label: 'Events' },
  { test: /^\/dashboard\/events\/new/, label: 'Events → Create Event' },
  { test: /^\/dashboard\/profile$/, label: 'Profile' },
]

/** Base context label derived purely from the route. Pages with internal steps
 * (Dataset/Use Case/Event creation) refine this further via useHelpContext().setContextLabel. */
export function deriveContextLabel(pathname: string): string {
  return ROUTE_LABELS.find((route) => route.test.test(pathname))?.label ?? 'CivicDataSpace'
}
