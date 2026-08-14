import * as React from 'react'

import { formatTimestamp } from '@/lib/format'
import { MOCK_DATASETS } from '@/lib/mock-datasets'
import { MOCK_EVENTS } from '@/lib/mock-events'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import { MOCK_USE_CASE_RECORDS } from '@/lib/mock-usecases'
import type { DatasetFormState, DatasetRecord, DatasetStatus } from '@/types/dataset'
import type { EventFormState, EventRecord, EventStatus, Organisation } from '@/types/event'
import { MOCK_PROFILE, type ContributorProfile } from '@/types/profile'
import type { UseCaseFormState, UseCaseRecord, UseCaseStatus } from '@/types/usecase'

let datasetIdCounter = 0
let eventIdCounter = 0
let orgIdCounter = 0
let useCaseIdCounter = 0

/** Use cases are persisted to localStorage (and synced across tabs) so a Use Case
 * previewed/published from a separate preview tab is reflected back in the
 * original editor tab without a page reload. */
const USE_CASES_STORAGE_KEY = 'civicdataspace:usecases'

function loadStoredUseCases(): UseCaseRecord[] | null {
  try {
    const raw = window.localStorage.getItem(USE_CASES_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UseCaseRecord[]) : null
  } catch {
    return null
  }
}

function bumpUseCaseIdCounter(records: UseCaseRecord[]) {
  for (const record of records) {
    const match = /^usecase-(\d+)$/.exec(record.id)
    if (match) useCaseIdCounter = Math.max(useCaseIdCounter, Number(match[1]))
  }
}

interface AppDataContextValue {
  datasets: DatasetRecord[]
  upsertDataset: (id: string | null, status: DatasetStatus, form: DatasetFormState) => string
  deleteDataset: (id: string) => void

  events: EventRecord[]
  upsertEvent: (id: string | null, status: EventStatus, form: EventFormState) => string
  deleteEvent: (id: string) => void

  organisations: Organisation[]
  addOrganisation: (org: Omit<Organisation, 'id'>) => Organisation

  useCases: UseCaseRecord[]
  upsertUseCase: (id: string | null, status: UseCaseStatus, form: UseCaseFormState) => string
  deleteUseCase: (id: string) => void

  profile: ContributorProfile
  updateProfile: (profile: ContributorProfile) => void
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = React.useState<DatasetRecord[]>(MOCK_DATASETS)
  const [events, setEvents] = React.useState<EventRecord[]>(MOCK_EVENTS)
  const [organisations, setOrganisations] = React.useState<Organisation[]>(MOCK_ORGANISATIONS)
  const [useCases, setUseCases] = React.useState<UseCaseRecord[]>(() => {
    const stored = loadStoredUseCases()
    const initial = stored ?? MOCK_USE_CASE_RECORDS
    bumpUseCaseIdCounter(initial)
    return initial
  })
  const [profile, setProfile] = React.useState<ContributorProfile>(MOCK_PROFILE)

  React.useEffect(() => {
    try {
      window.localStorage.setItem(USE_CASES_STORAGE_KEY, JSON.stringify(useCases))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [useCases])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== USE_CASES_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as UseCaseRecord[]
        bumpUseCaseIdCounter(next)
        setUseCases(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const upsertDataset = React.useCallback(
    (id: string | null, status: DatasetStatus, form: DatasetFormState) => {
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `dataset-${(datasetIdCounter += 1)}`
      setDatasets((prev) => {
        const exists = prev.some((d) => d.id === recordId)
        if (exists) {
          return prev.map((d) => (d.id === recordId ? { ...d, status, updatedAt, form } : d))
        }
        return [{ id: recordId, status, updatedAt, form }, ...prev]
      })
      return recordId
    },
    [],
  )

  const deleteDataset = React.useCallback((id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const upsertEvent = React.useCallback(
    (id: string | null, status: EventStatus, form: EventFormState) => {
      const timestamp = formatTimestamp(new Date())
      const recordId = id ?? `event-${(eventIdCounter += 1)}`
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === recordId)
        if (exists) {
          return prev.map((e) =>
            e.id === recordId ? { ...e, status, updatedAt: timestamp, form } : e,
          )
        }
        return [{ id: recordId, status, createdAt: timestamp, updatedAt: timestamp, form }, ...prev]
      })
      return recordId
    },
    [],
  )

  const deleteEvent = React.useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addOrganisation = React.useCallback((org: Omit<Organisation, 'id'>) => {
    orgIdCounter += 1
    const newOrg: Organisation = { ...org, id: `org-local-${orgIdCounter}` }
    setOrganisations((prev) => [...prev, newOrg])
    return newOrg
  }, [])

  const upsertUseCase = React.useCallback(
    (id: string | null, status: UseCaseStatus, form: UseCaseFormState) => {
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `usecase-${(useCaseIdCounter += 1)}`
      setUseCases((prev) => {
        const exists = prev.some((u) => u.id === recordId)
        if (exists) {
          return prev.map((u) => (u.id === recordId ? { ...u, status, updatedAt, form } : u))
        }
        return [{ id: recordId, status, updatedAt, form }, ...prev]
      })
      return recordId
    },
    [],
  )

  const deleteUseCase = React.useCallback((id: string) => {
    setUseCases((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      datasets,
      upsertDataset,
      deleteDataset,
      events,
      upsertEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      deleteUseCase,
      profile,
      updateProfile: setProfile,
    }),
    [
      datasets,
      upsertDataset,
      deleteDataset,
      events,
      upsertEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      deleteUseCase,
      profile,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export { AppDataProvider, useAppData }
