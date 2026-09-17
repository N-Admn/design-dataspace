import * as React from 'react'
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Underline } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  id?: string
  minHeightClassName?: string
  /** Show the structured block controls (paragraph, H2, H3, quote) ahead of the
   * inline formatting group. Off by default so lightweight description fields
   * keep the compact inline-only toolbar. */
  blockControls?: boolean
}

/** Shared styling for rendered rich-text output — used by the editor's own
 * editable surface and by every read-only view that prints saved HTML, so the
 * draft and the published block look identical. */
export const richTextClassName =
  'prose-sm text-sm text-text-default ' +
  '[&_a]:text-text-brand [&_a]:underline ' +
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 ' +
  '[&_p+p]:mt-2 ' +
  '[&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-text-brand [&_h2:first-child]:mt-0 ' +
  '[&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-default [&_h3:first-child]:mt-0 ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-border-default [&_blockquote]:pl-3 [&_blockquote]:text-text-subdued [&_blockquote]:italic'

type ToolbarAction = {
  command: string
  icon: typeof Bold
  label: string
  /** For `formatBlock` — the block tag this button applies. */
  value?: string
  needsValue?: boolean
}

const BLOCK_ACTIONS: ToolbarAction[] = [
  { command: 'formatBlock', value: 'p', icon: Pilcrow, label: 'Paragraph' },
  { command: 'formatBlock', value: 'h2', icon: Heading2, label: 'Heading 2' },
  { command: 'formatBlock', value: 'h3', icon: Heading3, label: 'Heading 3' },
  { command: 'formatBlock', value: 'blockquote', icon: Quote, label: 'Quote' },
]

const INLINE_ACTIONS: ToolbarAction[] = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'insertUnorderedList', icon: List, label: 'Bulleted list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
  { command: 'createLink', icon: Link2, label: 'Link', needsValue: true },
]

function RichTextEditor({
  value,
  onChange,
  placeholder,
  id,
  minHeightClassName = 'min-h-28',
  blockControls = false,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const isEmpty = value.trim() === '' || value.trim() === '<p></p>' || value.trim() === '<br>'

  React.useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
    }
    // Only resync from external value changes (e.g. block reset), not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runCommand = (action: ToolbarAction) => {
    editorRef.current?.focus()
    if (action.needsValue) {
      const url = window.prompt('Enter a URL')
      if (!url) return
      document.execCommand(action.command, false, url)
    } else {
      document.execCommand(action.command, false, action.value)
    }
    onChange(editorRef.current?.innerHTML ?? '')
  }

  const renderButton = (action: ToolbarAction) => {
    const Icon = action.icon
    return (
      <button
        key={action.label}
        type="button"
        aria-label={action.label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => runCommand(action)}
        className="flex size-7 items-center justify-center rounded-md text-text-subdued transition-colors hover:bg-surface-subdued hover:text-text-default"
      >
        <Icon className="size-3.5" />
      </button>
    )
  }

  return (
    <div className={cn('rounded-md border border-border-input bg-surface-default', 'focus-within:ring-2 focus-within:ring-border-focus focus-within:border-border-focus')}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border-default px-1.5 py-1">
        {blockControls && (
          <>
            {BLOCK_ACTIONS.map(renderButton)}
            <span className="mx-1 h-4 w-px shrink-0 bg-border-default" />
          </>
        )}
        {INLINE_ACTIONS.map(renderButton)}
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-text-subdued">{placeholder}</p>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange(e.currentTarget.innerHTML)}
          className={cn(richTextClassName, 'w-full px-3 py-2 outline-none', minHeightClassName)}
        />
      </div>
    </div>
  )
}

export { RichTextEditor }
