import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { Callout, Code, ComponentPreview, DocSection, PropsTable, ReferenceTable } from '@/pages/design-system/docs/primitives'

/* ----------------------------------------------------------------- tooltip */

export function TooltipPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A short label that appears on hover or focus. The provider lives at the app root, with a 200ms delay.">
        <ComponentPreview
          title="Tooltip"
          code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent side="top">Explicit side="top"</TooltipContent>
</Tooltip>`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me (right)</Button>
            </TooltipTrigger>
            <TooltipContent>Default side: right, 8px offset</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me (top)</Button>
            </TooltipTrigger>
            <TooltipContent side="top">Explicit side="top"</TooltipContent>
          </Tooltip>
        </ComponentPreview>
        <Callout title="A tooltip never holds the only copy of something important." tone="dont">
          <p>It is not shown on touch and is easy to miss. Put essential information in the page, and use a tooltip for the extra.</p>
        </Callout>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", default: "'right'", description: 'TooltipContent: which side of the trigger to open on.' },
            { name: 'asChild', type: 'boolean', description: 'TooltipTrigger: use the child element as the trigger.' },
          ]}
        />
        <p className="type-body text-muted-foreground">Built on Radix Tooltip: bg-card, border, shadow-md, text-xs font-medium.</p>
      </DocSection>
    </>
  )
}

/* ----------------------------------------------------------------- popover */

export function PopoverPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A small floating panel anchored to its trigger. Its width defaults to the trigger’s, which is what backs the select pickers.">
        <ComponentPreview
          title="Popover"
          code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-64 p-4">
    <p className="type-label text-foreground">Popover content</p>
  </PopoverContent>
</Popover>`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <p className="type-label text-foreground">Popover content</p>
              <p className="type-body mt-1 text-muted-foreground">Any composed content. The selects put a search field and an option list in here.</p>
            </PopoverContent>
          </Popover>
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <p className="type-body text-muted-foreground">Built on Radix Popover: bg-popover, border, shadow-md, radius-md. Pass a width through <Code>className</Code>.</p>
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------------ dialog */

export function DialogPage() {
  return (
    <>
      <DocSection
        id="variants"
        title="Variants"
        description="One platform pattern (Radix Dialog) with three placements. The overlay is bg-black/40, the content bg-card with shadow-lg, and tall content scrolls inside a capped height."
      >
        <ComponentPreview
          title="Dialog variants"
          code={`<Dialog>
  <DialogTrigger asChild><Button variant="outline">center</Button></DialogTrigger>
  <DialogContent variant="center" className="p-0">
    <DialogHeader>
      <DialogTitle>Dialog title</DialogTitle>
      <DialogDescription>What this dialog is for.</DialogDescription>
    </DialogHeader>
    <div className="px-6 py-5">Body content scrolls independently.</div>
  </DialogContent>
</Dialog>`}
        >
          {(['center', 'right-drawer', 'anchored'] as const).map((variant) => (
            <Dialog key={variant}>
              <DialogTrigger asChild>
                <Button variant="outline">{variant}</Button>
              </DialogTrigger>
              <DialogContent variant={variant} className="p-0">
                <DialogHeader>
                  <DialogTitle>Dialog: {variant}</DialogTitle>
                  <DialogDescription>
                    {variant === 'center' && 'Centred modal, up to max-w-2xl, for focused tasks and confirms.'}
                    {variant === 'right-drawer' && 'Edge drawer, up to about 760px, for side workflows like creation wizards.'}
                    {variant === 'anchored' && 'Bottom-right panel, 380px, for help and contextual assistants.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-5">
                  <p className="type-body text-muted-foreground">Body content scrolls independently.</p>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </ComponentPreview>
        <ReferenceTable
          columns={['Variant', 'Use for']}
          rows={[
            ['center', 'Focused tasks and confirmations.'],
            ['right-drawer', 'Side workflows. An “add another” action in a contributor form always opens here.'],
            ['anchored', 'Help and contextual assistants.'],
          ]}
        />
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable rows={[{ name: 'variant', type: "'center' | 'right-drawer' | 'anchored'", default: "'center'", description: 'DialogContent: where and how the dialog opens.' }]} />
      </DocSection>
    </>
  )
}

/* ----------------------------------------------------------------- confirm */

function ConfirmExample() {
  const confirm = useConfirm()
  const [result, setResult] = React.useState('—')
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="destructive"
        onClick={async () => {
          const ok = await confirm({
            title: 'Delete this dataset?',
            description: 'This permanently removes the dataset and its files. This cannot be undone.',
            confirmLabel: 'Delete dataset',
            variant: 'destructive',
          })
          setResult(ok ? 'confirmed' : 'cancelled')
        }}
      >
        Destructive confirm
      </Button>
      <Button
        onClick={async () => {
          const ok = await confirm({
            title: 'Publish this Use Case?',
            description: 'It becomes visible to everyone with access to the workspace.',
            confirmLabel: 'Publish',
          })
          setResult(ok ? 'confirmed' : 'cancelled')
        }}
      >
        Default confirm
      </Button>
      <span className="type-caption font-mono text-muted-foreground">last result: {result}</span>
    </div>
  )
}

export function ConfirmDialogPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A promise-based gate for every confirmation. Await it; it resolves true or false.">
        <ComponentPreview
          title="Confirm dialog"
          code={`const confirm = useConfirm()

const ok = await confirm({
  title: 'Delete this dataset?',
  description: 'This permanently removes the dataset and its files.',
  confirmLabel: 'Delete dataset',
  variant: 'destructive',
})
if (ok) deleteDataset()`}
        >
          <ConfirmExample />
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference" description="useConfirm() returns a function that takes these options.">
        <PropsTable
          rows={[
            { name: 'title', type: 'string', description: 'The question.' },
            { name: 'description', type: 'string', description: 'What will happen.' },
            { name: 'confirmLabel', type: 'string', description: 'The confirm button’s label: name the action.' },
            { name: 'cancelLabel', type: 'string', description: 'The cancel button’s label.' },
            { name: 'variant', type: "'default' | 'destructive'", default: "'default'", description: "destructive for deletes; default for state changes like publish." },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------------- toast */

function ToastExample() {
  const toast = useToast()
  return (
    <>
      <Button variant="outline" onClick={() => toast({ title: 'Dataset published', description: 'It is now visible in the catalogue.' })}>
        Success toast
      </Button>
      <Button variant="outline" onClick={() => toast({ variant: 'error', title: 'Upload failed', description: 'The file exceeds the 10 MB limit.' })}>
        Error toast
      </Button>
    </>
  )
}

export function ToastPage() {
  return (
    <>
      <DocSection id="usage" title="Usage" description="A short message that confirms or reports something, top-right, auto-dismissing after 4 seconds.">
        <ComponentPreview
          title="Toast"
          code={`const toast = useToast()

toast({ title: 'Dataset published', description: 'It is now visible in the catalogue.' })
toast({ variant: 'error', title: 'Upload failed', description: 'The file exceeds the 10 MB limit.' })`}
        >
          <ToastExample />
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'title', type: 'string', description: 'The headline.' },
            { name: 'description', type: 'string', description: 'One line of detail.' },
            { name: 'variant', type: "'success' | 'error'", default: "'success'", description: 'success uses a check icon and success-text; error an alert icon and destructive.' },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------ leave dialog */

export function LeaveDialogPage() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <DocSection id="usage" title="Usage" description="The single unsaved-changes gate for every creation and edit flow: Save, Discard or Cancel. It handles edit state only and never publishes or changes a lifecycle status.">
        <ComponentPreview
          title="Leave creation dialog"
          code={`<LeaveCreationDialog
  open={open}
  itemLabel="dataset"
  onSave={saveAndLeave}
  onDiscard={discardAndLeave}
  onCancel={() => setOpen(false)}
/>`}
        >
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open unsaved-changes gate
          </Button>
          <LeaveCreationDialog open={open} itemLabel="dataset" onSave={() => setOpen(false)} onDiscard={() => setOpen(false)} onCancel={() => setOpen(false)} />
        </ComponentPreview>
      </DocSection>
      <DocSection id="api" title="API reference">
        <PropsTable
          rows={[
            { name: 'open', type: 'boolean', description: 'Whether the dialog is showing.' },
            { name: 'itemLabel', type: 'string', description: 'What is being edited, e.g. “dataset”.' },
            { name: 'onSave', type: '() => void', description: 'Persist the working copy, keeping its lifecycle status, then leave.' },
            { name: 'onDiscard', type: '() => void', description: 'Drop the unsaved changes and leave.' },
            { name: 'onCancel', type: '() => void', description: 'Stay on the page.' },
          ]}
        />
      </DocSection>
    </>
  )
}
