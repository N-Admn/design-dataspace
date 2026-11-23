import * as React from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'

import { TopNav } from '@/components/layout/TopNav'
import { BreadcrumbBar } from '@/components/layout/BreadcrumbBar'
import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { OrganisationSidebar } from '@/components/layout/OrganisationSidebar'
import { ManagementRouteGuard } from '@/components/organisation/ManagementRouteGuard'
import { InviteLinkPage } from '@/pages/InviteLinkPage'
import { OrganisationAccessGuard } from '@/components/organisation/OrganisationAccessGuard'
import { Footer } from '@/components/layout/Footer'
import { HelpButton } from '@/components/layout/HelpButton'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmProvider } from '@/components/ui/confirm-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HelpProvider } from '@/context/HelpContext'
import { NotificationsProvider } from '@/context/NotificationsContext'
import { RequestActionsProvider } from '@/components/notifications/RequestActions'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { MyContributionsPage } from '@/pages/MyContributionsPage'
import { CollaborativeItemsPage } from '@/pages/CollaborativeItemsPage'
import { PersonalDashboardPage } from '@/pages/PersonalDashboardPage'
import { AuthProvider, SIGN_IN_PATH, isProviderPath, useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { PAGE_GUTTER_X } from '@/lib/layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { DatasetsPage } from '@/pages/DatasetsPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventCreationPage } from '@/pages/EventCreationPage'
import { EventPreviewPage } from '@/pages/EventPreviewPage'
import { UseCasesPage } from '@/pages/UseCasesPage'
import { UseCaseCreationPage } from '@/pages/UseCaseCreationPage'
import { UseCasePreviewPage } from '@/pages/UseCasePreviewPage'
import { CollaborativesPage } from '@/pages/CollaborativesPage'
import { CollaborativeCreationPage } from '@/pages/CollaborativeCreationPage'
import { CollaborativePreviewPage } from '@/pages/CollaborativePreviewPage'
import { AIModelsPage } from '@/pages/AIModelsPage'
import { AIModelCreationPage } from '@/pages/AIModelCreationPage'
import { AIModelPreviewPage } from '@/pages/AIModelPreviewPage'
import { ChartsPage } from '@/pages/ChartsPage'
import { ChartCreationPage } from '@/pages/ChartCreationPage'
import { PublicationsPage } from '@/pages/PublicationsPage'
import { PublicationCreationPage } from '@/pages/PublicationCreationPage'
import { PublicationPreviewPage } from '@/pages/PublicationPreviewPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { OrganisationsPage } from '@/pages/OrganisationsPage'
import { OrganisationDashboardPage } from '@/pages/organisation/OrganisationDashboardPage'
import { OrganisationDatasetsPage } from '@/pages/organisation/OrganisationDatasetsPage'
import { OrganisationPublicationsPage } from '@/pages/organisation/OrganisationPublicationsPage'
import { OrganisationUseCasesPage } from '@/pages/organisation/OrganisationUseCasesPage'
import { OrganisationAIModelsPage } from '@/pages/organisation/OrganisationAIModelsPage'
import { OrganisationCollaborativesPage } from '@/pages/organisation/OrganisationCollaborativesPage'
import { OrganisationChartsPage } from '@/pages/organisation/OrganisationChartsPage'
import { OrganisationEventsPage } from '@/pages/organisation/OrganisationEventsPage'
import { OrganisationMembersPage } from '@/pages/organisation/OrganisationMembersPage'
import { OrganisationProfilePage } from '@/pages/organisation/OrganisationProfilePage'
import { DocsIndexRedirect, DocsLayout } from '@/pages/design-system/docs/DocsLayout'
import { DocumentationLayout } from '@/pages/documentation/DocumentationLayout'
import { DatasetHeaderPlayground } from '@/pages/playground/DatasetHeaderPlayground'
import { CollaborativeDetailPlayground } from '@/pages/playground/collaborative-detail/CollaborativeDetailPlayground'
import { CommunityProfilePlayground } from '@/pages/playground/community-profile/CommunityProfilePlayground'
import { PublicationDetailPlayground } from '@/pages/playground/publication-detail/PublicationDetailPlayground'
import { UseCaseDetailPlayground } from '@/pages/playground/use-case-detail/UseCaseDetailPlayground'
import { PlaygroundHubPage } from '@/pages/playground/PlaygroundHubPage'
import { PlaygroundPlaceholderPage } from '@/pages/playground/PlaygroundPlaceholderPage'
import { PlaygroundPreviewPage } from '@/pages/design-system/PlaygroundPreviewPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'
import { CommunityPage } from '@/pages/community/CommunityPage'
import { AboutPage } from '@/pages/AboutPage'
import { PublicOrganisationProfilePage } from '@/pages/community/PublicOrganisationProfilePage'
import { PublisherProfilePage } from '@/pages/community/PublisherProfilePage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { SearchResultsPage } from '@/pages/SearchResultsPage'
import { UseCasesExplorePage } from '@/pages/explore/UseCasesExplorePage'
import { UseCaseDetailPage } from '@/pages/explore/UseCaseDetailPage'
import { PublicationDetailPage } from '@/pages/explore/PublicationDetailPage'
import { DatasetDetailPage } from '@/pages/explore/DatasetDetailPage'
import { CollaborativeDetailPage } from '@/pages/explore/CollaborativeDetailPage'
import { EventDetailPage } from '@/pages/explore/EventDetailPage'
import { AIModelDetailPage } from '@/pages/explore/AIModelDetailPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

/** Measure the actual fixed-chrome height (top nav + breadcrumb + the main
 *  element's vertical padding) and publish it as `--layout-chrome-offset`, so
 *  workspace/table heights stay correct when the chrome grows at narrow widths
 *  or under text-resize. Falls back to the 188px static value in index.css. */
/** `/dashboard/following?tab=…` (the old Following & Access page) opens the matching card on the dashboard. */
function FollowingRedirect() {
  const [params] = useSearchParams()
  const tab = params.get('tab')
  const panel = tab === 'contributions' || tab === 'managing' || tab === 'access' ? tab : 'following'
  return <Navigate to={`/dashboard?panel=${panel}`} replace />
}

/** `/dashboard/notifications[?…]` (notifications inside the workspace) opens the standalone page with the same query. */
function NotificationsRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/notifications${search}`} replace />
}

function useChromeOffset(routeKey: string) {
  React.useLayoutEffect(() => {
    const root = document.documentElement
    const header = document.querySelector('header[data-chrome="dark"]')
    const crumb = document.querySelector('[data-slot="breadcrumb"]')
    const sync = () => {
      // The main element's own vertical padding (it is smaller in the compact layout).
      const main = document.querySelector('main')
      const mainPad = main ? parseFloat(getComputedStyle(main).paddingTop) + parseFloat(getComputedStyle(main).paddingBottom) : 64
      const px = ((header as HTMLElement | null)?.offsetHeight ?? 88) + ((crumb as HTMLElement | null)?.offsetHeight ?? 0) + mainPad
      root.style.setProperty('--layout-chrome-offset', `${px}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    if (header) ro.observe(header)
    if (crumb) ro.observe(crumb)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
    // Re-query when the route changes (the breadcrumb is conditionally rendered).
  }, [routeKey])
}

function AppLayout() {
  const location = useLocation()
  const { isSignedIn, justSignedOut } = useAuth()
  useChromeOffset(location.pathname)
  const isDashboard = location.pathname === '/'
  const isUseCasePreview = /^\/dashboard\/use-cases\/[^/]+\/preview$/.test(location.pathname)
  const isCollaborativePreview = /^\/dashboard\/collaboratives\/[^/]+\/preview$/.test(location.pathname)
  const isAIModelPreview = /^\/dashboard\/ai-models\/[^/]+\/preview$/.test(location.pathname)
  const isEventPreview = /^\/dashboard\/events\/[^/]+\/preview$/.test(location.pathname)
  const isPublicationPreview = /^\/dashboard\/publications\/[^/]+\/preview$/.test(location.pathname)
  // The design system is a docs site: /design-system opens its first page and /design-system/<page> each topic.
  const isDesignSystem = location.pathname === '/design-system' || location.pathname.startsWith('/design-system/')
  // Documentation is the same kind of docs layout: its own sidebar against the left edge, its own padding.
  const isDocumentation = location.pathname === '/documentation' || location.pathname.startsWith('/documentation/')
  // The Playground Hub and every playground under /playground share the consumer chrome.
  const isPlayground = location.pathname === '/playground' || location.pathname.startsWith('/playground/')
  const isConsumerRoute =
    location.pathname.startsWith('/explore/') ||
    // The invitation link page is public, on the consumer chrome.
    location.pathname.startsWith('/invite/') ||
    location.pathname === '/collaboratives' ||
    location.pathname === '/forum' ||
    location.pathname === '/community' ||
    location.pathname === '/publishers' ||
    location.pathname.startsWith('/publishers/') ||
    location.pathname === '/about' ||
    isDocumentation ||
    location.pathname === '/contact' ||
    location.pathname === '/discover' ||
    isPlayground ||
    location.pathname === '/search'
  // The standalone Notifications page reads like the search results: on the white canvas, filters on the left.
  const isNotifications = location.pathname === '/notifications'
  const isOrganisationSelector = location.pathname === '/organisations'
  const organisationWorkspaceMatch = /^\/organisations\/([^/]+)/.exec(location.pathname)
  const organisationWorkspaceId = organisationWorkspaceMatch?.[1]
  const hideSidebar =
    isDashboard ||
    isNotifications ||
    isUseCasePreview ||
    isCollaborativePreview ||
    isAIModelPreview ||
    isEventPreview ||
    isPublicationPreview ||
    isDesignSystem ||
    isConsumerRoute ||
    isOrganisationSelector
  const isAuthRoute = location.pathname.startsWith('/auth/')
  // Chrome-less host for the /design-system Responsive Playground's overlay previews (open Dialog / side sheet).
  const isPlaygroundPreview = location.pathname.startsWith('/design-system/preview/')

  // The provider side (workspace, dashboard, organisation workspaces) is for signed-in people only. Anyone else is sent to
  // sign in and brought back to the page they asked for; the bare root, which is the workspace, goes to the home page instead.
  if (isProviderPath(location.pathname) && !isSignedIn) {
    return location.pathname === '/' || justSignedOut ? (
      <Navigate to="/discover" replace />
    ) : (
      <Navigate to={SIGN_IN_PATH} replace state={{ from: `${location.pathname}${location.search}` }} />
    )
  }

  // The Collaborative Detail Page playground is a full-page prototype with its own header, so it has no app chrome.
  const isCollaborativeDetailPlayground = location.pathname === '/playground/collaborative-detail'
  if (isCollaborativeDetailPlayground) {
    return (
      <Routes>
        <Route path="/playground/collaborative-detail" element={<CollaborativeDetailPlayground />} />
      </Routes>
    )
  }

  // The Community profile playground is a full-page prototype with its own toolbar, so it has no app chrome either.
  if (location.pathname === '/playground/community-profile') {
    return (
      <Routes>
        <Route path="/playground/community-profile" element={<CommunityProfilePlayground />} />
      </Routes>
    )
  }

  if (isPlaygroundPreview) {
    return (
      <Routes>
        <Route path="/design-system/preview/:component" element={<PlaygroundPreviewPage />} />
      </Routes>
    )
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    )
  }

  return (
    <div className={cn('flex min-h-screen flex-col', (isConsumerRoute || isNotifications) && 'bg-background')}>
      <TopNav />
      {!isUseCasePreview &&
        !isCollaborativePreview &&
        !isAIModelPreview &&
        !isEventPreview &&
        !isPublicationPreview &&
        !isPlayground && <BreadcrumbBar />}

      <main
        className={cn(
          'mx-auto flex w-full flex-1 flex-col',
          // The design-system page is a docs layout: its sidebar sits flush against the left edge and it handles its own
          // content padding, so it opts out of the shared page gutter, vertical padding and max width.
          isDesignSystem || isDocumentation ? 'max-w-none' : cn('max-w-[1760px] gap-6 py-[var(--page-pad-y)]', PAGE_GUTTER_X),
          !hideSidebar && 'md:flex-row',
          // Consumer-facing pages (Explore, Search, Discover, Collaboratives,
          // Forum) sit on a white canvas rather than the app's default grey
          // `body` background — `flex-1` means this always fills the space
          // below the header down to the footer, even when a page's own
          // content is shorter than the viewport.
          (isConsumerRoute || isNotifications) && 'bg-background',
        )}
      >
        {!hideSidebar && organisationWorkspaceId && (
          <OrganisationSidebar organisationId={organisationWorkspaceId} className="order-1" />
        )}
        {!hideSidebar && !organisationWorkspaceId && <ContributorSidebar className="order-1" />}

        <div className="order-2 min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            {/* Editors and previews are management screens: only an Admin or Editor of the content's organisation gets in. */}
            <Route element={<ManagementRouteGuard />}>
              <Route path="/dashboard/datasets" element={<DatasetsPage />} />
              <Route path="/dashboard/events" element={<EventsPage />} />
              <Route path="/dashboard/events/new" element={<EventCreationPage />} />
              <Route path="/dashboard/events/:id/preview" element={<EventPreviewPage />} />
              <Route path="/dashboard/use-cases" element={<UseCasesPage />} />
              <Route path="/dashboard/use-cases/new" element={<UseCaseCreationPage />} />
              <Route path="/dashboard/use-cases/:id/preview" element={<UseCasePreviewPage />} />
              <Route path="/dashboard/collaboratives" element={<CollaborativesPage />} />
              <Route path="/dashboard/collaboratives/new" element={<CollaborativeCreationPage />} />
              <Route path="/dashboard/collaboratives/:id/items" element={<CollaborativeItemsPage />} />
              <Route path="/dashboard/collaboratives/:id/preview" element={<CollaborativePreviewPage />} />
              <Route path="/dashboard/ai-models" element={<AIModelsPage />} />
              <Route path="/dashboard/ai-models/new" element={<AIModelCreationPage />} />
              <Route path="/dashboard/ai-models/:id/preview" element={<AIModelPreviewPage />} />
              <Route path="/dashboard/charts" element={<ChartsPage />} />
              <Route path="/dashboard/charts/new" element={<ChartCreationPage />} />
              <Route path="/dashboard/publications" element={<PublicationsPage />} />
              <Route path="/dashboard/publications/new" element={<PublicationCreationPage />} />
              <Route path="/dashboard/publications/:id/preview" element={<PublicationPreviewPage />} />
            </Route>
            <Route path="/dashboard" element={<PersonalDashboardPage />} />
            <Route path="/dashboard/contributions" element={<MyContributionsPage />} />
            {/* Following & Access now lives on the dashboard; old links and tabs still arrive. */}
            <Route path="/dashboard/following" element={<FollowingRedirect />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* Notifications used to sit inside the personal workspace; old links and bookmarks still arrive. */}
            <Route path="/dashboard/notifications" element={<NotificationsRedirect />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/organisations" element={<OrganisationsPage />} />
            {/* Every organisation workspace route goes through one access guard: an Evaluator reaches only their assigned, published content. */}
            <Route element={<OrganisationAccessGuard />}>
              <Route path="/organisations/:organisationId" element={<OrganisationDashboardPage />} />
              <Route path="/organisations/:organisationId/datasets" element={<OrganisationDatasetsPage />} />
              <Route path="/organisations/:organisationId/publications" element={<OrganisationPublicationsPage />} />
              <Route path="/organisations/:organisationId/use-cases" element={<OrganisationUseCasesPage />} />
              <Route path="/organisations/:organisationId/ai-models" element={<OrganisationAIModelsPage />} />
              <Route path="/organisations/:organisationId/collaboratives" element={<OrganisationCollaborativesPage />} />
              <Route path="/organisations/:organisationId/charts" element={<OrganisationChartsPage />} />
              <Route path="/organisations/:organisationId/events" element={<OrganisationEventsPage />} />
              <Route path="/organisations/:organisationId/members" element={<OrganisationMembersPage />} />
              <Route path="/organisations/:organisationId/profile" element={<OrganisationProfilePage />} />
            </Route>
            <Route path="/invite/:token" element={<InviteLinkPage />} />
            <Route path="/documentation" element={<DocumentationLayout />} />
            <Route path="/documentation/:slug" element={<DocumentationLayout />} />
            <Route path="/design-system" element={<DocsIndexRedirect />} />
            <Route path="/design-system/:slug" element={<DocsLayout />} />
            <Route path="/playground" element={<PlaygroundHubPage />} />
            <Route path="/playground/dataset-header" element={<DatasetHeaderPlayground />} />
            <Route path="/playground/publication-detail" element={<PublicationDetailPlayground />} />
            <Route path="/playground/use-case-detail" element={<UseCaseDetailPlayground />} />
            <Route path="/playground/:playgroundId" element={<PlaygroundPlaceholderPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            {/* Each content type is listed in Search; the old list URLs open its tab there. */}
            <Route path="/explore/datasets" element={<Navigate to="/search?type=datasets" replace />} />
            <Route path="/explore/datasets/:id" element={<DatasetDetailPage />} />
            <Route path="/explore/collaboratives/:id" element={<CollaborativeDetailPage />} />
            <Route path="/explore/use-cases" element={<UseCasesExplorePage />} />
            <Route path="/explore/use-cases/:id" element={<UseCaseDetailPage />} />
            <Route path="/explore/ai-models" element={<Navigate to="/search?type=ai-models" replace />} />
            <Route path="/explore/ai-models/:id" element={<AIModelDetailPage />} />
            <Route path="/explore/publications" element={<Navigate to="/search?type=publications" replace />} />
            <Route path="/explore/publications/:id" element={<PublicationDetailPage />} />
            <Route path="/explore/events" element={<Navigate to="/search?type=events" replace />} />
            <Route path="/explore/events/:id" element={<EventDetailPage />} />
            <Route path="/collaboratives" element={<Navigate to="/search?type=collaboratives" replace />} />
            <Route path="/forum" element={<ComingSoonPage title="Forum" />} />
            {/* One Community page with All / Organisations / Publishers tabs; the older URLs open the matching tab. */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/publishers" element={<Navigate to="/community?tab=people" replace />} />
            <Route path="/publishers/:personId" element={<PublisherProfilePage />} />
            {/* The public Organisations directory and profiles sit under /explore: /organisations is the contributor's own
                "My Organisations" workspace area. */}
            <Route path="/explore/organisations" element={<Navigate to="/community?tab=organisations" replace />} />
            <Route path="/explore/organisations/:organisationId" element={<PublicOrganisationProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ComingSoonPage title="Contact Us" />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Routes>
        </div>
      </main>

      <Footer className={isConsumerRoute ? 'bg-background' : undefined} />

      {isDashboard && <HelpButton />}
    </div>
  )
}

function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <ConfirmProvider>
          <HelpProvider>
            <AuthProvider>
              <NotificationsProvider>
                <RequestActionsProvider>
                  <AppLayout />
                </RequestActionsProvider>
              </NotificationsProvider>
            </AuthProvider>
          </HelpProvider>
        </ConfirmProvider>
      </ToastProvider>
    </TooltipProvider>
  )
}

export default App
