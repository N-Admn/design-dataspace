import { useMemo } from 'react'
import { Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagInput } from '@/components/ui/tag-input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { GEOGRAPHY_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import { SDG_GOALS } from '@/lib/sdg-goals'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import { cn } from '@/lib/utils'
import {
  COLLABORATIVE_DESCRIPTION_MAX_LENGTH,
  COLLABORATIVE_URL_SUFFIX,
  type CollaborativeMetadata,
} from '@/types/collaborative'
import { richTextLength, type CollaborativeAboutErrors } from '@/lib/collaborative-validation'

/** All 17 goals, each with its official UN icon beside the title (the stored values and titles are unchanged). */
const SDG_SELECT_OPTIONS = SDG_GOALS.map((g) => ({
  value: g.value,
  label: `${g.number}. ${g.title}`,
  icon: <img src={g.imageUrl} alt="" className="size-6 shrink-0 rounded-[1px]" />,
}))

const COLLABORATIVE_IMAGE_EXTENSIONS = [...SUPPORTED_IMAGE_EXTENSIONS, 'svg']

interface CollaborativeStep1AboutProps {
  metadata: CollaborativeMetadata
  errors: CollaborativeAboutErrors
  onChange: <K extends keyof CollaborativeMetadata>(field: K, value: CollaborativeMetadata[K]) => void
}

function CollaborativeStep1About({ metadata, errors, onChange }: CollaborativeStep1AboutProps) {
  const descriptionLength = useMemo(() => richTextLength(metadata.descriptionHtml), [metadata.descriptionHtml])

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Introduce this content with a title, summary and image.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FileUploadField
            id="collaborative-image"
            label="Collaborative Image"
            helperText="Add an image that represents this Collaborative."
            value={metadata.image}
            onChange={(asset) => onChange('image', asset)}
            extensions={COLLABORATIVE_IMAGE_EXTENSIONS}
            maxBytes={MAX_IMAGE_BYTES}
          />

          <div>
            <Label htmlFor="collaborative-name">
              Collaborative Name <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Use a clear name that describes the initiative.</p>
            <Input
              id="collaborative-name"
              className="mt-1.5"
              placeholder="e.g. FemHealth Data Collaborative"
              value={metadata.name}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="collaborative-slug">
              Collaborative URL <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The web address for this Collaborative. Filled in from the name — edit it if you need a shorter one.
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="collaborative-slug"
                className="min-w-0 flex-1"
                placeholder="e.g. femhealth-data"
                value={metadata.slug}
                spellCheck={false}
                autoCapitalize="none"
                aria-invalid={Boolean(errors.slug)}
                aria-describedby="collaborative-slug-suffix"
                // Lowercase and swap spaces as they type; full format is checked by validation.
                onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
              <span id="collaborative-slug-suffix" className="shrink-0 text-sm text-muted-foreground">
                {COLLABORATIVE_URL_SUFFIX}
              </span>
            </div>
            <FieldError message={errors.slug} />
          </div>

          <div>
            <Label htmlFor="collaborative-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Describe the problem this Collaborative addresses, why collaboration is needed, and what the initiative
              aims to achieve.
            </p>
            <div className="mt-1.5">
              <RichTextEditor
                id="collaborative-description"
                value={metadata.descriptionHtml}
                onChange={(html) => onChange('descriptionHtml', html)}
                placeholder="Describe this Collaborative..."
              />
            </div>
            <p
              className={cn(
                'mt-1.5 text-xs tabular-nums',
                descriptionLength > COLLABORATIVE_DESCRIPTION_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              Character limit: {descriptionLength.toLocaleString()}/{COLLABORATIVE_DESCRIPTION_MAX_LENGTH.toLocaleString()}
            </p>
            <FieldError message={errors.description} />
          </div>

          <div>
            <Label htmlFor="collaborative-external-url">External Link</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add a link to the Collaborative's website or external resource.
            </p>
            <Input
              id="collaborative-external-url"
              type="url"
              className="mt-1.5"
              placeholder="https://example.org"
              value={metadata.externalUrl}
              aria-invalid={Boolean(errors.externalUrl)}
              onChange={(e) => onChange('externalUrl', e.target.value)}
            />
            <FieldError message={errors.externalUrl} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Add sectors and topics to help people discover this content.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="collaborative-sdg-goals">
                SDG Goals <span className="text-destructive">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="About SDG goals"
                    className="flex size-5 items-center justify-center rounded-full text-text-subdued hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <Info className="size-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  The UN Sustainable Development Goals this collaborative works towards. Pick every goal that applies, but at least one. People can filter collaboratives by SDG goal on the Search page.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-sdg-goals"
                options={SDG_SELECT_OPTIONS}
                values={metadata.sdgGoals}
                onChange={(values) => onChange('sdgGoals', values)}
                placeholder="Select SDG goals..."
                invalid={Boolean(errors.sdgGoals)}
              />
            </div>
            <FieldError message={errors.sdgGoals} />
          </div>

          <div>
            <Label htmlFor="collaborative-sectors">Sectors</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-sectors"
                options={SECTOR_OPTIONS}
                values={metadata.sectors}
                onChange={(values) => onChange('sectors', values)}
                placeholder="Select sectors..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collaborative-tags">Tags</Label>
            <div className="mt-1.5">
              <TagInput
                id="collaborative-tags"
                value={metadata.tags}
                onChange={(tags) => onChange('tags', tags)}
                placeholder="Type a tag and press Enter..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collaborative-geographies">Geography</Label>
            <div className="mt-1.5">
              <MultiSelect
                id="collaborative-geographies"
                options={GEOGRAPHY_OPTIONS}
                values={metadata.geographies}
                onChange={(values) => onChange('geographies', values)}
                placeholder="Select geographies..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { CollaborativeStep1About }
