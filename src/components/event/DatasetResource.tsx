import * as React from 'react'
import { FileSpreadsheet, Globe, Link2, Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { cn } from '@/lib/utils'
import { MAX_DOCUMENT_BYTES, type UploadedAsset } from '@/lib/generic-upload'
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
  const [csvAsset, setCsvAsset] = React.useState<UploadedAsset | null>(null)
  const [csvError, setCsvError] = React.useState<string | undefined>(undefined)
  const [apiUrl, setApiUrl] = React.useState('')
  const [linkUrl, setLinkUrl] = React.useState('')

  const handleAdd = () => {
    resourceIdCounter += 1
    if (type === 'csv') {
      if (!csvAsset) {
        setCsvError('Upload a CSV file.')
        return
      }
      onAddResource({ id: `mini-resource-${resourceIdCounter}`, type: 'csv', file: csvAsset })
      setCsvAsset(null)
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
          <FileUploadField
            id="mini-resource-csv"
            label="CSV file"
            value={csvAsset}
            onChange={(asset) => {
              setCsvAsset(asset)
              setCsvError(undefined)
            }}
            extensions={['csv']}
            maxBytes={MAX_DOCUMENT_BYTES}
            error={csvError}
            fallbackIcon={FileSpreadsheet}
            variant="dropzone"
            dropzoneTitle="Drag and drop a CSV file here, or click to browse."
          />
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
