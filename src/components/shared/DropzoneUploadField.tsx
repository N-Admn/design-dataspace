import * as React from 'react'
import { UploadCloud, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatUploadHint } from '@/lib/generic-upload'

interface DropzoneUploadFieldProps {
  extensions: string[]
  maxBytes: number
  multiple?: boolean
  /** Raw files straight from the input/drop event — caller owns validation and state. */
  onFiles: (files: FileList | File[]) => void
  title?: string
  browseLabel?: string
  icon?: LucideIcon
  /** Overrides the auto-generated "JPG, PNG or WEBP. Max 10MB." caption. */
  formatHint?: string
  /** Show supported extensions as a badge row instead of folding them into formatHint. */
  showExtensionBadges?: boolean
  disabled?: boolean
}

function DropzoneUploadField({
  extensions,
  maxBytes,
  multiple = false,
  onFiles,
  title,
  browseLabel = 'Browse File',
  icon: Icon = UploadCloud,
  formatHint,
  showExtensionBadges,
  disabled,
}: DropzoneUploadFieldProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const resolvedTitle = title ?? (multiple ? 'Drag and drop files here, or click to browse.' : 'Drag and drop a file here, or click to browse.')

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (disabled) return
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files)
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <Icon className="size-9 text-muted-foreground" />
      <p className="text-sm text-foreground">{resolvedTitle}</p>

      {showExtensionBadges ? (
        <div className="mt-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Supported file types:</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
            {extensions.map((ext) => (
              <Badge key={ext} variant="muted">
                {ext.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        accept={extensions.map((ext) => `.${ext}`).join(',')}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
        {browseLabel}
      </Button>

      <p className="text-xs text-muted-foreground">{formatHint ?? formatUploadHint(extensions, maxBytes)}</p>
    </div>
  )
}

export { DropzoneUploadField }
