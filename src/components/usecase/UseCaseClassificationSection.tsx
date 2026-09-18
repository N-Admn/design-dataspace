import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOAL_OPTIONS, type UseCaseMetadata } from '@/types/usecase'

interface UseCaseClassificationSectionProps {
  metadata: UseCaseMetadata
  onChange: <K extends keyof UseCaseMetadata>(field: K, value: UseCaseMetadata[K]) => void
}

/** First section of the Connect step — discoverability fields, split out of the
 * old Start step's metadata form so it sits with the rest of what helps people
 * find and understand this Use Case (datasets, contributors, organisations). */
function UseCaseClassificationSection({ metadata, onChange }: UseCaseClassificationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Classification</CardTitle>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          Add sectors and topics to help people discover this content.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <Label htmlFor="usecase-tags">Tags</Label>
          <div className="mt-1.5">
            <TagInput
              id="usecase-tags"
              value={metadata.tags}
              onChange={(tags) => onChange('tags', tags)}
              placeholder="Type a tag and press Enter..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="usecase-sdg-goals">SDG Goals</Label>
          <div className="mt-1.5">
            <MultiSelect
              id="usecase-sdg-goals"
              options={SDG_GOAL_OPTIONS}
              values={metadata.sdgGoals}
              onChange={(values) => onChange('sdgGoals', values)}
              placeholder="Select SDG goals..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="usecase-sectors">Sectors</Label>
          <div className="mt-1.5">
            <MultiSelect
              id="usecase-sectors"
              options={SECTOR_OPTIONS}
              values={metadata.sectors}
              onChange={(values) => onChange('sectors', values)}
              placeholder="Select sectors..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="usecase-geographies">Geography</Label>
          <div className="mt-1.5">
            <MultiSelect
              id="usecase-geographies"
              options={GEOGRAPHY_OPTIONS}
              values={metadata.geographies}
              onChange={(values) => onChange('geographies', values)}
              placeholder="Select geographies..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { UseCaseClassificationSection }
