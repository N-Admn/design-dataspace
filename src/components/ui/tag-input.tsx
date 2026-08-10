import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  id?: string
}

function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = React.useState('')

  const commit = () => {
    const tag = draft.trim()
    if (!tag) return
    if (!value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  return (
    <div
      className={cn(
        'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm',
        'focus-within:ring-2 focus-within:ring-ring focus-within:border-ring',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-full text-accent-foreground/70 hover:text-accent-foreground"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-32 flex-1 bg-transparent px-1 py-1 outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export { TagInput }
