import * as React from 'react'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Globe,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { FilePreviewModal } from '@/components/dataset/FilePreviewModal'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { validateIncomingFiles } from '@/lib/file-validation'
import { testApiConnection } from '@/lib/api-resource'
import {
  AUTH_METHOD_OPTIONS,
  API_KEY_LOCATION_OPTIONS,
  API_RESPONSE_FORMAT_OPTIONS,
  SUPPORTED_FILE_EXTENSIONS,
  type ApiAuthMethod,
  type ApiKeyLocation,
  type ApiResponseFormat,
  type DatasetFile,
  type DatasetResource,
  type DatasetResourceApiConfig,
  type DatasetResourceType,
  type KeyValuePair,
} from '@/types/dataset'

interface Step2DataFilesProps {
  files: DatasetFile[]
  onFilesAdd: (files: DatasetFile[]) => void
  onFileRemove: (id: string) => void
  enablePreview: boolean
  onTogglePreview: (value: boolean) => void
  resources: DatasetResource[]
  onAddResource: (resource: DatasetResource) => void
  onUpdateResource: (resource: DatasetResource) => void
  onRemoveResource: (id: string) => void
}

const RESOURCE_TABS: { type: DatasetResourceType; label: string; icon: typeof FileSpreadsheet }[] = [
  { type: 'csv', label: 'File Upload', icon: FileSpreadsheet },
  { type: 'api', label: 'API', icon: Globe },
  { type: 'link', label: 'Link', icon: Link2 },
]

let resourceIdCounter = 0
let kvIdCounter = 0

function emptyApiConfig(): DatasetResourceApiConfig {
  return {
    url: '',
    method: 'GET',
    authMethod: 'none',
    apiKey: '',
    apiKeyLocation: 'header',
    bearerToken: '',
    parameters: [],
    headers: [],
    responseFormat: 'json',
    tested: false,
  }
}

function newKeyValuePair(): KeyValuePair {
  kvIdCounter += 1
  return { id: `kv-${kvIdCounter}`, key: '', value: '' }
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function SecretInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  id: string
}) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        className="pr-10"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={visible ? 'Hide value' : 'Show value'}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function KeyValueList({
  items,
  onChange,
  addLabel,
  keyPlaceholder,
}: {
  items: KeyValuePair[]
  onChange: (items: KeyValuePair[]) => void
  addLabel: string
  keyPlaceholder: string
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(e) => {
              const next = [...items]
              next[index] = { ...item, key: e.target.value }
              onChange(next)
            }}
          />
          <Input
            placeholder="Value"
            value={item.value}
            onChange={(e) => {
              const next = [...items]
              next[index] = { ...item, value: e.target.value }
              onChange(next)
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...items, newKeyValuePair()])}
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}

function ResourceListCard({
  title,
  icon: Icon,
  resources,
  subtitle,
  onEdit,
  onRemove,
}: {
  title: string
  icon: typeof Globe
  resources: DatasetResource[]
  subtitle: (resource: DatasetResource) => string
  onEdit: (resource: DatasetResource) => void
  onRemove: (id: string) => void
}) {
  if (resources.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} ({resources.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {resources.map((resource) => (
          <div key={resource.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{resource.url}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{subtitle(resource)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${resource.url}`}
                onClick={() => onEdit(resource)}
                className="text-muted-foreground hover:bg-muted hover:text-primary"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${resource.url}`}
                onClick={() => onRemove(resource.id)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Step2DataFiles({
  files,
  onFilesAdd,
  onFileRemove,
  enablePreview,
  onTogglePreview,
  resources,
  onAddResource,
  onUpdateResource,
  onRemoveResource,
}: Step2DataFilesProps) {
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const [previewFile, setPreviewFile] = React.useState<DatasetFile | null>(null)
  const toast = useToast()

  const [resourceType, setResourceType] = React.useState<DatasetResourceType>('csv')
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [apiConfig, setApiConfig] = React.useState<DatasetResourceApiConfig>(emptyApiConfig())
  const [apiUrlTouched, setApiUrlTouched] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [linkUrlTouched, setLinkUrlTouched] = React.useState(false)
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = React.useState<string | undefined>(undefined)

  const apiResources = resources.filter((r) => r.type === 'api')
  const linkResources = resources.filter((r) => r.type === 'link')

  const handleIncoming = (fileList: FileList | File[]) => {
    const { accepted, errors } = validateIncomingFiles(fileList, files)
    if (accepted.length > 0) {
      onFilesAdd(accepted)
      if (accepted.length === 1) {
        toast({ title: 'File uploaded', description: `${accepted[0].name} has been added.`, variant: 'success' })
      } else {
        toast({ title: 'Files uploaded', description: `${accepted.length} files have been added.`, variant: 'success' })
      }
    }
    setUploadErrors(errors)
    if (errors.length > 0) {
      toast({ title: 'File upload failed', description: errors[0], variant: 'error' })
    }
  }

  const resetApiForm = () => {
    setEditingId(null)
    setApiConfig(emptyApiConfig())
    setApiUrlTouched(false)
    setTestStatus('idle')
    setTestMessage(undefined)
  }

  const resetLinkForm = () => {
    setEditingId(null)
    setLinkUrl('')
    setLinkUrlTouched(false)
  }

  const updateApiConfig = <K extends keyof DatasetResourceApiConfig>(
    field: K,
    value: DatasetResourceApiConfig[K],
  ) => {
    setApiConfig((prev) => ({ ...prev, [field]: value, tested: false }))
    setTestStatus('idle')
    setTestMessage(undefined)
  }

  const apiUrlValid = isValidUrl(apiConfig.url)
  const apiAuthValid =
    apiConfig.authMethod === 'none' ||
    (apiConfig.authMethod === 'api-key' && apiConfig.apiKey.trim() !== '') ||
    (apiConfig.authMethod === 'bearer-token' && apiConfig.bearerToken.trim() !== '')
  const canAddApiResource = apiUrlValid && apiAuthValid && apiConfig.tested

  const handleTestConnection = async () => {
    setApiUrlTouched(true)
    if (!apiUrlValid) {
      setTestStatus('error')
      setTestMessage('Enter a valid API URL to test.')
      return
    }
    if (!apiAuthValid) {
      setTestStatus('error')
      setTestMessage(
        apiConfig.authMethod === 'api-key'
          ? 'Enter an API key to authenticate the request.'
          : 'Enter a bearer token to authenticate the request.',
      )
      return
    }
    setTestStatus('testing')
    setTestMessage(undefined)
    const result = await testApiConnection(apiConfig)
    setTestStatus(result.success ? 'success' : 'error')
    setTestMessage(result.message)
    setApiConfig((prev) => ({ ...prev, tested: result.success }))
  }

  const handleAddOrSaveApiResource = () => {
    if (!canAddApiResource) return
    const resource: DatasetResource = {
      id: editingId ?? `resource-${(resourceIdCounter += 1)}`,
      type: 'api',
      url: apiConfig.url.trim(),
      apiConfig: { ...apiConfig, url: apiConfig.url.trim() },
    }
    if (editingId) {
      onUpdateResource(resource)
    } else {
      onAddResource(resource)
    }
    resetApiForm()
  }

  const handleEditApiResource = (resource: DatasetResource) => {
    setResourceType('api')
    setEditingId(resource.id)
    setApiConfig(resource.apiConfig ?? { ...emptyApiConfig(), url: resource.url ?? '' })
    setApiUrlTouched(false)
    setTestStatus('idle')
    setTestMessage(undefined)
  }

  const linkUrlValid = isValidUrl(linkUrl)

  const handleAddOrSaveLinkResource = () => {
    if (!linkUrlValid) {
      setLinkUrlTouched(true)
      return
    }
    const resource: DatasetResource = {
      id: editingId ?? `resource-${(resourceIdCounter += 1)}`,
      type: 'link',
      url: linkUrl.trim(),
    }
    if (editingId) {
      onUpdateResource(resource)
    } else {
      onAddResource(resource)
    }
    resetLinkForm()
  }

  const handleEditLinkResource = (resource: DatasetResource) => {
    setResourceType('link')
    setEditingId(resource.id)
    setLinkUrl(resource.url ?? '')
    setLinkUrlTouched(false)
  }

  const handleTabChange = (type: DatasetResourceType) => {
    if (type === resourceType) return
    if (editingId) {
      resetApiForm()
      resetLinkForm()
    }
    setResourceType(type)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {RESOURCE_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.type === resourceType
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTabChange(tab.type)}
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

      {resourceType === 'csv' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Upload Dataset File</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DropzoneUploadField
                extensions={SUPPORTED_FILE_EXTENSIONS}
                maxBytes={50 * 1024 * 1024}
                multiple
                onFiles={handleIncoming}
                showExtensionBadges
                formatHint="Maximum file size limit: 50MB"
              />

              {uploadErrors.length > 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                  {uploadErrors.map((message) => (
                    <p key={message} className="text-xs font-medium text-destructive">
                      {message}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Uploaded Files ({files.length})</CardTitle>
              {files.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4" />
                  {files.length} File{files.length === 1 ? '' : 's'} Ready
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {files.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No files uploaded yet.
                </p>
              )}

              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-success" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <Badge variant="secondary">{file.extension}</Badge>
                      <span>Size: {file.sizeLabel}</span>
                      <span>•</span>
                      <span>Uploaded: {file.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="success">Ready</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Preview ${file.name}`}
                        onClick={() => setPreviewFile(file)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${file.name}`}
                        onClick={() => {
                          onFileRemove(file.id)
                          toast({ title: 'File removed', variant: 'success' })
                        }}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {files.length > 0 && (
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="enable-preview"
                    className="mt-0.5"
                    checked={enablePreview}
                    onCheckedChange={(checked) => onTogglePreview(checked === true)}
                  />
                  <div>
                    <Label htmlFor="enable-preview" className="cursor-pointer font-normal">
                      Enable Interactive Preview
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generates tabular data preview grid for public viewers
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {resourceType === 'api' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>API Resource</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {editingId && (
                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
                  Editing resource
                  <button type="button" className="font-medium underline underline-offset-2" onClick={resetApiForm}>
                    Cancel
                  </button>
                </div>
              )}

              <div>
                <Label htmlFor="api-resource-url">
                  API URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="api-resource-url"
                  className="mt-1.5"
                  placeholder="https://api.example.com/data"
                  value={apiConfig.url}
                  onBlur={() => setApiUrlTouched(true)}
                  onChange={(e) => updateApiConfig('url', e.target.value)}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Enter the endpoint URL that provides access to this dataset.
                </p>
                {apiUrlTouched && !apiUrlValid && <FieldError message="Enter a valid API URL." />}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="api-resource-method">Request method</Label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      id="api-resource-method"
                      options={[{ value: 'GET', label: 'GET' }]}
                      value={apiConfig.method}
                      onChange={() => updateApiConfig('method', 'GET')}
                      placeholder="Select method..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-resource-auth">Authentication</Label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      id="api-resource-auth"
                      options={AUTH_METHOD_OPTIONS}
                      value={apiConfig.authMethod}
                      onChange={(value) => updateApiConfig('authMethod', value as ApiAuthMethod)}
                      placeholder="Select authentication method..."
                    />
                  </div>
                </div>
              </div>

              {apiConfig.authMethod === 'api-key' && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="api-resource-key">API Key</Label>
                    <div className="mt-1.5">
                      <SecretInput
                        id="api-resource-key"
                        placeholder="Enter API key"
                        value={apiConfig.apiKey}
                        onChange={(value) => updateApiConfig('apiKey', value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="api-resource-key-location">Key location</Label>
                    <div className="mt-1.5">
                      <SearchableSelect
                        id="api-resource-key-location"
                        options={API_KEY_LOCATION_OPTIONS}
                        value={apiConfig.apiKeyLocation}
                        onChange={(value) => updateApiConfig('apiKeyLocation', value as ApiKeyLocation)}
                        placeholder="Select key location..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {apiConfig.authMethod === 'bearer-token' && (
                <div>
                  <Label htmlFor="api-resource-bearer">Bearer Token</Label>
                  <div className="mt-1.5">
                    <SecretInput
                      id="api-resource-bearer"
                      placeholder="Enter bearer token"
                      value={apiConfig.bearerToken}
                      onChange={(value) => updateApiConfig('bearerToken', value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Parameters</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Optional query parameters for the API request.</p>
                <div className="mt-1.5">
                  <KeyValueList
                    items={apiConfig.parameters}
                    onChange={(items) => updateApiConfig('parameters', items)}
                    addLabel="Add parameter"
                    keyPlaceholder="Parameter name"
                  />
                </div>
              </div>

              <div>
                <Label>Headers</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Optional HTTP headers required by the API.</p>
                <div className="mt-1.5">
                  <KeyValueList
                    items={apiConfig.headers}
                    onChange={(items) => updateApiConfig('headers', items)}
                    addLabel="Add header"
                    keyPlaceholder="Header name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="api-resource-format">Response format</Label>
                <div className="mt-1.5">
                  <SearchableSelect
                    id="api-resource-format"
                    options={API_RESPONSE_FORMAT_OPTIONS}
                    value={apiConfig.responseFormat}
                    onChange={(value) => updateApiConfig('responseFormat', value as ApiResponseFormat)}
                    placeholder="Select response format..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-border pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test connection'
                    )}
                  </Button>
                  {testStatus === 'success' && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                      <CheckCircle2 className="size-4" />
                      Connection successful
                    </span>
                  )}
                </div>
                {testStatus === 'success' && testMessage && (
                  <p className="text-xs text-muted-foreground">{testMessage}</p>
                )}
                {testStatus === 'error' && <FieldError message={testMessage} />}

                <div className="mt-2 flex items-center gap-2">
                  <Button type="button" size="sm" onClick={handleAddOrSaveApiResource} disabled={!canAddApiResource}>
                    {editingId ? 'Save Resource' : 'Add Resource'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" size="sm" onClick={resetApiForm}>
                      Cancel
                    </Button>
                  )}
                </div>
                {!apiConfig.tested && apiUrlValid && apiAuthValid && (
                  <p className="text-xs text-muted-foreground">
                    Test the connection successfully before adding this resource.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <ResourceListCard
            title="API Resources"
            icon={Globe}
            resources={apiResources}
            subtitle={(resource) =>
              `${resource.apiConfig?.method ?? 'GET'} · ${(resource.apiConfig?.responseFormat ?? 'json').toUpperCase()} · ${
                resource.apiConfig?.tested ? 'Tested successfully' : 'Not tested'
              }`
            }
            onEdit={handleEditApiResource}
            onRemove={onRemoveResource}
          />
        </>
      )}

      {resourceType === 'link' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Link Resource</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {editingId && (
                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
                  Editing resource
                  <button type="button" className="font-medium underline underline-offset-2" onClick={resetLinkForm}>
                    Cancel
                  </button>
                </div>
              )}
              <div>
                <Label htmlFor="link-resource-url">
                  Resource URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="link-resource-url"
                  className="mt-1.5"
                  placeholder="https://example.com/dataset"
                  value={linkUrl}
                  onBlur={() => setLinkUrlTouched(true)}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                {linkUrlTouched && !linkUrlValid && <FieldError message="Enter a valid resource URL." />}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={handleAddOrSaveLinkResource} disabled={!linkUrlValid}>
                  {editingId ? 'Save Resource' : 'Add Resource'}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" size="sm" onClick={resetLinkForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <ResourceListCard
            title="Link Resources"
            icon={Link2}
            resources={linkResources}
            subtitle={() => 'External link'}
            onEdit={handleEditLinkResource}
            onRemove={onRemoveResource}
          />
        </>
      )}

      <FilePreviewModal file={previewFile} onOpenChange={(open) => !open && setPreviewFile(null)} />
    </div>
  )
}

export { Step2DataFiles }
