import { cn } from '@/lib/utils'
import { PAGE_GUTTER_X } from '@/lib/layout'

const currentYear = new Date().getFullYear()

function FooterLink({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="text-muted-foreground underline-offset-4 hover:underline focus-visible:underline transition-colors hover:text-foreground"
    >
      {children}
    </button>
  )
}

function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-border', className)}>
      {/* Phones: everything centred — the five links in one wrapping row, the copyright beneath. From md: the original
          three-part row (links · copyright · links), via `md:contents` on the wrapper and explicit order. */}
      <div
        className={cn(
          'mx-auto flex max-w-[1760px] flex-col items-center gap-2 py-4 text-center text-xs text-muted-foreground',
          'md:min-h-[52px] md:flex-row md:flex-wrap md:justify-between md:py-3 md:text-left',
          PAGE_GUTTER_X,
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 md:contents">
          <div className="flex items-center gap-1.5">
            <FooterLink>About Us</FooterLink>
            <span aria-hidden="true">·</span>
            <FooterLink>Contact Us</FooterLink>
          </div>
          <span aria-hidden="true" className="md:hidden">
            ·
          </span>
          <div className="flex items-center gap-1.5 md:order-3">
            <FooterLink>Privacy</FooterLink>
            <span aria-hidden="true">·</span>
            <FooterLink>Terms</FooterLink>
            <span aria-hidden="true">·</span>
            <FooterLink>Legal</FooterLink>
          </div>
        </div>

        <p className="md:order-2">© {currentYear} CivicDataSpace · By CivicDataLab</p>
      </div>
    </footer>
  )
}

export { Footer }
