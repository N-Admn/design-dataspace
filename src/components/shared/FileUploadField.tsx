import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { cn } from '@/lib/utils'
import { validateAssetFile, buildUploadedAsset, type UploadedAsset } from '@/lib/generic-upload'

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
  /** Overrides the default "Maximum file size limit: 500MB" caption. */
  formatHint?: string
  error?: string
  /** Icon shown when the asset has no image preview (documents, attachments). Ignored once a dataUrl exists. */
  fallbackIcon?: LucideIcon
  /** True circular preview (avatars) vs the default rounded-square. */
  roundedFull?: boolean
  previewSizeClassName?: string
  disabled?: boolean
  /** Wording for the dropzone instruction ("Drag and drop <what> here, or click to browse."), e.g. "a logo". */
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
  disabled,
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
  const isEmpty = !value

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-text-critical-strong">*</span>}
        </Label>
      )}
      {helperText && <p className="mt-0.5 text-xs text-text-subdued">{helperText}</p>}

      <div className="mt-1.5">
        {value ? (
          <div className="flex items-center gap-3 rounded-lg border border-border-default p-3">
            {value.dataUrl ? (
              <img
                src={value.dataUrl}
                alt=""
                className={cn('shrink-0 border border-border-default object-cover', previewSizeClassName, roundedFull ? 'rounded-full' : 'rounded-md')}
              />
            ) : (
              FallbackIcon && (
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center bg-surface-subdued text-text-subdued',
                    previewSizeClassName,
                    roundedFull ? 'rounded-full' : 'rounded-md',
                  )}
                >
                  <FallbackIcon className="size-1/2" />
                </div>
              )
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-default">{value.name}</p>
              {value.sizeLabel && <p className="text-xs text-text-subdued">{value.sizeLabel}</p>}
            </div>
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        ) : (
          // Every empty upload field is the same dropzone (see the design system's "Upload fields").
          <DropzoneUploadField
            extensions={extensions}
            maxBytes={maxBytes}
            title={dropzoneTitle ?? 'Drag and drop a file here, or click to browse.'}
            formatHint={formatHint}
            disabled={disabled}
            onFiles={(files) => {
              const file = files[0]
              if (file) handleFile(file)
            }}
          />
        )}
        {!isEmpty && (
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
    </div>
  )
}

export { FileUploadField }
