import * as React from 'react'
import { ArrowLeft, ArrowRight, Check, Copy, Download, Mail, Share2 } from 'lucide-react'
import { toPng } from 'html-to-image'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/toast'

/** The bar above the hero: Back on the left; on the right the actions people take with a collaborative, the primary one (Collaborate)
 *  last. It sits outside the exported visual. Share opens a small menu: copy the link, download the visual, or send the link to a
 *  social network or by email. */

export interface CollaborativeActionsProps {
  cta?: { label: string; href?: string; onClick?: () => void }
  onBack?: () => void
  /** The address to share and to encode in the QR code. */
  url: string
  title: string
  /** The element that is exported as the shareable visual. */
  exportRef: React.RefObject<HTMLElement | null>
}

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'collaborative'

// Simple, single-colour brand marks for the share menu (24px grid).
const X = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
const FACEBOOK = 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
const LINKEDIN = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
const WHATSAPP = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z'

function CollaborativeActions({ cta, onBack, url, title, exportRef }: CollaborativeActionsProps) {
  const toast = useToast()
  const [exporting, setExporting] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Could not copy the link', description: 'Copy the address from the browser instead.' })
    }
  }

  const download = async () => {
    const node = exportRef.current
    if (!node || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: '#ffffff', imagePlaceholder: TRANSPARENT_PIXEL })
      const link = document.createElement('a')
      link.download = `${slug(title)}.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast({ title: 'Could not create the image', description: 'Please try again.' })
    } finally {
      setExporting(false)
    }
  }

  const encoded = encodeURIComponent(url)
  const text = encodeURIComponent(title)
  const networks = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${text}%20${encoded}`, path: WHATSAPP },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, path: LINKEDIN },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`, path: X },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, path: FACEBOOK },
  ]
  const ROW = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-text-default hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-50'

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {onBack ? (
        <Button type="button" variant="ghost" size="sm" className="-ml-3 text-text-subdued hover:text-text-default" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {cta &&
          (cta.href ? (
            <Button asChild size="lg">
              <a href={cta.href} target="_blank" rel="noreferrer">
                {cta.label}
                <ArrowRight />
              </a>
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={cta.onClick}>
              {cta.label}
              <ArrowRight />
            </Button>
          ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full border-primary bg-transparent text-primary hover:bg-primary/5"
              aria-label="Share collaborative"
              title="Share"
            >
              <Share2 className="size-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <button type="button" onClick={copyLink} className={ROW}>
              {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <button type="button" onClick={download} disabled={exporting} className={ROW}>
              <Download className="size-4" aria-hidden="true" />
              {exporting ? 'Preparing…' : 'Download visual'}
            </button>
            <div className="mx-3 my-2 border-t border-border-default" />
            <p className="px-3 pb-1 type-eyebrow text-text-subdued">Share on</p>
            <ul className="flex items-center gap-1 px-1.5 pb-1">
              {networks.map((n) => (
                <li key={n.name}>
                  <a
                    href={n.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Share on ${n.name}`}
                    title={n.name}
                    className="flex size-10 items-center justify-center rounded-full text-text-default hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                      <path d={n.path} />
                    </svg>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:?subject=${text}&body=${encoded}`}
                  aria-label="Share by email"
                  title="Email"
                  className="flex size-10 items-center justify-center rounded-full text-text-default hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <Mail className="size-5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export { CollaborativeActions }
