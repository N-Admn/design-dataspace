/** "Public Platform" dataset import — Kaggle / GitHub / Hugging Face.
 *
 * INTEGRATION BOUNDARY: `extractDatasetFromPlatform` is the single seam where real
 * platform ingestion would plug in. This prototype implements it with a simulated
 * delay + realistic per-platform mock file listings so the full UX can be
 * demonstrated and validated. There are NO network calls and nothing here pretends
 * a production backend exists — swap the body of this one function for a real
 * import service later and every downstream UI state keeps working unchanged.
 * Mirrors the simulated-work pattern in `api-resource.ts` / `submitSupportMessage`. */
import { formatFileSize } from '@/lib/format'

export type ImportPlatform = 'kaggle' | 'github' | 'huggingface'

interface PlatformOption {
  value: ImportPlatform
  label: string
  /** Matches the URL hostname for "does this URL belong to the selected platform". */
  hostPattern: RegExp
  urlPlaceholder: string
  urlHelp: string
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    value: 'kaggle',
    label: 'Kaggle',
    hostPattern: /(^|\.)kaggle\.com$/i,
    urlPlaceholder: 'https://www.kaggle.com/datasets/owner/dataset-name',
    urlHelp: 'Paste the full Kaggle dataset URL (kaggle.com/datasets/…).',
  },
  {
    value: 'github',
    label: 'GitHub',
    hostPattern: /(^|\.)github\.com$/i,
    urlPlaceholder: 'https://github.com/owner/repository',
    urlHelp: 'Paste the GitHub repository URL that holds the dataset files.',
  },
  {
    value: 'huggingface',
    label: 'Hugging Face',
    hostPattern: /(^|\.)huggingface\.co$/i,
    urlPlaceholder: 'https://huggingface.co/datasets/owner/dataset-name',
    urlHelp: 'Paste the Hugging Face dataset URL (huggingface.co/datasets/…).',
  },
]

export const PLATFORM_LABELS: Record<ImportPlatform, string> = {
  kaggle: 'Kaggle',
  github: 'GitHub',
  huggingface: 'Hugging Face',
}

export function platformOption(platform: ImportPlatform): PlatformOption {
  return PLATFORM_OPTIONS.find((p) => p.value === platform)!
}

export type PlatformUrlError = 'empty' | 'malformed' | 'wrong-platform'

/** Validates that a URL is well-formed and belongs to the selected platform. */
export function validatePlatformUrl(platform: ImportPlatform, url: string): PlatformUrlError | null {
  const trimmed = url.trim()
  if (!trimmed) return 'empty'
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return 'malformed'
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'malformed'
  if (!platformOption(platform).hostPattern.test(parsed.hostname)) return 'wrong-platform'
  return null
}

export function platformUrlErrorMessage(error: PlatformUrlError, platform: ImportPlatform): string {
  const label = PLATFORM_LABELS[platform]
  switch (error) {
    case 'empty':
      return 'Enter the dataset URL.'
    case 'malformed':
      return 'Enter a valid URL starting with http:// or https://.'
    case 'wrong-platform':
      return `This URL doesn’t look like a ${label} dataset. Paste a ${label} link, or switch the platform above.`
  }
}

/** A file discovered on the remote platform. `path` carries any folder hierarchy. */
export interface ExtractedFile {
  name: string
  path?: string
  extension: string
  sizeLabel: string
  sizeBytes: number
  rowCount?: number
  columnCount?: number
}

export type ExtractResult = { ok: true; files: ExtractedFile[] } | { ok: false; error: string }

// ---------------------------------------------------------------------------
// Mock extraction data — prototype only. Replace with the real import service.
// ---------------------------------------------------------------------------

function mkFile(
  name: string,
  path: string | undefined,
  sizeBytes: number,
  rowCount?: number,
  columnCount?: number,
): ExtractedFile {
  const extMatch = /\.([^.]+)$/.exec(name)
  return {
    name,
    path,
    extension: (extMatch ? extMatch[1] : '').toUpperCase(),
    sizeBytes,
    sizeLabel: formatFileSize(sizeBytes),
    rowCount,
    columnCount,
  }
}

const KB = 1024
const MB = 1024 * 1024

/** Realistic-looking listings per platform. Kaggle datasets are usually flat;
 * GitHub repos and Hugging Face dataset repos carry a folder hierarchy. */
const MOCK_LISTINGS: Record<ImportPlatform, ExtractedFile[]> = {
  kaggle: [
    mkFile('train.csv', undefined, 4.2 * MB, 45211, 17),
    mkFile('test.csv', undefined, 1.1 * MB, 11162, 16),
    mkFile('sample_submission.csv', undefined, 118 * KB, 11162, 2),
    mkFile('data-description.txt', undefined, 7 * KB),
  ],
  github: [
    mkFile('README.md', undefined, 6 * KB),
    mkFile('train.csv', 'data', 2.8 * MB, 32561, 15),
    mkFile('test.csv', 'data', 1.4 * MB, 16281, 15),
    mkFile('source-2023.csv', 'data/raw', 5.0 * MB, 60000, 22),
    mkFile('schema.txt', 'docs', 3 * KB),
  ],
  huggingface: [
    mkFile('README.md', undefined, 4 * KB),
    mkFile('train.csv', 'data', 12.5 * MB, 87599, 5),
    mkFile('validation.csv', 'data', 1.6 * MB, 10570, 5),
    mkFile('test.csv', 'data', 1.5 * MB, 9536, 5),
  ],
}

/** Whether the URL path looks like a real dataset/repository link (vs. just the
 * platform's home or listing page). Drives the demonstrable failure state. */
function looksLikeDatasetUrl(platform: ImportPlatform, url: string): boolean {
  let pathname: string
  try {
    pathname = new URL(url.trim()).pathname
  } catch {
    return false
  }
  const segments = pathname.split('/').filter(Boolean)
  if (platform === 'github') return segments.length >= 2
  // kaggle: /datasets/<owner>/<slug> ; huggingface: /datasets/<name> or /datasets/<owner>/<name>
  const idx = segments.indexOf('datasets')
  return idx !== -1 && segments.length > idx + 1
}

/** Prototype extraction: simulates a short delay, then returns realistic mock
 * files for the selected platform. Fails for URLs that don't point at a specific
 * dataset/repo, or any URL containing "fail" (a deliberate hook for demoing the
 * failure state). No network, no real ingestion. */
export function extractDatasetFromPlatform(platform: ImportPlatform, url: string): Promise<ExtractResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (/\bfail\b/i.test(url) || !looksLikeDatasetUrl(platform, url)) {
        resolve({
          ok: false,
          error:
            `Couldn’t extract a dataset from that ${PLATFORM_LABELS[platform]} URL. Check the link points to a ` +
            `specific ${platform === 'github' ? 'repository' : 'dataset'} and try again.`,
        })
        return
      }
      resolve({ ok: true, files: MOCK_LISTINGS[platform].map((f) => ({ ...f })) })
    }, 1100)
  })
}
