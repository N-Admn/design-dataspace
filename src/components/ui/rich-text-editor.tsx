import * as React from 'react'
import { Bold, Italic, Link2, List, ListOrdered, Underline } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  id?: string
  minHeightClassName?: string
}

const TOOLBAR_ACTIONS: { command: string; icon: typeof Bold; label: string; needsValue?: boolean }[] = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'insertUnorderedList', icon: List, label: 'Bulleted list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
  { command: 'createLink', icon: Link2, label: 'Link', needsValue: true },
]

function RichTextEditor({ value, onChange, placeholder, id, minHeightClassName = 'min-h-28' }: RichTextEditorProps) {
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

  const runCommand = (command: string, needsValue?: boolean) => {
    editorRef.current?.focus()
    if (needsValue) {
      const url = window.prompt('Enter a URL')
      if (!url) return
      document.execCommand(command, false, url)
    } else {
      document.execCommand(command, false)
    }
    onChange(editorRef.current?.innerHTML ?? '')
  }

  return (
    <div className={cn('rounded-md border border-input bg-background', 'focus-within:ring-2 focus-within:ring-ring focus-within:border-ring')}>
      <div className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
        {TOOLBAR_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.command}
              type="button"
              aria-label={action.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(action.command, action.needsValue)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-3.5" />
            </button>
          )
        })}
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">{placeholder}</p>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange(e.currentTarget.innerHTML)}
          className={cn(
            'prose-sm w-full px-3 py-2 text-sm text-foreground outline-none [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
            minHeightClassName,
          )}
        />
      </div>
    </div>
  )
}

export { RichTextEditor }
