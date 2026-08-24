import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { TopNav } from '@/components/layout/TopNav'
import { BreadcrumbBar } from '@/components/layout/BreadcrumbBar'
import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { Footer } from '@/components/layout/Footer'
import { HelpButton } from '@/components/layout/HelpButton'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmProvider } from '@/components/ui/confirm-dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HelpProvider } from '@/context/HelpContext'
import { cn } from '@/lib/utils'
import { DashboardPage } from '@/pages/DashboardPage'
import { DatasetsPage } from '@/pages/DatasetsPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventCreationPage } from '@/pages/EventCreationPage'
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
import { ProfilePage } from '@/pages/ProfilePage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

function AppLayout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'
  const isUseCasePreview = /^\/dashboard\/use-cases\/[^/]+\/preview$/.test(location.pathname)
  const isCollaborativePreview = /^\/dashboard\/collaboratives\/[^/]+\/preview$/.test(location.pathname)
  const isAIModelPreview = /^\/dashboard\/ai-models\/[^/]+\/preview$/.test(location.pathname)
  const hideSidebar = isDashboard || isUseCasePreview || isCollaborativePreview || isAIModelPreview
  const isAuthRoute = location.pathname.startsWith('/auth/')

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
    <div className="flex min-h-screen flex-col">
      <TopNav />
      {!isUseCasePreview && !isCollaborativePreview && !isAIModelPreview && <BreadcrumbBar />}

      <main
        className={cn(
          'mx-auto flex w-full max-w-[1760px] flex-1 flex-col gap-6 px-10 py-8',
          !hideSidebar && 'md:flex-row',
        )}
      >
        {!hideSidebar && <ContributorSidebar />}

        <div className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard/datasets" element={<DatasetsPage />} />
            <Route path="/dashboard/events" element={<EventsPage />} />
            <Route path="/dashboard/events/new" element={<EventCreationPage />} />
            <Route path="/dashboard/use-cases" element={<UseCasesPage />} />
            <Route path="/dashboard/use-cases/new" element={<UseCaseCreationPage />} />
            <Route path="/dashboard/use-cases/:id/preview" element={<UseCasePreviewPage />} />
            <Route path="/dashboard/collaboratives" element={<CollaborativesPage />} />
            <Route path="/dashboard/collaboratives/new" element={<CollaborativeCreationPage />} />
            <Route path="/dashboard/collaboratives/:id/preview" element={<CollaborativePreviewPage />} />
            <Route path="/dashboard/ai-models" element={<AIModelsPage />} />
            <Route path="/dashboard/ai-models/new" element={<AIModelCreationPage />} />
            <Route path="/dashboard/ai-models/:id/preview" element={<AIModelPreviewPage />} />
            <Route path="/dashboard/charts" element={<ChartsPage />} />
            <Route path="/dashboard/charts/new" element={<ChartCreationPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard/datasets" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />

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
            <AppLayout />
          </HelpProvider>
        </ConfirmProvider>
      </ToastProvider>
    </TooltipProvider>
  )
}

export default App
