import * as React from 'react'
import { Paperclip } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { Loader2 } from 'lucide-react'
import { isValidEmail } from '@/lib/auth-mock'
import type { UploadedAsset } from '@/lib/generic-upload'
import {
  CONTACT_TOPIC_OPTIONS,
  SUPPORT_ATTACHMENT_EXTENSIONS,
  MAX_SUPPORT_ATTACHMENT_BYTES,
  submitSupportMessage,
} from '@/lib/help-support'

type Touched = { email?: boolean; topic?: boolean; subject?: boolean; message?: boolean }

interface ContactSupportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The signed-in user's email, shown read-only. Null when nobody is signed in: a reply address is then asked for. */
  signedInEmail: string | null
}

/** The page the message is sent from: a dataset's name for a dataset page, otherwise the page path. Null where the page
 *  adds no context (the landing page, the sign-in pages). */
function useRelatedPage(): { label: string; url: string } | null {
  const { pathname, search } = useLocation()
  const { datasets } = useAppData()
  if (pathname === '/' || pathname.startsWith('/auth/') || pathname === '/contact') return null
  const url = `${window.location.origin}${pathname}${search}`
  const datasetId = pathname.match(/^\/explore\/datasets\/([^/]+)/)?.[1]
  const name = datasetId ? datasets.find((d) => d.id === datasetId)?.publishedForm?.metadata.name : undefined
  return { label: name ? `Dataset: ${name}` : `${pathname}${search}`, url }
}

/** Contact Support from the global navigation: the existing right-hand drawer (the same one the contributor forms use),
 *  header and footer fixed, the form scrolling between them. */
function ContactSupportSheet({ open, onOpenChange, signedInEmail }: ContactSupportSheetProps) {
  const confirm = useConfirm()
  const toast = useToast()
  const related = useRelatedPage()

  const [email, setEmail] = React.useState('')
  const [topic, setTopic] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [attachment, setAttachment] = React.useState<UploadedAsset | null>(null)
  const [touched, setTouched] = React.useState<Touched>({})
  const [sending, setSending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setEmail('')
    setTopic('')
    setSubject('')
    setMessage('')
    setAttachment(null)
    setTouched({})
    setSending(false)
    setSubmitError(null)
  }, [open])

  const replyTo = signedInEmail ?? email.trim()
  const errors = {
    email:
      !signedInEmail && touched.email
        ? !email.trim()
          ? 'Please enter your email so we can reply.'
          : !isValidEmail(email)
            ? 'Please enter a valid email address.'
            : undefined
        : undefined,
    topic: touched.topic && !topic ? 'Please select a topic.' : undefined,
    subject: touched.subject && !subject.trim() ? 'Please enter a subject.' : undefined,
    message: touched.message && !message.trim() ? 'Please describe how we can help.' : undefined,
  }
  const isValid =
    (signedInEmail !== null || isValidEmail(email)) && Boolean(topic) && subject.trim() !== '' && message.trim() !== ''
  const hasUnsavedContent =
    (!signedInEmail && email.trim() !== '') ||
    topic !== '' ||
    subject.trim() !== '' ||
    message.trim() !== '' ||
    attachment !== null

  const requestClose = async () => {
    if (sending) return
    if (hasUnsavedContent) {
      const ok = await confirm({
        title: 'Unsaved message',
        description: "You have entered information that hasn't been sent.",
        confirmLabel: 'Discard',
        cancelLabel: 'Stay',
        variant: 'destructive',
      })
      if (!ok) return
    }
    onOpenChange(false)
  }

  const handleSend = async () => {
    setTouched({ email: true, topic: true, subject: true, message: true })
    if (!isValid) return
    setSending(true)
    setSubmitError(null)
    try {
      const result = await submitSupportMessage({
        topic,
        subject,
        message,
        attachment,
        context: related ? `${related.label} (${related.url})` : '',
        email: replyTo,
      })
      if (!result.success) throw new Error('not sent')
      toast({ title: 'Message sent', description: `Thanks for contacting us. We'll reply to ${replyTo}.` })
      onOpenChange(false)
    } catch {
      // Everything the user typed stays in place so they can simply try again.
      setSubmitError("We couldn't send your message. Check your connection and try again — nothing you entered was lost.")
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        <DialogHeader className="shrink-0">
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>Send a message to the CivicDataSpace support team.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {submitError && (
              <div role="alert" className="rounded-md border border-action-critical-default/30 bg-action-critical-default/5 px-3 py-2.5">
                <p className="text-sm font-medium text-text-critical-strong">{submitError}</p>
              </div>
            )}

            {signedInEmail ? (
              <div>
                <Label htmlFor="contact-sending-as">Sending as</Label>
                <Input
                  id="contact-sending-as"
                  className="mt-1.5 bg-muted/40"
                  value={signedInEmail}
                  readOnly
                  aria-readonly="true"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">We'll reply to this email address.</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="contact-email">
                  Your email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  className="mt-1.5"
                  placeholder="you@example.org"
                  value={email}
                  aria-invalid={Boolean(errors.email)}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">We'll reply to this email address.</p>
                <FieldError message={errors.email} />
              </div>
            )}

            <div>
              <Label htmlFor="contact-topic">
                Topic <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1.5">
                <SearchableSelect
                  id="contact-topic"
                  options={CONTACT_TOPIC_OPTIONS}
                  value={topic}
                  onChange={setTopic}
                  placeholder="Select a topic"
                  invalid={Boolean(errors.topic)}
                />
              </div>
              <FieldError message={errors.topic} />
            </div>

            <div>
              <Label htmlFor="contact-subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact-subject"
                className="mt-1.5"
                placeholder="Briefly describe your question or issue"
                value={subject}
                aria-invalid={Boolean(errors.subject)}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
              />
              <FieldError message={errors.subject} />
            </div>

            <div>
              <Label htmlFor="contact-message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="contact-message"
                className="mt-1.5"
                rows={6}
                placeholder="Describe your question or the problem you're experiencing..."
                value={message}
                aria-invalid={Boolean(errors.message)}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Include any details that may help us understand the issue.
              </p>
              <FieldError message={errors.message} />
            </div>

            {related && (
              <div>
                <Label htmlFor="contact-related">Related page or dataset</Label>
                <Input
                  id="contact-related"
                  className="mt-1.5 bg-muted/40"
                  value={related.label}
                  readOnly
                  aria-readonly="true"
                  title={related.url}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Captured from the page you're on, so we can see what you saw.</p>
              </div>
            )}

            <FileUploadField
              id="contact-attachment"
              label="Attachment"
              helperText="Optional · Screenshots or files that help explain the issue."
              value={attachment}
              onChange={setAttachment}
              extensions={SUPPORT_ATTACHMENT_EXTENSIONS}
              maxBytes={MAX_SUPPORT_ATTACHMENT_BYTES}
              fallbackIcon={Paperclip}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-default px-6 py-4">
          <Button type="button" variant="ghost" onClick={requestClose} disabled={sending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={!isValid || sending}>
            {sending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send message'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ContactSupportSheet }
