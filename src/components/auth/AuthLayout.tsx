import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function BackToHome() {
  return (
    <Link
      to="/"
      className="mx-auto flex w-full max-w-sm items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      Back to Home
    </Link>
  )
}

function Logo({ large = false }: { large?: boolean }) {
  return (
    <img
      src="/brand/CDS-Logo.png"
      alt="CivicDataSpace"
      className={large ? 'h-48 w-auto' : 'h-9 w-auto'}
    />
  )
}

function AuthFooter({ dark = false, className }: { dark?: boolean; className?: string }) {
  const linkClass = dark
    ? 'text-white/70 transition-colors hover:text-white'
    : 'text-muted-foreground transition-colors hover:text-foreground'

  return (
    <div className={className}>
      <div className="flex items-center gap-x-1.5 text-xs">
        <a href="#" className={linkClass}>
          Privacy
        </a>
        <span className={dark ? 'text-white/40' : 'text-muted-foreground'}>·</span>
        <a href="#" className={linkClass}>
          Terms
        </a>
        <span className={dark ? 'text-white/40' : 'text-muted-foreground'}>·</span>
        <a href="#" className={linkClass}>
          Legal
        </a>
      </div>
    </div>
  )
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex items-center justify-center bg-header-background px-6 py-5 lg:hidden">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
        <BackToHome />
        <div className="mx-auto mt-4 w-full max-w-sm">{children}</div>
        <AuthFooter className="mx-auto mt-12 w-full max-w-sm lg:hidden" />
      </div>

      <div className="relative hidden flex-1 flex-col items-center justify-center bg-header-background px-10 py-10 lg:flex">
        <Logo large />
        <AuthFooter dark className="absolute bottom-10 right-10" />
      </div>
    </div>
  )
}

export { AuthLayout }
