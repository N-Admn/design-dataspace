import { ExternalLink, Globe2, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GEOGRAPHY_OPTIONS, LICENSE_OPTIONS, SECTOR_OPTIONS } from '@/types/dataset'
import {
  DOMAIN_OPTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_SUPPORT_OPTIONS,
  MODEL_TYPE_OPTIONS,
  PROVIDER_OPTIONS,
  TARGET_USER_OPTIONS,
  type AIModelFormState,
} from '@/types/ai-model'
import { getPrimaryAccessMethod } from '@/lib/ai-model-validation'

function optionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function AIModelPreview({ form }: { form: AIModelFormState }) {
  const { metadata, versions } = form
  const primary = versions.find((v) => v.isPrimary) ?? versions[0]
  const primaryAccess = getPrimaryAccessMethod(primary)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="size-3.5" />
          AI Model
        </div>
        <h1 className="mt-1.5 text-2xl font-semibold text-primary">{metadata.name || 'Untitled AI Model'}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {metadata.modelType && <Badge variant="accent">{optionLabel(MODEL_TYPE_OPTIONS, metadata.modelType)}</Badge>}
          {metadata.domain && <Badge variant="secondary">{optionLabel(DOMAIN_OPTIONS, metadata.domain)}</Badge>}
          {metadata.sectors.map((s) => (
            <Badge key={s} variant="muted">
              {optionLabel(SECTOR_OPTIONS, s)}
            </Badge>
          ))}
        </div>

        {metadata.description && <p className="mt-4 text-sm text-foreground">{metadata.description}</p>}

        {metadata.website && (
          <a
            href={metadata.website}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            {metadata.website}
          </a>
        )}
      </div>

      {(metadata.targetUsers.length > 0 || metadata.intendedUse) && (
        <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Purpose &amp; Audience</p>
          {metadata.targetUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {metadata.targetUsers.map((u) => (
                <Badge key={u} variant="secondary">
                  {optionLabel(TARGET_USER_OPTIONS, u)}
                </Badge>
              ))}
            </div>
          )}
          {metadata.intendedUse && <p className="text-sm text-muted-foreground">{metadata.intendedUse}</p>}
        </div>
      )}

      {primary && (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Version &amp; Access</p>
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Version {primary.name}</span>
              <Badge className="border-transparent bg-primary/10 text-primary">Current</Badge>
            </div>
            {primaryAccess ? (
              <>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Globe2 className="size-3.5" />
                  {optionLabel(PROVIDER_OPTIONS, primaryAccess.provider)}
                  {primaryAccess.modelId && ` — ${primaryAccess.modelId}`}
                </div>
                {primaryAccess.endpointUrl && <p className="truncate text-xs text-muted-foreground">{primaryAccess.endpointUrl}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Access not configured yet.</p>
            )}
          </div>
        </div>
      )}

      {(metadata.languageSupportType || metadata.geographies.length > 0 || metadata.tags.length > 0) && (
        <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
          {metadata.languageSupportType && (
            <div>
              <p className="text-sm font-semibold text-foreground">Language Support</p>
              {metadata.languageSupportType === 'specific' ? (
                metadata.languages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {metadata.languages.map((l) => (
                      <Badge key={l} variant="muted">
                        {optionLabel(LANGUAGE_OPTIONS, l)}
                      </Badge>
                    ))}
                  </div>
                )
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{optionLabel(LANGUAGE_SUPPORT_OPTIONS, metadata.languageSupportType)}</p>
              )}
            </div>
          )}
          {metadata.geographies.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Geography</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {metadata.geographies.map((g) => (
                  <Badge key={g} variant="muted">
                    {optionLabel(GEOGRAPHY_OPTIONS, g)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {metadata.tags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground">Tags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {metadata.tags.map((t) => (
                  <Badge key={t} variant="muted">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {metadata.license && (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm font-semibold text-foreground">Usage License</p>
          <p className="mt-1 text-sm text-muted-foreground">{optionLabel(LICENSE_OPTIONS, metadata.license)}</p>
        </div>
      )}
    </div>
  )
}

export { AIModelPreview }
