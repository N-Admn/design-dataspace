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
import { ProfilePage } from '@/pages/ProfilePage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

function AppLayout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'
  const isUseCasePreview = /^\/dashboard\/use-cases\/[^/]+\/preview$/.test(location.pathname)
  const hideSidebar = isDashboard || isUseCasePreview
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
    <div className="min-h-screen">
      <TopNav />
      {!isUseCasePreview && <BreadcrumbBar />}

      <main
        className={cn(
          'mx-auto flex max-w-[1760px] flex-col gap-6 px-10 py-8',
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
