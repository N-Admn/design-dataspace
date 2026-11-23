import * as React from 'react'

import { useAppData } from '@/context/AppDataContext'
import type { EvaluationModule } from '@/types/organisation-workspace'

interface EvaluationRecordOption {
  value: string
  label: string
}

/** The organisation's published records of each content type: the only records that can be assigned to an Evaluator. The name shown is the
 *  live (published) one. */
function usePublishedEvaluationRecords(organisationId: string) {
  const { datasets, useCases, aiModels, publications, events } = useAppData()
  return React.useMemo(() => {
    const options = (records: { id: string; status: string; organisationId?: string }[], name: (r: never) => string): EvaluationRecordOption[] =>
      records
        .filter((r) => r.organisationId === organisationId && r.status === 'published')
        .map((r) => ({ value: r.id, label: name(r as never) || 'Untitled' }))
    const byModule: Record<EvaluationModule, EvaluationRecordOption[]> = {
      dataset: options(datasets, (d: (typeof datasets)[number]) => (d.publishedForm ?? d.form).metadata.name),
      'use-case': options(useCases, (u: (typeof useCases)[number]) => (u.publishedForm ?? u.form).metadata.title),
      'ai-model': options(aiModels, (m: (typeof aiModels)[number]) => (m.publishedForm ?? m.form).metadata.name),
      publication: options(publications, (p: (typeof publications)[number]) => (p.publishedForm ?? p.form).metadata.name),
      event: options(events, (e: (typeof events)[number]) => (e.publishedForm ?? e.form).metadata.title),
    }
    /** The name of any record, published or not, for listing existing assignments. */
    const nameOf = (module: EvaluationModule, id: string): string => {
      const pool = { dataset: datasets, 'use-case': useCases, 'ai-model': aiModels, publication: publications, event: events }[module] as {
        id: string
        form: { metadata: { name?: string; title?: string } }
        publishedForm: { metadata: { name?: string; title?: string } } | null
      }[]
      const r = pool.find((x) => x.id === id)
      const meta = (r?.publishedForm ?? r?.form)?.metadata
      return meta?.name || meta?.title || 'Removed record'
    }
    return { byModule, nameOf }
  }, [organisationId, datasets, useCases, aiModels, publications, events])
}

export { usePublishedEvaluationRecords }
export type { EvaluationRecordOption }
