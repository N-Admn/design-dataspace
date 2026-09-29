import type { ReactNode } from 'react'
import { Link2, Mail } from 'lucide-react'

import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

/* lucide-react v1 dropped brand marks, so the three social glyphs are inlined
 * (simple-icons paths, 24×24, drawn in currentColor). */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  )
}

const iconButton =
  'flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Row of share targets (X, LinkedIn, Facebook, email, copy link) for a public
 * page. `url` is the link being shared — defaults to the current page. */
function SocialShareLinks({ url, title, className }: { url?: string; title: string; className?: string }) {
  const toast = useToast()
  const shareUrl = url ?? window.location.href
  const u = encodeURIComponent(shareUrl)
  const t = encodeURIComponent(title)

  const targets: { label: string; href: string; icon: ReactNode }[] = [
    { label: 'Share on X', href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: <XIcon /> },
    { label: 'Share on LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <LinkedInIcon /> },
    { label: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <FacebookIcon /> },
    { label: 'Share by email', href: `mailto:?subject=${t}&body=${u}`, icon: <Mail className="size-4" /> },
  ]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({ title: 'Link copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Unable to copy link', description: 'Please try again.', variant: 'error' })
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {targets.map((target) => (
        <a
          key={target.label}
          href={target.href}
          target="_blank"
          rel="noreferrer"
          aria-label={target.label}
          title={target.label}
          className={iconButton}
        >
          {target.icon}
        </a>
      ))}
      <button type="button" onClick={handleCopy} aria-label="Copy link" title="Copy link" className={iconButton}>
        <Link2 className="size-4" />
      </button>
    </div>
  )
}

export { SocialShareLinks }
