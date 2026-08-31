import * as React from 'react'
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Heading as HeadingIcon,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  Pencil,
  Pilcrow,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'
import { validateAssetFile, buildUploadedAsset, formatUploadHint } from '@/lib/generic-upload'
import { FieldError } from '@/components/ui/field-error'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import type { UploadedAsset } from '@/lib/generic-upload'
import type { UseCaseBlock, UseCaseBlockType, UseCaseHeadingLevel, UseCaseMetadata } from '@/types/usecase'

let blockIdCounter = 0

const BLOCK_MENU: { type: UseCaseBlockType; label: string; icon: typeof HeadingIcon }[] = [
  { type: 'heading', label: 'Heading', icon: HeadingIcon },
  { type: 'text', label: 'Text', icon: Pilcrow },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'chart', label: 'Chart', icon: BarChart3 },
  { type: 'highlight', label: 'Highlight', icon: MessageSquareQuote },
  { type: 'link', label: 'Link / Embed', icon: Link2 },
]

function createBlock(type: UseCaseBlockType): UseCaseBlock {
  blockIdCounter += 1
  const id = `block-${blockIdCounter}`
  switch (type) {
    case 'heading':
      return { id, type: 'heading', text: '', level: 2 }
    case 'text':
      return { id, type: 'text', html: '' }
    case 'image':
      return { id, type: 'image', asset: null, caption: '' }
    case 'chart':
      return { id, type: 'chart', chartId: null, chartTitle: '', caption: '' }
    case 'highlight':
      return { id, type: 'highlight', highlight: '', supportingText: '' }
    case 'link':
      return { id, type: 'link', url: '', label: '', description: '' }
  }
}

function duplicateBlock(block: UseCaseBlock): UseCaseBlock {
  blockIdCounter += 1
  return { ...block, id: `block-${blockIdCounter}` }
}

/** Shared "blends into the page" styling for text fields that render as the actual published content. */
const ghostField =
  'w-full rounded-sm border border-transparent bg-transparent p-0 outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-muted/30 focus-visible:bg-muted/40 focus-visible:ring-0'

interface BlockWrapperProps {
  active: boolean
  isFirst: boolean
  isLast: boolean
  onToggleActive: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  children: React.ReactNode
}

function BlockWrapper({
  active,
  isFirst,
  isLast,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  children,
}: BlockWrapperProps) {
  return (
    <div
      className={cn(
        'group/block relative -mx-3 rounded-lg border px-3 py-2 transition-colors',
        active ? 'border-primary/40 bg-primary/[0.03]' : 'border-transparent hover:border-border',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -top-4 right-2 z-10 flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 opacity-0 shadow-sm transition-opacity',
          'group-hover/block:pointer-events-auto group-hover/block:opacity-100',
          active && 'pointer-events-auto opacity-100',
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-6', active && 'text-primary')}
          aria-label={active ? 'Done editing' : 'Edit block'}
          onClick={onToggleActive}
        >
          {active ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-6" disabled={isFirst} aria-label="Move up" onClick={onMoveUp}>
          <ChevronUp className="size-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-6" disabled={isLast} aria-label="Move down" onClick={onMoveDown}>
          <ChevronDown className="size-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Duplicate block" onClick={onDuplicate}>
          <Copy className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete block"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {children}
    </div>
  )
}

function HeadingLevelToggle({ level, onChange }: { level: UseCaseHeadingLevel; onChange: (level: UseCaseHeadingLevel) => void }) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-md border border-border p-0.5 text-xs font-medium text-muted-foreground">
      {([2, 3] as UseCaseHeadingLevel[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn('rounded px-1.5 py-0.5', l === level ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
        >
          H{l}
        </button>
      ))}
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

interface UseCaseStep2BuilderProps {
  metadata: UseCaseMetadata
  blocks: UseCaseBlock[]
  onBlocksChange: (blocks: UseCaseBlock[]) => void
}

function UseCaseStep2Builder({ metadata, blocks, onBlocksChange }: UseCaseStep2BuilderProps) {
  const { charts, datasets } = useAppData()
  const [addMenuOpen, setAddMenuOpen] = React.useState(false)
  const [chartSearchBlockId, setChartSearchBlockId] = React.useState<string | null>(null)
  const [chartQuery, setChartQuery] = React.useState('')
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(null)

  const openChartSearch = (blockId: string) => {
    setChartQuery('')
    setChartSearchBlockId(blockId)
  }

  const chartSearchResults = React.useMemo(() => {
    const q = chartQuery.trim().toLowerCase()
    return charts
      .filter((c) => c.status === 'published')
      .filter((c) => !q || (c.form.name || '').toLowerCase().includes(q))
  }, [charts, chartQuery])

  const updateBlock = (id: string, patch: Partial<UseCaseBlock>) => {
    onBlocksChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as UseCaseBlock) : b)))
  }

  const removeBlock = (id: string) => {
    onBlocksChange(blocks.filter((b) => b.id !== id))
    if (activeBlockId === id) setActiveBlockId(null)
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    const next = [...blocks]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onBlocksChange(next)
  }

  const addBlock = (type: UseCaseBlockType) => {
    const block = createBlock(type)
    onBlocksChange([...blocks, block])
    setActiveBlockId(block.id)
    setAddMenuOpen(false)
  }

  const cloneBlock = (index: number) => {
    const clone = duplicateBlock(blocks[index])
    const next = [...blocks]
    next.splice(index + 1, 0, clone)
    onBlocksChange(next)
  }

  const addContentTrigger = (
    <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-4" />
          Add Content
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1">
        {BLOCK_MENU.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => addBlock(item.type)}
              className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              {item.label}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Builder</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell the story using flexible content blocks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Sourced from Start. Edit the thumbnail, title or subtitle from the Start step.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            {metadata.thumbnail?.dataUrl && (
              <img src={metadata.thumbnail.dataUrl} alt="" className="h-40 w-full object-cover" />
            )}
            <div className="px-4 py-4">
              <p className="text-base font-semibold text-primary">{metadata.title || 'Untitled Use Case'}</p>
              {metadata.subtitle && <p className="mt-1 text-sm text-muted-foreground">{metadata.subtitle}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Build your content</p>

        {/* Live canvas — every block renders in its actual published appearance. Click Edit to make a block editable. */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground">Your Use Case is ready to be built.</p>
              {addContentTrigger}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 px-6 py-6">
                {blocks.map((block, index) => {
                  const active = activeBlockId === block.id
                  const shellProps = {
                    active,
                    isFirst: index === 0,
                    isLast: index === blocks.length - 1,
                    onToggleActive: () => setActiveBlockId((prev) => (prev === block.id ? null : block.id)),
                    onMoveUp: () => moveBlock(index, -1),
                    onMoveDown: () => moveBlock(index, 1),
                    onDuplicate: () => cloneBlock(index),
                    onDelete: () => removeBlock(block.id),
                  }

                  if (block.type === 'heading') {
                    const Tag = block.level === 2 ? 'h2' : 'h3'
                    return (
                      <BlockWrapper key={block.id} {...shellProps}>
                        {active ? (
                          <div className="flex items-center gap-3">
                            <input
                              autoFocus
                              value={block.text}
                              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                              placeholder="Untitled heading"
                              className={cn(
                                ghostField,
                                block.level === 2 ? 'text-xl font-semibold text-primary' : 'text-lg font-semibold text-foreground',
                              )}
                            />
                            <HeadingLevelToggle level={block.level} onChange={(level) => updateBlock(block.id, { level })} />
                          </div>
                        ) : (
                          <Tag className={block.level === 2 ? 'text-xl font-semibold text-primary' : 'text-lg font-semibold text-foreground'}>
                            {block.text || 'Untitled heading'}
                          </Tag>
                        )}
                      </BlockWrapper>
                    )
                  }

                  if (block.type === 'text') {
                    return (
                      <BlockWrapper key={block.id} {...shellProps}>
                        {active ? (
                          <RichTextEditor
                            value={block.html}
                            onChange={(html) => updateBlock(block.id, { html })}
                            placeholder="Write some text..."
                          />
                        ) : (
                          <div
                            className="prose-sm text-sm text-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                            dangerouslySetInnerHTML={{
                              __html: stripHtml(block.html) ? block.html : '<p class="text-muted-foreground">Empty text block</p>',
                            }}
                          />
                        )}
                      </BlockWrapper>
                    )
                  }

                  if (block.type === 'image') {
                    return (
                      <BlockWrapper key={block.id} {...shellProps}>
                        {active ? (
                          <ImageBlockCanvas
                            asset={block.asset}
                            caption={block.caption}
                            onAssetChange={(asset) => updateBlock(block.id, { asset })}
                            onCaptionChange={(caption) => updateBlock(block.id, { caption })}
                          />
                        ) : (
                          <figure>
                            {block.asset?.dataUrl ? (
                              <img src={block.asset.dataUrl} alt={block.caption} className="w-full rounded-lg border border-border object-cover" />
                            ) : (
                              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                                No image uploaded
                              </div>
                            )}
                            {block.caption && <figcaption className="mt-1.5 text-xs text-muted-foreground">{block.caption}</figcaption>}
                          </figure>
                        )}
                      </BlockWrapper>
                    )
                  }

                  if (block.type === 'chart') {
                    const isSearching = chartSearchBlockId === block.id
                    return (
                      <BlockWrapper key={block.id} {...shellProps}>
                        <figure className="rounded-lg border border-border p-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <BarChart3 className="size-4 shrink-0 text-muted-foreground" />
                            {active ? (
                              <button
                                type="button"
                                autoFocus
                                onClick={() => (isSearching ? setChartSearchBlockId(null) : openChartSearch(block.id))}
                                className={cn('rounded-sm text-left hover:underline', !block.chartId && 'text-muted-foreground')}
                              >
                                {block.chartId ? block.chartTitle : 'Select a chart...'}
                              </button>
                            ) : (
                              <span>{block.chartId ? block.chartTitle : 'No chart selected'}</span>
                            )}
                          </div>

                          {isSearching ? (
                            <div className="mt-3 flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                <input
                                  autoFocus
                                  value={chartQuery}
                                  onChange={(e) => setChartQuery(e.target.value)}
                                  placeholder="Search charts by name"
                                  className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                              </div>
                              {chartSearchResults.length === 0 ? (
                                <p className="py-4 text-center text-xs text-muted-foreground">No charts found.</p>
                              ) : (
                                <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
                                  {chartSearchResults.map((chart) => {
                                    const title = chart.form.name || 'Untitled chart'
                                    const datasetName = chart.form.datasetId
                                      ? datasets.find((d) => d.id === chart.form.datasetId)?.form.metadata.name
                                      : undefined
                                    const isCurrent = block.chartId === chart.id
                                    return (
                                      <button
                                        key={chart.id}
                                        type="button"
                                        onClick={() => {
                                          updateBlock(block.id, { chartId: chart.id, chartTitle: title })
                                          setChartSearchBlockId(null)
                                        }}
                                        className={cn(
                                          'flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40',
                                          isCurrent && 'border-primary bg-primary/5',
                                        )}
                                      >
                                        {isCurrent ? (
                                          <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                        ) : (
                                          <BarChart3 className="size-4 shrink-0 text-muted-foreground" />
                                        )}
                                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{title}</span>
                                        {datasetName && (
                                          <span className="shrink-0 truncate text-xs text-muted-foreground">{datasetName}</span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="self-start"
                                onClick={() => setChartSearchBlockId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-3 flex h-32 items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground">
                              {block.chartId ? 'Interactive chart — remains dynamic on the published page.' : 'No chart selected yet.'}
                            </div>
                          )}
                          {active ? (
                            <input
                              value={block.caption}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              placeholder="Add a caption..."
                              className={cn(ghostField, 'mt-1.5 text-xs text-muted-foreground')}
                            />
                          ) : (
                            block.caption && <figcaption className="mt-1.5 text-xs text-muted-foreground">{block.caption}</figcaption>
                          )}
                        </figure>
                      </BlockWrapper>
                    )
                  }

                  if (block.type === 'highlight') {
                    return (
                      <BlockWrapper key={block.id} {...shellProps}>
                        <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3.5">
                          {active ? (
                            <>
                              <input
                                autoFocus
                                value={block.highlight}
                                onChange={(e) => updateBlock(block.id, { highlight: e.target.value })}
                                placeholder="Key highlight, e.g. 32% reduction in maternal mortality"
                                className={cn(ghostField, 'text-base font-semibold text-primary')}
                              />
                              <Textarea
                                value={block.supportingText}
                                onChange={(e) => updateBlock(block.id, { supportingText: e.target.value })}
                                placeholder="Optional supporting text"
                                rows={1}
                                className={cn(ghostField, 'mt-1 min-h-0 resize-none text-sm text-muted-foreground')}
                              />
                            </>
                          ) : (
                            <>
                              <p className="text-base font-semibold text-primary">{block.highlight || 'Key highlight'}</p>
                              {block.supportingText && <p className="mt-1 text-sm text-muted-foreground">{block.supportingText}</p>}
                            </>
                          )}
                        </div>
                      </BlockWrapper>
                    )
                  }

                  return (
                    <BlockWrapper key={block.id} {...shellProps}>
                      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                        <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          {active ? (
                            <>
                              <input
                                autoFocus
                                value={block.label}
                                onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                                placeholder="Link label, e.g. Read the full report"
                                className={cn(ghostField, 'text-sm font-medium text-primary')}
                              />
                              <input
                                value={block.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="https://example.org/resource"
                                className={cn(ghostField, 'mt-0.5 font-mono text-xs text-muted-foreground')}
                              />
                              <Textarea
                                value={block.description}
                                onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                placeholder="Optional description"
                                rows={1}
                                className={cn(ghostField, 'mt-1 min-h-0 resize-none text-xs text-muted-foreground')}
                              />
                            </>
                          ) : (
                            <>
                              <p className="truncate text-sm font-medium text-primary">{block.label || block.url || 'Untitled link'}</p>
                              {block.description && <p className="mt-0.5 text-xs text-muted-foreground">{block.description}</p>}
                            </>
                          )}
                        </div>
                      </div>
                    </BlockWrapper>
                  )
                })}
              </div>

              <div className="border-t border-border px-6 py-4">{addContentTrigger}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ImageBlockCanvas({
  asset,
  caption,
  onAssetChange,
  onCaptionChange,
}: {
  asset: UploadedAsset | null
  caption: string
  onAssetChange: (asset: UploadedAsset | null) => void
  onCaptionChange: (caption: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = React.useState<string>()

  const handleFile = async (file: File) => {
    const error = validateAssetFile(file, { extensions: SUPPORTED_IMAGE_EXTENSIONS, maxBytes: MAX_IMAGE_BYTES })
    if (error) {
      setUploadError(error)
      return
    }
    setUploadError(undefined)
    onAssetChange(await buildUploadedAsset(file, true))
  }

  return (
    <figure>
      {asset?.dataUrl ? (
        <div className="group/img relative">
          <img src={asset.dataUrl} alt="" className="w-full rounded-lg border border-border object-cover" />
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/img:opacity-100">
            <Button type="button" variant="outline" size="sm" className="bg-card" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="outline" size="sm" className="bg-card" onClick={() => onAssetChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <UploadCloud className="size-5" />
          Upload image
          <span className="text-xs text-muted-foreground">
            {formatUploadHint(SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)}
          </span>
        </button>
      )}
      <FieldError message={uploadError} />
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={SUPPORTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <input
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Add a caption..."
        className={cn(ghostField, 'mt-1.5 text-xs text-muted-foreground')}
      />
    </figure>
  )
}

export { UseCaseStep2Builder }
