import * as React from 'react'
import { Bookmark, Calendar, FileText, Inbox, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { ContentCard } from '@/components/discover/ContentCard'
import { SearchResultCard } from '@/components/discover/SearchResultCard'
import { buildCardMetadata } from '@/lib/content-card'
import type { SearchResultItem, SearchResultType } from '@/lib/global-search'
import { CircleArrow } from '@/components/shared/CircleArrow'
import { EmptyState } from '@/components/shared/EmptyState'
import { PreviewActionBar } from '@/components/shared/PreviewActionBar'
import { ReviewPublishPanel } from '@/components/shared/ReviewPublishPanel'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { TruncatedText } from '@/components/shared/TruncatedText'
import { Callout, Code, ComponentPreview, DocSection, PropsTable, ReferenceTable, SubHeading } from '@/pages/design-system/docs/primitives'

const STEPPER_STEPS = [
  { step: 1, label: 'Details' },
  { step: 2, label: 'Data Files' },
  { step: 3, label: 'Connections' },
  { step: 4, label: 'Review & Publish' },
]

/* ----------------------------------------------------------------- stepper */

export function StepperPage() {
  const [current, setCurrent] = React.useState(2)
  return (
    <>
      <DocSection id="usage" title="Usage" description="A progress indicator for a multi-step flow. Once Review is reached with every step valid, the whole stepper becomes clickable navigation.">
        <ComponentPreview
          title="Stepper"
          stage="fill"
          code={`<Stepper steps={steps} currentStep={current} />
<Stepper steps={steps} currentStep={current} compact />
<Stepper steps={steps} currentStep={current} interactive onStepClick={setCurrent} />`}
        >
          <div className="flex w-full flex-col gap-8">
            <div>
              <p className="type-caption mb-3 font-mono text-muted-foreground">default: progress only</p>
              <Stepper steps={STEPPER_STEPS} currentStep={current} />
            </div>
            <div>
              <p className="type-caption mb-3 font-mono text-muted-foreground">compact</p>
              <Stepper steps={STEPPER_STEPS} currentStep={current} compact />
            </div>
            <div>
              <p className="type-caption mb-3 font-mono text-muted-foreground">interactive: click a step</p>
              <Stepper steps={STEPPER_STEPS} currentStep={current} interactive onStepClick={setCurrent} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCurrent((s) => Math.max(1, s - 1))}>
                Back
              </Button>
              <Button size="sm" onClick={() => setCurrent((s) => Math.min(4, s + 1))}>
                Next
              </Button>
            </div>
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'steps', type: '{ step: number; label: string }[]', description: 'The steps, in order.' },
            { name: 'currentStep', type: 'number', description: 'The step being worked on.' },
            { name: 'compact', type: 'boolean', default: 'false', description: 'The tighter inline variant.' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Make every step a button. Only once Review is reached with all steps valid.' },
            { name: 'onStepClick', type: '(step: number) => void', description: 'Called when an interactive step is chosen.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* -------------------------------------------------------------------- card */

export function CardPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A rounded-xl bordered container with header, content and footer slots. CardTitle uses the heading-3 role in the primary colour.">
        <ComponentPreview
          title="Card"
          stage="fill"
          code={`<Card>
  <CardHeader>
    <CardTitle>Card title</CardTitle>
    <CardDescription>Supporting copy in muted-foreground.</CardDescription>
  </CardHeader>
  <CardContent>The body.</CardContent>
  <CardFooter className="gap-2">
    <Button size="sm">Primary</Button>
    <Button size="sm" variant="outline">Secondary</Button>
  </CardFooter>
</Card>`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>CardDescription: 14px muted-foreground supporting copy.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="type-body text-foreground">
                  CardContent holds the body. Tables, chart values and pie percentages apply <Code>tabular-nums</Code>.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Focus and interaction</CardTitle>
                <CardDescription>Tab through these to see the live focus ring.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline">Focusable button</Button>
                <Input placeholder="Focusable input" />
                <p className="type-caption text-muted-foreground">Base indicator: 2px solid var(--ring), offset 2px. On dark chrome it switches to var(--ring-on-dark).</p>
              </CardContent>
            </Card>
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="Parts">
        <PropsTable
          rows={[
            { name: 'Card', type: 'div', description: 'The container.' },
            { name: 'CardHeader', type: 'div', description: 'Holds the title and description.' },
            { name: 'CardTitle', type: 'div', description: 'The heading-3 title.' },
            { name: 'CardDescription', type: 'div', description: 'Supporting copy.' },
            { name: 'CardContent', type: 'div', description: 'The body.' },
            { name: 'CardFooter', type: 'div', description: 'Actions.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------- empty state */

export function EmptyStatePage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="The one dashed-border “nothing here yet” block. Say what is missing and, where there is one, offer the next step.">
        <ComponentPreview
          title="Empty states"
          stage="fill"
          code={`<EmptyState
  icon={Inbox}
  title="No datasets yet"
  description="Datasets you create will appear here."
  action={<Button size="sm">New dataset</Button>}
/>
<EmptyState variant="compact" icon={FileText} title="No files attached" />
<EmptyState variant="filled" icon={Sparkles} title="Nothing to preview" />`}
        >
          <div className="grid w-full gap-4 lg:grid-cols-3">
            <EmptyState icon={Inbox} title="No datasets yet" description="Datasets you create will appear here." action={<Button size="sm">New dataset</Button>} />
            <EmptyState variant="compact" icon={FileText} title="No files attached" />
            <EmptyState variant="filled" icon={Sparkles} title="Nothing to preview" description="Add content to see it rendered here." />
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'variant', type: "'default' | 'compact' | 'filled'", default: "'default'", description: 'compact is tighter, for nested contexts; filled fills its container with a muted tint, for preview canvases.' },
            { name: 'icon', type: 'LucideIcon', description: 'An icon above the text.' },
            { name: 'title / description', type: 'string', description: 'What is missing, and a line of help.' },
            { name: 'action', type: 'ReactNode', description: 'Typically a Button.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ---------------------------------------------------------- truncated text */

export function TruncatedTextPage() {
  return (
    <DocSection id="usage" title="Usage" description="A single-line clip that only shows a tooltip when the text is actually cut off, and becomes keyboard-focusable when clipped. Resize the window to compare.">
      <ComponentPreview
        title="Truncated text"
        stage="fill"
        code={`<TruncatedText className="type-body text-foreground">
  A very long dataset title that will overflow a narrow container
</TruncatedText>`}
      >
        <div className="grid w-full max-w-md gap-3">
          <TruncatedText className="type-body text-foreground">Short: fits, no tooltip</TruncatedText>
          <TruncatedText className="type-body text-foreground">
            A very long dataset title that will overflow this narrow container and therefore expose a tooltip with the full value on hover or focus
          </TruncatedText>
        </div>
      </ComponentPreview>
      <PropsTable rows={[{ name: 'children', type: 'string', description: 'The text. Style it with className.' }]} />
    </DocSection>
  )
}

/* ------------------------------------------------------------ circle arrow */

export function CircleArrowPage() {
  return (
    <DocSection id="usage" title="Usage" description="A presentational circular arrow on dashboard cards and resume rows. It is decorative (aria-hidden): the enclosing card owns the click.">
      <ComponentPreview title="Circle arrow" code={`<CircleArrow size="sm" />\n<CircleArrow size="lg" />`}>
        <CircleArrow size="sm" />
        <CircleArrow size="lg" />
      </ComponentPreview>
      <PropsTable rows={[{ name: 'size', type: "'sm' | 'lg'", default: "'lg'", description: 'sm is 32px, lg 48px.' }]} />
    </DocSection>
  )
}

/* ------------------------------------------------------------ content card */

const IMG_USE_CASE = 'https://images.pexels.com/photos/4865519/pexels-photo-4865519.jpeg?auto=compress&cs=tinysrgb&w=800'
const IMG_EVENT = 'https://images.pexels.com/photos/8190805/pexels-photo-8190805.jpeg?auto=compress&cs=tinysrgb&w=800'
const IMG_COLLAB = 'https://images.pexels.com/photos/76969/cold-front-warm-front-hurricane-felix-76969.jpeg?auto=compress&cs=tinysrgb&w=800'
const UPDATED = { updatedAt: '05/08/2026 09:00:00' }

/** One sample record per content type, in the shape the Search index produces, so the previews show the real per-type metadata. */
const SAMPLE_ITEMS: Record<SearchResultType, SearchResultItem> = {
  dataset: {
    id: 'ds', type: 'dataset', title: 'Air Quality Readings, Delhi', description: 'Hourly PM2.5 and ozone readings from monitoring stations.', href: '#',
    cardMeta: { formats: ['CSV', 'JSON', 'XLSX', 'API'], chartCount: 2, geography: 'Delhi' },
    publishers: [{ name: 'CivicDataLab' }], facets: UPDATED,
  },
  'use-case': {
    id: 'uc', type: 'use-case', title: 'Early warning for heat-related illness', description: 'Combines forecast heat with clinic data to alert health workers.', href: '#',
    thumbnailUrl: IMG_USE_CASE, cardMeta: { datasetCount: 2, chartCount: 1, geography: 'South Asia' },
    publishers: [{ name: 'CivicDataLab' }, { name: 'Meridian Institute' }], facets: UPDATED,
  },
  publication: {
    id: 'pub', type: 'publication', title: 'State of Open Data in Indian Cities', description: 'A review of municipal open data practice.', href: '#',
    cardMeta: { year: '2025', publicationType: 'Report' }, publishers: [{ name: 'Meridian Institute' }], facets: UPDATED,
  },
  collaborative: {
    id: 'co', type: 'collaborative', title: 'Climate and Health Data Collaborative', description: 'Linking climate and health data for policy planning.', href: '#',
    thumbnailUrl: IMG_COLLAB, cardMeta: { datasetCount: 28, useCaseCount: 6, contributorCount: 18 },
    publishers: [{ name: 'CivicDataLab' }, { name: 'Urban Commons Lab' }, { name: 'Riverbend Health' }, { name: 'Open Budget Collective' }], facets: UPDATED,
  },
  event: {
    id: 'ev', type: 'event', title: 'Open data in practice: a community workshop', description: 'A one-day workshop for community groups.', href: '#',
    thumbnailUrl: IMG_EVENT, cardMeta: { dateRange: '12–13 Oct 2026', location: 'Bengaluru, India' }, publishers: [{ name: 'CivicDataLab' }], facets: UPDATED,
  },
  'ai-model': {
    id: 'ai', type: 'ai-model', title: 'Flood Risk Forecaster', description: 'Predicts short-term flood risk for river basin districts.', href: '#',
    cardMeta: { version: '2.1', modelType: 'Forecasting', accessMethod: 'REST API' }, publishers: [{ name: 'CivicDataLab' }], facets: UPDATED,
  },
}

const TYPE_ORDER: SearchResultType[] = ['dataset', 'use-case', 'publication', 'collaborative', 'event', 'ai-model']

const withItem = (type: SearchResultType, changes: Partial<SearchResultItem>): SearchResultItem => ({ ...SAMPLE_ITEMS[type], ...changes })

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="type-caption font-mono text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

export function ContentCardPage() {
  return (
    <>
      <DocSection
        id="overview"
        title="Overview"
        description="One card for every content type on the Search page and wherever else content is listed. ContentCard takes plain data; SearchResultCard maps a search-index record onto it, so there is a single card implementation, never one per type."
      >
        <ul className="type-body flex max-w-3xl list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
          <li><strong className="text-foreground">Structure:</strong> optional image, title, optional description, two to four metadata rows, then a footer with the publishers on the left and the content type on the right.</li>
          <li><strong className="text-foreground">Two layouts:</strong> grid (image above the text) for multi-column grids and the grouped “All” view, and list (image beside the text) for the results toolbar’s List view.</li>
          <li><strong className="text-foreground">Real data only:</strong> every row, avatar and image is shown only when the record has it. Nothing is invented to fill a gap.</li>
        </ul>
        <ComponentPreview
          title="ContentCard"
          stage="fill"
          code={`<ContentCard
  variant="grid"
  type="dataset"
  title="Air Quality Readings, Delhi"
  description="Hourly PM2.5 and ozone readings from monitoring stations."
  metadata={[{ icon: Calendar, label: 'Updated Aug 2026' }, { icon: FileText, label: 'CSV' }]}
  publishers={[{ name: 'CivicDataLab' }]}
  href="/explore/datasets/ds-1"
  tintedMetadata
/>`}
        >
          <div className="w-full max-w-sm">
            <ContentCard
              variant="grid"
              type="dataset"
              title="Air Quality Readings, Delhi"
              description="Hourly PM2.5 and ozone readings from monitoring stations."
              metadata={[{ icon: Calendar, label: 'Updated Aug 2026' }, { icon: FileText, label: 'CSV' }]}
              publishers={[{ name: 'CivicDataLab' }]}
              tintedMetadata
            />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection
        id="content-types"
        title="Content types"
        description="Each type shows the attributes that matter for it, in a fixed order (built by buildCardMetadata). Datasets get a fourth row for chart count. Types that have a cover image show it; the rest never do."
      >
        <ComponentPreview
          title="Every content type, grid layout"
          stage="fill"
          code={`<SearchResultCard item={item} layout="grid" tintedMetadata />`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {TYPE_ORDER.map((type) => (
              <Labelled key={type} label={type}>
                <SearchResultCard item={SAMPLE_ITEMS[type]} layout="grid" tintedMetadata />
              </Labelled>
            ))}
          </div>
        </ComponentPreview>
        <ReferenceTable
          columns={['Type', 'Metadata rows (in order)', 'Cover image']}
          rows={[
            ['dataset', 'Updated, format (“CSV +3” with a tooltip when several), chart count, geography', 'No'],
            ['use-case', 'Datasets, charts, geography', 'Yes'],
            ['publication', 'Year, publication type', 'No'],
            ['collaborative', 'Datasets, use cases, contributors', 'Yes'],
            ['event', 'Date range, location', 'Yes'],
            ['ai-model', 'Version, model type, access method', 'No'],
          ]}
        />
      </DocSection>

      <DocSection id="layouts" title="Grid and list" description="The same record in both layouts. Grid uses a fixed 176px image so thumbnails line up whatever the column width; list puts a 144×96 image beside the text.">
        <ComponentPreview
          title="List layout"
          stage="fill"
          code={`<SearchResultCard item={item} layout="list" tintedMetadata />`}
        >
          <div className="flex w-full flex-col gap-3">
            {(['use-case', 'dataset', 'event'] as SearchResultType[]).map((type) => (
              <Labelled key={type} label={`list · ${type}`}>
                <SearchResultCard item={SAMPLE_ITEMS[type]} layout="list" tintedMetadata />
              </Labelled>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection
        id="image-states"
        title="Image states"
        description="Use cases, collaboratives and events are the modules whose contributor flow has a cover image, so they always keep an image slot: the image when there is one, otherwise a grey placeholder with an image icon, so cards in a row keep their layout. Datasets, publications and AI models have no cover image, so their cards have no image area at all."
      >
        <ComponentPreview
          title="Image states"
          stage="fill"
          code={`<ContentCard type="use-case" thumbnailUrl="https://…/cover.jpg" … />   // image shown
<ContentCard type="use-case" thumbnailUrl={null} … />                   // grey placeholder with an image icon
<ContentCard type="publication" … />                                    // no image area (type has no cover image)`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <Labelled label="use case · with image">
              <SearchResultCard item={SAMPLE_ITEMS['use-case']} tintedMetadata />
            </Labelled>
            <Labelled label="use case · no image (placeholder)">
              <SearchResultCard item={withItem('use-case', { thumbnailUrl: null })} tintedMetadata />
            </Labelled>
            <Labelled label="collaborative · no image (placeholder)">
              <SearchResultCard item={withItem('collaborative', { thumbnailUrl: null })} tintedMetadata />
            </Labelled>
            <Labelled label="publication · type has no image">
              <SearchResultCard item={SAMPLE_ITEMS.publication} tintedMetadata />
            </Labelled>
          </div>
        </ComponentPreview>
        <ComponentPreview
          title="Image placeholder, list layout"
          stage="fill"
          code={`<ContentCard variant="list" type="event" thumbnailUrl={null} … />`}
        >
          <div className="w-full">
            <Labelled label="list · event · no image (placeholder)">
              <SearchResultCard item={withItem('event', { thumbnailUrl: null })} layout="list" tintedMetadata />
            </Labelled>
          </div>
        </ComponentPreview>
        <ReferenceTable
          columns={['Type', 'Cover image field', 'Card without an image']}
          rows={[
            ['use-case', 'thumbnail', 'Grey placeholder with an image icon'],
            ['collaborative', 'image', 'Grey placeholder with an image icon'],
            ['event', 'coverImage', 'Grey placeholder with an image icon'],
            ['dataset', '—', 'No image area'],
            ['publication', '—', 'No image area'],
            ['ai-model', '—', 'No image area'],
          ]}
        />
        <Callout title="The list of types is deliberate.">
          <p>
            The placeholder follows what the contributor flow can capture. A new module that gains a cover image is added to <Code>THUMBNAIL_TYPES</Code>{' '}
            in <Code>ContentCard.tsx</Code>; a type without one never shows an empty box.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="publishers" title="Publisher states" description="Publishers are avatars only: the name is never printed, only shown on hover or focus and as the avatar’s accessible name. Up to three show; more become a “+N” chip. With no attribution the avatar group is left out and the type badge stays right-aligned.">
        <ComponentPreview
          title="Publisher states"
          stage="fill"
          code={`publishers={[]}                                  // none: no avatars
publishers={[{ name: 'CivicDataLab' }]}           // one
publishers={[a, b, c]}                             // three
publishers={[a, b, c, d, e]}                       // three + “+2”`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['none', []],
              ['one', [{ name: 'CivicDataLab' }]],
              ['three', [{ name: 'CivicDataLab' }, { name: 'Meridian Institute' }, { name: 'Urban Commons Lab' }]],
              ['five (3 + “+2”)', [{ name: 'CivicDataLab' }, { name: 'Meridian Institute' }, { name: 'Urban Commons Lab' }, { name: 'Riverbend Health' }, { name: 'Open Budget Collective' }]],
            ].map(([label, publishers]) => (
              <Labelled key={label as string} label={label as string}>
                <SearchResultCard item={withItem('publication', { publishers: publishers as SearchResultItem['publishers'] })} tintedMetadata />
              </Labelled>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="metadata-states" title="Metadata states" description="The accent treatment is for search and listing pages. Embedded in a detail page, leave tintedMetadata off so the page’s own metadata styling is not competed with. Rows with missing data are simply left out.">
        <ComponentPreview
          title="Metadata states"
          stage="fill"
          code={`<ContentCard tintedMetadata … />      // search / listing pages
<ContentCard … />                       // embedded in a detail page
// A truncated summary carries a tooltip: { label: 'CSV +3', tooltip: 'CSV, JSON, XLSX, API' }`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Labelled label="tinted (search)">
              <SearchResultCard item={SAMPLE_ITEMS.dataset} tintedMetadata />
            </Labelled>
            <Labelled label="plain (embedded)">
              <SearchResultCard item={SAMPLE_ITEMS.dataset} />
            </Labelled>
            <Labelled label="one format, no charts">
              <SearchResultCard item={withItem('dataset', { cardMeta: { formats: ['CSV'], geography: 'Delhi' } })} tintedMetadata />
            </Labelled>
            <Labelled label="only what exists">
              <SearchResultCard item={withItem('dataset', { cardMeta: {} })} tintedMetadata />
            </Labelled>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="text-states" title="Text states" description="Titles clamp to two lines and descriptions to one, so a long record never changes the card’s structure. A missing description just leaves it out.">
        <ComponentPreview
          title="Text states"
          stage="fill"
          code={`title="…a very long title…"        // clamped to 2 lines
description="…a long description…"   // truncated to 1 line
description={undefined}               // omitted`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <Labelled label="long title and description">
              <SearchResultCard
                item={withItem('publication', {
                  title: 'A comprehensive review of municipal open data practice and the barriers that keep it from reaching the people it is meant to serve',
                  description: 'This report reviews how forty municipal governments publish, document and maintain open data, and what prevents residents from using it in everyday decisions.',
                })}
                tintedMetadata
              />
            </Labelled>
            <Labelled label="no description">
              <SearchResultCard item={withItem('publication', { description: undefined })} tintedMetadata />
            </Labelled>
            <Labelled label="short">
              <SearchResultCard item={withItem('publication', { title: 'Annual report', description: 'Highlights of 2025.' })} tintedMetadata />
            </Labelled>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="behaviour" title="Link and action states" description="Without href the card is a plain container. With href the whole card is a real link (hover tints the border and background; focus shows the standard ring). With an action it becomes a keyboard-operable link-role container, because a button inside an anchor is invalid HTML, and the action’s clicks never trigger navigation.">
        <ComponentPreview
          title="Link and action states"
          stage="fill"
          code={`<ContentCard … />                                   // no href: static
<ContentCard href="/explore/datasets/ds-1" … />       // whole card is a link
<ContentCard href="…" action={<Button size="icon" variant="ghost" aria-label="Bookmark"><Bookmark /></Button>} … />`}
        >
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <Labelled label="static (no href)">
              <SearchResultCard item={withItem('publication', { href: undefined })} tintedMetadata />
            </Labelled>
            <Labelled label="link (hover or tab to it)">
              <SearchResultCard item={SAMPLE_ITEMS.publication} tintedMetadata />
            </Labelled>
            <Labelled label="with an action">
              <ContentCard
                variant="grid"
                type="publication"
                title={SAMPLE_ITEMS.publication.title}
                description={SAMPLE_ITEMS.publication.description}
                metadata={buildCardMetadata(SAMPLE_ITEMS.publication)}
                publishers={SAMPLE_ITEMS.publication.publishers}
                href="#"
                action={
                  <Button size="icon" variant="ghost" aria-label="Bookmark">
                    <Bookmark />
                  </Button>
                }
                tintedMetadata
              />
            </Labelled>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API reference">
        <SubHeading>ContentCard</SubHeading>
        <PropsTable
          rows={[
            { name: 'variant', type: "'grid' | 'list'", description: 'The layout.' },
            { name: 'type', type: 'SearchResultType', description: "'dataset' | 'use-case' | 'publication' | 'collaborative' | 'event' | 'ai-model': sets the footer label." },
            { name: 'title / description', type: 'string', description: 'The title clamps to two lines, the description to one.' },
            { name: 'metadata', type: 'ContentCardMetadataItem[]', description: '{ icon, label, tooltip? } rows.' },
            { name: 'publishers', type: '{ name; avatarUrl? }[]', description: 'Real attribution only; omit when there is none.' },
            { name: 'thumbnailUrl', type: 'string | null', description: 'A landscape cover image. When absent, use cases, collaboratives and events show a grey placeholder; other types have no image area.' },
            { name: 'href', type: 'string', description: 'Makes the whole card a link.' },
            { name: 'action', type: 'ReactNode', description: 'A secondary control; its clicks never trigger the card’s navigation.' },
            { name: 'tintedMetadata', type: 'boolean', default: 'false', description: 'The accent-tinted metadata treatment, for search and listing pages.' },
          ]}
        />
        <SubHeading>SearchResultCard</SubHeading>
        <PropsTable
          rows={[
            { name: 'item', type: 'SearchResultItem', description: 'A record from the Search index; mapped onto ContentCard (metadata via buildCardMetadata).' },
            { name: 'layout', type: "'grid' | 'list'", default: "'grid'", description: 'Passed through as the card’s variant.' },
            { name: 'tintedMetadata', type: 'boolean', description: 'Set only by true search and listing surfaces.' },
          ]}
        />
        <Callout title="Don't build a second card.">
          <p>
            A new content type extends <Code>buildCardMetadata</Code> and this card. It does not get its own card component.
          </p>
        </Callout>
      </DocSection>
    </>
  )
}

/* -------------------------------------------------------------- review flow */

export function ReviewSectionPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A collapsible section for the final Review & Publish step of every module: a title, a chevron and an optional Edit (pencil) action. Read-only sections leave out onEdit.">
        <ComponentPreview
          title="Review section"
          stage="fill"
          code={`<ReviewSection title="Details" defaultOpen onEdit={() => goToStep(1)}>
  Summary content for the Details step.
</ReviewSection>
<ReviewSection title="Connected datasets (read-only)" defaultOpen>
  No Edit action: nothing to edit here.
</ReviewSection>`}
        >
          <div className="flex w-full flex-col gap-3">
            <ReviewSection title="Details" defaultOpen onEdit={() => {}}>
              <p className="type-body text-muted-foreground">Summary content for the Details step.</p>
            </ReviewSection>
            <ReviewSection title="Connected datasets (read-only)" defaultOpen>
              <p className="type-body text-muted-foreground">No Edit action: nothing to edit here.</p>
            </ReviewSection>
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'title', type: 'string', description: 'The section heading.' },
            { name: 'defaultOpen', type: 'boolean', description: 'Whether it starts expanded. Every module’s review step passes true.' },
            { name: 'onEdit', type: '() => void', description: 'Shows the Edit action. Omit for read-only sections.' },
          ]}
        />
      </DocSection>
    </>
  )
}

export function ReviewPublishPanelPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="The centred call-to-action panel that ends every module’s Review & Publish step, one shared appearance across all modules.">
        <ComponentPreview
          title="Review publish panel"
          stage="fill"
          code={`<ReviewPublishPanel>
  <p className="type-heading-3 text-primary">Ready to publish?</p>
  <p className="type-body text-muted-foreground">Publishing makes this dataset visible in the catalogue.</p>
  <div className="mt-2 flex gap-2">
    <Button variant="outline" size="sm">Preview</Button>
    <Button size="sm">Publish</Button>
  </div>
</ReviewPublishPanel>`}
        >
          <ReviewPublishPanel className="w-full">
            <p className="type-heading-3 text-primary">Ready to publish?</p>
            <p className="type-body text-muted-foreground">Publishing makes this dataset visible in the catalogue.</p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button size="sm">Publish</Button>
            </div>
          </ReviewPublishPanel>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable rows={[{ name: 'children', type: 'ReactNode', description: 'The panel’s content.' }, { name: 'className', type: 'string', description: 'Layout overrides.' }]} />
      </DocSection>
    </>
  )
}

export function PreviewActionBarPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="The sticky header bar at the top of every full-preview page: title and subtitle on the left, primary actions on the right.">
        <ComponentPreview
          title="Preview action bar"
          stage="fill"
          code={`<PreviewActionBar>
  <div>
    <p className="type-heading-3 text-primary">Air Quality Index 2024</p>
    <p className="type-caption text-muted-foreground">Draft · last edited 2 hours ago</p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" size="sm">Back to edit</Button>
    <Button size="sm">Publish</Button>
  </div>
</PreviewActionBar>`}
        >
          <PreviewActionBar className="!static w-full">
            <div>
              <p className="type-heading-3 text-primary">Air Quality Index 2024</p>
              <p className="type-caption text-muted-foreground">Draft · last edited 2 hours ago</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Back to edit
              </Button>
              <Button size="sm">Publish</Button>
            </div>
          </PreviewActionBar>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <p className="type-body text-muted-foreground">
          rounded-xl, bordered, bg surface, shadow-sm, <Code>sticky top-4</Code>. The preview above overrides it to static so it stays in place.
        </p>
        <PropsTable rows={[{ name: 'children', type: 'ReactNode', description: 'The bar’s content.' }, { name: 'className', type: 'string', description: 'Layout overrides.' }]} />
      </DocSection>
    </>
  )
}
