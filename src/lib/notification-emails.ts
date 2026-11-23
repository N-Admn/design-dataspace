import type { EventType } from '@/types/notifications'

/** Email policy: every notification is in-app only. The one email the product sends is a single welcome email when an account is first
 *  registered. There is no email for invitations, membership, roles, access, Evaluator assignments, content activity, approvals,
 *  collaboratives or routine platform updates, so no per-event email templates exist. Nothing here sends anything: the welcome email is a
 *  visual template for review. */

export const EMAIL_SENDER = { name: 'CivicDataSpace', address: 'no-reply@civicdataspace.in' }

export interface EmailTemplate {
  type: 'welcome'
  /** Short name for the picker. */
  label: string
  /** Who gets it, in the product's own terms. */
  to: string
  subject: string
  /** The grey line that follows the subject in an inbox list. */
  preheader: string
  heading: string
  paragraphs: string[]
  quote?: { label: string; text: string }
  /** What it is about, as label / value pairs. */
  details?: { label: string; value: string }[]
  list?: { title: string; items: string[] }
  cta: { label: string; destination: string }
  /** Why this person received it. */
  why: string
  /** A line about how to stop it, where the product allows that. */
  stop?: string
}

export const WELCOME_EMAIL: EmailTemplate = {
  type: 'welcome',
  label: 'Welcome (account registration)',
  to: 'The person who just registered. Sent once, at registration',
  subject: 'Welcome to CivicDataSpace',
  preheader: 'Your account is ready.',
  heading: 'Welcome to CivicDataSpace',
  paragraphs: [
    'Your account is ready. You can create datasets, use cases and other content, follow collaboratives, and join organisations you are invited to.',
    'Everything that happens after this, such as invitations, access decisions and activity on your content, appears in Notifications & Requests inside CivicDataSpace. We do not email about it.',
  ],
  cta: { label: 'Open CivicDataSpace', destination: 'Dashboard' },
  why: 'You registered an account on CivicDataSpace.',
}

export const EMAIL_TEMPLATES = { welcome: WELCOME_EMAIL } as const
export const EMAIL_ORDER: (keyof typeof EMAIL_TEMPLATES)[] = ['welcome']

/** Whether a notification event may also be emailed. Never: the welcome email is the only exception and is not a notification event. */
export function emailEnabledFor(_type: EventType): boolean {
  return false
}
