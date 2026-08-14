import type { UploadedAsset } from '@/lib/generic-upload'

export const SUPPORT_TOPIC_OPTIONS = [
  { value: 'general', label: 'General question' },
  { value: 'dataset', label: 'Dataset contribution' },
  { value: 'usecase', label: 'Use Case contribution' },
  { value: 'ai-model', label: 'AI Model contribution' },
  { value: 'event', label: 'Event contribution' },
  { value: 'collaborative', label: 'Collaborative contribution' },
  { value: 'chart', label: 'Chart contribution' },
  { value: 'account', label: 'Account & profile' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'report', label: 'Report a problem' },
  { value: 'other', label: 'Other' },
]

export const SUPPORT_ATTACHMENT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'txt', 'csv', 'docx']
export const MAX_SUPPORT_ATTACHMENT_BYTES = 10 * 1024 * 1024

export interface SupportMessagePayload {
  topic: string
  subject: string
  message: string
  attachment: UploadedAsset | null
  context: string
  email: string
}

export interface SupportMessageResult {
  success: boolean
  /** Only populated when a real backend actually returns one — never fabricated client-side. */
  referenceId?: string
}

/** No backend exists yet — this simulates the network round trip so the UI has a real
 * loading state to show, without inventing a reference id the platform hasn't issued. */
export function submitSupportMessage(_payload: SupportMessagePayload): Promise<SupportMessageResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ success: true }), 900)
  })
}
