import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useAppData } from '@/context/AppDataContext'
import { SECTOR_OPTIONS } from '@/types/dataset'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function UseCasesExplorePage() {
  const navigate = useNavigate()
  const { useCases } = useAppData()
  const published = useCases.filter((u) => u.status === 'published' && u.publishedForm)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-2">
      <div className="flex flex-col gap-1.5">
        <h1 className="type-heading-1 text-primary">Use Cases</h1>
        <p className="text-sm text-muted-foreground">
          See how organizations and researchers are putting civic data to work.
        </p>
      </div>

      {published.length === 0 ? (
        <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Compass className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <p className="type-heading-3 text-foreground">No use cases published yet</p>
            <p className="text-sm text-muted-foreground">Check back soon.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((record) => {
            const form = record.publishedForm!
            const { metadata } = form
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => navigate(`/explore/use-cases/${record.id}`)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md"
              >
                {metadata.thumbnail?.dataUrl ? (
                  <img src={metadata.thumbnail.dataUrl} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted">
                    <Compass className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                  <h3 className="type-heading-3 text-primary">{metadata.title || 'Untitled Use Case'}</h3>
                  {metadata.subtitle && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{metadata.subtitle}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {metadata.sectors.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary">
                        {optionLabel(SECTOR_OPTIONS, s)}
                      </Badge>
                    ))}
                  </div>
                  <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    View use case
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { UseCasesExplorePage }
