import * as React from 'react'
import { UploadCloud, type LucideIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { cn } from '@/lib/utils'
import { validateAssetFile, buildUploadedAsset, formatUploadHint, type UploadedAsset } from '@/lib/generic-upload'

interface FileUploadFieldProps {
  id?: string
  /** Omit when a surrounding CardTitle already names this field (e.g. a dedicated "Cover Image" card). */
  label?: string
  required?: boolean
  /** Shown under the label, above the control — what this upload is for. */
  helperText?: string
  value: UploadedAsset | null
  onChange: (asset: UploadedAsset | null) => void
  extensions: string[]
  maxBytes: number
  /** Overrides the auto-generated "JPG, PNG or WEBP. Max 20MB." caption. */
  formatHint?: string
  error?: string
  /** Icon shown when the asset has no image preview (documents, attachments). Ignored once a dataUrl exists. */
  fallbackIcon?: LucideIcon
  /** True circular preview (avatars) vs the default rounded-square. */
  roundedFull?: boolean
  previewSizeClassName?: string
  uploadLabel?: string
  disabled?: boolean
  /** Shown beside the Upload button in the empty state, e.g. initials for an avatar field. */
  emptyPreview?: React.ReactNode
  /** 'dropzone' promotes this to the large drag-and-drop box — use for a screen's primary/hero
   * image (Thumbnail, Cover Image). 'compact' (default) is for secondary fields embedded in a
   * larger form (logos, avatars, attachments). Both share the exact same filled-state row. */
  variant?: 'compact' | 'dropzone'
  /** Dropzone variant only — overrides the default "Drag and drop an image here, or click to browse." */
  dropzoneTitle?: string
}

function FileUploadField({
  id,
  label,
  required,
  helperText,
  value,
  onChange,
  extensions,
  maxBytes,
  formatHint,
  error,
  fallbackIcon: FallbackIcon,
  roundedFull,
  previewSizeClassName = 'size-12',
  uploadLabel = 'Upload',
  disabled,
  emptyPreview,
  variant = 'compact',
  dropzoneTitle,
}: FileUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = React.useState<string | undefined>(undefined)

  const handleFile = async (file: File) => {
    const validationError = validateAssetFile(file, { extensions, maxBytes })
    if (validationError) {
      setLocalError(validationError)
      return
    }
    setLocalError(undefined)
    // Only image files get a rendered thumbnail — a data URI for a PDF/DOCX etc. isn't paintable as an <img>.
    onChange(await buildUploadedAsset(file, file.type.startsWith('image/')))
  }

  const shownError = error ?? localError
  const isEmptyDropzone = variant === 'dropzone' && !value

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {helperText && <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>}

      <div className="mt-1.5">
        {value ? (
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            {value.dataUrl ? (
              <img
                src={value.dataUrl}
                alt=""
                className={cn('shrink-0 border border-border object-cover', previewSizeClassName, roundedFull ? 'rounded-full' : 'rounded-md')}
              />
            ) : (
              FallbackIcon && (
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center bg-muted text-muted-foreground',
                    previewSizeClassName,
                    roundedFull ? 'rounded-full' : 'rounded-md',
                  )}
                >
                  <FallbackIcon className="size-1/2" />
                </div>
              )
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
              {value.sizeLabel && <p className="text-xs text-muted-foreground">{value.sizeLabel}</p>}
            </div>
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        ) : variant === 'dropzone' ? (
          <DropzoneUploadField
            extensions={extensions}
            maxBytes={maxBytes}
            title={dropzoneTitle ?? 'Drag and drop an image here, or click to browse.'}
            browseLabel={uploadLabel === 'Upload' ? 'Browse File' : uploadLabel}
            formatHint={formatHint}
            disabled={disabled}
            onFiles={(files) => {
              const file = files[0]
              if (file) handleFile(file)
            }}
          />
        ) : (
          <div className="flex items-center gap-3">
            {emptyPreview}
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              <UploadCloud className="size-4" />
              {uploadLabel}
            </Button>
          </div>
        )}
        {!isEmptyDropzone && (
          <input
            ref={inputRef}
            id={id}
            type="file"
            className="hidden"
            disabled={disabled}
            accept={extensions.map((ext) => `.${ext}`).join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        )}
      </div>
      <FieldError message={shownError} />
      {/* The dropzone box already shows its own hint inline — avoid showing it twice. */}
      {!isEmptyDropzone && <p className="mt-1.5 text-xs text-muted-foreground">{formatHint ?? formatUploadHint(extensions, maxBytes)}</p>}
    </div>
  )
}

export { FileUploadField }
