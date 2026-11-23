import * as React from 'react'

import { useAppData } from '@/context/AppDataContext'
import { EVALUATION_MODULES, evaluatorVisibleIds } from '@/lib/evaluation-assignments'
import { currentUserRole, type EvaluationModule } from '@/types/organisation-workspace'

/** What the signed-in user may see in one organisation, when they are an Evaluator there. For anyone else nothing is restricted: `isEvaluator`
 *  is false and `filter` returns its input. For an Evaluator only records that are assigned to them and still published are visible, the
 *  same rule the sidebar, the route guard and every module table use. */
function useEvaluatorScope(organisationId: string) {
  const { organisationWorkspaces, datasets, useCases, aiModels, publications, events } = useAppData()
  const organisation = organisationWorkspaces.find((o) => o.id === organisationId) ?? null
  const isEvaluator = organisation ? currentUserRole(organisation) === 'evaluator' : false

  return React.useMemo(() => {
    const visible = new Map<EvaluationModule, Set<string>>()
    if (organisation && isEvaluator) {
      const pools = { dataset: datasets, 'use-case': useCases, 'ai-model': aiModels, publication: publications, event: events }
      for (const module of EVALUATION_MODULES) visible.set(module, evaluatorVisibleIds(organisation, module, pools[module]))
    }
    const modules = EVALUATION_MODULES.filter((m) => (visible.get(m)?.size ?? 0) > 0)
    return {
      isEvaluator,
      /** The modules in which the Evaluator has at least one visible record. */
      modules,
      hasAssignments: modules.length > 0,
      canSee: (module: EvaluationModule, recordId: string) => !isEvaluator || (visible.get(module)?.has(recordId) ?? false),
      filter: <T extends { id: string }>(module: EvaluationModule, records: T[]): T[] =>
        isEvaluator ? records.filter((r) => visible.get(module)?.has(r.id)) : records,
    }
  }, [organisation, isEvaluator, datasets, useCases, aiModels, publications, events])
}

export { useEvaluatorScope }
