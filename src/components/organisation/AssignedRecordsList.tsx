import { usePublishedEvaluationRecords } from '@/hooks/use-published-evaluation-records'
import type { EvaluationModule, EvaluationScopeItem } from '@/types/organisation-workspace'

const TYPE_LABEL: Record<EvaluationModule, string> = { dataset: 'Dataset', 'use-case': 'Use case', 'ai-model': 'AI model', publication: 'Publication', event: 'Event' }

/** The records an Evaluator reviews (or will review), each by its full name with its content type. */
function AssignedRecordsList({ organisationId, scope }: { organisationId: string; scope: EvaluationScopeItem[] }) {
  const { nameOf } = usePublishedEvaluationRecords(organisationId)
  if (scope.length === 0) return <p className="text-sm text-text-subdued">No records assigned.</p>
  return (
    <ul className="flex flex-col gap-1.5">
      {scope.map((item) => (
        <li key={`${item.module}:${item.recordId}`} className="flex items-start justify-between gap-3 rounded-md border border-border-default px-3 py-2">
          <span className="min-w-0 break-words text-sm text-text-default">{nameOf(item.module, item.recordId)}</span>
          <span className="shrink-0 text-xs text-text-subdued">{TYPE_LABEL[item.module]}</span>
        </li>
      ))}
    </ul>
  )
}

export { AssignedRecordsList }
