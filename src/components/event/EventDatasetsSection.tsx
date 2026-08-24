import { DatasetConnectionsCard } from '@/components/shared/DatasetConnectionsCard'
import type { EventFormState } from '@/types/event'
import type { Dispatch, SetStateAction } from 'react'

interface EventDatasetsSectionProps {
  form: EventFormState
  onChange: Dispatch<SetStateAction<EventFormState>>
}

function EventDatasetsSection({ form, onChange }: EventDatasetsSectionProps) {
  return (
    <DatasetConnectionsCard
      datasets={form.relatedContent.datasets}
      parentLabel="this event"
      description="Connect datasets that support this contribution."
      emptyHint="Connect an existing published dataset to support this contribution."
      onChange={(datasets) =>
        onChange((prev) => ({
          ...prev,
          relatedContent: {
            ...prev.relatedContent,
            datasets: datasets.map((d) => ({ ...d, type: 'dataset' as const })),
          },
        }))
      }
    />
  )
}

export { EventDatasetsSection }
