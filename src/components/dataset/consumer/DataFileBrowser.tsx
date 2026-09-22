import * as React from 'react'
import { ChevronRight, FileText, Folder, FolderOpen, Image as ImageIcon, Music, Table2 } from 'lucide-react'

import { getResourceTitle } from '@/lib/file-validation'
import { resolveFilePreviewKind } from '@/lib/file-preview-kind'
import { cn } from '@/lib/utils'
import type { FileTreeFileNode, FileTreeFolderNode, FileTreeNode } from '@/lib/file-tree'
import type { DatasetFile } from '@/types/dataset'

const FILE_ICONS = {
  tabular: Table2,
  image: ImageIcon,
  pdf: FileText,
  audio: Music,
  unsupported: FileText,
} as const

function FileIcon({ extension, className }: { extension: string; className?: string }) {
  const Icon = FILE_ICONS[resolveFilePreviewKind(extension)]
  return <Icon className={className} aria-hidden="true" />
}

interface FileRowProps {
  node: FileTreeFileNode
  depth: number
  isSelected: boolean
  onSelect: (file: DatasetFile) => void
}

function FileRow({ node, depth, isSelected, onSelect }: FileRowProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelect(node.file)}
        style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          isSelected ? 'bg-surface-subdued font-medium text-text-default' : 'text-text-default hover:bg-surface-subdued/60',
        )}
      >
        <FileIcon extension={node.file.extension} className="size-4 shrink-0 text-text-subdued" />
        <span className="truncate">{getResourceTitle(node.file)}</span>
      </button>
    </li>
  )
}

interface FolderRowProps {
  node: FileTreeFolderNode
  depth: number
  expanded: boolean
  onToggle: (path: string) => void
  children: React.ReactNode
}

function FolderRow({ node, depth, expanded, onToggle, children }: FolderRowProps) {
  const panelId = `data-folder-${node.path.replace(/[^a-zA-Z0-9_-]/g, '-')}`
  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onToggle(node.path)}
        style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
        className="flex w-full items-center gap-1.5 rounded-md py-2 pr-2 text-left text-sm font-medium text-text-default transition-colors hover:bg-surface-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
      >
        <ChevronRight className={cn('size-3.5 shrink-0 text-text-subdued transition-transform', expanded && 'rotate-90')} aria-hidden="true" />
        {expanded ? (
          <FolderOpen className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
        ) : (
          <Folder className="size-4 shrink-0 text-text-subdued" aria-hidden="true" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && (
        <ul id={panelId}>
          {children}
        </ul>
      )}
    </li>
  )
}

interface DataFileBrowserProps {
  tree: FileTreeNode[]
  depth?: number
  selectedFileId: string | null
  onSelectFile: (file: DatasetFile) => void
  expandedPaths: Set<string>
  onToggleFolder: (path: string) => void
}

/** Consumer-facing folder/file browser for a dataset's Data tab — a plain
 * nested list with disclosure buttons, not a full ARIA `tree` widget: every
 * control here is a native `<button>`, so keyboard use (Tab, Enter, Space)
 * and accessible names come for free without a roving-tabindex treeview.
 * Deliberately plainer than a code-host's file browser: no commit/branch/SHA
 * concepts, no repository-style tree connector lines (indentation alone
 * carries the hierarchy), generous spacing, and one icon per file type
 * rather than a developer-oriented mime/language icon set. */
function DataFileBrowser({ tree, depth = 0, selectedFileId, onSelectFile, expandedPaths, onToggleFolder }: DataFileBrowserProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {tree.map((node) =>
        node.type === 'folder' ? (
          <FolderRow key={node.path} node={node} depth={depth} expanded={expandedPaths.has(node.path)} onToggle={onToggleFolder}>
            <DataFileBrowser
              tree={node.children}
              depth={depth + 1}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
              expandedPaths={expandedPaths}
              onToggleFolder={onToggleFolder}
            />
          </FolderRow>
        ) : (
          <FileRow key={node.file.id} node={node} depth={depth} isSelected={node.file.id === selectedFileId} onSelect={onSelectFile} />
        ),
      )}
    </ul>
  )
}

export { DataFileBrowser }
