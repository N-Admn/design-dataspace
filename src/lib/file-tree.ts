import type { DatasetFile } from '@/types/dataset'

/**
 * Builds a folder/file tree from `DatasetFile.path` — the field a Public
 * Platform import (GitHub, Kaggle, Hugging Face, ...) already populates when
 * the source preserves a folder hierarchy (e.g. "train" for
 * `dataset/train/data.csv`; see the field's doc comment in `types/dataset.ts`).
 * A direct upload has no `path`, so its files land at the root — the tree
 * degrades to a flat list automatically, no branching needed by callers.
 *
 * This is presentation-only: it never mutates `DatasetFile` or invents path
 * data that isn't already on the record.
 */

export interface FileTreeFileNode {
  type: 'file'
  name: string
  file: DatasetFile
}

export interface FileTreeFolderNode {
  type: 'folder'
  name: string
  /** Full path from the root, e.g. "train" or "train/audio". Stable across
   *  renders — used as the expand/collapse state key. */
  path: string
  children: FileTreeNode[]
}

export type FileTreeNode = FileTreeFileNode | FileTreeFolderNode

interface MutableFolder extends Omit<FileTreeFolderNode, 'children'> {
  children: FileTreeNode[]
  subfolders: Map<string, MutableFolder>
}

function sortChildren(node: MutableFolder) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const child of node.children) {
    // Every folder child was itself built as a `MutableFolder` above — the
    // `FileTreeFolderNode` type is its public-facing subset.
    if (child.type === 'folder') sortChildren(child as MutableFolder)
  }
}

export function buildFileTree(files: DatasetFile[]): FileTreeNode[] {
  const root: MutableFolder = { type: 'folder', name: '', path: '', children: [], subfolders: new Map() }

  for (const file of files) {
    const segments = file.path ? file.path.split('/').filter(Boolean) : []
    let cursor = root
    let currentPath = ''
    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      let next = cursor.subfolders.get(segment)
      if (!next) {
        next = { type: 'folder', name: segment, path: currentPath, children: [], subfolders: new Map() }
        cursor.subfolders.set(segment, next)
        cursor.children.push(next)
      }
      cursor = next
    }
    cursor.children.push({ type: 'file', name: file.name, file })
  }

  sortChildren(root)
  return root.children
}

/** Finds the first file in display order (folders before files, each
 * alphabetical — see `sortChildren`), descending into subfolders as needed.
 * Returns the folder paths that must be expanded to reveal it, so the
 * browser can open to something useful on first render instead of an empty
 * collapsed tree. */
export function findFirstFile(nodes: FileTreeNode[]): { file: DatasetFile; expandedPaths: string[] } | null {
  for (const node of nodes) {
    if (node.type === 'file') return { file: node.file, expandedPaths: [] }
    const found = findFirstFile(node.children)
    if (found) return { file: found.file, expandedPaths: [node.path, ...found.expandedPaths] }
  }
  return null
}
