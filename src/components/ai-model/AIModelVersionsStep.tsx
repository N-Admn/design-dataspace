import * as React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileWarning,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  WifiOff,
} from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Checkbox } from '@/components/ui/checkbox'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  API_KEY_LOCATION_OPTIONS,
  CUSTOM_API_AUTH_OPTIONS,
  LIFECYCLE_OPTIONS,
  PROVIDER_OPTIONS,
  createAIModelAccessMethod,
  createAIModelVersion,
  type AIModelAccessMethod,
  type AIModelVersion,
  type ApiKeyLocation,
  type CustomApiAuthType,
} from '@/types/ai-model'
import {
  getAccessMethodReadiness,
  summarizeAccessMethods,
  validateAIModelAccessMethod,
  validateAIModelVersion,
  type AIModelAccessMethodErrors,
  type AIModelVersionErrors,
} from '@/lib/ai-model-validation'
import {
  computeAccessMethodConfigSignature,
  computeTestInputSignature,
  testAccessMethod,
  type AccessMethodTestResult,
  type AccessMethodTestStatus,
} from '@/lib/ai-model-access-test'

/** Display status for a test result row — extends the lib's executed-outcome
 * statuses with the three states that only exist in the UI: a test hasn't
 * run yet, one is in flight, or a saved result no longer matches the current
 * configuration/Test Input. */
type AccessMethodDisplayStatus = AccessMethodTestStatus | 'not-tested' | 'testing' | 'stale'

const TEST_STATUS_META: Record<AccessMethodDisplayStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  success: { label: 'Success', icon: CheckCircle2, className: 'text-success' },
  'auth-failed': { label: 'Authentication Failed', icon: ShieldAlert, className: 'text-destructive' },
  'connection-failed': { label: 'Connection Failed', icon: WifiOff, className: 'text-destructive' },
  'invalid-request': { label: 'Invalid Request Configuration', icon: AlertTriangle, className: 'text-destructive' },
  'response-extraction-failed': { label: 'Response Extraction Failed', icon: FileWarning, className: 'text-warning-foreground' },
  timeout: { label: 'Request Timed Out', icon: Clock, className: 'text-warning-foreground' },
  incomplete: { label: 'Configuration Incomplete', icon: AlertCircle, className: 'text-warning-foreground' },
  'not-tested': { label: 'Not Tested', icon: Circle, className: 'text-muted-foreground' },
  testing: { label: 'Testing...', icon: Loader2, className: 'text-muted-foreground' },
  stale: { label: 'Configuration Changed — Test Again', icon: RefreshCcw, className: 'text-muted-foreground' },
}

function accessMethodDisplayStatus(
  accessMethod: AIModelAccessMethod,
  result: AccessMethodTestResult | undefined,
  testInput: string,
  isTesting: boolean,
): AccessMethodDisplayStatus {
  if (isTesting) return 'testing'
  if (!result) return 'not-tested'
  if (result.configSignature !== computeAccessMethodConfigSignature(accessMethod) || result.testInputSignature !== computeTestInputSignature(testInput)) {
    return 'stale'
  }
  return result.status
}

interface AIModelVersionsStepProps {
  versions: AIModelVersion[]
  modelType: string
  onChange: (versions: AIModelVersion[]) => void
  openVersionId?: string | null
  onOpenVersionConsumed?: () => void
}

function suggestNextVersionName(versions: AIModelVersion[]): string {
  const numeric = versions.map((v) => Number.parseFloat(v.name)).filter((n) => Number.isFinite(n))
  const max = numeric.length ? Math.max(...numeric) : 0
  return (Math.floor(max) + 1).toFixed(1)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function draftFrom(versions: AIModelVersion[]): AIModelVersion {
  return {
    id: '',
    name: suggestNextVersionName(versions),
    lifecycleStage: 'development',
    isPrimary: versions.length === 0,
    accessMethods: [],
    updatedAt: todayIso(),
  }
}

function lifecycleLabel(stage: AIModelVersion['lifecycleStage']): string {
  return LIFECYCLE_OPTIONS.find((o) => o.value === stage)?.label ?? stage
}

function providerLabel(value: string): string {
  return PROVIDER_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

/** Provider-specific credential label, mirrored from ai-model-validation.ts so the
 * form and its error copy always agree on what to call the field. */
function apiKeyFieldLabel(provider: AIModelAccessMethod['provider']): string {
  if (provider === 'openai') return 'OpenAI API Key'
  if (provider === 'together-ai') return 'Together AI API Key'
  if (provider === 'replicate') return 'Replicate API Token'
  return 'API Key'
}

function modelIdPlaceholder(provider: AIModelAccessMethod['provider']): string {
  if (provider === 'openai') return 'e.g. gpt-4o-mini'
  if (provider === 'ollama') return 'e.g. llama3'
  if (provider === 'together-ai') return 'e.g. meta-llama/Llama-3-8b-chat-hf'
  if (provider === 'replicate') return 'e.g. stability-ai/sdxl'
  return 'e.g. my-custom-model'
}

/** Resets fields that don't apply to the newly selected provider so a switch
 * never leaves stale values (e.g. an Ollama endpoint) silently attached to an
 * OpenAI configuration. */
function withProviderReset(draft: AIModelAccessMethod, provider: AIModelAccessMethod['provider']): AIModelAccessMethod {
  return {
    ...draft,
    provider,
    modelId: '',
    apiKey: '',
    endpointUrl: '',
    authType: 'none',
    headerName: '',
    apiKeyLocation: 'header',
    credentialValue: '',
    requestBody: '',
    responsePath: '',
    timeoutSeconds: '30',
  }
}

/** Resets the credential fields that don't apply to the newly selected auth type. */
function withAuthTypeReset(draft: AIModelAccessMethod, authType: CustomApiAuthType): AIModelAccessMethod {
  return {
    ...draft,
    authType,
    headerName: authType === 'bearer-token' ? 'Authorization' : '',
    apiKeyLocation: 'header',
    credentialValue: '',
  }
}

interface AccessMethodFormProps {
  draft: AIModelAccessMethod
  onDraftChange: (draft: AIModelAccessMethod) => void
  otherNames: string[]
  soleAccessMethod: boolean
  replacesName?: string
  onCancel: () => void
  onSave: () => void
  isNew: boolean
}

function AccessMethodForm({ draft, onDraftChange, otherNames, soleAccessMethod, replacesName, onCancel, onSave, isNew }: AccessMethodFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof AIModelAccessMethodErrors, boolean>>>({})
  const errors = validateAIModelAccessMethod(draft, otherNames)
  const shown = (field: keyof AIModelAccessMethodErrors) => (touched[field] ? errors[field] : undefined)
  const markTouched = (field: keyof AIModelAccessMethodErrors) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSave = () => {
    setTouched({
      name: true,
      provider: true,
      modelId: true,
      apiKey: true,
      endpointUrl: true,
      headerName: true,
      credentialValue: true,
      timeoutSeconds: true,
      responsePath: true,
    })
    const finalErrors = validateAIModelAccessMethod(draft, otherNames)
    if (Object.values(finalErrors).some(Boolean)) return
    onSave()
  }

  const isApiKeyProvider = draft.provider === 'openai' || draft.provider === 'together-ai' || draft.provider === 'replicate'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-foreground">{isNew ? 'New Access Method' : `Editing: ${draft.name || 'Access Method'}`}</p>
      <div>
        <Label htmlFor="access-name">
          Access Method Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="access-name"
          className="mt-1.5"
          placeholder="e.g. Production OpenAI, Local Llama"
          value={draft.name}
          onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
          onBlur={() => markTouched('name')}
          aria-invalid={Boolean(shown('name'))}
        />
        <FieldError message={shown('name')} />
      </div>

      <div>
        <Label htmlFor="access-provider">
          Provider Type <span className="text-destructive">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchableSelect
            id="access-provider"
            options={PROVIDER_OPTIONS.filter((o) => o.value !== '')}
            value={draft.provider}
            onChange={(value) => {
              onDraftChange(withProviderReset(draft, value as AIModelAccessMethod['provider']))
              markTouched('provider')
            }}
            placeholder="Select provider..."
            invalid={Boolean(shown('provider'))}
          />
        </div>
        <FieldError message={shown('provider')} />
      </div>

      {draft.provider && (
        <div>
          <Label htmlFor="access-model-id">
            Provider Model ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="access-model-id"
            className="mt-1.5"
            placeholder={modelIdPlaceholder(draft.provider)}
            value={draft.modelId}
            onChange={(e) => onDraftChange({ ...draft, modelId: e.target.value })}
            onBlur={() => markTouched('modelId')}
            aria-invalid={Boolean(shown('modelId'))}
          />
          <FieldError message={shown('modelId')} />
        </div>
      )}

      {isApiKeyProvider && (
        <div>
          <Label htmlFor="access-api-key">
            {apiKeyFieldLabel(draft.provider)} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="access-api-key"
            type="password"
            className="mt-1.5"
            placeholder={`Enter your ${apiKeyFieldLabel(draft.provider)}`}
            value={draft.apiKey}
            onChange={(e) => onDraftChange({ ...draft, apiKey: e.target.value })}
            onBlur={() => markTouched('apiKey')}
            aria-invalid={Boolean(shown('apiKey'))}
          />
          <FieldError message={shown('apiKey')} />
        </div>
      )}

      {draft.provider === 'ollama' && (
        <div>
          <Label htmlFor="access-endpoint">
            Ollama Endpoint URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="access-endpoint"
            className="mt-1.5"
            placeholder="http://localhost:11434/api/generate"
            value={draft.endpointUrl}
            onChange={(e) => onDraftChange({ ...draft, endpointUrl: e.target.value })}
            onBlur={() => markTouched('endpointUrl')}
            aria-invalid={Boolean(shown('endpointUrl'))}
          />
          <FieldError message={shown('endpointUrl')} />
          <p className="mt-1.5 text-xs text-muted-foreground">No API key is needed for a standard Ollama deployment.</p>
        </div>
      )}

      {draft.provider === 'custom' && (
        <>
          <div>
            <Label htmlFor="access-endpoint">
              API Endpoint URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="access-endpoint"
              className="mt-1.5"
              placeholder="https://api.example.org/v1/predict"
              value={draft.endpointUrl}
              onChange={(e) => onDraftChange({ ...draft, endpointUrl: e.target.value })}
              onBlur={() => markTouched('endpointUrl')}
              aria-invalid={Boolean(shown('endpointUrl'))}
            />
            <FieldError message={shown('endpointUrl')} />
          </div>

          <div>
            <Label htmlFor="access-auth-type">Authentication Type</Label>
            <div className="mt-1.5">
              <SearchableSelect
                id="access-auth-type"
                options={CUSTOM_API_AUTH_OPTIONS}
                value={draft.authType}
                onChange={(value) => onDraftChange(withAuthTypeReset(draft, value as CustomApiAuthType))}
                placeholder="Select authentication type..."
              />
            </div>
          </div>

          {draft.authType === 'bearer-token' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="access-header-name">
                  Authentication Header Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-header-name"
                  className="mt-1.5"
                  placeholder="Authorization"
                  value={draft.headerName}
                  onChange={(e) => onDraftChange({ ...draft, headerName: e.target.value })}
                  onBlur={() => markTouched('headerName')}
                  aria-invalid={Boolean(shown('headerName'))}
                />
                <FieldError message={shown('headerName')} />
              </div>
              <div>
                <Label htmlFor="access-credential">
                  Bearer Token <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-credential"
                  type="password"
                  className="mt-1.5"
                  placeholder="Enter bearer token"
                  value={draft.credentialValue}
                  onChange={(e) => onDraftChange({ ...draft, credentialValue: e.target.value })}
                  onBlur={() => markTouched('credentialValue')}
                  aria-invalid={Boolean(shown('credentialValue'))}
                />
                <FieldError message={shown('credentialValue')} />
              </div>
            </div>
          )}

          {draft.authType === 'api-key' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="access-header-name">
                  Header or Parameter Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-header-name"
                  className="mt-1.5"
                  placeholder="e.g. X-API-Key"
                  value={draft.headerName}
                  onChange={(e) => onDraftChange({ ...draft, headerName: e.target.value })}
                  onBlur={() => markTouched('headerName')}
                  aria-invalid={Boolean(shown('headerName'))}
                />
                <FieldError message={shown('headerName')} />
              </div>
              <div>
                <Label htmlFor="access-key-location">Send key in</Label>
                <div className="mt-1.5">
                  <SearchableSelect
                    id="access-key-location"
                    options={API_KEY_LOCATION_OPTIONS}
                    value={draft.apiKeyLocation}
                    onChange={(value) => onDraftChange({ ...draft, apiKeyLocation: value as ApiKeyLocation })}
                    placeholder="Select key location..."
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="access-credential">
                  API Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-credential"
                  type="password"
                  className="mt-1.5"
                  placeholder="Enter API key"
                  value={draft.credentialValue}
                  onChange={(e) => onDraftChange({ ...draft, credentialValue: e.target.value })}
                  onBlur={() => markTouched('credentialValue')}
                  aria-invalid={Boolean(shown('credentialValue'))}
                />
                <FieldError message={shown('credentialValue')} />
              </div>
            </div>
          )}

          {draft.authType === 'custom-header' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="access-header-name">
                  Header Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-header-name"
                  className="mt-1.5"
                  placeholder="e.g. X-Custom-Auth"
                  value={draft.headerName}
                  onChange={(e) => onDraftChange({ ...draft, headerName: e.target.value })}
                  onBlur={() => markTouched('headerName')}
                  aria-invalid={Boolean(shown('headerName'))}
                />
                <FieldError message={shown('headerName')} />
              </div>
              <div>
                <Label htmlFor="access-credential">
                  Header Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="access-credential"
                  type="password"
                  className="mt-1.5"
                  placeholder="Enter header value"
                  value={draft.credentialValue}
                  onChange={(e) => onDraftChange({ ...draft, credentialValue: e.target.value })}
                  onBlur={() => markTouched('credentialValue')}
                  aria-invalid={Boolean(shown('credentialValue'))}
                />
                <FieldError message={shown('credentialValue')} />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="access-request-body">Request Body Template</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optional JSON template. Supports {'{input}'}, {'{prompt}'}, {'{model_id}'}, {'{temperature}'} and {'{max_tokens}'} placeholders.
            </p>
            <Textarea
              id="access-request-body"
              className="mt-1.5 font-mono text-xs"
              rows={3}
              placeholder='{ "model": "{model_id}", "input": "{prompt}" }'
              value={draft.requestBody}
              onChange={(e) => onDraftChange({ ...draft, requestBody: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="access-response-path">Response Path</Label>
              <Input
                id="access-response-path"
                className="mt-1.5"
                placeholder="e.g. choices[0].message.content"
                value={draft.responsePath}
                onChange={(e) => onDraftChange({ ...draft, responsePath: e.target.value })}
                onBlur={() => markTouched('responsePath')}
                aria-invalid={Boolean(shown('responsePath'))}
              />
              <FieldError message={shown('responsePath')} />
            </div>
            <div>
              <Label htmlFor="access-timeout">Timeout (seconds)</Label>
              <Input
                id="access-timeout"
                type="number"
                min={1}
                className="mt-1.5"
                placeholder="e.g. 30"
                value={draft.timeoutSeconds}
                onChange={(e) => onDraftChange({ ...draft, timeoutSeconds: e.target.value })}
                onBlur={() => markTouched('timeoutSeconds')}
                aria-invalid={Boolean(shown('timeoutSeconds'))}
              />
              <FieldError message={shown('timeoutSeconds')} />
            </div>
          </div>
        </>
      )}

      {draft.provider && (
        <label className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
          <Checkbox
            checked={soleAccessMethod ? true : draft.isPrimary}
            disabled={soleAccessMethod}
            onCheckedChange={(checked) => onDraftChange({ ...draft, isPrimary: checked === true })}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Set as Primary access method</span>
            <span className="block text-xs text-muted-foreground">
              {soleAccessMethod
                ? 'The only access method for this version is automatically Primary.'
                : replacesName
                  ? `Only one access method can be Primary — this will replace "${replacesName}" as the Primary access method.`
                  : 'Only one access method can be Primary — this will replace the current Primary access method.'}
            </span>
          </span>
        </label>
      )}

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handleSave}>
          {isNew ? 'Add Access Method' : 'Save Access Method'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function AIModelVersionsStep({ versions, onChange, openVersionId, onOpenVersionConsumed }: AIModelVersionsStepProps) {
  const confirm = useConfirm()
  const toast = useToast()
  const [open, setOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<AIModelVersion>(() => draftFrom(versions))
  const [initialDraft, setInitialDraft] = React.useState<AIModelVersion>(() => draftFrom(versions))
  const [touched, setTouched] = React.useState<Partial<Record<keyof AIModelVersionErrors, boolean>>>({})
  const [editingAccessId, setEditingAccessId] = React.useState<string | null>(null)
  const [accessDraft, setAccessDraft] = React.useState<AIModelAccessMethod | null>(null)

  // Version-level Access Method testing — a diagnostic workspace scoped to
  // this drawer session, kept separate from Access Method configuration/save.
  const [versionTestInput, setVersionTestInput] = React.useState('')
  const [testResults, setTestResults] = React.useState<Record<string, AccessMethodTestResult>>({})
  const [testingIds, setTestingIds] = React.useState<Set<string>>(new Set())
  const [batchProgress, setBatchProgress] = React.useState<{ total: number; completed: number } | null>(null)
  const [expandedResultId, setExpandedResultId] = React.useState<string | null>(null)

  const otherNames = versions.filter((v) => v.id !== editingId).map((v) => v.name)
  const errors = validateAIModelVersion(draft, otherNames)
  const shown = (field: keyof AIModelVersionErrors) => (touched[field] ? errors[field] : undefined)
  const markTouched = (field: keyof AIModelVersionErrors) => setTouched((prev) => ({ ...prev, [field]: true }))

  const soleVersion = versions.length === 0 || (editingId !== null && versions.length === 1)
  const currentPrimaryVersion = versions.find((v) => v.isPrimary && v.id !== editingId)

  const closeAccessForm = () => {
    setEditingAccessId(null)
    setAccessDraft(null)
  }

  const resetTestState = () => {
    setVersionTestInput('')
    setTestResults({})
    setTestingIds(new Set())
    setBatchProgress(null)
    setExpandedResultId(null)
  }

  const startAdd = () => {
    const next = draftFrom(versions)
    setEditingId(null)
    setDraft(next)
    setInitialDraft(next)
    setTouched({})
    closeAccessForm()
    resetTestState()
    setOpen(true)
  }

  const startEdit = React.useCallback((version: AIModelVersion) => {
    setEditingId(version.id)
    setDraft(version)
    setInitialDraft(version)
    setTouched({})
    closeAccessForm()
    resetTestState()
    setOpen(true)
  }, [])

  React.useEffect(() => {
    if (!openVersionId) return
    const version = versions.find((v) => v.id === openVersionId)
    if (version) startEdit(version)
    onOpenVersionConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openVersionId])

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(initialDraft) || accessDraft !== null

  const requestClose = async () => {
    if (hasUnsavedChanges) {
      const ok = await confirm({
        title: 'Discard changes?',
        description: 'You have unsaved version details. This cannot be undone.',
        confirmLabel: 'Discard',
        variant: 'destructive',
      })
      if (!ok) return
    }
    setOpen(false)
    setTouched({})
    closeAccessForm()
  }

  const handleSave = () => {
    setTouched({ name: true })
    const finalErrors = validateAIModelVersion(draft, otherNames)
    if (Object.values(finalErrors).some(Boolean)) return

    const makePrimary = draft.isPrimary || soleVersion
    if (editingId) {
      onChange(
        versions.map((v) =>
          v.id === editingId ? { ...draft, id: editingId, isPrimary: makePrimary, updatedAt: todayIso() } : makePrimary ? { ...v, isPrimary: false } : v,
        ),
      )
      toast({ title: 'Version updated', description: `"${draft.name}" saved.`, variant: 'success' })
    } else {
      const newVersion: AIModelVersion = { ...draft, id: createAIModelVersion().id, isPrimary: makePrimary, updatedAt: todayIso() }
      const next = makePrimary ? versions.map((v) => ({ ...v, isPrimary: false })) : versions
      onChange([...next, newVersion])
      toast({ title: 'Version added', description: `"${draft.name}" added and connected.`, variant: 'success' })
    }
    setOpen(false)
    setTouched({})
    closeAccessForm()
  }

  const handleRemoveVersion = async (version: AIModelVersion) => {
    const hasConfig = version.name.trim() !== '' || version.accessMethods.length > 0
    if (hasConfig) {
      const ok = await confirm({
        title: 'Remove version?',
        description: `Version ${version.name || 'this version'} and its access methods will be removed. This cannot be undone.`,
        confirmLabel: 'Remove',
        variant: 'destructive',
      })
      if (!ok) return
    }
    const remaining = versions.filter((v) => v.id !== version.id)
    if (remaining.length > 0 && !remaining.some((v) => v.isPrimary)) {
      remaining[0] = { ...remaining[0], isPrimary: true }
    }
    onChange(remaining)
  }

  const startAddAccess = () => {
    setEditingAccessId('new')
    setAccessDraft(createAIModelAccessMethod({ isPrimary: draft.accessMethods.length === 0 }))
  }

  const startEditAccess = (accessMethod: AIModelAccessMethod) => {
    setEditingAccessId(accessMethod.id)
    setAccessDraft(accessMethod)
  }

  const handleSaveAccess = () => {
    if (!accessDraft) return
    const soleAccessMethod = draft.accessMethods.length === 0 || (editingAccessId !== 'new' && draft.accessMethods.length === 1)
    const makePrimary = accessDraft.isPrimary || soleAccessMethod
    let nextMethods: AIModelAccessMethod[]
    if (editingAccessId && editingAccessId !== 'new') {
      nextMethods = draft.accessMethods.map((a) =>
        a.id === editingAccessId ? { ...accessDraft, id: editingAccessId, isPrimary: makePrimary } : makePrimary ? { ...a, isPrimary: false } : a,
      )
    } else {
      const newAccess: AIModelAccessMethod = { ...accessDraft, isPrimary: makePrimary }
      const next = makePrimary ? draft.accessMethods.map((a) => ({ ...a, isPrimary: false })) : draft.accessMethods
      nextMethods = [...next, newAccess]
    }
    setDraft((prev) => ({ ...prev, accessMethods: nextMethods }))
    closeAccessForm()
  }

  const handleRemoveAccess = async (accessMethod: AIModelAccessMethod) => {
    const ok = await confirm({
      title: 'Remove access method?',
      description: `"${accessMethod.name || 'This access method'}" will be removed. This cannot be undone.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    })
    if (!ok) return
    const remaining = draft.accessMethods.filter((a) => a.id !== accessMethod.id)
    if (remaining.length > 0 && !remaining.some((a) => a.isPrimary)) {
      remaining[0] = { ...remaining[0], isPrimary: true }
    }
    setDraft((prev) => ({ ...prev, accessMethods: remaining }))
    if (editingAccessId === accessMethod.id) closeAccessForm()
    setTestResults((prev) => {
      const next = { ...prev }
      delete next[accessMethod.id]
      return next
    })
  }

  const accessOtherNames = draft.accessMethods.filter((a) => a.id !== editingAccessId).map((a) => a.name)
  const accessSoleForForm = draft.accessMethods.length === 0 || (editingAccessId !== 'new' && draft.accessMethods.length === 1)
  const currentPrimaryAccess = draft.accessMethods.find((a) => a.isPrimary && a.id !== editingAccessId)

  // Isolated test execution: single-item and bulk both funnel through
  // runSingleTest, so nothing is duplicated between the two entry points.
  const runSingleTest = async (accessMethod: AIModelAccessMethod) => {
    setTestingIds((prev) => new Set(prev).add(accessMethod.id))
    const result = await testAccessMethod(accessMethod, versionTestInput)
    setTestResults((prev) => ({ ...prev, [accessMethod.id]: result }))
    setTestingIds((prev) => {
      const next = new Set(prev)
      next.delete(accessMethod.id)
      return next
    })
  }

  const runBatchTest = async () => {
    const targets = draft.accessMethods
    if (targets.length === 0) return
    setBatchProgress({ total: targets.length, completed: 0 })
    await Promise.all(
      targets.map((accessMethod) =>
        runSingleTest(accessMethod).then(() => {
          setBatchProgress((prev) => (prev ? { ...prev, completed: prev.completed + 1 } : prev))
        }),
      ),
    )
    setBatchProgress(null)
  }

  const testRows = draft.accessMethods.map((accessMethod) => {
    const isTesting = testingIds.has(accessMethod.id)
    const result = testResults[accessMethod.id]
    const status = accessMethodDisplayStatus(accessMethod, result, versionTestInput, isTesting)
    return { accessMethod, result, status, isTesting }
  })
  const FAILURE_STATUSES: AccessMethodDisplayStatus[] = [
    'auth-failed',
    'connection-failed',
    'invalid-request',
    'response-extraction-failed',
    'timeout',
  ]
  const successCount = testRows.filter((r) => r.status === 'success').length
  const failedCount = testRows.filter((r) => FAILURE_STATUSES.includes(r.status)).length
  const notTestedCount = testRows.length - successCount - failedCount
  const hasAnyResult = testRows.some((r) => r.result !== undefined)
  const overallMessage = !hasAnyResult
    ? null
    : failedCount > 0
      ? 'Some access methods failed'
      : notTestedCount > 0
        ? 'Testing completed with configuration issues'
        : 'All tests successful'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Versions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the releases of this model and how they can be accessed.
        </p>
      </div>

      {versions.length > 0 && (
        <div className="flex flex-col gap-3">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Version {version.name || 'Untitled'}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {lifecycleLabel(version.lifecycleStage)}
                  {version.isPrimary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Check className="size-3" />
                      Primary
                    </span>
                  )}
                  <span>· {summarizeAccessMethods(version.accessMethods)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label={`Edit Version ${version.name}`} onClick={() => startEdit(version)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove Version ${version.name}`}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveVersion(version)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {versions.length === 0 && (
        <EmptyState title="No versions yet" description="Create the first version of this model." />
      )}

      <Button type="button" variant="outline" onClick={startAdd} className="self-start">
        <Plus className="size-4" />
        Add Version
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            requestClose()
            return
          }
        }}
      >
        <DialogContent variant="right-drawer" className="gap-0 p-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingId ? `Edit Version` : 'Add Version'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update this release and how it can be accessed.' : 'Define this release and how it can be accessed.'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Version Details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="version-name">
                        Version Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="version-name"
                        className="mt-1.5"
                        value={draft.name}
                        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                        onBlur={() => markTouched('name')}
                        aria-invalid={Boolean(shown('name'))}
                      />
                      <FieldError message={shown('name')} />
                    </div>
                    <div>
                      <Label htmlFor="version-lifecycle">
                        Lifecycle Stage <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-1.5">
                        <SearchableSelect
                          id="version-lifecycle"
                          options={LIFECYCLE_OPTIONS}
                          value={draft.lifecycleStage}
                          onChange={(value) => setDraft((prev) => ({ ...prev, lifecycleStage: value as AIModelVersion['lifecycleStage'] }))}
                          placeholder="Select lifecycle stage..."
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                    <Checkbox
                      checked={soleVersion ? true : draft.isPrimary}
                      disabled={soleVersion}
                      onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, isPrimary: checked === true }))}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">Set as Primary Version</span>
                      <span className="block text-xs text-muted-foreground">
                        {soleVersion
                          ? 'The only version is automatically the Primary version.'
                          : currentPrimaryVersion
                            ? `Only one version can be Primary — this will replace "Version ${currentPrimaryVersion.name}" as the Primary version.`
                            : 'Only one version can be Primary — this will replace the current Primary version.'}
                      </span>
                    </span>
                  </label>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Access Methods</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure how this version can be accessed. You can save this version even if access methods are
                  incomplete or missing — they're only required when you publish the AI Model.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {draft.accessMethods.length === 0 && editingAccessId !== 'new' && (
                    <EmptyState
                      variant="compact"
                      title="No access methods configured"
                      description="Add one so this version can be reached by consumers."
                      action={
                        <Button type="button" size="sm" onClick={startAddAccess}>
                          <Plus className="size-4" />
                          Add Access Method
                        </Button>
                      }
                    />
                  )}

                  {draft.accessMethods.map((accessMethod, index) =>
                    editingAccessId === accessMethod.id && accessDraft ? (
                      <AccessMethodForm
                        key={accessMethod.id}
                        draft={accessDraft}
                        onDraftChange={setAccessDraft}
                        otherNames={accessOtherNames}
                        soleAccessMethod={accessSoleForForm}
                        replacesName={currentPrimaryAccess?.name}
                        onCancel={closeAccessForm}
                        onSave={handleSaveAccess}
                        isNew={false}
                      />
                    ) : (
                      <div
                        key={accessMethod.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border border-border p-3.5 ${
                          editingAccessId !== null ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {accessMethod.name || `Access Method ${index + 1}`}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            {providerLabel(accessMethod.provider)}
                            {accessMethod.modelId && ` · ${accessMethod.modelId}`}
                            {accessMethod.isPrimary && <Badge className="border-transparent bg-primary/10 text-primary">Primary</Badge>}
                            {getAccessMethodReadiness(accessMethod) === 'incomplete' && (
                              <Badge variant="warning">Incomplete</Badge>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${accessMethod.name || 'access method'}`}
                            disabled={editingAccessId !== null}
                            onClick={() => startEditAccess(accessMethod)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${accessMethod.name || 'access method'}`}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            disabled={editingAccessId !== null}
                            onClick={() => handleRemoveAccess(accessMethod)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}

                  {editingAccessId === 'new' && accessDraft && (
                    <AccessMethodForm
                      draft={accessDraft}
                      onDraftChange={setAccessDraft}
                      otherNames={accessOtherNames}
                      soleAccessMethod={accessSoleForForm}
                      replacesName={currentPrimaryAccess?.name}
                      onCancel={closeAccessForm}
                      onSave={handleSaveAccess}
                      isNew
                    />
                  )}

                  {draft.accessMethods.length > 0 && editingAccessId === null && (
                    <Button type="button" variant="outline" onClick={startAddAccess} className="self-start">
                      <Plus className="size-4" />
                      Add Access Method
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground">Test Access Methods</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Test the configured access methods for this version and review the connection and response results.
                </p>

                {draft.accessMethods.length === 0 ? (
                  <EmptyState
                    variant="compact"
                    className="mt-4"
                    description="Add and save an access method before testing."
                  />
                ) : (
                  <div className="mt-4 flex flex-col gap-4">
                    <div>
                      <Label htmlFor="version-test-input">Test Input</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">Enter a sample prompt or input to test the configured access methods.</p>
                      <Textarea
                        id="version-test-input"
                        className="mt-1.5 text-xs"
                        rows={2}
                        placeholder="Enter a sample prompt or input for testing..."
                        value={versionTestInput}
                        onChange={(e) => setVersionTestInput(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={runBatchTest} disabled={Boolean(batchProgress)}>
                        {batchProgress && <Loader2 className="size-4 animate-spin" />}
                        Test All Access Methods
                      </Button>
                      {batchProgress && (
                        <span className="text-xs text-muted-foreground">
                          Testing {Math.min(batchProgress.completed + 1, batchProgress.total)} of {batchProgress.total} access methods...
                        </span>
                      )}
                    </div>

                    {hasAnyResult && (
                      <div className="rounded-lg border border-border bg-card p-3.5">
                        <p className="text-sm font-semibold text-foreground">Test Results</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {testRows.length} Tested · {successCount} Successful · {failedCount} Failed · {notTestedCount} Not Tested
                        </p>
                        {overallMessage && <p className="mt-1.5 text-xs font-medium text-foreground">{overallMessage}</p>}
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          Results reflect the current configuration and Test Input — editing either marks a result as changed.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {testRows.map(({ accessMethod, result, status, isTesting }) => {
                        const meta = TEST_STATUS_META[status]
                        const StatusIcon = meta.icon
                        const expanded = expandedResultId === accessMethod.id
                        return (
                          <div key={accessMethod.id} className="rounded-lg border border-border">
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
                              onClick={() => setExpandedResultId(expanded ? null : accessMethod.id)}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {expanded ? (
                                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">{accessMethod.name || 'Access Method'}</p>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                    {providerLabel(accessMethod.provider)}
                                    {accessMethod.modelId && ` · ${accessMethod.modelId}`}
                                    {accessMethod.isPrimary && <Badge className="border-transparent bg-primary/10 text-primary">Primary</Badge>}
                                  </p>
                                </div>
                              </div>
                              <span className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${meta.className}`}>
                                <StatusIcon className={`size-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                                {meta.label}
                              </span>
                            </button>

                            {expanded && (
                              <div className="border-t border-border px-3.5 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Diagnostics</p>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => runSingleTest(accessMethod)} disabled={isTesting}>
                                    <RefreshCcw className="size-3.5" />
                                    Test Again
                                  </Button>
                                </div>

                                {isTesting && <p className="mt-2 text-xs text-muted-foreground">Running test...</p>}
                                {!isTesting && status === 'not-tested' && (
                                  <p className="mt-2 text-xs text-muted-foreground">This access method hasn't been tested yet.</p>
                                )}
                                {!isTesting && status === 'stale' && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    The configuration or Test Input changed since this was last tested. Test again to refresh the result.
                                  </p>
                                )}

                                {!isTesting && status !== 'not-tested' && status !== 'stale' && result && (
                                  <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-muted/40 p-3 font-mono text-[11px]">
                                    <p className="text-muted-foreground">Test Started</p>
                                    {result.steps.map((step) => (
                                      <p key={step.sequence} className={step.status === 'pass' ? 'text-success' : 'text-destructive'}>
                                        {step.status === 'pass' ? '✓' : '✕'} {step.stage}
                                        <span className="ml-1 text-muted-foreground">— {step.message}</span>
                                      </p>
                                    ))}
                                    <p className="mt-1.5 border-t border-border pt-1.5 text-foreground">
                                      Result:{' '}
                                      <span className={TEST_STATUS_META[result.status].className}>{TEST_STATUS_META[result.status].label}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <Button type="button" variant="ghost" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { AIModelVersionsStep }
