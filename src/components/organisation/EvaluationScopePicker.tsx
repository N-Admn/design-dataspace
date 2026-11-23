import * as React from 'react'

import { FieldError } from '@/components/ui/field-error'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { usePublishedEvaluationRecords } from '@/hooks/use-published-evaluation-records'
import { EVALUATION_MODULE_LABEL, EVALUATION_PICKER_MODULES } from '@/lib/evaluation-assignments'
import type { EvaluationModule, EvaluationScopeItem } from '@/types/organisation-workspace'

interface EvaluationScopePickerProps {
  organisationId: string
  value: EvaluationScopeItem[]
  onChange: (value: EvaluationScopeItem[]) => void
  /** Shown under the picker, e.g. "Choose at least one record". */
  error?: string | null
  idPrefix: string
}

/** Chooses what an Evaluator will review: one or more content types, then for each a searchable multi-select of the organisation's
 *  published records. Only published records are offered; this is the single control both the invitation and the member drawers use. */
function EvaluationScopePicker({ organisationId, value, onChange, error, idPrefix }: EvaluationScopePickerProps) {
  const { byModule } = usePublishedEvaluationRecords(organisationId)
  const [types, setTypes] = React.useState<EvaluationModule[]>(() => EVALUATION_PICKER_MODULES.filter((m) => value.some((v) => v.module === m)))

  const typeOptions = EVALUATION_PICKER_MODULES.map((m) => ({ value: m, label: EVALUATION_MODULE_LABEL[m] }))

  const changeTypes = (next: string[]) => {
    const kept = EVALUATION_PICKER_MODULES.filter((m) => next.includes(m))
    setTypes(kept)
    // Records of a type that was unticked are dropped with it.
    onChange(value.filter((v) => kept.includes(v.module)))
  }

  const changeRecords = (module: EvaluationModule, ids: string[]) => {
    onChange([...value.filter((v) => v.module !== module), ...ids.map((recordId) => ({ module, recordId }))])
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface-subdued/30 p-4">
      <div>
        <p className="text-sm font-semibold text-text-default">Evaluation access</p>
        <p className="mt-0.5 text-xs text-text-subdued">
          An Evaluator can only open the published records chosen here. They become active when the invitation is accepted.
        </p>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-types`}>
          Content types <span className="text-text-critical-strong">*</span>
        </Label>
        <div className="mt-1.5">
          <MultiSelect
            id={`${idPrefix}-types`}
            options={typeOptions}
            values={types}
            onChange={changeTypes}
            placeholder="Select content types..."
            searchPlaceholder="Search content types..."
            invalid={Boolean(error) && value.length === 0}
          />
        </div>
      </div>

      {types.map((module) => {
        const options = byModule[module]
        const label = EVALUATION_MODULE_LABEL[module]
        const chosen = value.filter((v) => v.module === module).map((v) => v.recordId)
        return (
          <div key={module}>
            <Label htmlFor={`${idPrefix}-${module}`}>{label}</Label>
            <div className="mt-1.5">
              {options.length === 0 ? (
                <p className="rounded-md border border-dashed border-border-default px-3 py-2.5 text-sm text-text-subdued">
                  This organisation has no published {label.toLowerCase()} to assign.
                </p>
              ) : (
                <MultiSelect
                  id={`${idPrefix}-${module}`}
                  options={options}
                  values={chosen}
                  onChange={(ids) => changeRecords(module, ids)}
                  placeholder="Select published records..."
                  searchPlaceholder={`Search ${label}...`}
                />
              )}
            </div>
          </div>
        )
      })}

      {error && <FieldError message={error} />}
    </div>
  )
}

export { EvaluationScopePicker }
