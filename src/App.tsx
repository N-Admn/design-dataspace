import { Navigate, Route, Routes } from 'react-router-dom'

import { TopNav } from '@/components/layout/TopNav'
import { BreadcrumbBar } from '@/components/layout/BreadcrumbBar'
import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { DatasetsPage } from '@/pages/DatasetsPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventCreationPage } from '@/pages/EventCreationPage'

function App() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <BreadcrumbBar />

      <main className="mx-auto flex max-w-[1760px] flex-col gap-6 px-10 py-8 md:flex-row">
        <ContributorSidebar />

        <div className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/datasets" replace />} />
            <Route path="/dashboard/datasets" element={<DatasetsPage />} />
            <Route path="/dashboard/events" element={<EventsPage />} />
            <Route path="/dashboard/events/new" element={<EventCreationPage />} />
            <Route path="*" element={<Navigate to="/dashboard/datasets" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
