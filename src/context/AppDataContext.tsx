import * as React from 'react'

import { formatTimestamp } from '@/lib/format'
import { resolveLifecycle } from '@/lib/content-status'
import { MOCK_DATASETS } from '@/lib/mock-datasets'
import { MOCK_EVENTS } from '@/lib/mock-events'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import { MOCK_USE_CASE_RECORDS } from '@/lib/mock-usecases'
import { MOCK_COLLABORATIVE_RECORDS } from '@/lib/mock-collaboratives'
import { MOCK_AI_MODEL_RECORDS } from '@/lib/mock-ai-models'
import { MOCK_CHART_RECORDS } from '@/lib/mock-charts'
import type { DatasetFormState, DatasetRecord, DatasetStatus } from '@/types/dataset'
import type { EventFormState, EventRecord, EventStatus, Organisation } from '@/types/event'
import { MOCK_PROFILE, type ContributorProfile } from '@/types/profile'
import type { UseCaseFormState, UseCaseRecord, UseCaseStatus } from '@/types/usecase'
import type { CollaborativeFormState, CollaborativeRecord, CollaborativeStatus } from '@/types/collaborative'
import type { AIModelFormState, AIModelRecord, AIModelStatus } from '@/types/ai-model'
import type { ChartFormState, ChartRecord, ChartStatus } from '@/types/chart'

/** Migrate any records persisted before the lifecycle was simplified to two
 * statuses: a legacy 'pending' record always had a live published version, so it
 * becomes 'published' (its working copy in `form` still reads as unsaved changes). */
function normalizeStoredRecords<T extends { status: string }>(records: T[]): T[] {
  return records.map((r) => ((r.status as string) === 'pending' ? { ...r, status: 'published' } : r))
}

let datasetIdCounter = 0
let eventIdCounter = 0
let orgIdCounter = 0
let useCaseIdCounter = 0
let collaborativeIdCounter = 0
let aiModelIdCounter = 0
let chartIdCounter = 0

/** Use cases are persisted to localStorage (and synced across tabs) so a Use Case
 * previewed/published from a separate preview tab is reflected back in the
 * original editor tab without a page reload. */
const USE_CASES_STORAGE_KEY = 'civicdataspace:usecases'

function loadStoredUseCases(): UseCaseRecord[] | null {
  try {
    const raw = window.localStorage.getItem(USE_CASES_STORAGE_KEY)
    return raw ? normalizeStoredRecords(JSON.parse(raw) as UseCaseRecord[]) : null
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

/** Collaboratives follow the same cross-tab persistence pattern as Use Cases —
 * their preview/publish also happens from a separate window.open() tab. */
const COLLABORATIVES_STORAGE_KEY = 'civicdataspace:collaboratives'

function loadStoredCollaboratives(): CollaborativeRecord[] | null {
  try {
    const raw = window.localStorage.getItem(COLLABORATIVES_STORAGE_KEY)
    return raw ? normalizeStoredRecords(JSON.parse(raw) as CollaborativeRecord[]) : null
  } catch {
    return null
  }
}

function bumpCollaborativeIdCounter(records: CollaborativeRecord[]) {
  for (const record of records) {
    const match = /^collaborative-(\d+)$/.exec(record.id)
    if (match) collaborativeIdCounter = Math.max(collaborativeIdCounter, Number(match[1]))
  }
}

/** AI Models follow the same cross-tab persistence pattern as Use Cases and
 * Collaboratives — their preview/publish also happens from a separate window.open() tab. */
const AI_MODELS_STORAGE_KEY = 'civicdataspace:ai-models'

function loadStoredAIModels(): AIModelRecord[] | null {
  try {
    const raw = window.localStorage.getItem(AI_MODELS_STORAGE_KEY)
    return raw ? normalizeStoredRecords(JSON.parse(raw) as AIModelRecord[]) : null
  } catch {
    return null
  }
}

function bumpAIModelIdCounter(records: AIModelRecord[]) {
  for (const record of records) {
    const match = /^ai-model-(\d+)$/.exec(record.id)
    if (match) aiModelIdCounter = Math.max(aiModelIdCounter, Number(match[1]))
  }
}

interface AppDataContextValue {
  datasets: DatasetRecord[]
  upsertDataset: (id: string | null, status: DatasetStatus, form: DatasetFormState) => string
  unpublishDataset: (id: string) => void
  deleteDataset: (id: string) => void

  events: EventRecord[]
  upsertEvent: (id: string | null, status: EventStatus, form: EventFormState) => string
  unpublishEvent: (id: string) => void
  deleteEvent: (id: string) => void

  organisations: Organisation[]
  addOrganisation: (org: Omit<Organisation, 'id'>) => Organisation

  useCases: UseCaseRecord[]
  upsertUseCase: (id: string | null, status: UseCaseStatus, form: UseCaseFormState) => string
  unpublishUseCase: (id: string) => void
  deleteUseCase: (id: string) => void

  collaboratives: CollaborativeRecord[]
  upsertCollaborative: (id: string | null, status: CollaborativeStatus, form: CollaborativeFormState) => string
  unpublishCollaborative: (id: string) => void
  deleteCollaborative: (id: string) => void

  aiModels: AIModelRecord[]
  upsertAIModel: (id: string | null, status: AIModelStatus, form: AIModelFormState) => string
  unpublishAIModel: (id: string) => void
  deleteAIModel: (id: string) => void

  charts: ChartRecord[]
  upsertChart: (id: string | null, status: ChartStatus, form: ChartFormState) => string
  unpublishChart: (id: string) => void
  deleteChart: (id: string) => void

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
  const [collaboratives, setCollaboratives] = React.useState<CollaborativeRecord[]>(() => {
    const stored = loadStoredCollaboratives()
    const initial = stored ?? MOCK_COLLABORATIVE_RECORDS
    bumpCollaborativeIdCounter(initial)
    return initial
  })
  const [aiModels, setAIModels] = React.useState<AIModelRecord[]>(() => {
    const stored = loadStoredAIModels()
    const initial = stored ?? MOCK_AI_MODEL_RECORDS
    bumpAIModelIdCounter(initial)
    return initial
  })
  const [charts, setCharts] = React.useState<ChartRecord[]>(MOCK_CHART_RECORDS)
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

  React.useEffect(() => {
    try {
      window.localStorage.setItem(COLLABORATIVES_STORAGE_KEY, JSON.stringify(collaboratives))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [collaboratives])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COLLABORATIVES_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as CollaborativeRecord[]
        bumpCollaborativeIdCounter(next)
        setCollaboratives(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(AI_MODELS_STORAGE_KEY, JSON.stringify(aiModels))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [aiModels])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AI_MODELS_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as AIModelRecord[]
        bumpAIModelIdCounter(next)
        setAIModels(next)
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
        const existing = prev.find((d) => d.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((d) => (d.id === recordId ? { ...d, status: nextStatus, updatedAt, form, publishedForm } : d))
        }
        return [{ id: recordId, status: nextStatus, updatedAt, form, publishedForm }, ...prev]
      })
      return recordId
    },
    [],
  )

  const unpublishDataset = React.useCallback((id: string) => {
    const updatedAt = formatTimestamp(new Date())
    setDatasets((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'draft', updatedAt } : d)))
  }, [])

  const deleteDataset = React.useCallback((id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const upsertEvent = React.useCallback(
    (id: string | null, status: EventStatus, form: EventFormState) => {
      const timestamp = formatTimestamp(new Date())
      const recordId = id ?? `event-${(eventIdCounter += 1)}`
      setEvents((prev) => {
        const existing = prev.find((e) => e.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((e) =>
            e.id === recordId ? { ...e, status: nextStatus, updatedAt: timestamp, form, publishedForm } : e,
          )
        }
        return [{ id: recordId, status: nextStatus, createdAt: timestamp, updatedAt: timestamp, form, publishedForm }, ...prev]
      })
      return recordId
    },
    [],
  )

  const unpublishEvent = React.useCallback((id: string) => {
    const timestamp = formatTimestamp(new Date())
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'draft', updatedAt: timestamp } : e)))
  }, [])

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
        const existing = prev.find((u) => u.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((u) => (u.id === recordId ? { ...u, status: nextStatus, updatedAt, form, publishedForm } : u))
        }
        return [{ id: recordId, status: nextStatus, updatedAt, form, publishedForm }, ...prev]
      })
      return recordId
    },
    [],
  )

  const unpublishUseCase = React.useCallback((id: string) => {
    const updatedAt = formatTimestamp(new Date())
    setUseCases((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'draft', updatedAt } : u)))
  }, [])

  const deleteUseCase = React.useCallback((id: string) => {
    setUseCases((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const upsertCollaborative = React.useCallback(
    (id: string | null, status: CollaborativeStatus, form: CollaborativeFormState) => {
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `collaborative-${(collaborativeIdCounter += 1)}`
      setCollaboratives((prev) => {
        const existing = prev.find((c) => c.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((c) => (c.id === recordId ? { ...c, status: nextStatus, updatedAt, form, publishedForm } : c))
        }
        return [{ id: recordId, status: nextStatus, updatedAt, form, publishedForm }, ...prev]
      })
      return recordId
    },
    [],
  )

  const unpublishCollaborative = React.useCallback((id: string) => {
    const updatedAt = formatTimestamp(new Date())
    setCollaboratives((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'draft', updatedAt } : c)))
  }, [])

  const deleteCollaborative = React.useCallback((id: string) => {
    setCollaboratives((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const upsertAIModel = React.useCallback(
    (id: string | null, status: AIModelStatus, form: AIModelFormState) => {
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `ai-model-${(aiModelIdCounter += 1)}`
      setAIModels((prev) => {
        const existing = prev.find((m) => m.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((m) => (m.id === recordId ? { ...m, status: nextStatus, updatedAt, form, publishedForm } : m))
        }
        return [{ id: recordId, status: nextStatus, updatedAt, form, publishedForm }, ...prev]
      })
      return recordId
    },
    [],
  )

  const unpublishAIModel = React.useCallback((id: string) => {
    const updatedAt = formatTimestamp(new Date())
    setAIModels((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'draft', updatedAt } : m)))
  }, [])

  const deleteAIModel = React.useCallback((id: string) => {
    setAIModels((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const upsertChart = React.useCallback((id: string | null, status: ChartStatus, form: ChartFormState) => {
    const updatedAt = formatTimestamp(new Date())
    const recordId = id ?? `chart-${(chartIdCounter += 1)}`
    setCharts((prev) => {
      const existing = prev.find((c) => c.id === recordId)
      const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
      if (existing) {
        return prev.map((c) => (c.id === recordId ? { ...c, status: nextStatus, updatedAt, form, publishedForm } : c))
      }
      return [{ id: recordId, status: nextStatus, updatedAt, form, publishedForm }, ...prev]
    })
    return recordId
  }, [])

  const unpublishChart = React.useCallback((id: string) => {
    const updatedAt = formatTimestamp(new Date())
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'draft', updatedAt } : c)))
  }, [])

  const deleteChart = React.useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      datasets,
      upsertDataset,
      unpublishDataset,
      deleteDataset,
      events,
      upsertEvent,
      unpublishEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      unpublishUseCase,
      deleteUseCase,
      collaboratives,
      upsertCollaborative,
      unpublishCollaborative,
      deleteCollaborative,
      aiModels,
      upsertAIModel,
      unpublishAIModel,
      deleteAIModel,
      charts,
      upsertChart,
      unpublishChart,
      deleteChart,
      profile,
      updateProfile: setProfile,
    }),
    [
      datasets,
      upsertDataset,
      unpublishDataset,
      deleteDataset,
      events,
      upsertEvent,
      unpublishEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      unpublishUseCase,
      deleteUseCase,
      collaboratives,
      upsertCollaborative,
      unpublishCollaborative,
      deleteCollaborative,
      aiModels,
      upsertAIModel,
      unpublishAIModel,
      deleteAIModel,
      charts,
      upsertChart,
      unpublishChart,
      deleteChart,
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
