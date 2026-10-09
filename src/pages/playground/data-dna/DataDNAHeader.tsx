import { Building2, CalendarDays, Dna, Layers, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { DatasetActions } from '@/components/dataset/consumer/DatasetActions'
import type { DataDNAModel } from '@/components/dataset/consumer/data-dna/use-data-dna'

/** The identity row at the top of the hero card: title and compact context on the left, actions on the right. Download
 *  dataset is the one primary action; Share is a supporting outline action; Download Data DNA is a quiet text action. */
function DataDNAHeader({ model }: { model: DataDNAModel }) {
  const toast = useToast()
  const meta = [
    { icon: Building2, label: 'Publisher', value: model.publisher },
    { icon: Layers, label: 'Domain', value: model.domain },
    { icon: MapPin, label: 'Geography', value: model.geography },
    { icon: CalendarDays, label: 'Last updated', value: model.updated },
  ].filter((m) => m.value)

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="min-w-0 lg:max-w-[65%]">
        <h1 className="type-heading-1 break-words text-text-brand">{model.title}</h1>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {meta.map(({ icon: Icon, label, value }) => (
            <li key={label} className="type-caption flex items-center gap-1.5 text-text-subdued">
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only">{label}:</span>
              {value}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:items-start lg:items-end">
        <DatasetActions title={model.title} />
        <div className="flex items-center gap-2 lg:flex-row-reverse">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => toast({ title: 'Prototype', description: 'Data DNA downloads are not wired up yet.' })}
          >
            <Dna className="size-4" aria-hidden="true" />
            Download Data DNA
          </Button>
          <span className="type-caption text-text-subdued">Visual dataset profile</span>
        </div>
      </div>
    </header>
  )
}

export { DataDNAHeader }
