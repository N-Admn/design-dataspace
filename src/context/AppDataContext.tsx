import * as React from 'react'

import { formatTimestamp } from '@/lib/format'
import { MOCK_DATASETS } from '@/lib/mock-datasets'
import { MOCK_EVENTS } from '@/lib/mock-events'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import type { DatasetFormState, DatasetRecord, DatasetStatus } from '@/types/dataset'
import type { EventFormState, EventRecord, EventStatus, Organisation } from '@/types/event'

let datasetIdCounter = 0
let eventIdCounter = 0
let orgIdCounter = 0

interface AppDataContextValue {
  datasets: DatasetRecord[]
  upsertDataset: (id: string | null, status: DatasetStatus, form: DatasetFormState) => string
  deleteDataset: (id: string) => void

  events: EventRecord[]
  upsertEvent: (id: string | null, status: EventStatus, form: EventFormState) => string
  deleteEvent: (id: string) => void

  organisations: Organisation[]
  addOrganisation: (org: Omit<Organisation, 'id'>) => Organisation
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = React.useState<DatasetRecord[]>(MOCK_DATASETS)
  const [events, setEvents] = React.useState<EventRecord[]>(MOCK_EVENTS)
  const [organisations, setOrganisations] = React.useState<Organisation[]>(MOCK_ORGANISATIONS)

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
    }),
    [datasets, upsertDataset, deleteDataset, events, upsertEvent, deleteEvent, organisations, addOrganisation],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export { AppDataProvider, useAppData }
