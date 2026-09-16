import * as React from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Eye, Pencil, Plus, Trash2, Video } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldError } from '@/components/ui/field-error'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DropzoneUploadField } from '@/components/shared/DropzoneUploadField'
import { ResourcePreviewDialog, assetToPreviewResource, type PreviewResource } from '@/components/shared/ResourcePreviewDialog'
import { PublicationFileDetailsSheet } from '@/components/publication/PublicationFileDetailsSheet'
import { buildUploadedAsset, formatUploadLimit, validateAssetFile } from '@/lib/generic-upload'
import { getPublicationFileTitle } from '@/lib/publication-file'
import { getYouTubeThumbnailUrl, isValidYouTubeUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'
import { MAX_PUBLICATION_FILE_BYTES, PUBLICATION_FILE_EXTENSIONS, type PublicationBlock, type PublicationFileBlock } from '@/types/publication'

let blockIdCounter = 0

interface PublicationStep2ContentProps {
  blocks: PublicationBlock[]
  onBlocksChange: (blocks: PublicationBlock[]) => void
}

function FileBlockRow({
  block,
  onTitleChange,
  onOpenDetails,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}: {
  block: PublicationFileBlock
  onTitleChange: (id: string, title: string) => void
  onOpenDetails: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const title = getPublicationFileTitle(block)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(title)

  React.useEffect(() => {
    if (!isEditing) setDraft(title)
  }, [title, isEditing])

  const commit = () => {
    setIsEditing(false)
    const next = draft.trim()
    if (next) {
      onTitleChange(block.id, next)
    } else {
      setDraft(title)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
      <CheckCircle2 className="size-5 shrink-0 text-success-text" />
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            autoFocus
            value={draft}
            aria-label={`Title for ${block.asset?.name ?? 'file'}`}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(title)
                setIsEditing(false)
              }
            }}
            className="h-8 max-w-xs text-sm font-medium"
          />
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit title for ${block.asset?.name ?? 'file'}`}
                  onClick={() => setIsEditing(true)}
                  className="size-6 shrink-0"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Edit title</TooltipContent>
            </Tooltip>
          </div>
        )}
        {block.asset && (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="secondary">{block.asset.extension}</Badge>
            <span>Size: {block.asset.sizeLabel}</span>
            <span>•</span>
            <span>Uploaded: {block.asset.uploadedAt}</span>
            <span>•</span>
            <span className="truncate">Original: {block.asset.name}</span>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="success">Ready</Badge>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={isFirst} aria-label="Move up" onClick={onMoveUp}>
            <ChevronUp className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={isLast} aria-label="Move down" onClick={onMoveDown}>
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`View details for ${block.asset?.name ?? 'file'}`}
            onClick={onOpenDetails}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${block.asset?.name ?? 'file'}`}
            onClick={onRemove}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function VideoBlockRow({
  block,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}: {
  block: Extract<PublicationBlock, { type: 'video' }>
  onChange: (patch: Partial<PublicationBlock>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const thumbnail = getYouTubeThumbnailUrl(block.url)
  const isValid = isValidYouTubeUrl(block.url)

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Video className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title for this video"
          className="h-8 text-sm font-medium"
        />
        <Input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={Boolean(block.url) && !isValid}
          className={cn('mt-1.5 h-8 font-mono text-xs')}
        />
        {block.url && !isValid && <FieldError message="Enter a valid YouTube URL." />}
        {thumbnail && <img src={thumbnail} alt="" className="mt-2 h-24 w-40 rounded-md border border-border object-cover" />}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon" disabled={isFirst} aria-label="Move up" onClick={onMoveUp}>
          <ChevronUp className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isLast} aria-label="Move down" onClick={onMoveDown}>
          <ChevronDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete video"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function PublicationStep2Content({ blocks, onBlocksChange }: PublicationStep2ContentProps) {
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])
  const [detailsId, setDetailsId] = React.useState<string | null>(null)
  const [previewResource, setPreviewResource] = React.useState<PreviewResource | null>(null)

  const detailsBlock = detailsId
    ? (blocks.find((b) => b.id === detailsId) as PublicationFileBlock | undefined) ?? null
    : null

  const updateBlock = (id: string, patch: Partial<PublicationBlock>) => {
    onBlocksChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as PublicationBlock) : b)))
  }

  const removeBlock = (id: string) => onBlocksChange(blocks.filter((b) => b.id !== id))

  const moveBlock = (index: number, direction: -1 | 1) => {
    const next = [...blocks]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onBlocksChange(next)
  }

  const addVideoBlock = () => {
    blockIdCounter += 1
    onBlocksChange([...blocks, { id: `pub-block-${blockIdCounter}`, type: 'video', url: '', title: '' }])
  }

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    const errors: string[] = []
    const newBlocks: PublicationBlock[] = []

    for (const file of files) {
      const error = validateAssetFile(file, { extensions: PUBLICATION_FILE_EXTENSIONS, maxBytes: MAX_PUBLICATION_FILE_BYTES })
      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }
      const asset = await buildUploadedAsset(file, false)
      blockIdCounter += 1
      newBlocks.push({ id: `pub-block-${blockIdCounter}`, type: 'file', asset, title: '' })
    }

    setUploadErrors(errors)
    if (newBlocks.length > 0) onBlocksChange([...blocks, ...newBlocks])
  }

  const openPreview = (block: PublicationFileBlock) => {
    if (!block.asset) return
    setPreviewResource(assetToPreviewResource(block.asset, getPublicationFileTitle(block)))
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DropzoneUploadField
            extensions={PUBLICATION_FILE_EXTENSIONS}
            maxBytes={MAX_PUBLICATION_FILE_BYTES}
            multiple
            onFiles={handleFiles}
            showExtensionBadges
            formatHint={`Maximum file size limit: ${formatUploadLimit(MAX_PUBLICATION_FILE_BYTES)}`}
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

          <Button type="button" variant="ghost" size="sm" className="self-start" onClick={addVideoBlock}>
            <Plus className="size-4" />
            Add a YouTube video instead
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Files ({blocks.length})</CardTitle>
          {blocks.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-success-text">
              <CheckCircle2 className="size-4" />
              {blocks.length} Item{blocks.length === 1 ? '' : 's'} Ready
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {blocks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            blocks.map((block, index) => {
              const shared = {
                isFirst: index === 0,
                isLast: index === blocks.length - 1,
                onMoveUp: () => moveBlock(index, -1),
                onMoveDown: () => moveBlock(index, 1),
              }

              if (block.type === 'file') {
                return (
                  <FileBlockRow
                    key={block.id}
                    block={block}
                    onTitleChange={(id, title) => updateBlock(id, { title })}
                    onOpenDetails={() => setDetailsId(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    {...shared}
                  />
                )
              }

              return (
                <VideoBlockRow
                  key={block.id}
                  block={block}
                  onChange={(patch) => updateBlock(block.id, patch)}
                  onRemove={() => removeBlock(block.id)}
                  {...shared}
                />
              )
            })
          )}
        </CardContent>
      </Card>

      <PublicationFileDetailsSheet
        block={detailsBlock}
        onOpenChange={(open) => !open && setDetailsId(null)}
        onTitleChange={(id, title) => updateBlock(id, { title })}
        onDescriptionChange={(id, description) => updateBlock(id, { description })}
        onPreview={openPreview}
        onRemove={removeBlock}
      />

      <ResourcePreviewDialog resource={previewResource} onOpenChange={(open) => !open && setPreviewResource(null)} />
    </div>
  )
}

export { PublicationStep2Content }
