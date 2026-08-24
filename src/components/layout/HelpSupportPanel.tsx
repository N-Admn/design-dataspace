import * as React from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Paperclip,
} from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { FileUploadField } from '@/components/shared/FileUploadField'
import type { UploadedAsset } from '@/lib/generic-upload'
import {
  SUPPORT_TOPIC_OPTIONS,
  SUPPORT_ATTACHMENT_EXTENSIONS,
  MAX_SUPPORT_ATTACHMENT_BYTES,
  submitSupportMessage,
} from '@/lib/help-support'

type PanelView = 'main' | 'guide' | 'contact'
type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

interface GuideSlide {
  image: string
  title: string
  description: string
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    image: '/help-tour/slide-1-choose-workspace.png',
    title: 'Choose your workspace',
    description: 'Start from your Dashboard and open the workspace where you want to contribute.',
  },
  {
    image: '/help-tour/slide-2-contribution-nav.png',
    title: 'Create content',
    description: 'Create datasets, Use Cases, AI Models, Events, Collaboratives and Charts.',
  },
  {
    image: '/help-tour/slide-3-connect-dataset.png',
    title: 'Connect existing content',
    description: 'Connect published datasets and other CivicDataSpace content instead of duplicating information.',
  },
  {
    image: '/help-tour/slide-4-review-work.png',
    title: 'Review your work',
    description: 'Review how your content will appear before publishing.',
  },
  {
    image: '/help-tour/slide-4-publish-manage.png',
    title: 'Publish & manage',
    description: 'Publish your contribution and manage updates from My Workspace.',
  },
]

interface BackHeaderProps {
  onBack: () => void
  title: string
  description: string
}

function BackHeader({ onBack, title, description }: BackHeaderProps) {
  return (
    <DialogHeader className="shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        Back
      </button>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  )
}

function HelpSupportPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { contextLabel } = useHelpContext()
  const { profile } = useAppData()
  const confirm = useConfirm()

  const [view, setView] = React.useState<PanelView>('main')
  const [slideIndex, setSlideIndex] = React.useState(0)

  const [topic, setTopic] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [attachment, setAttachment] = React.useState<UploadedAsset | null>(null)
  const [touched, setTouched] = React.useState<{ topic?: boolean; subject?: boolean; message?: boolean }>({})
  const [status, setStatus] = React.useState<SubmitStatus>('idle')

  React.useEffect(() => {
    if (!open) return
    setView('main')
    setSlideIndex(0)
    setTopic('')
    setSubject('')
    setMessage('')
    setAttachment(null)
    setTouched({})
    setStatus('idle')
  }, [open])

  const errors = {
    topic: touched.topic && !topic ? 'Please select a topic.' : undefined,
    subject: touched.subject && !subject.trim() ? 'Please enter a subject.' : undefined,
    message: touched.message && !message.trim() ? 'Please describe how we can help.' : undefined,
  }
  const isValid = Boolean(topic) && subject.trim() !== '' && message.trim() !== ''
  const hasUnsavedContent = topic !== '' || subject.trim() !== '' || message.trim() !== '' || attachment !== null

  const requestClose = async () => {
    if (view === 'contact' && status !== 'success' && hasUnsavedContent) {
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
    setTouched({ topic: true, subject: true, message: true })
    if (!isValid) return
    setStatus('sending')
    const result = await submitSupportMessage({
      topic,
      subject,
      message,
      attachment,
      context: contextLabel,
      email: profile.email,
    })
    setStatus(result.success ? 'success' : 'error')
  }

  const isFirstSlide = slideIndex === 0
  const isLastSlide = slideIndex === GUIDE_SLIDES.length - 1
  const slide = GUIDE_SLIDES[slideIndex]

  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
      <DialogContent variant="right-drawer" className="gap-0 p-0">
        {view === 'main' && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>Help & Support</DialogTitle>
              <DialogDescription>
                Need help using CivicDataSpace? Find guidance or contact our support team.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setView('guide')}
                  className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    Learn how to contribute
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Explore quick guides and walkthroughs for creating, managing, and publishing content on
                    CivicDataSpace.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('contact')}
                  className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    Contact support
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Have a question or run into a problem? Send a message to our support team.
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'guide' && (
          <>
            <BackHeader
              onBack={() => setView('main')}
              title="Learn how to contribute"
              description="A quick overview of what you can create and manage on CivicDataSpace."
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-3">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-48 w-full rounded-lg border border-border bg-muted object-contain sm:h-56"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{slide.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{slide.description}</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous slide"
                disabled={isFirstSlide}
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="text-sm font-medium text-muted-foreground">
                {slideIndex + 1} / {GUIDE_SLIDES.length}
              </p>
              {isLastSlide ? (
                <Button type="button" size="sm" onClick={() => setView('main')}>
                  Done
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Next slide"
                  onClick={() => setSlideIndex((i) => Math.min(GUIDE_SLIDES.length - 1, i + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </>
        )}

        {view === 'contact' && status === 'success' && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>Contact support</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-primary">Message sent</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thanks for contacting us. Your message has been sent to the CivicDataSpace support team.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll reply to: <span className="font-medium text-foreground">{profile.email}</span>
                </p>
              </div>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </>
        )}

        {view === 'contact' && status === 'error' && (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>Contact support</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-primary">We couldn't send your message</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Something went wrong while sending your request. Your message hasn't been submitted.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={requestClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSend}>
                  Try again
                </Button>
              </div>
            </div>
          </>
        )}

        {view === 'contact' && (status === 'idle' || status === 'sending') && (
          <>
            <BackHeader
              onBack={() => setView('main')}
              title="Contact support"
              description="Tell us what you need help with. We'll get back to you by email."
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="support-topic">
                    Topic <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-1.5">
                    <SearchableSelect
                      id="support-topic"
                      options={SUPPORT_TOPIC_OPTIONS}
                      value={topic}
                      onChange={setTopic}
                      placeholder="Select a topic"
                      invalid={Boolean(errors.topic)}
                    />
                  </div>
                  <FieldError message={errors.topic} />
                </div>

                <div>
                  <Label htmlFor="support-subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="support-subject"
                    className="mt-1.5"
                    placeholder="Briefly describe your issue"
                    value={subject}
                    aria-invalid={Boolean(errors.subject)}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                  />
                  <FieldError message={errors.subject} />
                </div>

                <div>
                  <Label htmlFor="support-message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="support-message"
                    className="mt-1.5"
                    rows={5}
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

                <FileUploadField
                  id="support-attachment"
                  label="Attachment"
                  helperText="Optional · Screenshots or files that help explain the issue."
                  value={attachment}
                  onChange={setAttachment}
                  extensions={SUPPORT_ATTACHMENT_EXTENSIONS}
                  maxBytes={MAX_SUPPORT_ATTACHMENT_BYTES}
                  fallbackIcon={Paperclip}
                  uploadLabel="Add attachment"
                />

                <div>
                  <Label>Context</Label>
                  <div className="mt-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                    {contextLabel}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sending as</p>
                  <p className="mt-1 text-sm text-foreground">{profile.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">We'll reply to this email address.</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
              <Button type="button" variant="ghost" onClick={requestClose} disabled={status === 'sending'}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSend} disabled={!isValid || status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send message'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { HelpSupportPanel }
