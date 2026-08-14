import * as React from 'react'
import { FileSpreadsheet, Globe, Link2, Trash2, UploadCloud } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { cn } from '@/lib/utils'
import { validateAssetFile } from '@/lib/generic-upload'
import type { DatasetResource, DatasetResourceType } from '@/types/dataset'

interface DatasetResourceStepProps {
  resources: DatasetResource[]
  onAddResource: (resource: DatasetResource) => void
  onRemoveResource: (id: string) => void
  error?: string
}

let resourceIdCounter = 0

const RESOURCE_TABS: { type: DatasetResourceType; label: string; icon: typeof FileSpreadsheet }[] = [
  { type: 'csv', label: 'CSV', icon: FileSpreadsheet },
  { type: 'api', label: 'API', icon: Globe },
  { type: 'link', label: 'Link', icon: Link2 },
]

function DatasetResourceStep({ resources, onAddResource, onRemoveResource, error }: DatasetResourceStepProps) {
  const [type, setType] = React.useState<DatasetResourceType>('csv')
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [csvError, setCsvError] = React.useState<string | undefined>(undefined)
  const [apiUrl, setApiUrl] = React.useState('')
  const [linkUrl, setLinkUrl] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleCsvFile = (file: File) => {
    const err = validateAssetFile(file, { extensions: ['csv'], maxBytes: 50 * 1024 * 1024 })
    if (err) {
      setCsvError(err)
      setCsvFile(null)
      return
    }
    setCsvError(undefined)
    setCsvFile(file)
  }

  const handleAdd = () => {
    resourceIdCounter += 1
    if (type === 'csv') {
      if (!csvFile) {
        setCsvError('Upload a CSV file.')
        return
      }
      onAddResource({
        id: `mini-resource-${resourceIdCounter}`,
        type: 'csv',
        file: {
          id: `mini-resource-file-${resourceIdCounter}`,
          name: csvFile.name,
          extension: 'CSV',
          sizeLabel:
            csvFile.size >= 1024 * 1024
              ? `${(csvFile.size / (1024 * 1024)).toFixed(1)}MB`
              : `${(csvFile.size / 1024).toFixed(1)}KB`,
          sizeBytes: csvFile.size,
          uploadedAt: new Date().toLocaleString(),
        },
      })
      setCsvFile(null)
    } else if (type === 'api') {
      if (!apiUrl.trim()) return
      onAddResource({ id: `mini-resource-${resourceIdCounter}`, type: 'api', url: apiUrl.trim() })
      setApiUrl('')
    } else {
      if (!linkUrl.trim()) return
      onAddResource({ id: `mini-resource-${resourceIdCounter}`, type: 'link', url: linkUrl.trim() })
      setLinkUrl('')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {RESOURCE_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.type === type
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setType(tab.type)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {type === 'csv' && (
        <div>
          {csvFile ? (
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileSpreadsheet className="size-6 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{csvFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(csvFile.size / 1024).toFixed(0)}KB · Ready to add
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCsvFile(null)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center">
              <UploadCloud className="size-7 text-muted-foreground" />
              <p className="text-sm text-foreground">Drop file here or click to upload</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCsvFile(file)
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                Browse File
              </Button>
              <p className="text-xs text-muted-foreground">Supported: CSV</p>
            </div>
          )}
          <FieldError message={csvError} />
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleAdd}>
            Add Resource
          </Button>
        </div>
      )}

      {type === 'api' && (
        <div>
          <Label htmlFor="mini-resource-api">API URL</Label>
          <Input
            id="mini-resource-api"
            className="mt-1.5"
            placeholder="https://api.example.com/data"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleAdd}>
            Add Resource
          </Button>
        </div>
      )}

      {type === 'link' && (
        <div>
          <Label htmlFor="mini-resource-link">Resource URL</Label>
          <Input
            id="mini-resource-link"
            className="mt-1.5"
            placeholder="https://example.com/dataset"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleAdd}>
            Add Resource
          </Button>
        </div>
      )}

      {resources.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Added Resources</Label>
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              {resource.type === 'csv' ? (
                <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
              ) : resource.type === 'api' ? (
                <Globe className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Link2 className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {resource.type === 'csv' ? resource.file?.name : resource.url}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove resource"
                onClick={() => onRemoveResource(resource.id)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <FieldError message={error} />
    </div>
  )
}

export { DatasetResourceStep }
