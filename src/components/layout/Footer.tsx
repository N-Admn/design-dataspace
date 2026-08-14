const currentYear = new Date().getFullYear()

function FooterLink({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex min-h-[52px] max-w-[1760px] flex-wrap items-center justify-between gap-2 px-10 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FooterLink>About Us</FooterLink>
          <span>·</span>
          <FooterLink>Contact Us</FooterLink>
        </div>

        <p>© {currentYear} CivicDataSpace · By CivicDataLab</p>

        <div className="flex items-center gap-1.5">
          <FooterLink>Privacy</FooterLink>
          <span>·</span>
          <FooterLink>Terms</FooterLink>
          <span>·</span>
          <FooterLink>Legal</FooterLink>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
