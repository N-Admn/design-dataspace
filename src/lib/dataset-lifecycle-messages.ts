import type { DatasetStatus } from '@/types/dataset'

export interface LifecycleMessage {
  title: string
  description: string
}

/** Single source of truth for the copy shown after a dataset-saving action,
 * so wording stays consistent regardless of which module launched Dataset Creation. */
export function datasetLifecycleMessage(status: DatasetStatus): LifecycleMessage {
  if (status === 'published') {
    return {
      title: 'Dataset published',
      description: 'It is now publicly available on CivicDataSpace.',
    }
  }
  return {
    title: 'Dataset saved as Draft',
    description: 'It is not publicly available yet.',
  }
}
