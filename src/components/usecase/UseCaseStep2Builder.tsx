import * as React from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Heading as HeadingIcon,
  ImageIcon,
  MessageSquareQuote,
  Pencil,
  Pilcrow,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/ui/field-error'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ChartSelectDrawer } from '@/components/usecase/ChartSelectDrawer'
import { cn } from '@/lib/utils'
import { validateAssetFile, buildUploadedAsset } from '@/lib/generic-upload'
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGE_BYTES } from '@/types/event'
import type { UseCaseIntroductionErrors } from '@/lib/usecase-validation'
import type {
  UseCaseBlock,
  UseCaseBlockType,
  UseCaseHeadingLevel,
  UseCaseIntroduction,
} from '@/types/usecase'

let blockIdCounter = 0

const BLOCK_MENU: { type: UseCaseBlockType; label: string; icon: typeof HeadingIcon }[] = [
  { type: 'heading', label: 'Heading', icon: HeadingIcon },
  { type: 'paragraph', label: 'Paragraph', icon: Pilcrow },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'chart', label: 'Chart', icon: BarChart3 },
  { type: 'callout', label: 'Callout', icon: MessageSquareQuote },
]

function createBlock(type: UseCaseBlockType): UseCaseBlock {
  blockIdCounter += 1
  const id = `block-${blockIdCounter}`
  switch (type) {
    case 'heading':
      return { id, type: 'heading', text: '', level: 2 }
    case 'paragraph':
      return { id, type: 'paragraph', html: '' }
    case 'image':
      return { id, type: 'image', asset: null, caption: '' }
    case 'chart':
      return { id, type: 'chart', chartId: null, chartTitle: '', caption: '' }
    case 'callout':
      return { id, type: 'callout', highlight: '', supportingText: '' }
  }
}

interface BlockShellProps {
  label: string
  icon: typeof HeadingIcon
  summary: string
  expanded: boolean
  onToggleExpand: () => void
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  children: React.ReactNode
}

function BlockShell({
  label,
  icon: Icon,
  summary,
  expanded,
  onToggleExpand,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: BlockShellProps) {
  return (
    <div className="rounded-lg border border-border">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand()
          }
        }}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
          expanded && 'border-b border-border',
        )}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
          {!expanded && <span className="min-w-0 truncate font-normal text-muted-foreground">— {summary}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={isFirst}
            aria-label="Move up"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={isLast}
            aria-label="Move down"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={expanded ? 'Collapse block' : 'Edit block'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete block"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function blockSummary(block: UseCaseBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text || 'Untitled heading'
    case 'paragraph':
      return stripHtml(block.html) || 'Empty paragraph'
    case 'image':
      return block.caption || block.asset?.name || 'No image uploaded'
    case 'chart':
      return block.chartTitle || 'No chart selected'
    case 'callout':
      return block.highlight || 'Empty callout'
  }
}

interface UseCaseStep2BuilderProps {
  metadataTitle: string
  onMetadataTitleChange: (title: string) => void
  introduction: UseCaseIntroduction
  onIntroductionChange: <K extends keyof UseCaseIntroduction>(field: K, value: UseCaseIntroduction[K]) => void
  blocks: UseCaseBlock[]
  onBlocksChange: (blocks: UseCaseBlock[]) => void
  introErrors?: UseCaseIntroductionErrors
}

function UseCaseStep2Builder({
  metadataTitle,
  onMetadataTitleChange,
  introduction,
  onIntroductionChange,
  blocks,
  onBlocksChange,
  introErrors,
}: UseCaseStep2BuilderProps) {
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null)
  const [addMenuOpen, setAddMenuOpen] = React.useState(false)
  const [chartDrawerBlockId, setChartDrawerBlockId] = React.useState<string | null>(null)
  const [openBlockId, setOpenBlockId] = React.useState<string | null>(null)

  const handleThumbnailFile = async (file: File) => {
    const error = validateAssetFile(file, { extensions: SUPPORTED_IMAGE_EXTENSIONS, maxBytes: MAX_IMAGE_BYTES })
    if (error) return
    onIntroductionChange('thumbnail', await buildUploadedAsset(file, true))
  }

  const updateBlock = (id: string, patch: Partial<UseCaseBlock>) => {
    onBlocksChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as UseCaseBlock) : b)))
  }

  const removeBlock = (id: string) => onBlocksChange(blocks.filter((b) => b.id !== id))

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
    setOpenBlockId(block.id)
    setAddMenuOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">Builder</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build your Use Case and tell its story using flexible content blocks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            This section always appears first and cannot be removed.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <Label>Thumbnail</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Add an image that represents this Use Case.</p>
            <div className="mt-1.5">
              {introduction.thumbnail ? (
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {introduction.thumbnail.dataUrl && (
                    <img
                      src={introduction.thumbnail.dataUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-md border border-border object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{introduction.thumbnail.name}</p>
                    <p className="text-xs text-muted-foreground">{introduction.thumbnail.sizeLabel}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => thumbnailInputRef.current?.click()}>
                    Change
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onIntroductionChange('thumbnail', null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => thumbnailInputRef.current?.click()}>
                  <UploadCloud className="size-4" />
                  Upload
                </Button>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                className="hidden"
                accept={SUPPORTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleThumbnailFile(file)
                  e.target.value = ''
                }}
              />
            </div>
            <FieldError message={introErrors?.thumbnail} />
          </div>

          <div>
            <Label htmlFor="usecase-builder-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="usecase-builder-title"
              className="mt-1.5"
              placeholder="Untitled Use Case"
              value={metadataTitle}
              onChange={(e) => onMetadataTitleChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="usecase-builder-subtitle">Subtitle</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Add a short statement that summarizes the Use Case.</p>
            <Input
              id="usecase-builder-subtitle"
              className="mt-1.5"
              placeholder="Keep it concise..."
              value={introduction.subtitle}
              onChange={(e) => onIntroductionChange('subtitle', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="usecase-builder-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <div className="mt-1.5">
              <RichTextEditor
                id="usecase-builder-description"
                value={introduction.descriptionHtml}
                onChange={(html) => onIntroductionChange('descriptionHtml', html)}
                placeholder="Introduce this Use Case..."
              />
            </div>
            <FieldError message={introErrors?.description} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Build your content</p>
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
        </div>

        {blocks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Your Use Case is ready to be built.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setAddMenuOpen(true)}>
              <Plus className="size-4" />
              Add Content
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {blocks.map((block, index) => {
              const shellProps = {
                isFirst: index === 0,
                isLast: index === blocks.length - 1,
                onMoveUp: () => moveBlock(index, -1),
                onMoveDown: () => moveBlock(index, 1),
                onDelete: () => removeBlock(block.id),
                summary: blockSummary(block),
                expanded: openBlockId === block.id,
                onToggleExpand: () => setOpenBlockId((prev) => (prev === block.id ? null : block.id)),
              }

              if (block.type === 'heading') {
                return (
                  <BlockShell key={block.id} label="Heading" icon={HeadingIcon} {...shellProps}>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        placeholder="Heading text"
                        className="flex-1"
                        value={block.text}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      />
                      <div className="sm:w-40">
                        <SearchableSelect
                          options={[
                            { value: '2', label: 'Heading (large)' },
                            { value: '3', label: 'Subheading' },
                          ]}
                          value={String(block.level)}
                          onChange={(value) => updateBlock(block.id, { level: Number(value) as UseCaseHeadingLevel })}
                          placeholder="Level..."
                        />
                      </div>
                    </div>
                  </BlockShell>
                )
              }

              if (block.type === 'paragraph') {
                return (
                  <BlockShell key={block.id} label="Paragraph" icon={Pilcrow} {...shellProps}>
                    <RichTextEditor
                      value={block.html}
                      onChange={(html) => updateBlock(block.id, { html })}
                      placeholder="Write a paragraph..."
                    />
                  </BlockShell>
                )
              }

              if (block.type === 'image') {
                return (
                  <BlockShell key={block.id} label="Image" icon={ImageIcon} {...shellProps}>
                    <ImageBlockEditor
                      asset={block.asset}
                      caption={block.caption}
                      onAssetChange={(asset) => updateBlock(block.id, { asset })}
                      onCaptionChange={(caption) => updateBlock(block.id, { caption })}
                    />
                  </BlockShell>
                )
              }

              if (block.type === 'chart') {
                return (
                  <BlockShell key={block.id} label="Chart" icon={BarChart3} {...shellProps}>
                    <div className="flex flex-col gap-3">
                      {block.chartId ? (
                        <div className="rounded-lg border border-border p-3">
                          <p className="text-sm font-medium text-foreground">{block.chartTitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Interactive chart — remains dynamic on the published page.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setChartDrawerBlockId(block.id)}>
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateBlock(block.id, { chartId: null, chartTitle: '' })}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setChartDrawerBlockId(block.id)}>
                          Select Chart
                        </Button>
                      )}
                      <div>
                        <Label htmlFor={`chart-caption-${block.id}`}>Caption</Label>
                        <Input
                          id={`chart-caption-${block.id}`}
                          className="mt-1.5"
                          placeholder="Optional caption"
                          value={block.caption}
                          onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                        />
                      </div>
                    </div>
                  </BlockShell>
                )
              }

              return (
                <BlockShell key={block.id} label="Callout" icon={MessageSquareQuote} {...shellProps}>
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label htmlFor={`callout-highlight-${block.id}`}>Key fact / highlight</Label>
                      <Input
                        id={`callout-highlight-${block.id}`}
                        className="mt-1.5"
                        placeholder="e.g. 32% reduction in maternal mortality"
                        value={block.highlight}
                        onChange={(e) => updateBlock(block.id, { highlight: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`callout-support-${block.id}`}>Supporting text</Label>
                      <Textarea
                        id={`callout-support-${block.id}`}
                        className="mt-1.5"
                        rows={2}
                        placeholder="Optional supporting text"
                        value={block.supportingText}
                        onChange={(e) => updateBlock(block.id, { supportingText: e.target.value })}
                      />
                    </div>
                  </div>
                </BlockShell>
              )
            })}
          </div>
        )}
      </div>

      <ChartSelectDrawer
        open={chartDrawerBlockId !== null}
        onOpenChange={(open) => !open && setChartDrawerBlockId(null)}
        onSelect={(chart) => {
          if (!chartDrawerBlockId) return
          updateBlock(chartDrawerBlockId, { chartId: chart.id, chartTitle: chart.title })
          setChartDrawerBlockId(null)
        }}
      />
    </div>
  )
}

function ImageBlockEditor({
  asset,
  caption,
  onAssetChange,
  onCaptionChange,
}: {
  asset: UseCaseIntroduction['thumbnail']
  caption: string
  onAssetChange: (asset: UseCaseIntroduction['thumbnail']) => void
  onCaptionChange: (caption: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const error = validateAssetFile(file, { extensions: SUPPORTED_IMAGE_EXTENSIONS, maxBytes: MAX_IMAGE_BYTES })
    if (error) return
    onAssetChange(await buildUploadedAsset(file, true))
  }

  return (
    <div className="flex flex-col gap-3">
      {asset ? (
        <div className="flex flex-col gap-2">
          {asset.dataUrl && <img src={asset.dataUrl} alt="" className="max-h-56 w-full rounded-lg border border-border object-cover" />}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onAssetChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="size-4" />
          Upload image
        </Button>
      )}
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
      <div>
        <Label htmlFor="image-caption">Caption</Label>
        <Input
          id="image-caption"
          className="mt-1.5"
          placeholder="Optional caption"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export { UseCaseStep2Builder }
