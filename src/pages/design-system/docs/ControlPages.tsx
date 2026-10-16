import * as React from 'react'
import { Bell, Settings2, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { MultiSelectFilter } from '@/components/ui/multi-select-filter'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Tag, TAG_SIZES, type TagSize } from '@/components/ui/tag'
import { TagInput } from '@/components/ui/tag-input'
import { Textarea } from '@/components/ui/textarea'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { UploadedAsset } from '@/lib/generic-upload'
import { Callout, Code, ComponentPreview, DoDont, DocSection, Example, PropsTable, SubHeading } from '@/pages/design-system/docs/primitives'

const BUTTON_VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive', 'successOutline'] as const
const BADGE_VARIANTS = ['default', 'secondary', 'outline', 'accent', 'success', 'warning', 'destructive', 'muted'] as const

const SAMPLE_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'environment', label: 'Environment' },
  { value: 'finance', label: 'Public Finance' },
  { value: 'housing', label: 'Housing' },
]

/* ------------------------------------------------------------------ button */

export function ButtonPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="Use a Button for an action. Use a link for navigation (or Button with asChild around one).">
        <ComponentPreview
          title="Default button"
          code={`import { Button } from '@/components/ui/button'

<Button>Save changes</Button>`}
        >
          <Button>Save changes</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="variants" title="Variants" description="Variants only reference tokens, so they follow the theme.">
        <ComponentPreview
          title="Button variants"
          stage="fill"
          code={BUTTON_VARIANTS.map((v) => `<Button variant="${v}">${v}</Button>`).join('\n')}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="sizes" title="Sizes" description="default is 40px tall, sm 36px, lg 44px. icon is a 36px square for an icon-only button, which needs an aria-label.">
        <ComponentPreview
          title="Button sizes"
          code={`<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>
<Button size="icon" aria-label="Settings"><Settings2 /></Button>`}
        >
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Settings">
            <Settings2 />
          </Button>
          <Button size="icon" variant="outline" aria-label="Notifications">
            <Bell />
          </Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="with-icon" title="With an icon and disabled" description="Icons are 16px by default; put them before or after the label. A disabled button drops to 50% opacity and ignores pointer events.">
        <ComponentPreview
          title="Icon and disabled buttons"
          code={`<Button><Upload /> Upload file</Button>
<Button variant="outline" disabled>Disabled</Button>`}
        >
          <Button>
            <Upload /> Upload file
          </Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="guidance" title="Guidance">
        <DoDont>
          <Example tone="do" caption="One default (filled) button per area, for the main action.">
            <Button variant="outline">Cancel</Button>
            <Button>Publish</Button>
          </Example>
          <Example tone="dont" caption="Two filled buttons competing for attention.">
            <Button>Cancel</Button>
            <Button>Publish</Button>
          </Example>
        </DoDont>
        <Callout title="Destructive actions ask first.">
          <p>
            Use the destructive variant for delete-style actions and put them behind the <Code>useConfirm</Code> gate so they can't be triggered by
            accident.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="api" title="API reference" description="Button accepts every native button attribute, plus these.">
        <PropsTable
          rows={[
            { name: 'variant', type: BUTTON_VARIANTS.map((v) => `'${v}'`).join(' | '), default: "'default'", description: 'The visual style.' },
            { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", default: "'default'", description: 'The height and padding.' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the single child (a link, say) with the button styling instead of a <button>.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------------- badge */

export function BadgePage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A Badge labels something (a status, a type) and is not clickable. For a clickable pill use Tag.">
        <ComponentPreview
          title="Badge variants"
          code={BADGE_VARIANTS.map((v) => `<Badge variant="${v}">${v}</Badge>`).join('\n')}
        >
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </ComponentPreview>
      </DocSection>

      <DocSection id="status-badge" title="StatusBadge" description="The shared lifecycle chip. It shows lifecycle only (Draft or Published); an edit state such as “Unsaved changes” is a separate indicator and is never stacked on it.">
        <ComponentPreview
          title="Status badges"
          code={`import { StatusBadge } from '@/components/shared/StatusBadge'

<StatusBadge status="published" />
<StatusBadge status="draft" />
<Badge variant="warning">Unsaved changes</Badge>`}
        >
          <StatusBadge status="published" />
          <StatusBadge status="draft" />
          <Badge variant="warning">Unsaved changes</Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'variant', type: BADGE_VARIANTS.map((v) => `'${v}'`).join(' | '), default: "'default'", description: 'The visual style. success, warning and destructive are tints with matching text, so they stay readable.' },
          ]}
        />
        <PropsTable rows={[{ name: 'status', type: "'draft' | 'published'", description: 'StatusBadge: the record’s lifecycle status.' }]} />
      </DocSection>
    </>
  )
}

/* --------------------------------------------------------------------- tag */

export function TagPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A clickable pill, the interactive counterpart of Badge. It is always a real link or button, so it is focusable and announced correctly.">
        <ComponentPreview
          title="Tag variants"
          code={`<Tag to="/search?type=dataset&tag=GDP">In-app link</Tag>
<Tag href="https://example.org" target="_blank" rel="noreferrer">External link</Tag>
<Tag onClick={() => {}}>Button</Tag>`}
        >
          <Tag to="/search?type=dataset&tag=GDP">In-app link</Tag>
          <Tag href="https://www.un.org/sustainabledevelopment/" target="_blank" rel="noreferrer">
            External link
          </Tag>
          <Tag onClick={() => {}}>Button</Tag>
        </ComponentPreview>
      </DocSection>

      <DocSection id="sizes" title="Sizes" description="Four sizes, each 20% bigger than the one before. Padding and gap are in em, so the whole pill scales together while the border stays 1px.">
        <ComponentPreview
          title="Tag sizes"
          code={`<Tag size="sm" to="/search">Climate action</Tag>
<Tag size="md" to="/search">Climate action</Tag>
<Tag size="lg" to="/search">Climate action</Tag>
<Tag size="xl" to="/search">Climate action</Tag>`}
        >
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            {(Object.keys(TAG_SIZES) as TagSize[]).map((size) => (
              <div key={size} className="flex flex-col items-start gap-2">
                <Tag size={size} to={`/search?type=dataset&tag=${size}`}>
                  Climate action
                </Tag>
                <span className="type-caption font-mono text-muted-foreground">
                  {size} · {TAG_SIZES[size].fontPx}px · ×{TAG_SIZES[size].scale}
                </span>
              </div>
            ))}
          </div>
        </ComponentPreview>
        <ul className="type-body flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">sm</strong> beside body text and metadata (the dataset page's tags), <strong className="text-foreground">md</strong> under headings,{' '}
            <strong className="text-foreground">lg</strong> under a display or hero title (the collaborative hero), <strong className="text-foreground">xl</strong> for a standalone feature tag.
          </li>
          <li>Keep one size per group.</li>
        </ul>
      </DocSection>

      <DocSection id="guidance" title="Guidance">
        <Callout title="Tag goes somewhere; Badge only labels." tone="do">
          <p>Use Tag for a value that links somewhere or filters something. Use Badge for status and type labels, never Tag.</p>
        </Callout>
      </DocSection>

      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'sm'", description: 'The size step.' },
            { name: 'to', type: 'string', description: 'An in-app route; renders a router Link.' },
            { name: 'href', type: 'string', description: 'An external URL; renders an <a>. Pass target and rel as needed.' },
            { name: 'onClick', type: '(event) => void', description: 'With neither to nor href, renders a <button>.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ----------------------------------------------------------- form controls */

export function FormControlsPage() {
  return (
    <>
      <DocSection
        id="input"
        title="Input and Textarea"
        description="40px tall, rounded-md, with a border-input border that meets 3:1 non-text contrast. Focus adds a 2px ring. Invalid is driven by aria-invalid."
      >
        <ComponentPreview
          title="Inputs"
          stage="fill"
          code={`<div className="flex flex-col gap-1.5">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Placeholder text" />
</div>

<div className="flex flex-col gap-1.5">
  <Label htmlFor="url">Website</Label>
  <Input id="url" aria-invalid defaultValue="Not a valid value" />
  <FieldError message="This field has an error." />
</div>

<Textarea placeholder="Multi-line input…" />`}
        >
          <div className="grid w-full gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input">Label — default input</Label>
              <Input id="ds-input" placeholder="Placeholder text" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input-invalid">Label — invalid input</Label>
              <Input id="ds-input-invalid" aria-invalid defaultValue="Not a valid value" />
              <FieldError message="This field has an error." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-input-disabled">Label — disabled input</Label>
              <Input id="ds-input-disabled" disabled placeholder="Disabled" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-textarea">Label — textarea</Label>
              <Textarea id="ds-textarea" placeholder="Multi-line input…" />
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="checkbox" title="Checkbox" description="Pair every checkbox with a visible label.">
        <ComponentPreview
          title="Checkboxes"
          code={`<label className="flex items-center gap-2 text-sm">
  <Checkbox defaultChecked /> Checked
</label>
<label className="flex items-center gap-2 text-sm">
  <Checkbox /> Unchecked
</label>
<label className="flex items-center gap-2 text-sm text-muted-foreground">
  <Checkbox disabled /> Disabled
</label>`}
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked /> Checked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox /> Unchecked
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox disabled /> Disabled
            </label>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="radio-group" title="Radio group" description="One choice from a short list.">
        <ComponentPreview
          title="Radio group"
          code={`<RadioGroup defaultValue="a">
  <label className="flex items-center gap-2 text-sm">
    <RadioGroupItem value="a" /> Option A
  </label>
  <label className="flex items-center gap-2 text-sm">
    <RadioGroupItem value="b" /> Option B
  </label>
</RadioGroup>`}
        >
          <RadioGroup defaultValue="a">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="a" /> Option A
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="b" /> Option B
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <RadioGroupItem value="c" disabled /> Option C (disabled)
            </label>
          </RadioGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API reference">
        <PropsTable rows={[{ name: 'message', type: 'string', description: 'FieldError: the error text, shown in destructive-text under the control.' }]} />
        <p className="type-body text-muted-foreground">
          Input, Textarea, Checkbox and RadioGroup accept the native attributes of their element. Set <Code>aria-invalid</Code> to show the invalid
          state.
        </p>
      </DocSection>
    </>
  )
}

/* ----------------------------------------------------------------- selects */

export function SelectsPage() {
  const [single, setSingle] = React.useState('')
  const [multi, setMulti] = React.useState<string[]>(['education'])
  const [filter, setFilter] = React.useState<string[]>(['transport', 'health'])
  return (
    <>
      <DocSection
        id="overview"
        title="Overview"
        description="Three pickers share one dropdown pattern: a 40px trigger with a border-input border, a popover, a search field and checkmarks. Selected values appear as accent chips."
      >
        <ul className="type-body flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
          <li><strong className="text-foreground">SearchableSelect</strong>: pick one option, with search.</li>
          <li><strong className="text-foreground">MultiSelect</strong>: pick several; the choices show as removable chips below.</li>
          <li><strong className="text-foreground">MultiSelectFilter</strong>: for filters; the selected options float to the top of the list.</li>
        </ul>
      </DocSection>

      <DocSection id="searchable-select" title="SearchableSelect">
        <ComponentPreview
          title="SearchableSelect"
          code={`const [value, setValue] = useState('')

<SearchableSelect
  options={[{ value: 'health', label: 'Health' }, …]}
  value={value}
  onChange={setValue}
  placeholder="Pick a sector"
/>`}
        >
          <div className="w-64">
            <SearchableSelect options={SAMPLE_OPTIONS} value={single} onChange={setSingle} placeholder="Pick a sector" />
          </div>
        </ComponentPreview>
        <PropsTable
          rows={[
            { name: 'options', type: '{ value: string; label: string }[]', description: 'The choices.' },
            { name: 'value', type: 'string', description: 'The selected value.' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called with the new value.' },
            { name: 'placeholder', type: 'string', description: 'Shown when nothing is selected.' },
            { name: 'searchPlaceholder / emptyText', type: 'string', description: 'Wording for the search field and the no-match state.' },
            { name: 'invalid', type: 'boolean', description: 'Shows the invalid border.' },
          ]}
        />
      </DocSection>

      <DocSection id="multi-select" title="MultiSelect">
        <ComponentPreview
          title="MultiSelect"
          code={`const [values, setValues] = useState(['education'])

<MultiSelect options={options} values={values} onChange={setValues} placeholder="Pick sectors" />`}
        >
          <div className="w-72">
            <MultiSelect options={SAMPLE_OPTIONS} values={multi} onChange={setMulti} placeholder="Pick sectors" />
          </div>
        </ComponentPreview>
        <PropsTable
          rows={[
            { name: 'values', type: 'string[]', description: 'The selected values.' },
            { name: 'onChange', type: '(values: string[]) => void', description: 'Called with the new set.' },
            { name: 'showSelected', type: 'boolean', default: 'true', description: 'Show the selection as removable chips under the control; turn off where space is tight.' },
          ]}
        />
      </DocSection>

      <DocSection id="multi-select-filter" title="MultiSelectFilter">
        <ComponentPreview
          title="MultiSelectFilter"
          code={`<MultiSelectFilter
  options={options}
  value={selected}
  onToggle={(v) => setSelected((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
  placeholder="Filter by sector"
/>`}
        >
          <div className="w-72">
            <MultiSelectFilter
              options={SAMPLE_OPTIONS}
              value={filter}
              onToggle={(v) => setFilter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))}
              placeholder="Filter by sector"
            />
          </div>
        </ComponentPreview>
        <PropsTable
          rows={[
            { name: 'value', type: 'string[]', description: 'The selected values, in the order they were picked.' },
            { name: 'onToggle', type: '(value: string) => void', description: 'Called when an option is toggled.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* --------------------------------------------------------- tag input, rich */

export function TagInputPage() {
  const [tags, setTags] = React.useState<string[]>(['open-data', 'census'])
  return (
    <>
      <DocSection id="usage" title="Usage" description="Free-text tokens: press Enter to commit, Backspace on an empty field to remove the last. Chips use the accent tint.">
        <ComponentPreview
          title="Tag input"
          stage="fill"
          code={`const [tags, setTags] = useState(['open-data', 'census'])

<TagInput value={tags} onChange={setTags} placeholder="Add a keyword and press Enter" />`}
        >
          <TagInput value={tags} onChange={setTags} placeholder="Add a keyword and press Enter" />
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'value', type: 'string[]', description: 'The current tags.' },
            { name: 'onChange', type: '(tags: string[]) => void', description: 'Called with the new list.' },
            { name: 'placeholder', type: 'string', description: 'Shown when the field is empty.' },
          ]}
        />
      </DocSection>
    </>
  )
}

export function RichTextEditorPage() {
  const [html, setHtml] = React.useState('<p>Type here — <strong>bold</strong>, lists, and links are supported.</p>')
  return (
    <>
      <DocSection id="usage" title="Usage" description="A contentEditable field with a fixed toolbar: bold, italic, underline, lists and a link. Its border and focus ring match the other controls.">
        <ComponentPreview
          title="Rich text editor"
          stage="fill"
          code={`const [html, setHtml] = useState('')

<RichTextEditor value={html} onChange={setHtml} placeholder="Description…" />`}
        >
          <RichTextEditor value={html} onChange={setHtml} placeholder="Description…" />
        </ComponentPreview>
        <Callout title="Sanitise before showing the HTML.">
          <p>
            The value is HTML. Anything displayed to other people goes through <Code>sanitizeHtml</Code> first.
          </p>
        </Callout>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'value', type: 'string', description: 'The HTML content.' },
            { name: 'onChange', type: '(html: string) => void', description: 'Called as the content changes.' },
            { name: 'blockControls', type: 'boolean', default: 'false', description: 'Add paragraph, H2, H3 and quote controls ahead of the inline formatting group.' },
            { name: 'minHeightClassName', type: 'string', description: 'Tailwind class for the editing area’s minimum height.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------------ upload */

export function UploadFieldsPage() {
  const [logo, setLogo] = React.useState<UploadedAsset | null>(null)
  return (
    <>
      <DocSection
        id="standard"
        title="The standard"
        description="One standard for every file upload: forms, side sheets, modals and dialogs. The empty state is always this dropzone: icon, instruction, supported-type badges, Browse File and the size limit."
      >
        <ComponentPreview
          title="Dropzone"
          stage="fill"
          code={`<DropzoneUploadField
  extensions={['CSV', 'XLSX', 'JSON']}
  maxBytes={10 * 1024 * 1024}
  multiple
  onFiles={(files) => addFiles(files)}
/>`}
        >
          <DropzoneUploadField extensions={['CSV', 'XLSX', 'JSON']} maxBytes={10 * 1024 * 1024} multiple onFiles={() => {}} />
        </ComponentPreview>
        <Callout title="Never a bare Upload button." tone="dont">
          <ul>
            <li>No compact or button-only variant and no bespoke dashed box.</li>
            <li>Only the instruction wording changes (<Code>title</Code> / <Code>dropzoneTitle</Code>). The icon, badges, Browse File label and size caption are fixed.</li>
            <li>Extensions and the size limit come from the field’s own validation constants, so the badges always match what is accepted.</li>
          </ul>
        </Callout>
      </DocSection>

      <DocSection id="single" title="Single asset" description="FileUploadField is for a field that holds one asset: label, helper text and error, then the dropzone, then a preview row with Replace and Remove.">
        <ComponentPreview
          title="File upload field"
          stage="fill"
          code={`const [logo, setLogo] = useState<UploadedAsset | null>(null)

<FileUploadField
  label="Logo"
  helperText="Shown on your public profile."
  value={logo}
  onChange={setLogo}
  extensions={['PNG', 'JPG', 'SVG']}
  maxBytes={2 * 1024 * 1024}
  dropzoneTitle="a logo"
/>`}
        >
          <div className="w-full max-w-lg">
            <FileUploadField
              label="Logo"
              helperText="Shown on your public profile."
              value={logo}
              onChange={setLogo}
              extensions={['PNG', 'JPG', 'SVG']}
              maxBytes={2 * 1024 * 1024}
              dropzoneTitle="a logo"
            />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API reference">
        <SubHeading>DropzoneUploadField</SubHeading>
        <PropsTable
          rows={[
            { name: 'extensions', type: 'string[]', description: 'Accepted file types, shown as badges.' },
            { name: 'maxBytes', type: 'number', description: 'The size limit, shown in the caption.' },
            { name: 'multiple', type: 'boolean', default: 'false', description: 'Accept several files.' },
            { name: 'onFiles', type: '(files: FileList | File[]) => void', description: 'Raw files from the input or drop; the caller owns validation and state.' },
            { name: 'title', type: 'string', description: 'What is being dropped, e.g. “a logo”.' },
            { name: 'formatHint', type: 'string', description: 'Replaces the default size-limit caption.' },
          ]}
        />
        <SubHeading>FileUploadField</SubHeading>
        <PropsTable
          rows={[
            { name: 'value / onChange', type: 'UploadedAsset | null', description: 'The held asset.' },
            { name: 'extensions / maxBytes', type: 'string[] / number', description: 'Accepted types and size limit.' },
            { name: 'label / helperText / error', type: 'string', description: 'Field copy; omit label where a card title already names it.' },
            { name: 'roundedFull', type: 'boolean', default: 'false', description: 'A circular preview, for avatars.' },
            { name: 'dropzoneTitle', type: 'string', description: 'Wording for the dropzone instruction.' },
          ]}
        />
      </DocSection>
    </>
  )
}
