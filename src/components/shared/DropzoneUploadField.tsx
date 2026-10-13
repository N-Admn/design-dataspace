import * as React from 'react'
import { UploadCloud } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatUploadLimit } from '@/lib/generic-upload'

interface DropzoneUploadFieldProps {
  extensions: string[]
  maxBytes: number
  multiple?: boolean
  /** Raw files straight from the input/drop event — caller owns validation and state. */
  onFiles: (files: FileList | File[]) => void
  /** What is being dropped, e.g. "a logo". The look is fixed (see the design system's "Upload fields"): only this wording varies. */
  title?: string
  /** Overrides the default "Maximum file size limit: 500MB" caption. */
  formatHint?: string
  disabled?: boolean
}

function DropzoneUploadField({
  extensions,
  maxBytes,
  multiple = false,
  onFiles,
  title,
  formatHint,
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
        isDragging ? 'border-border-brand bg-action-primary-default/5' : 'border-border-default bg-surface-subdued/40',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <UploadCloud className="size-9 text-text-subdued" />
      <p className="text-sm text-text-default">{resolvedTitle}</p>

      {/* The standard upload surface: icon, instruction, supported types as badges, Browse File, size limit. */}
      {extensions.length > 0 && (
        <div className="mt-1 text-xs text-text-subdued">
          <p className="font-medium text-text-default">Supported file types:</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
            {extensions.map((ext) => (
              <Badge key={ext} variant="muted">
                {ext.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}

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
        Browse File
      </Button>

      <p className="text-xs text-text-subdued">{formatHint ?? `Maximum file size limit: ${formatUploadLimit(maxBytes)}`}</p>
    </div>
  )
}

export { DropzoneUploadField }
